# import json
# import requests

# def is_ignored(value):
#     """Return True if value should be ignored for comparison."""
#     if value is None or value is False or value == "":
#         return True
#     if isinstance(value, (dict, list)) and len(value) == 0:
#         return True
#     return False


# def compare_json(obj1, obj2):
#     """Return a JSON object containing only the differences."""

#     # If both ignored values → no diff
#     if is_ignored(obj1) and is_ignored(obj2):
#         return None

#     # Both dicts
#     if isinstance(obj1, dict) and isinstance(obj2, dict):
#         diff = {}
#         for key in set(obj1.keys()) | set(obj2.keys()):
#             if key == '_id' or key == '__v':
#                 continue
#             d = compare_json(obj1.get(key), obj2.get(key))
#             if d is not None:
#                 diff[key] = d
#         return diff if diff else None

#     # Both lists
#     if isinstance(obj1, list) and isinstance(obj2, list):
#         max_len = max(len(obj1), len(obj2))
#         diff_list = []
#         any_diff = False

#         for i in range(max_len):
#             v1 = obj1[i] if i < len(obj1) else None
#             v2 = obj2[i] if i < len(obj2) else None
#             d = compare_json(v1, v2)

#             diff_list.append(d)
#             if d is not None:
#                 any_diff = True

#         return diff_list if any_diff else None

#     # Primitive comparison
#     if obj1 != obj2:
#         return {"file1": obj1, "file2": obj2}

#     return None


# def compare_json_files(json1, json2):
#     """
#     Compares two JSON objects and RETURNS the complete JSON FILE CONTENT
#     as a string, not a Python dict.
#     """
#     diff = compare_json(json1, json2)
#     result = diff if diff is not None else {}

#     # Return JSON file content
#     return json.dumps(result, indent=4)



# # ------------------ RUNNER ------------------

# if __name__ == "__main__":
#     pass


import json
from difflib import SequenceMatcher

def similar(a, b):
    """Checks string similarity (0.0 to 1.0)."""
    return SequenceMatcher(None, str(a).lower(), str(b).lower()).ratio()

def compare_json_files(uploaded_data, ground_truth):
    """
    Compares the uploaded JSON against the MongoDB Ground Truth.
    Returns a dictionary with match status and discrepancies.
    """
    report = {
        "status": "MATCH",  # Default to MATCH, change to TAMPERED if errors found
        "score": 100.0,
        "discrepancies": [],
        "verified_fields": []
    }

    # 1. Normalize Keys (Handle potential 'marksheet' wrapper in one but not the other)
    # We want to compare the inner "marksheet" data if it exists
    u_data = uploaded_data.get("marksheet", uploaded_data)
    t_data = ground_truth.get("marksheet", ground_truth)

    # 2. Define Critical Fields to Check (Paths)
    # These match the structure of your MongoDB document
    critical_checks = [
        ("rollNo", u_data.get("rollNo"), t_data.get("rollNo")),
        ("student_name", u_data.get("student_info", {}).get("name"), t_data.get("student_info", {}).get("name")),
        ("university", u_data.get("university"), t_data.get("university")),
        ("sgpa", u_data.get("academic_info", {}).get("sgpa"), t_data.get("academic_info", {}).get("sgpa")),
        ("cgpa", u_data.get("academic_info", {}).get("cgpa"), t_data.get("academic_info", {}).get("cgpa")),
        ("result_status", u_data.get("academic_info", {}).get("result_status"), t_data.get("academic_info", {}).get("result_status")),
    ]

    errors = 0
    total_checks = len(critical_checks)

    # 3. Check Basic Fields
    for field_name, val_upload, val_truth in critical_checks:
        # Convert to string and strip for safer comparison
        v_up = str(val_upload).strip() if val_upload is not None else ""
        v_tr = str(val_truth).strip() if val_truth is not None else ""

        if v_up.lower() == v_tr.lower():
            report["verified_fields"].append(field_name)
        else:
            errors += 1
            report["discrepancies"].append({
                "field": field_name,
                "uploaded_value": val_upload,
                "truth_value": val_truth,
                "issue": "Value Mismatch"
            })

    # 4. Check Subject-wise Grades (Deep Compare)
    # This is where students often tamper (changing specific subject grades)
    u_subjects = u_data.get("academic_info", {}).get("subjects", [])
    t_subjects = t_data.get("academic_info", {}).get("subjects", [])

    # Map truth subjects by Code for easy lookup
    truth_map = {sub.get("code"): sub for sub in t_subjects}

    for u_sub in u_subjects:
        code = u_sub.get("code")
        u_grade = u_sub.get("grade")
        
        if code in truth_map:
            t_sub = truth_map[code]
            t_grade = t_sub.get("grade")
            
            total_checks += 1
            if str(u_grade).strip().upper() == str(t_grade).strip().upper():
                report["verified_fields"].append(f"Subject {code} Grade")
            else:
                errors += 1
                report["discrepancies"].append({
                    "field": f"Subject {code}",
                    "uploaded_value": u_grade,
                    "truth_value": t_grade,
                    "issue": "Grade Altered"
                })
        else:
            # Subject exists in Upload but NOT in Truth (Fake Subject?)
            errors += 1
            report["discrepancies"].append({
                "field": f"Subject {code}",
                "uploaded_value": code,
                "truth_value": "Not Found",
                "issue": "Unknown Subject Added"
            })

    # 5. Final Scoring
    if total_checks > 0:
        match_percentage = ((total_checks - errors) / total_checks) * 100
        report["score"] = round(match_percentage, 2)
    
    if errors > 0:
        report["status"] = "TAMPERED"
    
    return report