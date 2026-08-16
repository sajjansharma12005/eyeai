from flask_sqlalchemy import SQLAlchemy
from datetime import datetime


db = SQLAlchemy()


# ============================================================
# USER
# ============================================================

class User(db.Model):

    __tablename__ = "users"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    name = db.Column(
        db.String(100),
        nullable=False
    )

    email = db.Column(
        db.String(150),
        unique=True,
        nullable=False
    )

    password = db.Column(
        db.String(255),
        nullable=False
    )

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )

    # --------------------------------------------------------
    # USER -> PREDICTIONS
    # --------------------------------------------------------

    predictions = db.relationship(
        "Prediction",
        backref="user",
        lazy=True,
        cascade="all, delete-orphan"
    )


# ============================================================
# PREDICTION
# ============================================================

class Prediction(db.Model):

    __tablename__ = "predictions"

    # --------------------------------------------------------
    # PRIMARY KEY
    # --------------------------------------------------------

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    # --------------------------------------------------------
    # USER
    # --------------------------------------------------------

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False
    )

    # --------------------------------------------------------
    # IMAGE NAME
    # --------------------------------------------------------

    image_name = db.Column(
        db.String(255),
        nullable=True
    )

    # --------------------------------------------------------
    # MODEL USED
    # --------------------------------------------------------

    model_type = db.Column(
        db.String(100),
        nullable=True
    )

    # --------------------------------------------------------
    # IMAGE TYPE
    # --------------------------------------------------------
    #
    # Example:
    # Fundus
    # OCT
    # --------------------------------------------------------

    image_type = db.Column(
        db.String(50),
        nullable=True
    )

    # --------------------------------------------------------
    # IMAGE TYPE DETECTION CONFIDENCE
    # --------------------------------------------------------

    image_type_confidence = db.Column(
        db.Float,
        nullable=True
    )

    # --------------------------------------------------------
    # PREDICTED CLASS
    # --------------------------------------------------------

    predicted_class = db.Column(
        db.String(100),
        nullable=False
    )

    # --------------------------------------------------------
    # MODEL CONFIDENCE
    # --------------------------------------------------------

    confidence = db.Column(
        db.Float,
        nullable=False
    )

    # ========================================================
    # CLASS PROBABILITIES
    # ========================================================
    #
    # Stores all model class probabilities as JSON text.
    #
    # Example:
    #
    # {
    #     "Myopia": 94.21,
    #     "Healthy": 3.41,
    #     "Glaucoma": 2.38
    # }
    #
    # This is used by the PDF report.
    # ========================================================

    probabilities = db.Column(
        db.Text,
        nullable=True
    )

    # --------------------------------------------------------
    # CREATED TIME
    # --------------------------------------------------------

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    # ========================================================
    # STRING REPRESENTATION
    # ========================================================

    def __repr__(self):

        return (
            f"<Prediction "
            f"id={self.id} "
            f"user_id={self.user_id} "
            f"prediction='{self.predicted_class}'>"
        )