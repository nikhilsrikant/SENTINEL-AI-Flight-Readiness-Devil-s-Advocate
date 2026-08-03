"""
SENTINEL Knowledge Base Seeder

Seeds the ChromaDB vector store with incident data from the knowledge graph.
Falls back gracefully if ChromaDB is unavailable.

Usage:
    python -m backend.scripts.seed_knowledge_base
    # or from backend directory:
    python scripts/seed_knowledge_base.py
"""

import json
import os
import sys
import time
from pathlib import Path

# Resolve paths
SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent.parent
DATA_DIR = PROJECT_ROOT / "data" / "incidents"

# ChromaDB settings
CHROMADB_HOST = os.environ.get("CHROMADB_HOST", "localhost")
CHROMADB_PORT = int(os.environ.get("CHROMADB_PORT", "8500"))
COLLECTION_NAME = "sentinel_incidents"


def load_incident_files() -> list[dict]:
    """Load all incident JSON files from the data directory."""
    incidents = []

    if not DATA_DIR.exists():
        print(f"  [WARN] Data directory not found: {DATA_DIR}")
        return incidents

    for filepath in sorted(DATA_DIR.glob("*.json")):
        try:
            with open(filepath, "r") as f:
                data = json.load(f)
                incidents.append(data)
                print(f"  [OK] Loaded: {filepath.name}")
        except (json.JSONDecodeError, IOError) as e:
            print(f"  [ERR] Failed to load {filepath.name}: {e}")

    return incidents


def build_documents(incidents: list[dict]) -> tuple[list[str], list[dict], list[str]]:
    """
    Transform incident records into documents suitable for embedding.
    Returns (documents, metadatas, ids) tuples for ChromaDB.
    """
    documents = []
    metadatas = []
    ids = []

    for incident in incidents:
        incident_id = incident.get("id", "unknown")

        # Main summary document
        summary = incident.get("summary", "")
        if summary:
            documents.append(summary)
            metadatas.append({
                "incident_id": incident_id,
                "name": incident.get("name", ""),
                "date": incident.get("date", ""),
                "vehicle": incident.get("vehicle", ""),
                "section": "summary",
            })
            ids.append(f"{incident_id}_summary")

        # Root causes (technical, organizational, cultural)
        root_causes = incident.get("root_causes", {})
        for cause_type, cause_text in root_causes.items():
            if cause_text:
                documents.append(f"{cause_type.title()} root cause: {cause_text}")
                metadatas.append({
                    "incident_id": incident_id,
                    "name": incident.get("name", ""),
                    "date": incident.get("date", ""),
                    "section": f"root_cause_{cause_type}",
                })
                ids.append(f"{incident_id}_cause_{cause_type}")

        # Warning signs
        warning_signs = incident.get("warning_signs", [])
        if warning_signs:
            signs_text = "Warning signs: " + "; ".join(warning_signs)
            documents.append(signs_text)
            metadatas.append({
                "incident_id": incident_id,
                "name": incident.get("name", ""),
                "date": incident.get("date", ""),
                "section": "warning_signs",
            })
            ids.append(f"{incident_id}_warnings")

        # Lessons learned
        lessons = incident.get("lessons_learned", [])
        if lessons:
            lessons_text = "Lessons learned: " + "; ".join(lessons)
            documents.append(lessons_text)
            metadatas.append({
                "incident_id": incident_id,
                "name": incident.get("name", ""),
                "date": incident.get("date", ""),
                "section": "lessons_learned",
            })
            ids.append(f"{incident_id}_lessons")

        # Organizational failures
        org_failures = incident.get("organizational_failures", [])
        if org_failures:
            failures_text = "Organizational failures: " + "; ".join(org_failures)
            documents.append(failures_text)
            metadatas.append({
                "incident_id": incident_id,
                "name": incident.get("name", ""),
                "date": incident.get("date", ""),
                "section": "organizational_failures",
            })
            ids.append(f"{incident_id}_org_failures")

    return documents, metadatas, ids


def seed_chromadb(documents: list[str], metadatas: list[dict], ids: list[str]) -> bool:
    """
    Seed documents into ChromaDB collection.
    Returns True on success, False on failure.
    """
    try:
        import chromadb
    except ImportError:
        print("\n  [ERR] chromadb package not installed.")
        print("  Install with: pip install chromadb")
        return False

    try:
        print(f"\n  Connecting to ChromaDB at {CHROMADB_HOST}:{CHROMADB_PORT}...")
        client = chromadb.HttpClient(host=CHROMADB_HOST, port=CHROMADB_PORT)

        # Test connection
        client.heartbeat()
        print("  [OK] Connected to ChromaDB")

    except Exception as e:
        print(f"\n  [ERR] Could not connect to ChromaDB: {e}")
        print("  Make sure ChromaDB is running (docker-compose up chromadb)")
        return False

    try:
        # Get or create collection
        collection = client.get_or_create_collection(
            name=COLLECTION_NAME,
            metadata={"description": "SENTINEL incident knowledge base"},
        )

        # Check existing documents
        existing_count = collection.count()
        if existing_count > 0:
            print(f"  [INFO] Collection already has {existing_count} documents")
            print("  Deleting existing documents for fresh seed...")
            # Get existing IDs and delete
            existing = collection.get()
            if existing["ids"]:
                collection.delete(ids=existing["ids"])

        # Add documents in batches
        batch_size = 50
        total = len(documents)

        for i in range(0, total, batch_size):
            batch_end = min(i + batch_size, total)
            collection.add(
                documents=documents[i:batch_end],
                metadatas=metadatas[i:batch_end],
                ids=ids[i:batch_end],
            )
            print(f"  [OK] Added documents {i+1}-{batch_end} of {total}")

        # Verify
        final_count = collection.count()
        print(f"\n  [OK] Collection '{COLLECTION_NAME}' now has {final_count} documents")
        return True

    except Exception as e:
        print(f"\n  [ERR] Failed to seed ChromaDB: {e}")
        return False


def main():
    """Main entry point for the knowledge base seeder."""
    print("=" * 60)
    print("  SENTINEL Knowledge Base Seeder")
    print("=" * 60)
    start_time = time.time()

    # Step 1: Load incident data
    print("\n[1/3] Loading incident data...")
    incidents = load_incident_files()

    if not incidents:
        print("\n  [WARN] No incident data found. Nothing to seed.")
        print(f"  Expected location: {DATA_DIR}")
        sys.exit(1)

    print(f"\n  Loaded {len(incidents)} incident(s)")

    # Step 2: Build documents
    print("\n[2/3] Building document embeddings...")
    documents, metadatas, ids = build_documents(incidents)
    print(f"  Generated {len(documents)} document chunks")

    # Step 3: Seed ChromaDB
    print("\n[3/3] Seeding ChromaDB...")
    success = seed_chromadb(documents, metadatas, ids)

    # Summary
    elapsed = time.time() - start_time
    print("\n" + "=" * 60)

    if success:
        print(f"  SEED COMPLETE in {elapsed:.2f}s")
        print(f"  - Incidents: {len(incidents)}")
        print(f"  - Documents: {len(documents)}")
        print(f"  - Collection: {COLLECTION_NAME}")
    else:
        print(f"  SEED FAILED (ChromaDB unavailable)")
        print(f"  - Incidents loaded: {len(incidents)}")
        print(f"  - Documents prepared: {len(documents)}")
        print("  - Run 'docker-compose up chromadb' and retry")

    print("=" * 60)
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
