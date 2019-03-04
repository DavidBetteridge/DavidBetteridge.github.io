var map

function loadMapScenario() {
    map = new Microsoft.Maps.Map(document.getElementById('myMap'), {
        /* No need to set credentials if already passed in URL */
        center: new Microsoft.Maps.Location(53.4808, -1.2426),
        mapTypeId: Microsoft.Maps.MapTypeId.aerial,
        zoom: 7 });
   
    displayRoute("/running/data/Gargrave_to_Leeds_along_the_Leeds_Liverpool_Canal.xml", map)
    displayRoute("/running/data/Leeds_to_York.xml", map)
}

function displayRoute(xmlFile, map) {

    function handler() {

        if (this.status == 200 &&
            this.responseXML != null) {
            var xmlDoc = this.responseXML;
            var coords = [];
            var trkpts = xmlDoc.getElementsByTagName("trkpt");
            for (var i = 0; i < trkpts.length; i++) {
                var trkpt = trkpts[i];
                var longitude = trkpt.getAttribute("lon");
                var latitude = trkpt.getAttribute("lat");
                coords.push(new Microsoft.Maps.Location(latitude, longitude));
            }

            if (coords.length > 0) {
                var line = new Microsoft.Maps.Polyline(coords, {
                    strokeColor: 'blue',
                    strokeThickness: 3,
                    // strokeDashArray: [4, 4]
                });
                map.entities.push(line);
            }
        } else {
           // alert("error");
        }
    }

    var client = new XMLHttpRequest();
    client.onreadystatechange  = handler;
    client.open("GET", xmlFile);
    client.send();
}


