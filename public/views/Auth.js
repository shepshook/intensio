import AbstractView from "/views/AbstractView.js";
import { getFormData } from "/helpers.js";

export default class extends AbstractView {
    constructor(params) {
        super(params);
        this.setTitle("Start using Intensio");
    }

    signUp = (formData) => {
        if (formData.password === formData.passwordConfirm) {
            firebase.auth().createUserWithEmailAndPassword(formData.email, formData.password)
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
    
    signIn = (formData) => {
        firebase.auth().signInWithEmailAndPassword(formData.email, formData.password)
            .then((userCredential) => {
                let user = userCredential.user;
                console.log(user);
            })
            .catch((error) => {
                console.log(error);
            });
    }

    onconnected() {
        document.getElementById("mainHeader").hidden = true;
        
        document.getElementById("signUpForm").onsubmit = (event) => {
            event.preventDefault();
            this.signUp(getFormData("signUpForm"));
        }
        
        
        document.getElementById("signInForm").onsubmit = (event) => {
            event.preventDefault();
            this.signIn(getFormData("signInForm"));
        }
        
        
        document.getElementById("switchToSignInButton").onclick = () => {
            document.getElementById("signInForm").hidden = false;
            document.getElementById("signUpForm").hidden = true;
        }
        
        
        document.getElementById("switchToSignUpButton").onclick = () => {
            document.getElementById("signUpForm").hidden = false;
            document.getElementById("signInForm").hidden = true;
        }
        
    }
    
    ondisconnected() {
        document.getElementById("mainHeader").hidden = false;
    }
    
    async render() {
        return `
            <div class="landing-page">
                <header>
                    <a class="landing-logotype" href="index.html">
                        <img src="res/logo.svg" alt="">
                        <div>
                            <h1>intensio</h1>
                            <span>Master your time</span>
                        </div>
                    </a>
                </header>
                <div>
                    <span class="login-form-title">Start using <span>intensio</span></span>
                    <form id="signUpForm" method="post" class="login-form">

                        <label class="d-none" for="email">Email</label>
                        <input class="text-input" type="email" id="emailSignUp" name="email" placeholder="Email">

                        <label class="d-none" for="password">Password</label>
                        <input class="text-input" type="password" id="passwordSignUp" name="password" placeholder="Password">

                        <label class="d-none" for="password-confirm">Confirm password</label>
                        <input class="text-input" type="password" id="passwordConfirm" name="passwordConfirm"
                            placeholder="Confirm password">

                        <button id="signUpButton" type="submit" class="sign-up-button">Sign Up</button>
                        <button id="switchToSignInButton" type="button">I already have an account</button>

                    </form>

                    <form id="signInForm" method="post" class="login-form" hidden>
                        <label class="d-none" for="email">Email</label>
                        <input class="text-input" type="email" id="emailSignIn" name="email" placeholder="Email">

                        <label class="d-none" for="password">Password</label>
                        <input class="text-input" type="password" id="passwordSignIn" name="password" placeholder="Password">
                        
                        <button id="signInButton" type="submit" class="sign-up-button">Sign In</button>
                        <button id="switchToSignUpButton" type="button">Go back to registration</button>
                    </form>
                </div>
            </div>
        `;
    }
}