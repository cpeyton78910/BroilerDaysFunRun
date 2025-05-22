const distance = 3.10686,
      divisions = ['0-14', '15-18', '19-29', '30-39', '40-49', '50-59', '60+'],
      divisionMinAge = [0, 15, 19, 30, 40, 50, 60],
      divisionMaxAge = [14, 18, 29, 39, 49, 59, 99],
      urlParams = new URLSearchParams(window.location.search),
      year = urlParams.get("year");

let overall = true,
    ageGroup = "Overall",
    results = {},
    overallCompiledTable = [],
    parsedCSV;

const calculatePace = (time) => {

  const [minutes, seconds] = time.split(':').map(parseFloat),
        totalSeconds = minutes * 60 + seconds,
        pacePerMile = totalSeconds / distance,
        paceMinutes = Math.floor(pacePerMile / 60),
        paceSeconds = pacePerMile % 60,
        roundedPaceSeconds = Math.round(paceSeconds * 10) / 10;

  return `${paceMinutes}:${roundedPaceSeconds < 10 ? '0' : ''}${roundedPaceSeconds.toFixed(1)}`;

};

generateTable("female");

document.getElementById('genderSelect').addEventListener('change', generateTable);

document.getElementById('ageGroupSelect').addEventListener('change', () => {

  ageGroup = document.getElementById('ageGroupSelect').value;
  overall = (ageGroup == "Overall")? true:false;
  updateTable();

});

function generateTable() {
  
  const gender = document.getElementById('genderSelect').value;

  Promise.all([
    fetch(`../data/${year}/registration.csv`).then(response => response.text()),
    fetch(`../data/${year}/results.json`).then(response => response.json())
  ]).then(([csvData, jsonData]) => {
    
    parsedCSV = Papa.parse(csvData, { header: true }).data.filter(row => row.ID);

    results = jsonData.rawtimes;
    overallCompiledTable = [];

    let genderResults = parsedCSV.filter(row => row.Gender.toLowerCase() === gender.toLowerCase());

    // for each division category, sorts and adds place
    for (let i = 0; i < divisions.length; i++) {
        
        const filteredResults = genderResults.filter(row => row.Age >= divisionMinAge[i] && row.Age <= divisionMaxAge[i]);

        // Filter genderResults to include only entries with valid times
        const validGenderResults = filteredResults.filter(row => results.ids.includes(row.ID));

        validGenderResults.sort((a, b) => {

          const timeA = results.times[results.ids.indexOf(a.ID)];
          const timeB = results.times[results.ids.indexOf(b.ID)];

          return timeA.localeCompare(timeB);

        });

        
        validGenderResults.forEach((row, index) => {

          row.divisionPlace = index + 1;
          row.division = divisions[i];

        });

        overallCompiledTable.push(...validGenderResults);
    }
    overallCompiledTable.sort((a, b) => {

      const timeA = results.times[results.ids.indexOf(a.ID)];
      const timeB = results.times[results.ids.indexOf(b.ID)];
      return timeA.localeCompare(timeB);

    });
    overallCompiledTable.forEach((row, index) => row.overallPlace = index + 1);
    updateTable();
  });
}

function updateTable() {
  let filteredResults = overallCompiledTable;

  if (!overall) {

    filteredResults = overallCompiledTable.filter(row => row.Age >= divisionMinAge[ageGroup] && row.Age <= divisionMaxAge[ageGroup]);

  }

  const table = document.getElementById('resultsTable');
  table.innerHTML = '';

  // Set table headers based on overall parameter and gender 
  const headerRow = document.createElement('tr'),
        headers = overall ? ['Place', 'Division Place', 'Division', 'Bib', 'Name', 'Time', 'Pace', 'Age']:
        ['Division Place', 'Overall Place', 'Bib', 'Name', 'Time', 'Pace', 'Age'];

  headers.forEach(header => {

    const th = document.createElement('th');
    if (header == 'Name') th.classList.add('nameHeader');
    th.textContent = header;
    headerRow.appendChild(th);

  });

  table.appendChild(headerRow);

  filterWithSearch();

  filteredResults.forEach(row => {
    const timeIndex = results.ids.indexOf(row.ID);
    if (timeIndex !== -1) {

      const newRow = table.insertRow();

      if (overall) {

        newRow.insertCell().textContent = row.overallPlace;
        newRow.insertCell().textContent = row.divisionPlace;
        newRow.insertCell().textContent = row.division;

      } else {

        newRow.insertCell().textContent = row.divisionPlace;
        newRow.insertCell().textContent = row.overallPlace;

      }

      newRow.insertCell().textContent = row.ID;
      const nameCell = newRow.insertCell();
      nameCell.classList.add('nameCell');
      nameCell.textContent = `${row['First name']} ${row['Last name']}`;
      newRow.insertCell().textContent = results.times[timeIndex];
      newRow.insertCell().textContent = calculatePace(results.times[timeIndex]);
      newRow.insertCell().textContent = row.Age;

    }
    filterWithSearch();
  });

}

const searchInput = document.getElementById("searchInput");

function filterWithSearch() {
  let i, j, txtValue, hasResults = false;
  const filter = searchInput.value.toUpperCase(),
        table = document.getElementById("resultsTable"),
        tr = table.getElementsByTagName("tr"),
        headers = table.getElementsByTagName("th").length;

  // Remove previous "No results found" row if exists
  const existingMessageRow = document.getElementById("noResultsRow");
  if (existingMessageRow) table.removeChild(existingMessageRow);

  // Loop through rows
  for (i = 1; i < tr.length; i++) {
    const td = tr[i].getElementsByTagName("td");
    let rowMatches = false;

    // Loop through all columns in the row
    for (j = 0; j < td.length; j++) {
      txtValue = td[j].textContent || td[j].innerText;
      if (txtValue.toUpperCase().indexOf(filter) > -1) {

        rowMatches = true;

        break;
      }

    }

    // Show or hide row based on search match
    tr[i].style.display = rowMatches ? "" : "none";
    if (rowMatches) hasResults = true;

  }

  // If no results, add the row
  if (!hasResults && !document.getElementById("noResultsRow")) {

    const noResultsRow = document.createElement("tr");
    noResultsRow.id = "noResultsRow";
    
    const noResultsCell = document.createElement("td");
    noResultsCell.colSpan = headers;
    noResultsCell.textContent = "No results found.";
    noResultsCell.style.textAlign = "center";
    
    noResultsRow.appendChild(noResultsCell);
    table.appendChild(noResultsRow);

  }

}

window.addEventListener('resize', adjustSearchBar);
window.addEventListener('load', adjustSearchBar);

function adjustSearchBar () {
  const dropdownHeight = document.getElementById('genderSelect').clientHeight;

  searchInput.style.height = `${dropdownHeight-3}px`;
  searchInput.style.paddingLeft = `${dropdownHeight+2}px`;
  searchInput.style.backgroundSize = `${dropdownHeight-4}px`;

}
