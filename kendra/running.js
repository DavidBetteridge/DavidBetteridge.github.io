
var map = L.map('map').setView([53.4808, -1.2426], 7);

const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

var layers = []

var runs = {};

function displayRoute(xmlFile, map, colour) {

    function handler() {

        if (this.status == 200 && this.responseXML != null) {
            var xmlDoc = this.responseXML;
            var lineData = [];
            var trkpts = xmlDoc.getElementsByTagName("trkpt");

            if (trkpts.length > 0) {
                for (var i = 0; i < trkpts.length; i++) {
                    var trkpt = trkpts[i];
                    var longitude = trkpt.getAttribute("lon");
                    var latitude = trkpt.getAttribute("lat");

                    
                    lineData.push([latitude, longitude]);
                }

                
                var polyline = L.polyline(lineData, {color: colour}).addTo(map);
                layers.push(polyline)

                runs[xmlFile] = polyline;
            }
        } 
        else 
        {
            //console.log("Error getting xml file " + xmlFile + " status code " + this.status);
        }
    }

    var run = runs[xmlFile];
    if (run === undefined)
    {
        var client = new XMLHttpRequest();
        client.onreadystatechange = handler;
        client.open("GET", "/running/data/" + xmlFile);
        client.send();
    }
    else
    {
        layers.push(run);
        run.addTo(map)
    }
}
 

function redraw() {
    layers.forEach(function (layer) {
        map.removeLayer(layer);
    });
    layers = [];
    
    var checkboxes = document.querySelectorAll(".route");
    checkboxes.forEach(function (checkbox) {
        if (checkbox.checked) {
            var filename = checkbox.getAttribute("value");
            var colour = checkbox.getAttribute("data-colour");
            displayRoute(filename, map, colour)            
        }
    });
}

var checkboxes = document.querySelectorAll(".route");
checkboxes.forEach(function (checkbox) {
    checkbox.addEventListener('change', function () {
        if (this.checked) {
            var filename = this.getAttribute("value");
            var colour = this.getAttribute("data-colour");
            displayRoute(filename, map, colour)
        } else {
            redraw();
        }
    });
});

var selectAll = document.getElementsByClassName("routeAll")[0];
selectAll.addEventListener('change', function () {
    if (this.checked) {
        var checkboxes = document.querySelectorAll(".route");
        checkboxes.forEach(function (checkbox) {
            checkbox.checked=true;
        });
        redraw();
    }
});

