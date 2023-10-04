// Define the checkpoint values
var checkpoints = new Set();
for (idx in mentions) {
    checkpoints.add(mentions[idx][Place.Year]);
}
checkpoints = Array.from(checkpoints);
checkpoints = checkpoints.sort(function (a, b) { return a - b; });
console.log(checkpoints);

slider.addEventListener('input', () => {
    const value = parseInt(slider.value);
    
    // Find the nearest checkpoint value
    const nearestCheckpoint = checkpoints.reduce((prev, curr) => {
        return (Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev);
    });

    // Set the slider value to the nearest checkpoint
    slider.value = nearestCheckpoint;

    // Update the displayed selected value
    yearOutput.textContent = nearestCheckpoint;
});