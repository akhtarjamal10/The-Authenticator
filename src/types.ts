// src/types.ts

// 1. User Roles
export enum UserRole {
  GUEST = 'GUEST',
  USER = 'USER',
  ADMIN = 'ADMIN',
  INSTITUTION = 'INSTITUTION',
  ORGANISATION = 'ORGANISATION',
}

// 2. Verification Request (Merged & Unified)
export interface VerificationRequest {
  id: string;
  userId: string;
  fileName: string;
  fileUrl?: string; // Optional (might be local or cloud)
  // Unified status list including all possible states
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'REJECTED' | 'APPROVED'; 
  type: 'DOCUMENT' | 'MANUAL' | string; // Flexible type
  submittedAt: any;
  details?: any;
}

// 3. Verification Log
export interface VerificationLog {
  id: string;
  candidateName: string;
  certificateId: string;
  institution: string;
  status: 'VERIFIED' | 'FAKE' | 'SUSPICIOUS';
  date: string;
  details: string;
}

// 4. Institution Profile
export interface Institution {
  id: string;
  name: string;
  code: string;
  type: string;
  district: string;
  address: string;
  principalName: string; 
  mobile: string;
  region: string;
  contactEmail: string;
  status: 'ACTIVE' | 'PENDING' | 'REJECTED';
  password?: string;
}

// 5. Organisation Profile
export interface Organisation {
  id: string;
  name: string;
  code: string;
  type: string;
  district: string;
  address: string;
  principalName: string;
  mobileNo: string;
  region: string;
  email: string;
  status: 'ACTIVE' | 'PENDING' | 'REJECTED';
  password?: string;
  uid?: string;
  createdAt?: any;
  contactName?: string;
}

// 6. Statistics Data
export interface StatData {
  name: string;
  value: number;
  color?: string;
}

// 7. UI Steps
export enum VerificationStep {
  UPLOAD = 0,
  PREVIEW = 1,
  PROCESSING = 2,
  RESULT = 3,
  HANDOVER = 4
}

// 8. AI Verification Results (New)
export interface Discrepancy {
  field: string;
  uploaded_value: any;
  truth_value: any;
  issue: string;
}

export interface VerificationResult {
  status: "MATCH" | "TAMPERED";
  score: number;
  discrepancies: Discrepancy[];
  verified_fields: string[];
}