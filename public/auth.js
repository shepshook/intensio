const auth = firebase.auth();

const signUp = (formData) => {
    if (formData.password === formData.passwordConfirm) {
        auth.createUserWithEmailAndPassword(formData.email, formData.password)
            .then((userCredential) => {
                let user = userCredential.user;
                console.log(user);
                window.location.replace("index.html");
            })
            .catch((error) => {
                console.log(error);
            });
    }
} 

const signIn = (formData) => {
    auth.signInWithEmailAndPassword(formData.email, formData.password)
        .then((userCredential) => {
            let user = userCredential.user;
            console.log(user);
        })
        .catch((error) => {
            console.log(error);
        });
}

const getFormData = (formId) => {
    let formData = {};
    Array.from(document.getElementById(formId).elements)
        .filter(item => item.tagName === "INPUT")
        .forEach(input => formData[input.name] = input.value);
    
    return formData;
}

auth.onAuthStateChanged((user) => {
    if (user) {
        window.location.replace("index.html");
        let uid = user.uid;
        console.log("User signed in");

    }
    else {
        console.log("User signed out");
    }
})

document.getElementById("signUpForm").onsubmit = (event) => {
    event.preventDefault();
    signUp(getFormData("signUpForm"));
}
        

document.getElementById("signInForm").onsubmit = (event) => {
    event.preventDefault();
    signIn(getFormData("signInForm"));
}
    
    
document.getElementById("switchToSignInButton").onclick = () => {
    document.getElementById("signInForm").hidden = false;
    document.getElementById("signUpForm").hidden = true;
}


document.getElementById("switchToSignUpButton").onclick = () => {
    document.getElementById("signUpForm").hidden = false;
    document.getElementById("signInForm").hidden = true;
}
