// Ferti Verse - Language Switching and Dynamic Content
(function () {
    'use strict';

    let currentLang = localStorage.getItem('fertiverse-lang') || 'en';

    const langSelect = document.getElementById('lang-select');
    const updateAllContent = () => {
        const t = translations[currentLang];
        if (!t) return;

        // Update all elements with data-i18n
        document.querySelectorAll('[data-i18n]').forEach((el) => {
            const key = el.getAttribute('data-i18n');
            if (t[key]) el.textContent = t[key];
        });

        // Render farms
        const farmsEl = document.getElementById('farms-content');
        if (farmsEl && t.farms) {
            farmsEl.innerHTML = t.farms
                .map(
                    (f) =>
                        `<div class="farm-item">
                    <h3>${f.name}</h3>
                    <p>${f.fertilizers}</p>
                </div>`
                )
                .join('');
        }

        // Render fertilizers
        const fertEl = document.getElementById('fertilizers-content');
        if (fertEl && t.fertilizers) {
            fertEl.innerHTML = t.fertilizers
                .map(
                    (f) =>
                        `<div class="fertilizer-item">
                    <h3>${f.name}</h3>
                    <p>${f.desc}</p>
                </div>`
                )
                .join('');
        }

        // Render bacteria table
        const tbody = document.getElementById('bacteria-table-body');
        if (tbody && t.bacteriaTable) {
            tbody.innerHTML = t.bacteriaTable
                .map(
                    (row) =>
                        `<tr>
                    <td>${row.bacteria}</td>
                    <td>${row.fertilizers}</td>
                    <td>${row.farms}</td>
                </tr>`
                )
                .join('');
        }
    };

    langSelect.addEventListener('change', (e) => {
        currentLang = e.target.value;
        localStorage.setItem('fertiverse-lang', currentLang);
        updateAllContent();
    });

    // Set initial language
    langSelect.value = currentLang;
    updateAllContent();
})();
