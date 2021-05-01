import AbstractView from "/views/AbstractView.js";
import { getProject } from "/data/Repository.js";
import { formatMillis } from "/helpers.js";

export default class extends AbstractView {
    constructor(params) {
        super(params);
        getProject(params.id, async (project) => {
            this.project = project;
            this.setTitle(`Project - ${project.name}`);
            await this.update();
        });
        this.setTitle("Project");
    }

    async update() {
        this.params.parent.innerHTML = await this.render();
    }

    async render() {
        const formatDate = (date) => new Date(Date.parse(date)).toLocaleDateString();
        const formatTime = (date) => new Date(Date.parse(date)).toLocaleTimeString();
        
        let records;
        if (this.project.records)
            records = Object.values(this.project.records).filter(r => r.to).sort((a, b) => a.to < b.to ? 1 : -1);
        
        const renderSection = (name, days, withDate) => {
            const today = new Date().setHours(0, 0, 0, 0);

            const filteredRecords = days != null
                ? records.filter(r => Date.parse(r.to) > today - days * 24 * 3600 * 1000)
                : records;

            records = records.filter(r => !filteredRecords.includes(r));

            return filteredRecords?.length 
                ? `<section>
                    <h2>${name}</h2>
                    ${filteredRecords.map(r => 
                        `<div>
                            <span>${withDate ? formatDate(r.to) + " / " : ""}<time>${formatTime(r.from)}</time> - <time>${formatTime(r.to)}</time></span>
                            <time>${formatMillis(Date.parse(r.to) - Date.parse(r.from))}</time>
                        </div>`).join("")}
                    </section>`
                : "";
        }

        return `
            <div class="project-details" style="background: radial-gradient(50% 200px at top, ${this.project.color}80, transparent);">
                <h1>${this.project.name}</h1>
                ${records 
                    ? `
                        ${renderSection("Today", 0, false)}
                        ${renderSection("Yesterday", 1, false)}
                        ${renderSection("This week", 7, true)}
                        ${renderSection("This month", 30, true)}
                        ${renderSection("Older", null, true)}`
                    : '<span style="text-align:center">No records yet</span>'}
            </div>
        `;
    }
}