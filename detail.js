document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);

    const country = {
        name: params.get("name") || "N/A",
        flag: params.get("flag") || "",
        population: params.get("population") ? Number(params.get("population")).toLocaleString() : "N/A",
        region: params.get("region") || "N/A",
        subRegion: params.get("subRegion") || params.get("subregion") || "N/A",
        capital: params.get("capital") || "N/A",
        currencies: params.get("currencies") || params.get("currency") || "N/A",
        languages: params.get("languages") || params.get("language") || "N/A"
    };

    // 1. Render Flag
    const flagEl = document.querySelector("#country-flag, .country-flag, .detail-flag, img");
    if (flagEl && country.flag) {
        flagEl.src = country.flag;
        flagEl.alt = `${country.name} Flag`;
    }

    // 2. Render Name/Title
    const titleSelectors = [
        "#country-name", "#name", ".country-name", ".country-title",
        ".country-details-title", "h1", "h2", "h3"
    ];
    for (const selector of titleSelectors) {
        const el = document.querySelector(selector);
        if (el) {
            el.textContent = country.name;
            break;
        }
    }

    // 3. Match keys against DOM IDs, classes, and inner spans
    const fields = [
        { keys: ["population", "country-population"], label: "Population", val: country.population },
        { keys: ["region", "country-region"], label: "Region", val: country.region },
        { keys: ["subregion", "sub-region", "subRegion", "country-subregion"], label: "Sub Region", val: country.subRegion },
        { keys: ["capital", "country-capital"], label: "Capital", val: country.capital },
        { keys: ["currencies", "currency", "country-currencies"], label: "Currencies", val: country.currencies },
        { keys: ["languages", "language", "country-languages"], label: "Languages", val: country.languages }
    ];

    fields.forEach(({ keys, label, val }) => {
        let matched = false;

        // A. Match by ID or CSS class
        for (const key of keys) {
            const el = document.getElementById(key) || document.querySelector(`.${key}`);
            if (el) {
                const span = el.querySelector("span");
                if (span) {
                    span.textContent = val;
                } else {
                    el.innerHTML = `<strong>${label}: </strong>${val}`;
                }
                matched = true;
                break;
            }
        }

        // B. Match by static text label (e.g. <p>Capital: <span></span></p>)
        if (!matched) {
            document.querySelectorAll("p, li, div").forEach(node => {
                if (node.children.length <= 1 && node.textContent.trim().toLowerCase().startsWith(label.toLowerCase())) {
                    const span = node.querySelector("span");
                    if (span) {
                        span.textContent = val;
                    } else {
                        node.innerHTML = `<strong>${label}: </strong>${val}`;
                    }
                    matched = true;
                }
            });
        }
    });

    // 4. Fallback Container Injection: If detail.html has no matching text containers at all
    const existingDetails = document.querySelectorAll("p, li, h2, h3");
    const hasContentRendered = Array.from(existingDetails).some(
        el => el.textContent.includes(country.capital) || el.textContent.includes(country.currencies)
    );

    if (!hasContentRendered && flagEl) {
        let detailsContainer = document.querySelector(".country-details, .details-container, .card-details");
        if (!detailsContainer) {
            detailsContainer = document.createElement("div");
            detailsContainer.style.padding = "20px";
            detailsContainer.style.fontSize = "1.1rem";
            detailsContainer.style.lineHeight = "1.8";
            flagEl.parentNode.appendChild(detailsContainer);
        }

        detailsContainer.innerHTML = `
      <h2 style="margin-bottom: 15px;">${country.name}</h2>
      <p><strong>Population:</strong> ${country.population}</p>
      <p><strong>Region:</strong> ${country.region}</p>
      <p><strong>Sub Region:</strong> ${country.subRegion}</p>
      <p><strong>Capital:</strong> ${country.capital}</p>
      <p><strong>Currencies:</strong> ${country.currencies}</p>
      <p><strong>Languages:</strong> ${country.languages}</p>
    `;
    }
});