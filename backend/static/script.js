const API_URL = "http://127.0.0.1:5000";


// ===============================
// SWITCH LOGIN / REGISTER
// ===============================

function showRegister() {

    document
        .getElementById("login-section")
        .classList
        .add("hidden");

    document
        .getElementById("register-section")
        .classList
        .remove("hidden");
}


function showLogin() {

    document
        .getElementById("register-section")
        .classList
        .add("hidden");

    document
        .getElementById("login-section")
        .classList
        .remove("hidden");
}


// ===============================
// REGISTER
// ===============================

document
    .getElementById("register-form")
    .addEventListener("submit", async function(event) {

        event.preventDefault();

        const name =
            document.getElementById("register-name").value;

        const email =
            document.getElementById("register-email").value;

        const password =
            document.getElementById("register-password").value;


        try {

            const response = await fetch(
                `${API_URL}/register`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        name: name,
                        email: email,
                        password: password
                    })
                }
            );


            const data = await response.json();


            if (data.success) {

                document
                    .getElementById("register-message")
                    .textContent =
                    "Account created successfully!";

                setTimeout(
                    showLogin,
                    1000
                );

            } else {

                document
                    .getElementById("register-message")
                    .textContent =
                    data.error;

            }

        } catch (error) {

            document
                .getElementById("register-message")
                .textContent =
                "Cannot connect to server.";

        }

    });


// ===============================
// LOGIN
// ===============================

document
    .getElementById("login-form")
    .addEventListener("submit", async function(event) {

        event.preventDefault();

        const email =
            document.getElementById("login-email").value;

        const password =
            document.getElementById("login-password").value;


        try {

            const response = await fetch(
                `${API_URL}/login`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        email: email,
                        password: password
                    })
                }
            );


            const data = await response.json();


            if (data.success) {

                localStorage.setItem(
                    "user",
                    JSON.stringify(data.user)
                );

                window.location.href =
                    "dashboard.html";

            } else {

                document
                    .getElementById("login-message")
                    .textContent =
                    data.error;

            }

        } catch (error) {

            document
                .getElementById("login-message")
                .textContent =
                "Cannot connect to server.";

        }

    });