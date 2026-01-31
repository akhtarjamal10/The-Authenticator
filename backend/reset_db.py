import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

def reset_database():
    ATLAS_CONNECTION_STRING = os.getenv("ATLAS_DB_URL")
    DB_NAME = os.getenv("DB_NAME")
    COLLECTION_NAME = os.getenv("COLLECTION_NAME")

    if not ATLAS_CONNECTION_STRING:
        print("❌ Error: DB credentials not found.")
        return

    client = MongoClient(ATLAS_CONNECTION_STRING)
    db = client[DB_NAME]
    collection = db[COLLECTION_NAME]

    # Delete everything
    result = collection.delete_many({})
    
    print(f"🔥 DELETED {result.deleted_count} documents.")
    print("✅ Database is now EMPTY and ready for fresh uploads.")

if __name__ == "__main__":
    reset_database()