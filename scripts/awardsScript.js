const urlParams = new URLSearchParams(window.location.search),
      year = urlParams.get("year");

let overallCompiledTable = [],
    results = {},
    parsedCSV;

document.getElementById('yearTitle').textContent = `${year} Broiler Days Fun Run Awards`;

generateAwardTable();

function generateAwardTable() {
  Promise.all([
    fetch(`data/${year}/registration.csv`).then(response => response.text()),
    fetch(`data/${year}/results.json`).then(response => response.json())
  ]).then(([csvData, jsonData]) => {
    parsedCSV = Papa.parse(csvData, { header: true }).data.filter(row => row.ID);
    results = jsonData.rawtimes;
    overallCompiledTable = [];

    const divisions = [
      'Overall', '14 & Under', '15-18', '19-29', '30-39', '40-49', '50-59', '60 & Over'
    ];

    const divisionMinAge = [0, 0, 15, 19, 30, 40, 50, 60];
    const divisionMaxAge = [99, 14, 18, 29, 39, 49, 59, 99];

    divisions.forEach((division, index) => {
      let maleResults = parsedCSV.filter(row => row.Gender.toLowerCase() === 'male' && row.Age >= divisionMinAge[index] && row.Age <= divisionMaxAge[index]);
      let femaleResults = parsedCSV.filter(row => row.Gender.toLowerCase() === 'female' && row.Age >= divisionMinAge[index] && row.Age <= divisionMaxAge[index]);

      const validMaleResults = maleResults.filter(row => results.ids.includes(row.ID));
      const validFemaleResults = femaleResults.filter(row => results.ids.includes(row.ID));

      validMaleResults.sort((a, b) => {
        const timeA = results.times[results.ids.indexOf(a.ID)];
        const timeB = results.times[results.ids.indexOf(b.ID)];
        return timeA.localeCompare(timeB);
      });

      validFemaleResults.sort((a, b) => {
        const timeA = results.times[results.ids.indexOf(a.ID)];
        const timeB = results.times[results.ids.indexOf(b.ID)];
        return timeA.localeCompare(timeB);
      });

      // Handle Male Winners
      const maleWinner = validMaleResults[0] ? { name: `${validMaleResults[0]['First name']} ${validMaleResults[0]['Last name']}`, time: results.times[results.ids.indexOf(validMaleResults[0].ID)] } : null;
      const maleSecondPlace = validMaleResults[1] ? { name: `${validMaleResults[1]['First name']} ${validMaleResults[1]['Last name']}`, time: results.times[results.ids.indexOf(validMaleResults[1].ID)] } : null;

      // Handle Female Winners
      const femaleWinner = validFemaleResults[0] ? { name: `${validFemaleResults[0]['First name']} ${validFemaleResults[0]['Last name']}`, time: results.times[results.ids.indexOf(validFemaleResults[0].ID)] } : null;
      const femaleSecondPlace = validFemaleResults[1] ? { name: `${validFemaleResults[1]['First name']} ${validFemaleResults[1]['Last name']}`, time: results.times[results.ids.indexOf(validFemaleResults[1].ID)] } : null;

      // Add to table data, making sure second place is only shown if there are enough participants
      overallCompiledTable.push({
        division: division,
        maleName: maleWinner ? maleWinner.name : '',
        maleTime: maleWinner ? maleWinner.time : '',
        femaleName: femaleWinner ? femaleWinner.name : '',
        femaleTime: femaleWinner ? femaleWinner.time : '',
        maleSecondPlaceName: maleSecondPlace ? maleSecondPlace.name : '',
        maleSecondPlaceTime: maleSecondPlace ? maleSecondPlace.time : '',
        femaleSecondPlaceName: femaleSecondPlace ? femaleSecondPlace.name : '',
        femaleSecondPlaceTime: femaleSecondPlace ? femaleSecondPlace.time : ''
      });
    });
    updateAwardTable();
  });
}

function updateAwardTable() {
  const table = document.getElementById('resultsTable');
  table.innerHTML = '';

  const headerRow = document.createElement('tr');
  const headers = ['', 'Male', 'Time', 'Female', 'Time'];

  headers.forEach(header => {
    const th = document.createElement('th');
    th.textContent = header;
    headerRow.appendChild(th);
  });

  table.appendChild(headerRow);

  overallCompiledTable.forEach(row => {
    const newRow = table.insertRow();
    
    // Show 1st place and 2nd place only if available, otherwise leave blank
    newRow.insertCell().textContent = `${row.division} - 1st`;
    
    // Only add 1st place if there's a valid name and time
    newRow.insertCell().textContent = row.maleName || '';
    newRow.insertCell().textContent = row.maleTime || '';
    
    // Only add 1st place if there's a valid name and time
    newRow.insertCell().textContent = row.femaleName || '';
    newRow.insertCell().textContent = row.femaleTime || '';

    if (row.division !== "Overall") {
      const newRowSecond = table.insertRow();
      newRowSecond.insertCell().textContent = `${row.division} - 2nd`;
      newRowSecond.insertCell().textContent = row.maleSecondPlaceName || '';;
      newRowSecond.insertCell().textContent = row.maleSecondPlaceTime || '';;
      newRowSecond.insertCell().textContent = row.femaleSecondPlaceName || '';;
      newRowSecond.insertCell().textContent = row.femaleSecondPlaceTime || '';;
    }
  });
}
