from pathlib import Path
import csv
import random

# Dataset location
DATASET_PATH = Path(
    r"E:\eye diesea pred\Dataset 3\Eye Disease Image Dataset\Original Dataset\Original Dataset"
)

# Classes
CLASSES = [
    "Diabetic Retinopathy",
    "Glaucoma",
    "Healthy",
    "Myopia",
    "Macular Scar"
]

# Output location
OUTPUT_PATH = Path("data/dataset3_splits")
OUTPUT_PATH.mkdir(parents=True, exist_ok=True)

# Reproducibility
random.seed(42)

# Store all image records
records = []

for label, class_name in enumerate(CLASSES):

    folder = DATASET_PATH / class_name

    images = [
        file for file in folder.rglob("*")
        if file.is_file()
        and file.suffix.lower() in [".jpg", ".jpeg", ".png"]
    ]

    random.shuffle(images)

    total = len(images)

    # 70% train, 15% validation, 15% test
    train_end = int(total * 0.70)
    val_end = int(total * 0.85)

    train_images = images[:train_end]
    val_images = images[train_end:val_end]
    test_images = images[val_end:]

    for image in train_images:
        records.append(("train", str(image), label, class_name))

    for image in val_images:
        records.append(("val", str(image), label, class_name))

    for image in test_images:
        records.append(("test", str(image), label, class_name))

    print(
        f"{class_name:<25} "
        f"Train: {len(train_images):4} | "
        f"Val: {len(val_images):4} | "
        f"Test: {len(test_images):4}"
    )


# Write separate CSV files
for split in ["train", "val", "test"]:

    split_records = [
        record for record in records
        if record[0] == split
    ]

    output_file = OUTPUT_PATH / f"{split}.csv"

    with open(output_file, "w", newline="", encoding="utf-8") as file:

        writer = csv.writer(file)

        writer.writerow([
            "image_path",
            "label",
            "class_name"
        ])

        for _, image_path, label, class_name in split_records:
            writer.writerow([
                image_path,
                label,
                class_name
            ])

    print(f"\nCreated: {output_file}")
    print(f"Images : {len(split_records)}")


print("\n" + "=" * 60)
print("DATASET 3 SPLIT COMPLETE")
print("=" * 60)
print(f"Total images : {len(records)}")