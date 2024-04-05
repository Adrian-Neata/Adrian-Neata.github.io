
function set_highlighted_markers(highlights, orig_colors) {
    for (place_id in highlights) {
        if (!(place_id in MARKERS)) {
            continue;
        }
        circle = MARKERS[place_id][0];
        orig_colors[place_id] = circle.options.color;

        circle.setRadius(RADIUS_BY_ZOOM[map.getZoom()] * 3);
        circle.setStyle({ color: highlights[place_id] });
    }
    return orig_colors;
}


function revert_highlighted_markers(highlights, orig_colors) {
    for (place_id in highlights) {
        if (!(place_id in MARKERS)) {
            continue;
        }
        circle = MARKERS[place_id][0];
        circle.setStyle({ color: orig_colors[place_id] });

        if (highlights[place_id] === "red" || highlights[place_id] === "purple") {
            circle.setRadius(0);
            continue;
        }

        circle.setRadius(RADIUS_BY_ZOOM[map.getZoom()]);
    }
}

function remove_highlighted_markers(highlights) {
    for (place_id in highlights) {
        if (!(place_id in MARKERS)) {
            continue;
        }
        if (highlights[place_id] === "red" || highlights[place_id] === "purple") {
            for (idx in MARKERS[place_id]) {
                map.removeLayer(MARKERS[place_id][idx]);
            }
            delete MARKERS[place_id];
        }
    }
}

function get_highlighted_markers() {
    var highlights = {};
    for (place_id in MARKERS) {
        var latest_mentions = get_latest_mentions(place_id, PREV_YEAR_SLIDER_VALUE, YEAR_SLIDER_VALUE);
        for (idx in latest_mentions) {
            if (latest_mentions[idx][Mention.Place_Status] === "disbanded") {
                highlights[place_id] = "red";
                break;
            } else if (latest_mentions[idx][Mention.Place_Status] === "united") {
                highlights[place_id] = "purple";
                break;
            }
        }

        if (place_id in highlights) {
            continue;
        }

        var earlier_mentions = get_latest_mentions(place_id, null, PREV_YEAR_SLIDER_VALUE);

        var earlier_year = PREV_YEAR_SLIDER_VALUE;
        if (earlier_mentions.length != 0) {
            earlier_year = earlier_mentions[0][Mention.Year];
        }
        var mentions_inbetween = get_place_mentions(place_id, earlier_year, YEAR_SLIDER_VALUE);
        mentions_inbetween.sort(function (a, b) { return a[Mention.Year] - b[Mention.Year]; });

        if (earlier_mentions.length === 0) {
            if (mentions_inbetween.length === 1) {
                // only one mention
                highlights[place_id] = "green";
            } else if (mentions_inbetween[0][Mention.Year] === mentions_inbetween[mentions_inbetween.length-1][Mention.Year]) {
                // only mentions from the same year
                highlights[place_id] = "green";
            }

        }
        
        // ignore mentions from "Harta Căilor de Comunicație din Județul ..." because they are unreliable
        for (idx in mentions_inbetween) {
            if ([40, 41, 54, 63, 64, 65, 94, 120, 121, 122, 123, 176, 177].includes(mentions_inbetween[idx][Mention.Record_Id])) {
                mentions_inbetween.splice(idx, 1);
            }
        }

        var min_name_change_score = null;
        for (var i = 0; i < mentions_inbetween.length - 1; i++) {
            mention_name = removeDiacritics(mentions_inbetween[i][Mention.Name]);
            next_mention_name = removeDiacritics(mentions_inbetween[i+1][Mention.Name]);
            score = compareStrings(mention_name, next_mention_name);

            if (!min_name_change_score) {
                min_name_change_score = score;
            }
            if (score < min_name_change_score) {
                min_name_change_score = score;
            }

        }

        if (min_name_change_score && min_name_change_score > 0.5) {
            highlights[place_id] = "yellow";
        }

    }
    return highlights;
}
function highlightMarkers() {
    // do nothing if checkbox is not checked
    if (HIGHLIGHTS_CHECKBOX.checked === false) {
        return;
    }
    var orig_colors = {};
    var highlights = get_highlighted_markers();
    const wait_time_animation = 2500;

    // increase the radius and change color
    setTimeout(function () {
        set_highlighted_markers(highlights, orig_colors);
    }, 500);

    // wait for a short time before decreasing the radius and changing back to original color
    setTimeout(function () {
        revert_highlighted_markers(highlights, orig_colors);
    }, 500 + wait_time_animation);

    // wait for animation to finish and then remove markers
    setTimeout(function () {
        remove_highlighted_markers(highlights);
    }, 500 + 2 * wait_time_animation);
}