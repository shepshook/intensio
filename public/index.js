import Router from "./Router";

const auth = firebase.auth();
const database = firebase.database();
const router = new Router({
    mode: "history",
    root: "/"
});

router
    .add(/details\/(.*)/, (id) => {
        alert(`Project with ID: ${id}`);
    })
    .add("", () => {
        console.log("main page");
    });

let userId;
let timer;

class Wrapper {
    constructor(element, text, attributes = {}) {
        this.element = document.createElement(element, attributes);
        this.element.innerHTML = text;
    }
    click(val) {
        this.element.addEventListener("click", () => val());
        return this;
    }
    showSelectable() {
        this.element.style.cursor = "pointer";
        return this;
    }
    addClass(className) {
        this.element.classList.add(className);
        return this;
    }
    setAttribute(attr, value) {
        this.element[attr] = value;
        return this;
    }
    appendChild(child) {
        this.element.appendChild(child.element);
        return this;
    }
    createChild(element, text, attributes = {}) {
        var wrapper = new Wrapper(element, text, attributes);
        this.appendChild(wrapper);
        return this;
    }
    static generate(element, text, attributes = {}) {
        return new Wrapper(element, text, attributes);
    }
}


auth.onAuthStateChanged((user) => {
    if (user) {
        console.log("User signed in");
        userId = user.uid;
        bindData(userId);
    }
    else {
        console.log("User signed out");
        window.location.replace("auth.html");
    }
})


const bindData = () => {
    document.body.hidden = false;
    const projects = {};

    if (userId) {
        database
            .ref(`users/${userId}/projects`)
            .on("value", (snapshot) => {
                const value = snapshot.val();
                if (value) {
                    Object.values(snapshot?.val())?.forEach((projectId) => {
                        database
                            .ref("projects/" + projectId)
                            .on("value", (snapshot) => {
                                const project = snapshot.val();
                                if (project) {
                                    projects[projectId] = project;
                                    renderPage(projects);
                                }
                                else {
                                    delete projects[projectId];
                                }
                            })
                    });
                }
            });
    }
}

const renderPage = (projects) => {

    const formatTime = (records) => {
        if (!records)
            return "00:00:00";

        const s = Math.floor(Object.values(records)
            .map((r) => (r.to == null
                ? new Date()
                : Date.parse(r.to)) - Date.parse(r.from))
            .reduce((a, b) => a + b, 0) / 1000);

        const hh = Math.floor(s / 3600);
        const mm = Math.floor(s % 3600 / 60);
        const ss = s % 60;

        // add zeros if the value takes less than 2 chars
        const f = (x) => x.toString().padStart(2, 0);

        return `${f(hh)}:${f(mm)}:${f(ss)}`;
    }

    const main = document.getElementsByTagName("main")[0];
    Array.from(document.getElementsByTagName("section"))?.forEach((element) => main.removeChild(element));

    const runningProject = Object.entries(projects)
        .filter(([_, project]) => project.records)
        .filter(([_, project]) => 
            Object.values(project.records).filter(r => r.to == null).length)[0];

    if (runningProject) {
        const [id, project] = runningProject;
        projects = Object.fromEntries(Object.entries(projects).filter(([_id, _]) => _id !== id));

        main.appendChild(Wrapper.generate("section", "").addClass("project-card").addClass("current-project")
            .createChild("h1", "Now tracking")
            .appendChild(Wrapper.generate("div", "")
                .appendChild(Wrapper.generate("span", "").addClass("color-dot").setAttribute("style", `background-color:${project.color}`))
                .appendChild(Wrapper.generate("a", "").setAttribute("href", "details.html")
                    .createChild("h2", project.name)))
            .appendChild(Wrapper.generate("div", "")
                .appendChild(Wrapper.generate("time", formatTime(project.records)).setAttribute("id", "timer"))
                .appendChild(Wrapper.generate("button", "")
                    .click(() => {
                        clearInterval(timer);
                        const recordId = Object.entries(project.records).filter(([_, r]) => r.to == null)[0][0];
                        database
                            .ref(`projects/${id}/records/${recordId}/to`)
                            .set(new Date().toISOString());
                    }
                    ))).element);

        clearInterval(timer);
        timer = setInterval(() => {
            const timerElement = document.getElementById("timer");
            timerElement.innerText = formatTime(project.records);
        }, 1000)
    }


    const projectCards = Object.entries(projects)
        .map(([id, project]) =>
            Wrapper.generate("div", "").addClass("project-card")
                .appendChild(Wrapper.generate("div", "")
                    .appendChild(Wrapper.generate("span", "").addClass("color-dot").setAttribute("style", `background-color:${project.color}`))
                    .appendChild(Wrapper.generate("a", "").setAttribute("href", "details.html")
                        .createChild("h2", project.name)))
                .appendChild(Wrapper.generate("div", "")
                    .createChild("time", formatTime(project.records))
                    .appendChild(Wrapper.generate("button", "")
                        .click(() => {
                            database
                                .ref(`projects/${id}/records`)
                                .push()
                                .set({ from: new Date().toISOString() });
                        }
                        ))));

    const section = Wrapper.generate("section", "").addClass("archive")
        .createChild("h1", "Today");
    projectCards.forEach((card) => section.element.appendChild(card.element));
    main.appendChild(section.element);
}

const getFormData = (formId) => {
    let formData = {};
    Array.from(document.getElementById(formId).elements)
        .filter(item => item.tagName === "INPUT")
        .forEach(input => formData[input.name] = input.value);

    return formData;
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("logoutButton").onclick = () => {
        auth.signOut();
    };

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

        const newProjectRef = database.ref(`projects`).push();
        const newProjectId = newProjectRef.key;

        const now = new Date().toISOString();
        newProjectRef.set({
            name: formData.name,
            color: formData.color,
            createdOn: now
        });

        database
            .ref(`users/${userId}/projects`)
            .push()
            .set(newProjectId);
    }
})
