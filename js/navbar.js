// navbar.js
// Loads a shared navbar snippet into the page and provides a simple fallback.
// This keeps the navbar logic DRY across multiple HTML files.

(function () {
    const CONTAINER_ID = 'navbar-container';
    const NAVBAR_URL = '/navbar.html';

    function getFallbackTemplate() {
        const template = document.getElementById('navbar-fallback');
        if (!template) return null;
        return template.content.cloneNode(true);
    }

    function getFallbackHtml() {
        return `
            <nav>
                <a href="/index.html">WORK</a> |
                <a href="/about.html">ABOUT</a> |
                <a href="/docs/王立凯 中文简历 2025.pdf" target="_blank" rel="noopener noreferrer">RESUME</a>
            </nav>
        `;
    }

    function insertNavbar(fragmentOrHtml) {
        const container = document.getElementById(CONTAINER_ID);
        if (!container) return;

        if (fragmentOrHtml instanceof DocumentFragment) {
            container.appendChild(fragmentOrHtml);
            return;
        }

        container.innerHTML = fragmentOrHtml;
    }

    function init() {
        const container = document.getElementById(CONTAINER_ID);
        if (!container) return;

        fetch(NAVBAR_URL)
            .then((response) => {
                if (!response.ok) throw new Error(`Failed to load navbar (${response.status})`);
                return response.text();
            })
            .then(insertNavbar)
            .catch((error) => {
                console.error('Error loading navigation bar:', error);

                const fallbackTemplate = getFallbackTemplate();
                if (fallbackTemplate) {
                    insertNavbar(fallbackTemplate);
                    return;
                }

                insertNavbar(getFallbackHtml());
            });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
