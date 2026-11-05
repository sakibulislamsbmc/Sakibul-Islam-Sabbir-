import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { doc, getDocFromServer, getFirestore } from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null,
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

async function testConnection() {
  if (typeof window === "undefined") return;
  try {
    await getDocFromServer(doc(db, "test", "connection"));
  } catch (error) {
    if (error instanceof Error && error.message.includes("the client is offline")) {
      console.error("Please check your Firebase configuration.");
    }
  }
}

if (typeof window !== "undefined") {
  void testConnection();
}

export async function signInWithGoogle() {
  return signInWithPopup(auth, googleProvider);
}

export async function logOutUser() {
  return signOut(auth);
}

export const BILLING_METHODS = [
  "bKash",
  "Nagad",
  "Dutch-Bangla Bank",
  "Visa / Mastercard",
  "PayPal",
  "Wire Transfer",
] as const;

export type BillingMethod = (typeof BILLING_METHODS)[number];

export const SERVICE_CATEGORIES = [
  "Web Development",
  "App Development",
  "Graphic & Brand Design",
  "Video Editing & Motion",
  "Digital Media & Growth",
] as const;

export type ServiceCategory = (typeof SERVICE_CATEGORIES)[number];

export const PACKAGE_TIERS = ["Starter", "Professional", "Enterprise", "Custom"] as const;
export type PackageTier = (typeof PACKAGE_TIERS)[number];

export const BILLING_STATUSES = ["Paid", "Pending Verification", "Installment (50% Paid)"] as const;
export type BillingStatus = (typeof BILLING_STATUSES)[number];

export const PROJECT_STATUSES = ["In Progress", "In Review", "Completed", "Cancelled"] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const VALIDATION_LIMITS = {
  UID_REGEX: /^[a-zA-Z0-9_-]+$/,
  ORDER_NUMBER_REGEX: /^[A-Z0-9-]+$/,
  DISPLAY_NAME_MAX: 100,
  EMAIL_MAX: 150,
  PHOTO_URL_MAX: 500,
  PHONE_MAX: 40,
  COMPANY_MAX: 100,
  ROLE_TITLE_MAX: 100,
  LOCATION_MAX: 120,
  BILLING_DETAILS_MAX: 120,
  BIO_MAX: 500,
  PROJECT_TITLE_MAX: 120,
  BILLING_REFERENCE_MAX: 80,
  ORDER_DATE_MAX: 32,
  DELIVERY_ESTIMATE_MAX: 60,
  PROJECT_NOTES_MAX: 1000,
  AMOUNT_MAX: 1000000,
} as const;

export interface UserProfileRecord {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  phone: string;
  company: string;
  roleTitle: string;
  location: string;
  preferredBillingMethod: BillingMethod;
  billingDetails: string;
  bio: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface ProjectOrderRecord {
  id: string;
  uid: string;
  orderNumber: string;
  projectTitle: string;
  serviceCategory: ServiceCategory;
  packageTier: PackageTier;
  amountUsd: number;
  billingMethod: BillingMethod;
  billingReference: string;
  billingStatus: BillingStatus;
  projectStatus: ProjectStatus;
  orderDate: string;
  deliveryEstimate: string;
  projectNotes: string;
  clientName: string;
  clientEmail: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export function truncateString(val: string, maxLen: number): string {
  return (val || "").trim().slice(0, maxLen);
}
