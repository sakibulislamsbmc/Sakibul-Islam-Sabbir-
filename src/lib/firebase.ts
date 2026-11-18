import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
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

export async function signInWithAdminEmailPassword(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
}

export async function signInAdminWithGoogle() {
  const adminProvider = new GoogleAuthProvider();
  adminProvider.setCustomParameters({
    login_hint: PRIMARY_ADMIN_EMAIL,
    prompt: "select_account",
  });
  return signInWithPopup(auth, adminProvider);
}

export async function sendAdminVerificationEmail(user: User) {
  return sendEmailVerification(user);
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

export const BILLING_STATUSES = [
  "Pending Verification",
  "Approved",
  "Paid",
  "Installment (50% Paid)",
  "Rejected",
] as const;
export type BillingStatus = (typeof BILLING_STATUSES)[number];

export const PROJECT_STATUSES = [
  "Pending Verification",
  "Approved",
  "In Progress",
  "In Review",
  "Completed",
  "Rejected",
  "Cancelled",
] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const APPLICATION_CATEGORIES = [
  "AI Workshop 2027 Seat",
  "1-on-1 Mentorship / Consultation",
  "Custom Graphic / Video Quote",
  "Certificate / Verification Request",
  "Partnership / Collaboration",
  "Other Request",
] as const;
export type ApplicationCategory = (typeof APPLICATION_CATEGORIES)[number];

export const APPLICATION_METHODS = [...BILLING_METHODS, "Free Request"] as const;
export type ApplicationMethod = (typeof APPLICATION_METHODS)[number];

export const APPLICATION_STATUSES = ["Pending Verification", "Approved", "Rejected"] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const PRIMARY_ADMIN_EMAIL = "sakibulislamsbmc@gmail.com" as const;

export const COURSE_ADMIN_EMAILS = [PRIMARY_ADMIN_EMAIL] as const;

export function isCourseAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === PRIMARY_ADMIN_EMAIL;
}

export function isPrimaryAdminUser(
  user?: { email?: string | null; emailVerified?: boolean } | null,
): boolean {
  if (!user?.email || user.emailVerified !== true) return false;
  return user.email.trim().toLowerCase() === PRIMARY_ADMIN_EMAIL;
}

const SAFE_APP_ROUTES = new Set<string>([
  "/",
  "/projects",
  "/portfolio",
  "/about-me",
  "/thankful",
  "/contact",
  "/courses",
  "/graphic-design-course",
  "/workshop",
  "/account",
]);

export function isSafeAppRoute(route?: string | null): boolean {
  if (!route) return false;
  return SAFE_APP_ROUTES.has(route.trim());
}

export const COURSE_PAYMENT_METHODS = [...BILLING_METHODS, "Free Enrollment"] as const;
export type CoursePaymentMethod = (typeof COURSE_PAYMENT_METHODS)[number];

export const COURSE_PAYMENT_STATUSES = ["Pending Verification", "Verified", "Rejected"] as const;
export type CoursePaymentStatus = (typeof COURSE_PAYMENT_STATUSES)[number];

export const COURSE_TYPES = ["Paid Course", "Free Course"] as const;
export type CourseType = (typeof COURSE_TYPES)[number];

export const NOTICE_CATEGORIES = [
  "General",
  "Course Update",
  "Workshop",
  "Offer",
  "Maintenance",
] as const;
export type NoticeCategory = (typeof NOTICE_CATEGORIES)[number];

export const VALIDATION_LIMITS = {
  UID_REGEX: /^[a-zA-Z0-9_-]+$/,
  ORDER_NUMBER_REGEX: /^[A-Z0-9-]+$/,
  COURSE_ID_REGEX: /^[a-z0-9-]+$/,
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
  COMPLETED_DATE_MAX: 32,
  DELIVERY_ESTIMATE_MAX: 60,
  PROJECT_NOTES_MAX: 1000,
  AMOUNT_MAX: 1000000,
  AMOUNT_BDT_MAX: 100000000,
  COURSE_TITLE_MAX: 150,
  COURSE_ROUTE_MAX: 100,
  PAYMENT_REFERENCE_MAX: 100,
  LAST_LESSON_TITLE_MAX: 140,
  ADMIN_NOTE_MAX: 300,
  COMPLETED_LESSONS_MAX: 40,
  NOTICE_TITLE_MAX: 140,
  NOTICE_BODY_MAX: 1500,
  NOTICE_ACTION_LABEL_MAX: 60,
  NOTICE_ACTION_ROUTE_MAX: 120,
  APPLICATION_SUBJECT_MAX: 140,
  APPLICATION_DETAILS_MAX: 1500,
  APPLICATION_REFERENCE_MAX: 100,
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
  amountBdt?: number;
  billingMethod: BillingMethod;
  billingReference: string;
  billingStatus: BillingStatus;
  projectStatus: ProjectStatus;
  verifiedByEmail?: string;
  adminNote?: string;
  orderDate: string;
  completedDate?: string;
  deliveryEstimate: string;
  projectNotes: string;
  clientName: string;
  clientEmail: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface ServiceApplicationRecord {
  id: string;
  uid: string;
  applicationCode: string;
  applicationCategory: ApplicationCategory;
  subject: string;
  details: string;
  preferredMethod: ApplicationMethod;
  referenceCode: string;
  amountBdt: number;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  status: ApplicationStatus;
  verifiedByEmail: string;
  adminNote: string;
  submittedDate: string;
  approvedDate: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface CoursePurchaseRecord {
  id: string;
  uid: string;
  courseId: string;
  courseTitle: string;
  courseRoute: string;
  courseType: CourseType;
  amountBdt: number;
  paymentMethod: CoursePaymentMethod;
  paymentReference: string;
  paymentStatus: CoursePaymentStatus;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  completedLessonIds: string[];
  completedLessonsCount: number;
  totalLessonsCount: number;
  progressPct: number;
  averageQuizScore: number;
  lastActiveLessonTitle: string;
  verifiedByEmail: string;
  adminNote: string;
  purchaseDate: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface WebsiteNoticeRecord {
  id: string;
  title: string;
  category: NoticeCategory;
  body: string;
  actionLabel: string;
  actionRoute: string;
  isPublished: boolean;
  publishedDate: string;
  publishedByEmail: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export function truncateString(val: string, maxLen: number): string {
  return (val || "").trim().slice(0, maxLen);
}
