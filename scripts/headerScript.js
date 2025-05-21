// Get URL parameters
const params = new URLSearchParams(window.location.search),
      data = params.get('data'),
      year = params.get('year'),
      pageTitle = document.getElementById('pageTitle'),
      pageLogo = document.getElementById('pageLogo');

// Updates based of data/year status
if (data) {
  pageTitle.innerText = data;
  pageLogo.style.display = "none";
} else if (year) {
  pageTitle.innerText = `${year} Results`;
  pageLogo.style.display = "none";
}
