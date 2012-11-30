"""
 | Version 10.1.1
 | Copyright 2010 Esri
 |
 | Licensed under the Apache License, Version 2.0 (the "License");
 | you may not use this file except in compliance with the License.
 | You may obtain a copy of the License at
 |
 |    http://www.apache.org/licenses/LICENSE-2.0
 |
 | Unless required by applicable law or agreed to in writing, software
 | distributed under the License is distributed on an "AS IS" BASIS,
 | WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 | See the License for the specific language governing permissions and
 | limitations under the License.
"""
"""
Created on:      2010-08-09
Author:          Lindsay Thomas - ArcGISLocalGov@esri.com
Description:     Joins Microsoft Office Excel spreadsheets (xls, xlsx) or .csv files
                 containing election data to voting precincts feature class.
Last updated by: Jason Pardy - jpardy@esri.com
Last updated:    2012-03-06
"""
import os
import arcpy
import datetime

# Overwrite existing outputs and do not maintained fully qualified field names during AddJoin.
arcpy.env.overwriteOutput = True
arcpy.env.qualifiedFieldNames = False

def election_results(input_folder, precinct_features, election_results_fds, input_join_field='NAME',
                                output_join_field='NAME', last_update_field='LASTUPDATE', *argv):
    """Main function to join elections results to precinct features and create new tables.

    Required arguments:
        input_folder      -- input folder containing .xls, .xlsx, or .csv files
        precinct_features -- voting precinct layer or feature class
    Optional arguments:
        input_join_field  -- input join field (default is NAME)
        output_join_field -- output join field (default is NAME)
        last_update_field -- last update date field (default is LASTUPDATE)

    """
    # Log any warning/error messages.
    logfile_location = os.path.dirname(__file__)
    log_file = open(os.path.join(logfile_location, 'elections_errors_{0}.log'.format(datetime.datetime.strftime(datetime.datetime.now(), '%d_%m_%Y_%H_%M'))), 'w')

    # Seen issues arise when join field was not indexed -- this will handle it.
    try:
        arcpy.management.AddIndex(precinct_features, input_join_field, '{0}_index'.format(input_join_field))
        arcpy.AddMessage('\t--Indexed join field: {0}'.format(input_join_field))
    except Exception:
        pass

    # List all files from input folder of type (.xls, .xlsx, or .csv).
    arcpy.env.workspace = input_folder
    inputfiles = [f for f in arcpy.ListFiles() if f.endswith(('.csv', '.txt', '.xls', '.xlsx'))]

    # Iterate each file, validate table name, and perform the inner join.
    for inputfile in inputfiles:
        try:
            name = ''.join([c for c in os.path.basename(inputfile[0:-4]) if not c in "' -_'"])
            # Make feature layer from precinct features -- required for AddJoin.
            precinct = arcpy.management.MakeFeatureLayer(precinct_features, 'precinct')
            if inputfile.endswith(('.csv', '.txt')):
                jn = arcpy.management.AddJoin(precinct, input_join_field, os.path.join(input_folder, inputfile), output_join_field, 'KEEP_COMMON')
            else:
                arcpy.env.workspace = os.path.join(input_folder, inputfile)
                xltable = arcpy.ListTables()[0]
                jn = arcpy.management.AddJoin(precinct, input_join_field, xltable , output_join_field, 'KEEP_COMMON')

            # Create new election results tables & update LASTUPDATE field with current time.
            arcpy.AddMessage('\t--Creating table: {0}...'.format(os.path.join(election_results_fds, name)))
            arcpy.management.CalculateField(precinct, last_update_field, "datetime.datetime.now()", 'PYTHON')
            arcpy.management.CopyFeatures(precinct, os.path.join(election_results_fds, name))
        except arcpy.ExecuteError:
            arcpy.AddWarning('\t--Failed to create table for: {0}'.format(os.path.basename(inputfile)))
            log_file.write('Failed to create table for:\n{0}\n'.format(os.path.basename(inputfile)))
            log_file.write('GP Errors: {0}\n'.format(arcpy.GetMessages(2)))
            pass
        except Exception as ex:
            arcpy.AddWarning('\t--Failed to create table for: {0}'.format(os.path.basename(inputfile)))
            log_file.write('Failed to create table for:\n{0}\n'.format(os.path.basename(inputfile)))
            log_file.write('Python Errors: {0}\n'.format(ex[0]))
            pass
        finally:
            log_file.flush()
    if log_file.tell() == 0:
        log_file.write('No errors encountered.\n')
        log_file.flush()
    log_file.close()
# End election_results function

if __name__ == '__main__':
    argv = tuple(arcpy.GetParameterAsText(i)
             for i in range(arcpy.GetArgumentCount()))
    election_results(*argv)

