const Place = {
    Name: 0,
    Latitude: 1,
    Longitude: 2,
    Status: 3,
    Year: 4,
    Id: 5,
    Notes: 6,
    No_Mentions: 7,
};

// Initialize the map
var map = L.map('map').setView([45.1567241037536, 24.6754243860472], 8);

// Load Place Icons
var villageIcon = L.icon({
    iconUrl: 'village.png',
    iconSize: [48, 48], // size of the icon
});
var smallMonasteryIcon = L.icon({
    iconUrl: 'SmallMonasteryIcon.svg',
    iconSize: [32, 64], // size of the icon
});
var largeMonasteryIcon = L.icon({
    iconUrl: 'LargeMonasteryIcon.svg',
    iconSize: [64, 64], // size of the icon
});

// Add the OpenStreetMap tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 14,
    minZoom: 8,
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

function openSidePanel(place) {
    // open side panel
    const sidePanel = document.getElementById("sidePanel");
    sidePanel.style.right = "0";

    // add title the name of the place
    document.getElementById("placeName").textContent = place[Place.Name];

    // get all mentions of the place before the given year
    placeMentions = [];
    for (idx in mentions) {
        // confirm place id for mention
        if (mentions[idx][Place.Id] != place[Place.Id]) {
            continue;
        }
        // ignore mentions after the given year
        if (document.getElementById("yearRange").value < mentions[idx][Place.Year]) {
            continue;
        }
        
        placeMentions.push(mentions[idx]);
    }
    console.log(placeMentions);
}

var markers = []
function addMarkers(place) {
    if (place[Place.Latitude] == null || place[Place.Status] != "active") {
        return;
    }

    var coords = [place[Place.Latitude], place[Place.Longitude]];
    if (map.getZoom() < 12) {
        var radiusByZoom = { 8: 2, 9: 4, 10: 6, 11: 8 };
        var circle = L.circleMarker(coords, fill='black').addTo(map)
        circle.setRadius(radiusByZoom[map.getZoom()]);
        if (place[Place.Name].includes('Mănăstirea ')) {
            circle.setStyle({color: 'black'});
        }
        circle.on('click', function () {
            openSidePanel(place);
        });
        markers.push(circle);
    } else {
        var textIcon = L.divIcon({
            className: 'text-icon',
            iconSize: [100, 40],
            html: '<p>' + place[Place.Name] + '</p>',
            iconAnchor: [20, -20]
        });

        var textMarker = L.marker(coords, { icon: textIcon }).addTo(map);
        textMarker.on('click', function () {
            openSidePanel(place);
        });
        markers.push(textMarker);

        var iconMarker = null;
        if ("Apare ca mănăstire mică." == place[Place.Notes]) {
            iconMarker = L.marker(coords, { icon: smallMonasteryIcon }).addTo(map);
        } else if ("Apare ca mănăstire mare." == place[Place.Notes]) {
            iconMarker = L.marker(coords, { icon: largeMonasteryIcon }).addTo(map);
        } else {
            iconMarker = L.marker(coords, { icon: villageIcon }).addTo(map);
        }
        iconMarker.on('click', function () {
            openSidePanel(place);
        });
        markers.push(iconMarker);
    }
}

function updateMarkerPosition() {

    for (marker_id in markers) {
        map.removeLayer(markers[marker_id]);
    }

    var slider = document.getElementById("yearRange");
    var year = slider.value;
    var latest_mentions = {};
    for (mention_idx in mentions) {
        mentions[mention_idx][Place.No_Mentions] = 1;
    }
    for (mention_idx in mentions) {
        mention = mentions[mention_idx];
        // ignore mentions that happen after the selected year
        if (mention[Place.Year] > year) {
            continue;
        }

        if (!(mention[Place.Id] in latest_mentions)) {
            latest_mentions[mention[Place.Id]] = mention;
        } else {
            if (latest_mentions[mention[Place.Id]][Place.Year] < mention[Place.Year]) {
                latest_mentions[mention[Place.Id]] = mention;
            }
            latest_mentions[mention[Place.Id]][Place.No_Mentions] += 1;
        }
    }
    for (mention_idx in mentions) {
        if (mentions[mention_idx][Place.No_Mentions] > 1)
            //console.log(mentions[mention_idx]);
            continue;
    }
    Object.values(latest_mentions).forEach(addMarkers);
}
var slider = document.getElementById("yearRange");
slider.addEventListener("change", updateMarkerPosition);
updateMarkerPosition();

// update map everytime the zoom changes
map.on('zoomend', function () {
    updateMarkerPosition();
    console.log(map.getZoom());
});
