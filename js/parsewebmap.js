function getWebMapInfo(webmapUniqueKey, webmapId) {
    var webmapDataURL = "http://www.arcgis.com/sharing/content/items/${0}/data?f=json";
    var webmapBaseURL = "http://www.arcgis.com/sharing/content/items/${0}?f=json";
    var url = dojo.string.substitute(webmapBaseURL, [webmapId]);
    var webmapInfo = {};
    webmapInfo.key = webmapUniqueKey;
    var deferred = new dojo.Deferred();
    dojo.io.script.get({
        url: url,
        callbackParamName: "callback",
        load: function (data) {
            if (data.url) {
                webmapInfo.url = data.url;
            }
            url = dojo.string.substitute(webmapDataURL, [webmapId]);
            dojo.io.script.get({
                url: url,
                callbackParamName: "callback",
                load: function (data) {
                    webmapInfo.basemap = data.baseMap.baseMapLayers[0];
                    if (!webmapInfo.url) {
                        webmapInfo.operationalLayers = data.operationalLayers;
                    }
                    else {
                        webmapInfo.layerInfo = data.layers;
                    }
                    deferred.callback(webmapInfo);
                }
            });
        }
    });
    return deferred;
}
