class Record {
    constructor(id, year, description, link) {
        this.id = id;
        this.year = year;
        this.description = description;
        this.link = link;
    }
}

class MedievalDocuments {
    constructor(id, year, description, language, material, ruler, place_of_issue, country_of_issue, source, author, link) {
        this.id = id;
        this.year = year;
        this.description = description;
        this.language = language;
        this.material = material;
        this.ruler = ruler;
        this.place_of_issue = place_of_issue;
        this.country_of_issue = country_of_issue;
        this.source = source;
        this.author = author;
        this.link = link;
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
    
    getPanelHtml() {
        throw new Error("Abstract method getPanelHtml() must be implemented in a subclass");
    }

    getSearchHtml() {
        
        var reference_id = "reference" + this.place.id;
        var latest_mention = get_latest_mentions(this.place.id)[0];

        var html_content = '';
        html_content += '<div style = "cursor: pointer; margin-bottom: 10%; margin-left: 2%; width: 180px;" class="referenceContainer" id="' + reference_id + '"><h3 class="placeName">' + SETTLEMENTS[this.place.id].name + '</h3>';
        if (this.name != latest_mention.name) {
            html_content += '<h4 style = "margin: 4%; font-weight: normal;">' + '<b>Denumire veche:</b> ' + this.name + '</h4>';
        }
        html_content += '<h4 style = "margin: 4%; font-weight: normal;">' + '<b>Comună:</b> ' + SETTLEMENTS[this.place.id].commune + '</h4>';
        html_content += '<h4 style = "margin: 4%; font-weight: normal;">' + '<b>Județ:</b> ' + SETTLEMENTS[this.place.id].county + '</h4>';

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
    
}

class ModernMention extends Mention {
    constructor(record, place, name, commune, county, country, latitude, longitude, place_status, notes, reasoning) {
        super(record, place, name, county, country, latitude, longitude, place_status, notes, reasoning);
        this.commune = commune;
    }

    getPanelHtml() {
        var html_content = "";
        var fieldHtml = '<h4 style = "margin: 4%; font-weight: normal;">';
        html_content += '<div class="referenceContainer"><h3 class="placeName">' + this.name + '</h3>';

        if (this.county != null) {
            if (this.record.year < 1950 || this.record.year >= 1968) {
                if (this.country === "Moldova") {
                    html_content += fieldHtml + '<b>Ținut:</b> ' + this.county + '</h4>';
                } else if (this.country === "Imperiul Otoman") {
                    if (this.county === "Silistra") {
                        html_content += fieldHtml + '<b>Sangeac:</b> ' + this.county + '</h4>';
                    } else {
                        html_content += fieldHtml + '<b>Raia:</b> ' + this.county + '</h4>';
                    }
                } else {
                    html_content += fieldHtml + '<b>Județ:</b> ' + this.county + '</h4>';
                }
            } else {
                html_content += fieldHtml + '<b>Raion:</b> ' + this.county + '</h4>';
                html_content += fieldHtml + '<b>Regiune:</b> ' + Rayons_To_Region_1956[this.county] + '</h4>';
            }
        }

        if (this.notes === null && this.reasoning === null) {
            html_content += '<h4 class="recordDescription">' + '<b>Sursă:</b> ' + this.record.description + '</h4></div>';
            return html_content;
        } 
        
        html_content += fieldHtml + '<b>Sursă:</b> ' + this.record.description + '</h4>';

        if (this.notes !== null && this.reasoning === null){
            html_content += '<h4 class="recordDescription">' + '<b>Descriere:</b> ' + this.notes + '</h4></div>';
            return html_content;
        }

        if (this.notes === null && this.reasoning !== null){
            html_content += '<h4 class="recordDescription">' + '<b>Observații:</b> ' + this.reasoning + '</h4></div>';
            return html_content;
        }

        if (this.notes !== null && this.reasoning !== null){
            html_content += fieldHtml + '<b>Descriere:</b> ' + this.notes + '</h4>';
            html_content += '<h4 class="recordDescription">' + '<b>Observații:</b> ' + this.reasoning + '</h4></div>';
            return html_content;

        }

        return html_content;
    }

    getCommune() {
        return this.commune;
    }
}

class MedievalMention extends Mention {
    constructor(record, place, name, county, country, latitude, longitude, place_status, notes, reasoning) {
        super(record, place, name, county, country, latitude, longitude, place_status, notes, reasoning);
    }

    getPanelHtml() {
        var html_content = "";
        var fieldHtml = '<h4 style = "margin: 4%; font-weight: normal;">';
        html_content += '<div class="referenceContainer"><h3 class="placeName">' + this.name + '</h3>';

        if (this.county != null) {
            if (this.record.year < 1950 || this.record.year >= 1968) {
                if (this.country === "Moldova") {
                    html_content += fieldHtml + '<b>Ținut:</b> ' + this.county + '</h4>';
                } else if (this.country === "Imperiul Otoman") {
                    if (this.county === "Silistra") {
                        html_content += fieldHtml + '<b>Sangeac:</b> ' + this.county + '</h4>';
                    } else {
                        html_content += fieldHtml + '<b>Raia:</b> ' + this.county + '</h4>';
                    }
                } else {
                    html_content += fieldHtml + '<b>Județ:</b> ' + this.county + '</h4>';
                }
            } else {
                html_content += fieldHtml + '<b>Raion:</b> ' + this.county + '</h4>';
                html_content += fieldHtml + '<b>Regiune:</b> ' + Rayons_To_Region_1956[this.county] + '</h4>';
            }
        }

        if (this.notes === null && this.reasoning === null) {
            html_content += '<h4 class="recordDescription">' + '<b>Sursă:</b> ' + this.record.description + '</h4></div>';
            return html_content;
        } 
        
        html_content += fieldHtml + '<b>Sursă:</b> ' + this.record.description + '</h4>';

        if (this.notes !== null && this.reasoning === null){
            html_content += '<h4 class="recordDescription">' + '<b>Descriere:</b> ' + this.notes + '</h4></div>';
            return html_content;
        }

        if (this.notes === null && this.reasoning !== null){
            html_content += '<h4 class="recordDescription">' + '<b>Observații:</b> ' + this.reasoning + '</h4></div>';
            return html_content;
        }

        if (this.notes !== null && this.reasoning !== null){
            html_content += fieldHtml + '<b>Descriere:</b> ' + this.notes + '</h4>';
            html_content += '<h4 class="recordDescription">' + '<b>Observații:</b> ' + this.reasoning + '</h4></div>';
            return html_content;

        }

        return html_content;
    }

    getCommune() {
        return null;
    }
}