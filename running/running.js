var map

function loadMapScenario() {
    map = new Microsoft.Maps.Map(document.getElementById('myMap'), {
        /* No need to set credentials if already passed in URL */
        center: new Microsoft.Maps.Location(53.4808, -1.2426),
        mapTypeId: Microsoft.Maps.MapTypeId.aerial,
        zoom: 7 });
   
    displayRoute("https://davidbetteridge.github.io/running/data/Gargrave_to_Leeds_along_the_Leeds_Liverpool_Canal.gpx", map)
}

function displayRoute(xmlFile, map) {

    function handler() {
        if (this.status == 200 &&
            this.responseXML != null) {
            var xmlDoc = this.responseXML;
            var coords = [];

            var placemark = xmlDoc.getElementsByTagName("Placemark");
            for (var i = 0; i < placemark.length; i++) {
                var lookup = placemark[i].getElementsByTagName("LookAt");
                if (lookup != null && lookup.length > 0) {
                    var description = placemark[i].getElementsByTagName("description")[0].childNodes[0].nodeValue;
                    var start = description.indexOf("Time:") + 5;
                    var when = description.substring(start, start + 19);

                    var start = new Date("2018-06-09 12:00:00");
                    var thisPoint = new Date(when);
                    var minutes = Math.floor(((thisPoint - start) % (60 * 60 * 24 * 1000)) / (60 * 1000));

                    if (minutes <= minutesSinceStart) {
                        var longitude = lookup[0].getElementsByTagName("longitude")[0].childNodes[0].nodeValue;
                        var latitude = lookup[0].getElementsByTagName("latitude")[0].childNodes[0].nodeValue;
                        coords.push(new Microsoft.Maps.Location(latitude, longitude));
                    }
                }
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
            alert("error");
        }
    }

    var client = new XMLHttpRequest();
    client.onload = handler;
    client.open("GET", xmlFile);
    client.send();
}


