from fastapi import FastAPI, File, UploadFile, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import os
import uuid
import shutil
import time

# Import helper functions
from excel_utils import parse_excel_meta, search_customer, save_and_style_excel

app = FastAPI(title="Customer Data Finder Backend")

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, limit this to frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Directories for temp files
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, "temp_uploads")
DOWNLOAD_DIR = os.path.join(BASE_DIR, "temp_downloads")

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(DOWNLOAD_DIR, exist_ok=True)

class SearchRequest(BaseModel):
    filename: str
    search_term: str

def clean_old_temp_files():
    """
    Remove files older than 30 minutes to manage server disk space.
    """
    now = time.time()
    for directory in [UPLOAD_DIR, DOWNLOAD_DIR]:
        if os.path.exists(directory):
            for filename in os.listdir(directory):
                file_path = os.path.join(directory, filename)
                # Check if file has been there for more than 30 minutes
                if os.path.getmtime(file_path) < now - 1800:
                    try:
                        if os.path.isfile(file_path):
                            os.remove(file_path)
                    except Exception as e:
                        print(f"Error cleaning up file {file_path}: {e}")

@app.post("/upload")
async def upload_file(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    # Trigger cleanup in background
    background_tasks.add_task(clean_old_temp_files)
    
    # Validation
    if not file.filename.endswith('.xlsx'):
        raise HTTPException(status_code=400, detail="Only .xlsx (Excel) files are supported.")
    
    # Store file with a unique name to prevent collisions
    file_id = uuid.uuid4().hex
    safe_filename = f"{file_id}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, safe_filename)
    
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save uploaded file: {str(e)}")
        
    try:
        meta = parse_excel_meta(file_path)
        return {
            "filename": safe_filename,
            "sheets": meta["sheets"],
            "columns": meta["columns"]
        }
    except ValueError as e:
        # Clean up the file if it's invalid
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/search")
def search_file(req: SearchRequest, background_tasks: BackgroundTasks):
    background_tasks.add_task(clean_old_temp_files)
    
    # Clean file name to prevent directory traversal
    clean_filename = os.path.basename(req.filename)
    file_path = os.path.join(UPLOAD_DIR, clean_filename)
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Excel file not found or has expired. Please upload again.")
        
    try:
        df, sheets_matched = search_customer(file_path, req.search_term)
        
        if df is None or df.empty:
            return {
                "total_matches": 0,
                "sheets_matched": [],
                "preview_rows": [],
                "message": f"No data found for '{req.search_term}'"
            }
            
        # Sanitize search term for result filename
        safe_term = "".join([c if c.isalnum() else "_" for c in req.search_term])
        result_filename = f"{clean_filename}_{safe_term}.xlsx"
        result_path = os.path.join(DOWNLOAD_DIR, result_filename)
        
        # Save and style excel
        save_and_style_excel(df, result_path)
        
        import math
        # Take the first 50 rows for preview
        preview_df = df.head(50)
        # Convert NaN to None for JSON compliance
        preview_rows = []
        for r in preview_df.to_dict(orient="records"):
            cleaned_row = {}
            for k, v in r.items():
                if isinstance(v, float) and math.isnan(v):
                    cleaned_row[k] = None
                else:
                    cleaned_row[k] = v
            preview_rows.append(cleaned_row)
        
        return {
            "total_matches": len(df),
            "sheets_matched": sheets_matched,
            "preview_rows": preview_rows
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

@app.get("/download/{filename}/{search_term}")
def download_file(filename: str, search_term: str):
    clean_filename = os.path.basename(filename)
    safe_term = "".join([c if c.isalnum() else "_" for c in search_term])
    result_filename = f"{clean_filename}_{safe_term}.xlsx"
    result_path = os.path.join(DOWNLOAD_DIR, result_filename)
    
    if not os.path.exists(result_path):
        raise HTTPException(status_code=404, detail="Download file has expired or was not generated. Please search again.")
        
    download_name = f"{search_term}_result.xlsx"
    
    return FileResponse(
        path=result_path,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        filename=download_name
    )

# Static Files serving configuration
FRONTEND_DIST = os.path.abspath(os.path.join(BASE_DIR, "..", "frontend", "dist"))
# Pre-create the directory structure to avoid startup errors if the frontend isn't built yet
os.makedirs(os.path.join(FRONTEND_DIST, "assets"), exist_ok=True)

# Mount the React compiled JS/CSS folder
app.mount("/assets", StaticFiles(directory=os.path.join(FRONTEND_DIST, "assets")), name="assets")

# Wildcard route to fallback to React's index.html for client-side routing
@app.get("/{rest_of_path:path}")
def serve_frontend(rest_of_path: str):
    index_file = os.path.join(FRONTEND_DIST, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)
    return {
        "detail": "Frontend assets not compiled. Please run 'npm run build' inside the 'frontend' folder."
    }
