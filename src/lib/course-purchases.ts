import type { User } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import {
  type CoursePaymentMethod,
  type CoursePurchaseRecord,
  type CourseType,
  db,
  handleFirestoreError,
  OperationType,
  truncateString,
  type UserProfileRecord,
  VALIDATION_LIMITS,
} from "./firebase";

export function buildPurchaseDocId(uid: string, courseId: string): string {
  const cleanUid = uid.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 64);
  const cleanCourse = courseId.replace(/[^a-z0-9-]/g, "").slice(0, 56);
  return `${cleanUid}_${cleanCourse}`;
}

export async function ensureUserProfileDocument(user: User): Promise<void> {
  const path = `users/${user.uid}`;
  const userRef = doc(db, "users", user.uid);
  try {
    const snap = await getDoc(userRef);
    if (snap.exists()) return;

    const initialProfile: UserProfileRecord = {
      uid: truncateString(user.uid, 128),
      displayName: truncateString(
        user.displayName || user.email?.split("@")[0] || "Student",
        VALIDATION_LIMITS.DISPLAY_NAME_MAX,
      ),
      email: truncateString(user.email || "student@example.com", VALIDATION_LIMITS.EMAIL_MAX),
      photoURL: truncateString(user.photoURL || "", VALIDATION_LIMITS.PHOTO_URL_MAX),
      phone: "",
      company: "Student / Learner",
      roleTitle: "Course Learner",
      location: "Bangladesh",
      preferredBillingMethod: "bKash",
      billingDetails: "",
      bio: "Enrolled in Bismahsoft Academy & Sakibul Islam Sabbir courses.",
    };

    await setDoc(userRef, {
      ...initialProfile,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export interface SubmitPaidCourseEnrollmentParams {
  user: User;
  courseId: string;
  courseTitle: string;
  courseRoute: string;
  amountBdt: number;
  totalLessonsCount: number;
  paymentMethod: CoursePaymentMethod;
  paymentReference: string;
  studentPhone: string;
  studentName?: string;
}

export async function submitPaidCourseEnrollment(
  params: SubmitPaidCourseEnrollmentParams,
): Promise<CoursePurchaseRecord> {
  const { user } = params;
  const purchaseId = buildPurchaseDocId(user.uid, params.courseId);
  const path = `coursePurchases/${purchaseId}`;

  await ensureUserProfileDocument(user);

  const todayIso = new Date().toISOString().slice(0, 10);
  const payload = {
    uid: truncateString(user.uid, 128),
    courseId: truncateString(params.courseId, 80),
    courseTitle: truncateString(params.courseTitle, VALIDATION_LIMITS.COURSE_TITLE_MAX),
    courseRoute: truncateString(params.courseRoute, VALIDATION_LIMITS.COURSE_ROUTE_MAX),
    courseType: "Paid Course" as CourseType,
    amountBdt: params.amountBdt,
    paymentMethod: params.paymentMethod,
    paymentReference: truncateString(
      params.paymentReference,
      VALIDATION_LIMITS.PAYMENT_REFERENCE_MAX,
    ),
    paymentStatus: "Pending Verification" as const,
    studentName: truncateString(
      params.studentName || user.displayName || user.email?.split("@")[0] || "Student",
      VALIDATION_LIMITS.DISPLAY_NAME_MAX,
    ),
    studentEmail: truncateString(user.email || "student@example.com", VALIDATION_LIMITS.EMAIL_MAX),
    studentPhone: truncateString(params.studentPhone, VALIDATION_LIMITS.PHONE_MAX),
    completedLessonIds: [] as string[],
    completedLessonsCount: 0,
    totalLessonsCount: params.totalLessonsCount,
    progressPct: 0,
    averageQuizScore: 0,
    lastActiveLessonTitle: "Awaiting Payment Verification",
    verifiedByEmail: "",
    adminNote: "",
    purchaseDate: todayIso,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    const existingSnap = await getDoc(doc(db, "coursePurchases", purchaseId));
    if (existingSnap.exists()) {
      const existingData = existingSnap.data() as CoursePurchaseRecord;
      if (existingData.paymentStatus === "Rejected") {
        await updateDoc(doc(db, "coursePurchases", purchaseId), {
          paymentMethod: payload.paymentMethod,
          paymentReference: payload.paymentReference,
          studentPhone: payload.studentPhone,
          paymentStatus: "Pending Verification",
          adminNote: "",
          updatedAt: serverTimestamp(),
        });
        return {
          ...existingData,
          id: purchaseId,
          paymentMethod: payload.paymentMethod,
          paymentReference: payload.paymentReference,
          studentPhone: payload.studentPhone,
          paymentStatus: "Pending Verification",
          adminNote: "",
        };
      }
      return { ...existingData, id: purchaseId };
    }

    await setDoc(doc(db, "coursePurchases", purchaseId), payload);
    return { id: purchaseId, ...payload };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export interface SyncCourseProgressParams {
  user: User;
  courseId: string;
  courseTitle: string;
  courseRoute: string;
  courseType: CourseType;
  totalLessonsCount: number;
  completedLessonIds: string[];
  averageQuizScore: number;
  lastActiveLessonTitle: string;
}

export async function syncVerifiedCourseProgress(params: SyncCourseProgressParams): Promise<void> {
  const { user } = params;
  const purchaseId = buildPurchaseDocId(user.uid, params.courseId);
  const path = `coursePurchases/${purchaseId}`;
  const docRef = doc(db, "coursePurchases", purchaseId);

  const boundedCompleted = params.completedLessonIds.slice(
    0,
    VALIDATION_LIMITS.COMPLETED_LESSONS_MAX,
  );
  const completedCount = boundedCompleted.length;
  const progressPct = Math.min(
    100,
    Math.max(0, Math.round((completedCount / Math.max(1, params.totalLessonsCount)) * 100)),
  );
  const clampedAvg = Math.min(100, Math.max(0, Math.round(params.averageQuizScore)));
  const safeLastTitle = truncateString(
    params.lastActiveLessonTitle,
    VALIDATION_LIMITS.LAST_LESSON_TITLE_MAX,
  );

  try {
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      if (params.courseType !== "Free Course") return;
      await ensureUserProfileDocument(user);
      const todayIso = new Date().toISOString().slice(0, 10);
      await setDoc(docRef, {
        uid: truncateString(user.uid, 128),
        courseId: truncateString(params.courseId, 80),
        courseTitle: truncateString(params.courseTitle, VALIDATION_LIMITS.COURSE_TITLE_MAX),
        courseRoute: truncateString(params.courseRoute, VALIDATION_LIMITS.COURSE_ROUTE_MAX),
        courseType: "Free Course",
        amountBdt: 0,
        paymentMethod: "Free Enrollment",
        paymentReference: "Free Course Access (Google Verified)",
        paymentStatus: "Verified",
        studentName: truncateString(
          user.displayName || user.email?.split("@")[0] || "Student",
          VALIDATION_LIMITS.DISPLAY_NAME_MAX,
        ),
        studentEmail: truncateString(
          user.email || "student@example.com",
          VALIDATION_LIMITS.EMAIL_MAX,
        ),
        studentPhone: "",
        completedLessonIds: boundedCompleted,
        completedLessonsCount: completedCount,
        totalLessonsCount: params.totalLessonsCount,
        progressPct,
        averageQuizScore: clampedAvg,
        lastActiveLessonTitle: safeLastTitle,
        verifiedByEmail: "",
        adminNote: "",
        purchaseDate: todayIso,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return;
    }

    const current = snap.data() as CoursePurchaseRecord;
    if (current.paymentStatus !== "Verified") return;

    await updateDoc(docRef, {
      completedLessonIds: boundedCompleted,
      completedLessonsCount: completedCount,
      progressPct,
      averageQuizScore: clampedAvg,
      lastActiveLessonTitle: safeLastTitle,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function adminUpdateCourseVerification(params: {
  purchaseId: string;
  adminEmail: string;
  nextStatus: "Verified" | "Rejected" | "Pending Verification";
  adminNote: string;
}): Promise<void> {
  const path = `coursePurchases/${params.purchaseId}`;
  try {
    await updateDoc(doc(db, "coursePurchases", params.purchaseId), {
      paymentStatus: params.nextStatus,
      verifiedByEmail: truncateString(params.adminEmail, VALIDATION_LIMITS.EMAIL_MAX),
      adminNote: truncateString(params.adminNote, VALIDATION_LIMITS.ADMIN_NOTE_MAX),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}
