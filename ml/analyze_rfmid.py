from pathlib import Path
import csv
from collections import defaultdict


RFMiD_PATH = Path(r"E:\eye diesea pred\RFMiD")


CSV_FILES = {
    "TRAINING": RFMiD_PATH / "Training_Set" / "Training_Set" / "RFMiD_Training_Labels.csv",
    "VALIDATION": RFMiD_PATH / "Evaluation_Set" / "Evaluation_Set" / "RFMiD_Validation_Labels.csv",
    "TESTING": RFMiD_PATH / "Test_Set" / "Test_Set" / "RFMiD_Testing_Labels.csv",
}


def analyze_csv(name, csv_path):

    print("\n")
    print("=" * 80)
    print(f"{name}")
    print(f"FILE: {csv_path}")
    print("=" * 80)

    if not csv_path.exists():
        print("❌ CSV file not found!")
        return None

    with open(csv_path, "r", encoding="utf-8-sig", newline="") as file:

        reader = csv.DictReader(file)

        rows = list(reader)
        columns = reader.fieldnames

    print(f"\nImages/rows: {len(rows):,}")

    print("\nColumns:")
    for column in columns:
        print(f"  {column}")

    # ---------------------------------------------------------
    # Count positive cases for each label
    # ---------------------------------------------------------

    counts = defaultdict(int)

    for row in rows:

        for column in columns:

            if column in ["ID", "id", "Image", "image"]:
                continue

            value = str(row[column]).strip()

            if value == "1":
                counts[column] += 1

    print("\nDisease / label counts:")
    print("-" * 60)

    for label, count in sorted(
        counts.items(),
        key=lambda item: item[1],
        reverse=True
    ):

        print(f"{label:<35} : {count:,}")


    return rows, columns, counts


# ============================================================
# ANALYZE ALL THREE SPLITS
# ============================================================

results = {}

for name, csv_path in CSV_FILES.items():

    result = analyze_csv(name, csv_path)

    if result:
        results[name] = result


# ============================================================
# COMBINED COUNTS
# ============================================================

print("\n")
print("=" * 80)
print("COMBINED RFMiD LABEL COUNTS")
print("=" * 80)

combined_counts = defaultdict(int)

for name, result in results.items():

    rows, columns, counts = result

    for label, count in counts.items():
        combined_counts[label] += count


print("\n")

for label, count in sorted(
    combined_counts.items(),
    key=lambda item: item[1],
    reverse=True
):

    print(f"{label:<35} : {count:,}")


print("\n")
print("=" * 80)
print("RFMiD ANALYSIS COMPLETE")
print("=" * 80)