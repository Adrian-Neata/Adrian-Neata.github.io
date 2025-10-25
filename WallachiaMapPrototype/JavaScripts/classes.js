
class MedievalDocumentCollection {
    constructor(id, title, author, year, link) {
        this.id = id;
        this.title = title;
        this.author = author;
        this.year = year;
        this.link = link;
    }

    toString() {
        return `MedievalDocumentCollection id: ${this.id}, Title: ${this.title}, Author: ${this.author}, Year: ${this.year}, Link: ${this.link}`;
    }
}

class Record {
    constructor(id, year, description, link, date) {
        this.id = id;
        this.year = year;
        this.description = description;
        this.link = link;
    }

    toString() {
        return `Record id: ${this.id}, Year: ${this.year}, Description: ${this.description}, Link: ${this.link}`;
    }
}

class MedievalDocuments {
    constructor(id, year, description, language, material, status, ruler, issuer, place_of_issue, country_of_issue, collection, date) {
        this.id = id;
        this.year = year;
        this.description = description;
        this.language = language;
        this.material = material;
        this.status = status;
        this.ruler = ruler;
        this.issuer = issuer;
        this.place_of_issue = place_of_issue;
        this.country_of_issue = country_of_issue;
        this.collection = collection;
        this.date = date;
    }

    toString() {
        return `MedievalDocuments id: ${this.id}, Year: ${this.year}, Description: ${this.description}, Language: ${this.language}, Material: ${this.material}, Status: ${this.status}, Ruler: ${this.ruler}, Issuer: ${this.issuer}, Place of Issue: ${this.place_of_issue}, Country of Issue: ${this.country_of_issue}, Collection: ${this.collection}, Date: ${this.date}`;
    }
}

class Place {
    constructor(id, name, commune, county, country, latitude, longitude, type, approximate_location) {
        this.id = id;
        this.name = name;
        this.commune = commune;
        this.county = county;
        this.country = country;
        this.latitude = latitude;
        this.longitude = longitude;
        this.type = type;
        this.approximate_location = approximate_location;
    }

    toString() {
        return `Place id: ${this.id}, Name: ${this.name}, Commune: ${this.commune}, County: ${this.county}, Country: ${this.country}, Latitude: ${this.latitude}, Longitude: ${this.longitude}, Type: ${this.type}, Approximate Location: ${this.approximate_location}`;
    }
}
  
class Mention {
    constructor(record, place, name, county, country, latitude, longitude, place_status, notes, reasoning) {
        this.record = record;
        this.place = place;
        this.name = name;
        this.county = county;
        this.country = country;
        this.latitude = latitude;
        this.longitude = longitude;
        this.place_status = place_status;
        this.notes = notes;
        this.reasoning = reasoning;
    }
    
    addField(label, value, last = false) {
        if (!value) return "";
        const fieldHtml = '<h4 style="margin: 4%; font-weight: normal;">';
        return last
            ? `<h4 class="recordDescription"><b>${label}:</b> ${escapeHtml(value)}</h4></div>`
            : `${fieldHtml}<b>${label}:</b> ${escapeHtml(value)}</h4>`;
    }

    addCountyField(year, county, country) {
        var html = '';
        if (year < 1950 || year >= 1968) {
            if (country === "Moldova") {
                html += this.addField("Ținut", county);
            } else if (this.country === "Imperiul Otoman") {
                html += this.addField(county === "Silistra" ? "Sangeac" : "Raia", county);
            } else {
                html += this.addField("Județ", county);
            }
        } else {
            html += this.addField("Raion", county);
            html += this.addField("Regiune", Rayons_To_Region_1956[county]);
        }
        return html;
    }

    getPanelHtml() {
        throw new Error("Abstract method getPanelHtml() must be implemented in a subclass");
    }

    getSearchHtml() {
        
        var reference_id = "reference" + this.place.id;
        var latest_mention = get_latest_mentions(this.place.id)[0];
        var earliest_mention = get_earliest_mentions(this.place.id)[0];

        var html_content = '';
        html_content += '<div style = "cursor: pointer; margin-bottom: 10%; margin-left: 2%; width: 210px;" class="referenceContainer" id="' + reference_id + '"><h3 class="placeName">' + escapeHtml(SETTLEMENTS[this.place.id].name) + '</h3>';
        if (this.name != latest_mention.name) {
            html_content += '<h4 style = "margin: 4%; font-weight: normal;">' + '<b>Denumire veche:</b> ' + escapeHtml(this.name) + '</h4>';
        }
        html_content += '<h4 style = "margin: 4%; font-weight: normal;">' + '<b>Comună:</b> ' + escapeHtml(SETTLEMENTS[this.place.id].commune) + '</h4>';
        html_content += '<h4 style = "margin: 4%; font-weight: normal;">' + '<b>Județ:</b> ' + escapeHtml(SETTLEMENTS[this.place.id].county) + '</h4>';

        var active_period = "";
        if (earliest_mention.record.id == 23) {
            active_period += "??? - ";
        } else {
            active_period += earliest_mention.record.year + " - ";
        }
        if (latest_mention.record.id == 23) {
            active_period += "???";
        } else if (latest_mention.record.id == 3) {
            active_period += "prezent";
        } else {
            active_period += latest_mention.record.year;
        }

        html_content += '<h4 style = "margin: 4%; font-weight: normal;">' + '<b>Perioadă:</b> ' + escapeHtml(active_period) + '</h4>';

        // show current status
        switch (latest_mention.place_status) {
            case "disbanded":
                html_content += '<h4 style = "margin: 4%; font-weight: normal;">Localitate dispărută.</h4>';
                break;
            case "united":
                html_content += '<h4 style = "margin: 4%; font-weight: normal;">Localitate comasată.</h4>';
                break;
        }

        // exact location not found
        if (latest_mention.latitude === null) {
            html_content += '<h4 style = "margin: 4%; padding-bottom: 4%; font-weight: normal;" >Locația exactă nu a putut fi identificată.</h4>';
        } else {
            html_content += '<h5 style = "margin: 4%; padding-bottom: 2%; font-weight: normal;" ></h5>';
        }

        html_content += '</div>';
        return html_content;
    }

    getCommune() {
        throw new Error("Abstract method getCommune() must be implemented in a subclass");
    }
    
    toString() {
        return `Mention Record: ${this.record}, Place: ${this.place}, Name: ${this.name}, County: ${this.county}, Country: ${this.country}, Latitude: ${this.latitude}, Longitude: ${this.longitude}, Place Status: ${this.place_status}, Notes: ${this.notes}, Reasoning: ${this.reasoning}`;
    }
}

class ModernMention extends Mention {
    constructor(record, place, name, commune, county, country, latitude, longitude, place_status, notes, reasoning) {
        super(record, place, name, county, country, latitude, longitude, place_status, notes, reasoning);
        this.commune = commune;
    }

    getPanelHtml() {
        let html = `<div class="referenceContainer"><h3 class="placeName">${escapeHtml(this.name)}</h3>`;

        // Commune
        html += this.addField("Comună", this.commune);

        // County / Region
        if (this.county) {
            html += this.addCountyField(this.record.year, this.county, this.country);
        }

        // Collect remaining fields in order
        const fields = [
            { label: "Sursă", value: this.record.description },
            { label: "Descriere", value: this.notes },
            { label: "Observații", value: this.reasoning }
        ].filter(f => f.value != null);

        // Append them, marking the last one correctly
        fields.forEach((f, i) => {
            const last = i === fields.length - 1;
            html += this.addField(f.label, f.value, last);
        });

        return html;
    }


    getCommune() {
        return this.commune;
    }

    toString() {
        return `ModernMention Record: ${this.record}, Place: ${this.place}, Name: ${this.name}, Commune: ${this.commune}, County: ${this.county}, Country: ${this.country}, Latitude: ${this.latitude}, Longitude: ${this.longitude}, Place Status: ${this.place_status}, Notes: ${this.notes}, Reasoning: ${this.reasoning}`;
    }
}

class MedievalMention extends Mention {
    constructor(record, place, name, county, country, latitude, longitude, place_status, notes, reasoning) {
        super(record, place, name, county, country, latitude, longitude, place_status, notes, reasoning);
    }

    getPanelHtml() {
        let html = `<div class="referenceContainer"><h3 class="placeName">${escapeHtml(this.name)}</h3>`;

        // Date
        if (this.record.date) {
            const dateVal = this.record.date.includes(";") ? this.record.date.split(";")[1] : this.record.date;
            html += this.addField("Dată", dateVal);
        }

        // County / Region
        if (this.county) {
            html += this.addCountyField(this.record.year, this.county, this.country);
        }

        // Collect remaining fields in order
        const fields = [
            { label: "Sursă", value: this.record.description },
            { label: "Descriere", value: this.notes },
            { label: "Observații", value: this.reasoning }
        ].filter(f => f.value != null);

        // Append them, making the last one use recordDescription
        fields.forEach((f, i) => {
            const last = i === fields.length - 1;
            html += this.addField(f.label, f.value, last);
        });

        return html;
    }

    getCommune() {
        return null;
    }

    toString() {
        return `MedievalMention Record: ${this.record}, Place: ${this.place}, Name: ${this.name}, County: ${this.county}, Country: ${this.country}, Latitude: ${this.latitude}, Longitude: ${this.longitude}, Place Status: ${this.place_status}, Notes: ${this.notes}, Reasoning: ${this.reasoning}`;
    }
}

class MedievalMentionMonastery extends MedievalMention {
    constructor(record, place, name, county, country, latitude, longitude, place_status, hierarch, notes, reasoning) {
        super(record, place, name, county, country, latitude, longitude, place_status, notes, reasoning);
        this.hierarch = hierarch;
    }

    getPanelHtml() {
        let html = `<div class="referenceContainer"><h3 class="placeName">${escapeHtml(this.name)}</h3>`;

        // Date
        if (this.record.date) {
            const dateVal = this.record.date.includes(";") ? this.record.date.split(";")[1] : this.record.date;
            html += this.addField("Dată", dateVal);
        }

        // County / Region
        if (this.county) {
            html += this.addCountyField(this.record.year, this.county, this.country);
        }

        // Build ordered fields for the end
        const fields = [
            { label: "Sursă", value: this.record.description },
            { label: "Cap bisericesc", value: this.hierarch },
            { label: "Descriere", value: this.notes },
            { label: "Observații", value: this.reasoning }
        ].filter(f => f.value != null);

        // Append fields with correct "last" formatting
        fields.forEach((f, i) => {
            const last = i === fields.length - 1;
            html += this.addField(f.label, f.value, last);
        });

        return html;
    }

    getCommune() {
        return null;
    }

    toString() {
        return `MedievalMention Record: ${this.record}, Place: ${this.place}, Name: ${this.name}, County: ${this.county}, Country: ${this.country}, Latitude: ${this.latitude}, Longitude: ${this.longitude}, Place Status: ${this.place_status}, Hierarch: ${this.hierarch}, Notes: ${this.notes}, Reasoning: ${this.reasoning}`;
    }
}