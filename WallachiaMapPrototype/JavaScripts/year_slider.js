// Define the checkpoint values
var SLIDER_CHECKPOINTS = new Set();

for (idx in RECORDS) {
    SLIDER_CHECKPOINTS.add(RECORDS[idx].year);
    //console.log(RECORDS[idx].toString());
}

SLIDER_CHECKPOINTS = Array.from(SLIDER_CHECKPOINTS);
SLIDER_CHECKPOINTS = SLIDER_CHECKPOINTS.sort(function (a, b) { return a - b; });
console.log(SLIDER_CHECKPOINTS);

YEAR_SLIDER.addEventListener('input', () => {
    const value = parseInt(YEAR_SLIDER.value);

    // Find the nearest checkpoint value
    const nearestCheckpoint = SLIDER_CHECKPOINTS.reduce((prev, curr) => {
        return (Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev);
    });

    // Set the slider value to the nearest checkpoint
    YEAR_SLIDER.value = nearestCheckpoint;

    // Update the displayed selected value
    YEAR_CONTAINER.textContent = nearestCheckpoint;
});

// Update side panel and markers when user changes year
YEAR_SLIDER.addEventListener("change", function () {
    PREV_YEAR_SLIDER_VALUE = YEAR_SLIDER_VALUE;
    YEAR_SLIDER_VALUE = YEAR_SLIDER.value;

    if (YEAR_SLIDER_VALUE > PREV_YEAR_SLIDER_VALUE) {
        YEAR_INCREASED = true;
    }

    updateMarkerPosition();

    // update sidepanel when year changes
    if (SIDEPANEL_PLACE != null) {
        openSidePanel(SIDEPANEL_PLACE);
    }

    // highlight markers if year increased
    if (YEAR_INCREASED) {
        highlightMarkers();
        YEAR_INCREASED = false;
    }

});