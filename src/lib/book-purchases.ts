import { type User } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";

import {
  db,
  handleFirestoreError,
  isPrimaryAdminUser,
  OperationType,
  truncateString,
  VALIDATION_LIMITS,
  type BillingMethod,
  type BookPaymentStatus,
} from "./firebase";
import { ensureUserProfileDocument } from "./course-purchases";
import type { BookItem } from "../data/books-data";

export function buildBookPurchaseDocId(uid: string, bookId: string): string {
  return `${uid}_${bookId}`;
}

export async function submitPaidBookOrder(
  user: User,
  book: BookItem,
  payload: {
    buyerName: string;
    buyerPhone: string;
    paymentMethod: BillingMethod;
    paymentReference: string;
  },
): Promise<{ purchaseId: string; status: BookPaymentStatus }> {
  if (!user.email || !user.emailVerified) {
    throw new Error("বই অর্ডার করার জন্য ভেরিফায়েড গুগল অ্যাকাউন্ট দিয়ে লগইন করুন।");
  }
  if (book.accessType !== "paid" || book.priceBdt < 50) {
    throw new Error("এই বইটি ফ্রি — কোনো পেমেন্ট ছাড়াই সরাসরি পড়তে পারবেন।");
  }

  await ensureUserProfileDocument(user);

  const purchaseId = buildBookPurchaseDocId(user.uid, book.id);
  const purchaseRef = doc(db, "bookPurchases", purchaseId);
  const existingSnap = await getDoc(purchaseRef);

  const cleanPhone = truncateString(payload.buyerPhone, VALIDATION_LIMITS.PHONE_MAX);
  const cleanReference = truncateString(
    payload.paymentReference,
    VALIDATION_LIMITS.PAYMENT_REFERENCE_MAX,
  );
  const cleanName = truncateString(
    payload.buyerName || user.displayName || user.email.split("@")[0] || "Reader",
    VALIDATION_LIMITS.DISPLAY_NAME_MAX,
  );

  if (cleanPhone.length < 5) {
    throw new Error("অনুগ্রহ করে আপনার সঠিক মোবাইল বা WhatsApp নম্বর দিন।");
  }
  if (cleanReference.length < 3) {
    throw new Error("অনুগ্রহ করে সঠিক Transaction ID (TrxID) লিখুন।");
  }

  if (existingSnap.exists()) {
    const existingData = existingSnap.data();
    const existingStatus = existingData.paymentStatus as BookPaymentStatus;
    if (existingStatus === "Verified") {
      return { purchaseId, status: "Verified" };
    }
    if (existingStatus === "Pending Verification") {
      return { purchaseId, status: "Pending Verification" };
    }
    if (existingStatus === "Rejected") {
      try {
        await updateDoc(purchaseRef, {
          paymentMethod: payload.paymentMethod,
          paymentReference: cleanReference,
          buyerPhone: cleanPhone,
          paymentStatus: "Pending Verification",
          adminNote: "",
          updatedAt: serverTimestamp(),
        });
        return { purchaseId, status: "Pending Verification" };
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `bookPurchases/${purchaseId}`);
      }
    }
  }

  const todayIso = new Date().toISOString().slice(0, 10);

  try {
    await setDoc(purchaseRef, {
      uid: user.uid,
      bookId: book.id,
      bookTitle: truncateString(book.title, VALIDATION_LIMITS.BOOK_TITLE_MAX),
      amountBdt: book.priceBdt,
      paymentMethod: payload.paymentMethod,
      paymentReference: cleanReference,
      paymentStatus: "Pending Verification",
      buyerName: cleanName,
      buyerEmail: truncateString(user.email, VALIDATION_LIMITS.EMAIL_MAX),
      buyerPhone: cleanPhone,
      verifiedByEmail: "",
      adminNote: "",
      purchaseDate: todayIso,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { purchaseId, status: "Pending Verification" };
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `bookPurchases/${purchaseId}`);
  }
}

export async function adminUpdateBookVerification(
  adminUser: User,
  purchaseId: string,
  nextStatus: "Verified" | "Rejected",
  adminNote?: string,
): Promise<void> {
  if (!isPrimaryAdminUser(adminUser) || !adminUser.email) {
    throw new Error("Unauthorized: Only the primary verified admin can verify paid book orders.");
  }

  const purchaseRef = doc(db, "bookPurchases", purchaseId);
  try {
    await updateDoc(purchaseRef, {
      paymentStatus: nextStatus,
      verifiedByEmail: truncateString(adminUser.email, VALIDATION_LIMITS.EMAIL_MAX),
      adminNote: truncateString(
        adminNote ||
          (nextStatus === "Verified"
            ? "Payment verified by primary admin. Full PDF book unlocked."
            : "Transaction ID mismatch. Please resubmit valid TrxID."),
        VALIDATION_LIMITS.ADMIN_NOTE_MAX,
      ),
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `bookPurchases/${purchaseId}`);
  }
}
