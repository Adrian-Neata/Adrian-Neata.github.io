// test if Rayons_To_Region_1956 covers all region names between 1950 and 1968
for (place_id in MENTIONS_SETTLEMENTS) {
    mentions_dict = MENTIONS_SETTLEMENTS[place_id];
    for (record_id in mentions_dict) {
        mention = mentions_dict[record_id];
        if (1950 < mention[Mention.Year]  && mention[Mention.Year] < 1968 ) {
            if (!(mention[Mention.County] in Rayons_To_Region_1956)) {
                console.log(mention);
            }
        }
    }
}

// test if COUNTY_COLORS_1968_2021 covers all county names after 1968
for (place_id in MENTIONS_SETTLEMENTS) {
    mentions_dict = MENTIONS_SETTLEMENTS[place_id];
    for (record_id in mentions_dict) {
        if (record_id == 23) {
            continue;
        }
        mention = mentions_dict[record_id];
        if (mention[Mention.Year] > 1968) {
            if (!(mention[Mention.County] in COUNTY_COLORS_1968_2021)) {
                console.log(mention);
            }
        }
    }
}

// test if COUNTY_COLORS_BEFORE_1950 covers all county names before 1950
for (place_id in MENTIONS_SETTLEMENTS) {
    mentions_dict = MENTIONS_SETTLEMENTS[place_id];
    for (record_id in mentions_dict) {
        mention = mentions_dict[record_id];
        if (mention[Mention.Year] < 1950) {
            if (!(mention[Mention.County] in COUNTY_COLORS_BEFORE_1950)) {
                console.log(mention);
            }
        }
    }
}

// test if all mentions of record 23 (TODO) are not active
for (place_id in MENTIONS_SETTLEMENTS) {
    mentions_dict = MENTIONS_SETTLEMENTS[place_id];
    if (23 in mentions_dict) {
        if (mentions_dict[23][Mention.Place_Status] == "active") {
            console.log(mentions_dict[23]);
        }
    }
}