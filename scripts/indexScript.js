window.addEventListener('load', pageLoad);

function pageLoad() {

  const urlParams = new URLSearchParams(window.location.search),
        year = urlParams.get("year"),
        resultsContainer = document.getElementById('resultsContainer'),
        noResultsContainer = document.getElementById('noResultsContainer'),
        resultsFilePath = `data/${year}/results.json`;

  document.getElementById('headerIframe').src = `shared/header.html?year=${year}`;

  fetch(resultsFilePath).then(response => {
    
    if (response.ok) {
      resultsContainer.style.display = "block";
      noResultsContainer.style.display = "none";
    } else {
      resultsContainer.style.display = "none";
      noResultsContainer.style.display = "block";
    }

  }).catch(error => {

    console.error(`Error checking file: ${resultsFilePath}`, error);
    resultsContainer.style.display = "none";
    noResultsContainer.style.display = "block"; // Fallback in case of an error
  
  });

}
