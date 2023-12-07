const SEARCH_RESULTS = [];

function handleKeyPressSearch(e) {
    // check if Enter key was pressed to proceed with the search
    if(e.keyCode === 13){
    	searchPlaces(document.getElementById("searchBar").value);
    }
	return false;
}

function generateNGrams(text) {
    ngrams = [];

    for (i=text.length; i > 0; i--) {
        for (j = 0; j < text.length - i; j++) {
            ngrams.push(text.slice(j, j+i+1));
        }
    }
  
    return ngrams;
}

function sortSearchResults(a, b) {
    if (a[0] < b[0]) {
        return 1;
    }

    if (a[0] > b[0]) {
        return -1;
    }

    if (mentions_places[a[1]][Place.Name].length > mentions_places[b[1]][Place.Name].length) {
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

function create_result_template(last_mention, old_name, reference_id) {
    html_content = '';
    html_content += '<div style = "cursor: pointer; margin-bottom: 10%; margin-left: 2%; width: 180px;" class="referenceContainer" id="' + reference_id + '"><h3 class="placeName">' + last_mention[Place.Name] + '</h3>';
    if (old_name != null) {
        html_content += '<h4 style = "margin: 4%; font-weight: normal;">' + '<b>Denumire veche:</b> ' + old_name + '</h4>';
    }
    html_content += '<h4 style = "margin: 4%; font-weight: normal;">' + '<b>Comună:</b> ' + places[last_mention[Place.Id]][Place1.Commune] + '</h4>';
    html_content += '<h4 style = "margin: 4%; font-weight: normal;">' + '<b>Județ:</b> ' + places[last_mention[Place.Id]][Place1.County] + '</h4>';

    // show current status
    switch(last_mention[Place.Status]) {
        case "disbanded": 
            html_content += '<h4 style = "margin: 4%; font-weight: normal;">Localitate dispărută.</h4>';
            break;
        case "united":
            html_content += '<h4 style = "margin: 4%; font-weight: normal;">Localitate comasată.</h4>';
            break;
    }

    // exact location not found
    if (last_mention[Place.Latitude] === null) {
        html_content += '<h4 style = "margin: 4%; padding-bottom: 4%; font-weight: normal;" >Locația exactă nu a putut fi identificată.</h4>';
    } else {
        html_content += '<h5 style = "margin: 4%; padding-bottom: 2%; font-weight: normal;" ></h5>';
    }

    html_content += '</div>';
    return html_content;
}

function showSearchResults(query) {
    const mentionList = document.getElementById("searchResultsList");
    results = SEARCH_RESULTS.slice(mentionList.childNodes.length, mentionList.childNodes.length + 10);

    query = removeDiacritics(query);
    query_ngrams = generateNGrams(query);

    html_content = mentionList.innerHTML;
    references = [];

    for (idx in results) {
        mention = mentions_places[results[idx][1]];

        // get all mentions of the place
        all_place_mentions = []
        for (mention_idx in mentions_places) {
            if (mentions_places[mention_idx][Place.Id] === mention[Place.Id]) {
                all_place_mentions.push(mentions_places[mention_idx]);
            }
        }

        // sort them with the latest mention as first in the list
        all_place_mentions.sort((a,b) => b[Place.Year] - a[Place.Year]);
        all_place_mentions = all_place_mentions.map((x) => [x, computeQueryScore(query_ngrams, query, x[Place.Name])]);

        // check if any old name matches the query better than the current one
        old_name = [null, 0.1];
        for (mention_idx in all_place_mentions) {
            if (mention_idx == 0) {
                continue;
            }
            if (all_place_mentions[mention_idx][1] - all_place_mentions[0][1] > old_name[1]) {
                old_name = [all_place_mentions[mention_idx][0][Place.Name], all_place_mentions[mention_idx][1] - all_place_mentions[0][1]];
            } 
        }
        all_place_mentions = all_place_mentions.map((x) => x[0]);

        // generate html template
        reference_id = "reference" + results[idx][1];
        references.push(reference_id);
        html_content += create_result_template(all_place_mentions[0], old_name[0], reference_id);
    }

    // update results list
    mentionList.innerHTML = html_content;
    
    for (idx in references) {
        reference_id = references[idx];

        document.getElementById(reference_id).onclick = function(event) {
            idx = parseInt(event.currentTarget.id.slice(9));
            mention = mentions_places[idx];
            if (mention[Place.Latitude] === null) {
                for (p_key in places) {
                    if (places[p_key][Place1.Commune] === places[mention[Place.Id]][Place1.Commune] && places[p_key][Place1.County] === places[mention[Place.Id]][Place1.County] && p_key != mention[Place.Id]) {
                        console.log(places[p_key]);
                        console.log(places[mention[Place.Id]]);
                        break;
                    }
                }
                panToCoordinates(places[p_key][Place1.Latitude], places[p_key][Place1.Longitude]); 
            } else {
                panToCoordinates(mention[Place.Latitude], mention[Place.Longitude]); 
            }
        }
    }

    document.getElementById("searchPanelContainer").style.display = "block";
}

function searchPlaces(query) {
    // do nothing if no query
    if (query.length < 2) {
        return;
    }

    query_ngrams = generateNGrams(removeDiacritics(query));
    // console.log(query);
    // console.log(ngrams);

    search_list = [];
    for (idx = 0; idx < mentions_places.length; idx++) {
        place_name = mentions_places[idx][Place.Name];
        match_score = computeQueryScore(query_ngrams, query, place_name);
        search_list.push([match_score, idx]);
    }

    search_list.sort(sortSearchResults);
    //console.log(search_list);
    place_id_set = new Set();

    // empty search result list from last time
    while(SEARCH_RESULTS.length > 0) {
        SEARCH_RESULTS.pop();
    }

    for (idx in search_list) {
        place_id = mentions_places[search_list[idx][1]][Place.Id]
        if (place_id_set.has(place_id)) {
            continue
        } else {
            place_id_set.add(place_id);
            SEARCH_RESULTS.push(search_list[idx]);
        }
    }
    //console.log(results);

    document.getElementById("searchPanel").scrollTop = 0;
    document.getElementById("searchResultsList").innerHTML = "";

    showSearchResults(query);
}
