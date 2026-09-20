const localData = require('./data');

// Primary remote source containing all world countries with official names, currencies, and languages
const REMOTE_COUNTRIES_URL = 'https://raw.githubusercontent.com/mledoze/countries/master/countries.json';

async function getAllCountries() {
    let combined = Array.isArray(localData) ? [...localData] : [];

    try {
        console.log('[Backend] Fetching live country data from remote API...');

        const response = await fetch(REMOTE_COUNTRIES_URL);
        if (!response.ok) {
            throw new Error(`Remote API returned status: ${response.status}`);
        }

        const remoteCountries = await response.json();
        console.log(`[Backend] Fetched ${remoteCountries.length} countries successfully.`);

        // Build duplicate check from local data
        const seenNames = new Set(
            combined.map(c => (c.name?.common || c.name?.official || (typeof c.name === 'string' ? c.name : '') || '').toLowerCase())
        );

        for (const country of remoteCountries) {
            const commonName = (country.name?.common || '').toLowerCase();
            const officialName = (country.name?.official || '').toLowerCase();

            if (!seenNames.has(commonName) && !seenNames.has(officialName)) {
                if (commonName) seenNames.add(commonName);
                if (officialName) seenNames.add(officialName);

                // Map fields to match standard schema
                combined.push({
                    name: country.name,
                    capital: country.capital || [],
                    region: country.region || '',
                    subregion: country.subregion || '',
                    population: country.population || 0,
                    flags: {
                        svg: `https://flagcdn.com/${(country.cca2 || '').toLowerCase()}.svg`,
                        png: `https://flagcdn.com/w320/${(country.cca2 || '').toLowerCase()}.png`
                    },
                    currencies: country.currencies || {},
                    languages: country.languages || {}
                });
            }
        }
    } catch (error) {
        console.error('[Backend Fetch Error]:', error.message);
    }

    return combined;
}

async function getCountryByName(name) {
    if (!name) return null;
    const countries = await getAllCountries();
    const target = name.toLowerCase();

    return countries.find(country => {
        const common = (country?.name?.common || (typeof country?.name === 'string' ? country.name : '') || '').toLowerCase();
        const official = (country?.name?.official || '').toLowerCase();
        return common === target || official === target;
    }) || null;
}

module.exports = {
    getAllCountries,
    getCountryByName
};