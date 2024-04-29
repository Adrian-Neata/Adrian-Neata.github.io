// Get references to the open and close buttons and the side panel
const SIDEPANEL_CLOSE_BUTTON = document.getElementById("closeButton");
const SIDEPANEL = document.getElementById("sidePanel");

// Function to open the side panel
function openPanel() {
    SIDEPANEL.style.right = "0";
}

// Function to close the side panel
function closePanel() {
    SIDEPANEL_PLACE = null;
    SIDEPANEL.style.right = "-250px";
}

// Attach click event listeners to open and close buttons
SIDEPANEL_CLOSE_BUTTON.addEventListener("click", closePanel);

function create_sidepanel_template(placeMentions) {
    var current_year = null;
    var html_content = "";

    for (idx in placeMentions) {
        var mention = placeMentions[idx];
        var record_description = RECORDS[mention[Mention.Record_Id]][Record.Description];
        if (mention[Mention.Year] != current_year) {
            current_year = mention[Mention.Year];
            html_content += '<h2 class="yearSubtitle">' + current_year.toString() + '</h2><hr class="separatorLineYear">';
        }
        html_content += '<div class="referenceContainer"><h3 class="placeName">' + mention[Mention.Name] + '</h3>';
        if (mention[Mention.Commune] != null) {
            html_content += '<h4 style = "margin: 4%; font-weight: normal;">' + '<b>Comună:</b> ' + mention[Mention.Commune] + '</h4>';

        }
        if (mention[Mention.County] != null) {
            if (mention[Mention.Year] < 1950 || mention[Mention.Year] >= 1968) {
                if (mention[Mention.Country] === "Moldova") {
                    html_content += '<h4 style = "margin: 4%; font-weight: normal;">' + '<b>Ținut:</b> ' + mention[Mention.County] + '</h4>';
                } else {
                    html_content += '<h4 style = "margin: 4%; font-weight: normal;">' + '<b>Județ:</b> ' + mention[Mention.County] + '</h4>';
                }
            } else {
                html_content += '<h4 style = "margin: 4%; font-weight: normal;">' + '<b>Raion:</b> ' + mention[Mention.County] + '</h4>';
                html_content += '<h4 style = "margin: 4%; font-weight: normal;">' + '<b>Regiune:</b> ' + Rayons_To_Region_1956[mention[Mention.County]] + '</h4>';
            }
        }
        html_content += '<h4 class="recordDescription">' + record_description + '</h4></div>';
    }
    return html_content;
}

function openSidePanel(place_id) {

    // Get all mentions of the place before the given year
    var placeMentions = get_place_mentions(place_id, null, YEAR_SLIDER_VALUE);

    // Corner case when sidepanel is open and the year changes 
    // Return if place hadn't previously been mentioned
    if (placeMentions.length == 0) {
        closePanel();
        return;
    }

    // Sort mentions latest to earliest
    placeMentions = placeMentions.sort(function (a, b) { return b[Mention.Year] - a[Mention.Year]; });

    // If latest mention shows place disappeared then return
    if (placeMentions[0][Mention.Place_Status] != "active" && placeMentions[0][Mention.Place_Status] != "founded") {
        closePanel();
        return;
    }

    // Add title the name of the place that is most recent to the selected year
    document.getElementById("placeName").textContent = placeMentions[0][Mention.Name];

    // Add html code to show mentions
    const mentionList = document.getElementById("referenceList");
    mentionList.innerHTML = create_sidepanel_template(placeMentions);

    SIDEPANEL_PLACE = place_id;
    openPanel();
}