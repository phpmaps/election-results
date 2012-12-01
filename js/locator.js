
var chartInfo = null;
//function for locating an address
function LocateAddress() {
    dojo.byId("txtAddress").blur();
    if (dojo.byId("tdsearchAddress").className == "tdSearchByAddress") {
        if (dojo.trim(dojo.byId("txtAddress").value) == '') {
            alert(messages.getElementsByTagName("blankAddress")[0].childNodes[0].nodeValue);
            return;
        }
        var address = [];

        address[locatorFields] = dojo.byId('txtAddress').value;

        ShowProgressIndicator();
        locator.outSpatialReference = map.spatialReference;
        locator.addressToLocations(address, ["Loc_name"], function (candidates) {
            ShowLocatedAddress(candidates);
        }, function (err) {
            HideProgressIndicator();
            alert(messages.getElementsByTagName("unableToLocateAddress")[0].childNodes[0].nodeValue);
        });
    }
    else {
        RemoveChildren(dojo.byId('tblAddressResults'));
        CreateScrollbar(dojo.byId("divAddressScrollContainer"), dojo.byId("divAddressScrollContent"));
        if (dojo.string.trim(dojo.byId('txtAddress').value) == "") {
            alert(messages.getElementsByTagName("blankPrecinct")[0].childNodes[0].nodeValue);
            return;
        }
        ShowProgressIndicator(null);
        SearchPrecinctName(dojo.byId("txtAddress").value);
    }
}

//function to search precinct name
function SearchPrecinctName(precinctName) {
    map.infoWindow.hide();
    selectedGraphic = null;
    var query = esri.tasks.Query();
    query.where = dojo.string.substitute(precinctLayer.Query, [dojo.string.trim(precinctName).toUpperCase()]);
    map.getLayer(precinctLayer.Key).queryFeatures(query, function (featureset) {
        HideProgressIndicator();
        if (featureset.features.length == 0) {
            alert(messages.getElementsByTagName("noPrecinct")[0].childNodes[0].nodeValue);
            return;
        }
        if (featureset.features.length == 1) {
            dojo.byId('txtAddress').setAttribute("defaultPrecinct", featureset.features[0].attributes[precinctLayer.PrecinctName]);
            var polygon = featureset.features[0].geometry;
            var mapPoint = polygon.getExtent().getCenter();
            if (!polygon.contains(mapPoint)) {
                mapPoint = polygon.getPoint(0, 0);
            }
            FindPrecinctLayer(mapPoint, featureset.features[0].attributes[precinctLayer.PrecinctName], (!currentSelectedLayer) ? true : false);
            HideAddressContainer();
        }
        else {
            var table = dojo.byId("tblAddressResults");
            var tBody = document.createElement("tbody");
            table.appendChild(tBody);
            for (var i = 0; i < featureset.features.length; i++) {
                var tr = document.createElement("tr");
                tBody.appendChild(tr);
                var td1 = document.createElement("td");
                td1.innerHTML = featureset.features[i].attributes[precinctLayer.PrecinctName];
                td1.setAttribute("index", i);
                td1.className = 'bottomborder';
                td1.style.cursor = "pointer";
                td1.height = 20;
                td1.onclick = function () {
                    HideAddressContainer();
                    dojo.byId('txtAddress').setAttribute("defaultPrecinct", this.innerHTML);
                    var polygon = featureset.features[this.getAttribute("index")].geometry;
                    var mapPoint = polygon.getExtent().getCenter();
                    if (!polygon.contains(mapPoint)) {
                        mapPoint = polygon.getPoint(0, 0);
                    }
                    FindPrecinctLayer(mapPoint, this.innerHTML, (!currentSelectedLayer) ? true : false);
                }
                tr.appendChild(td1);
            }
            SetHeightAddressResults();
        }
        HideProgressIndicator();
    }, function (err) {
        HideProgressIndicator();
    });
}

//function to populate address
function ShowLocatedAddress(candidates) {
    map.infoWindow.hide();
    selectedGraphic = null;
    HideProgressIndicator();
    RemoveChildren(dojo.byId('tblAddressResults'));
    CreateScrollbar(dojo.byId("divAddressScrollContainer"), dojo.byId("divAddressScrollContent"));
    if (candidates.length > 0) {
        if (candidates[0].score == 100) {
            HideAddressContainer();
            dojo.byId('txtAddress').setAttribute("defaultAddress", candidates[0].address);
            FindPrecinctLayer(candidates[0].location, null, (!currentSelectedLayer) ? true : false);
            return;
        }
        var table = dojo.byId("tblAddressResults");
        var tBody = document.createElement("tbody");
        table.appendChild(tBody);
        for (var i = 0; i < candidates.length; i++) {
            var tr = document.createElement("tr");
            tBody.appendChild(tr);
            var td1 = document.createElement("td");
            td1.innerHTML = candidates[i].address;
            td1.className = 'bottomborder';
            td1.style.cursor = "pointer";
            td1.height = 20;
            td1.setAttribute("index", i);
            td1.onclick = function () {
                HideAddressContainer();
                dojo.byId('txtAddress').setAttribute("defaultAddress", this.innerHTML);
                FindPrecinctLayer(candidates[this.getAttribute("index")].location, null, (!currentSelectedLayer) ? true : false);
            }
            tr.appendChild(td1);
        }
        SetHeightAddressResults();
    }
    else {
        dojo.byId('txtAddress').focus();
        alert(messages.getElementsByTagName("unableToLocateAddress")[0].childNodes[0].nodeValue);
    }
}

function FindPrecinctLayer(mapPoint, precintName, showBottomPanel) {
    if (dojo.hasClass('divShareContainer', "showContainerHeight")) {
        dojo.replaceClass("divShareContainer", "hideContainerHeight", "showContainerHeight");
        dojo.byId('divShareContainer').style.height = '0px';
    }
    //map.getLayer(precinctLayer.Key).clear();
    ShowProgressIndicator('map');
    var query = new esri.tasks.Query();

    if (precintName) {
        query.where = dojo.string.substitute(precinctLayer.Query, [precintName.toUpperCase()]);
    }
    else {
        query.geometry = mapPoint;
        query.spatialRelationship = esri.tasks.Query.SPATIAL_REL_WITHIN;
    }

    map.getLayer(precinctLayer.Key).selectFeatures(query, esri.layers.FeatureLayer.SELECTION_ADD, function (features) {
        HideProgressIndicator();
        if (features.length > 0) {
            var selectedFeatures = map.getLayer(precinctLayer.Key).getSelectedFeatures();
            var removeOID = null;
            for (var i in selectedFeatures) {
                if (selectedFeatures[i].attributes[map.getLayer(precinctLayer.Key).objectIdField] != features[0].attributes[map.getLayer(precinctLayer.Key).objectIdField]) {
                    removeOID = selectedFeatures[i].attributes[map.getLayer(precinctLayer.Key).objectIdField];
                    break;
                }
            }
            if (removeOID) {
                map.getLayer(precinctLayer.Key)._unSelectFeatureIIf(removeOID, map.getLayer(precinctLayer.Key)._mode);
                map.getLayer(precinctLayer.Key)._mode._removeFeatureIIf(removeOID);
            }
            
            dojo.byId("spanAddress").innerHTML = "Precinct - " + features[0].attributes[precinctLayer.PrecinctName];

            if (!isMobileDevice) {
                
                leftOffsetCarosuel = 0;
                dojo.byId("divElectionResultsContent").style.left = "0px";
                ResetSlideControls();

                WipeInBottomPanel(features[0].attributes[precinctLayer.PrecinctName], null, showBottomPanel);

                if (currentSelectedLayer && mapPoint) {
                    ShowInfoWindow(mapPoint, precintName);
                }
                else {
                    map.setExtent(features[0].geometry.getExtent().expand(4));
                }
            }
            else {
                if (!mapPoint) {
                    var polygon = features[0].geometry;
                    mapPoint = polygon.getExtent().getCenter();
                    if (!polygon.contains(mapPoint)) {
                        mapPoint = polygon.getPoint(0, 0);
                    }
                }
                selectedGraphic = mapPoint;
                map.setExtent(GetMobileExtent(mapPoint, features[0].geometry.getExtent().expand(4)));
                ShowDetails(mapPoint, features[0].attributes[precinctLayer.PrecinctName], features[0].attributes[precinctLayer.County]);
            }
        }
        else {
            alert(messages.getElementsByTagName("noPrecinct")[0].childNodes[0].nodeValue);
        }
    }, function (err) {
        HideProgressIndicator();
        alert(messages.getElementsByTagName("unableToLocatePrecinct")[0].childNodes[0].nodeValue);
    });
}

function WipeInBottomPanel(searchParameter, mapPoint, showBottomPanel) {
    for (var index in electionResultData) {
        dojo.byId("div" + index).style.display = "block";
        FetchContestData(electionResultData[index], index, mapPoint, searchParameter, false, showBottomPanel);
    }
}

function FetchContestData(layer, index, mapPoint, searchParameter, isInfoWindow, showBottomPanel) {
    var queryTask = new esri.tasks.QueryTask(layer.ServiceUrl);
    ShowProgressIndicator(null);
    var query = new esri.tasks.Query();
    if (mapPoint) {
        query.geometry = mapPoint;
    }
    else {
        query.where = "NAME='" + searchParameter + "'";
    }
    query.spatialRelationship = esri.tasks.Query.SPATIAL_REL_WITHIN;
    query.outFields = ["*"];

    queryTask.execute(query, function (features) {
        HideProgressIndicator();
        if (isMobileDevice) {
            var chartDiv = document.createElement("div");
            chartDiv.id = "chartDiv";
            var table = document.createElement("table");
            table.style.marginTop = "5px";
            table.style.width = "100%";
            var tbody = document.createElement("tbody");
            table.appendChild(tbody);
            var tr = document.createElement("tr");
            tbody.appendChild(tr);
            var td = document.createElement("td");
            tr.appendChild(td);
            td.innerHTML = layer.Title;
            td.align = "left";
            td.style.fontWeight = "bold";
            td.style.paddingLeft = "10px";
            dojo.byId('divRepresentativeScrollContent').appendChild(table);
            dojo.byId('divRepresentativeScrollContent').appendChild(chartDiv);
        }
        else {
            RemoveChildren(dojo.byId('div' + index + 'content'));
            var chartDiv = document.createElement("div");
            chartDiv.className = "divContentStyle";
            dojo.byId('div' + index + 'content').appendChild(chartDiv);
        }
        if (features.features.length > 0) {
            PopulateChartData(layer.ChartType, layer.ChartData, layer.PartyDetails, chartDiv, features, layer.CandidateNames, layer.TotalBallots);
            if (isMobileDevice) {
                chartInfo = {};
                chartInfo.ChartType = layer.ChartType;
                chartInfo.ChartData = layer.ChartData;
                chartInfo.PartyDetails = layer.PartyDetails;
                chartInfo.features = features;
                chartInfo.CandidateNames = layer.CandidateNames;
                chartInfo.WinningParty = layer.WinningParty
                chartInfo.TotalBallots = layer.TotalBallots;
                SetHeightRepresentativeResults();
            }
        }
        else {
            if (isInfoWindow) {
                var table = document.createElement("table");
                table.style.width = "100%";
                table.style.height = "100%";
                var tbody = document.createElement("tbody");
                table.appendChild(tbody);
                var tr = document.createElement("tr");
                tbody.appendChild(tr);
                var td = document.createElement("td");
                td.align = "center";
                td.innerHTML = "Data Unavailable";
                td.style.fontColor = "#ffffff"
                tr.appendChild(td);
                chartDiv.appendChild(table);
            }
            else {
                dojo.byId("div" + index).style.display = "none";
            }
        }
        if (showBottomPanel) {
            if (!isMobileDevice) {
                setTimeout(function () {
                    dojo.byId("imgToggle").src = "images/down.png";
                    dojo.byId("imgToggle").style.cursor = "pointer";
                    dojo.byId("imgToggle").setAttribute("state", "maximized");
                    dojo.byId("esriLogo").style.bottom = "250px";
                    dojo.byId("divBottomPanelHeader").style.visibility = "visible";
                    dojo.byId("divBottomPanelHeader").style.bottom = "250px";
                    dojo.replaceClass("divBottomPanelHeader", "showHeaderContainer", "hideHeaderContainer");
                    dojo.byId('divBottomPanelBody').style.height = "250px";
                    dojo.replaceClass("divBottomPanelBody", "showBottomContainer", "hideBottomContainer");
                }, 500);
            }
        }
    });
}

//Function for sorting comments according to value
function SortResultFeatures(a, b) {
    var x = a.y;
    var y = b.y;
    return ((x < y) ? -1 : ((x > y) ? 1 : 0));
}

function PopulateChartData(chartType, chartData, partyDetails, chartDiv, features, candidateNames, totalBallots) {
    if (isMobileDevice) {
        chartDiv.style.width = screen.width;
        chartDiv.style.height = "190px";
    }
    switch (chartType) {
        case "barchart":
            jsonValues = [];
            myLabelSeriesarray = [];
            myParallelLabelSeriesarray = [];
            var party;
            var ballots = features.features[0].attributes[totalBallots];
            var totalBallots = 0;
            for (var i in chartData) {
                totalBallots += features.features[0].attributes[chartData[i]];
            }
            for (var i in chartData) {
                var votes = features.features[0].attributes[chartData[i]];
                var candidateName = features.features[0].attributes[candidateNames[i]];
                var percentVote = votes .toFixed(0) + "-" + ((votes / totalBallots) * 100).toFixed(2) + "%";
                if (candidateName && candidateName != "") {
                    var jsonItem = {};
                    jsonItem.label = candidateName;
                    jsonItem.parallelLabel = percentVote;
                    jsonItem.y = Number(((votes / totalBallots) * 100).toFixed(0));
                    jsonItem.party = (features.features[0].attributes[partyDetails[i]]);
                    var fillColor = (partyDetails) ? colorCodeOfParties[jsonItem.party] : null;
                    fillColor = (fillColor) ? fillColor.Color : colorCodeOfParties["Others"].Color;
                    jsonItem.fill = fillColor;
                    jsonItem.stroke = "";
                    jsonValues.push(jsonItem);
                }
            }

            jsonValues.sort(SortResultFeatures);

            for (var i in jsonValues) {
                var labelItem = {};
                labelItem.value = Number(i) + 1;
                labelItem.text = jsonValues[i].label;
                myLabelSeriesarray.push(labelItem);
                party = jsonValues[i].party;
            }

            for (var i in jsonValues) {
                var parallelLabelItem = {};
                parallelLabelItem.value = Number(i) + 1;
                parallelLabelItem.text = jsonValues[i].parallelLabel;
                myParallelLabelSeriesarray.push(parallelLabelItem);
            }

            ShowBarChart(jsonValues, chartDiv, myLabelSeriesarray, myParallelLabelSeriesarray, party, ballots);
            break;
        case "piechart":
            var jsonValues = [];
            var percentVoted = Number((features.features[0].attributes[chartData[0]] * 100).toFixed(0));
            var nonVoters = 100 - percentVoted;

            var jsonItemVoted = {};
            jsonItemVoted.y = percentVoted;
            jsonItemVoted.stroke = "#000000";
            jsonItemVoted.text = "Voted: " + percentVoted + "%";
            jsonItemVoted.color = votedColor;
            jsonValues.push(jsonItemVoted);

            var jsonItemNonVoted = {};
            jsonItemNonVoted.y = nonVoters;
            jsonItemNonVoted.stroke = "#000000";
            jsonItemNonVoted.text = "Did not vote: " + nonVoters + "%";
            jsonItemNonVoted.color = didNotVoteColor;
            jsonValues.push(jsonItemNonVoted);

            ShowPieChart(jsonValues, chartDiv);
            break;
    }
}

function GenerateRandomColor() {
    var r = Math.floor(Math.random() * 255);
    var g = Math.floor(Math.random() * 255);
    var b = Math.floor(Math.random() * 255);
    return new dojo.Color([r, g, b, 1]);
}