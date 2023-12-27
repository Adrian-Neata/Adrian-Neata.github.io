// Define the checkpoint values
var SLIDER_CHECKPOINTS = new Set();

for (idx in mentions_places) {
    SLIDER_CHECKPOINTS.add(mentions_places[idx][Mention.Year]);
}
for (idx in mentions_monasteries) {
    SLIDER_CHECKPOINTS.add(mentions_monasteries[idx][Mention.Year]);
}

SLIDER_CHECKPOINTS = Array.from(SLIDER_CHECKPOINTS);
SLIDER_CHECKPOINTS = SLIDER_CHECKPOINTS.sort(function (a, b) { return a - b; });
console.log(SLIDER_CHECKPOINTS);

slider.addEventListener('input', () => {
    const value = parseInt(slider.value);

    // Find the nearest checkpoint value
    const nearestCheckpoint = SLIDER_CHECKPOINTS.reduce((prev, curr) => {
        return (Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev);
    });

    // Set the slider value to the nearest checkpoint
    slider.value = nearestCheckpoint;

    // Update the displayed selected value
    yearOutput.textContent = nearestCheckpoint;
});