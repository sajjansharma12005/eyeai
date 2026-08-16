from pathlib import Path
import csv

import torch
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms
from PIL import Image


# ============================================================
# CLASS NAMES
# ============================================================

CLASS_NAMES = [
    "Diabetic Retinopathy",
    "Glaucoma",
    "Healthy",
    "Myopia",
    "Macular Scar"
]


# ============================================================
# DATASET CLASS
# ============================================================

class EyeDataset(Dataset):

    def __init__(self, csv_file, transform=None):

        self.records = []

        self.transform = transform

        with open(csv_file, "r", encoding="utf-8") as file:

            reader = csv.DictReader(file)

            for row in reader:

                self.records.append({
                    "image_path": row["image_path"],
                    "label": int(row["label"]),
                    "class_name": row["class_name"]
                })


    def __len__(self):

        return len(self.records)


    def __getitem__(self, index):

        record = self.records[index]

        image_path = record["image_path"]
        label = record["label"]

        # Open image
        image = Image.open(image_path).convert("RGB")

        # Apply transformations
        if self.transform:
            image = self.transform(image)

        return image, label


# ============================================================
# TRANSFORMS
# ============================================================

train_transform = transforms.Compose([

    transforms.Resize((224, 224)),

    transforms.RandomHorizontalFlip(p=0.5),

    transforms.RandomRotation(10),

    transforms.ColorJitter(
        brightness=0.2,
        contrast=0.2
    ),

    transforms.ToTensor(),

    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])


val_test_transform = transforms.Compose([

    transforms.Resize((224, 224)),

    transforms.ToTensor(),

    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])


# ============================================================
# CREATE DATASETS
# ============================================================

train_dataset = EyeDataset(
    "data/dataset3_splits/train.csv",
    transform=train_transform
)

val_dataset = EyeDataset(
    "data/dataset3_splits/val.csv",
    transform=val_test_transform
)

test_dataset = EyeDataset(
    "data/dataset3_splits/test.csv",
    transform=val_test_transform
)


# ============================================================
# CREATE DATALOADERS
# ============================================================

train_loader = DataLoader(
    train_dataset,
    batch_size=16,
    shuffle=True,
    num_workers=0
)

val_loader = DataLoader(
    val_dataset,
    batch_size=16,
    shuffle=False,
    num_workers=0
)

test_loader = DataLoader(
    test_dataset,
    batch_size=16,
    shuffle=False,
    num_workers=0
)


# ============================================================
# TEST THE DATALOADER
# ============================================================

if __name__ == "__main__":

    print("=" * 60)
    print("DATASET 3 DATALOADER TEST")
    print("=" * 60)

    print(f"Train images : {len(train_dataset)}")
    print(f"Validation   : {len(val_dataset)}")
    print(f"Test images  : {len(test_dataset)}")

    print("\nClasses:")

    for index, class_name in enumerate(CLASS_NAMES):
        print(f"{index}: {class_name}")

    # Get one batch
    images, labels = next(iter(train_loader))

    print("\nFirst batch:")

    print(f"Image tensor shape : {images.shape}")
    print(f"Labels shape       : {labels.shape}")

    print("\nLabels in first batch:")

    print(labels.tolist())

    print("\nImage tensor information:")

    print(f"Data type : {images.dtype}")
    print(f"Min value: {images.min().item():.3f}")
    print(f"Max value: {images.max().item():.3f}")

    print("\n" + "=" * 60)
    print("DATALOADER WORKING ✅")
    print("=" * 60)