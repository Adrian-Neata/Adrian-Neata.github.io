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

        if (mention.record.year != current_year) {
            current_year = mention.record.year;
            html_content += '<h2 class="yearSubtitle">' + current_year.toString() + '</h2><hr class="separatorLineYear">';
        }
        html_content += mention.getPanelHtml()
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

    // If latest mention shows place disappeared then return
    if (placeMentions[0].place_status != "active" && placeMentions[0].place_status != "founded") {
        closePanel();
        return;
    }

    // Add title the name of the place that is most recent to the selected year
    document.getElementById("placeName").textContent = placeMentions[0].name;

    // Add html code to show mentions
    const mentionList = document.getElementById("referenceList");
    mentionList.innerHTML = create_sidepanel_template(placeMentions);

    SIDEPANEL_PLACE = place_id;
    openPanel();
}