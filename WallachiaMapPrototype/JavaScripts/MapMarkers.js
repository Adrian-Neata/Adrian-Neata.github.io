const Place = {
    Name: 0,
    Latitude: 1,
    Longitude: 2,
    Status: 3,
    Year: 4,
    Id: 5,
    Record_Id: 6,
    Notes: 7,
    No_Mentions: 8,
};

const Record = {
    Id: 0,
    Year: 1,
    Description: 2,
}

// Initialize the map
var map = L.map('map').setView([45.1567241037536, 24.6754243860472], 8);

// Load Place Icons
var villageIcon = L.icon({
    iconUrl: 'Icons/village.png',
    iconSize: [48, 48], // size of the icon
});
var smallMonasteryIcon = L.icon({
    iconUrl: 'Icons/SmallMonasteryIcon.svg',
    iconSize: [32, 64], // size of the icon
});
var largeMonasteryIcon = L.icon({
    iconUrl: 'Icons/LargeMonasteryIcon.svg',
    iconSize: [64, 64], // size of the icon
});

// Add the OpenStreetMap tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 14,
    minZoom: 8,
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

var selected_place = null;
var markers = []

// Function to check marker visibility and hide/show markers accordingly
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

function openSidePanel(place) {
    // Open side panel
    selected_place = place;
    const sidePanel = document.getElementById("sidePanel");
    sidePanel.style.right = "0px";

    // Add title the name of the place
    document.getElementById("placeName").textContent = place[Place.Name];

    // Get all mentions of the place before the given year
    placeMentions = [];
    for (idx in mentions) {
        // Confirm place id for mention
        if (mentions[idx][Place.Id] != place[Place.Id]) {
            continue;
        }
        // Ignore mentions after the given year
        if (document.getElementById("yearRange").value < mentions[idx][Place.Year]) {
            continue;
        }

        placeMentions.push([
            mentions[idx][Place.Name], 
            mentions[idx][Place.Year], 
            records[mentions[idx][Place.Record_Id] - 1][Record.Description], 
            mentions[idx][Place.Status],
        ]);
    }

    // Sort mentions by decreasing year
    placeMentions = placeMentions.sort(function (a, b) { return b[1] - a[1]; });

    // Corner case when sidepanel is open and the year changes 
    // Close sidepanel if place hadn't previously been mentioned
    if (placeMentions.length == 0) {
        sidePanel.style.right = "-250px";
        return;
    }

    // If latest mention shows place disappeared then close sidepanel
    if (placeMentions[0][3] != "active") {
        console.log(placeMentions[0]);
        sidePanel.style.right = "-250px";
        return;
    }

    // Add html code to show mentions
    current_year = null;
    html_content = "";
    for (idx in placeMentions) {
        mention = placeMentions[idx];
        if (mention[1] != current_year) {
            current_year = mention[1];
            html_content += '<h2 class="yearSubtitle">' + current_year.toString() + '</h2><hr class="separatorLineYear">';
        }
        html_content += '<div class="referenceContainer"><h3 class="placeName">' + mention[0] + '</h3><h4 class="recordDescription">' + mention[2] + '</h4></div>';
    }
    const mentionList = document.getElementById("referenceList");
    mentionList.innerHTML = html_content;
}

function addMarkers(place) {
    if (place[Place.Latitude] == null || place[Place.Status] != "active") {
        return;
    }

    var coords = [place[Place.Latitude], place[Place.Longitude]];
    if (map.getZoom() < 12) {
        var radiusByZoom = { 8: 2, 9: 4, 10: 6, 11: 8 };
        var circle = L.circleMarker(coords, fill = 'black').addTo(map)
        circle.setRadius(radiusByZoom[map.getZoom()]);
        if (place[Place.Name].includes('Mănăstirea ') || place[Place.Name].includes('Schitul ')) {
            circle.setStyle({ color: 'black' });
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
            //iconMarker = L.marker(coords, { icon: villageIcon }).addTo(map);
            iconMarker = L.circleMarker(coords).addTo(map);
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
    markers = []

    var year = slider.value;
    var latest_mentions = {};
    for (mention_idx in mentions) {
        mentions[mention_idx][Place.No_Mentions] = 1;
    }
    for (mention_idx in mentions) {
        mention = mentions[mention_idx];
        // Ignore mentions that happen after the selected year
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
