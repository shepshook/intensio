import { UserId } from "/app.js";

const database = firebase.database();

export function getUserById(id, callback) {
    database
        .ref(`users/${id}`)
        .on("value", snapshot => callback(snapshot.val()));
}

export function getProjectsByUserId(userId, callback) {
    database
        .ref(`users/${userId}/projects`)
        .on("value", snapshot => {
            const userProjects = snapshot.val();
            if (userProjects) {
                Object.values(userProjects)?.forEach((projectId) => {
                    database
                        .ref(`projects/${projectId}`)
                        .on("value", snapshot => {
                            const project = snapshot.val();
                            if (!project) return;

                            project.id = projectId;
                            callback(project);
                        });
                });
            }
        });
}

export function getProject(id, callback) {
    database
        .ref(`projects/${id}`)
        .on("value", snapshot => callback(snapshot.val()));
}

export function addProject(project) {
    const newProjectRef = database.ref(`projects`).push();
    const newProjectId = newProjectRef.key;

    const now = new Date().toISOString();
    newProjectRef.set({
        name: project.name,
        color: project.color,
        createdOn: now
    });

    database
        .ref(`users/${UserId}/projects`)
        .push()
        .set(newProjectId);
}

export function startNewProjectRecord(projectId) {
    database
        .ref(`users/${UserId}/projects`)
        .get()
        .then((data) => data.val())
        .then((projectIds) => {
            if (projectIds) {
                Object.values(projectIds).forEach((projectId) =>
                    database
                        .ref(`projects/${projectId}/records`)
                        .get()
                        .then((data) => data.val())
                        .then((records) => {
                            if (records) {
                                Object.entries(records).forEach(([id, record]) => {
                                    if (!record.to) {
                                        database.ref(`projects/${projectId}/records/${id}/to`).set(new Date().toISOString());
                                        console.log(`stopped project ${projectId}`)
                                    }
                                });
                            }
                        }))
            }
        })
        .then((_) => database
            .ref(`projects/${projectId}/records`)
            .push()
            .set({ from: new Date().toISOString() }))

}

export function finishLastProjectRecord(projectId) {
    database
        .ref(`projects/${projectId}/records`)
        .get()
        .then((data) => data.val())
        .then((records) => {
            const recordId = Object.entries(records).filter(([id, record]) => !record.to)[0][0];
            database
                .ref(`projects/${projectId}/records/${recordId}/to`)
                .set(new Date().toISOString());
        })

}
