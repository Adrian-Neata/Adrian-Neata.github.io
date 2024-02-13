// Initialize the map
var map = L.map('map', { zoomControl: false }).setView([45.1567241037536, 24.6754243860472], 8);
new L.Control.Zoom({ position: 'bottomright' }).addTo(map);
const COLOR_COUNTIES_CHECKBOX = document.getElementById("colorCountiesCheckbox");
var colorByCounty = {};

COLOR_COUNTIES_CHECKBOX.addEventListener('change', () => {
    //console.log(colorByCounty);
    updateMarkerPosition();
});

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

var YEAR_INCREASED = false;

// Check marker visibility and hide/show markers according to the window view
function updateMarkerVisibility() {
    var bounds = map.getBounds();

    for (place_id in MARKERS) {
        for (idx in MARKERS[place_id]) {
            var marker = MARKERS[place_id][idx];
            if (bounds.contains(marker.getLatLng())) {
                map.addLayer(marker);
            } else {
                map.removeLayer(marker);
            }
        }
    }
}

function get_county_color(county_name) {
    if (!(county_name in colorByCounty)) {
        if (YEAR_SLIDER_VALUE >= 2021) {
            colorByCounty[county_name] = COUNTY_COLORS_1968_2021[county_name];
        } else if (YEAR_SLIDER_VALUE > 1850 && YEAR_SLIDER_VALUE < 1950) {
            colorByCounty[county_name] = COUNTY_COLORS_BEFORE_1950[county_name];
        } else {
            colorByCounty[county_name] = FASHIONABLE_COLORS[Object.keys(colorByCounty).length % FASHIONABLE_COLORS.length];
        }
    }
    return colorByCounty[county_name];
}

function get_text_marker(latest_mention) {
    var coords = [latest_mention[Mention.Latitude], latest_mention[Mention.Longitude]];
    // show icons if possible
    var textIcon = L.divIcon({
        className: 'text-icon',
        iconSize: [64, 24],
        html: '<p>' + latest_mention[Mention.Name] + '</p>',
        iconAnchor: [32, 0]
    });

    // show place names
    var textMarker = L.marker(coords, { icon: textIcon }).addTo(map);
    if (latest_mention[Mention.Place_Status] === "active") {
        textMarker.on('click', function () {
            openSidePanel(latest_mention[Mention.Place_Id]);
        });
    }
    return textMarker;
}

function addMarkers(latest_mention) {

    // skip because we don't know where to put the marker
    if (latest_mention[Mention.Latitude] == null) {
        return;
    }

    var place_id = latest_mention[Mention.Place_Id];
    var coords = [latest_mention[Mention.Latitude], latest_mention[Mention.Longitude]];
    var circle = L.circleMarker(coords, { radius: RADIUS_BY_ZOOM[map.getZoom()], className: 'custom-marker' }).addTo(map);

    // if monastery make circle black otherwise default blue
    if (latest_mention[Mention.Place_Type] == Place_Type.Monastery) {
        circle.setStyle({ color: 'black' });
    }

    // if counties should be colored assign colors for settlements
    if (latest_mention[Mention.Place_Type] == Place_Type.Settlement && COLOR_COUNTIES_CHECKBOX.checked) {
        circle.setStyle({ color: get_county_color(latest_mention[Mention.County]) });
    }

    // make marker clickable if place is still active
    if (latest_mention[Mention.Place_Status] === "active") {
        circle.on('click', function () {
            openSidePanel(place_id);
        });
    }

    MARKERS[place_id] = [circle];

    // if zoom big enough show place names
    if (map.getZoom() >= 12) {
        MARKERS[place_id].push(get_text_marker(latest_mention));
    }
}

function check_inactive_place(mentions) {
    for (idx in mentions) {
        if (mentions[idx][Mention.Place_Status] != "active" && mentions[idx][Mention.Place_Status] != "founded") {
            return true;
        }
    }
    return false;
}

function updateMarkerPosition() {
    colorByCounty = {};

    // remove previous markers
    for (place_id in MARKERS) {
        for (idx in MARKERS[place_id]) {
            map.removeLayer(MARKERS[place_id][idx]);
        }
    }
    MARKERS = {};

    mentions_list = [MENTIONS_SETTLEMENTS, MENTIONS_MONASTERIES];
    for (idx in mentions_list) {
        for (place_id in mentions_list[idx]) {
            var latest_mentions = get_latest_mentions(place_id, null, YEAR_SLIDER_VALUE);

            // place has no mentions before the current year
            if (latest_mentions.length == 0) {
                continue;
            }

            // place is inactive and has already been highlighted
            if (latest_mentions[0][Mention.Year] <= PREV_YEAR_SLIDER_VALUE && check_inactive_place(latest_mentions)) {
                continue;
            }

            // check if place is disbanded or united and thus shouldn't be shown
            if (check_inactive_place(latest_mentions) && (HIGHLIGHTS_CHECKBOX.checked === false || !YEAR_INCREASED)) {
                continue;
            }

            addMarkers(latest_mentions[0]);
        }

    }
}

// Update map everytime the zoom changes
map.on('zoomend', function () {
    updateMarkerPosition();
});

// Listen for map move and zoom events to update marker visibility
map.on('moveend', updateMarkerVisibility);

// Initial loading of the markers
updateMarkerPosition();

// Initial check to display markers within the current viewport
updateMarkerVisibility();
