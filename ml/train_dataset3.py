import torch
import torch.nn as nn

from torch.utils.data import DataLoader
from torchvision import models

from dataset3_loader import (
    train_dataset,
    val_dataset,
    train_transform,
    val_test_transform
)


# ============================================================
# SETTINGS
# ============================================================

BATCH_SIZE = 16
EPOCHS = 10
LEARNING_RATE = 0.0001

DEVICE = torch.device(
    "cuda" if torch.cuda.is_available() else "cpu"
)


print("=" * 60)
print("DATASET 3 - EYE DISEASE MODEL TRAINING")
print("=" * 60)

print("Device:", DEVICE)

print("Training images:", len(train_dataset))
print("Validation images:", len(val_dataset))


# ============================================================
# DATALOADERS
# ============================================================

train_loader = DataLoader(
    train_dataset,
    batch_size=BATCH_SIZE,
    shuffle=True,
    num_workers=0
)

val_loader = DataLoader(
    val_dataset,
    batch_size=BATCH_SIZE,
    shuffle=False,
    num_workers=0
)


# ============================================================
# MODEL
# ============================================================

print("\nLoading ResNet18...")

model = models.resnet18(
    weights=models.ResNet18_Weights.DEFAULT
)


# Number of features before final layer

num_features = model.fc.in_features


# Dataset 3 has 5 classes

model.fc = nn.Linear(
    num_features,
    5
)


model = model.to(DEVICE)


print("Model: ResNet18")
print("Output classes: 5")


# ============================================================
# LOSS
# ============================================================

criterion = nn.CrossEntropyLoss()


# ============================================================
# OPTIMIZER
# ============================================================

optimizer = torch.optim.Adam(
    model.parameters(),
    lr=LEARNING_RATE
)


# ============================================================
# TRAINING
# ============================================================

best_val_accuracy = 0.0


for epoch in range(EPOCHS):

    print("\n")
    print("=" * 60)
    print(f"EPOCH {epoch + 1}/{EPOCHS}")
    print("=" * 60)


    # ========================================================
    # TRAIN
    # ========================================================

    model.train()

    running_loss = 0.0

    correct = 0
    total = 0


    for batch_index, (images, labels) in enumerate(train_loader):

        images = images.to(DEVICE)
        labels = labels.to(DEVICE)


        # Clear gradients

        optimizer.zero_grad()


        # Forward pass

        outputs = model(images)


        # Calculate loss

        loss = criterion(
            outputs,
            labels
        )


        # Backpropagation

        loss.backward()


        # Update weights

        optimizer.step()


        # Statistics

        running_loss += loss.item()


        _, predicted = torch.max(
            outputs,
            1
        )


        total += labels.size(0)

        correct += (
            predicted == labels
        ).sum().item()


        # Progress

        if (batch_index + 1) % 20 == 0:

            print(
                f"Batch "
                f"{batch_index + 1}/{len(train_loader)} "
                f"| Loss: {loss.item():.4f}"
            )


    # ========================================================
    # TRAINING RESULTS
    # ========================================================

    train_accuracy = (
        100 * correct / total
    )

    train_loss = (
        running_loss / len(train_loader)
    )


    # ========================================================
    # VALIDATION
    # ========================================================

    model.eval()

    val_correct = 0
    val_total = 0
    val_loss = 0.0


    with torch.no_grad():

        for images, labels in val_loader:

            images = images.to(DEVICE)
            labels = labels.to(DEVICE)


            outputs = model(images)


            loss = criterion(
                outputs,
                labels
            )


            val_loss += loss.item()


            _, predicted = torch.max(
                outputs,
                1
            )


            val_total += labels.size(0)


            val_correct += (
                predicted == labels
            ).sum().item()


    # ========================================================
    # VALIDATION RESULTS
    # ========================================================

    val_accuracy = (
        100 * val_correct / val_total
    )

    val_loss = (
        val_loss / len(val_loader)
    )


    # ========================================================
    # PRINT RESULTS
    # ========================================================

    print("\nRESULTS")
    print("-" * 40)

    print(
        f"Train Loss     : {train_loss:.4f}"
    )

    print(
        f"Train Accuracy : {train_accuracy:.2f}%"
    )

    print(
        f"Val Loss       : {val_loss:.4f}"
    )

    print(
        f"Val Accuracy   : {val_accuracy:.2f}%"
    )


    # ========================================================
    # SAVE BEST MODEL
    # ========================================================

    if val_accuracy > best_val_accuracy:

        best_val_accuracy = val_accuracy


        torch.save(
            {
                "model_state_dict":
                    model.state_dict(),

                "val_accuracy":
                    val_accuracy,

                "class_names": [
                    "Diabetic Retinopathy",
                    "Glaucoma",
                    "Healthy",
                    "Myopia",
                    "Macular Scar"
                ]
            },

            "data/best_eye_disease_model_dataset3.pth"
        )


        print("\nBEST MODEL SAVED")

        print(
            f"Validation accuracy: "
            f"{val_accuracy:.2f}%"
        )


# ============================================================
# TRAINING COMPLETE
# ============================================================

print("\n")
print("=" * 60)
print("TRAINING COMPLETE")
print("=" * 60)

print(
    f"Best validation accuracy: "
    f"{best_val_accuracy:.2f}%"
)