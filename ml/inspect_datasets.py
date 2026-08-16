from pathlib import Path
from collections import Counter
from PIL import Image


# ============================================================
# DATASET PATHS
# ============================================================

DATASETS = {
    "OCT": Path(r"E:\eye diesea pred\OCT"),
    "RFMiD": Path(r"E:\eye diesea pred\RFMiD"),
    "DATASET_3": Path(
    r"E:\eye diesea pred\Dataset 3\Eye Disease Image Dataset"),
}


# ============================================================
# SUPPORTED IMAGE TYPES
# ============================================================

IMAGE_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".bmp",
    ".tif",
    ".tiff",
    ".webp"
}


# ============================================================
# INSPECT DATASET
# ============================================================

def inspect_dataset(name, dataset_path):

    print("\n")
    print("=" * 70)
    print(f"DATASET: {name}")
    print(f"PATH: {dataset_path}")
    print("=" * 70)

    if not dataset_path.exists():
        print("❌ Dataset path does not exist!")
        return

    # --------------------------------------------------------
    # Count images
    # --------------------------------------------------------

    image_files = [
        file
        for file in dataset_path.rglob("*")
        if file.is_file()
        and file.suffix.lower() in IMAGE_EXTENSIONS
    ]

    print(f"\nTotal images found: {len(image_files):,}")

    # --------------------------------------------------------
    # File formats
    # --------------------------------------------------------

    formats = Counter(
        file.suffix.lower()
        for file in image_files
    )

    print("\nImage formats:")

    for extension, count in formats.items():
        print(f"  {extension}: {count:,}")

    # --------------------------------------------------------
    # Top-level folders
    # --------------------------------------------------------

    folders = [
        item
        for item in dataset_path.iterdir()
        if item.is_dir()
    ]

    print("\nTop-level folders:")

    if folders:
        for folder in folders:
            print(f"  📁 {folder.name}")
    else:
        print("  No folders found")

    # --------------------------------------------------------
    # CSV / annotation files
    # --------------------------------------------------------

    csv_files = list(dataset_path.rglob("*.csv"))

    print("\nCSV files:")

    if csv_files:
        for csv_file in csv_files:
            print(f"  📄 {csv_file.relative_to(dataset_path)}")
    else:
        print("  No CSV files found")

    # --------------------------------------------------------
    # JSON files
    # --------------------------------------------------------

    json_files = list(dataset_path.rglob("*.json"))

    print("\nJSON files:")

    if json_files:
        for json_file in json_files:
            print(f"  📄 {json_file.relative_to(dataset_path)}")
    else:
        print("  No JSON files found")

    # --------------------------------------------------------
    # Image properties
    # --------------------------------------------------------

    print("\nInspecting first 20 images...")

    sizes = Counter()
    modes = Counter()

    for image_path in image_files[:20]:

        try:

            with Image.open(image_path) as image:

                sizes[image.size] += 1
                modes[image.mode] += 1

        except Exception as error:

            print(
                f"Could not read {image_path.name}: {error}"
            )

    print("\nSample image dimensions:")

    for size, count in sizes.items():
        print(f"  {size}: {count}")

    print("\nSample image modes:")

    for mode, count in modes.items():
        print(f"  {mode}: {count}")


# ============================================================
# RUN INSPECTION
# ============================================================

for dataset_name, dataset_path in DATASETS.items():

    inspect_dataset(
        dataset_name,
        dataset_path
    )


print("\n")
print("=" * 70)
print("DATASET INSPECTION COMPLETE")
print("=" * 70)