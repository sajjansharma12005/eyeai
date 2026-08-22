from pathlib import Path
from datetime import timezone
from zoneinfo import ZoneInfo
import sys
import uuid
import tempfile
import shutil
import json
import io


# ============================================================
# PROJECT PATH
# ============================================================

BASE_DIR = Path(
    __file__
).resolve().parent.parent

if str(BASE_DIR) not in sys.path:
    sys.path.insert(
        0,
        str(BASE_DIR)
    )


# ============================================================
# FLASK
# ============================================================

from flask import (
    Flask,
    request,
    jsonify,
    render_template,
    session,
    redirect,
    url_for,
    send_file
)

from flask_cors import CORS
from flask_bcrypt import Bcrypt
from sqlalchemy import inspect, text

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    Image as PDFImage
)

from werkzeug.utils import secure_filename


# ============================================================
# DATABASE
# ============================================================

from database import (
    db,
    User,
    Prediction
)


# ============================================================
# ML
# ============================================================

from ml.predict import predict_image


# ============================================================
# APP
# ============================================================

app = Flask(
    __name__
)

CORS(
    app,
    supports_credentials=True
)

app.secret_key = (
    "eye-disease-ai-secret-key"
)

bcrypt = Bcrypt(app)


# ============================================================
# DATABASE CONFIGURATION
# ============================================================
#
# IMPORTANT:
# Keep the database in Flask's instance folder.
#
# Your project already has:
#
# backend/
#     instance/
#         eye_disease.db
#
# Flask-SQLAlchemy will use that location for:
# sqlite:///eye_disease.db
#
# Do NOT move or delete your existing database.
# ============================================================

app.config[
    "SQLALCHEMY_DATABASE_URI"
] = "sqlite:///eye_disease.db"

app.config[
    "SQLALCHEMY_TRACK_MODIFICATIONS"
] = False

db.init_app(app)


# ============================================================
# UPLOAD SETTINGS
# ============================================================

app.config[
    "MAX_CONTENT_LENGTH"
] = 10 * 1024 * 1024


# ============================================================
# TEMPORARY UPLOAD FOLDER
# ============================================================
#
# IMPORTANT:
# Do NOT save uploaded images inside the VS Code project.
#
# Live Server watches the project and may refresh when files
# are created/deleted.
#
# We therefore use the Windows temporary folder.
# ============================================================

TEMP_UPLOAD_FOLDER = (
    Path(
        tempfile.gettempdir()
    )
    / "eyeai_uploads"
)

TEMP_UPLOAD_FOLDER.mkdir(
    parents=True,
    exist_ok=True
)


# ============================================================
# PERMANENT PREDICTION IMAGE FOLDER
# ============================================================
#
# Uploaded images used for a prediction are copied here before
# the temporary processing file is deleted.
#
# This allows prediction-history records to show the original
# scan again later.
# ============================================================

# Permanent prediction images are stored OUTSIDE the project.
# This prevents VS Code Live Server from refreshing dashboard.html
# whenever a prediction image is created.
PREDICTION_IMAGE_FOLDER = (
    Path(tempfile.gettempdir())
    / "eyeai_prediction_images"
)

PREDICTION_IMAGE_FOLDER.mkdir(
    parents=True,
    exist_ok=True
)

# Keep the old folder as a fallback so previously saved images can still
# be displayed if they exist there.
LEGACY_PREDICTION_IMAGE_FOLDER = (
    BASE_DIR
    / "backend"
    / "instance"
    / "prediction_images"
)


# ============================================================
# ALLOWED IMAGE TYPES
# ============================================================

ALLOWED_EXTENSIONS = {
    "jpg",
    "jpeg",
    "png",
    "webp"
}


# ============================================================
# CARE GUIDANCE
# ============================================================
COMMON_WARNING_SIGNS = [
    "Sudden vision loss",
    "A sudden increase in floaters",
    "Flashes of light",
    "A dark curtain or shadow across your vision",
    "Severe eye pain with sudden blurred vision or redness"
]

CARE_GUIDANCE = {
    "Healthy": {"name":"Healthy","risk":"Low risk","summary":"No abnormality was detected by this model within its trained classes.","about":"The fundus model classified the uploaded image as healthy within the classes it was trained on.","recommendation":"Continue routine eye care and arrange an examination if you develop new or persistent vision changes.","examination":["Routine comprehensive eye examination based on age and personal risk"],"tests":["No additional test is automatically required from this AI result"],"habits":["Maintain a balanced diet and regular physical activity","Do not smoke","Protect your eyes from excessive UV exposure"],"followup":"Follow your normal eye-care schedule. A normal AI result does not rule out every eye condition.","warnings":COMMON_WARNING_SIGNS},
    "NORMAL": {"name":"Normal","risk":"Low risk","summary":"The OCT model classified the scan as normal within its trained classes.","about":"The OCT model classified the uploaded scan as normal.","recommendation":"Continue routine eye care and seek professional evaluation if symptoms develop.","examination":["Routine comprehensive eye examination based on age and risk"],"tests":["No additional test is automatically required from this AI result"],"habits":["Maintain healthy lifestyle habits","Do not smoke","Protect eyes from excessive UV exposure"],"followup":"Continue routine monitoring. A normal OCT prediction does not rule out every eye condition.","warnings":COMMON_WARNING_SIGNS},
    "Myopia": {"name":"Myopia","risk":"Needs attention","summary":"The model identified a pattern associated with nearsightedness.","about":"Myopia, or nearsightedness, causes distant objects to appear blurry because light is focused in front of the retina.","recommendation":"Arrange a professional eye examination for refraction and an appropriate vision prescription.","examination":["Comprehensive eye examination","Refraction / visual-acuity assessment"],"tests":["Visual acuity testing","Refraction testing","Dilated examination when clinically appropriate"],"habits":["Use the vision correction prescribed by your eye-care professional","Take regular breaks during prolonged near work","Spend appropriate time outdoors"],"followup":"Follow the eye-care professional's recommended schedule, especially if vision is changing.","warnings":COMMON_WARNING_SIGNS},
    "Glaucoma": {"name":"Glaucoma","risk":"Needs attention","summary":"The model identified a pattern associated with glaucoma in its trained classes.","about":"Glaucoma is associated with damage to the optic nerve and can cause progressive vision loss.","recommendation":"Arrange a comprehensive eye evaluation. Treatment decisions should be made by an eye-care professional.","examination":["Comprehensive dilated eye examination","Optic-nerve evaluation"],"tests":["Eye-pressure measurement (tonometry)","Visual-field testing","Optic-nerve / retinal imaging when recommended"],"habits":["Take prescribed treatment exactly as directed","Keep scheduled follow-up appointments","Do not stop prescribed eye drops without professional advice"],"followup":"Glaucoma requires professional monitoring. The appropriate interval depends on the clinical findings.","warnings":["Severe eye pain with a red eye","Sudden blurred vision","Nausea or vomiting with sudden eye symptoms"] + COMMON_WARNING_SIGNS},
    "Diabetic Retinopathy": {"name":"Diabetic Retinopathy","risk":"Needs attention","summary":"The model identified a retinal pattern associated with diabetic retinopathy.","about":"Diabetic retinopathy is retinal damage associated with diabetes and can threaten vision when it progresses.","recommendation":"Arrange professional retinal evaluation and discuss diabetes, blood-pressure and cholesterol management with your healthcare team.","examination":["Dilated retinal examination","Professional retinal evaluation"],"tests":["Blood glucose / HbA1c assessment with your healthcare team","Blood-pressure assessment","OCT or other retinal imaging when recommended"],"habits":["Keep blood glucose within your clinician's recommended range","Manage blood pressure and cholesterol","Stay physically active and eat a balanced diet","Do not smoke"],"followup":"Follow the eye-care professional's recommended retinal monitoring schedule.","warnings":COMMON_WARNING_SIGNS},
    "DR": {"name":"Diabetic Retinopathy","risk":"Needs attention","summary":"The model identified a retinal pattern associated with diabetic retinopathy.","about":"Diabetic retinopathy is retinal damage associated with diabetes and can threaten vision when it progresses.","recommendation":"Arrange professional retinal evaluation and discuss diabetes, blood-pressure and cholesterol management with your healthcare team.","examination":["Dilated retinal examination","Professional retinal evaluation"],"tests":["Blood glucose / HbA1c assessment with your healthcare team","Blood-pressure assessment","OCT or other retinal imaging when recommended"],"habits":["Keep blood glucose within your clinician's recommended range","Manage blood pressure and cholesterol","Stay physically active and eat a balanced diet","Do not smoke"],"followup":"Follow the eye-care professional's recommended retinal monitoring schedule.","warnings":COMMON_WARNING_SIGNS},
    "DME": {"name":"Diabetic Macular Edema","risk":"Prompt evaluation","summary":"The OCT model identified a pattern associated with diabetic macular edema.","about":"Diabetic macular edema involves swelling or fluid accumulation in the macular region and is associated with diabetes.","recommendation":"Arrange prompt eye-care evaluation, particularly if you have diabetes or notice changes in vision.","examination":["Dilated retinal examination","Retina specialist / ophthalmology evaluation when indicated"],"tests":["OCT","Blood glucose / HbA1c assessment with your healthcare team","Blood-pressure assessment"],"habits":["Manage diabetes as advised by your healthcare team","Manage blood pressure and cholesterol","Follow prescribed eye treatment and appointments","Do not smoke"],"followup":"Follow the retina specialist's recommended monitoring schedule. Treatment depends on clinical findings and severity.","warnings":COMMON_WARNING_SIGNS},
    "CNV": {"name":"Choroidal Neovascularization (CNV)","risk":"Prompt evaluation","summary":"The OCT model identified a pattern associated with abnormal blood-vessel growth beneath the retina.","about":"CNV describes abnormal blood-vessel growth beneath the retina and can occur in conditions such as neovascular or wet AMD.","recommendation":"Arrange prompt ophthalmology / retina evaluation. The underlying cause must be confirmed clinically.","examination":["Dilated retinal examination","Retina specialist evaluation"],"tests":["OCT","Additional retinal imaging when recommended"],"habits":["Do not smoke","Maintain healthy blood pressure and cholesterol","Follow the monitoring plan given by your eye-care professional"],"followup":"Prompt specialist review is appropriate because CNV can affect central vision and treatment depends on the underlying cause.","warnings":COMMON_WARNING_SIGNS},
    "DRUSEN": {"name":"Drusen","risk":"Needs attention","summary":"The OCT model identified drusen within its trained classes.","about":"Drusen are deposits beneath the retina and can be associated with age-related macular changes.","recommendation":"Arrange an eye examination so a clinician can determine the significance of the finding and whether monitoring is needed.","examination":["Comprehensive eye examination","Macular / retinal evaluation"],"tests":["OCT when recommended","Additional retinal imaging when clinically appropriate"],"habits":["Do not smoke","Maintain healthy blood pressure and cholesterol","Eat a balanced diet rich in vegetables and other nutrient-dense foods","Stay physically active"],"followup":"Follow the monitoring schedule recommended by your eye-care professional. Supplements should not be started solely from this AI result.","warnings":COMMON_WARNING_SIGNS},
    "Macular Scar": {"name":"Macular Scar","risk":"Needs attention","summary":"The fundus model identified a pattern associated with a macular scar.","about":"A scar affecting the macular region can influence central vision. The cause and clinical significance vary between people.","recommendation":"Arrange professional retinal evaluation to determine the cause, location and effect on vision.","examination":["Ophthalmologist / retina evaluation","Macular and retinal examination"],"tests":["OCT when recommended","Additional retinal imaging when clinically appropriate"],"habits":["Follow the eye-care professional's monitoring plan","Protect overall eye health","Do not attempt home treatment for a retinal scar"],"followup":"Follow-up depends on the underlying cause, scar location and effect on vision.","warnings":COMMON_WARNING_SIGNS}
}


# ============================================================
# INDIA TIME CONVERSION
# ============================================================

def convert_to_india_time(dt):
    if not dt:
        return None

    # Prediction.created_at is stored as UTC without timezone info.
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)

    return dt.astimezone(
        ZoneInfo("Asia/Kolkata")
    )


def allowed_file(
    filename
):

    return (
        "." in filename
        and
        filename.rsplit(
            ".",
            1
        )[1].lower()
        in ALLOWED_EXTENSIONS
    )


# ============================================================
# HOME
# ============================================================

@app.route(
    "/",
    methods=["GET"]
)
def home():

    return jsonify({

        "status":
            "running",

        "message":
            "Eye Disease AI API is working"

    })


# ============================================================
# ADMIN LOGIN
# ============================================================

@app.route(
    "/admin/login",
    methods=["GET", "POST"]
)
def admin_login():

    if request.method == "POST":

        username = request.form.get(
            "username"
        )

        password = request.form.get(
            "password"
        )

        if (
            username == "admin"
            and
            password == "admin123"
        ):

            session[
                "admin_logged_in"
            ] = True

            return redirect(
                url_for(
                    "admin_dashboard"
                )
            )

        return render_template(
            "admin_login.html",
            error=
                "Invalid username or password"
        )

    return render_template(
        "admin_login.html"
    )


# ============================================================
# ADMIN DASHBOARD
# ============================================================

@app.route(
    "/admin",
    methods=["GET"]
)
def admin_dashboard():

    if not session.get(
        "admin_logged_in"
    ):

        return redirect(
            url_for(
                "admin_login"
            )
        )

    users = (
        User.query
        .order_by(
            User.created_at.desc()
        )
        .all()
    )

    predictions = (
        Prediction.query
        .order_by(
            Prediction.created_at.desc()
        )
        .all()
    )

    return render_template(
        "admin.html",
        users=users,
        predictions=predictions
    )


# ============================================================
# PREDICT IMAGE
# ============================================================

@app.route(
    "/predict",
    methods=["POST"]
)
def predict():

    print(
        "\n"
        "========================================"
    )

    print(
        "NEW PREDICTION REQUEST"
    )

    print(
        "========================================"
    )


    # ========================================================
    # CHECK IMAGE
    # ========================================================

    if "image" not in request.files:

        print(
            "ERROR: IMAGE NOT FOUND"
        )

        return jsonify({

            "success":
                False,

            "error":
                "No image uploaded"

        }), 400


    file = request.files[
        "image"
    ]


    if file.filename == "":

        print(
            "ERROR: EMPTY IMAGE"
        )

        return jsonify({

            "success":
                False,

            "error":
                "No image selected"

        }), 400


    # ========================================================
    # CHECK FILE TYPE
    # ========================================================

    if not allowed_file(
        file.filename
    ):

        print(
            "ERROR: INVALID IMAGE FORMAT"
        )

        return jsonify({

            "success":
                False,

            "error":
                (
                    "Invalid image format. "
                    "Use JPG, JPEG, PNG or WEBP."
                )

        }), 400


    # ========================================================
    # GET USER ID
    # ========================================================

    user_id = request.form.get(
        "user_id"
    )


    print(
        "Received user_id:",
        user_id
    )


    # ========================================================
    # USER ID MUST EXIST
    # ========================================================

    if not user_id:

        print(
            "ERROR: USER ID IS MISSING"
        )

        return jsonify({

            "success":
                False,

            "error":
                (
                    "User ID is missing. "
                    "Please logout and login again."
                )

        }), 400


    try:

        user_id = int(
            user_id
        )

    except (
        TypeError,
        ValueError
    ):

        print(
            "ERROR: INVALID USER ID:",
            user_id
        )

        return jsonify({

            "success":
                False,

            "error":
                "Invalid user ID."

        }), 400


    # ========================================================
    # FIND USER
    # ========================================================

    user = User.query.get(
        user_id
    )


    if not user:

        print(
            "ERROR: USER NOT FOUND:",
            user_id
        )

        return jsonify({

            "success":
                False,

            "error":
                (
                    "User was not found in the database. "
                    "Please logout and login again."
                )

        }), 401


    print(
        "USER FOUND:"
    )

    print(
        "ID:",
        user.id
    )

    print(
        "Name:",
        user.name
    )

    print(
        "Email:",
        user.email
    )


    # ========================================================
    # SAFE FILE NAME
    # ========================================================

    original_filename = secure_filename(
        file.filename
    )


    unique_filename = (
        str(
            uuid.uuid4()
        )
        + "_"
        + original_filename
    )


    image_path = (
        TEMP_UPLOAD_FOLDER
        / unique_filename
    )


    # ========================================================
    # SAVE TEMP IMAGE
    # ========================================================

    try:

        file.save(
            image_path
        )

        print(
            "Temporary image saved:"
        )

        print(
            image_path
        )

    except Exception as e:

        print(
            "IMAGE SAVE ERROR:",
            repr(e)
        )

        return jsonify({

            "success":
                False,

            "error":
                (
                    "Could not save image: "
                    + str(e)
                )

        }), 500


    # ========================================================
    # RUN AI MODEL
    # ========================================================

    try:

        print(
            "Running AI prediction..."
        )

        result = predict_image(
            str(image_path)
        )

        print(
            "AI PREDICTION RESULT:"
        )

        print(
            result
        )

    except Exception as e:

        print(
            "AI PREDICTION ERROR:",
            repr(e)
        )


        try:

            image_path.unlink(
                missing_ok=True
            )

        except Exception:

            pass


        return jsonify({

            "success":
                False,

            "error":
                str(e)

        }), 500


    # ========================================================
    # GET RESULT VALUES
    # ========================================================

    detected_image_type = result.get(
        "image_type"
    )

    model_used = result.get(
        "model"
    )

    predicted_class = result.get(
        "predicted_class"
    )

    confidence = result.get(
        "confidence"
    )

    probabilities = result.get(
        "probabilities",
        {}
    )

    detection_confidence = result.get(
        "image_type_confidence"
    )


    # ========================================================
    # NORMALIZE CONFIDENCE
    # ========================================================

    try:

        confidence_value = float(
            confidence
        )

    except (
        TypeError,
        ValueError
    ):

        confidence_value = 0.0


    # ========================================================
    # SAVE PREDICTION
    # ========================================================
    #
    # THIS IS THE IMPORTANT FIX.
    #
    # Previously, if user_id/user was not found,
    # the code simply skipped the save and still returned
    # success=True.
    #
    # Now saving is mandatory.
    # ========================================================

    try:

        print(
            "\n"
            "----------------------------------------"
        )

        print(
            "SAVING PREDICTION TO DATABASE"
        )

        print(
            "User ID:",
            user.id
        )

        print(
            "Image:",
            original_filename
        )

        print(
            "Model:",
            model_used
        )

        print(
            "Prediction:",
            predicted_class
        )

        print(
            "Confidence:",
            confidence_value
        )


        prediction_record = Prediction(

            user_id=user.id,

            image_name=
                original_filename,

            model_type=
                model_used,

            image_type=
                detected_image_type,

            image_type_confidence=
                detection_confidence,

            predicted_class=
                predicted_class,

            confidence=
                confidence_value,

            probabilities=
                json.dumps(
                    probabilities
                )

        )


        db.session.add(
            prediction_record
        )


        db.session.commit()


        # Force SQLAlchemy to load the generated ID

        saved_prediction_id = (
            prediction_record.id
        )


        print(
            "----------------------------------------"
        )

        print(
            "PREDICTION SAVED SUCCESSFULLY"
        )

        print(
            "Prediction ID:",
            saved_prediction_id
        )

        print(
            "User ID:",
            user.id
        )

        print(
            "Condition:",
            predicted_class
        )

        print(
            "----------------------------------------"
        )

        # ====================================================
        # SAVE A PERMANENT COPY OF THE ORIGINAL IMAGE
        # ====================================================

        permanent_image_path = (
            PREDICTION_IMAGE_FOLDER
            / (
                str(saved_prediction_id)
                + "_"
                + unique_filename
            )
        )

        try:

            shutil.copy2(
                image_path,
                permanent_image_path
            )

            print(
                "Permanent prediction image saved:"
            )

            print(
                permanent_image_path
            )

        except Exception as image_save_error:

            print(
                "PERMANENT IMAGE SAVE ERROR:",
                repr(image_save_error)
            )

            # Do not fail an otherwise successful prediction.


    except Exception as e:

        db.session.rollback()


        print(
            "\n"
            "========================================"
        )

        print(
            "DATABASE SAVE ERROR"
        )

        print(
            repr(e)
        )

        print(
            "========================================\n"
        )


        try:

            image_path.unlink(
                missing_ok=True
            )

        except Exception:

            pass


        return jsonify({

            "success":
                False,

            "error":
                (
                    "Prediction completed, "
                    "but could not be saved "
                    "to prediction history: "
                    + str(e)
                )

        }), 500


    # ========================================================
    # VERIFY THAT HISTORY CAN READ THE NEW RECORD
    # ========================================================

    try:

        verify_count = (
            Prediction.query
            .filter_by(
                user_id=user.id
            )
            .count()
        )


        print(
            "Total predictions for user",
            user.id,
            ":",
            verify_count
        )


    except Exception as e:

        print(
            "History verification error:",
            repr(e)
        )


    # ========================================================
    # DELETE TEMP IMAGE
    # ========================================================

    try:

        image_path.unlink(
            missing_ok=True
        )

        print(
            "Temporary image deleted."
        )

    except Exception as e:

        print(
            "Temporary image cleanup error:",
            repr(e)
        )


    # ========================================================
    # RETURN RESULT
    # ========================================================

    print(
        "\n"
        "========================================"
    )

    print(
        "PREDICTION REQUEST COMPLETED"
    )

    print(
        "========================================"
    )


    return jsonify({

        "success":
            True,

        "image_type":
            detected_image_type,

        "image_type_confidence":
            detection_confidence,

        "model":
            model_used,

        "prediction":
            predicted_class,

        "predicted_class":
            predicted_class,

        "confidence":
            round(
                confidence_value,
                2
            ),

        "prediction_id":
            saved_prediction_id,

        "image_name":
            original_filename,

        "image_url":
            "/history/image/"
            + str(saved_prediction_id),

        "probabilities":
            probabilities,

        "care_guidance":
            CARE_GUIDANCE.get(
                predicted_class,
                {
                    "name": predicted_class or "Unknown",
                    "risk": "Needs review",
                    "summary": "The model returned a class for which detailed guidance is not configured.",
                    "about": "This is an AI classification result and requires professional interpretation.",
                    "recommendation": "Consider a qualified eye-care professional evaluation.",
                    "examination": ["Professional eye-care evaluation"],
                    "tests": ["Additional tests as clinically indicated"],
                    "habits": ["Follow general eye-health practices"],
                    "followup": "Follow the schedule recommended by your eye-care professional.",
                    "warnings": COMMON_WARNING_SIGNS
                }
            )

    })


# ============================================================
# CREATE DATABASE TABLES
# ============================================================

with app.app_context():

    db.create_all()

    # ========================================================
    # SQLITE SCHEMA MIGRATION
    # ========================================================
    # db.create_all() does NOT add new columns to an existing
    # SQLite table. Add the two newer prediction columns when
    # an older eye_disease.db is being used.
    # ========================================================

    inspector = inspect(db.engine)

    prediction_columns = {
        column["name"]
        for column in inspector.get_columns("predictions")
    }

    if "image_type" not in prediction_columns:
        db.session.execute(
            text(
                "ALTER TABLE predictions "
                "ADD COLUMN image_type VARCHAR(50)"
            )
        )

    if "image_type_confidence" not in prediction_columns:
        db.session.execute(
            text(
                "ALTER TABLE predictions "
                "ADD COLUMN image_type_confidence FLOAT"
            )
        )

    if "probabilities" not in prediction_columns:
        db.session.execute(
            text(
                "ALTER TABLE predictions "
                "ADD COLUMN probabilities TEXT"
            )
        )

    db.session.commit()


# ============================================================
# REGISTER
# ============================================================

@app.route(
    "/register",
    methods=["POST"]
)
def register():

    data = request.get_json()


    if not data:

        return jsonify({

            "success":
                False,

            "error":
                "Invalid request"

        }), 400


    name = data.get(
        "name"
    )

    email = data.get(
        "email"
    )

    password = data.get(
        "password"
    )


    if (
        not name
        or not email
        or not password
    ):

        return jsonify({

            "success":
                False,

            "error":
                (
                    "Name, email and password "
                    "are required"
                )

        }), 400


    existing_user = (
        User.query
        .filter_by(
            email=email
        )
        .first()
    )


    if existing_user:

        return jsonify({

            "success":
                False,

            "error":
                "Email already registered"

        }), 409


    try:

        hashed_password = (
            bcrypt
            .generate_password_hash(
                password
            )
            .decode(
                "utf-8"
            )
        )


        user = User(

            name=name,

            email=email,

            password=hashed_password

        )


        db.session.add(
            user
        )

        db.session.commit()


        print(
            "NEW USER CREATED:"
        )

        print(
            "ID:",
            user.id
        )

        print(
            "Email:",
            user.email
        )


        return jsonify({

            "success":
                True,

            "message":
                "User registered successfully",

            "user_id":
                user.id

        }), 201


    except Exception as e:

        db.session.rollback()


        print(
            "REGISTER DATABASE ERROR:",
            repr(e)
        )


        return jsonify({

            "success":
                False,

            "error":
                str(e)

        }), 500


# ============================================================
# LOGIN
# ============================================================

@app.route(
    "/login",
    methods=["POST"]
)
def login():

    data = request.get_json()


    if not data:

        return jsonify({

            "success":
                False,

            "error":
                "Invalid request"

        }), 400


    email = data.get(
        "email"
    )

    password = data.get(
        "password"
    )


    if (
        not email
        or not password
    ):

        return jsonify({

            "success":
                False,

            "error":
                (
                    "Email and password "
                    "are required"
                )

        }), 400


    user = (
        User.query
        .filter_by(
            email=email
        )
        .first()
    )


    if not user:

        return jsonify({

            "success":
                False,

            "error":
                "Invalid email or password"

        }), 401


    if not bcrypt.check_password_hash(
        user.password,
        password
    ):

        return jsonify({

            "success":
                False,

            "error":
                "Invalid email or password"

        }), 401


    session[
        "user_id"
    ] = user.id


    print(
        "\n"
        "========================================"
    )

    print(
        "USER LOGIN SUCCESS"
    )

    print(
        "User ID:",
        user.id
    )

    print(
        "Name:",
        user.name
    )

    print(
        "Email:",
        user.email
    )

    print(
        "========================================\n"
    )


    return jsonify({

        "success":
            True,

        "message":
            "Login successful",

        "user": {

            "id":
                user.id,

            "name":
                user.name,

            "email":
                user.email

        }

    })


# ============================================================
# PREDICTION HISTORY
# ============================================================

@app.route(
    "/history/<int:user_id>",
    methods=["GET"]
)
def get_history(
    user_id
):

    print(
        "\n"
        "========================================"
    )

    print(
        "HISTORY REQUEST"
    )

    print(
        "Requested User ID:",
        user_id
    )


    try:

        # ----------------------------------------------------
        # Check user
        # ----------------------------------------------------

        user = User.query.get(
            user_id
        )


        if not user:

            print(
                "HISTORY ERROR: USER NOT FOUND"
            )

            return jsonify({

                "success":
                    False,

                "error":
                    "User not found"

            }), 404


        # ----------------------------------------------------
        # Query predictions
        # ----------------------------------------------------

        predictions = (
            Prediction.query
            .filter_by(
                user_id=user_id
            )
            .order_by(
                Prediction.created_at.desc()
            )
            .all()
        )


        print(
            "Records found:",
            len(predictions)
        )


        history = []


        for prediction in predictions:

            created_at = (
                prediction.created_at
            )


            if created_at:
                created_at_india = convert_to_india_time(
                    created_at
                )

                created_at_string = created_at_india.strftime(
                    "%d-%m-%Y %I:%M:%S %p"
                )
            else:
                created_at_string = "-"


            history.append({

                "id":
                    prediction.id,

                "user_id":
                    prediction.user_id,

                "image_name":
                    prediction.image_name,

                "image_url":
                    "/history/image/"
                    + str(prediction.id),

                "model_type":
                    prediction.model_type,

                "image_type":
                    prediction.image_type,

                "image_type_confidence":
                    prediction.image_type_confidence,

                "predicted_class":
                    prediction.predicted_class,

                "confidence":
                    prediction.confidence,

                "probabilities":
                    (
                        json.loads(
                            prediction.probabilities
                        )
                        if prediction.probabilities
                        else {}
                    ),

                "created_at":
                    created_at_string

            })


        print(
            "History response prepared."
        )

        print(
            "========================================\n"
        )


        return jsonify({

            "success":
                True,

            "history":
                history

        })


    except Exception as e:

        print(
            "\n"
            "========================================"
        )

        print(
            "HISTORY DATABASE ERROR"
        )

        print(
            repr(e)
        )

        print(
            "========================================\n"
        )


        return jsonify({

            "success":
                False,

            "error":
                str(e)

        }), 500


# ============================================================
# HISTORY DETAIL
# ============================================================

@app.route(
    "/history/detail/<int:prediction_id>",
    methods=["GET"]
)
def get_prediction_detail(prediction_id):

    print("\n========================================")
    print("HISTORY DETAIL REQUEST")
    print("Prediction ID:", prediction_id)

    try:

        prediction = Prediction.query.filter_by(
            id=prediction_id
        ).first()

        if not prediction:

            return jsonify({
                "success": False,
                "error": "Prediction not found"
            }), 404

        if prediction.created_at:
            created_at_india = convert_to_india_time(
                prediction.created_at
            )

            created_at = created_at_india.strftime(
                "%d-%m-%Y %I:%M:%S %p"
            )
        else:
            created_at = "-"

        detail_user = User.query.get(
            prediction.user_id
        )

        return jsonify({
            "success": True,

            "prediction": {

                "id": prediction.id,

                "report_id":
                    "EYAI-" +
                    str(prediction.id).zfill(6),

                "user_name":
                    detail_user.name
                    if detail_user
                    else "-",

                "user_email":
                    detail_user.email
                    if detail_user
                    else "-",

                "user_id": prediction.user_id,

                "image_name": prediction.image_name,

                "image_url":
                    "/history/image/"
                    + str(prediction.id),

                "model_type": prediction.model_type,

                "image_type": prediction.image_type,

                "image_type_confidence":
                    prediction.image_type_confidence,

                "predicted_class":
                    prediction.predicted_class,

                "confidence":
                    prediction.confidence,

                "probabilities": (
                    json.loads(
                        prediction.probabilities
                    )
                    if prediction.probabilities
                    else {}
                ),

                "created_at": created_at

            }
        })

    except Exception as e:

        print(
            "HISTORY DETAIL ERROR:",
            repr(e)
        )

        return jsonify({
            "success": False,
            "error": str(e)
        }), 500



# ============================================================
# PDF REPORT
# ============================================================

@app.route(
    "/report/<int:prediction_id>",
    methods=["GET"]
)
def generate_report(prediction_id):

    print("\\n========================================")
    print("REPORT REQUEST")
    print("Prediction ID:", prediction_id)

    try:

        current_user_id = session.get("user_id")

        admin_logged_in = (
            session.get("admin_logged_in") is True
        )

        if (
            not current_user_id
            and not admin_logged_in
        ):
            return jsonify({
                "success": False,
                "error": "Please login again."
            }), 401

        prediction = Prediction.query.filter_by(
            id=prediction_id
        ).first()

        if not prediction:
            return jsonify({
                "success": False,
                "error": "Prediction not found"
            }), 404

        if (
            not admin_logged_in
            and int(current_user_id) != int(prediction.user_id)
        ):
            return jsonify({
                "success": False,
                "error": "You are not allowed to access this report."
            }), 403

        user = User.query.get(prediction.user_id)

        if not user:
            return jsonify({
                "success": False,
                "error": "User not found"
            }), 404

        matching_files = sorted(
            PREDICTION_IMAGE_FOLDER.glob(
                str(prediction_id) + "_*"
            )
        )

        if not matching_files:
            matching_files = sorted(
                LEGACY_PREDICTION_IMAGE_FOLDER.glob(
                    str(prediction_id) + "_*"
                )
            )

        if not matching_files:
            return jsonify({
                "success": False,
                "error": "Saved prediction image is not available."
            }), 404

        image_path = matching_files[0]

        try:
            probabilities = (
                json.loads(prediction.probabilities)
                if prediction.probabilities
                else {}
            )
        except Exception:
            probabilities = {}

        try:
            confidence = float(prediction.confidence or 0)
            if 0 <= confidence <= 1:
                confidence *= 100
        except Exception:
            confidence = 0.0

        try:
            detection_confidence = float(
                prediction.image_type_confidence
            )
            if 0 <= detection_confidence <= 1:
                detection_confidence *= 100
            detection_text = f"{detection_confidence:.2f}%"
        except Exception:
            detection_text = "-"

        created_at = (
            prediction.created_at.strftime(
                "%d %B %Y, %I:%M %p"
            )
            if prediction.created_at
            else "-"
        )

        report_id = "EYAI-" + str(prediction.id).zfill(6)

        pdf_buffer = io.BytesIO()

        document = SimpleDocTemplate(
            pdf_buffer,
            pagesize=A4,
            rightMargin=16 * mm,
            leftMargin=16 * mm,
            topMargin=15 * mm,
            bottomMargin=15 * mm
        )

        styles = getSampleStyleSheet()

        title_style = ParagraphStyle(
            "EyeAITitle",
            parent=styles["Title"],
            fontName="Helvetica-Bold",
            fontSize=22,
            leading=26,
            alignment=TA_CENTER,
            spaceAfter=2 * mm
        )

        subtitle_style = ParagraphStyle(
            "EyeAISubtitle",
            parent=styles["Normal"],
            fontSize=9,
            leading=12,
            alignment=TA_CENTER,
            textColor=colors.HexColor("#667085"),
            spaceAfter=7 * mm
        )

        heading_style = ParagraphStyle(
            "EyeAIHeading",
            parent=styles["Heading2"],
            fontName="Helvetica-Bold",
            fontSize=12,
            leading=15,
            textColor=colors.HexColor("#101828"),
            spaceBefore=5 * mm,
            spaceAfter=3 * mm
        )

        normal_style = ParagraphStyle(
            "EyeAINormal",
            parent=styles["Normal"],
            fontSize=9,
            leading=13
        )

        small_style = ParagraphStyle(
            "EyeAISmall",
            parent=styles["Normal"],
            fontSize=8,
            leading=11,
            textColor=colors.HexColor("#667085")
        )

        disclaimer_style = ParagraphStyle(
            "EyeAIDisclaimer",
            parent=styles["Normal"],
            fontSize=7.5,
            leading=10,
            textColor=colors.HexColor("#667085"),
            alignment=TA_CENTER
        )

        story = []

        story.append(Paragraph("EyeAI", title_style))
        story.append(
            Paragraph(
                "AI EYE ANALYSIS REPORT",
                subtitle_style
            )
        )

        info_table = Table(
            [
                [
                    Paragraph("<b>USER</b>", normal_style),
                    Paragraph(str(user.name), normal_style),
                    Paragraph("<b>REPORT ID</b>", normal_style),
                    Paragraph(report_id, normal_style)
                ],
                [
                    Paragraph("<b>EMAIL</b>", normal_style),
                    Paragraph(str(user.email), normal_style),
                    Paragraph("<b>DATE</b>", normal_style),
                    Paragraph(created_at, normal_style)
                ]
            ],
            colWidths=[27 * mm, 55 * mm, 27 * mm, 65 * mm]
        )

        info_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F7F9FC")),
            ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#D0D5DD")),
            ("INNERGRID", (0, 0), (-1, -1), 0.3, colors.HexColor("#EAECF0")),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6)
        ]))

        story.append(info_table)

        story.append(Paragraph("UPLOADED EYE IMAGE", heading_style))

        try:
            pdf_image = PDFImage(str(image_path))
            max_width = 125 * mm
            max_height = 82 * mm
            image_ratio = pdf_image.imageWidth / float(pdf_image.imageHeight)
            if image_ratio >= max_width / max_height:
                pdf_image.drawWidth = max_width
                pdf_image.drawHeight = max_width / image_ratio
            else:
                pdf_image.drawHeight = max_height
                pdf_image.drawWidth = max_height * image_ratio
            story.append(pdf_image)
        except Exception as image_error:
            print("REPORT IMAGE ERROR:", repr(image_error))
            story.append(
                Paragraph(
                    "Unable to embed the uploaded image.",
                    normal_style
                )
            )

        story.append(Spacer(1, 3 * mm))
        story.append(
            Paragraph(
                "Original file: " + str(prediction.image_name or "-"),
                small_style
            )
        )

        story.append(Paragraph("SCAN INFORMATION", heading_style))

        scan_table = Table(
            [
                ["Image Type", prediction.image_type or "-"],
                ["AI Model", prediction.model_type or "-"],
                ["Detection Confidence", detection_text]
            ],
            colWidths=[55 * mm, 119 * mm]
        )

        scan_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#F7F9FC")),
            ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#D0D5DD")),
            ("FONTSIZE", (0, 0), (-1, -1), 9),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6)
        ]))

        story.append(scan_table)

        story.append(Paragraph("AI PREDICTION", heading_style))

        prediction_table = Table(
            [
                ["Predicted Condition", prediction.predicted_class or "-"],
                ["AI Confidence", f"{confidence:.2f}%"]
            ],
            colWidths=[55 * mm, 119 * mm]
        )

        prediction_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#F7F9FC")),
            ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#D0D5DD")),
            ("FONTSIZE", (0, 0), (-1, -1), 10),
            ("TOPPADDING", (0, 0), (-1, -1), 7),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 7)
        ]))

        story.append(prediction_table)

        story.append(
            Paragraph(
                "DISEASE / CLASS PROBABILITIES",
                heading_style
            )
        )

        probability_rows = [["Condition", "Probability"]]

        if probabilities:
            try:
                sorted_probabilities = sorted(
                    probabilities.items(),
                    key=lambda item: float(item[1]),
                    reverse=True
                )
            except Exception:
                sorted_probabilities = list(probabilities.items())

            for condition, value in sorted_probabilities:
                try:
                    percentage = float(value)
                    if 0 <= percentage <= 1:
                        percentage *= 100
                    probability_rows.append([
                        str(condition),
                        f"{percentage:.2f}%"
                    ])
                except Exception:
                    continue

        if len(probability_rows) == 1:
            probability_rows.append([
                str(prediction.predicted_class or "Prediction"),
                f"{confidence:.2f}%"
            ])

        probability_table = Table(
            probability_rows,
            colWidths=[125 * mm, 49 * mm],
            repeatRows=1
        )

        probability_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#101828")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#D0D5DD")),
            ("ALIGN", (1, 1), (1, -1), "RIGHT"),
            ("FONTSIZE", (0, 0), (-1, -1), 9),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5)
        ]))

        story.append(probability_table)

        story.append(Paragraph("CONDITION INFORMATION", heading_style))

        care = CARE_GUIDANCE.get(
            prediction.predicted_class,
            {
                "name": prediction.predicted_class or "Unknown",
                "risk": "Needs review",
                "about": "This is an AI classification result and requires professional interpretation.",
                "examination": ["Professional eye-care evaluation"],
                "tests": ["Additional tests as clinically indicated"],
                "habits": ["Follow general eye-health practices"],
                "followup": "Follow the schedule recommended by your eye-care professional.",
                "warnings": COMMON_WARNING_SIGNS
            }
        )

        condition_info = (
            "<b>Condition:</b> " + str(care["name"]) + "<br/>"
            + "<b>Screening status:</b> " + str(care["risk"]) + "<br/><br/>"
            + "<b>What this result means:</b> " + str(care["about"]) + "<br/><br/>"
            + "<b>Recommended examination:</b><br/>"
            + "<br/>".join("✓ " + str(x) for x in care["examination"])
            + "<br/><br/><b>Suggested checks / tests:</b><br/>"
            + "<br/>".join("✓ " + str(x) for x in care["tests"])
            + "<br/><br/><b>Supportive habits:</b><br/>"
            + "<br/>".join("✓ " + str(x) for x in care["habits"])
            + "<br/><br/><b>Follow-up:</b> " + str(care["followup"])
        )

        story.append(Paragraph(condition_info, normal_style))
        story.append(Spacer(1, 4 * mm))

        warning_text = (
            "<b>WHEN TO SEEK URGENT CARE</b><br/>"
            + "<br/>".join("⚠ " + str(x) for x in care["warnings"])
        )
        warning_box = Table([[Paragraph(warning_text, normal_style)]], colWidths=[174 * mm])
        warning_box.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#FFF8E7")),
            ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#E7B84B")),
            ("TOPPADDING", (0, 0), (-1, -1), 8),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
            ("LEFTPADDING", (0, 0), (-1, -1), 8),
            ("RIGHTPADDING", (0, 0), (-1, -1), 8)
        ]))
        story.append(warning_box)
        story.append(Spacer(1, 4 * mm))

        disclaimer = Table(
            [[
                Paragraph(
                    "<b>IMPORTANT:</b> This report is an AI-generated "
                    "screening result for educational and research "
                    "purposes. It is not a medical diagnosis. Please "
                    "consult a qualified eye-care professional for "
                    "clinical interpretation and medical advice.",
                    disclaimer_style
                )
            ]],
            colWidths=[174 * mm]
        )

        disclaimer.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#FFF8E7")),
            ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#E7B84B")),
            ("TOPPADDING", (0, 0), (-1, -1), 8),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
            ("LEFTPADDING", (0, 0), (-1, -1), 8),
            ("RIGHTPADDING", (0, 0), (-1, -1), 8)
        ]))

        story.append(disclaimer)
        story.append(Spacer(1, 5 * mm))
        story.append(
            Paragraph(
                "EyeAI • Intelligent eye image analysis • AI-assisted research system",
                disclaimer_style
            )
        )

        document.build(story)
        pdf_buffer.seek(0)

        print("REPORT GENERATED SUCCESSFULLY")
        print("========================================\\n")

        return send_file(
            pdf_buffer,
            mimetype="application/pdf",
            as_attachment=True,
            download_name=(
                "EyeAI_Report_"
                + str(prediction_id)
                + ".pdf"
            )
        )

    except Exception as e:

        print("REPORT ERROR:", repr(e))

        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


# ============================================================
# HISTORY IMAGE
# ============================================================

@app.route(
    "/history/image/<int:prediction_id>",
    methods=["GET"]
)
def get_prediction_image(prediction_id):

    print(
        "HISTORY IMAGE REQUEST:",
        prediction_id
    )

    try:

        prediction = Prediction.query.filter_by(
            id=prediction_id
        ).first()

        if not prediction:

            return jsonify({
                "success": False,
                "error": "Prediction not found"
            }), 404

        matching_files = sorted(
            PREDICTION_IMAGE_FOLDER.glob(
                str(prediction_id) + "_*"
            )
        )

        # Backward compatibility for images saved before this fix.
        if not matching_files:
            matching_files = sorted(
                LEGACY_PREDICTION_IMAGE_FOLDER.glob(
                    str(prediction_id) + "_*"
                )
            )

        if not matching_files:

            print(
                "HISTORY IMAGE NOT FOUND:",
                prediction_id
            )

            return jsonify({
                "success": False,
                "error": (
                    "Saved image is not available for "
                    "this prediction. Images uploaded "
                    "before permanent image storage was "
                    "enabled cannot be recovered."
                )
            }), 404

        image_path = matching_files[0]

        print(
            "SERVING HISTORY IMAGE:",
            image_path
        )

        return send_file(
            image_path
        )

    except Exception as e:

        print(
            "HISTORY IMAGE ERROR:",
            repr(e)
        )

        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


# ============================================================
# RUN SERVER
# ============================================================

if __name__ == "__main__":

    print(
        "\n"
        "========================================"
    )

    print(
        "       EYE DISEASE AI SERVER"
    )

    print(
        "========================================"
    )

    print(
        "Database: Flask instance/eye_disease.db"
    )

    print(
        "Temporary uploads:",
        TEMP_UPLOAD_FOLDER
    )

    print(
        "Server:"
    )

    print(
        "http://127.0.0.1:5000"
    )

    print(
        "========================================\n"
    )


    app.run(

        host="127.0.0.1",

        port=5000,

        debug=False,

        use_reloader=False

    )