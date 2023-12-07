const closeSearchResultsButton = document.getElementById("resultsCloseButton");
const moreResultsButton = document.getElementById("moreResultsButton");
const searchResultsPanel = document.getElementById("searchPanelContainer");

// Function to close the search panel
function closeSearchPanel() {
    searchResultsPanel.style.display = "none";
}

// Function to load another 10 search results
function showMoreResults() {
    showSearchResults(document.getElementById("searchBar").value);
}

// Attach click event listeners to open and close buttons
closeSearchResultsButton.addEventListener("click", closeSearchPanel);
moreResultsButton.addEventListener("click", showMoreResults);