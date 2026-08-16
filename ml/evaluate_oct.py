import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from torchvision import models

from dataset_oct_loader import test_dataset

from sklearn.metrics import (
    classification_report,
    confusion_matrix
)


# ============================================================
# SETTINGS
# ============================================================

BATCH_SIZE = 32

DEVICE = torch.device(
    "cuda" if torch.cuda.is_available() else "cpu"
)

CLASS_NAMES = [
    "CNV",
    "DME",
    "DRUSEN",
    "NORMAL"
]

MODEL_PATH = "data/best_oct_model.pth"


# ============================================================
# START
# ============================================================

print("=" * 60)
print("OCT MODEL EVALUATION")
print("=" * 60)

print("Device:", DEVICE)
print("Test images:", len(test_dataset))


# ============================================================
# TEST DATALOADER
# ============================================================

test_loader = DataLoader(
    test_dataset,
    batch_size=BATCH_SIZE,
    shuffle=False,
    num_workers=0
)


# ============================================================
# MODEL
# ============================================================

print("\nLoading OCT model...")

model = models.resnet18(
    weights=None
)

num_features = model.fc.in_features

model.fc = nn.Linear(
    num_features,
    4
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

print("Model loaded successfully.")


# ============================================================
# PREDICTION
# ============================================================

all_predictions = []
all_labels = []

correct = 0
total = 0


print("\nRunning test evaluation...")

with torch.no_grad():

    for images, labels in test_loader:

        images = images.to(DEVICE)
        labels = labels.to(DEVICE)

        outputs = model(images)

        _, predictions = torch.max(
            outputs,
            1
        )

        total += labels.size(0)

        correct += (
            predictions == labels
        ).sum().item()

        all_predictions.extend(
            predictions.cpu().numpy()
        )

        all_labels.extend(
            labels.cpu().numpy()
        )


# ============================================================
# ACCURACY
# ============================================================

test_accuracy = (
    100 * correct / total
)


print("\n" + "=" * 60)
print("TEST RESULTS")
print("=" * 60)

print(
    f"Test Accuracy: {test_accuracy:.2f}%"
)

print(
    f"Correct: {correct}"
)

print(
    f"Total: {total}"
)


# ============================================================
# CLASSIFICATION REPORT
# ============================================================

print("\nClassification Report:")

print(
    classification_report(
        all_labels,
        all_predictions,
        target_names=CLASS_NAMES,
        digits=2
    )
)


# ============================================================
# CONFUSION MATRIX
# ============================================================

print("Confusion Matrix:")

cm = confusion_matrix(
    all_labels,
    all_predictions
)

print(cm)


# ============================================================
# COMPLETE
# ============================================================

print("\n" + "=" * 60)
print("OCT EVALUATION COMPLETE")
print("=" * 60)