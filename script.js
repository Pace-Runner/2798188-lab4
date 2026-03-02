// Get DOM elements
const countryInput = document.getElementById('country-input');
const searchBtn = document.getElementById('search-btn');
const loadingSpinner = document.getElementById('loading-spinner');
const countryInfo = document.getElementById('country-info');
const borderingCountries = document.getElementById('bordering-countries');
const errorMessage = document.getElementById('error-message');

// Main function to search for a country
async function searchCountry(countryName) {
    // Validate input
    if (!countryName || countryName.trim() === '') {
        showError('Please enter a country name');
        return;
    }

    try {
        // Show loading spinner and hide previous content
        showLoading();
        hideError();
        hideCountryInfo();
        hideBorderingCountries();

        // Fetch country data
        const response = await fetch(`https://restcountries.com/v3.1/name/${countryName}`);
        
        if (!response.ok) {
            throw new Error('Country not found');
        }

        const data = await response.json();
        const country = data[0]; // Get the first matching country

        // Display country information
        displayCountryInfo(country);

        // Fetch and display bordering countries if they exist
        if (country.borders && country.borders.length > 0) {
            await displayBorderingCountries(country.borders);
        } else {
            hideBorderingCountries();
        }

    } catch (error) {
        showError(error.message === 'Country not found' 
            ? 'Country not found. Please try another name.' 
            : 'An error occurred. Please try again.');
    } finally {
        // Hide loading spinner
        hideLoading();
    }
}

// Display country information
function displayCountryInfo(country) {
    const capital = country.capital ? country.capital[0] : 'N/A';
    const population = country.population.toLocaleString();
    const region = country.region;
    const flagSvg = country.flags.svg;
    const countryName = country.name.common;

    countryInfo.innerHTML = `
        <h2>${countryName}</h2>
        <p><strong>Capital:</strong> ${capital}</p>
        <p><strong>Population:</strong> ${population}</p>
        <p><strong>Region:</strong> ${region}</p>
        <img src="${flagSvg}" alt="${countryName} flag">
    `;

    countryInfo.classList.remove('hidden');
}

// Fetch and display bordering countries
async function displayBorderingCountries(borderCodes) {
    try {
        borderingCountries.innerHTML = '<h3>Bordering Countries</h3>';
        
        // Fetch all bordering countries
        const borderPromises = borderCodes.map(code => 
            fetch(`https://restcountries.com/v3.1/alpha/${code}`)
                .then(response => response.json())
        );

        const borderCountriesData = await Promise.all(borderPromises);

        // Display each bordering country
        borderCountriesData.forEach(data => {
            const borderCountry = data[0];
            const borderDiv = document.createElement('div');
            borderDiv.className = 'border-country';
            borderDiv.innerHTML = `
                <img src="${borderCountry.flags.svg}" alt="${borderCountry.name.common} flag">
                <p>${borderCountry.name.common}</p>
            `;
            borderingCountries.appendChild(borderDiv);
        });

        borderingCountries.classList.remove('hidden');
    } catch (error) {
        console.error('Error fetching bordering countries:', error);
    }
}

// Show loading spinner
function showLoading() {
    loadingSpinner.classList.remove('hidden');
}

// Hide loading spinner
function hideLoading() {
    loadingSpinner.classList.add('hidden');
}

// Show error message
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
}

// Hide error message
function hideError() {
    errorMessage.classList.add('hidden');
}

// Hide country info
function hideCountryInfo() {
    countryInfo.classList.add('hidden');
}

// Hide bordering countries
function hideBorderingCountries() {
    borderingCountries.classList.add('hidden');
}

// Event listener for search button
searchBtn.addEventListener('click', () => {
    const country = countryInput.value;
    searchCountry(country);
});

// Event listener for Enter key in input field
countryInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        const country = countryInput.value;
        searchCountry(country);
    }
});
