import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

# Get the URL your code is using
url = os.getenv("ATLAS_DB_URL")
print(f"🔗 CONNECTION STRING: {url}")

try:
    client = MongoClient(url)
    # This prints the actual Cluster name (e.g., cluster0.xyz.mongodb.net)
    print(f"☁️  CONNECTED TO CLUSTER: {client.address}")
    
    # List all databases in this cluster
    dbs = client.list_database_names()
    print(f"📂 DATABASES FOUND: {dbs}")
    
    if "test" in dbs:
        count = client["test"]["marksheets"].count_documents({})
        print(f"✅ FOUND 'test' DB with {count} documents!")
    else:
        print("❌ 'test' database NOT found in this cluster.")
        
except Exception as e:
    print(f"❌ CONNECTION FAILED: {e}")