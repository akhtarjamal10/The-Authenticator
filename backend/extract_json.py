import os
import json
import re
import pdfplumber
import traceback

# --- CONFIGURATION ---
# Define paths relative to this script
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
INPUT_FOLDER = os.path.join(BASE_DIR, "uploads")
OUTPUT_FOLDER = os.path.join(BASE_DIR, "extracted_json")

def clean_text(text):
    if text:
        return text.strip()
    return ""

def safe_float(value):
    """Safely converts a string to float. Returns 0.0 if conversion fails."""
    try:
        if not value: return 0.0
        # Remove any stray characters that aren't digits or dots
        cleaned = re.sub(r'[^\d\.]', '', str(value))
        if cleaned == '.' or cleaned == '':
            return 0.0
        return float(cleaned)
    except:
        return 0.0

def extract_fields_from_pdf(pdf_path):
    data = {
        "text_content": "",
        "tables": []
    }
    
    # 1. READ PDF CONTENT
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            # Extract Text (Preserving layout somewhat)
            page_text = page.extract_text()
            if page_text:
                data["text_content"] += page_text + "\n"
            
            # Extract Tables (for Subject Marks)
            tables = page.extract_tables()
            for table in tables:
                data["tables"].append(table)

    text = data["text_content"]
    
    # --- 2. REGEX EXTRACTION (Logic to find key fields) ---
    
    # University Name (Looks for "UNIVERSITY" in uppercase)
    university = "Unknown University"
    uni_match = re.search(r"([A-Z\s]+UNIVERSITY)", text)
    if uni_match:
        university = clean_text(uni_match.group(1))

    # Roll No (Looks for "Roll No" followed by digits)
    roll_no = "Unknown"
    roll_match = re.search(r"(?:Roll No|Registration No)[:\s]*(\d+)", text, re.IGNORECASE)
    if roll_match:
        roll_no = roll_match.group(1)

    # Student Name (Looks for "Name" label)
    student_name = "Unknown"
    name_match = re.search(r"(?:Name|Student Name)[:\s]*([A-Za-z\s\.]+)", text, re.IGNORECASE)
    if name_match:
        # Take the first line of the match to avoid grabbing next field
        raw_name = name_match.group(1).split('\n')[0]
        student_name = clean_text(raw_name)

    # Semester (Looks for Roman Numerals or words)
    semester = "I"
    sem_match = re.search(r"SEMESTER\s+([IVX]+|\d+)", text, re.IGNORECASE)
    if sem_match:
        semester = sem_match.group(1)

    # Course (Looks for B.Tech, etc.)
    course = "B.Tech"
    course_match = re.search(r"(BACHELOR OF TECHNOLOGY|B\.Tech|BCA|MCA|B\.Sc)", text, re.IGNORECASE)
    if course_match:
        course = course_match.group(1)

    # SGPA / CGPA
    # Looks for numbers like x.xx near the keywords
    sgpa = 0.0
    cgpa = 0.0
    
    sgpa_match = re.search(r"SGPA[:\s]*(\d+\.\d+)", text, re.IGNORECASE)
    if sgpa_match: sgpa = safe_float(sgpa_match.group(1))
    
    cgpa_match = re.search(r"CGPA[:\s]*(\d+\.\d+)", text, re.IGNORECASE)
    if cgpa_match: cgpa = safe_float(cgpa_match.group(1))

    # --- 3. TABLE EXTRACTION (Subjects) ---
    subjects_list = []
    
    for table in data["tables"]:
        if not table: continue
        
        # Check if this table looks like a marks table (has "Code" or "Subject" in header)
        # We flatten the first row to check for keywords
        header_row = [str(cell).lower() for cell in table[0] if cell]
        header_str = " ".join(header_row)
        
        if "code" in header_str or "subject" in header_str:
            # Iterate through rows skipping the header
            for row in table[1:]:
                # Clean row cells
                row = [clean_text(str(cell)) if cell else "" for cell in row]

                # Basic validation to skip junk rows
                if len(row) < 3: continue
                if "total" in row[0].lower(): continue

                # Heuristic Mapping: Assumes standard column order 
                # usually: Code | Name | ... | Grade | Points | Credit
                # You might need to adjust indices [0], [1], etc. based on your specific PDF format
                try:
                    # Trying to be flexible:
                    # If the row has a grade (A, B, C...) and a code (BCS...), capture it
                    subj_entry = {
                        "code": row[0],
                        "name": row[1],
                        # Try to find Grade in columns 2, 3, or 4
                        "grade": row[2] if len(row) > 2 else "", 
                        "grade_points": row[3] if len(row) > 3 else "0",
                        "credit": row[4] if len(row) > 4 else "0"
                    }
                    subjects_list.append(subj_entry)
                except IndexError:
                    continue

    return {
        "university": university,
        "roll_no": roll_no,
        "name": student_name,
        "semester": semester,
        "course": course,
        "sgpa": sgpa,
        "cgpa": cgpa,
        "subjects": subjects_list
    }

def process_pdfs(specific_filename=None):
    # Ensure folders exist
    os.makedirs(INPUT_FOLDER, exist_ok=True)
    os.makedirs(OUTPUT_FOLDER, exist_ok=True)
    
    # 1. Determine file to process
    files_to_process = []
    if specific_filename:
        # Handle absolute path or relative filename
        if os.path.isabs(specific_filename):
            if os.path.exists(specific_filename):
                files_to_process = [specific_filename]
        else:
            # Check inside uploads folder
            possible_path = os.path.join(INPUT_FOLDER, specific_filename)
            if os.path.exists(possible_path):
                files_to_process = [possible_path]
            elif os.path.exists(specific_filename):
                files_to_process = [specific_filename]
    else:
        # Process all PDFs in uploads
        files_to_process = [
            os.path.join(INPUT_FOLDER, f) 
            for f in os.listdir(INPUT_FOLDER) 
            if f.lower().endswith('.pdf')
        ]

    results = [] 

    for file_path in files_to_process:
        print(f"📄 Processing (Pure Logic): {file_path}")
        try:
            # 2. Extract Data
            extracted = extract_fields_from_pdf(file_path)

            # 3. Construct JSON Structure (Matching your MongoDB Schema)
            
            # Helper to calculate totals logic-wise if not in PDF
            total_credits = sum([safe_float(sub["credit"]) for sub in extracted["subjects"]])
            
            # Build the marks map for 'compare_json.py' logic
            marks_map = {}
            for sub in extracted['subjects']:
                # Ensure we map Subject Name -> Grade Points (or Grade)
                marks_map[sub['name']] = sub['grade_points']

            json_output = {
                "marksheet": {
                    "rollNo": extracted['roll_no'],
                    "university": extracted['university'],
                    "document_metadata": {
                        "schema_version": "1.0",
                        "university_name": extracted['university'],
                        "document_type": "marksheet",
                        "issue_date": None
                    },
                    "student_info": {
                        "name": extracted['name'],
                        "roll_no": extracted['roll_no'],
                        "registration_no": extracted['roll_no'],
                        "certificate_id": None
                    },
                    "academic_info": {
                        "course": extracted['course'],
                        "semester": extracted['semester'],
                        "marks": marks_map,
                        "credits": extracted["subjects"][0]["credit"] if extracted["subjects"] else "0",
                        "total_marks": 0, # Logic can calculate this if needed
                        "total_credits": total_credits,
                        "sgpa": extracted['sgpa'],
                        "cgpa": extracted['cgpa'],
                        "result_status": "PASS" if extracted['sgpa'] > 4.0 else "FAIL",
                        "subjects": extracted['subjects']
                    },
                },
            }
            
            # 4. Save JSON Output
            base_name = os.path.basename(file_path)
            json_filename = os.path.splitext(base_name)[0] + ".json"
            output_path = os.path.join(OUTPUT_FOLDER, json_filename)

            with open(output_path, 'w', encoding='utf-8') as json_file:
                json.dump(json_output, json_file, indent=4)
            
            results.append(json_output)
            print(f"   ✅ Saved JSON to {output_path}")

        except Exception as e:
            print(f"   ❌ FAILED: {file_path}")
            traceback.print_exc()

    return results

if __name__ == "__main__":
    process_pdfs()