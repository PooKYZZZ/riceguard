# Seed initial recommendation documents into MongoDB.

from datetime import datetime, timezone
from typing import Dict, Any
from db import get_db, ensure_indexes

DEFAULT_RECOS: Dict[str, Dict[str, Any]] = {
    "brown_spot": {
        "title": "Brown Spot — Management",
        "steps": [
            "Remove severely infected leaves",
            "Ensure proper field drainage",
            "Apply balanced fertilizer (avoid excess nitrogen)",
        ],
        "version": "1.0",
    },
    "blast": {
        "title": "Rice Blast — Management",
        "steps": [
            "Plant resistant varieties if available",
            "Avoid late planting",
            "Improve airflow; avoid dense planting",
        ],
        "version": "1.0",
    },
    "blight": {
        "title": "Bacterial Leaf Blight — Management",
        "steps": [
            "Use clean seed; remove volunteer plants",
            "Improve field sanitation and water management",
            "Avoid high nitrogen during early growth",
        ],
        "version": "1.0",
    },
    "healthy": {
        "title": "Healthy — No Action Needed",
        "steps": [
            "Maintain good field hygiene",
            "Monitor crop regularly",
        ],
        "version": "1.0",
    },
}


def seed_recommendations() -> None:
    """Insert default recommendation docs if they don't exist."""
    ensure_indexes()
    db = get_db()
    coll = db.recommendations

    inserted = 0
    for key, val in DEFAULT_RECOS.items():
        res = coll.update_one(
            {"diseaseKey": key},
            {
                "$setOnInsert": {
                    "diseaseKey": key,
                    "title": val["title"],
                    "steps": val["steps"],
                    "version": val["version"],
                    "updatedAt": datetime.now(timezone.utc),
                }
            },
            upsert=True,
        )
        if res.upserted_id is not None:
            inserted += 1

    print(f"[seed] recommendations upsert complete (inserted {inserted}, total {coll.count_documents({})}).")


if __name__ == "__main__":
    seed_recommendations()
