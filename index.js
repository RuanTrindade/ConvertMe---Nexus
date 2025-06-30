



function onEmail() {
    buttonDisabled();
    emailError();

}

function onPassword() {
    buttonDisabled();
    passwordError();
}


function login(){

    showLoading();
    firebase.auth().signInWithEmailAndPassword(
        form.email().value, form.password().value
    ).then(response => {
        hideLoading();
        window.location.href = "pages/home/home.html";
    }).catch(error => {
        hideLoading();
        showToast(errorMessage(error));
    });
    
   
}

function showToast(message, color = "#f44336") {
    const container = document.getElementById("toast-container");

    const toast = document.createElement("div");
    toast.className = "toast";
    toast.style.backgroundColor = color;
    toast.innerText = message;

    container.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000); // 3 segundos
}


function errorMessage(error) {
    if (error.code === "auth/user-not-found") {
        return "Usuário não encontrado";
    }
    if (error.code === "auth/wrong-password") {
        return "Senha incorreta";
    }
    if (error.code === "auth/invalid-email") {
        return "E-mail inválido";
    }
    if (error.code === "auth/too-many-requests") {
        return "Muitas tentativas. Tente novamente mais tarde.";
    }
    if (error.code === "auth/invalid-credential") {
        return "Credenciais inválidas ou expiradas. Faça login novamente.";
    }
    return error.message;
}


function register(){
    window.location.href = "pages/register/register.html";
}


function recoverPassword() {
    showLoading();

    firebase.auth().sendPasswordResetEmail(form.email().value)
        .then(() => {
            hideLoading();
            showToast("Email de recuperação enviado com sucesso ✅", "#4caf50"); // Verde para sucesso
        })
        .catch(error => {
            hideLoading();
            alert(errorMessage(error));
        });
}




// Funções relacionadas ao Email
function emailValido() {
    const email = form.email().value;

    if (!email) {
        return false;
    }

    return validateEmail(email);
}

function emailError() {
    const email = form.email().value;
    if (!email) {
        form.emailObError().style.display = "block";
    } else {
        form.emailObError().style.display = "none";
    }

    if (validateEmail(email)) {
        form.emailInError().style.display = "none";
    } else {
        form.emailInError().style.display = "block";
    }
}



function passwordError() {
    const senha = form.password().value;
    if (!senha) {
        form.passwordObError().style.display = "block";
    } else {
        form.passwordObError().style.display = "none";
    }
}



function buttonDisabled() {
    const emailVal = emailValido();
    form.recoverPassword().disabled = !emailVal;

    const senhaVal = senhaValida();
    form.loginButton().disabled = !emailVal || !senhaVal;
}


function senhaValida() {
    const senha = form.password().value;
    if (!senha) {
        return false;
    }

    return true;
}



const form = {
    email: () => document.getElementById('email'),
    emailInError: () => document.getElementById('email-in-error'),
    emailObError: () => document.getElementById('email-ob-error'),
    passwordObError: () => document.getElementById('password-ob-error'),
    password: () => document.getElementById('password'),
    recoverPassword: () => document.getElementById('recover-password-button'),
    loginButton: () => document.getElementById('login-button')
}