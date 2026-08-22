// ============================================================
// EYEAI - UNIFIED SCRIPT
// Handles:
// LOGIN
// REGISTER
// DASHBOARD
// PREDICTION
// HISTORY
// REPORT
// ============================================================

const API_URL = "http://127.0.0.1:5000";

// ============================================================
// PAGE DETECTION
// ============================================================

const isLoginPage =
document.getElementById("login-form") !== null;

const isDashboardPage =
document.getElementById("predict-button") !== null;

// ============================================================
// USER
// ============================================================

let user = null;

try {
user = JSON.parse(
localStorage.getItem("user")
);
}
catch (error) {
user = null;
}

// ============================================================
// UTILITY
// ============================================================

function escapeHTML(value) {

return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}

function showMessage(element, message, success = false) {

if (!element) {
    return;
}

element.textContent = message;

element.style.color =
    success
        ? "#35dcff"
        : "#ff6b7a";

}

function showToast(message, error = false) {

const toast =
    document.getElementById("toast");

const toastMessage =
    document.getElementById("toast-message");

const toastIcon =
    document.getElementById("toast-icon");

if (!toast) {
    return;
}

if (toastMessage) {
    toastMessage.textContent =
        message;
}

if (toastIcon) {
    toastIcon.textContent =
        error ? "!" : "✓";
}

toast.classList.add("show");

setTimeout(() => {
    toast.classList.remove("show");
}, 3000);

}

// ============================================================
// LOGIN / REGISTER PAGE
// ============================================================

if (isLoginPage) {

console.log(
    "EYEAI AUTH PAGE LOADED"
);


// --------------------------------------------------------
// ELEMENTS
// --------------------------------------------------------

const loginSection =
    document.getElementById(
        "login-section"
    );

const registerSection =
    document.getElementById(
        "register-section"
    );


const loginForm =
    document.getElementById(
        "login-form"
    );

const registerForm =
    document.getElementById(
        "register-form"
    );


const loginEmail =
    document.getElementById(
        "login-email"
    );

const loginPassword =
    document.getElementById(
        "login-password"
    );


const registerName =
    document.getElementById(
        "register-name"
    );

const registerEmail =
    document.getElementById(
        "register-email"
    );

const registerPassword =
    document.getElementById(
        "register-password"
    );


const loginMessage =
    document.getElementById(
        "login-message"
    );

const registerMessage =
    document.getElementById(
        "register-message"
    );


const loginButton =
    document.getElementById(
        "login-button"
    );

const registerButton =
    document.getElementById(
        "register-button"
    );


const showRegisterButton =
    document.getElementById(
        "show-register-button"
    );

const showLoginButton =
    document.getElementById(
        "show-login-button"
    );


// --------------------------------------------------------
// SHOW LOGIN
// --------------------------------------------------------

window.showLogin = function () {

    if (loginSection) {
        loginSection.classList.remove(
            "hidden"
        );
    }

    if (registerSection) {
        registerSection.classList.add(
            "hidden"
        );
    }

    if (loginMessage) {
        loginMessage.textContent = "";
    }

    if (registerMessage) {
        registerMessage.textContent = "";
    }
};


// --------------------------------------------------------
// SHOW REGISTER
// --------------------------------------------------------

window.showRegister = function () {

    if (loginSection) {
        loginSection.classList.add(
            "hidden"
        );
    }

    if (registerSection) {
        registerSection.classList.remove(
            "hidden"
        );
    }

    if (loginMessage) {
        loginMessage.textContent = "";
    }

    if (registerMessage) {
        registerMessage.textContent = "";
    }
};


// --------------------------------------------------------
// SWITCH BUTTONS
// --------------------------------------------------------

if (showRegisterButton) {

    showRegisterButton.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            window.showRegister();

        }
    );

}


if (showLoginButton) {

    showLoginButton.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            window.showLogin();

        }
    );

}


// --------------------------------------------------------
// REGISTER
// --------------------------------------------------------

if (registerForm) {

    registerForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            event.stopPropagation();


            const name =
                registerName
                    ? registerName.value.trim()
                    : "";

            const email =
                registerEmail
                    ? registerEmail.value.trim()
                    : "";

            const password =
                registerPassword
                    ? registerPassword.value
                    : "";


            if (!name) {

                showMessage(
                    registerMessage,
                    "Please enter your name."
                );

                return;

            }


            if (!email) {

                showMessage(
                    registerMessage,
                    "Please enter your email."
                );

                return;

            }


            if (password.length < 6) {

                showMessage(
                    registerMessage,
                    "Password must contain at least 6 characters."
                );

                return;

            }


            if (registerButton) {

                registerButton.disabled =
                    true;

                registerButton.textContent =
                    "Creating Account...";

            }


            showMessage(
                registerMessage,
                "Creating your account...",
                true
            );


            try {

                const response =
                    await fetch(
                        `${API_URL}/register`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            credentials:
                                "include",

                            body:
                                JSON.stringify({
                                    name:
                                        name,

                                    email:
                                        email,

                                    password:
                                        password
                                })
                        }
                    );


                const text =
                    await response.text();


                let data;


                try {

                    data =
                        JSON.parse(
                            text
                        );

                }
                catch (error) {

                    throw new Error(
                        "Invalid server response."
                    );

                }


                console.log(
                    "REGISTER RESPONSE:",
                    data
                );


                if (
                    !response.ok ||
                    data.success === false
                ) {

                    throw new Error(
                        data.error ||
                        data.message ||
                        "Registration failed."
                    );

                }


                showMessage(
                    registerMessage,
                    data.message ||
                    "Account created successfully.",
                    true
                );


                // Clear password

                if (registerPassword) {
                    registerPassword.value =
                        "";
                }


                // Go back to login

                setTimeout(
                    function () {

                        window.showLogin();


                        if (loginEmail) {

                            loginEmail.value =
                                email;

                        }


                        if (loginPassword) {

                            loginPassword.focus();

                        }


                        showMessage(
                            loginMessage,
                            "Account created. Please login.",
                            true
                        );

                    },
                    800
                );

            }
            catch (error) {

                console.error(
                    "REGISTER ERROR:",
                    error
                );


                showMessage(
                    registerMessage,
                    error.message ||
                    "Registration failed."
                );

            }
            finally {

                if (registerButton) {

                    registerButton.disabled =
                        false;

                    registerButton.textContent =
                        "Create EyeAI Account";

                }

            }

        }
    );

}


// --------------------------------------------------------
// LOGIN
// --------------------------------------------------------

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            event.stopPropagation();


            const email =
                loginEmail
                    ? loginEmail.value.trim()
                    : "";

            const password =
                loginPassword
                    ? loginPassword.value
                    : "";


            if (!email) {

                showMessage(
                    loginMessage,
                    "Please enter your email."
                );

                return;

            }


            if (!password) {

                showMessage(
                    loginMessage,
                    "Please enter your password."
                );

                return;

            }


            if (loginButton) {

                loginButton.disabled =
                    true;

                loginButton.textContent =
                    "Logging in...";

            }


            showMessage(
                loginMessage,
                "Checking your account...",
                true
            );


            try {

                const response =
                    await fetch(
                        `${API_URL}/login`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            credentials:
                                "include",

                            body:
                                JSON.stringify({
                                    email:
                                        email,

                                    password:
                                        password
                                })
                        }
                    );


                const text =
                    await response.text();


                let data;


                try {

                    data =
                        JSON.parse(
                            text
                        );

                }
                catch (error) {

                    throw new Error(
                        "Invalid server response."
                    );

                }


                console.log(
                    "LOGIN RESPONSE:",
                    data
                );


                if (
                    !response.ok ||
                    data.success === false
                ) {

                    throw new Error(
                        data.error ||
                        data.message ||
                        "Invalid email or password."
                    );

                }


                // ------------------------------------------------
                // SAVE USER
                // ------------------------------------------------

                const loggedUser =
                    data.user ||
                    {
                        id:
                            data.user_id ||
                            data.id,

                        name:
                            data.name ||
                            email.split("@")[0],

                        email:
                            data.email ||
                            email
                    };


                localStorage.setItem(
                    "user",
                    JSON.stringify(
                        loggedUser
                    )
                );


                // Remove old temporary prediction

                localStorage.removeItem(
                    "eyeDiseaseAnalysis"
                );


                showMessage(
                    loginMessage,
                    "Login successful. Opening dashboard...",
                    true
                );


                // ------------------------------------------------
                // DASHBOARD
                // ------------------------------------------------

                setTimeout(
                    function () {

                        window.location.href =
                            "dashboard.html";

                    },
                    400
                );

            }
            catch (error) {

                console.error(
                    "LOGIN ERROR:",
                    error
                );


                showMessage(
                    loginMessage,
                    error.message ||
                    "Login failed."
                );

            }
            finally {

                if (loginButton) {

                    loginButton.disabled =
                        false;

                    loginButton.textContent =
                        "Login to EyeAI";

                }

            }

        }
    );

}


// STOP ALL DASHBOARD CODE

console.log(
    "AUTH PAGE READY"
);

}

// ============================================================
// DASHBOARD PAGE
// ============================================================

if (isDashboardPage) {

console.log(
    "EYEAI DASHBOARD LOADED"
);


// ========================================================
// USER CHECK
// ========================================================

if (
    !user ||
    !user.id
) {

    console.log(
        "No logged-in user."
    );


    window.location.href =
        "index.html";

}


// ========================================================
// ELEMENTS
// ========================================================

const welcomeMessage =
    document.getElementById(
        "welcome-message"
    );

const logoutButton =
    document.getElementById(
        "logout-button"
    );


const uploadArea =
    document.getElementById(
        "upload-area"
    );

const uploadEmpty =
    document.getElementById(
        "upload-empty"
    );

const imageInput =
    document.getElementById(
        "image-input"
    );

const browseButton =
    document.getElementById(
        "browse-button"
    );

const changeImageButton =
    document.getElementById(
        "change-image-button"
    );

const imagePreviewContainer =
    document.getElementById(
        "image-preview-container"
    );

const imagePreview =
    document.getElementById(
        "image-preview"
    );

const selectedImageName =
    document.getElementById(
        "selected-image-name"
    );

const analyzeButton =
    document.getElementById(
        "predict-button"
    );

const buttonText =
    document.querySelector(
        ".button-text"
    );

const uploadMessage =
    document.getElementById(
        "upload-message"
    );

const analyzingState =
    document.getElementById(
        "analyzing-state"
    );


const resultSection =
    document.getElementById(
        "result-section"
    );

const imageType =
    document.getElementById(
        "image-type"
    );

const modelUsed =
    document.getElementById(
        "model-used"
    );

const imageTypeConfidence =
    document.getElementById(
        "image-type-confidence"
    );

const prediction =
    document.getElementById(
        "prediction"
    );

const confidence =
    document.getElementById(
        "confidence"
    );

const confidenceBar =
    document.getElementById(
        "confidence-bar"
    );

const probabilities =
    document.getElementById(
        "probabilities"
    );


const diseaseFullName =
    document.getElementById(
        "disease-full-name"
    );

const diseaseRiskLevel =
    document.getElementById(
        "disease-risk-level"
    );

const diseaseDescription =
    document.getElementById(
        "disease-description"
    );

const diseaseRecommendation =
    document.getElementById(
        "disease-recommendation"
    );


const history =
    document.getElementById(
        "history"
    );

const historyCount =
    document.getElementById(
        "history-count"
    );


const totalScans =
    document.getElementById(
        "total-scans"
    );

const weeklyScans =
    document.getElementById(
        "weekly-scans"
    );

const mostDetected =
    document.getElementById(
        "most-detected"
    );

const averageConfidence =
    document.getElementById(
        "average-confidence"
    );


const generateReportButton =
    document.getElementById(
        "generate-report-button"
    );

const printReportButton =
    document.getElementById(
        "print-report-button"
    );


// ========================================================
// CURRENT DATA
// ========================================================

let currentImageFile =
    null;

let currentPreviewURL =
    null;

let currentPredictionId =
    null;

let currentPredictionData =
    null;


// ========================================================
// WELCOME
// ========================================================

if (
    welcomeMessage &&
    user
) {

    welcomeMessage.textContent =
        `Welcome, ${user.name || "User"}`;

}


// ========================================================
// LOGOUT
// ========================================================

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        async function () {

            try {

                await fetch(
                    `${API_URL}/logout`,
                    {
                        method: "POST",
                        credentials: "include"
                    }
                );

            }
            catch (error) {

                console.error(
                    error
                );

            }


            localStorage.removeItem(
                "user"
            );

            localStorage.removeItem(
                "eyeDiseaseAnalysis"
            );


            window.location.href =
                "index.html";

        }
    );

}


// ========================================================
// FILE PICKER
// ========================================================

function openFilePicker() {

    if (imageInput) {

        imageInput.click();

    }

}


if (browseButton) {

    browseButton.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            event.stopPropagation();

            openFilePicker();

        }
    );

}


if (changeImageButton) {

    changeImageButton.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            event.stopPropagation();

            openFilePicker();

        }
    );

}


// ========================================================
// FILE INPUT
// ========================================================

if (imageInput) {

    imageInput.addEventListener(
        "change",
        function () {

            const file =
                imageInput.files &&
                imageInput.files[0];


            if (file) {

                handleImage(
                    file
                );

            }

        }
    );

}


// ========================================================
// VALIDATION
// ========================================================

function validateImage(file) {

    const allowed =
        [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp"
        ];


    if (!file) {

        return {
            valid: false,
            message:
                "Please select an image."
        };

    }


    if (
        !allowed.includes(
            file.type
        )
    ) {

        return {
            valid: false,
            message:
                "Use JPG, JPEG, PNG or WEBP."
        };

    }


    if (
        file.size >
        10 * 1024 * 1024
    ) {

        return {
            valid: false,
            message:
                "Image must be smaller than 10 MB."
        };

    }


    return {
        valid: true
    };

}


// ========================================================
// HANDLE IMAGE
// ========================================================

function handleImage(file) {

    const validation =
        validateImage(
            file
        );


    if (!validation.valid) {

        showToast(
            validation.message,
            true
        );

        return;

    }


    currentImageFile =
        file;

    currentPredictionId =
        null;

    currentPredictionData =
        null;


    if (currentPreviewURL) {

        URL.revokeObjectURL(
            currentPreviewURL
        );

    }


    currentPreviewURL =
        URL.createObjectURL(
            file
        );


    if (imagePreview) {

        imagePreview.src =
            currentPreviewURL;

        imagePreview.style.display =
            "block";

    }


    if (imagePreviewContainer) {

        imagePreviewContainer.style.display =
            "block";

    }


    if (uploadEmpty) {

        uploadEmpty.style.display =
            "none";

    }


    if (selectedImageName) {

        selectedImageName.textContent =
            file.name;

    }


    if (uploadMessage) {

        uploadMessage.textContent =
            "Image ready for analysis.";

    }


    clearResult();

}


// ========================================================
// DRAG & DROP
// ========================================================

if (uploadArea) {

    uploadArea.addEventListener(
        "dragover",
        function (event) {

            event.preventDefault();

            uploadArea.classList.add(
                "dragover"
            );

        }
    );


    uploadArea.addEventListener(
        "dragleave",
        function () {

            uploadArea.classList.remove(
                "dragover"
            );

        }
    );


    uploadArea.addEventListener(
        "drop",
        function (event) {

            event.preventDefault();

            uploadArea.classList.remove(
                "dragover"
            );


            const file =
                event.dataTransfer.files[0];


            if (file) {

                handleImage(
                    file
                );

            }

        }
    );

}


// ========================================================
// CLEAR RESULT
// ========================================================

function clearResult() {

    if (resultSection) {

        resultSection.classList.add(
            "hidden"
        );

    }


    if (prediction) {
        prediction.textContent = "-";
    }


    if (confidence) {
        confidence.textContent = "-";
    }


    if (confidenceBar) {
        confidenceBar.style.width = "0%";
    }


    if (imageType) {
        imageType.textContent = "-";
    }


    if (modelUsed) {
        modelUsed.textContent = "-";
    }


    if (imageTypeConfidence) {
        imageTypeConfidence.textContent = "-";
    }


    if (probabilities) {
        probabilities.innerHTML = "";
    }

}


// ========================================================
// ANALYZE
// ========================================================

if (analyzeButton) {

    analyzeButton.addEventListener(
        "click",
        async function () {

            const file =
                currentImageFile ||
                (
                    imageInput &&
                    imageInput.files &&
                    imageInput.files[0]
                );


            if (!file) {

                showToast(
                    "Please select an image first.",
                    true
                );

                return;

            }


            analyzeButton.disabled =
                true;


            if (buttonText) {

                buttonText.textContent =
                    "Analyzing...";

            }


            if (analyzingState) {

                analyzingState.style.display =
                    "flex";

            }


            const formData =
                new FormData();


            formData.append(
                "image",
                file
            );


            formData.append(
                "user_id",
                user.id
            );


            try {

                const response =
                    await fetch(
                        `${API_URL}/predict`,
                        {
                            method: "POST",
                            body: formData,
                            credentials: "include"
                        }
                    );


                const text =
                    await response.text();


                let data;


                try {

                    data =
                        JSON.parse(
                            text
                        );

                }
                catch (error) {

                    throw new Error(
                        "Invalid response from server."
                    );

                }


                console.log(
                    "PREDICTION:",
                    data
                );


                if (
                    !response.ok ||
                    !data.success
                ) {

                    throw new Error(
                        data.error ||
                        "Prediction failed."
                    );

                }


                currentPredictionId =
                    data.prediction_id ||
                    data.id;


                currentPredictionData =
                    data;


                showResult(
                    data
                );


                await loadHistory();

                await loadStatistics();


                showToast(
                    "Analysis completed successfully."
                );

            }
            catch (error) {

                console.error(
                    "PREDICTION ERROR:",
                    error
                );


                showToast(
                    error.message ||
                    "Prediction failed.",
                    true
                );

            }
            finally {

                analyzeButton.disabled =
                    false;


                if (buttonText) {

                    buttonText.textContent =
                        "Analyze Image";

                }


                if (analyzingState) {

                    analyzingState.style.display =
                        "none";

                }

            }

        }
    );

}


// ========================================================
// SHOW RESULT
// ========================================================

function showResult(data) {

    if (resultSection) {

        resultSection.classList.remove(
            "hidden"
        );

        resultSection.style.display =
            "block";

    }


    if (imageType) {

        imageType.textContent =
            data.image_type ||
            "Unknown";

    }


    if (modelUsed) {

        modelUsed.textContent =
            data.model_type ||
            data.model ||
            "AI";

    }


    let detection =
        Number(
            data.image_type_confidence
        );


    if (
        Number.isFinite(
            detection
        )
    ) {

        if (
            detection <= 1
        ) {

            detection *= 100;

        }


        detection =
            Math.min(
                100,
                Math.max(
                    0,
                    detection
                )
            );


        if (imageTypeConfidence) {

            imageTypeConfidence.textContent =
                detection.toFixed(2) +
                "%";

        }

    }


    let predicted =
        data.prediction ||
        data.predicted_class ||
        "Unknown";

    /* Safely handle either a string or an object. */
    if (
        typeof predicted === "object" &&
        predicted !== null
    ) {

        predicted =
            predicted.predicted_class ||
            predicted.prediction ||
            predicted.class_name ||
            predicted.label ||
            predicted.name ||
            "Unknown";
    }

    predicted =
        String(predicted).trim() ||
        "Unknown";


    if (prediction) {

        prediction.textContent =
            predicted;

    }


    let conf =
        Number(
            data.confidence
        );


    if (
        Number.isFinite(
            conf
        ) &&
        conf <= 1
    ) {

        conf *= 100;

    }


    if (
        !Number.isFinite(
            conf
        )
    ) {

        conf = 0;

    }


    conf =
        Math.min(
            100,
            Math.max(
                0,
                conf
            )
        );


    if (confidence) {

        confidence.textContent =
            conf.toFixed(2) +
            "%";

    }


    if (confidenceBar) {

        setTimeout(
            function () {

                confidenceBar.style.width =
                    conf + "%";

            },
            100
        );

    }


    showProbabilities(
        data.probabilities ||
        {}
    );


    showDiseaseInformation(
        predicted
    );

    showCareGuidance(predicted);


    if (resultSection) {

        setTimeout(
            function () {

                resultSection.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            },
            200
        );

    }

}


// ========================================================
// PROBABILITIES
// ========================================================

function showProbabilities(data) {

    if (!probabilities) {
        return;
    }


    probabilities.innerHTML =
        "";


    if (
        !data ||
        typeof data !== "object" ||
        Object.keys(data).length === 0
    ) {

        probabilities.innerHTML =
            "<p>No probability data available.</p>";

        return;

    }


    Object.entries(data)
        .sort(
            (a, b) =>
                Number(b[1]) -
                Number(a[1])
        )
        .forEach(
            function (
                [name, value]
            ) {

                let percent =
                    Number(value);


                if (
                    Number.isFinite(
                        percent
                    ) &&
                    percent <= 1
                ) {

                    percent *= 100;

                }


                if (
                    !Number.isFinite(
                        percent
                    )
                ) {

                    percent = 0;

                }


                percent =
                    Math.min(
                        100,
                        Math.max(
                            0,
                            percent
                        )
                    );


                const row =
                    document.createElement(
                        "div"
                    );


                row.className =
                    "probability-row";


                row.innerHTML = `

                    <div class="probability-label">

                        <span>
                            ${escapeHTML(name)}
                        </span>

                        <strong>
                            ${percent.toFixed(2)}%
                        </strong>

                    </div>

                    <div class="probability-bar">

                        <div
                            class="probability-fill"
                            style="width:${percent}%"
                        ></div>

                    </div>

                `;


                probabilities.appendChild(
                    row
                );

            }
        );

}


// ========================================================
// DISEASE INFORMATION
// ========================================================

const diseaseInfo = {

    "Healthy": {
        name: "Healthy",
        risk: "Low risk",
        about:
            "The AI model classified the image as healthy within the classes it was trained on.",
        recommendation:
            "Continue routine eye examinations."
    },

    "NORMAL": {
        name: "Normal",
        risk: "Low risk",
        about:
            "The OCT model classified the scan as normal.",
        recommendation:
            "Continue routine eye examinations."
    },

    "Myopia": {
        name: "Myopia",
        risk: "Needs attention",
        about:
            "Myopia, or nearsightedness, affects how distant objects are focused on the retina.",
        recommendation:
            "Consider a professional eye examination."
    },

    "Glaucoma": {
        name: "Glaucoma",
        risk: "Needs attention",
        about:
            "Glaucoma is associated with damage to the optic nerve and may affect vision.",
        recommendation:
            "Consider a comprehensive eye examination."
    },

    "Diabetic Retinopathy": {
        name: "Diabetic Retinopathy",
        risk: "Needs attention",
        about:
            "A retinal condition associated with diabetes.",
        recommendation:
            "Consider professional retinal evaluation."
    },

    "DR": {
        name: "Diabetic Retinopathy",
        risk: "Needs attention",
        about:
            "A retinal condition associated with diabetes.",
        recommendation:
            "Consider professional retinal evaluation."
    },

    "DME": {
        name: "Diabetic Macular Edema",
        risk: "Needs attention",
        about:
            "A condition involving swelling or fluid accumulation in the macular region.",
        recommendation:
            "Consider professional retinal evaluation."
    },

    "CNV": {
        name: "Choroidal Neovascularization",
        risk: "Needs attention",
        about:
            "An OCT classification associated with abnormal blood-vessel growth beneath the retina.",
        recommendation:
            "Consider retinal specialist evaluation."
    },

    "DRUSEN": {
        name: "Drusen",
        risk: "Needs attention",
        about:
            "Drusen are deposits that can appear beneath the retina.",
        recommendation:
            "Consider an eye examination."
    },

    "ODC": {
    name: "Optic Disc Condition",
    risk: "Needs attention",
    urgency: "prompt",

    summary:
        "The AI model classified the uploaded image as ODC. This is an AI screening result and should be clinically assessed rather than treated as a confirmed diagnosis.",

    about:
        "ODC refers to an optic-disc-related classification produced by the model. The actual cause and clinical significance cannot be determined from the AI result alone.",

    recommendation:
        "Arrange a comprehensive eye examination and discuss the result with a qualified eye-care professional.",

    examination: [
        "Comprehensive eye examination",
        "Optic-nerve / optic-disc evaluation",
        "Dilated eye examination when clinically appropriate"
    ],

    tests: [
        "Eye-pressure measurement (tonometry) when clinically appropriate",
        "Visual-field testing when recommended",
        "Optic-nerve / retinal imaging when recommended"
    ],

    habits: [
        "Follow the examination and monitoring plan recommended by your eye-care professional",
        "Do not start or stop eye medication without professional advice",
        "Monitor for new or worsening vision changes"
    ],

    followup:
        "Arrange professional eye-care assessment to confirm the finding and determine whether further monitoring or testing is needed.",

    warnings: [
        "Sudden vision loss",
        "Severe eye pain",
        "Sudden major change in vision",
        "Sudden blurred vision with a red eye"
    ]
},

    "Macular Scar": {
        name: "Macular Scar",
        risk: "Needs attention",
        about:
            "A scar affecting the macular region can potentially influence central vision.",
        recommendation:
            "Consider professional retinal evaluation."
    },

    "MH": {
        name: "Macular Hole",
        risk: "Needs attention",
        about:
            "A condition involving the macular region of the retina.",
        recommendation:
            "Consider professional retinal evaluation."
    },

    "ODC": {
        name: "Optic Disc Condition",
        risk: "Needs attention",
        about:
            "The model identified an optic-disc-related finding.",
        recommendation:
            "Consider a comprehensive eye examination."
    }

};


function showDiseaseInformation(name) {

    let info =
        diseaseInfo[name];


    if (!info) {

        const lower =
            String(
                name
            ).toLowerCase();


        for (
            const key in diseaseInfo
        ) {

            if (
                key.toLowerCase() ===
                lower
            ) {

                info =
                    diseaseInfo[key];

                break;

            }

        }

    }


    if (!info) {

        info = {

            name:
                name || "Unknown",

            risk:
                "Unknown",

            about:
                "No additional information is configured for this classification.",

            recommendation:
                "Consult a qualified eye-care professional for clinical interpretation."

        };

    }


    if (diseaseFullName) {

        diseaseFullName.textContent =
            info.name;

    }


    if (diseaseRiskLevel) {

        diseaseRiskLevel.textContent =
            info.risk;

    }


    if (diseaseDescription) {

        diseaseDescription.textContent =
            info.about;

    }


    if (diseaseRecommendation) {

        diseaseRecommendation.textContent =
            info.recommendation;

    }

}


// ========================================================
// CARE / NEXT-STEP GUIDANCE
// ========================================================

const careGuidance = {


        // ====================================================
        // ODC
        // ====================================================

        "ODC": {

            meaning:
                "The AI model classified this image as ODC. This is an AI screening classification and should not be treated as a confirmed diagnosis. Clinical examination is required to understand the finding.",

            examination: [
                "Comprehensive eye examination.",
                "Optic-disc and optic-nerve assessment.",
                "Eye-pressure measurement when clinically appropriate.",
                "Visual-field testing may be recommended by the eye-care professional."
            ],

            tests: [
                "Optic-nerve or retinal imaging.",
                "Intraocular-pressure measurement when appropriate.",
                "Visual-field examination when recommended.",
                "Additional tests may be selected based on the clinical examination."
            ],

            habits: [
                "Attend regular eye examinations.",
                "Do not start, stop, or change eye medication without professional advice.",
                "Monitor for new or worsening vision changes.",
                "Maintain general eye health and follow your clinician's recommendations."
            ],

            followup:
                "Arrange an eye-care appointment so the AI finding can be clinically evaluated and an appropriate follow-up interval can be decided.",

            urgent: [
                "Sudden loss of vision.",
                "Severe or sudden eye pain.",
                "Sudden major change in vision.",
                "Sudden flashes or a large increase in floaters."
            ],

            urgency:
                "MODERATE"
        },


        // ====================================================
        // DIABETIC RETINOPATHY
        // ====================================================

        "DR": {

            meaning:
                "The AI model classified the retinal image as Diabetic Retinopathy. Diabetic retinopathy is associated with retinal changes related to diabetes. An AI screening result should be confirmed clinically.",

            examination: [
                "Comprehensive dilated retinal examination.",
                "Retinal assessment by an eye-care professional.",
                "Assessment of diabetes control and relevant medical history."
            ],

            tests: [
                "Retinal photography or examination.",
                "OCT when clinically indicated.",
                "Additional retinal imaging if recommended."
            ],

            habits: [
                "Keep diabetes-management appointments.",
                "Follow your prescribed diabetes-management plan.",
                "Monitor blood pressure and other cardiovascular risk factors with your healthcare team.",
                "Attend scheduled eye examinations."
            ],

            followup:
                "Arrange a professional retinal examination. The appropriate follow-up interval depends on the clinical findings and diabetes status.",

            urgent: [
                "Sudden loss or major reduction of vision.",
                "Sudden increase in floaters.",
                "Flashes of light.",
                "A dark curtain or shadow across vision."
            ],

            urgency:
                "MODERATE"
        },


        "Diabetic Retinopathy": {

            meaning:
                "The AI model classified the retinal image as Diabetic Retinopathy. This is a screening result and should be clinically evaluated.",

            examination: [
                "Comprehensive dilated retinal examination.",
                "Retinal assessment by an eye-care professional."
            ],

            tests: [
                "Retinal examination or photography.",
                "OCT when clinically indicated."
            ],

            habits: [
                "Follow your prescribed diabetes-management plan.",
                "Attend regular eye examinations.",
                "Monitor general health factors with your healthcare team."
            ],

            followup:
                "Arrange professional retinal evaluation and follow the schedule recommended by the eye-care professional.",

            urgent: [
                "Sudden vision loss.",
                "Sudden increase in floaters.",
                "Flashes of light.",
                "A dark curtain or shadow in your vision."
            ],

            urgency:
                "MODERATE"
        },


        // ====================================================
        // DME
        // ====================================================

        "DME": {

            meaning:
                "The OCT model classified the scan as Diabetic Macular Edema. This classification may indicate retinal fluid or swelling involving the macular region and requires professional interpretation.",

            examination: [
                "Comprehensive retinal examination.",
                "OCT assessment by an eye-care professional.",
                "Review of diabetes history when relevant."
            ],

            tests: [
                "OCT imaging.",
                "Dilated retinal examination.",
                "Additional retinal imaging if clinically required."
            ],

            habits: [
                "Follow your prescribed diabetes-management plan.",
                "Attend scheduled eye appointments.",
                "Do not use eye medication without professional advice."
            ],

            followup:
                "Arrange a retinal evaluation to determine whether the OCT finding represents clinically significant disease and what follow-up is appropriate.",

            urgent: [
                "Sudden loss of vision.",
                "Rapid worsening of vision.",
                "New distortion or major visual change."
            ],

            urgency:
                "MODERATE"
        },


        // ====================================================
        // CNV
        // ====================================================

        "CNV": {

            meaning:
                "The OCT model classified the scan as CNV, or choroidal neovascularization. This is a significant retinal finding that requires professional assessment and should not be treated as a confirmed diagnosis from AI alone.",

            examination: [
                "Comprehensive retinal examination.",
                "Retina-specialist assessment may be appropriate.",
                "Detailed OCT review."
            ],

            tests: [
                "OCT imaging.",
                "Dilated retinal examination.",
                "Additional retinal imaging when clinically indicated."
            ],

            habits: [
                "Attend retinal follow-up appointments.",
                "Report new distortion or vision changes promptly.",
                "Do not delay professional assessment because the image is only an AI screening result."
            ],

            followup:
                "Arrange professional retinal assessment promptly so the finding can be confirmed and an appropriate management plan can be determined.",

            urgent: [
                "Sudden or rapidly worsening vision.",
                "New distortion of straight lines.",
                "Sudden central vision changes.",
                "New dark or missing area in central vision."
            ],

            urgency:
                "HIGH"
        },


        // ====================================================
        // DRUSEN
        // ====================================================

        "DRUSEN": {

            meaning:
                "The OCT model classified the scan as Drusen. Drusen are deposits that can occur beneath the retina. Their significance depends on their number, size, location, and clinical context.",

            examination: [
                "Comprehensive retinal examination.",
                "OCT review by an eye-care professional.",
                "Dilated eye examination when appropriate."
            ],

            tests: [
                "OCT imaging.",
                "Retinal photography.",
                "Additional retinal imaging when clinically indicated."
            ],

            habits: [
                "Attend routine eye examinations.",
                "Monitor for new distortion or changes in central vision.",
                "Avoid smoking and discuss general eye-health measures with your clinician."
            ],

            followup:
                "Arrange an eye examination to determine the significance of the finding and the appropriate monitoring interval.",

            urgent: [
                "New distortion of straight lines.",
                "Sudden central vision change.",
                "New dark or missing area in central vision."
            ],

            urgency:
                "MODERATE"
        },


        // ====================================================
        // NORMAL
        // ====================================================

        "NORMAL": {

            meaning:
                "The OCT model classified the scan as normal within the classes it was trained to recognize. A normal AI result does not rule out every possible eye condition.",

            examination: [
                "Continue routine eye examinations based on your age, risk factors, and professional advice."
            ],

            tests: [
                "No additional test is automatically recommended from this AI result alone.",
                "Additional testing may be appropriate if symptoms or risk factors are present."
            ],

            habits: [
                "Attend routine eye examinations.",
                "Protect your eyes from injury and excessive UV exposure.",
                "Seek professional assessment if new vision symptoms develop."
            ],

            followup:
                "Continue routine eye care unless an eye-care professional recommends a different schedule.",

            urgent: [
                "Sudden vision loss.",
                "Severe eye pain.",
                "Sudden major visual changes.",
                "Sudden flashes or a large increase in floaters."
            ],

            urgency:
                "LOW"
        },


        // ====================================================
        // HEALTHY
        // ====================================================

        "Healthy": {

            meaning:
                "The AI model classified the image as Healthy within its trained classes. This is a screening result and does not guarantee that every eye condition has been excluded.",

            examination: [
                "Continue routine eye examinations."
            ],

            tests: [
                "No additional test is automatically recommended from this result alone."
            ],

            habits: [
                "Maintain regular eye examinations.",
                "Protect your eyes from injury and excessive UV exposure.",
                "Seek professional advice if vision changes occur."
            ],

            followup:
                "Continue routine eye care according to your normal examination schedule.",

            urgent: [
                "Sudden vision loss.",
                "Severe eye pain.",
                "Sudden major change in vision."
            ],

            urgency:
                "LOW"
        },


        // ====================================================
        // GLAUCOMA
        // ====================================================

        "Glaucoma": {

            meaning:
                "The AI model classified the image as Glaucoma. Glaucoma can involve damage to the optic nerve, but an AI image classification alone cannot confirm the condition.",

            examination: [
                "Comprehensive eye examination.",
                "Optic-nerve assessment.",
                "Eye-pressure measurement.",
                "Visual-field assessment when clinically appropriate."
            ],

            tests: [
                "Intraocular-pressure measurement.",
                "Optic-nerve imaging.",
                "Visual-field testing.",
                "Additional glaucoma assessment when recommended."
            ],

            habits: [
                "Attend recommended eye appointments.",
                "Use prescribed eye medication exactly as directed if medication has been prescribed.",
                "Do not stop glaucoma medication without professional advice."
            ],

            followup:
                "Arrange a comprehensive eye examination to confirm the finding and determine an appropriate monitoring schedule.",

            urgent: [
                "Sudden severe eye pain.",
                "Sudden blurred vision.",
                "Severe headache with eye symptoms.",
                "Sudden vision loss."
            ],

            urgency:
                "MODERATE"
        },


        // ====================================================
        // MYOPIA
        // ====================================================

        "Myopia": {

            meaning:
                "The AI model classified the image as Myopia within its trained classes. Myopia affects distance vision and should be assessed through a professional eye examination.",

            examination: [
                "Comprehensive eye examination.",
                "Visual-acuity assessment.",
                "Refraction assessment."
            ],

            tests: [
                "Visual-acuity testing.",
                "Refraction.",
                "Additional retinal examination when clinically appropriate."
            ],

            habits: [
                "Follow the corrective-lens prescription provided by an eye-care professional.",
                "Take regular breaks during prolonged near work.",
                "Spend appropriate time outdoors as part of general eye-health habits.",
                "Attend routine eye examinations."
            ],

            followup:
                "Arrange a professional eye examination if your vision is changing or if you have not had a recent assessment.",

            urgent: [
                "Sudden vision loss.",
                "Sudden flashes.",
                "Sudden large increase in floaters.",
                "A dark curtain or shadow across vision."
            ],

            urgency:
                "LOW"
        },


        // ====================================================
        // MACULAR SCAR
        // ====================================================

        "Macular Scar": {

            meaning:
                "The AI model classified the image as Macular Scar. A scar involving the macular region can affect central vision, but the AI result requires professional confirmation.",

            examination: [
                "Comprehensive retinal examination.",
                "Macular assessment.",
                "OCT examination when clinically appropriate."
            ],

            tests: [
                "OCT imaging.",
                "Retinal photography.",
                "Additional retinal imaging when recommended."
            ],

            habits: [
                "Monitor for changes in central vision.",
                "Attend scheduled retinal examinations.",
                "Report new distortion or worsening vision to an eye-care professional."
            ],

            followup:
                "Arrange retinal evaluation to confirm the finding and determine appropriate monitoring.",

            urgent: [
                "Sudden central vision loss.",
                "Rapid worsening of vision.",
                "New distortion of straight lines."
            ],

            urgency:
                "MODERATE"
        }
        ,
        "MH": {
            meaning: "The AI model classified the scan as Macular Hole. This is an AI screening result and requires professional confirmation.",
            examination: ["Comprehensive retinal examination.", "Macular and OCT assessment by an eye-care professional."],
            tests: ["OCT imaging.", "Additional retinal imaging when clinically indicated."],
            habits: ["Monitor for new or worsening central-vision changes.", "Attend recommended retinal follow-up.", "Do not start or stop eye medication without professional advice."],
            followup: "Arrange professional retinal evaluation to confirm the finding and determine appropriate follow-up.",
            urgent: ["Sudden or rapidly worsening vision.", "New central vision loss or distortion."],
            urgency: "HIGH"
        },
        "Macular Scar": {
            meaning: "The AI model classified the image as Macular Scar. This screening result requires clinical interpretation.",
            examination: ["Comprehensive retinal examination.", "Macular assessment and OCT when appropriate."],
            tests: ["OCT imaging.", "Retinal photography when clinically indicated."],
            habits: ["Monitor central vision for new changes or distortion.", "Attend scheduled retinal examinations."],
            followup: "Arrange retinal evaluation to confirm the finding and determine an appropriate monitoring schedule.",
            urgent: ["Sudden central vision loss.", "Rapid worsening of vision.", "New distortion of straight lines."],
            urgency: "MODERATE"
        },
        "TSLN": {
            meaning: "The AI model classified the image as TSLN. This is a screening classification and should be clinically assessed before drawing conclusions.",
            examination: ["Comprehensive eye examination.", "Retinal or optic-nerve assessment as clinically appropriate."],
            tests: ["Retinal imaging when recommended.", "Additional testing based on the clinical examination."],
            habits: ["Monitor for new or worsening vision changes.", "Attend professional eye examinations."],
            followup: "Arrange an eye-care assessment to confirm the finding and determine follow-up.",
            urgent: ["Sudden vision loss.", "Severe eye pain.", "Sudden major visual changes."],
            urgency: "MODERATE"
        },
        "Disease_Risk": {
            meaning: "The AI model classified the image as Disease Risk. This indicates a screening flag rather than a confirmed diagnosis.",
            examination: ["Comprehensive eye examination.", "Review the finding with a qualified eye-care professional."],
            tests: ["Retinal imaging or OCT when clinically indicated.", "Additional tests selected after examination."],
            habits: ["Monitor for changes in vision.", "Follow the examination plan recommended by your eye-care professional."],
            followup: "Arrange professional eye-care assessment to determine whether further testing or monitoring is needed.",
            urgent: ["Sudden vision loss.", "Severe eye pain.", "Sudden major visual changes."],
            urgency: "MODERATE"
        }

    };


    
// ========================================================
    // NORMALIZE DISEASE NAME
    // ========================================================

    function normalizeDiseaseName(
        disease
    ) {

        if (
            disease === null ||
            disease === undefined
        ) {

            return "";
        }


        const original =
            String(
                disease
            ).trim();


        const lower =
            original.toLowerCase();


        const aliases = {

            "odc":
                "ODC",

            "optic disc condition":
                "ODC",

            "optic disc":
                "ODC",

            "dr":
                "DR",

            "diabetic retinopathy":
                "Diabetic Retinopathy",

            "dme":
                "DME",

            "diabetic macular edema":
                "DME",

            "cnv":
                "CNV",

            "choroidal neovascularization":
                "CNV",

            "drusen":
                "DRUSEN",

            "normal":
                "NORMAL",

            "healthy":
                "Healthy",

            "glaucoma":
                "Glaucoma",

            "myopia":
                "Myopia",

            "macular scar":
                "Macular Scar",

            "mh":
                "MH",

            "tsln":
                "TSLN",

            "disease_risk":
                "Disease_Risk"
        };


        return (
            aliases[lower] ||
            original
        );
    }


    // ========================================================
    // CREATE BULLET LIST
    // ========================================================

    function createCareList(
        items
    ) {

        if (
            !Array.isArray(items) ||
            items.length === 0
        ) {

            return "";
        }


        return items
            .map(
                function (item) {

                    return `
                        <li>
                            ${escapeHTML(item)}
                        </li>
                    `;
                }
            )
            .join("");
    }


    // ========================================================
    // RENDER CARE LIST
    // ========================================================

    function renderCareList(
        element,
        items
    ) {

        if (!element) {
            return;
        }

        let list = items;

        if (
            list === null ||
            list === undefined
        ) {
            list = [];
        }

        if (!Array.isArray(list)) {
            list = [list];
        }

        list = list
            .filter(function (item) {
                return (
                    item !== null &&
                    item !== undefined &&
                    String(item).trim() !== ""
                );
            })
            .map(function (item) {
                return String(item);
            });

        element.innerHTML =
            createCareList(list);

        element.style.display =
            list.length > 0
                ? "block"
                : "none";
    }


    // ========================================================
    // SHOW CARE GUIDANCE
    // ========================================================

    function getCareGuidanceForDisease(disease) {

        if (
            disease === null ||
            disease === undefined
        ) {
            return null;
        }

        /*
         * The prediction API returns the class as a string.
         * This helper also safely handles an object in case an
         * older backend returns { predicted_class: "ODC" }.
         */
        let name = disease;

        if (
            typeof name === "object"
        ) {
            name =
                name.predicted_class ||
                name.prediction ||
                name.class_name ||
                name.label ||
                name.name ||
                "";
        }

        name = String(name).trim();

        if (!name) {
            return null;
        }

        const normalized =
            normalizeDiseaseName(name);

        /* Exact normalized lookup. */
        if (
            careGuidance &&
            careGuidance[normalized]
        ) {
            return careGuidance[normalized];
        }

        /* Exact original lookup. */
        if (
            careGuidance &&
            careGuidance[name]
        ) {
            return careGuidance[name];
        }

        /* Case-insensitive lookup. */
        const wanted =
            normalized.toLowerCase();

        if (careGuidance) {

            const keys =
                Object.keys(
                    careGuidance
                );

            for (
                let i = 0;
                i < keys.length;
                i++
            ) {

                const key =
                    String(
                        keys[i]
                    ).trim();

                if (
                    key.toLowerCase() ===
                    wanted
                ) {
                    return careGuidance[key];
                }
            }
        }

        return null;
    }


    function showCareGuidance(
        disease
    ) {

        console.log(
            "[EyeAI] showCareGuidance:",
            disease
        );

        const guidance =
            getCareGuidanceForDisease(
                disease
            );

        console.log(
            "[EyeAI] guidance found:",
            !!guidance
        );

        if (!guidance) {

            console.warn(
                "[EyeAI] No care guidance configured for:",
                disease
            );

            renderCareContent({

                meaning:
                    "The AI model produced a screening classification. This result should not be treated as a confirmed diagnosis.",

                examination: [
                    "Arrange a comprehensive eye examination.",
                    "Discuss this AI screening result with a qualified eye-care professional."
                ],

                tests: [
                    "Additional testing should be selected by an eye-care professional based on the examination and symptoms."
                ],

                habits: [
                    "Monitor for new or worsening vision changes.",
                    "Do not start, stop, or change eye medication without professional advice."
                ],

                followup:
                    "Arrange professional eye-care assessment to interpret this AI screening result.",

                urgent: [
                    "Sudden loss of vision.",
                    "Severe or sudden eye pain.",
                    "Sudden major change in vision."
                ],

                urgency:
                    "MODERATE"
            });

            return;
        }

        renderCareContent(
            guidance
        );
    }


    // ========================================================
    // RENDER CARE CONTENT
    // ========================================================

    function renderCareContent(
        guidance
    ) {

        const careMeaning =
            document.getElementById(
                "care-meaning"
            );

        const careExamination =
            document.getElementById(
                "care-examination"
            );

        const careTests =
            document.getElementById(
                "care-tests"
            );

        const careHabits =
            document.getElementById(
                "care-habits"
            );

        const careFollowup =
            document.getElementById(
                "care-followup"
            );

        const careWarningSigns =
            document.getElementById(
                "care-warning-signs"
            );

        const careSummary =
            document.getElementById(
                "care-summary"
            );

        const careUrgencyBadge =
            document.getElementById(
                "care-urgency-badge"
            );


        console.log(
            "[EyeAI] care elements:",
            {
                meaning: !!careMeaning,
                examination: !!careExamination,
                tests: !!careTests,
                habits: !!careHabits,
                followup: !!careFollowup,
                warning: !!careWarningSigns,
                summary: !!careSummary,
                urgency: !!careUrgencyBadge
            }
        );


        if (!guidance) {
            return;
        }


        // ----------------------------------------------------
        // WHAT THIS RESULT MEANS
        // ----------------------------------------------------

        if (careMeaning) {

            careMeaning.textContent =
                guidance.meaning ||
                "—";
        }


        // ----------------------------------------------------
        // RECOMMENDED EXAMINATION
        // ----------------------------------------------------

        renderCareList(
            careExamination,
            guidance.examination
        );


        // ----------------------------------------------------
        // SUGGESTED CHECKS / TESTS
        // ----------------------------------------------------

        renderCareList(
            careTests,
            guidance.tests
        );


        // ----------------------------------------------------
        // SUPPORTIVE HABITS
        // ----------------------------------------------------

        renderCareList(
            careHabits,
            guidance.habits
        );


        // ----------------------------------------------------
        // FOLLOW-UP
        // ----------------------------------------------------

        if (careFollowup) {

            careFollowup.textContent =
                guidance.followup ||
                "—";
        }


        // ----------------------------------------------------
        // WHEN TO SEEK URGENT CARE
        // ----------------------------------------------------

        renderCareList(
            careWarningSigns,
            guidance.urgent
        );


        // ----------------------------------------------------
        // SUMMARY / NOTE
        // ----------------------------------------------------

        if (careSummary) {

            careSummary.textContent =
                "Supportive guidance based on the AI screening result. This does not replace examination by a qualified eye-care professional.";
        }


        // ----------------------------------------------------
        // URGENCY BADGE
        // ----------------------------------------------------

        if (careUrgencyBadge) {

            const urgency =
                String(
                    guidance.urgency ||
                    guidance.level ||
                    "MODERATE"
                ).toUpperCase();

            careUrgencyBadge.textContent =
                urgency;

            careUrgencyBadge.classList.remove(
                "low",
                "moderate",
                "high"
            );

            if (
                urgency === "LOW"
            ) {

                careUrgencyBadge.classList.add(
                    "low"
                );

            } else if (
                urgency === "HIGH"
            ) {

                careUrgencyBadge.classList.add(
                    "high"
                );

            } else {

                careUrgencyBadge.classList.add(
                    "moderate"
                );
            }
        }


        console.log(
            "[EyeAI] Care guidance rendered successfully."
        );
    }


    // ========================================================
    // EXPOSE FUNCTIONS FOR DEBUGGING
    // ========================================================

    window.__EYEAI_CARE_FIX_VERSION = "2026-08-20-care-fix-1";

    window.getDiseaseInfo =
        function (disease) {

            const normalized =
                normalizeDiseaseName(
                    disease
                );

            return getCareGuidanceForDisease(
                disease
            );
        };


    window.renderCareList =
        renderCareList;


    window.showCareGuidance =
        showCareGuidance;


    window.normalizeDiseaseName =
        normalizeDiseaseName;


    // ========================================================
    // DEBUG
    // ========================================================

    console.log(
        "=================================================="
    );

    console.log(
        "EYEAI CARE GUIDANCE READY"
    );

    console.log(
        "Supported guidance:"
    );

    console.log(
        Object.keys(
            careGuidance
        )
    );

    console.log(
        "=================================================="
    );


        
// ========================================================

// HISTORY
// ========================================================

let showAllHistory = false;

async function loadHistory() {

if (
    !user ||
    !user.id ||
    !history
) {
    return;
}


try {

    const response =
        await fetch(
            `${API_URL}/history/${user.id}?t=${Date.now()}`,
            {
                method: "GET",

                credentials: "include",

                cache: "no-store"
            }
        );


    const data =
        await response.json();


    if (!response.ok) {

        throw new Error(
            data.error ||
            "Could not load history."
        );

    }


    const records =
        Array.isArray(
            data.history
        )
            ? data.history
            : [];


    // ----------------------------------------------------
    // TOTAL HISTORY COUNT
    // ----------------------------------------------------

    if (historyCount) {

        historyCount.textContent =
            records.length;

    }


    // ----------------------------------------------------
    // NO HISTORY
    // ----------------------------------------------------

    if (
        records.length === 0
    ) {

        history.innerHTML = `

            <div class="history-empty">

                <div class="history-empty-icon">
                    ◌
                </div>

                <h3>
                    No predictions yet
                </h3>

                <p>
                    Your completed AI analyses
                    will appear here.
                </p>

            </div>

        `;

        return;

    }


    // ----------------------------------------------------
    // SHOW ONLY 4 INITIALLY
    // ----------------------------------------------------

    const visibleRecords =
        showAllHistory
            ? records
            : records.slice(0, 4);


    history.innerHTML =
        "";


    // ----------------------------------------------------
    // RENDER HISTORY
    // ----------------------------------------------------

    visibleRecords.forEach(
        function (item) {

            let conf =
                Number(
                    item.confidence
                );


            if (
                Number.isFinite(
                    conf
                ) &&
                conf <= 1
            ) {

                conf *= 100;

            }


            const itemElement =
                document.createElement(
                    "div"
                );


            itemElement.className =
                "history-item";


            itemElement.style.cursor =
                "pointer";


            itemElement.innerHTML = `

                <div class="history-row">

                    <div>

                        <span class="history-label">
                            CONDITION
                        </span>

                        <strong>
                            ${escapeHTML(
                                item.predicted_class ||
                                "Unknown"
                            )}
                        </strong>

                    </div>


                    <div>

                        <span class="history-label">
                            MODEL
                        </span>

                        <strong>
                            ${escapeHTML(
                                item.model_type ||
                                "AI"
                            )}
                        </strong>

                    </div>


                    <div>

                        <span class="history-label">
                            CONFIDENCE
                        </span>

                        <strong>

                            ${
                                Number.isFinite(
                                    conf
                                )
                                    ? conf.toFixed(2)
                                    : "0.00"
                            }%

                        </strong>

                    </div>


                    <div>

                        <span class="history-label">
                            DATE
                        </span>

                        <strong>
                            ${escapeHTML(
                                item.created_at ||
                                "-"
                            )}
                        </strong>

                    </div>

                </div>

            `;


            // ------------------------------------------------
            // CLICK HISTORY ITEM
            // ------------------------------------------------

            itemElement.addEventListener(
                "click",
                function () {

                    loadHistoryDetail(
                        item.id
                    );

                }
            );


            history.appendChild(
                itemElement
            );

        }
    );


    // ----------------------------------------------------
    // SEE MORE / SHOW LESS
    // ----------------------------------------------------

    if (
        records.length > 4
    ) {

        const historyButton =
            document.createElement(
                "button"
            );


        historyButton.type =
            "button";


        historyButton.className =
            "history-see-more";


        historyButton.textContent =
            showAllHistory
                ? "Show Less ↑"
                : `See More (${records.length - 4}) ↓`;


        historyButton.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                event.stopPropagation();


                showAllHistory =
                    !showAllHistory;


                loadHistory();

            }
        );


        history.appendChild(
            historyButton
        );

    }


    // ----------------------------------------------------
    // UPDATE STATISTICS
    // ----------------------------------------------------

    updateStatistics(
        records
    );

}
catch (error) {

    console.error(
        "HISTORY ERROR:",
        error
    );

}

}
// ========================================================
// HISTORY DETAIL
// ========================================================

async function loadHistoryDetail(
    predictionId
) {

    try {

        const response =
            await fetch(
                `${API_URL}/history/detail/${predictionId}?t=${Date.now()}`,
                {
                    method: "GET",
                    credentials: "include",
                    cache: "no-store"
                }
            );


        const data =
            await response.json();


        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.error ||
                "Prediction not found."
            );

        }


        const item =
            data.prediction;


        currentPredictionId =
            item.id;


        currentPredictionData =
            item;


        if (resultSection) {

            resultSection.classList.remove(
                "hidden"
            );

            resultSection.style.display =
                "block";

        }


        // ------------------------------------------------
        // LOAD SAVED IMAGE
        // ------------------------------------------------

        if (imagePreview) {

            imagePreview.src =
                `${API_URL}/history/image/${item.id}?t=${Date.now()}`;

            imagePreview.style.display =
                "block";

        }


        if (imagePreviewContainer) {

            imagePreviewContainer.style.display =
                "block";

        }


        if (uploadEmpty) {

            uploadEmpty.style.display =
                "none";

        }


        if (selectedImageName) {

            selectedImageName.textContent =
                item.image_name ||
                "Saved prediction";

        }


        if (imageType) {

            imageType.textContent =
                item.image_type ||
                "Unknown";

        }


        if (modelUsed) {

            modelUsed.textContent =
                item.model_type ||
                "AI";

        }


        if (prediction) {

            prediction.textContent =
                item.predicted_class ||
                "Unknown";

        }


        let conf =
            Number(
                item.confidence
            );


        if (
            Number.isFinite(conf) &&
            conf <= 1
        ) {

            conf *= 100;

        }


        if (!Number.isFinite(conf)) {

            conf = 0;

        }


        if (confidence) {

            confidence.textContent =
                conf.toFixed(2) +
                "%";

        }


        if (confidenceBar) {

            confidenceBar.style.width =
                conf + "%";

        }


        let detection =
            Number(
                item.image_type_confidence
            );


        if (
            Number.isFinite(
                detection
            )
        ) {

            if (
                detection <= 1
            ) {

                detection *= 100;

            }


            if (imageTypeConfidence) {

                imageTypeConfidence.textContent =
                    detection.toFixed(2) +
                    "%";

            }

        }


        showProbabilities(
            item.probabilities ||
            {}
        );


        showDiseaseInformation(
            item.predicted_class ||
            "Unknown"
        );

        showCareGuidance(
            item.predicted_class ||
            "Unknown"
        );


        showToast(
            "Previous prediction loaded."
        );


        if (resultSection) {

            resultSection.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }

    }
    catch (error) {

        console.error(
            "HISTORY DETAIL ERROR:",
            error
        );


        showToast(
            error.message ||
            "Could not load prediction.",
            true
        );

    }

}


// ========================================================
// PARSE EYEAI INDIA DATE
// ========================================================

function parseEyeAIIndiaDate(value) {

    if (!value) {
        return null;
    }

    // Expected backend format:
    // DD-MM-YYYY HH:MM:SS AM/PM

    const match = String(value).match(
        /^(\d{2})-(\d{2})-(\d{4})\s+(\d{2}):(\d{2}):(\d{2})\s+(AM|PM)$/i
    );

    if (!match) {
        const fallback = new Date(value);

        return Number.isNaN(
            fallback.getTime()
        )
            ? null
            : fallback;
    }

    const day = Number(match[1]);
    const month = Number(match[2]) - 1;
    const year = Number(match[3]);

    let hour = Number(match[4]);
    const minute = Number(match[5]);
    const second = Number(match[6]);
    const period = match[7].toUpperCase();

    if (period === "PM" && hour !== 12) {
        hour += 12;
    }

    if (period === "AM" && hour === 12) {
        hour = 0;
    }

    // Create the exact India time and convert it to
    // the browser's equivalent Date object.
    const utcMillis = Date.UTC(
        year,
        month,
        day,
        hour,
        minute,
        second
    ) - (5 * 60 + 30) * 60 * 1000;

    return new Date(
        utcMillis
    );
}


// ========================================================
// STATISTICS
// ========================================================

function updateStatistics(
    records
) {

    if (
        !Array.isArray(
            records
        )
    ) {

        records = [];

    }


    if (totalScans) {

        totalScans.textContent =
            records.length;

    }


    let weekCount =
        0;


    const now =
        new Date();


    const weekAgo =
        new Date(
            now.getTime() -
            (
                7 *
                24 *
                60 *
                60 *
                1000
            )
        );


    const counts =
        {};


    let confidenceTotal =
        0;

    let confidenceNumber =
        0;


    records.forEach(
        function (item) {

            const date =
                parseEyeAIIndiaDate(
                    item.created_at
                );


            if (
                !Number.isNaN(
                    date.getTime()
                ) &&
                date >= weekAgo
            ) {

                weekCount++;

            }


            const condition =
                item.predicted_class ||
                "Unknown";


            counts[condition] =
                (
                    counts[condition] ||
                    0
                ) + 1;


            let conf =
                Number(
                    item.confidence
                );


            if (
                Number.isFinite(
                    conf
                )
            ) {

                if (
                    conf <= 1
                ) {

                    conf *= 100;

                }


                confidenceTotal +=
                    conf;

                confidenceNumber++;

            }

        }
    );


    if (weeklyScans) {

        weeklyScans.textContent =
            weekCount;

    }


    let mostCommon =
        "-";

    let highest =
        0;


    Object.entries(
        counts
    ).forEach(
        function (
            [name, count]
        ) {

            if (
                count >
                highest
            ) {

                highest =
                    count;

                mostCommon =
                    name;

            }

        }
    );


    if (mostDetected) {

        mostDetected.textContent =
            mostCommon;

    }


    const average =
        confidenceNumber
            ? (
                confidenceTotal /
                confidenceNumber
            )
            : 0;


    if (averageConfidence) {

        averageConfidence.textContent =
            average.toFixed(2) +
            "%";

    }

}


async function loadStatistics() {

    try {

        const response =
            await fetch(
                `${API_URL}/history/${user.id}?t=${Date.now()}`,
                {
                    credentials: "include",
                    cache: "no-store"
                }
            );


        if (!response.ok) {
            return;
        }


        const data =
            await response.json();


        updateStatistics(
            data.history || []
        );

    }
    catch (error) {

        console.error(
            "STATISTICS ERROR:",
            error
        );

    }

}


// ========================================================
// GENERATE PDF REPORT
// ========================================================

if (generateReportButton) {

    generateReportButton.addEventListener(
        "click",
        async function () {

            if (!currentPredictionId) {

                showToast(
                    "Analyze an image or select a history record first.",
                    true
                );

                return;

            }


            const oldText =
                generateReportButton.innerHTML;


            generateReportButton.disabled =
                true;


            generateReportButton.innerHTML =
                "Generating...";


            try {

                const response =
                    await fetch(
                        `${API_URL}/report/${currentPredictionId}`,
                        {
                            method: "GET",
                            credentials: "include",
                            cache: "no-store"
                        }
                    );


                if (!response.ok) {

                    let message =
                        "Could not generate report.";


                    try {

                        const errorData =
                            await response.json();


                        message =
                            errorData.error ||
                            message;

                    }
                    catch (error) {}


                    throw new Error(
                        message
                    );

                }


                const blob =
                    await response.blob();


                const url =
                    URL.createObjectURL(
                        blob
                    );


                const link =
                    document.createElement(
                        "a"
                    );


                link.href =
                    url;


                link.download =
                    `EyeAI_Report_${currentPredictionId}.pdf`;


                document.body.appendChild(
                    link
                );


                link.click();


                link.remove();


                setTimeout(
                    function () {

                        URL.revokeObjectURL(
                            url
                        );

                    },
                    1000
                );


                showToast(
                    "Report downloaded successfully."
                );

            }
            catch (error) {

                console.error(
                    "REPORT ERROR:",
                    error
                );


                showToast(
                    error.message ||
                    "Report generation failed.",
                    true
                );

            }
            finally {

                generateReportButton.disabled =
                    false;

                generateReportButton.innerHTML =
                    oldText;

            }

        }
    );

}


// ========================================================
// PRINT
// ========================================================

if (printReportButton) {

    printReportButton.addEventListener(
        "click",
        function () {

            if (!currentPredictionData) {

                showToast(
                    "Analyze an image or select a history record first.",
                    true
                );

                return;

            }


            printReport();

        }
    );

}


function printReport() {

    const data =
        currentPredictionData;


    const name =
        data.prediction ||
        data.predicted_class ||
        "Unknown";


    const model =
        data.model ||
        data.model_type ||
        "AI";


    let conf =
        Number(
            data.confidence
        );


    if (
        Number.isFinite(conf) &&
        conf <= 1
    ) {

        conf *= 100;

    }


    const printWindow =
        window.open(
            "",
            "_blank",
            "width=900,height=800"
        );


    if (!printWindow) {

        showToast(
            "Allow pop-ups to print the report.",
            true
        );

        return;

    }


    let probabilityHTML =
        "";


    if (
        data.probabilities &&
        typeof data.probabilities ===
            "object"
    ) {

        Object.entries(
            data.probabilities
        )
        .sort(
            (a, b) =>
                Number(b[1]) -
                Number(a[1])
        )
        .forEach(
            function (
                [label, value]
            ) {

                let percent =
                    Number(value);


                if (
                    percent <= 1
                ) {

                    percent *= 100;

                }


                probabilityHTML += `

                    <div
                        style="
                            margin-bottom:12px;
                        "
                    >

                        <div
                            style="
                                display:flex;
                                justify-content:space-between;
                            "
                        >

                            <span>
                                ${escapeHTML(label)}
                            </span>

                            <strong>
                                ${percent.toFixed(2)}%
                            </strong>

                        </div>


                        <div
                            style="
                                height:8px;
                                background:#e5e7eb;
                                border-radius:20px;
                                margin-top:5px;
                            "
                        >

                            <div
                                style="
                                    width:${percent}%;
                                    height:100%;
                                    background:#111827;
                                    border-radius:20px;
                                "
                            ></div>

                        </div>

                    </div>

                `;

            }
        );

    }


    printWindow.document.write(`

        <!DOCTYPE html>

        <html>

        <head>

            <title>
                EyeAI Report
            </title>

            <style>

                body {

                    font-family:
                        Arial,
                        sans-serif;

                    padding:
                        40px;

                    color:
                        #111827;

                }

                .container {

                    max-width:
                        800px;

                    margin:
                        auto;

                }

                h1 {

                    text-align:
                        center;

                }

                .subtitle {

                    text-align:
                        center;

                    color:
                        #667085;

                }

                .box {

                    padding:
                        18px;

                    background:
                        #f7f8fa;

                    border:
                        1px solid
                        #e5e7eb;

                    border-radius:
                        10px;

                    margin-top:
                        20px;

                }

                .label {

                    color:
                        #667085;

                    font-size:
                        11px;

                    font-weight:
                        bold;

                    margin-bottom:
                        5px;

                }

                .value {

                    font-size:
                        20px;

                    font-weight:
                        bold;

                }

                .disclaimer {

                    margin-top:
                        30px;

                    padding:
                        15px;

                    font-size:
                        11px;

                    color:
                        #667085;

                    border:
                        1px solid
                        #e5e7eb;

                }

            </style>

        </head>


        <body>

            <div class="container">

                <h1>
                    EyeAI
                </h1>

                <p class="subtitle">
                    Intelligent Eye Analysis Report
                </p>


                <div class="box">

                    <div class="label">
                        USER
                    </div>

                    <div>
                        ${escapeHTML(
                            user.name
                        )}
                    </div>

                </div>


                <div class="box">

                    <div class="label">
                        IMAGE TYPE
                    </div>

                    <div>
                        ${escapeHTML(
                            data.image_type ||
                            "Unknown"
                        )}
                    </div>

                </div>


                <div class="box">

                    <div class="label">
                        AI MODEL
                    </div>

                    <div>
                        ${escapeHTML(
                            model
                        )}
                    </div>

                </div>


                <div class="box">

                    <div class="label">
                        PREDICTED CONDITION
                    </div>

                    <div class="value">
                        ${escapeHTML(
                            name
                        )}
                    </div>

                </div>


                <div class="box">

                    <div class="label">
                        MODEL CONFIDENCE
                    </div>

                    <div class="value">
                        ${
                            Number.isFinite(conf)
                                ? conf.toFixed(2)
                                : "0.00"
                        }%
                    </div>

                </div>


                <div class="box">

                    <div class="label">
                        CLASS PROBABILITIES
                    </div>

                    ${probabilityHTML}

                </div>


                <div class="disclaimer">

                    This AI-generated result is
                    intended for educational and
                    research purposes only and is
                    not a medical diagnosis.
                    Consult a qualified eye-care
                    professional for clinical
                    interpretation.

                </div>

            </div>


            <script>

                window.onload =
                    function () {

                        window.print();

                    };

            <\/script>

        </body>

        </html>

    `);


    printWindow.document.close();

}


// ========================================================
// INITIAL DASHBOARD LOAD
// ========================================================

loadHistory();

loadStatistics();

}

// ============================================================
// USER PROFILE
// ============================================================

const profileButton =
document.getElementById("profile-button");

const profilePopup =
document.getElementById("profile-popup");

const profileAvatar =
document.getElementById("profile-avatar");

const profileLargeAvatar =
document.getElementById(
"profile-large-avatar"
);

const profileName =
document.getElementById("profile-name");

const profileEmail =
document.getElementById("profile-email");

const profilePopupName =
document.getElementById(
"profile-popup-name"
);

const profilePopupEmail =
document.getElementById(
"profile-popup-email"
);

const profileUserId =
document.getElementById(
"profile-user-id"
);

const profileDetailEmail =
document.getElementById(
"profile-detail-email"
);

const profileDetailName =
document.getElementById(
"profile-detail-name"
);

const profileLogoutButton =
document.getElementById(
"profile-logout-button"
);

// ============================================================
// LOAD USER DETAILS
// ============================================================

function loadUserProfile() {

let currentUser = null;

try {

    currentUser = JSON.parse(
        localStorage.getItem("user")
    );

} catch (error) {

    console.error(
        "PROFILE USER ERROR:",
        error
    );

    return;
}


if (!currentUser) {
    return;
}


const name =
    currentUser.name ||
    "User";

const email =
    currentUser.email ||
    "Email not available";

const id =
    currentUser.id ||
    currentUser.user_id ||
    "Not available";


// --------------------------------------------------------
// Initial
// --------------------------------------------------------

const initial =
    name
        .trim()
        .charAt(0)
        .toUpperCase();


// --------------------------------------------------------
// Header
// --------------------------------------------------------

if (profileAvatar) {

    profileAvatar.textContent =
        initial;

}


if (profileName) {

    profileName.textContent =
        name;

}


if (profileEmail) {

    profileEmail.textContent =
        email;

}


// --------------------------------------------------------
// Popup
// --------------------------------------------------------

if (profileLargeAvatar) {

    profileLargeAvatar.textContent =
        initial;

}


if (profilePopupName) {

    profilePopupName.textContent =
        name;

}


if (profilePopupEmail) {

    profilePopupEmail.textContent =
        email;

}


if (profileUserId) {

    profileUserId.textContent =
        "#" + id;

}


if (profileDetailEmail) {

    profileDetailEmail.textContent =
        email;

}


if (profileDetailName) {

    profileDetailName.textContent =
        name;

}

}

loadUserProfile();

// ============================================================
// OPEN / CLOSE PROFILE
// ============================================================

if (profileButton) {

profileButton.addEventListener(
    "click",
    function (event) {

        event.stopPropagation();

        if (!profilePopup) {
            return;
        }

        profilePopup.classList.toggle(
            "hidden"
        );

        profilePopup.classList.toggle(
            "profile-popup-open"
        );

    }
);

}

// ============================================================
// CLOSE WHEN CLICKING OUTSIDE
// ============================================================

document.addEventListener(
"click",
function (event) {

    if (
        profilePopup &&
        profileButton &&
        !profilePopup.contains(event.target) &&
        !profileButton.contains(event.target)
    ) {

        profilePopup.classList.add(
            "hidden"
        );

        profilePopup.classList.remove(
            "profile-popup-open"
        );

    }

}

);

// ============================================================
// PROFILE LOGOUT
// ============================================================

if (profileLogoutButton) {

profileLogoutButton.addEventListener(
    "click",
    async function () {

        try {

            await fetch(
                `${API_URL}/logout`,
                {
                    method: "POST"
                }
            );

        } catch (error) {

            console.log(
                "Logout request failed:",
                error
            );

        }


        localStorage.removeItem(
            "user"
        );

        localStorage.removeItem(
            "eyeDiseaseAnalysis"
        );

        localStorage.removeItem(
            "eyeDiseaseSelectedImage"
        );


        window.location.href =
            "index.html";

    }
);

}