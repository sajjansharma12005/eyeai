from pathlib import Path

DATASET_PATH = Path(
    r"E:\eye diesea pred\Dataset 3\Eye Disease Image Dataset\Original Dataset\Original Dataset"
)

IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}

print("=" * 70)
print("DATASET 3 - ORIGINAL DATASET")
print("=" * 70)

total = 0

for folder in sorted(DATASET_PATH.iterdir()):

    if not folder.is_dir():
        continue

    count = sum(
        1
        for file in folder.rglob("*")
        if file.is_file()
        and file.suffix.lower() in IMAGE_EXTENSIONS
    )

    total += count

    print(f"{folder.name:<50} : {count:,}")

print("-" * 70)
print(f"{'TOTAL':<50} : {total:,}")
print("=" * 70)