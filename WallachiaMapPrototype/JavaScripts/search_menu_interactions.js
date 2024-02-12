const SEARCH_RESULTS = [];

function handleKeyPressSearch(e) {
    // check if Enter key was pressed to proceed with the search
    if (e.keyCode === 13) {
        searchPlaces(document.getElementById("searchBar").value);
    }
    return false;
}

function generateNGrams(text) {
    ngrams = [];

    for (i = text.length; i > 0; i--) {
        for (j = 0; j < text.length - i; j++) {
            ngrams.push(text.slice(j, j + i + 1));
        }
    }

    return ngrams;
}

function sortSearchResults(a, b) {
    if (a['score'] < b['score']) {
        return 1;
    }

    if (a['score'] > b['score']) {
        return -1;
    }

    if (a['mention'][Mention.Name].length > b['mention'][Mention.Name].length) {
        return 1;
    }

    return -1;
}

function panToCoordinates(lat, lng) {
    map.setView([lat, lng], 14, { animation: true });
}

function computeQueryScore(query_ngrams, query, name) {
    name = removeDiacritics(name);
    query = removeDiacritics(query);
    match_score = 0.0;

    // score all common ngrams between names
    for (ngram_idx = 0; ngram_idx < query_ngrams.length; ngram_idx++) {
        if (name.includes(query_ngrams[ngram_idx])) {
            match_score += ((1 + query_ngrams[ngram_idx].length) / query.length) ** query_ngrams[ngram_idx].length;
        }
    }

    // skip if no matches have been found
    if (match_score < 0.01) {
        return match_score;
    }

    // extra points if place name starts the same way
    max_extra_points = 0;

    word_list = name.split(" ");
    for (word_idx = 0; word_idx < word_list.length; word_idx++) {
        char_idx = 0;
        while (char_idx < Math.min(query.length, word_list[word_idx].length) && word_list[word_idx][char_idx] === query[char_idx]) {
            char_idx++;
        }
        if (char_idx > max_extra_points) {
            max_extra_points = 1.4 * char_idx / word_list[word_idx].length;
        }
    }
    match_score += max_extra_points;

    return match_score
}

function create_result_template(mention) {
    var places = SETTLEMENTS;
    if (is_monastery(mention[Mention.Place_Id])) {
        places = MONASTERIES;
    }

    var reference_id = "reference" + mention[Mention.Place_Id];
    var latest_mention = get_latest_mentions(mention[Mention.Place_Id])[0];

    var html_content = '';
    html_content += '<div style = "cursor: pointer; margin-bottom: 10%; margin-left: 2%; width: 180px;" class="referenceContainer" id="' + reference_id + '"><h3 class="placeName">' + latest_mention[Mention.Name] + '</h3>';
    if (mention[Mention.Name] != latest_mention[Mention.Name]) {
        html_content += '<h4 style = "margin: 4%; font-weight: normal;">' + '<b>Denumire veche:</b> ' + mention[Mention.Name] + '</h4>';
    }
    html_content += '<h4 style = "margin: 4%; font-weight: normal;">' + '<b>Comună:</b> ' + places[latest_mention[Mention.Place_Id]][Place.Commune] + '</h4>';
    html_content += '<h4 style = "margin: 4%; font-weight: normal;">' + '<b>Județ:</b> ' + places[latest_mention[Mention.Place_Id]][Place.County] + '</h4>';

    // show current status
    switch (latest_mention[Mention.Place_Status]) {
        case "disbanded":
            html_content += '<h4 style = "margin: 4%; font-weight: normal;">Localitate dispărută.</h4>';
            break;
        case "united":
            html_content += '<h4 style = "margin: 4%; font-weight: normal;">Localitate comasată.</h4>';
            break;
    }

    // exact location not found
    if (latest_mention[Mention.Latitude] === null) {
        html_content += '<h4 style = "margin: 4%; padding-bottom: 4%; font-weight: normal;" >Locația exactă nu a putut fi identificată.</h4>';
    } else {
        html_content += '<h5 style = "margin: 4%; padding-bottom: 2%; font-weight: normal;" ></h5>';
    }

    html_content += '</div>';
    return html_content;
}

// look for another place in the same commune as place_id with coordinates
function search_for_neighbouring_place(place) {
    for (p_key in SETTLEMENTS) {
        if (SETTLEMENTS[p_key][Place.Commune] === place[Place.Commune] &&
            SETTLEMENTS[p_key][Place.County] === place[Place.County] &&
            SETTLEMENTS[p_key][Place.Latitude] != null) {

            //console.log(SETTLEMENTS[p_key]);
            //console.log(SETTLEMENTS[place_id]);
            another_option_found = true;
            break;
        }
    }
    if (another_option_found) {
        return p_key;
    }
    return null;
}

function update_clickable_results() {
    const mentionList = document.getElementById("searchResultsList");

    // get all reference ids for the results
    var references = [];
    for (idx = 0; idx < mentionList.childNodes.length; idx++) {
        references.push('reference' + SEARCH_RESULTS[idx]['mention'][Mention.Place_Id]);
    }

    // give each result a clickable function that pans the map to the place location
    for (idx in references) {
        var reference_id = references[idx];

        document.getElementById(reference_id).onclick = function (event) {
            // get place id from reference id
            var place_id = event.currentTarget.id.slice(9);
            var places = SETTLEMENTS;

            if (is_monastery(place_id)) {
                places = MONASTERIES;
            }

            // if place has no coordinates search for another place in the same commune with coordinates
            if (places[place_id][Place.Latitude] === null) {
                place_id = search_for_neighbouring_place(places[place_id]);

                // could not find an approximate location for place_id
                if (place_id == null) {
                    return;
                }

                // move map view to place coordinates
                panToCoordinates(SETTLEMENTS[place_id][Place.Latitude], SETTLEMENTS[place_id][Place.Longitude]);
                return;
            }

            // move map view to place coordinates
            panToCoordinates(places[place_id][Place.Latitude], places[place_id][Place.Longitude]);
        }
    }
}

function showSearchResults(query) {
    const mentionList = document.getElementById("searchResultsList");
    results = SEARCH_RESULTS.slice(mentionList.childNodes.length, mentionList.childNodes.length + 10);

    query = removeDiacritics(query);
    query_ngrams = generateNGrams(query);

    html_content = mentionList.innerHTML;

    // generate html templates
    for (idx in results) {
        html_content += create_result_template(results[idx]['mention']);
    }

    // update results list
    mentionList.innerHTML = html_content;

    // make search results clickable
    update_clickable_results();

    // make search panel visible
    document.getElementById("searchPanelContainer").style.display = "block";

    // make button for more results invisible if reached end of results
    if (SEARCH_RESULTS.length === mentionList.childNodes.length) {
        MORE_RESULTS_BUTTON.style.display = "none";
    }
}

function searchPlaces(query) {
    // do nothing if query too short
    if (query.length < 2) {
        return;
    }

    var query_ngrams = generateNGrams(removeDiacritics(query));

    var search_list = [];
    var mentions_list = [MENTIONS_SETTLEMENTS, MENTIONS_MONASTERIES];
    for (idx in mentions_list) {
        for (place_id in mentions_list[idx]) {

            // Put all mentions into a list
            placeMentions = get_place_mentions(place_id);

            // Sort mentions by decreasing year
            placeMentions = placeMentions.sort(function (a, b) { return b[Mention.Year] - a[Mention.Year]; });

            // Find best match among the previous names of the place
            best_variant = { 'score': null, 'mention': null };
            for (mention_idx in placeMentions) {
                place_name = placeMentions[mention_idx][Mention.Name];
                match_score = computeQueryScore(query_ngrams, query, place_name);

                // Set initial value for best_variant
                if (best_variant['score'] == null) {
                    best_variant = { 'score': match_score, 'mention': placeMentions[mention_idx] };
                }

                // Update best_variant with better match
                if (match_score > best_variant['score']) {
                    best_variant = { 'score': match_score, 'mention': placeMentions[mention_idx] }
                }
            }
            search_list.push(best_variant);
        }
    }

    search_list.sort(sortSearchResults);

    // empty search result list from last time
    while (SEARCH_RESULTS.length > 0) {
        SEARCH_RESULTS.pop();
    }

    for (idx in search_list) {
        SEARCH_RESULTS.push(search_list[idx]);
    }

    document.getElementById("searchPanel").scrollTop = 0;
    document.getElementById("searchResultsList").innerHTML = "";

    showSearchResults(query);
}
