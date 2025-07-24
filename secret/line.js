var map = L.map('map').setView([51.505, -0.09], 13);

const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);



var mcdonaldsIcon = L.icon({
    iconUrl: 'mcdonalds.jpg',
    // shadowUrl: 'leaf-shadow.png',

    iconSize:     [36, 36], // size of the icon
    // shadowSize:   [50, 64], // size of the shadow
    // iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
    // shadowAnchor: [4, 62],  // the same for the shadow
    // popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
});


var polyline = L.polyline(lineData, {color: 'red'}).addTo(map);

// zoom the map to the polyline
map.fitBounds(polyline.getBounds());


for(var i = 0; i < mcd.length; i++) {
    const store = mcd[i]
    const corrds = [store[2], store[1]]
    L.marker(corrds, {icon: mcdonaldsIcon}).addTo(map);
}

    