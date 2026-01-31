// import {
//   collection,
//   addDoc,
//   getDocs,
//   query,
//   where,
//   doc,
//   updateDoc,
//   setDoc,
//   Timestamp,
//   orderBy,
// } from "firebase/firestore";

// import * as firebaseAuth from "firebase/auth";
// import { db, auth, googleProvider, storage } from "../firebaseConfig"; // <-- storage added
// import { ref, uploadBytes, getDownloadURL } from "firebase/storage";     // <-- storage imports
// import { UserRole, Institution, VerificationRequest, Organisation } from "../types";
// import { MONTHLY_STATS } from "../constants";
// import { deleteDoc } from "firebase/firestore";


// // ---------------------------------------------
// // EXTENDED TYPES
// // ---------------------------------------------

// export interface FixedInstitution extends Institution {
//   logo?: string;
// }

// // ---------------------------------------------
// // OTP STATE
// // ---------------------------------------------
// let confirmationResult: firebaseAuth.ConfirmationResult | null = null;

// // ---------------------------------------------
// // API OBJECT
// // ---------------------------------------------
// export const api = {
//   // ------------------ CITIZEN: Google Login ------------------

//   loginGoogle: async () => {
//     try {
//       const result = await firebaseAuth.signInWithPopup(auth, googleProvider);
//       const user = result.user;

//       const userRef = doc(db, "users", user.uid);

//       await setDoc(
//         userRef,
//         {
//           name: user.displayName,
//           email: user.email,
//           role: UserRole.USER,
//           lastLogin: Timestamp.now(),
//         },
//         { merge: true }
//       );

      

//       return {
//         name: user.displayName || "User",
//         email: user.email,
//         role: UserRole.USER,
//         token: await user.getIdToken(),
//         avatar: user.photoURL,
//         uid: user.uid,
//       };
//     } catch (error) {
//       console.error("Google Auth Error:", error);
//       throw error;
//     }
//   },

//   // ------------------ CITIZEN: Mobile OTP (SEND) ------------------

//   sendOtp: async (phoneNumber: string, recaptchaDivId: string) => {
//     try {
//       const recaptchaVerifier = new firebaseAuth.RecaptchaVerifier(
//         auth,
//         recaptchaDivId,
//         { size: "invisible" }
//       );

//       confirmationResult = await firebaseAuth.signInWithPhoneNumber(
//         auth,
//         phoneNumber,
//         recaptchaVerifier
//       );

//       return true;
//     } catch (error: any) {
//       console.error("OTP Send Error:", error);
//       throw new Error(error.message || "Failed to send OTP");
//     }
//   },

//   // ------------------ CITIZEN: Mobile OTP (VERIFY) ------------------

//   verifyOtp: async (otp: string) => {
//     if (!confirmationResult) {
//       throw new Error("OTP was not sent or expired.");
//     }

//     try {
//       const result = await confirmationResult.confirm(otp);
//       const user = result.user;

//       const userRef = doc(db, "users", user.uid);

//       await setDoc(
//         userRef,
//         {
//           mobile: user.phoneNumber,
//           role: UserRole.USER,
//           lastLogin: Timestamp.now(),
//         },
//         { merge: true }
//       );

//       return {
//         name: "Citizen User",
//         mobile: user.phoneNumber,
//         role: UserRole.USER,
//         token: await user.getIdToken(),
//         uid: user.uid,
//       };
//     } catch (error: any) {
//       throw new Error("Invalid OTP");
//     }
//   },

//   // ------------------ INSTITUTION LOGIN ------------------

//   loginInstitution: async (email: string, pass: string) => {
//     try {
//       const result = await firebaseAuth.signInWithEmailAndPassword(
//         auth,
//         email,
//         pass
//       );

//       const q = query(
//         collection(db, "institutions"),
//         where("contactEmail", "==", email)
//       );
//       const snapshot = await getDocs(q);

//       if (snapshot.empty) throw new Error("Institution not registered.");

//       const instData = snapshot.docs[0].data() as FixedInstitution;

//       if (instData.status === "PENDING")
//         throw new Error("Your account is pending approval.");
//       if (instData.status === "REJECTED")
//         throw new Error("Your account request was rejected.");

//       return {
//         name: instData.name,
//         role: UserRole.INSTITUTION,
//         id: snapshot.docs[0].id,
//         token: await result.user.getIdToken(),
//         uid: result.user.uid,
//       };
//     } catch (error: any) {
//       throw new Error(error.message || "Institution login failed");
//     }
//   },

//   // ------------------ ORGANISATION LOGIN ------------------

//   loginOrganisation: async (email: string, pass: string) => {
//     try {
//       const result = await firebaseAuth.signInWithEmailAndPassword(
//         auth,
//         email,
//         pass
//       );

//       const q = query(
//         collection(db, "organisations"),
//         where("email", "==", email)
//       );
//       const snapshot = await getDocs(q);

//       if (snapshot.empty) throw new Error("Organisation not registered.");

//       const orgData = snapshot.docs[0].data() as Organisation;


//       return {
//         name: orgData.name,
//         role: UserRole.ORGANISATION,
//         id: snapshot.docs[0].id,
//         token: await result.user.getIdToken(),
//         uid: result.user.uid,
//       };
//     } catch (error: any) {
//       throw new Error(error.message || "Organisation login failed");
//     }
//   },

//   // ------------------ LOGOUT ------------------

//   logout: async () => {
//     await firebaseAuth.signOut(auth);
//   },

//   // ------------------ REGISTER INSTITUTION ------------------

//   registerInstitution: async (data: any) => {
//     try {
//       const userCredential = await firebaseAuth.createUserWithEmailAndPassword(
//         auth,
//         data.contactEmail,
//         data.password
//       );

//       const newInst = {
//         name: data.name,
//         code: data.code,
//         type: data.type,
//         address: data.address,
//         district: data.district,
//         principalName: data.principalName,
//         contactEmail: data.contactEmail,
//         mobile: data.mobile,
//         status: "PENDING",
//         uid: userCredential.user.uid,
//         createdAt: Timestamp.now(),
//       };

//       await addDoc(collection(db, "institutions"), newInst);

//       // await firebaseAuth.signOut(auth);
//       return true;
//     } catch (error) {
//       console.error(error);
//       throw error;
//     }
//   },

//   // ------------------ REGISTER ORGANISATION ------------------

//   registerOrganisation: async (data: any) => {
//     try {
//       const userCredential = await firebaseAuth.createUserWithEmailAndPassword(
//         auth,
//         data.email,
//         data.password
//       );

//       const newOrg = {
//         name: data.organisationName,
//         contactName: data.contactName,
//         mobileNo: data.mobileNo,
//         email: data.email,
//         status: "PENDING",
//         uid: userCredential.user.uid,
//         createdAt: Timestamp.now(),
//       };

//       await addDoc(collection(db, "organisations"), newOrg);
//       await firebaseAuth.signOut(auth);

//       return true;
//     } catch (error) {
//       console.error(error);
//       throw error;
//     }
//   },

//   // ------------------ INSTITUTION LIST ------------------

//   getAllInstitutions: async () => {
//     const snapshot = await getDocs(collection(db, "institutions"));
//     return snapshot.docs.map((d) => ({
//       id: d.id,
//       ...d.data(),
//     })) as FixedInstitution[];
//   },

//   // In src/services/api.ts

//   updateInstitutionStatus: async (id: string, status: "ACTIVE" | "REJECTED") => {
//     try {
//       if (status === "REJECTED") {
//         // ⚠️ Logic Change: If rejected, DELETE the document entirely
//         await deleteDoc(doc(db, "institutions", id));
//         console.log(`Institution ${id} rejected and deleted.`);
//       } else {
//         // If active, just update the status field
//         await updateDoc(doc(db, "institutions", id), { status });
//       }
//       return true;
//     } catch (error) {
//       console.error("Error updating status:", error);
//       throw error;
//     }
//   },

//   // ------------------ ORGANISATION MANAGEMENT (FOR ADMIN) ------------------

//   /// ------------------ ORGANISATION MANAGEMENT ------------------

//   getAllOrganisations: async () => {
//     const snapshot = await getDocs(collection(db, "organisations"));
    
//     // 3. Cast the result to the new 'Organisation[]' type
//     return snapshot.docs.map((d) => ({
//       id: d.id,
//       ...d.data(),
//     })) as Organisation[]; 
//   },

//   updateOrganisationStatus: async (id: string, status: "ACTIVE" | "REJECTED") => {
//     try {
//       if (status === "REJECTED") {
//         await deleteDoc(doc(db, "organisations", id));
//       } else {
//         await updateDoc(doc(db, "organisations", id), { status });
//       }
//       return true;
//     } catch (error) {
//       console.error("Error updating organisation status:", error);
//       throw error;
//     }
//   },

//   // ------------------ USER VERIFICATION QUEUE ------------------

//   submitVerificationRequest: async (file: File, userId: string) => {
//     const docRef = await addDoc(collection(db, "verification_queue"), {
//       userId,
//       fileName: file.name,
//       status: "PENDING",
//       type: "DOCUMENT",
//       submittedAt: Timestamp.now(),
//     });

//     return { requestId: docRef.id };
//   },

//   submitManualRequest: async (details: any, userId: string) => {
//     const docRef = await addDoc(collection(db, "verification_queue"), {
//       userId,
//       details,
//       status: "PENDING",
//       type: "MANUAL",
//       submittedAt: Timestamp.now(),
//     });

//     return { requestId: docRef.id };
//   },

//   getUserRequests: async (userId: string) => {
//     if (!userId) return [];

//     try {
//       const q1 = query(
//         collection(db, "verification_queue"),
//         where("userId", "==", userId),
//         orderBy("submittedAt", "desc")
//       );

//       const snapshot = await getDocs(q1);

//       return snapshot.docs.map((doc) => {
//         const data = doc.data();
//         return {
//           id: doc.id,
//           ...data,
//           submittedAt: data.submittedAt?.toDate?.()?.toLocaleString() || "",
//         } as VerificationRequest;
//       });
//     } catch {
//       const q2 = query(
//         collection(db, "verification_queue"),
//         where("userId", "==", userId)
//       );
//       const snapshot = await getDocs(q2);
//       return snapshot.docs.map(
//         (doc) => ({ id: doc.id, ...doc.data() } as VerificationRequest)
//       );
//     }
//   },

//   // --------------------------------------------------------
//   // ⭐⭐⭐ NEW: ORGANISATION DOCUMENT UPLOAD APIs ⭐⭐⭐
//   // --------------------------------------------------------

//   uploadOrganisationDocument: async (formData: FormData) => {
//     const file = formData.get("file") as File;
//     const organisationId = formData.get("organisationId") as string;

//     if (!file || !organisationId)
//       throw new Error("File or organisationId missing");

//     // Upload file to Firebase Storage
//     const fileRef = ref(
//       storage,
//       `organisation_uploads/${organisationId}/${Date.now()}_${file.name}`
//     );

//     const snap = await uploadBytes(fileRef, file);
//     const fileUrl = await getDownloadURL(snap.ref);

//     // Create DB entry
//     const docRef = await addDoc(collection(db, "organisation_uploads"), {
//       organisationId,
//       fileName: file.name,
//       fileUrl,
//       status: "PENDING",
//       uploadedAt: Timestamp.now(),
//     });

//     return { id: docRef.id };
//   },

//   getOrganisationUploads: async (organisationId: string) => {
//     if (!organisationId) return [];

//     const colRef = collection(db, "organisation_uploads");
//     const q1 = query(colRef, where("organisationId", "==", organisationId));

//     const snapshot = await getDocs(q1);

//     const data = snapshot.docs.map((doc) => ({
//       id: doc.id,
//       ...doc.data(),
//     }));

//     return data.sort((a: any, b: any) => {
//       const t1 = a.uploadedAt?.toMillis?.() || 0;
//       const t2 = b.uploadedAt?.toMillis?.() || 0;
//       return t2 - t1;
//     });
//   },
//   deleteInstitution: async (id: string) => {
//     try {
//       const instRef = doc(db, "institutions", id);
//       await deleteDoc(instRef);
//       // NOTE: For a complete solution, you would typically also delete the 
//       // corresponding Firebase Auth user using a Cloud Function or Admin SDK.
//       return true;
//     } catch (error: any) {
//       console.error("Firestore Delete Error:", error);
//       // Re-throw the error so it can be caught in the component
//       throw new Error(error.message || "Failed to delete institution in Firestore.");
//     }
//   },


//   // ------------------ ADMIN DASHBOARD STATS ------------------

//   getAdminStats: async () => {
//     return MONTHLY_STATS;
//   },

//   // In src/services/api.ts

//   // ------------------ ADMIN LOGIN ------------------
//   loginAdmin: async (email: string, pass: string) => {
//     try {
//       // 1. Authenticate with Firebase
//       const result = await firebaseAuth.signInWithEmailAndPassword(auth, email.trim(), pass);
      
//       // 2. SECURITY: Check if this email is allowed to be an Admin
//       // (This prevents regular users from logging into the Admin panel)
//       const allowedAdmins = ["jk@gov.in"]; 
      
//       if (!allowedAdmins.includes(result.user.email || "")) {
//           await firebaseAuth.signOut(auth); // Logout immediately if not authorized
//           throw new Error("Access Denied: You are not an Administrator.");
//       }

//       return {
//         name: "System Admin",
//         role: UserRole.ADMIN,
//         token: await result.user.getIdToken(),
//         uid: result.user.uid,
//       };
//     } catch (error: any) {
//       console.error("Admin Login Error:", error);
//       throw new Error(error.message || "Admin login failed");
//     }
//   },

//   // ------------------ APPROVAL FLOW ------------------
//   processAndApproveDocument: async (pdfUrl: string, docId: string) => {
//     try {
//       console.log("Approving document:", docId);

//       // 1. Trigger Python Backend
//       const response = await fetch("http://127.0.0.1:8000/approve-document", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ pdf_url: pdfUrl }),
//       });

//       if (!response.ok) {
//         const errText = await response.text();
//         throw new Error(`Extraction Failed: ${errText}`);
//       }

//       const result = await response.json();

//       // 2. Update Firestore Status to APPROVED
//       const docRef = doc(db, "organisation_uploads", docId);
//       await updateDoc(docRef, { 
//         status: "APPROVED",
//         processedAt: Timestamp.now(),
//         mongoId: result.mongo_id 
//       });

//       return true;
//     } catch (error) {
//       console.error("Approval Error:", error);
//       throw error;
//     }
//   },

//   // ------------------ DASHBOARD FETCH ------------------
//   getPendingVerifications: async () => {
//     try {
//       const q = query(
//         collection(db, "verification_queues"), // ✅ Correct Collection Name
//         where("status", "==", "PENDING")       // Fetch ALL pending items
//       );
      
//       const snapshot = await getDocs(q);
      
//       return snapshot.docs.map(doc => ({
//         id: doc.id,
//         ...doc.data()
//       })); 
//     } catch (error) {
//       console.error("Error fetching verification queue:", error);
//       return [];
//     }
//   },

//   // ------------------ DASHBOARD LOGS ------------------
//   getVerificationHistory: async () => {
//     try {
//       // Fetches APPROVED or REJECTED items
//       const q = query(
//         collection(db, "verification_queues"),
//         where("status", "in", ["APPROVED", "REJECTED"])
//       );
      
//       const snapshot = await getDocs(q);
      
//       return snapshot.docs.map(doc => ({
//         id: doc.id,
//         ...doc.data()
//       })); 
//     } catch (error) {
//       console.error("Error fetching history:", error);
//       return [];
//     }
//   },
// };

// import {
//   collection,
//   addDoc,
//   getDocs,
//   query,
//   where,
//   doc,
//   updateDoc,
//   setDoc,
//   Timestamp,
//   orderBy,
//   deleteDoc,
// } from "firebase/firestore";

// import * as firebaseAuth from "firebase/auth";
// import { db, auth, googleProvider, storage } from "../firebaseConfig";
// import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
// import { UserRole, Institution, VerificationRequest, Organisation } from "../types";
// import { MONTHLY_STATS } from "../constants";

// // ---------------------------------------------
// // EXTENDED TYPES
// // ---------------------------------------------

// export interface FixedInstitution extends Institution {
//   logo?: string;
// }

// // ---------------------------------------------
// // OTP STATE
// // ---------------------------------------------
// let confirmationResult: firebaseAuth.ConfirmationResult | null = null;

// // ---------------------------------------------
// // API OBJECT
// // ---------------------------------------------
// export const api = {

//   // =================================================================
//   // 1. AUTHENTICATION & USER MANAGEMENT
//   // =================================================================

//   // ------------------ CITIZEN: Google Login ------------------
//   loginGoogle: async () => {
//     try {
//       const result = await firebaseAuth.signInWithPopup(auth, googleProvider);
//       const user = result.user;

//       const userRef = doc(db, "users", user.uid);

//       await setDoc(
//         userRef,
//         {
//           name: user.displayName,
//           email: user.email,
//           role: UserRole.USER,
//           lastLogin: Timestamp.now(),
//         },
//         { merge: true }
//       );

//       return {
//         name: user.displayName || "User",
//         email: user.email,
//         role: UserRole.USER,
//         token: await user.getIdToken(),
//         avatar: user.photoURL,
//         uid: user.uid,
//       };
//     } catch (error) {
//       console.error("Google Auth Error:", error);
//       throw error;
//     }
//   },

//   // ------------------ CITIZEN: Mobile OTP ------------------
//   sendOtp: async (phoneNumber: string, recaptchaDivId: string) => {
//     try {
//       const recaptchaVerifier = new firebaseAuth.RecaptchaVerifier(
//         auth,
//         recaptchaDivId,
//         { size: "invisible" }
//       );

//       confirmationResult = await firebaseAuth.signInWithPhoneNumber(
//         auth,
//         phoneNumber,
//         recaptchaVerifier
//       );
//       return true;
//     } catch (error: any) {
//       console.error("OTP Send Error:", error);
//       throw new Error(error.message || "Failed to send OTP");
//     }
//   },

//   verifyOtp: async (otp: string) => {
//     if (!confirmationResult) throw new Error("OTP was not sent or expired.");

//     try {
//       const result = await confirmationResult.confirm(otp);
//       const user = result.user;
//       const userRef = doc(db, "users", user.uid);

//       await setDoc(
//         userRef,
//         {
//           mobile: user.phoneNumber,
//           role: UserRole.USER,
//           lastLogin: Timestamp.now(),
//         },
//         { merge: true }
//       );

//       return {
//         name: "Citizen User",
//         mobile: user.phoneNumber,
//         role: UserRole.USER,
//         token: await user.getIdToken(),
//         uid: user.uid,
//       };
//     } catch (error: any) {
//       throw new Error("Invalid OTP");
//     }
//   },

//   // ------------------ ADMIN LOGIN ------------------
//   loginAdmin: async (email: string, pass: string) => {
//     try {
//       const result = await firebaseAuth.signInWithEmailAndPassword(auth, email.trim(), pass);
      
//       // SECURITY: Whitelist check
//       const allowedAdmins = ["jk@gov.in"]; 
//       if (!allowedAdmins.includes(result.user.email || "")) {
//           await firebaseAuth.signOut(auth);
//           throw new Error("Access Denied: You are not an Administrator.");
//       }

//       return {
//         name: "System Admin",
//         role: UserRole.ADMIN,
//         token: await result.user.getIdToken(),
//         uid: result.user.uid,
//       };
//     } catch (error: any) {
//       console.error("Admin Login Error:", error);
//       throw new Error(error.message || "Admin login failed");
//     }
//   },

//   // ------------------ INSTITUTION LOGIN ------------------
//   loginInstitution: async (email: string, pass: string) => {
//     try {
//       const result = await firebaseAuth.signInWithEmailAndPassword(auth, email, pass);
//       const q = query(collection(db, "institutions"), where("contactEmail", "==", email));
//       const snapshot = await getDocs(q);

//       if (snapshot.empty) throw new Error("Institution not registered.");

//       const instData = snapshot.docs[0].data() as FixedInstitution;

//       if (instData.status === "PENDING") throw new Error("Your account is pending approval.");
//       if (instData.status === "REJECTED") throw new Error("Your account request was rejected.");

//       return {
//         name: instData.name,
//         role: UserRole.INSTITUTION,
//         id: snapshot.docs[0].id,
//         token: await result.user.getIdToken(),
//         uid: result.user.uid,
//       };
//     } catch (error: any) {
//       throw new Error(error.message || "Institution login failed");
//     }
//   },

//   // ------------------ ORGANISATION LOGIN ------------------
//   loginOrganisation: async (email: string, pass: string) => {
//     try {
//       const result = await firebaseAuth.signInWithEmailAndPassword(auth, email, pass);
//       const q = query(collection(db, "organisations"), where("email", "==", email));
//       const snapshot = await getDocs(q);

//       if (snapshot.empty) throw new Error("Organisation not registered.");

//       const orgData = snapshot.docs[0].data() as Organisation;

//       return {
//         name: orgData.name,
//         role: UserRole.ORGANISATION,
//         id: snapshot.docs[0].id,
//         token: await result.user.getIdToken(),
//         uid: result.user.uid,
//       };
//     } catch (error: any) {
//       throw new Error(error.message || "Organisation login failed");
//     }
//   },

//   logout: async () => {
//     await firebaseAuth.signOut(auth);
//   },

//   // =================================================================
//   // 2. REGISTRATION
//   // =================================================================

//   registerInstitution: async (data: any) => {
//     try {
//       const userCredential = await firebaseAuth.createUserWithEmailAndPassword(
//         auth,
//         data.contactEmail,
//         data.password
//       );

//       const newInst = {
//         name: data.name,
//         code: data.code,
//         type: data.type,
//         address: data.address,
//         district: data.district,
//         principalName: data.principalName,
//         contactEmail: data.contactEmail,
//         mobile: data.mobile,
//         status: "PENDING", // Wait for Admin
//         uid: userCredential.user.uid,
//         createdAt: Timestamp.now(),
//       };

//       await addDoc(collection(db, "institutions"), newInst);
//       return true;
//     } catch (error) {
//       console.error(error);
//       throw error;
//     }
//   },

//   registerOrganisation: async (data: any) => {
//     try {
//       const userCredential = await firebaseAuth.createUserWithEmailAndPassword(
//         auth,
//         data.email,
//         data.password
//       );

//       const newOrg = {
//         name: data.organisationName,
//         contactName: data.contactName,
//         mobileNo: data.mobileNo,
//         email: data.email,
//         status: "PENDING",
//         uid: userCredential.user.uid,
//         createdAt: Timestamp.now(),
//       };

//       await addDoc(collection(db, "organisations"), newOrg);
//       await firebaseAuth.signOut(auth);
//       return true;
//     } catch (error) {
//       console.error(error);
//       throw error;
//     }
//   },

//   // =================================================================
//   // 3. INSTITUTION & ORGANISATION MANAGEMENT (ADMIN)
//   // =================================================================

//   getAllInstitutions: async () => {
//     const snapshot = await getDocs(collection(db, "institutions"));
//     return snapshot.docs.map((d) => ({
//       id: d.id,
//       ...d.data(),
//     })) as FixedInstitution[];
//   },

//   updateInstitutionStatus: async (id: string, status: "ACTIVE" | "REJECTED") => {
//     try {
//       if (status === "REJECTED") {
//         await deleteDoc(doc(db, "institutions", id)); // Delete on reject
//       } else {
//         await updateDoc(doc(db, "institutions", id), { status });
//       }
//       return true;
//     } catch (error) {
//       console.error("Error updating status:", error);
//       throw error;
//     }
//   },

//   deleteInstitution: async (id: string) => {
//     try {
//       await deleteDoc(doc(db, "institutions", id));
//       return true;
//     } catch (error: any) {
//       throw new Error(error.message || "Failed to delete institution.");
//     }
//   },

//   getAllOrganisations: async () => {
//     const snapshot = await getDocs(collection(db, "organisations"));
//     return snapshot.docs.map((d) => ({
//       id: d.id,
//       ...d.data(),
//     })) as Organisation[];
//   },

//   updateOrganisationStatus: async (id: string, status: "ACTIVE" | "REJECTED") => {
//     try {
//       if (status === "REJECTED") {
//         await deleteDoc(doc(db, "organisations", id));
//       } else {
//         await updateDoc(doc(db, "organisations", id), { status });
//       }
//       return true;
//     } catch (error) {
//       console.error("Error updating organisation status:", error);
//       throw error;
//     }
//   },

//   getAdminStats: async () => {
//     return MONTHLY_STATS;
//   },

//   // =================================================================
//   // 4. DOCUMENT VERIFICATION & UPLOADS
//   // =================================================================

//   // --- A. Upload Document (Institution/User Side) ---
  
//   // Used by Institution Dashboard to upload new docs
//   // src/services/api.ts

//   uploadOrganisationDocument: async (formData: FormData) => {
//     const file = formData.get("file") as File;
//     const uploaderId = auth.currentUser?.uid || "unknown";

//     // 1. Upload to Storage
//     const fileRef = ref(storage, `verification_docs/${uploaderId}/${Date.now()}_${file.name}`);
//     const snap = await uploadBytes(fileRef, file);
//     const fileUrl = await getDownloadURL(snap.ref);

//     // 2. Add to Global Queue
//     // We removed 'organisationId' requirement. 
//     const docRef = await addDoc(collection(db, "verification_queues"), {
//       fileName: file.name,
//       fileUrl: fileUrl,
//       userId: uploaderId,
//       status: "PENDING",
//       type: "DOCUMENT",
//       submittedAt: Timestamp.now(),
//       // Optional: Add institute name if available, so Org knows who sent it
//     });

//     return { id: docRef.id };
//   },

//   // In src/services/api.ts

//   // ------------------ USER VERIFICATION (Restored) ------------------

//   // Restored function to fix VerificationFlow.tsx error
//   submitVerificationRequest: async (file: File, userId: string) => {
//     if (!file) throw new Error("File missing");

//     // 1. Upload to Storage (Same logic as Organisation upload)
//     const fileRef = ref(storage, `verification_docs/${userId}/${Date.now()}_${file.name}`);
//     const snap = await uploadBytes(fileRef, file);
//     const fileUrl = await getDownloadURL(snap.ref);

//     // 2. Add to the SAME Global Queue as everything else
//     // We use "verification_queues" (plural) to ensure the Admin Dashboard sees it.
//     const docRef = await addDoc(collection(db, "verification_queues"), {
//       userId,
//       fileName: file.name,
//       fileUrl: fileUrl,       // Critical: Admin needs this to download
//       status: "PENDING",
//       type: "DOCUMENT",
//       submittedAt: Timestamp.now(),
//     });

//     return { requestId: docRef.id };
//   },

//   // Used for manual requests
//   submitManualRequest: async (details: any, userId: string) => {
//     const docRef = await addDoc(collection(db, "verification_queues"), {
//       userId,
//       details,
//       status: "PENDING",
//       type: "MANUAL",
//       submittedAt: Timestamp.now(),
//     });
//     return { requestId: docRef.id };
//   },

//   // Used by User Dashboard to see their own history
//   getUserRequests: async (userId: string) => {
//     if (!userId) return [];
//     const q = query(
//       collection(db, "verification_queues"),
//       where("userId", "==", userId),
//       orderBy("submittedAt", "desc")
//     );
//     const snapshot = await getDocs(q);
//     return snapshot.docs.map((doc) => ({
//       id: doc.id,
//       ...doc.data(),
//       submittedAt: doc.data().submittedAt?.toDate?.()?.toLocaleString() || "",
//     } as VerificationRequest));
//   },

//   // --- B. Admin/Organization Dashboard (View & Approve) ---

//   // Fetch PENDING items for the Dashboard
//   getPendingVerifications: async () => {
//     try {
//       const q = query(
//         collection(db, "verification_queues"),
//         where("status", "==", "PENDING") 
//         // ⚠️ REMOVED: where("organisationId", "==", currentOrgId)
//         // Now it fetches ALL pending docs for ANY organization to see.
//       );
      
//       const snapshot = await getDocs(q);
//       return snapshot.docs.map(doc => ({
//         id: doc.id,
//         ...doc.data()
//       })); 
//     } catch (error) {
//       console.error("Error fetching queue:", error);
//       return [];
//     }
//   },

//   // Fetch HISTORY (Approved/Rejected)
//   getVerificationHistory: async () => {
//     try {
//       const q = query(
//         collection(db, "verification_queues"), // ✅ Standardized Name
//         where("status", "in", ["APPROVED", "REJECTED"])
//       );
//       const snapshot = await getDocs(q);
//       return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })); 
//     } catch (error) {
//       console.error("Error fetching history:", error);
//       return [];
//     }
//   },

//   // --- C. Approval Action (Python Trigger) ---
  
//   processAndApproveDocument: async (pdfUrl: string, docId: string) => {
//     try {
//       console.log("Approving document:", docId);

//       // 1. Trigger Python Backend (Extract & Save to Mongo)
//       const response = await fetch("http://127.0.0.1:8000/approve-document", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ pdf_url: pdfUrl }),
//       });

//       if (!response.ok) {
//         const errText = await response.text();
//         throw new Error(`Extraction Failed: ${errText}`);
//       }

//       const result = await response.json();

//       // 2. Update Firestore Status to APPROVED
//       const docRef = doc(db, "verification_queues", docId); // ✅ Standardized Name
//       await updateDoc(docRef, { 
//         status: "APPROVED",
//         processedAt: Timestamp.now(),
//         mongoId: result.mongo_id 
//       });

//       return true;
//     } catch (error) {
//       console.error("Approval Error:", error);
//       throw error;
//     }
//   },
// };

import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  setDoc,
  Timestamp,
  orderBy,
  deleteDoc,
} from "firebase/firestore";

import * as firebaseAuth from "firebase/auth";
import { db, auth, googleProvider } from "../firebaseConfig";
// storage is no longer needed for these uploads, but kept to avoid breaking other imports
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; 
import { UserRole, Institution, VerificationRequest, Organisation } from "../types";
import { MONTHLY_STATS } from "../constants";

// ---------------------------------------------
// EXTENDED TYPES
// ---------------------------------------------

export interface FixedInstitution extends Institution {
  logo?: string;
}

// ---------------------------------------------
// OTP STATE
// ---------------------------------------------
let confirmationResult: firebaseAuth.ConfirmationResult | null = null;

// ---------------------------------------------
// API OBJECT
// ---------------------------------------------
export const api = {

  // =================================================================
  // 1. AUTHENTICATION & USER MANAGEMENT
  // =================================================================

  loginGoogle: async () => {
    try {
      const result = await firebaseAuth.signInWithPopup(auth, googleProvider);
      const user = result.user;
      const userRef = doc(db, "users", user.uid);

      await setDoc(
        userRef,
        {
          name: user.displayName,
          email: user.email,
          role: UserRole.USER,
          lastLogin: Timestamp.now(),
        },
        { merge: true }
      );

      return {
        name: user.displayName || "User",
        email: user.email,
        role: UserRole.USER,
        token: await user.getIdToken(),
        avatar: user.photoURL,
        uid: user.uid,
      };
    } catch (error) {
      console.error("Google Auth Error:", error);
      throw error;
    }
  },

  sendOtp: async (phoneNumber: string, recaptchaDivId: string) => {
    try {
      const recaptchaVerifier = new firebaseAuth.RecaptchaVerifier(
        auth,
        recaptchaDivId,
        { size: "invisible" }
      );

      confirmationResult = await firebaseAuth.signInWithPhoneNumber(
        auth,
        phoneNumber,
        recaptchaVerifier
      );
      return true;
    } catch (error: any) {
      console.error("OTP Send Error:", error);
      throw new Error(error.message || "Failed to send OTP");
    }
  },

  verifyOtp: async (otp: string) => {
    if (!confirmationResult) throw new Error("OTP was not sent or expired.");

    try {
      const result = await confirmationResult.confirm(otp);
      const user = result.user;
      const userRef = doc(db, "users", user.uid);

      await setDoc(
        userRef,
        {
          mobile: user.phoneNumber,
          role: UserRole.USER,
          lastLogin: Timestamp.now(),
        },
        { merge: true }
      );

      return {
        name: "Citizen User",
        mobile: user.phoneNumber,
        role: UserRole.USER,
        token: await user.getIdToken(),
        uid: user.uid,
      };
    } catch (error: any) {
      throw new Error("Invalid OTP");
    }
  },

  loginAdmin: async (email: string, pass: string) => {
    try {
      const result = await firebaseAuth.signInWithEmailAndPassword(auth, email.trim(), pass);
      const allowedAdmins = ["jk@gov.in"]; 
      if (!allowedAdmins.includes(result.user.email || "")) {
          await firebaseAuth.signOut(auth);
          throw new Error("Access Denied: You are not an Administrator.");
      }

      return {
        name: "System Admin",
        role: UserRole.ADMIN,
        token: await result.user.getIdToken(),
        uid: result.user.uid,
      };
    } catch (error: any) {
      console.error("Admin Login Error:", error);
      throw new Error(error.message || "Admin login failed");
    }
  },

  loginInstitution: async (email: string, pass: string) => {
    try {
      const result = await firebaseAuth.signInWithEmailAndPassword(auth, email, pass);
      const q = query(collection(db, "institutions"), where("contactEmail", "==", email));
      const snapshot = await getDocs(q);

      if (snapshot.empty) throw new Error("Institution not registered.");
      const instData = snapshot.docs[0].data() as FixedInstitution;

      if (instData.status === "PENDING") throw new Error("Your account is pending approval.");
      if (instData.status === "REJECTED") throw new Error("Your account request was rejected.");

      return {
        name: instData.name,
        role: UserRole.INSTITUTION,
        id: snapshot.docs[0].id,
        token: await result.user.getIdToken(),
        uid: result.user.uid,
      };
    } catch (error: any) {
      throw new Error(error.message || "Institution login failed");
    }
  },

  loginOrganisation: async (email: string, pass: string) => {
    try {
      const result = await firebaseAuth.signInWithEmailAndPassword(auth, email, pass);
      const q = query(collection(db, "organisations"), where("email", "==", email));
      const snapshot = await getDocs(q);

      if (snapshot.empty) throw new Error("Organisation not registered.");
      const orgData = snapshot.docs[0].data() as Organisation;

      return {
        name: orgData.name,
        role: UserRole.ORGANISATION,
        id: snapshot.docs[0].id,
        token: await result.user.getIdToken(),
        uid: result.user.uid,
      };
    } catch (error: any) {
      throw new Error(error.message || "Organisation login failed");
    }
  },

  logout: async () => {
    await firebaseAuth.signOut(auth);
  },

  // =================================================================
  // 2. REGISTRATION
  // =================================================================

  registerInstitution: async (data: any) => {
    try {
      const userCredential = await firebaseAuth.createUserWithEmailAndPassword(
        auth,
        data.contactEmail,
        data.password
      );
      const newInst = {
        name: data.name,
        code: data.code,
        type: data.type,
        address: data.address,
        district: data.district,
        principalName: data.principalName,
        contactEmail: data.contactEmail,
        mobile: data.mobile,
        status: "PENDING",
        uid: userCredential.user.uid,
        createdAt: Timestamp.now(),
      };
      await addDoc(collection(db, "institutions"), newInst);
      return true;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  registerOrganisation: async (data: any) => {
    try {
      const userCredential = await firebaseAuth.createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      const newOrg = {
        name: data.organisationName,
        contactName: data.contactName,
        mobileNo: data.mobileNo,
        email: data.email,
        status: "PENDING",
        uid: userCredential.user.uid,
        createdAt: Timestamp.now(),
      };
      await addDoc(collection(db, "organisations"), newOrg);
      await firebaseAuth.signOut(auth);
      return true;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  // =================================================================
  // 3. INSTITUTION & ORGANISATION MANAGEMENT
  // =================================================================

  getAllInstitutions: async () => {
    const snapshot = await getDocs(collection(db, "institutions"));
    return snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as FixedInstitution[];
  },

  updateInstitutionStatus: async (id: string, status: "ACTIVE" | "REJECTED") => {
    try {
      if (status === "REJECTED") {
        await deleteDoc(doc(db, "institutions", id));
      } else {
        await updateDoc(doc(db, "institutions", id), { status });
      }
      return true;
    } catch (error) {
      console.error("Error updating status:", error);
      throw error;
    }
  },

  deleteInstitution: async (id: string) => {
    try {
      await deleteDoc(doc(db, "institutions", id));
      return true;
    } catch (error: any) {
      throw new Error(error.message || "Failed to delete institution.");
    }
  },

  getAllOrganisations: async () => {
    const snapshot = await getDocs(collection(db, "organisations"));
    return snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as Organisation[];
  },

  updateOrganisationStatus: async (id: string, status: "ACTIVE" | "REJECTED") => {
    try {
      if (status === "REJECTED") {
        await deleteDoc(doc(db, "organisations", id));
      } else {
        await updateDoc(doc(db, "organisations", id), { status });
      }
      return true;
    } catch (error) {
      console.error("Error updating organisation status:", error);
      throw error;
    }
  },

  getAdminStats: async () => {
    return MONTHLY_STATS;
  },

  // =================================================================
  // 4. DOCUMENT VERIFICATION & UPLOADS (PYTHON LOCAL STORAGE)
  // =================================================================

  // --- A. Upload Document (Institution Side) ---
  uploadOrganisationDocument: async (formData: FormData) => {
    const uploaderId = auth.currentUser?.uid || "unknown";

    console.log("🚀 Uploading to Python Backend...");
    
    // 1. Send file to Python Backend (Localhost)
    // Note: formData already contains "file" field from the component
    const response = await fetch("http://127.0.0.1:8000/uploadFile/", {
      method: "POST",
      body: formData, 
    });

    if (!response.ok) {
      throw new Error(`Backend upload failed: ${response.statusText}`);
    }

    const result = await response.json();
    // Use the filename returned by server to ensure consistency
    const fileName = result.filename;

    // 2. Construct the Local URL
    // This allows the Admin to view the file by clicking the link on localhost
    const fileUrl = `http://127.0.0.1:8000/uploads/${fileName}`;

    console.log("✅ File saved locally at:", fileUrl);

    // 3. Add to Global Queue in Firestore
    const docRef = await addDoc(collection(db, "verification_queues"), {
      fileName: fileName,
      fileUrl: fileUrl, 
      userId: uploaderId,
      status: "PENDING",
      type: "DOCUMENT",
      submittedAt: Timestamp.now(),
      organisationId: formData.get("organisationId") || "GLOBAL"
    });

    return { id: docRef.id };
  },

  // --- B. User Verification Request (Citizen Side) ---
  submitVerificationRequest: async (file: File, userId: string) => {
    if (!file) throw new Error("File missing");

    // 1. Create FormData for Python backend
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("http://127.0.0.1:8000/uploadFile/", {
      method: "POST",
      body: formData, 
    });

    if (!response.ok) throw new Error("Backend upload failed");

    const result = await response.json();
    const fileName = result.filename;
    const fileUrl = `http://127.0.0.1:8000/uploads/${fileName}`;

    // 2. Add to Queue
    const docRef = await addDoc(collection(db, "verification_queues"), {
      userId,
      fileName: fileName,
      fileUrl: fileUrl,
      status: "PENDING",
      type: "DOCUMENT",
      submittedAt: Timestamp.now(),
    });

    return { requestId: docRef.id };
  },

  submitManualRequest: async (details: any, userId: string) => {
    const docRef = await addDoc(collection(db, "verification_queues"), {
      userId,
      details,
      status: "PENDING",
      type: "MANUAL",
      submittedAt: Timestamp.now(),
    });
    return { requestId: docRef.id };
  },

  getUserRequests: async (userId: string) => {
    if (!userId) return [];
    const q = query(
      collection(db, "verification_queues"),
      where("userId", "==", userId),
      orderBy("submittedAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      submittedAt: doc.data().submittedAt?.toDate?.()?.toLocaleString() || "",
    } as VerificationRequest));
  },

  // --- C. Admin/Organization Dashboard ---

  getPendingVerifications: async () => {
    try {
      const q = query(
        collection(db, "verification_queues"),
        where("status", "==", "PENDING")
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })); 
    } catch (error) {
      console.error("Error fetching queue:", error);
      return [];
    }
  },

  getVerificationHistory: async () => {
    try {
      const q = query(
        collection(db, "verification_queues"),
        where("status", "in", ["APPROVED", "REJECTED"])
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })); 
    } catch (error) {
      console.error("Error fetching history:", error);
      return [];
    }
  },

  // --- D. Approval Action ---
  
  processAndApproveDocument: async (pdfUrl: string, docId: string) => {
    try {
      console.log("Approving document:", docId);

      // 1. Trigger Python Backend (Extract & Save to Mongo)
      const response = await fetch("http://127.0.0.1:8000/approve-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pdf_url: pdfUrl }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Extraction Failed: ${errText}`);
      }

      const result = await response.json();

      // 2. Update Firestore Status to APPROVED
      const docRef = doc(db, "verification_queues", docId);
      await updateDoc(docRef, { 
        status: "APPROVED",
        processedAt: Timestamp.now(),
        mongoId: result.mongo_id 
      });

      return true;
    } catch (error) {
      console.error("Approval Error:", error);
      throw error;
    }
  },
};