const distance = 3.10686,
      divisions = ['0-14', '15-18', '19-29', '30-39', '40-49', '50-59', '60+'],
      divisionMinAge = [0, 15, 19, 30, 40, 50, 60],
      divisionMaxAge = [14, 18, 29, 39, 49, 59, 99],
      urlParams = new URLSearchParams(window.location.search),
      year = urlParams.get("year");

let overallCompiledTable = [],
    overall = true,
    ageGroup = "Overall",
    results = {},
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
    th.textContent = header;
    headerRow.appendChild(th);

  });

  table.appendChild(headerRow);

  if (filteredResults.length === 0) {

    const newRow = table.insertRow();
    const cell = newRow.insertCell();
    cell.colSpan = headers.length;
    cell.textContent = 'No results found for the selected category.';
    cell.style.textAlign = 'center';

  } else {

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

    });

  }

}
