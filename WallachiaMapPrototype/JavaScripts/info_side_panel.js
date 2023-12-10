// Get references to the open and close buttons and the side panel
const openButton = document.getElementById("openButton");
const closeButton = document.getElementById("closeButton");
const sidePanel = document.getElementById("sidePanel");

// Function to open the side panel
function openPanel() {
    sidePanel.style.right = "0";
}

// Function to close the side panel
function closePanel() {
    sidePanel.style.right = "-250px";
}

// Attach click event listeners to open and close buttons
closeButton.addEventListener("click", closePanel);

function openSidePanel(place) {
    // Open side panel
    selected_place = place;
    const sidePanel = document.getElementById("sidePanel");
    sidePanel.style.right = "0px";

    var mentions = mentions_places;

    if (place[Mention.Place_Type] == Place_Type.Monastery) {
        mentions = mentions_monasteries;
    }
    // Get all mentions of the place before the given year
    placeMentions = [];
    for (idx in mentions) {
        // Confirm place id for mention
        if (mentions[idx][Mention.Place_Id] != place[Mention.Place_Id]) {
            continue;
        }
        // Ignore mentions after the given year
        if (document.getElementById("yearRange").value < mentions[idx][Mention.Year]) {
            continue;
        }

        placeMentions.push([mentions[idx], records[mentions[idx][Mention.Record_Id] - 1][Record.Description]]);
    }

    // Sort mentions by decreasing year
    placeMentions = placeMentions.sort(function (a, b) { return b[0][Mention.Year] - a[0][Mention.Year]; });

    // Corner case when sidepanel is open and the year changes 
    // Close sidepanel if place hadn't previously been mentioned
    if (placeMentions.length == 0) {
        sidePanel.style.right = "-250px";
        return;
    }

    // Add title the name of the place that is most recent to the selected year
    document.getElementById("placeName").textContent = placeMentions[0][0][Mention.Name];

    // If latest mention shows place disappeared then close sidepanel
    if (placeMentions[0][0][Mention.Place_Status] != "active") {
        sidePanel.style.right = "-250px";
        return;
    }

    // Add html code to show mentions
    current_year = null;
    html_content = "";
    for (idx in placeMentions) {
        mention = placeMentions[idx][0];
        record_description = placeMentions[idx][1];
        if (mention[Mention.Year] != current_year) {
            current_year = mention[Mention.Year];
            html_content += '<h2 class="yearSubtitle">' + current_year.toString() + '</h2><hr class="separatorLineYear">';
        }
        html_content += '<div class="referenceContainer"><h3 class="placeName">' + mention[Mention.Name] + '</h3>';
        if (mention[Mention.Commune] != null) {
            html_content += '<h4 style = "margin: 4%; font-weight: normal;">' + '<b>Comună:</b> ' + mention[Mention.Commune] + '</h4>';

        }
        if (mention[Mention.County] != null) {
            if (![5, 8].includes(mention[Mention.Record_Id])) {
                html_content += '<h4 style = "margin: 4%; font-weight: normal;">' + '<b>Județ:</b> ' + mention[Mention.County] + '</h4>';
            } else {
                html_content += '<h4 style = "margin: 4%; font-weight: normal;">' + '<b>Raion:</b> ' + mention[Mention.County] + '</h4>';
                html_content += '<h4 style = "margin: 4%; font-weight: normal;">' + '<b>Regiune:</b> ' + Rayons_To_Region_1956[mention[Mention.County]] + '</h4>';
            }
        }
        html_content += '<h4 class="recordDescription">' + record_description + '</h4></div>';
    }
    const mentionList = document.getElementById("referenceList");
    mentionList.innerHTML = html_content;
}