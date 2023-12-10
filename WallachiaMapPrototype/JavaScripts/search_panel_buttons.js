const CLOSE_SEARCH_RESULTS_BUTTON = document.getElementById("resultsCloseButton");
const MORE_RESULTS_BUTTON = document.getElementById("moreResultsButton");
const SEARCH_RESULTS_PANEL = document.getElementById("searchPanelContainer");

// Function to close the search panel
function closeSearchPanel() {
    SEARCH_RESULTS_PANEL.style.display = "none";
}

// Function to load another 10 search results
function showMoreResults() {
    showSearchResults(document.getElementById("searchBar").value);
}

// Attach click event listeners to open and close buttons
CLOSE_SEARCH_RESULTS_BUTTON.addEventListener("click", closeSearchPanel);
MORE_RESULTS_BUTTON.addEventListener("click", showMoreResults);