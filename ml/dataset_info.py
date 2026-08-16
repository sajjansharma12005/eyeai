from pathlib import Path

# CHANGE THIS PATH to the location of your dataset
DATASET_PATH = Path(r"C:\Users\Raj Kumar\Downloads\archive\Dataset - train+val+test")

splits = ["train", "val", "test"]
classes = ["CNV", "DME", "DRUSEN", "NORMAL"]

for split in splits:
    print(f"\n{split.upper()}")
    print("-" * 30)

    total = 0

    for class_name in classes:
        class_path = DATASET_PATH / split / class_name

        images = list(class_path.glob("*"))
        count = len(images)

        print(f"{class_name:10} : {count}")
        total += count

    print("-" * 30)
    print(f"Total      : {total}")