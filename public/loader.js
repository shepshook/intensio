window.loadComponent = (function () {
    async function fetchAndParse(url) {
        const response = await fetch(url);
        const html = await response.text();
        const parser = new DOMParser();
        const document = parser.parseFromString(html, "text/html");
        const head = document.head;
        const template = head.querySelector("template");
        const style = head.querySelector("style");
        const script = head.querySelector("script");
        return { template, style, script };
    }

    function registerComponent({ template, style, name }) {
        class UnityComponent extends HTMLElement {
            connectedCallback() {
                this._upcast();
            }

            _upcast() {
                const shadow = this.attachShadow({ mode: 'open' });

                shadow.appendChild(style.cloneNode(true));
                shadow.appendChild(document.importNode(template.content, true));
            }
        }

        return customElements.define(name, UnityComponent);
    }

    async function getSettings({ template, style, script }) {
        const jsFile = new Blob([script.textContent], { type: 'application/javascript' });
        const jsURL = URL.createObjectURL(jsFile);

        const module = await import(jsURL);
        return {
            name: module.default.name,
            template,
            style
        };
    }

    async function loadComponent(url) {
        const component = await fetchAndParse(url);
        const settings = await getSettings(component);
        registerCompoent(settings);
    }

    return loadComponent;
}());