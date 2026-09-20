// DOM Element References
const countryCardsContainer = document.getElementById("country-cards-container");
const searchInput = document.getElementById("search-input");
const regionSelect = document.getElementById("region-select");
const populationInput = document.getElementById("population-input");
const showMoreBtn = document.getElementById("show-more-btn");

let displayCount = 12;
let allCountries = [];
let filteredCountries = [];

// Helper function to extract common and official names safely across schemas
function getCountryNames(country) {
  if (!country) return { common: "", official: "" };

  let common = "";
  let official = "";

  if (typeof country.name === "string") {
    common = country.name;
    official = country.name;
  } else if (country.name && typeof country.name === "object") {
    common = country.name.common || country.name.official || "";
    official = country.name.official || country.name.common || "";
  } else if (country.names && typeof country.names === "object") {
    common = country.names.common || country.names.official || "";
    official = country.names.official || country.names.common || "";
  }

  return { common, official };
}

// Helper function to display status or error messages
function displayMessage(message) {
  countryCardsContainer.innerHTML = "";
  const msgElement = document.createElement("p");
  msgElement.className = "no-results";
  msgElement.textContent = message;
  countryCardsContainer.appendChild(msgElement);
  if (showMoreBtn) {
    showMoreBtn.style.display = "none";
  }
}

// Format array/object list fields (currencies, languages) into comma-separated strings
function getFormattedValues(items) {
  if (!items) return "N/A";
  if (Array.isArray(items)) {
    return items
      .map((item) => (typeof item === "object" ? item.name : item))
      .filter(Boolean)
      .join(", ");
  }
  if (typeof items === "object") {
    return Object.values(items)
      .map((val) => (typeof val === "object" && val.name ? val.name : val))
      .filter(Boolean)
      .join(", ");
  }
  return String(items);
}

// Handler for opening the details view with query parameters
function countryCardHandler(country) {
  const { common, official } = getCountryNames(country);
  const displayName = official || common || "Unknown";
  const flagUrl = country.flags?.svg || country.flags?.png || country.flag?.url_png || "";
  const population = country.population || 0;
  const region = country.region || "";
  const subregion = country.subregion || "";
  const capital = Array.isArray(country.capital)
    ? country.capital[0]
    : country.capitals?.[0]?.name || country.capital || "N/A";
  const currenciesFormatted = getFormattedValues(country.currencies);
  const languagesFormatted = getFormattedValues(country.languages);

  const queryString =
    "?name=" + encodeURIComponent(displayName) +
    "&flag=" + encodeURIComponent(flagUrl) +
    "&population=" + population +
    "&region=" + encodeURIComponent(region) +
    "&subRegion=" + encodeURIComponent(subregion) +
    "&capital=" + encodeURIComponent(capital) +
    "&currencies=" + encodeURIComponent(currenciesFormatted) +
    "&languages=" + encodeURIComponent(languagesFormatted);

  window.location.href = "detail.html" + queryString;
}

// Render country cards to the DOM
function populateCountryCards() {
  countryCardsContainer.innerHTML = "";

  if (filteredCountries.length === 0) {
    displayMessage("No country found matching the search criteria.");
    return;
  }

  const loopCounter = Math.min(displayCount, filteredCountries.length);

  for (let i = 0; i < loopCounter; i++) {
    const country = filteredCountries[i];
    const { common, official } = getCountryNames(country);
    const cardTitle = official || common || "Unknown";

    const card = document.createElement("div");
    card.classList.add("country-card");
    card.style.cursor = "pointer";
    card.addEventListener("click", () => countryCardHandler(country));

    const flagUrl = country.flags?.svg || country.flags?.png || country.flag?.url_png || "";
    const capitalName = Array.isArray(country.capital)
      ? country.capital[0]
      : country.capitals?.[0]?.name || country.capital || "N/A";

    const flagImg = document.createElement("img");
    flagImg.classList.add("flag-img");
    flagImg.src = flagUrl;
    flagImg.alt = `${common} Flag`;

    const detailsDiv = document.createElement("div");
    detailsDiv.classList.add("card-details");

    const title = document.createElement("h3");
    title.classList.add("card-title");
    title.textContent = cardTitle;

    const population = document.createElement("p");
    population.classList.add("card-info");
    population.innerHTML = `<strong>Population:</strong> ${Number(country.population || 0).toLocaleString()}`;

    const capital = document.createElement("p");
    capital.classList.add("card-info");
    capital.innerHTML = `<strong>Capital:</strong> ${capitalName}`;

    const region = document.createElement("p");
    region.classList.add("card-info");
    region.innerHTML = `<strong>Region:</strong> ${country.region || "N/A"}`;

    detailsDiv.appendChild(title);
    detailsDiv.appendChild(population);
    detailsDiv.appendChild(capital);
    detailsDiv.appendChild(region);

    card.appendChild(flagImg);
    card.appendChild(detailsDiv);

    countryCardsContainer.appendChild(card);
  }

  if (showMoreBtn) {
    showMoreBtn.style.display = displayCount >= filteredCountries.length ? "none" : "inline-block";
  }
}

// Show More button handler
function showMoreHandler() {
  displayCount += 10;
  populateCountryCards();
}

// Input filter and validation logic
function filterData() {
  const searchNameValue = searchInput.value.trim();
  const selectedRegion = regionSelect.value;
  const populationValue = populationInput.value.trim();

  // Allow letters, spaces, hyphens, and dots
  const regex = /^[a-zA-Z\s.-]*$/;
  if (searchNameValue !== "" && !regex.test(searchNameValue)) {
    displayMessage("Enter valid Country Name.");
    return;
  }

  if (populationValue !== "" && Number(populationValue) > 1500000000) {
    displayMessage("Country’s population cannot be greater than 1.5 billion.");
    return;
  }

  filteredCountries = allCountries.filter((country) => {
    const { common, official } = getCountryNames(country);
    const query = searchNameValue.toLowerCase();

    // Check against both common and official names
    const matchesName =
      query === "" ||
      common.toLowerCase().includes(query) ||
      official.toLowerCase().includes(query);

    const countryRegion = (country.region || "").toLowerCase();
    const matchesRegion =
      !selectedRegion ||
      selectedRegion === "all" ||
      selectedRegion === "All Regions" ||
      countryRegion === selectedRegion.toLowerCase();

    let matchesPopulation = true;
    if (populationValue !== "") {
      matchesPopulation = (country.population || 0) >= Number(populationValue);
    }

    return matchesName && matchesRegion && matchesPopulation;
  });

  displayCount = 12;
  populateCountryCards();
}

// Event Listeners
searchInput.addEventListener("input", filterData);
regionSelect.addEventListener("change", filterData);
populationInput.addEventListener("input", filterData);

if (showMoreBtn) {
  showMoreBtn.addEventListener("click", showMoreHandler);
}

// Fetch combined API data from Node.js backend
document.addEventListener("DOMContentLoaded", () => {
  fetch("/countries")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Server returned status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      allCountries = Array.isArray(data) ? data : [];
      filteredCountries = [...allCountries];
      populateCountryCards();
    })
    .catch((error) => {
      console.error("Error fetching country data from backend:", error);
      displayMessage("Unable to load country data from server.");
    });
});