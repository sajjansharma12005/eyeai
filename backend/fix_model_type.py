import sqlite3
import os

DB_PATH = os.path.join(
    os.path.dirname(os.path.dirname(__file__)),
    "instance",
    "eye_disease.db"
)

print("=" * 60)
print("FIXING DATABASE")
print("=" * 60)

print("Database:")
print(DB_PATH)

conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

# Check existing columns
cursor.execute("PRAGMA table_info(predictions)")
columns = cursor.fetchall()

print("\nCurrent predictions columns:")

for column in columns:
    print("-", column[1])

column_names = [column[1] for column in columns]

# Add model_type if it doesn't exist
if "model_type" not in column_names:

    print("\nAdding model_type column...")

    cursor.execute("""
        ALTER TABLE predictions
        ADD COLUMN model_type VARCHAR(50)
    """)

    conn.commit()

    print("model_type added successfully.")

else:

    print("\nmodel_type already exists.")

# Verify
cursor.execute("PRAGMA table_info(predictions)")
columns = cursor.fetchall()

print("\nFinal predictions columns:")

for column in columns:
    print("-", column[1])

conn.close()

print("\n" + "=" * 60)
print("DATABASE FIX COMPLETE")
print("=" * 60)