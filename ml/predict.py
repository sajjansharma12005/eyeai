import torch
import torch.nn as nn

from torchvision import models, transforms

from PIL import Image

from pathlib import Path


# ============================================================
# SETTINGS
# ============================================================

DEVICE = torch.device("cpu")

BASE_DIR = Path(__file__).resolve().parent.parent

DATASET3_MODEL_PATH = (
    BASE_DIR
    / "data"
    / "best_eye_disease_model_dataset3.pth"
)

OCT_MODEL_PATH = (
    BASE_DIR
    / "data"
    / "best_oct_model.pth"
)


IMAGE_SIZE = 224


# ============================================================
# DATASET 3 CLASSES
# ============================================================

DATASET3_CLASSES = [

    "Disease_Risk",

    "DR",

    "MH",

    "ODC",

    "TSLN"

]


# ============================================================
# OCT CLASSES
# ============================================================

OCT_CLASSES = [

    "CNV",

    "DME",

    "DRUSEN",

    "NORMAL"

]


# ============================================================
# TRANSFORM
# ============================================================

transform = transforms.Compose([

    transforms.Resize(
        (IMAGE_SIZE, IMAGE_SIZE)
    ),

    transforms.ToTensor(),

    transforms.Normalize(

        mean=[
            0.485,
            0.456,
            0.406
        ],

        std=[
            0.229,
            0.224,
            0.225
        ]

    )

])


# ============================================================
# LOAD RESNET18
# ============================================================

def create_model(number_of_classes):

    model = models.resnet18(
        weights=None
    )

    model.fc = nn.Linear(

        model.fc.in_features,

        number_of_classes

    )

    return model


# ============================================================
# LOAD DATASET 3 MODEL
# ============================================================

print("=" * 60)
print("LOADING EYE DISEASE MODELS")
print("=" * 60)

print("Device:", DEVICE)

print("\nLoading Dataset 3 model...")

dataset3_model = create_model(
    len(DATASET3_CLASSES)
)


dataset3_checkpoint = torch.load(

    DATASET3_MODEL_PATH,

    map_location=DEVICE

)


if "model_state_dict" in dataset3_checkpoint:

    dataset3_model.load_state_dict(
        dataset3_checkpoint[
            "model_state_dict"
        ]
    )

else:

    dataset3_model.load_state_dict(
        dataset3_checkpoint
    )


dataset3_model.to(DEVICE)

dataset3_model.eval()

print(
    "Dataset 3 model loaded successfully."
)


# ============================================================
# LOAD OCT MODEL
# ============================================================

print("\nLoading OCT model...")

oct_model = create_model(
    len(OCT_CLASSES)
)


oct_checkpoint = torch.load(

    OCT_MODEL_PATH,

    map_location=DEVICE

)


if "model_state_dict" in oct_checkpoint:

    oct_model.load_state_dict(
        oct_checkpoint[
            "model_state_dict"
        ]
    )

else:

    oct_model.load_state_dict(
        oct_checkpoint
    )


oct_model.to(DEVICE)

oct_model.eval()

print(
    "OCT model loaded successfully."
)


print("=" * 60)


# ============================================================
# IMAGE TYPE DETECTION
# ============================================================

def detect_image_type(image):

    """
    Automatically determine whether the uploaded
    image looks more like:

        FUNDUS
        OCT
        UNKNOWN

    This is a heuristic detector.
    It is NOT a trained modality classifier.
    """

    # Convert to RGB
    rgb_image = image.convert("RGB")

    # Resize for analysis
    small_image = rgb_image.resize(
        (224, 224)
    )

    # Get pixel data
    pixels = list(
        small_image.getdata()
    )

    total_pixels = len(pixels)

    if total_pixels == 0:

        return "UNKNOWN", 0.0


    # --------------------------------------------------------
    # Calculate average color difference
    # --------------------------------------------------------

    color_difference = 0.0

    for r, g, b in pixels:

        color_difference += (

            abs(r - g)

            + abs(g - b)

            + abs(r - b)

        ) / 3


    color_difference /= total_pixels


    # --------------------------------------------------------
    # Calculate brightness
    # --------------------------------------------------------

    brightness = 0.0

    for r, g, b in pixels:

        brightness += (
            r + g + b
        ) / 3


    brightness /= total_pixels


    # --------------------------------------------------------
    # OCT images are commonly grayscale.
    #
    # Fundus images usually contain stronger
    # color differences.
    # --------------------------------------------------------

    if color_difference < 12:

        image_type = "OCT"

        confidence = min(

            99.0,

            60.0
            + (12 - color_difference)
            * 3.0

        )

    else:

        image_type = "FUNDUS"

        confidence = min(

            99.0,

            60.0
            + color_difference
            * 1.5

        )


    return (
        image_type,
        round(confidence, 2)
    )


# ============================================================
# DATASET 3 PREDICTION
# ============================================================

def predict_dataset3(image):

    image_tensor = transform(
        image
    )

    image_tensor = image_tensor.unsqueeze(
        0
    )

    image_tensor = image_tensor.to(
        DEVICE
    )


    with torch.no_grad():

        output = dataset3_model(
            image_tensor
        )

        probabilities = torch.softmax(
            output,
            dim=1
        )

        confidence, predicted = torch.max(
            probabilities,
            dim=1
        )


    predicted_class = DATASET3_CLASSES[
        predicted.item()
    ]


    confidence_value = (
        confidence.item()
        * 100
    )


    all_probabilities = {}


    for class_name, probability in zip(

        DATASET3_CLASSES,

        probabilities[0]

    ):

        all_probabilities[
            class_name
        ] = round(

            probability.item()
            * 100,

            2

        )


    return {

        "predicted_class":
            predicted_class,

        "confidence":
            confidence_value,

        "probabilities":
            all_probabilities

    }


# ============================================================
# OCT PREDICTION
# ============================================================

def predict_oct(image):

    image_tensor = transform(
        image
    )

    image_tensor = image_tensor.unsqueeze(
        0
    )

    image_tensor = image_tensor.to(
        DEVICE
    )


    with torch.no_grad():

        output = oct_model(
            image_tensor
        )

        probabilities = torch.softmax(
            output,
            dim=1
        )

        confidence, predicted = torch.max(
            probabilities,
            dim=1
        )


    predicted_class = OCT_CLASSES[
        predicted.item()
    ]


    confidence_value = (
        confidence.item()
        * 100
    )


    all_probabilities = {}


    for class_name, probability in zip(

        OCT_CLASSES,

        probabilities[0]

    ):

        all_probabilities[
            class_name
        ] = round(

            probability.item()
            * 100,

            2

        )


    return {

        "predicted_class":
            predicted_class,

        "confidence":
            confidence_value,

        "probabilities":
            all_probabilities

    }


# ============================================================
# MAIN PREDICTION FUNCTION
# ============================================================

def predict_image(
    image_path,
    model_type=None
):

    """
    Main prediction function.

    The user does NOT need to choose the model.

    The system automatically detects:

        FUNDUS -> Dataset 3
        OCT    -> OCT model
    """


    # --------------------------------------------------------
    # Open image
    # --------------------------------------------------------

    image = Image.open(
        image_path
    ).convert("RGB")


    # --------------------------------------------------------
    # Detect image type
    # --------------------------------------------------------

    detected_type, type_confidence = (
        detect_image_type(image)
    )


    print(
        "\nDetected image type:",
        detected_type
    )

    print(
        "Detection confidence:",
        type_confidence,
        "%"
    )


    # --------------------------------------------------------
    # OCT
    # --------------------------------------------------------

    if detected_type == "OCT":

        result = predict_oct(
            image
        )

        result[
            "image_type"
        ] = "OCT"

        result[
            "model"
        ] = "OCT"

        result[
            "image_type_confidence"
        ] = type_confidence


        return result


    # --------------------------------------------------------
    # FUNDUS / DATASET 3
    # --------------------------------------------------------

    if detected_type == "FUNDUS":

        result = predict_dataset3(
            image
        )

        result[
            "image_type"
        ] = "FUNDUS"

        result[
            "model"
        ] = "Dataset 3"

        result[
            "image_type_confidence"
        ] = type_confidence


        return result


    # --------------------------------------------------------
    # UNKNOWN
    # --------------------------------------------------------

    raise ValueError(
        "Unable to determine whether "
        "the image is a Fundus or OCT image."
    )


# ============================================================
# TEST
# ============================================================

if __name__ == "__main__":

    print("\n" + "=" * 60)

    print(
        "AUTOMATIC EYE IMAGE PREDICTION TEST"
    )

    print("=" * 60)


    image_path = input(
        "\nEnter image path: "
    ).strip()


    try:

        result = predict_image(
            image_path
        )


        print("\n" + "=" * 60)

        print(
            "PREDICTION RESULT"
        )

        print("=" * 60)


        print(
            "Image type :",
            result["image_type"]
        )


        print(
            "Model      :",
            result["model"]
        )


        print(
            "Prediction :",
            result["predicted_class"]
        )


        print(
            "Confidence :",
            f'{result["confidence"]:.2f}%'
        )


        print(
            "\nAll probabilities:"
        )


        for class_name, probability in (
            result["probabilities"].items()
        ):

            print(
                f"{class_name:20} : "
                f"{probability:.2f}%"
            )


        print("=" * 60)


    except Exception as e:

        print(
            "\nPrediction error:"
        )

        print(e)