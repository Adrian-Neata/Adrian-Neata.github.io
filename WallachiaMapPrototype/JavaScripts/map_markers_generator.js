// Initialize the map
var map = L.map('map', { zoomControl: false }).setView([45.1567241037536, 24.6754243860472], 8);
new L.Control.Zoom({ position: 'bottomright' }).addTo(map);
var groupByCounty_Checkbox = document.getElementById("groupByCounty");
var colorByCounty = {};

groupByCounty_Checkbox.addEventListener('change', () => {
    //console.log(colorByCounty);
    colorByCounty = {};
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

var selected_place = null;
var MARKERS = [];
var NEW_PLACE_MARKERS = [];
var MARKERS_TO_BE_REMOVED = [];
var NAME_CHANGE_MARKERS = {};
var PREV_SLIDER_VALUE = 1718;
var SLIDER_VALUE = 1718;
var PLACE_NAMES = {};

// Function to check marker visibility and hide/show markers according to the window view
function updateMarkerVisibility() {
    var bounds = map.getBounds();

    for (idx in MARKERS) {
        var marker = MARKERS[idx];
        if (bounds.contains(marker.getLatLng())) {
            map.addLayer(marker);
        } else {
            map.removeLayer(marker);
        }
    }
}

function removeDisbandedPlaces() {
    for (idx in MARKERS_TO_BE_REMOVED) {
        [circle, textMarker] = MARKERS_TO_BE_REMOVED[idx];
        map.removeLayer(circle);
        MARKERS = MARKERS.filter(function (e) { return e !== circle })
        if (textMarker) {
            map.removeLayer(textMarker);
            MARKERS = MARKERS.filter(function (e) { return e !== textMarker })
        }
    }
    MARKERS_TO_BE_REMOVED = [];
}

function highlightMarkers() {
    orig_colors = { 0: {}, 1: {}, 2: {} };
    wait_time_animation = 2500;

    // increase the radius and change color to red or green
    setTimeout(function () {
        for (idx in MARKERS_TO_BE_REMOVED) {
            [circle, textMarker, placeStatus] = MARKERS_TO_BE_REMOVED[idx];
            orig_colors[0][idx] = circle.options.color;

            circle.setRadius(RADIUS_BY_ZOOM[map.getZoom()] * 3);
            if (placeStatus === "disbanded" || placeStatus === "unknown") {
                circle.setStyle({ color: 'red' });
            }
            if (placeStatus === "united") {
                circle.setStyle({ color: 'purple' });
            }
        }

        for (idx in NEW_PLACE_MARKERS) {
            circle = NEW_PLACE_MARKERS[idx];
            orig_colors[1][idx] = circle.options.color;

            circle.setRadius(RADIUS_BY_ZOOM[map.getZoom()] * 3);
            circle.setStyle({ color: 'green' });
        }

        for (idx in NAME_CHANGE_MARKERS) {
            circle = NAME_CHANGE_MARKERS[idx];
            orig_colors[2][idx] = circle.options.color;

            circle.setRadius(RADIUS_BY_ZOOM[map.getZoom()] * 3);
            circle.setStyle({ color: 'yellow' });
        }
    }, 500);


    // wait for a short time before decreasing the radius and changing back to original color
    setTimeout(function () {

        // decrease marker radius back to the original value
        for (idx in MARKERS_TO_BE_REMOVED) {
            [circle, textMarker] = MARKERS_TO_BE_REMOVED[idx];
            circle.setRadius(0);
            circle.setStyle({ color: orig_colors[0][idx] });
        }

        for (idx in NEW_PLACE_MARKERS) {
            circle = NEW_PLACE_MARKERS[idx];
            circle.setRadius(RADIUS_BY_ZOOM[map.getZoom()]);
            circle.setStyle({ color: orig_colors[1][idx] });
        }

        for (idx in NAME_CHANGE_MARKERS) {
            circle = NAME_CHANGE_MARKERS[idx];
            circle.setRadius(RADIUS_BY_ZOOM[map.getZoom()]);
            circle.setStyle({ color: orig_colors[2][idx] });
        }

        NEW_PLACE_MARKERS = [];
        NAME_CHANGE_MARKERS = [];

    }, 500 + wait_time_animation); // Adjust the delay as needed

    // wait for animation to finish and then remove markers
    setTimeout(removeDisbandedPlaces, 500 + 2 * wait_time_animation);
}

function addMarkersToHighlights(last_mention, circle, textMarker) {
    if (last_mention[Mention.Place_Status] != "active" && last_mention[Mention.Place_Status] != "founded") {
        MARKERS_TO_BE_REMOVED.push([circle, textMarker, last_mention[Mention.Place_Status]]);
        if (last_mention[Mention.Place_Id] in NAME_CHANGE_MARKERS) {
            delete NAME_CHANGE_MARKERS[last_mention[Mention.Place_Id]];
        }
    } else if (last_mention[Mention.Year] > PREV_SLIDER_VALUE && last_mention[Mention.No_Mentions] === 1) {
        NEW_PLACE_MARKERS.push(circle);
        if (last_mention[Mention.Place_Id] in NAME_CHANGE_MARKERS) {
            delete NAME_CHANGE_MARKERS[last_mention[Mention.Place_Id]];
        }
    } else if (last_mention[Mention.Place_Id] in NAME_CHANGE_MARKERS) {
        NAME_CHANGE_MARKERS[last_mention[Mention.Place_Id]] = circle;
    }
}

function addMarkers(last_mention, year_changed) {
    var textMarker = null;

    // skip because we don't know where to put the marker
    if (last_mention[Mention.Latitude] == null) {
        return;
    }

    if (last_mention[Mention.Place_Status] != "active" && !year_changed) {
        return;
    }

    if (last_mention[Mention.Place_Status] != "active" && last_mention[Mention.Year] <= PREV_SLIDER_VALUE) {
        return;
    }

    var coords = [last_mention[Mention.Latitude], last_mention[Mention.Longitude]];
    var circle = L.circleMarker(coords, { radius: RADIUS_BY_ZOOM[map.getZoom()], className: 'custom-marker' }).addTo(map);

    // if monastery make circle black otherwise default blue
    if (last_mention[Mention.Place_Type] == Place_Type.Monastery) {
        circle.setStyle({ color: 'black' });
    } else if (groupByCounty_Checkbox.checked) {

        if (!(last_mention[Mention.County] in colorByCounty)) {
            if (SLIDER_VALUE < 2021) {
                colorByCounty[last_mention[Mention.County]] = fashionableColors[Object.keys(colorByCounty).length % fashionableColors.length];
            } else {
                colorByCounty[last_mention[Mention.County]] = fashionableColors1965[last_mention[Mention.County]];
                // if (! (last_mention[Mention.County] in fashionableColors1965)) {
                //     console.log(last_mention);
                // }
            }
        }

        circle.setStyle({ color: colorByCounty[last_mention[Mention.County]] });
    }

    if (last_mention[Mention.Place_Status] === "active") {
        circle.on('click', function () {
            openSidePanel(last_mention);
        });
    }

    MARKERS.push(circle);

    // if zoom big enough show place names
    if (map.getZoom() >= 12) {
        // show icons if possible
        var textIcon = L.divIcon({
            className: 'text-icon',
            iconSize: [64, 24],
            html: '<p>' + last_mention[Mention.Name] + '</p>',
            iconAnchor: [32, 0]
        });

        // show place names
        textMarker = L.marker(coords, { icon: textIcon }).addTo(map);
        textMarker.on('click', function () {
            openSidePanel(last_mention);
        });
        MARKERS.push(textMarker);
    }

    if (year_changed) {
        addMarkersToHighlights(last_mention, circle, textMarker);
    }
}

function compareStrings(str1, str2) {
    avg_length = (str1.length + str2.length) / 2;
    bonus_length = Math.abs(str1.length - str2.length) / avg_length / 2;
    disimilarity_score1 = levenshteinDistance(str1, str2) / avg_length + bonus_length;

    str1 = str1.split(" ").reverse().join(' ');

    disimilarity_score2 = levenshteinDistance(str1, str2) / avg_length + bonus_length;

    if (disimilarity_score1 > disimilarity_score2) {
        return disimilarity_score2;
    }
    return disimilarity_score1;
}

function checkForNameChanges(mentions, latest_mentions) {
    var prev_latest_mentions = {}

    for (mention_idx in mentions) {
        mention = mentions[mention_idx];
        place_id = mention[Mention.Place_Id];

        // Ignore mentions that involve places that don't show up as markers
        if (!(place_id in latest_mentions) || mention[Mention.Latitude] == null) {
            continue;
        }


        // Ignore mentions that happen after the selected year
        if (mention[Mention.Year] > SLIDER_VALUE) {
            continue;
        }

        // Ignore mentions if already in the list of name changes or part of harta cailor de comunicatii (this record isn't the best source for names)
        if (place_id in NAME_CHANGE_MARKERS || [40, 41, 54, 63, 64, 65].includes(latest_mentions[place_id][Mention.Record_Id])) {
            continue;
        }

        
        if (mention[Mention.Year] <= PREV_SLIDER_VALUE) {
            // find latest mention previously used to get place name
            if (place_id in prev_latest_mentions) {
                if (prev_latest_mentions[place_id][Mention.Year] < mention[Mention.Year]) {
                    prev_latest_mentions[place_id] = mention;
                }
            } else {
                prev_latest_mentions[place_id] = mention;
            }
        }

        // Ignore mentions that happen before the previous selected year
        if (mention[Mention.Year] < PREV_SLIDER_VALUE) {
            continue;
        }

        latest_mention_name = removeDiacritics(latest_mentions[place_id][Mention.Name]);
        current_mention_name = removeDiacritics(mention[Mention.Name]);
        score = compareStrings(latest_mention_name, current_mention_name);

        if (score > 0.5) {
            // mark the entries which will be filled at the next step
            NAME_CHANGE_MARKERS[place_id] = place_id;
        }

    }

    // check case for latest mention previously used to get place name
    for (place_id in prev_latest_mentions) {
        // Ignore prev_latest_mentions if we have a record right on PREV_SLIDER_VALUE
        if (prev_latest_mentions[place_id][Mention.Year] == PREV_SLIDER_VALUE) {
            continue;
        }
        latest_mention_name = removeDiacritics(latest_mentions[place_id][Mention.Name]);
        current_mention_name = removeDiacritics(prev_latest_mentions[place_id][Mention.Name]);
        score = compareStrings(latest_mention_name, current_mention_name);
        if (score > 0.5) {
            // mark the entries which will be filled at the next step
            NAME_CHANGE_MARKERS[place_id] = place_id;
        }

    }
}

function updateMarkerPosition(year_changed) {

    for (marker_id in MARKERS) {
        map.removeLayer(MARKERS[marker_id]);
    }
    MARKERS = []

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
            if (mention[Mention.Year] > SLIDER_VALUE) {
                continue;
            }

            if (!(mention[Mention.Place_Id] in latest_mentions)) {
                latest_mentions[mention[Mention.Place_Id]] = mention;
            } else {
                if (latest_mentions[mention[Mention.Place_Id]][Mention.Year] < mention[Mention.Year]) {
                    mention[Mention.No_Mentions] = latest_mentions[mention[Mention.Place_Id]][Mention.No_Mentions];
                    latest_mentions[mention[Mention.Place_Id]] = mention;
                }
                latest_mentions[mention[Mention.Place_Id]][Mention.No_Mentions] += 1;
            }


        }

        if (year_changed) {
            // Check for name changes
            checkForNameChanges(mentions, latest_mentions);
        }

        // for (mention_idx in mentions) {
        //     if (mentions[mention_idx][Mention.No_Mentions] > 1)
        //         console.log(mentions[mention_idx][Mention.No_Mentions]);
        //         continue;
        // }
        Object.values(latest_mentions).forEach(element => {
            addMarkers(element, year_changed);
        });
    }
}

// Update side panel and markers when user changes year
slider.addEventListener("change", function () {
    var year_changed = false;
    PREV_SLIDER_VALUE = SLIDER_VALUE;
    SLIDER_VALUE = slider.value;

    if (SLIDER_VALUE > PREV_SLIDER_VALUE) {
        year_changed = true;
    }

    updateMarkerPosition(year_changed);

    if (selected_place && sidePanel.style.right == '0px') {
        openSidePanel(selected_place);
    }

    if (year_changed) {
        highlightMarkers();
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
