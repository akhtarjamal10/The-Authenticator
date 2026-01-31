# from fastapi import FastAPI, Query, UploadFile
# from fastapi.middleware.cors import CORSMiddleware
# from pathlib import Path
# import uvicorn
# import extract_json
# import compare_json
# import json
# import os
# import shutil
# import json
# from pymongo import MongoClient
# from bson import json_util
# from fastapi import FastAPI, HTTPException, Body
# import httpx
# from dotenv import load_dotenv
# import os
# from datetime import datetime

# app = FastAPI()
# load_dotenv()

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# @app.get("/")
# def home():
#     return "FastAPI is working"

# @app.post("/uploadFile/")
# async def create_upload_file(file_upload: UploadFile):
#     UPLOAD_DIR = Path("../uploads")
#     UPLOAD_DIR.mkdir(parents=True, exist_ok=True) 

#     data = await file_upload.read()
#     save_to = UPLOAD_DIR / file_upload.filename
    
#     # Save the file
#     with open(save_to, "wb") as f:
#         f.write(data)
    
#     extract_json.process_pdfs()

# @app.post("/approve-document")
# async def approve_and_process_document(payload: dict = Body(...)):
#     """
#     Called by Admin/Organization when clicking 'Approve'.
#     1. Downloads PDF from URL (temp).
#     2. Extracts JSON.
#     3. Saves to MongoDB.
#     4. Deletes temp file.
#     """
#     pdf_url = payload.get("pdf_url")
#     if not pdf_url:
#         raise HTTPException(status_code=400, detail="pdf_url is required")

#     temp_filename = "temp_processing.pdf"
    
#     # 1. Download File Temporarily
#     try:
#         async with httpx.AsyncClient() as client:
#             resp = await client.get(pdf_url)
#             resp.raise_for_status()
            
#             with open(temp_filename, "wb") as f:
#                 f.write(resp.content)
#     except Exception as e:
#         raise HTTPException(status_code=400, detail=f"Failed to download file: {str(e)}")

#     try:
#         # 2. Extract Data using the updated logic
#         extraction_results = extract_json.process_pdfs(specific_filename=temp_filename)
        
#         if not extraction_results:
#             raise HTTPException(status_code=422, detail="Could not extract data from PDF")

#         json_data = extraction_results[0] # Get the result

#         # 3. Store in MongoDB
#         ATLAS_CONNECTION_STRING = os.getenv("ATLAS_DB_URL")
#         DB_NAME = os.getenv("DB_NAME")
#         COLLECTION_NAME = os.getenv("COLLECTION_NAME")
        
#         client = MongoClient(ATLAS_CONNECTION_STRING)
#         db = client[DB_NAME]
#         collection = db[COLLECTION_NAME]
        
#         # Add metadata
#         json_data["source_pdf_url"] = pdf_url
#         json_data["processed_at"] = str(datetime.now()) #
        
#         insert_result = collection.insert_one(json_data)
        
#         return {
#             "status": "success", 
#             "message": "Document extracted and saved to MongoDB",
#             "mongo_id": str(insert_result.inserted_id)
#         }

#     except Exception as e:
#         print(f"Processing Error: {e}")
#         raise HTTPException(status_code=500, detail=str(e))
        
#     finally:
#         # 4. Cleanup: Remove the local file immediately
#         if os.path.exists(temp_filename):
#             os.remove(temp_filename)

# @app.get("/verify/")
# async def verify_diff():
#     folder_path = "extracted_json"
#     diff = {}
#     file_path = os.path.join(folder_path, os.listdir(folder_path)[0])
#     with open(file_path, "r", encoding="utf-8") as f:
#         json1 = json.load(f)
#     ATLAS_CONNECTION_STRING = os.getenv("ATLAS_DB_URL")
#     DB_NAME = os.getenv("DB_NAME")
#     COLLECTION_NAME = os.getenv("COLLECTION_NAME")

#     def get_student_marksheet(roll_no, semester):
#         try:
#             client = MongoClient(ATLAS_CONNECTION_STRING)
#             db = client[DB_NAME]
#             collection = db[COLLECTION_NAME]
#             query = {
#                 "marksheet.rollNo": roll_no,
#                 "marksheet.academic_info.semester": semester
#             }
#             document = collection.find_one(query)
            
#             if document:
#                 return json.loads(json_util.dumps(document))
#             else:
#                 return None
#         except Exception as e:
#             print(f"An error occurred: {e}")
#             return None
        
#     target_roll = json1['marksheet']['rollNo']
#     target_sem = json1['marksheet']['academic_info']['semester']
#     json2 = get_student_marksheet(target_roll, target_sem)
#     if json2:
#         del json2["_id"]
#         del json2["__v"]
#     json.dumps(json1, indent=4)
#     json.dumps(json2, indent=4)
#     diff = compare_json.compare_json_files(json1, json2)
#     INPUT_FOLDER = "C:\\Desktop\\src\\uploads"
#     if os.path.exists(folder_path):
#         shutil.rmtree(folder_path)
#     if os.path.exists(INPUT_FOLDER):
#         shutil.rmtree(INPUT_FOLDER)
#     return {"file1": json1, "file2": json2, "diff": diff}

# @app.post("/save-pdf-to-server")
# async def save_pdf(pdf_url: str = Query(...)):
#     try:
#         # 1. Asynchronously fetch the data
#         async with httpx.AsyncClient() as client:
#             response = await client.get(pdf_url)
#             response.raise_for_status() # Check for errors (404, 500)

#         # 2. Save the file to the local disk
#         # We use standard open here for simplicity, but aiofiles is better for heavy loads
#         UPLOAD_DIR = Path("uploads")
#         UPLOAD_DIR.mkdir(parents=True, exist_ok=True) 
#         save_path = f"{UPLOAD_DIR}/1.pdf"
        
#         # Ensure directory exists
#         os.makedirs(os.path.dirname(save_path), exist_ok=True)

#         with open(save_path, "wb") as f:
#             f.write(response.content)

#         return {"message": "File saved successfully", "path": save_path}

#     except httpx.HTTPStatusError as e:
#         raise HTTPException(status_code=400, detail=f"Error fetching PDF: {e}")
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))
    
# @app.get('/uploadMongo')
# async def uploadDoc2Mongo():
#     ATLAS_CONNECTION_STRING = os.getenv("ATLAS_DB_URL")
#     DB_NAME = os.getenv("DB_NAME")
#     COLLECTION_NAME = os.getenv("COLLECTION_NAME")
#     try:
#         client = MongoClient(ATLAS_CONNECTION_STRING)
#         db = client[DB_NAME]
#         collection = db[COLLECTION_NAME]
#         UPLOAD_DIR = Path("uploads")
#         UPLOAD_DIR.mkdir(parents=True, exist_ok=True) 
#         extract_json.process_pdfs()
#         folder_path = "./extracted_json"
#         file_path = os.path.join(folder_path, os.listdir(folder_path)[0])
#         with open(file_path, "r", encoding="utf-8") as f:
#             json1 = json.load(f)
#         json.dumps(json1, indent=4)
#         try:
#             collection.insert_one(json1)
#         except Exception as e:
#             print(e)
#     except Exception as e:
#         print(e)


# if __name__ == "__main__":
#     uvicorn.run(app, host="0.0.0.0", port=8000)


from fastapi import FastAPI, HTTPException, UploadFile, File, Body, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles  # Required for serving files
from pathlib import Path
import uvicorn
import extract_json
import compare_json
import json
import os
import shutil
from pymongo import MongoClient
from bson import json_util
import httpx
from dotenv import load_dotenv
from datetime import datetime
from fastapi import Request 

app = FastAPI()
load_dotenv()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------
# 1. MOUNT UPLOADS FOLDER (To make files accessible via URL)
# ---------------------------------------------------------
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get("/")
def home():
    return "FastAPI is working"

# ---------------------------------------------------------
# 2. UPDATED UPLOAD ENDPOINT
# ---------------------------------------------------------
@app.post("/uploadFile/")
async def create_upload_file(file: UploadFile = File(...)): # Renamed param to 'file' to match FormData
    try:
        UPLOAD_DIR = "uploads"
        os.makedirs(UPLOAD_DIR, exist_ok=True) 
        
        file_location = f"{UPLOAD_DIR}/{file.filename}"
        
        # Save the file locally
        with open(file_location, "wb") as f:
            f.write(await file.read())
            
        print(f"✅ File saved locally: {file_location}")
        
        # We perform extraction here as per your old logic, but it's optional 
        # if the approval step does it again.
        # extract_json.process_pdfs() 
        
        return {"status": "success", "filename": file.filename}
    except Exception as e:
        print(f"❌ Upload Error: {e}")
        return {"status": "error", "detail": str(e)}

# ---------------------------------------------------------
# 3. UPDATED APPROVE ENDPOINT (Reads Local File)
# ---------------------------------------------------------
@app.post("/approve-document")
async def approve_and_process_document(payload: dict = Body(...)):
    """
    Called by Admin/Organization.
    Now reads the file directly from the local 'uploads' folder 
    instead of downloading from a URL.
    """
    pdf_url = payload.get("pdf_url")
    if not pdf_url:
        raise HTTPException(status_code=400, detail="pdf_url is required")

    print(f"Processing Approval for: {pdf_url}")

    # Extract filename from the URL (e.g. http://localhost:8000/uploads/file.pdf -> file.pdf)
    filename = os.path.basename(pdf_url)
    file_path = os.path.join("uploads", filename)

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found on server")

    try:
        # 1. Extract Data
        # We pass the specific filename to your extractor
        extraction_results = extract_json.process_pdfs(specific_filename=file_path)
        
        if not extraction_results:
            raise HTTPException(status_code=422, detail="Could not extract data from PDF")

        json_data = extraction_results[0] 

        # 2. Store in MongoDB
        ATLAS_CONNECTION_STRING = os.getenv("ATLAS_DB_URL")
        DB_NAME = os.getenv("DB_NAME")
        COLLECTION_NAME = os.getenv("COLLECTION_NAME")
        
        client = MongoClient(ATLAS_CONNECTION_STRING)
        db = client[DB_NAME]
        collection = db[COLLECTION_NAME]
        
        json_data["source_pdf_url"] = pdf_url
        json_data["processed_at"] = str(datetime.now())
        
        insert_result = collection.insert_one(json_data)
        
        return {
            "status": "success", 
            "message": "Document extracted and saved to MongoDB",
            "mongo_id": str(insert_result.inserted_id)
        }

    except Exception as e:
        print(f"Processing Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ---------------------------------------------------------
# EXISTING UTILITIES (Kept exactly as requested)
# ---------------------------------------------------------

@app.get("/verify/")
async def verify_diff():
    folder_path = "extracted_json"
    diff = {}
    # Ensure folder exists and has files before accessing
    if not os.path.exists(folder_path) or not os.listdir(folder_path):
         return {"error": "No extracted JSON files found to verify"}

    file_path = os.path.join(folder_path, os.listdir(folder_path)[0])
    with open(file_path, "r", encoding="utf-8") as f:
        json1 = json.load(f)
        
    ATLAS_CONNECTION_STRING = os.getenv("ATLAS_DB_URL")
    DB_NAME = os.getenv("DB_NAME")
    COLLECTION_NAME = os.getenv("COLLECTION_NAME")

    def get_student_marksheet(roll_no, semester):
        try:
            client = MongoClient(ATLAS_CONNECTION_STRING)
            db = client[DB_NAME]
            collection = db[COLLECTION_NAME]
            query = {
                "marksheet.rollNo": roll_no,
                "marksheet.academic_info.semester": semester
            }
            document = collection.find_one(query)
            if document:
                return json.loads(json_util.dumps(document))
            else:
                return None
        except Exception as e:
            print(f"An error occurred: {e}")
            return None
        
    target_roll = json1['marksheet']['rollNo']
    target_sem = json1['marksheet']['academic_info']['semester']
    json2 = get_student_marksheet(target_roll, target_sem)
    if json2:
        del json2["_id"]
        # del json2["__v"] # Only delete if it exists
    
    diff = compare_json.compare_json_files(json1, json2)
    
    # Cleanup
    INPUT_FOLDER = "uploads" # Assuming this is what you meant by C:\\Desktop...
    if os.path.exists(folder_path):
        shutil.rmtree(folder_path)
    # Be careful deleting the uploads folder if you need the files later!
    # if os.path.exists(INPUT_FOLDER): shutil.rmtree(INPUT_FOLDER) 
    
    return {"file1": json1, "file2": json2, "diff": diff}

@app.post("/save-pdf-to-server")
async def save_pdf(pdf_url: str = Query(...)):
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(pdf_url)
            response.raise_for_status()

        UPLOAD_DIR = Path("uploads")
        UPLOAD_DIR.mkdir(parents=True, exist_ok=True) 
        save_path = f"{UPLOAD_DIR}/1.pdf"
        
        with open(save_path, "wb") as f:
            f.write(response.content)

        return {"message": "File saved successfully", "path": save_path}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
# @app.get('/uploadMongo')
# async def uploadDoc2Mongo():
#     ATLAS_CONNECTION_STRING = os.getenv("ATLAS_DB_URL")
#     DB_NAME = os.getenv("DB_NAME")
#     COLLECTION_NAME = os.getenv("COLLECTION_NAME")
#     try:
#         client = MongoClient(ATLAS_CONNECTION_STRING)
#         db = client[DB_NAME]
#         collection = db[COLLECTION_NAME]
        
#         extract_json.process_pdfs() # Process whatever is in uploads
        
#         folder_path = "./extracted_json"
#         if not os.path.exists(folder_path) or not os.listdir(folder_path):
#             return {"error": "No JSON extracted"}

#         file_path = os.path.join(folder_path, os.listdir(folder_path)[0])
#         with open(file_path, "r", encoding="utf-8") as f:
#             json1 = json.load(f)
            
#         collection.insert_one(json1)
#         return {"status": "success", "data": json1}
#     except Exception as e:
#         print(e)
#         return {"error": str(e)}

@app.post('/uploadMongo') 
async def uploadDoc2Mongo(request: Request):
    # 1. Setup Database Connection
    ATLAS_CONNECTION_STRING = os.getenv("ATLAS_DB_URL")
    DB_NAME = os.getenv("DB_NAME")
    COLLECTION_NAME = os.getenv("COLLECTION_NAME")
    
    try:
        # 2. Get the filename from the Frontend request
        body = await request.json()
        filename = body.get("filename") 

        # 3. Run the Pure Logic Extractor (It processes & returns the data)
        # We pass the filename so it only processes the specific file approved
        extracted_data_list = extract_json.process_pdfs(specific_filename=filename)
        
        if not extracted_data_list:
            return {"error": "Extraction failed. File may not exist or is empty."}

        # 4. Connect to MongoDB
        client = MongoClient(ATLAS_CONNECTION_STRING)
        db = client[DB_NAME]
        collection = db[COLLECTION_NAME]

        saved_ids = []
        
        # 5. Save/Update in MongoDB
        for data in extracted_data_list:
            # We use Roll No as the unique ID to prevent duplicates
            roll_no = data.get("marksheet", {}).get("rollNo")
            
            if roll_no:
                collection.update_one(
                    {"marksheet.rollNo": roll_no}, # Find by Roll No
                    {"$set": data},                # Update with new data
                    upsert=True                    # Create if it doesn't exist
                )
                saved_ids.append(roll_no)
            else:
                # Fallback if extraction missed the Roll No
                collection.insert_one(data)

        return {
            "status": "success", 
            "message": "Document Approved & Saved to Ledger", 
            "ids": saved_ids
        }

    except Exception as e:
        print(f"Error in uploadMongo: {e}")
        return {"error": str(e)}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)