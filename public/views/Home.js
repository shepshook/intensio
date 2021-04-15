import AbstractView from "./AbstractView.js";
import ProjectCard from "./ProjectCard.js";
import { getProjectsByUserId, addProject } from "../data/Repository.js"
import { getFormData } from "../helpers.js";

export default class extends AbstractView {
    constructor(params) {
        super(params);
        this.setTitle("Intensio - Home");
        this.projects = {};
        getProjectsByUserId(this.params.userId, async project => {
            this.projects[project.id] = project;
            await this.update();
        });
        this.children = [];
    }

    onconnected() {
        this.children.forEach(child => {
            if (child.onconnected)
                child.onconnected();
        });

        const modal = document.getElementById("newProjectModal");
        const mainContent = document.getElementById("mainContent")

        document.getElementById("newProjectButton").onclick = function () {
            modal.style.display = "flex";
            mainContent.style.filter = "blur(5px)";
        };

        const closeModal = () => {
            modal.style.display = "none";
            mainContent.style.filter = "none";
        };

        document.getElementById("closeModalButton").onclick = closeModal;

        window.onclick = (event) => {
            if (event.target == modal) {
                closeModal();
            }
        };

        document.getElementById("newProjectForm").onsubmit = (event) => {
            event.preventDefault();
            const formData = getFormData("newProjectForm");
            addProject(formData);
        }
    }

    ondisconnected() {
        if (this.children) {
            for (let child of this.children) {
                if (child.ondisconnected)
                    child.ondisconnected();
            }
        }
    }

    async update() {
        this.ondisconnected();
        this.params.parent.innerHTML = await this.render();
        this.onconnected();
    }

    async render() {
        this.children = [];
        let projects = Object.values(this.projects);

        const runningProject = projects
            .filter(project => project.records)
            .filter(project => !Object.values(project.records).every(r => r.to))[0];

        let runningProjectHtml;
        if (runningProject) {
            const runningProjectView = new ProjectCard({ project: runningProject, isCurrent: true });
            this.children.push(runningProjectView);
            runningProjectHtml = await runningProjectView.render();
            projects = projects.filter(project => project.id != runningProject.id);
        }

        let projectCards = [];
        for (let project of projects) {
            const projectView = new ProjectCard({ project: project });
            this.children.push(projectView);
            projectCards.push(await projectView.render());
        }
        
        let zip = projects.map((p, i) => [p, projectCards[i]]);

        const drawSection = (name, days) => {
            const filteredCards = days
                ? zip.filter(([p, html]) => Date.now() - 
                    (p.records 
                        ? Math.max(...Object.values(p.records).map(r => Date.parse(r.to))) 
                        : Date.parse(p.createdOn)) 
                    < days * 24 * 3600 * 1000)
                : zip;
            
            zip = zip.filter((item) => !filteredCards.includes(item));
            return filteredCards?.length
                ? `<section class="archive"><h1>${name}</h1>${filteredCards.map(x => x[1]).join("")}</section>`
                : "";
        }

        return `
            <div id="mainContent" class="container">
                ${runningProjectHtml ?? ""}
                <button id="newProjectButton" class="new-project-button"><img src="res/plus.svg" alt="">Add new project</button>
                ${drawSection("Today", 1)}
                ${drawSection("Yesterday", 2)}
                ${drawSection("This week", 7)}
                ${drawSection("This month", 30)}
                ${drawSection("Older", null)}
            </div>
            <div id="newProjectModal" class="modal-container">
                <div class="new-project-modal">
                    <div class="header">
                        <h1>Add new project</h1>
                        <button id="closeModalButton" class="close"><img src="res/close.svg" alt="Close"></button>
                    </div>
                    <hr>
                    <form method="POST" class="body" id="newProjectForm">
                        <div class="form-inputs">
                            <label for="name">Project Name</label>
                            <input class="text-input" type="text" id="name" name="name" placeholder="Name">
                            <label for="color">Accent Color</label>
                            <input class="color-input" type="color" id="color" name="color" value="#88FFAA">
                        </div>
                        <button type="submit" class="save-button">Save</button>
                    </form>
                </div>
            </div>
        `;
    }
}