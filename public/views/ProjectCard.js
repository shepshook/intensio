import AbstractView from "/views/AbstractView.js";
import { startNewProjectRecord, finishLastProjectRecord } from "/data/Repository.js";
import { formatRecordsTime } from "/helpers.js";

export default class extends AbstractView {
    constructor(params) {
        super(params);
    }

    onconnected() {
        const projectId = this.params.project.id;
        const button = document.querySelector(`#projectCard${projectId}.project-card > div > button`);
        if (this.params.isCurrent) {
            if (this.timer)
                clearInterval(this.timer);
            this.timer = setInterval(() => { document.getElementById("timer").innerText = formatRecordsTime(this.params.project.records) }, 1000);
            if (button)
                button.onclick = () => finishLastProjectRecord(projectId);
        }
        else {
            if (button)
                button.onclick = () => startNewProjectRecord(projectId);
        }
    }

    ondisconnected() {
        if (this.timer)
            clearInterval(this.timer);
    }

    async render() {
        return `
        <div id="projectCard${this.params.project.id}" class="project-card ${this.params.isCurrent ? "current-project" : ""}">
            ${this.params.isCurrent ? "<h1>Now tracking</h1>" : ""}
            <div>
                <span class="color-dot" style="background-color:${this.params.project.color}"></span>
                <h2>
                    <a href="/projects/${this.params.project.id}" data-link>${this.params.project.name}</a>
                </h2>
            </div>
            <div>
                <time ${this.params.isCurrent ? 'id="timer"' : ""}>${formatRecordsTime(this.params.project.records)}</time>
                <button></button>
            </div>
        </div>
    `;
    }
}