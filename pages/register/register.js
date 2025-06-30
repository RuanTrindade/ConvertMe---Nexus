


function onChangeEmail() {
    const email = form.email().value;
    form.emailRequiredError().style.display = email ? "none" : "block";
    form.emailInvalidError().style.display = validateEmail(email) ? "none" : "block";

    toggleRegisterButtonDisable()
}


function onChangePassword(){
    const password = form.password().value;

    form.passwordRequiredError().style.display = password ? "none" : "block";
    form.passwordMinLengthError().style.display = password.length >= 6 ? "none" : "block";

    validatePasswordsMatch();
    toggleRegisterButtonDisable()
}



function onChangeConfirmPassword(){
    validatePasswordsMatch();
    toggleRegisterButtonDisable()
}



function register() {
    console.log("Tentando registrar...");
    showLoading();

    const email = form.email().value;
    const password = form.password().value;

    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then(() => {
            hideLoading();
            window.location.href = "../../pages/home/home.html";
        })
        .catch(error => {
            hideLoading();
            showToast(getErrorMessage(error));
        });
}


function getErrorMessage(error) {
    // Você pode melhorar aqui conforme seus códigos Firebase
    if (error.code === "auth/email-already-in-use") return "Este e-mail já está em uso.";
    if (error.code === "auth/invalid-email") return "E-mail inválido.";
    if (error.code === "auth/weak-password") return "Senha muito fraca.";
    return error.message;
}


function validatePasswordsMatch(){
    const password = form.password().value;
    const confirmPassword = form.confirmPassword().value;


    form.confirmPasswordDoesntMatchError().style.display = 
        password == confirmPassword ? "none" : "block";
}


function toggleRegisterButtonDisable(){
    form.registerButton().disabled = !isFormValid();
}


function isFormValid(){
    const email = form.email().value;
    if(!email || !validateEmail(email)){
        return false;
    }
    const password = form.password().value;
    if(!password || password.length < 6){
        return false;
    }
    
    const confirmPassword = form.confirmPassword().value;
    if(password != confirmPassword){
            return false;
        }

    return true;

}


const form = {
    confirmPassword: () => document.getElementById('confirmPassword'),
    confirmPasswordDoesntMatchError: () => document.getElementById('password-doesnt-match-error'),
    email: () => document.getElementById('email'),
    emailInvalidError: () => document.getElementById('email-in-error'),
    emailRequiredError: () => document.getElementById('email-ob-error'),
    password: () => document.getElementById('password'),
    passwordMinLengthError: () => document.getElementById('password-min-length-error'),
    passwordRequiredError: () => document.getElementById('password-ob-error'),
    registerButton: () => document.getElementById('register-button')
}





function showToast(message, color = "#f44336") {
    let container = document.getElementById("toast-container");
    if (!container) {
        container = document.createElement("div");
        container.id = "toast-container";
        document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = "toast";
    toast.style.backgroundColor = color;
    toast.innerText = message;

    container.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}


