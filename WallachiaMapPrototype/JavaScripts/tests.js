// test if Rayons_To_Region_1956 covers all region names between 1950 and 1968
for (idx in mentions_places) {
    mention = mentions_places[idx];
    if (mention[Mention.Record_Id] === 5) {
        if (!(mention[Mention.County] in Rayons_To_Region_1956)) {
            console.log(mention);
        }
    }
}

// test if fashionableColors1965 covers all county names after 1968
for (idx in mentions_places) {
    mention = mentions_places[idx];
    if (mention[Mention.Record_Id] != 23 && mention[Mention.Year] > 1968) {
        if (!(mention[Mention.County] in fashionableColors1965)) {
            console.log(mention);
        }
    }
}

// test if fashionableColors1925 covers all county names before 1950
for (idx in mentions_places) {
    mention = mentions_places[idx];
    if (mention[Mention.Record_Id] != 23 && mention[Mention.Year] < 1950) {
        if (!(mention[Mention.County] in fashionableColors1925)) {
            console.log(mention);
        }
    }
}

// test if all mentions of record 23 (TODO) are not active
for (idx in mentions_places) {
    mention = mentions_places[idx];
    if (mention[Mention.Record_Id] === 23 && mention[Mention.Place_Status] == "active") {
        console.log(mention);
    }
}