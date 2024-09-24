
// test if Rayons_To_Region_1956 covers all region names between 1950 and 1968
for (place_id in MENTIONS) {
    for (mention_idx in MENTIONS[place_id]) {
        mention = MENTIONS[place_id][mention_idx];

        if (1950 < mention.record.year  && mention.record.year < 1968 ) {
            if (!(mention.county in Rayons_To_Region_1956)) {
                console.log(mention);
            }
        }
    }
}

// test if COUNTY_COLORS_1968_2021 covers all county names after 1968
for (place_id in MENTIONS) {
    for (mention_idx in MENTIONS[place_id]) {
        mention = MENTIONS[place_id][mention_idx];
        if (mention.record.id == 23) {
            continue;
        }
        if (mention.record.year > 1968) {
            if (!(mention.county in COUNTY_COLORS_1968_2021)) {
                console.log(mention);
            }
        }
    }
}

// test if COUNTY_COLORS_BEFORE_1950 covers all county names before 1950
for (place_id in MENTIONS) {
    for (mention_idx in MENTIONS[place_id]) {
        mention = MENTIONS[place_id][mention_idx];
        if (mention.record.year < 1950) {
            if (mention.county != null && !(mention.county in COUNTY_COLORS_BEFORE_1950)) {
                console.log(mention);
            }
        }
    }
}

// test if all mentions of record 23 (TODO) are not active
for (place_id in MENTIONS) {
    for (mention_idx in MENTIONS[place_id]) {
        mention = MENTIONS[place_id][mention_idx];
        if (mention.record.id != 23) {
            continue;
        }
        if (mention.place_status == "active") {
            console.log(mention);
        }
    }
}

// test if any mention doesn't have a valid record id
for (place_id in MENTIONS) {
    for (mention_idx in MENTIONS[place_id]) {
        mention = MENTIONS[place_id][mention_idx];
        if (!mention.record.id in RECORDS) {
            console.log(mention);
        }
    }
}