// Initialize the map
var map = L.map('map',{ zoomControl: false }).setView([45.1567241037536, 24.6754243860472], 8);
new L.Control.Zoom({ position: 'bottomright' }).addTo(map);

// Load Place Icons
var villageIcon = L.icon({
    iconUrl: 'Icons/village.png',
    iconSize: [48, 48], // size of the icon
});
var smallMonasteryIcon = L.icon({
    iconUrl: 'Icons/SmallMonasteryIcon.svg',
    iconSize: [32, 64], // size of the icon
    iconAnchor: [16, 50]
});
var largeMonasteryIcon = L.icon({
    iconUrl: 'Icons/LargeMonasteryIcon.svg',
    iconSize: [64, 64], // size of the icon
    iconAnchor: [32, 50]
});

// Add the OpenStreetMap tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 14,
    minZoom: 8,
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

var selected_place = null;
var markers = []

// Function to check marker visibility and hide/show markers according to the window view
function updateMarkerVisibility() {
    var bounds = map.getBounds();
    
    for (idx in markers) {
        var marker = markers[idx];
        if (bounds.contains(marker.getLatLng())) {
            map.addLayer(marker);
        } else {
            map.removeLayer(marker);
        }
    }
}

function addMarkers(place) {
    if (place[Mention.Latitude] == null || place[Mention.Place_Status] != "active") {
        return;
    }

    var coords = [place[Mention.Latitude], place[Mention.Longitude]];

    // if small zoom show only colored circles
    if (map.getZoom() < 12) {
        var radiusByZoom = { 8: 2, 9: 4, 10: 6, 11: 8 };
        var circle = L.circleMarker(coords, fill = 'black').addTo(map)
        circle.setRadius(radiusByZoom[map.getZoom()]);
        if (place[Mention.Place_Type] == Place_Type.Monastery) {
            circle.setStyle({ color: 'black' });
        }
        circle.on('click', function () {
            openSidePanel(place);
        });
        markers.push(circle);
        return
    }

    // if large zoom show icons if possible
    var textIcon = L.divIcon({
        className: 'text-icon',
        iconSize: [64, 24],
        html: '<p>' + place[Mention.Name] + '</p>',
        iconAnchor: [32, 0]
    });

    var textMarker = L.marker(coords, { icon: textIcon }).addTo(map);
    textMarker.on('click', function () {
        openSidePanel(place);
    });
    markers.push(textMarker);

    //iconMarker = L.marker(coords, { icon: villageIcon }).addTo(map);
    var iconMarker = L.circleMarker(coords);

    if (place[Mention.Place_Type] == Place_Type.Monastery) {
        iconMarker.setStyle({ color: 'black' });
        // if ("Apare ca mănăstire mică." == place[Mention.Notes]) {
        //     iconMarker = L.marker(coords, { icon: smallMonasteryIcon });
        // } else if ("Apare ca mănăstire mare." == place[Mention.Notes]) {
        //     iconMarker = L.marker(coords, { icon: largeMonasteryIcon });
        // }
    }
    iconMarker = iconMarker.addTo(map);
    iconMarker.on('click', function () {
        openSidePanel(place);
    });
    markers.push(iconMarker);
}

function updateMarkerPosition() {

    for (marker_id in markers) {
        map.removeLayer(markers[marker_id]);
    }
    markers = []

    var year = slider.value;

    mentions_list = [mentions_places, mentions_monasteries];
    for (var i = 0; i < 2; i++) {
        var latest_mentions = {};
        mentions = mentions_list[i];
        for (mention_idx in mentions) {
            mentions[mention_idx][Mention.No_Mentions] = 1;
        }
        for (mention_idx in mentions) {
            mention = mentions[mention_idx];

            // Ignore mentions that happen after the selected year
            if (mention[Mention.Year] > year) {
                continue;
            }

            if (!(mention[Mention.Place_Id] in latest_mentions)) {
                latest_mentions[mention[Mention.Place_Id]] = mention;
            } else {
                if (latest_mentions[mention[Mention.Place_Id]][Mention.Year] < mention[Mention.Year]) {
                    latest_mentions[mention[Mention.Place_Id]] = mention;
                }
                latest_mentions[mention[Mention.Place_Id]][Mention.No_Mentions] += 1;
            }
        }
        for (mention_idx in mentions) {
            if (mentions[mention_idx][Mention.No_Mentions] > 1)
                //console.log(mentions[mention_idx]);
                continue;
        }
        Object.values(latest_mentions).forEach(element => {
            addMarkers(element);
        });
    }
}

// Update side panel and markers when user changes year
slider.addEventListener("change", function () {
    updateMarkerPosition();

    if (selected_place && sidePanel.style.right == '0px') {
        openSidePanel(selected_place);
    }
});

// Initial loading of the markers
updateMarkerPosition();

// Update map everytime the zoom changes
map.on('zoomend', function () {
    updateMarkerPosition();
    console.log(map.getZoom());
});

// Listen for map move and zoom events to update marker visibility
map.on('moveend', updateMarkerVisibility);

// Initial check to display markers within the current viewport
updateMarkerVisibility();
