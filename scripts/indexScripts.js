window.addEventListener('resize', adjustTablePosition);
window.addEventListener('load', pageLoad);

function pageLoad() {

  const urlParams = new URLSearchParams(window.location.search),
        year = urlParams.get("year"),
        resultsIframe = document.getElementById('resultsIframe'),
        resultsFilePath = `years/${year}/data/results.json`;

  document.getElementById('headerIframe').src = `shared/header.html?year=${year}`;

  fetch(resultsFilePath).then(response => {
    
    if (response.ok) {
      resultsIframe.src = `shared/resultsTable.html?year=${year}`;
    } else {
      resultsIframe.src = `shared/noResults.html`;
    }

  }).catch(error => {

    console.error(`Error checking file: ${resultsFilePath}`, error);
    resultsIframe.src = `shared/noResults.html`; // Fallback in case of an error
  
  });

  adjustTablePosition();
}

function adjustTablePosition() {
  
  document.getElementById("resultsIframe").style.top = `${document.getElementById("header").offsetHeight}px`;
  console.log(`${document.getElementById("header").style.height}`);

}
