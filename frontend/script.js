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


        const predicted =
            data.prediction ||
            data.predicted_class ||
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
                    new Date(
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