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