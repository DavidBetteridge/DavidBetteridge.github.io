
var map = L.map('map').setView([53.4808, -1.2426], 7);

const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);


var summerIcon = L.icon({
    iconUrl: 'summer.png',
    // shadowUrl: 'leaf-shadow.png',

    iconSize:     [36, 36], // size of the icon
    // shadowSize:   [50, 64], // size of the shadow
    // iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
    // shadowAnchor: [4, 62],  // the same for the shadow
    // popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
});

var winterIcon = L.icon({
    iconUrl: 'winter.png',
    // shadowUrl: 'leaf-shadow.png',

    iconSize:     [32, 32], // size of the icon
    // shadowSize:   [50, 64], // size of the shadow
    // iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
    // shadowAnchor: [4, 62],  // the same for the shadow
    // popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
});

var layers = []

var runs = {};
var winter_line_raw_data = [];
var summer_line_raw_data = [];

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
                    var time = trkpt.getElementsByTagName("time")[0].innerHTML;

                    
                    lineData.push([latitude, longitude]);

                    if (xmlFile == "SummerLine.gpx") {
                        summer_line_raw_data.push([time, latitude, longitude])
                    }
                    if (xmlFile == "WinterLine.gpx") {
                        winter_line_raw_data.push([time, latitude, longitude])
                    }                    
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
        client.open("GET", "/line/" + xmlFile);
        client.send();
    }
    else
    {
        layers.push(run);
        run.addTo(map)
    }
}


var slider = document.getElementById("slider");
var output = document.getElementById("hour");
output.innerHTML = slider.value; // Display the default slider value

var winterMarker;
var summerMarker;

slider.oninput = function() {
  output.innerHTML = this.value;

  // Winter line
  var baseTime = new Date(winter_line_raw_data[0][0]);
  var targetDate = new Date(new Date(baseTime).setUTCHours(baseTime.getUTCHours() + Number(this.value)));
  for (var i = 0; i < winter_line_raw_data.length; i++) {
    var t = new Date(winter_line_raw_data[i][0]);
    if (t > targetDate) {
        const corrds = [winter_line_raw_data[i][1], winter_line_raw_data[i][2]]
        if (winterMarker) winterMarker.remove();
        winterMarker = L.marker(corrds, {icon: winterIcon}).addTo(map);
        break;
    }
  }

  // Summer line
  baseTime = new Date(summer_line_raw_data[0][0]);
  targetDate = new Date(new Date(baseTime).setUTCHours(baseTime.getUTCHours() + Number(this.value)));
  for (var i = 0; i < summer_line_raw_data.length; i++) {
    var t = new Date(summer_line_raw_data[i][0]);
    if (t > targetDate) {
        const corrds = [summer_line_raw_data[i][1], summer_line_raw_data[i][2]]
        if (summerMarker) summerMarker.remove();
        summerMarker = L.marker(corrds, {icon: summerIcon}).addTo(map);
        break;
    }
  }
}

displayRoute("SummerLine.gpx", map, "#ff000d")  
displayRoute("WinterLine.gpx", map, "#8c00ff")  



// corrds = [store[2], store[1]]
// L.marker(corrds, {icon: summerIcon}).addTo(map);