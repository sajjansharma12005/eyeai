from pathlib import Path

# Dataset location
DATASET_PATH = Path(r"E:\eye diesea pred\Dataset 3\Eye Disease Image Dataset\Original Dataset\Original Dataset")

# Classes we will use
CLASSES = [
    "Diabetic Retinopathy",
    "Glaucoma",
    "Healthy",
    "Myopia",
    "Macular Scar"
]

print("=" * 60)
print("DATASET 3 - SELECTED CLASSES")
print("=" * 60)

total = 0

for class_name in CLASSES:
    folder = DATASET_PATH / class_name

    if not folder.exists():
        print(f"\n❌ NOT FOUND: {class_name}")
        continue

    images = [
        file for file in folder.rglob("*")
        if file.is_file()
        and file.suffix.lower() in [".jpg", ".jpeg", ".png"]
    ]

    print(f"{class_name:<30} : {len(images):,}")
    total += len(images)

print("-" * 60)
print(f"{'TOTAL':<30} : {total:,}")
print("=" * 60)