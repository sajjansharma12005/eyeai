import torch
from torch.utils.data import DataLoader
from torchvision import transforms, models
from sklearn.metrics import classification_report, confusion_matrix
import numpy as np

from dataset3_loader import EyeDataset

# ==============================
# SETTINGS
# ==============================

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

TEST_CSV = "data/dataset3_splits/test.csv"

MODEL_PATH = "data/best_eye_disease_model.pth"

IMAGE_SIZE = 224
BATCH_SIZE = 16

CLASSES = [
    "Disease_Risk",
    "DR",
    "MH",
    "ODC",
    "TSLN"
]

# ==============================
# TRANSFORM
# ==============================

transform = transforms.Compose([
    transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])

# ==============================
# DATASET
# ==============================

print("=" * 60)
print("EYE DISEASE MODEL EVALUATION")
print("=" * 60)

print("Device:", DEVICE)

test_dataset = EyeDataset(
    TEST_CSV,
    transform=transform
)

test_loader = DataLoader(
    test_dataset,
    batch_size=BATCH_SIZE,
    shuffle=False,
    num_workers=0
)

print("Test images:", len(test_dataset))

# ==============================
# MODEL
# ==============================

model = models.resnet18(weights=None)

model.fc = torch.nn.Linear(
    model.fc.in_features,
    len(CLASSES)
)

checkpoint = torch.load(
    MODEL_PATH,
    map_location=DEVICE
)

model.load_state_dict(
    checkpoint["model_state_dict"]
)

model = model.to(DEVICE)
model.eval()

print("Model loaded successfully")

# ==============================
# EVALUATION
# ==============================

all_predictions = []
all_labels = []

correct = 0
total = 0

with torch.no_grad():

    for images, labels in test_loader:

        images = images.to(DEVICE)
        labels = labels.to(DEVICE)

        outputs = model(images)

        predictions = torch.argmax(outputs, dim=1)

        correct += (predictions == labels).sum().item()
        total += labels.size(0)

        all_predictions.extend(
            predictions.cpu().numpy()
        )

        all_labels.extend(
            labels.cpu().numpy()
        )

# ==============================
# RESULTS
# ==============================

accuracy = 100 * correct / total

print("\n" + "=" * 60)
print("TEST RESULTS")
print("=" * 60)

print(f"Test Accuracy: {accuracy:.2f}%")
print(f"Correct: {correct}")
print(f"Total: {total}")

print("\nClassification Report:")

print(
    classification_report(
        all_labels,
        all_predictions,
        target_names=CLASSES,
        zero_division=0
    )
)

print("\nConfusion Matrix:")

print(
    confusion_matrix(
        all_labels,
        all_predictions
    )
)

print("\n" + "=" * 60)
print("EVALUATION COMPLETE")
print("=" * 60)