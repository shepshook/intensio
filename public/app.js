import Home from "/views/Home.js";
import Project from "/views/Project.js";
import Auth from "/views/Auth.js";

export let UserId;
let currentView;

firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        console.log("User signed in");
        UserId = user.uid;
    }
    else {
        console.log("User signed out");
        UserId = undefined;
    }
    router();
})

const pathToRegex = path => new RegExp("^" + path.replace(/\//g, "\\/").replace(/:\w+/g, "(.+)") + "$");

const getParams = match => {
    const values = match.result.slice(1);
    const keys = Array.from(match.route.path.matchAll(/:(\w+)/g)).map(result => result[1]);

    return Object.fromEntries(keys.map((key, i) => {
        return [key, values[i]];
    }));
};

const navigateTo = url => {
    console.log(`Navigating to `, url);
    history.pushState(null, null, url);
    router();
};

const router = async () => {
    const routes = [
        { path: "/", view: Home, auth: true },
        { path: "/projects/:id", view: Project, auth: true },
        { path: "/auth", view: Auth, auth: false }
    ];

    const potentialMatches = routes.map(route => {
        return {
            route: route,
            result: location.pathname.match(pathToRegex(route.path))
        };
    });

    let match = potentialMatches.find(potentialMatch => potentialMatch.result !== null);

    if (!match || (UserId && !match.route.auth)) {
        navigateTo(routes[0].path)
        return;
    }
    else if (!UserId && match.route.auth) {
        navigateTo("/auth");
        return;
    }

    const params = getParams(match);
    params.userId = UserId;
    params.parent = document.querySelector("main");
    const view = new match.route.view(params);

    document.querySelector("main").innerHTML = await view.render();

    if (view.onconnected)
        view.onconnected();

    if (currentView?.ondisconnected)
        currentView.ondisconnected();

    currentView = view;
};

window.addEventListener("popstate", router);

document.addEventListener("DOMContentLoaded", () => {
    document.body.addEventListener("click", e => {
        if (e.target.matches("[data-link]")) {
            e.preventDefault();
            navigateTo(e.target.href);
        }
    });
});