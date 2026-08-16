from app import app
from database import db


with app.app_context():

    print("=" * 60)
    print("UPDATING DATABASE")
    print("=" * 60)

    # Create any tables that don't exist
    db.create_all()

    # Check whether model_type already exists
    inspector = db.inspect(db.engine)

    columns = inspector.get_columns("predictions")

    column_names = [
        column["name"]
        for column in columns
    ]

    if "model_type" in column_names:

        print("\nmodel_type column already exists.")

    else:

        print("\nAdding model_type column...")

        with db.engine.connect() as connection:

            connection.execute(
                db.text(
                    "ALTER TABLE predictions "
                    "ADD COLUMN model_type VARCHAR(50)"
                )
            )

            connection.commit()

        print("model_type column added successfully.")

    print("\nCurrent predictions columns:")

    inspector = db.inspect(db.engine)

    columns = inspector.get_columns("predictions")

    for column in columns:

        print(
            f"- {column['name']}"
        )

    print("\n" + "=" * 60)
    print("DATABASE UPDATE COMPLETE")
    print("=" * 60)