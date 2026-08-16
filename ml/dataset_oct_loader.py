from pathlib import Path

import torch
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms
from PIL import Image


# ============================================================
# OCT CLASS NAMES
# ============================================================

CLASS_NAMES = [
    "CNV",
    "DME",
    "DRUSEN",
    "NORMAL"
]


CLASS_TO_INDEX = {
    "CNV": 0,
    "DME": 1,
    "DRUSEN": 2,
    "NORMAL": 3
}


# ============================================================
# DATASET
# ============================================================

class OCTDataset(Dataset):

    def __init__(self, root_dir, transform=None):

        self.root_dir = Path(root_dir)
        self.transform = transform

        self.records = []

        # ----------------------------------------------------
        # Find each class directory
        # ----------------------------------------------------

        for class_name in CLASS_NAMES:

            class_dir = self.root_dir / class_name

            if not class_dir.exists():
                print(f"Warning: class directory not found: {class_dir}")
                continue

            label = CLASS_TO_INDEX[class_name]

            # Find JPEG images
            for image_path in class_dir.rglob("*"):

                if image_path.suffix.lower() in [".jpg", ".jpeg"]:

                    self.records.append({
                        "image_path": image_path,
                        "label": label,
                        "class_name": class_name
                    })

    # --------------------------------------------------------
    # Number of images
    # --------------------------------------------------------

    def __len__(self):

        return len(self.records)

    # --------------------------------------------------------
    # Get image
    # --------------------------------------------------------

    def __getitem__(self, index):

        record = self.records[index]

        image_path = record["image_path"]
        label = record["label"]

        image = Image.open(image_path).convert("RGB")

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
# DATASET PATHS
# ============================================================

OCT_ROOT = r"E:\eye diesea pred\OCT\Dataset - train+val+test"


# ============================================================
# CREATE DATASETS
# ============================================================

train_dataset = OCTDataset(
    Path(OCT_ROOT) / "train",
    transform=train_transform
)

val_dataset = OCTDataset(
    Path(OCT_ROOT) / "val",
    transform=val_test_transform
)

test_dataset = OCTDataset(
    Path(OCT_ROOT) / "test",
    transform=val_test_transform
)


# ============================================================
# DATALOADERS
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
# TEST
# ============================================================

if __name__ == "__main__":

    print("=" * 60)
    print("OCT DATASET LOADER TEST")
    print("=" * 60)

    print(f"Train images : {len(train_dataset)}")
    print(f"Validation   : {len(val_dataset)}")
    print(f"Test images  : {len(test_dataset)}")

    print("\nClasses:")

    for index, class_name in enumerate(CLASS_NAMES):
        print(f"{index}: {class_name}")

    print("\nLoading first batch...")

    images, labels = next(iter(train_loader))

    print("\nFirst batch:")

    print(f"Image tensor shape : {images.shape}")
    print(f"Labels shape       : {labels.shape}")

    print("\nLabels:")

    print(labels.tolist())

    print("\n" + "=" * 60)
    print("OCT DATALOADER WORKING")
    print("=" * 60)