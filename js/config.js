dojo.provide("js.config");
dojo.declare("js.config", null, {

    // This file contains various configuration settings for "Election Results" template
    // 
    // Use this file to perform the following:
    //
    // 1.  Specify application title                  - [ Tag(s) to look for: ApplicationName ]
    // 2.  Set path for application icon              - [ Tag(s) to look for: ApplicationIcon ]
    // 3.  Set splash screen message                  - [ Tag(s) to look for: SplashScreenMessage ]
    // 4.  Set URL for help page                      - [ Tag(s) to look for: HelpURL ]
    //
    // 5.  Specify URL(s) for basemaps                - [ Tag(s) to look for: BaseMapLayers ]
    // 6.  Set initial map extent                     - [ Tag(s) to look for: DefaultExtent ]
    //
    // 7.  Choose to use WebMap or map services       - [ Tag(s) to look for: UseWebmap <true/false> ]
    // 8.  Specify WebMapId, if using WebMap          - [ Tag(s) to look for: WebMapId ]
    // 9.  Or for using map services:
    // 9a. Specify URL(s) for operational and overlay layers
    //                                                - [ Tag(s) to look for: PrecinctLayer, ReferenceOverlayLayer]
    // 9b. Customize data formatting                  - [ Tag(s) to look for: ShowNullValueAs]
    //
    // 10. Specify color for selected features        - [ Tag(s) to look for: SelectionColor ]
    //
    // 11. Customize address search settings          - [ Tag(s) to look for: LocatorURL, LocatorFields, LocatorDefaultAddress]
    //
    // 12. Set URL for geometry service               - [ Tag(s) to look for: GeometryService ]
    //
    //
    // 13. Configure data to be displayed on the bottom panel
    //                                                - [ Tag(s) to look for: InfoBoxWidth, ElectionResultData, ColorCodeOfParties, VotedColor, DidNotVoteColor]
    //
    // 14. Configure data to be displayed for election updates
    //                                                - [Tag(s) to look for: Updates]
    // 15. Specify URLs for map sharing               - [ Tag(s) to look for: FacebookShareURL, TwitterShareURL, ShareByMailLink ]
    // 15a.In case of changing the TinyURL service
    //     Specify URL for the new service            - [ Tag(s) to look for: MapSharingOptions (set TinyURLServiceURL, TinyURLResponseAttribute) ]
    //
    //

    // ------------------------------------------------------------------------------------------------------------------------
    // GENERAL SETTINGS
    // -----------------------------------------------------------------------------------------------------------------------
    // Set application title
    ApplicationName: "Election Results",

    // Set application icon path
    ApplicationIcon: "images/logo.png",

    // Set splash window content - Message that appears when the application starts
    SplashScreenMessage: "<b>Election Results</b> <br/> <hr/> <br/> The <b>Election Results</b> application provides election results information to the general public and other interested parties. It offers a map-based view of results tabulated on election night and allows users to review these results for a specific precinct or political contest. To review election results, simply enter an address or voting precinct in the search box.  The precinct will then be highlighted on the map and results for each political contest displayed in a tab along the bottom of the map. <br/><br/>",

    // Set URL of help page/portal
    HelpURL: "help.htm",

    // ------------------------------------------------------------------------------------------------------------------------
    // BASEMAP SETTINGS
    // ------------------------------------------------------------------------------------------------------------------------
    // Set baseMap layers
    // Please note: All basemaps need to use the same spatial reference. By default, on application start the first basemap will be loaded 
    BaseMapLayers:
		       [
                   {
                       Key: "baseMapKey",
                       MapURL: "http://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer"
                   }
		       ],


    // Initial map extent. Use comma (,) to separate values and dont delete the last comma
                   DefaultExtent: "-604606.5024533856,728181.70515211,375684.5024533856,1284457.95",

    // ------------------------------------------------------------------------------------------------------------------------
    // OPERATIONAL DATA SETTINGS
    // ------------------------------------------------------------------------------------------------------------------------
                   // Choose if you want to use WebMap or Map Services for operational layers
    UseWebmap: false,

    // if using WebMap, specify WebMapID within quotes, otherwise leave this empty and configure operational layers
    WebMapId: "743b9b9daa484f20abfce912c2230b78",

    // if using WebMap, rest of the operational data settings will be pickedup from WebMap excluding the highlight color for precinct and the display property for the reference overlay layer
    // To highlight precinct with custom color set "UseColor" property to "true"
    // To make the reference overlay layer visible set "DisplayOnLoad" property to "true"

    // if not using WebMap, set the following options
    // Configure operational layers      

    // Key is used as an layerId while adding this layer to the map and has to be unique
    // ServiceUrl is the REST end point for the PrecinctLayer
    // UseColor used to override the default symbology defined in the mapservice
    // Color used to define the renderer color of the symbol
    // Alpha used to define the transparency of the renderer
    // Query is used to query the mapserver for fetching precinct's
    // PrecinctName is the attribute name from the Precinct Layer which represents Precinct Name 
    // County is the attribute name from the Precinct Layer which represents County name
    PrecinctLayer:
          {
              Key: "precinctLayer",
              ServiceUrl: "https://services1.arcgis.com/m9p5y180BqMf6JT7/ArcGIS/rest/services/PresidentofGhana2008/FeatureServer/0",
              UseColor: true,
              Color: "#FFFC17",
              Alpha: 0.50,
              Query: "UPPER(NAME) LIKE '%${0}%'",
              PrecinctName: "NAME",
              County: "COUNTY"
          },

    // ServiceUrl is the REST end point for the reference overlay layer
    // DisplayOnLoad setting this will show the reference overlay layer on load
    ReferenceOverlayLayer:
          {
              ServiceUrl: "https://services1.arcgis.com/m9p5y180BqMf6JT7/ArcGIS/rest/services/PresidentofGhana2008/FeatureServer",
              DisplayOnLoad: true
          },

    // ------------------------------------------------------------------------------------------------------------------------

    // Set string value to be shown for null or blank values
    ShowNullValueAs: "N/A",

    // ------------------------------------------------------------------------------------------------------------------------
    // ADDRESS SEARCH SETTINGS
    // ------------------------------------------------------------------------------------------------------------------------
    // Set Locator service URL
    LocatorURL: "http://tasks.arcgisonline.com/ArcGIS/rest/services/Locators/TA_Address_NA_10/GeocodeServer",

    // Set Locator fields (fields to be used for searching)
    LocatorFields: "SingleLine",

    // Set default address to search
    LocatorDefaultAddress: "628 South Loomis Street, Naperville, IL, 60540",

    //Set default precinct to search
    LocatorDefaultPrecinct: "Lisle 12",


    // ------------------------------------------------------------------------------------------------------------------------
    // GEOMETRY SERVICE SETTINGS
    // ------------------------------------------------------------------------------------------------------------------------
    // Set geometry service URL
    GeometryService: "http://tasks.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer",


    // ------------------------------------------------------------------------------------------------------------------------


    // SETTINGS FOR INFO-PODS ON THE BOTTOM PANEL
    // ------------------------------------------------------------------------------------------------------------------------
    // Set width of the boxes in the bottom panel
    InfoBoxWidth: 424,

    // Election Results contest data shown in the bottom panel. Every section is a box in the bottom panel. 
    // HeaderColor will set the color of the header of the infobox in the bottom panel
    // Title will set the contest name of the infobox in the bottom panel
    // ServiceUrl is the mapservice URL for the contest
    // ChartData is the attribute information for the contest used in rendering charts
    // ChartType "barchart" (or) "piechart"
    // PartyDetails is the attribute information used to render party color in the charts. This has to be in the same sequence with the ChartData attribute sequence. This data is not required for piechart
    // CandidateNames is the attribute information used to display Candidate name in the charts. This has to be in the same sequence with the ChartData attribute sequence. This data is not required for piechart
    // WinningParty is the attribute name which gives the winning party name. This is not required for piechart
    // DisplayOnLoad setting this will show the contest layer on load. If this is set true for multiple contests, only the first occurrence is considered
    // TotalBallots is the attribute name which gives the total votes casted. This is not required for piechart
    ElectionResultData:
          {
              POULayer:
                    {
                        HeaderColor: "#393939",
                        Title: "President of Ghana",
                        ServiceUrl: "https://services1.arcgis.com/m9p5y180BqMf6JT7/arcgis/rest/services/PresidentofGhana2008/FeatureServer/0",
                        ChartData: ["NUMVOTES1", "NUMVOTES2", "NUMVOTES3", "NUMVOTES4", "NUMVOTES5", "NUMVOTES6", "NUMVOTES7", "NUMVOTES8"],
                        ChartType: "barchart",
                        PartyDetails: ["PARTY1", "PARTY2", "PARTY3", "PARTY4", "PARTY5", "PARTY6", "PARTY7", "PARTY8"],
                        CandidateNames: ["CANDIDATE1", "CANDIDATE2", "CANDIDATE3", "CANDIDATE4", "CANDIDATE5", "CANDIDATE6", "CANDIDATE7", "CANDIDATE8"],
                        DisplayOnLoad: false,
                        TotalBallots: "TOTBALLOTS"
                    },
              Senate24thDistrict:
                    {
                        HeaderColor: "#393939",
                        Title: "President of Ghana RunOff",
                        ServiceUrl: "https://services1.arcgis.com/m9p5y180BqMf6JT7/ArcGIS/rest/services/PresidentofGhana2008/FeatureServer/1",
                        ChartData: ["NUMVOTES1", "NUMVOTES2"],
                        ChartType: "barchart",
                        PartyDetails: ["PARTY1", "PARTY2"],
                        CandidateNames: ["CANDIDATE1", "CANDIDATE2"],
                        DisplayOnLoad: false,
                        TotalBallots: "TOTBALLOTS"
                    },
              Senate42ndDistrict:
                    {
                        HeaderColor: "#393939",
                        Title: "President of Ghana RunOff by Const.",
                        ServiceUrl: "https://services1.arcgis.com/m9p5y180BqMf6JT7/ArcGIS/rest/services/PresidentofGhana2008/FeatureServer/2",
                        ChartData: ["NUMVOTES1", "NUMVOTES2"],
                        ChartType: "barchart",
                        PartyDetails: ["PARTY1", "PARTY2"],
                        CandidateNames: ["CANDIDATE1", "CANDIDATE2"],
                        DisplayOnLoad: false,
                        TotalBallots: "TOTBALLOTS"
                    },
              Senate48thDistrict:
                    {
                        HeaderColor: "#393939",
                        Title: "Senate 48th District",
                        ServiceUrl: "http://yourserver/ArcGIS/rest/services/ElectionResults/MapServer/3",
                        ChartData: ["NUMVOTES1"],
                        ChartType: "barchart",
                        PartyDetails: ["PARTY1"],
                        CandidateNames: ["CANDIDATE1"],
                        DisplayOnLoad: false,
                        TotalBallots: "TOTBALLOTS"
                    },
              USHouseofRepresentatives13thDistrict:
                    {
                        HeaderColor: "#393939",
                        Title: "US House of Representatives 13th District",
                        ServiceUrl: "http://yourserver/ArcGIS/rest/services/ElectionResults/MapServer/4",
                        ChartData: ["NUMVOTES1", "NUMVOTES2", "NUMVOTES3", "NUMVOTES4"],
                        ChartType: "barchart",
                        PartyDetails: ["PARTY1", "PARTY2", "PARTY3", "PARTY4"],
                        CandidateNames: ["CANDIDATE1", "CANDIDATE2", "CANDIDATE3", "CANDIDATE4"],
                        DisplayOnLoad: false,
                        TotalBallots: "TOTBALLOTS"
                    },
              DupageCountyRecorderofDeeds:
                    {
                        HeaderColor: "#393939",
                        Title: "Dupage County Recorder of Deeds",
                        ServiceUrl: "http://yourserver/ArcGIS/rest/services/ElectionResults/MapServer/5",
                        ChartData: ["NUMVOTES1", "NUMVOTES2"],
                        ChartType: "barchart",
                        PartyDetails: ["PARTY1", "PARTY2"],
                        CandidateNames: ["CANDIDATE1", "CANDIDATE2"],
                        DisplayOnLoad: false,
                        TotalBallots: "TOTBALLOTS"
                    },
              WillCountyRecorderofDeeds:
                    {
                        HeaderColor: "#393939",
                        Title: "Will County Recorder of Deeds",
                        ServiceUrl: "http://yourserver/ArcGIS/rest/services/ElectionResults/MapServer/6",
                        ChartData: ["NUMVOTES1", "NUMVOTES2"],
                        ChartType: "barchart",
                        PartyDetails: ["PARTY1", "PARTY2"],
                        CandidateNames: ["CANDIDATE1", "CANDIDATE2"],
                        DisplayOnLoad: false,
                        TotalBallots: "TOTBALLOTS"
                    },
              VoterTurnout:
                    {
                        HeaderColor: "#393939",
                        Title: "Voter Turnout",
                        ServiceUrl: "http://yourserver/ArcGIS/rest/services/ElectionResults/MapServer/7",
                        ChartData: ["PERCVOTE"],
                        DisplayOnLoad: false,
                        ChartType: "piechart"
                    }
          },


    //Set the color for different parties
    ColorCodeOfParties:
		 {
		     "NPP": { "Color": "#243F78" },
		     "NDC": { "Color": "#B0321C" },
		     "CPP": { "Color": "#006400" },
		     "Others": { "Color": "#ffffff" }
		 },

    //Set the color for those who voted
    VotedColor: "#66736D",

    //Se the color for those who did not vote
    DidNotVoteColor: "#E6F0E8",

    // ------------------------------------------------------------------------------------------------------------------------
    //SETTING FOR ELECTION UPDATES
    // ------------------------------------------------------------------------------------------------------------------------
    //Set data to be displayed for election updates
    Updates:
		  {
		      // Set date format
		      FormatDateAs: "MMM dd, yyyy",
		      // Set time format
		      FormatTimeAs: "HH:mm:ss",
		      //Specify the field name for last update
		      FieldName: "LASTUPDATE"
		  },

    // ------------------------------------------------------------------------------------------------------------------------
    // SETTINGS FOR MAP SHARING
    // ------------------------------------------------------------------------------------------------------------------------
    // Set URL for TinyURL service, and URLs for social media
    MapSharingOptions:
          {
              TinyURLServiceURL: "http://api.bit.ly/v3/shorten?login=esri&apiKey=R_65fd9891cd882e2a96b99d4bda1be00e&uri=${0}&format=json",
              TinyURLResponseAttribute: "data.url",

              FacebookShareURL: "http://www.facebook.com/sharer.php?u=${0}&t=Election%20Results",
              TwitterShareURL: "http://twitter.com/home/?status=Election%20Results ${0}",
              ShareByMailLink: "mailto:%20?subject=Election%20Results&body=${0}"
          }
});
