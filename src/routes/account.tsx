import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import {
  AlertCircle,
  ArrowUpRight,
  Award,
  Bell,
  BookOpen,
  Briefcase,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  CreditCard,
  Download,
  Eye,
  EyeOff,
  FileSpreadsheet,
  FileText,
  Globe2,
  KeyRound,
  Layers,
  Loader2,
  Lock,
  LogOut,
  Mail,
  MapPin,
  Megaphone,
  Menu,
  Phone,
  PlayCircle,
  Plus,
  Receipt,
  Save,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Trash2,
  Unlock,
  User as UserIcon,
  Wallet,
  X,
  XCircle,
} from "lucide-react";
import { MobileBottomNav, MobileHeaderMenu } from "@/components/MobileNavigation";
import { PWAInstallButton } from "@/components/PWAInstallButton";
import { QURAN_COURSE } from "@/data/courses-data";
import { GRAPHIC_DESIGN_COURSE } from "@/data/graphic-design-course-data";
import {
  adminUpdateCourseVerification,
  submitPaidCourseEnrollment,
  syncVerifiedCourseProgress,
} from "@/lib/course-purchases";
import { adminUpdateBookVerification } from "@/lib/book-purchases";
import {
  APPLICATION_CATEGORIES,
  APPLICATION_METHODS,
  type ApplicationCategory,
  type ApplicationMethod,
  auth,
  BILLING_METHODS,
  type BillingMethod,
  type BillingStatus,
  type BookPurchaseRecord,
  type CoursePurchaseRecord,
  db,
  handleFirestoreError,
  isPrimaryAdminUser,
  isSafeAppRoute,
  logOutUser,
  NOTICE_CATEGORIES,
  type NoticeCategory,
  OperationType,
  PACKAGE_TIERS,
  type PackageTier,
  PRIMARY_ADMIN_EMAIL,
  PROJECT_STATUSES,
  type ProjectOrderRecord,
  type ProjectStatus,
  sendAdminVerificationEmail,
  SERVICE_CATEGORIES,
  type ServiceApplicationRecord,
  type ServiceCategory,
  signInAdminWithGoogle,
  signInWithAdminEmailPassword,
  signInWithGoogle,
  truncateString,
  type UserProfileRecord,
  VALIDATION_LIMITS,
  type WebsiteNoticeRecord,
} from "@/lib/firebase";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "Client Account & Orders — Sakibul Islam Sabbir" },
      {
        name: "description",
        content:
          "Sign in with Google to manage your client profile, billing methods, project orders, and downloadable order invoices.",
      },
      { property: "og:title", content: "Client Account & Orders — Sakibul Islam Sabbir" },
      {
        property: "og:description",
        content:
          "Manage your client profile, billing preferences, project orders, and downloadable order receipts.",
      },
    ],
  }),
  component: AccountPage,
});

const NAV = [
  { label: "Home", href: "/" },
  { label: "Projects", href: "/projects" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "About Me", href: "/about-me" },
  { label: "Thankful", href: "/thankful" },
  { label: "Contact", href: "/contact" },
];

function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${year}-${rand}`;
}

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function downloadTextFile(
  filename: string,
  content: string,
  mimeType = "text/plain;charset=utf-8",
) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

const LEGACY_USD_TO_BDT_RATE = 120;

function getOrderAmountBdt(order: ProjectOrderRecord): number {
  if (typeof order.amountBdt === "number" && order.amountBdt > 0) {
    return Math.round(order.amountBdt);
  }
  return Math.round((Number(order.amountUsd) || 0) * LEGACY_USD_TO_BDT_RATE);
}

function getOrderCompletedDate(order: ProjectOrderRecord): string | null {
  if (order.projectStatus !== "Completed") return null;
  return order.completedDate || order.orderDate || null;
}

function buildOrderReceiptText(
  order: ProjectOrderRecord,
  profile: UserProfileRecord | null,
): string {
  const amountBdt = getOrderAmountBdt(order);
  const completedDate = getOrderCompletedDate(order);

  return [
    "================================================================",
    "         SAKIBUL ISLAM SABBIR — OFFICIAL ORDER RECEIPT          ",
    "     Creative Design, Video Production & Web/App Engineering    ",
    "================================================================",
    "",
    `ORDER NUMBER      : ${order.orderNumber}`,
    `ORDER DATE        : ${order.orderDate}`,
    ...(completedDate ? [`COMPLETED DATE    : ${completedDate}`] : []),
    `PROJECT STATUS    : ${order.projectStatus}`,
    `EST. DELIVERY     : ${order.deliveryEstimate}`,
    "",
    "----------------------------------------------------------------",
    "CLIENT INFORMATION",
    "----------------------------------------------------------------",
    `Client Name       : ${order.clientName}`,
    `Client Email      : ${order.clientEmail}`,
    `Company / Org     : ${profile?.company || "Individual Client"}`,
    `Phone / WhatsApp  : ${profile?.phone || "Not specified"}`,
    `Location          : ${profile?.location || "Not specified"}`,
    "",
    "----------------------------------------------------------------",
    "PROJECT & PACKAGE DETAILS",
    "----------------------------------------------------------------",
    `Project Title     : ${order.projectTitle}`,
    `Service Category  : ${order.serviceCategory}`,
    `Package Tier      : ${order.packageTier}`,
    `Project Scope     : ${order.projectNotes || "Standard package deliverables."}`,
    "",
    "----------------------------------------------------------------",
    "BILLING & PAYMENT SUMMARY (BDT)",
    "----------------------------------------------------------------",
    `Billing Method    : ${order.billingMethod}`,
    `Billing Reference : ${order.billingReference}`,
    `Payment Status    : ${order.billingStatus}`,
    ...(completedDate ? [`Completed Date    : ${completedDate}`] : []),
    `Total Amount (BDT): ৳${amountBdt.toLocaleString("en-US")} BDT`,
    "",
    "================================================================",
    "Thank you for collaborating with Sakibul Islam Sabbir.",
    "Contact: sakibulislam.rc@gmail.com | WhatsApp: +880 1410 957 506",
    "================================================================",
  ].join("\n");
}

function escapeHtml(raw: string): string {
  return String(raw || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildOrderInvoiceHtml(
  order: ProjectOrderRecord,
  profile: UserProfileRecord | null,
): string {
  const amountBdt = getOrderAmountBdt(order);
  const completedDate = getOrderCompletedDate(order);

  const safeOrderNumber = escapeHtml(order.orderNumber);
  const safeBillingStatus = escapeHtml(order.billingStatus);
  const safeOrderDate = escapeHtml(order.orderDate);
  const safeCompletedDate = completedDate ? escapeHtml(completedDate) : "";
  const safeClientName = escapeHtml(order.clientName);
  const safeClientEmail = escapeHtml(order.clientEmail);
  const safeCompany = escapeHtml(profile?.company || "Direct Client");
  const safeLocation = escapeHtml(profile?.location || "Bangladesh");
  const safeBillingMethod = escapeHtml(order.billingMethod);
  const safeBillingReference = escapeHtml(order.billingReference);
  const safeProjectStatus = escapeHtml(order.projectStatus);
  const safeDeliveryEstimate = escapeHtml(order.deliveryEstimate);
  const safeProjectTitle = escapeHtml(order.projectTitle);
  const safeProjectNotes = escapeHtml(order.projectNotes || "Full deliverable package");
  const safeServiceCategory = escapeHtml(order.serviceCategory);
  const safePackageTier = escapeHtml(order.packageTier);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Invoice ${safeOrderNumber} — Sakibul Islam Sabbir</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; color: #0f172a; margin: 0; padding: 40px 20px; }
    .card { max-width: 760px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 20px; padding: 40px; box-shadow: 0 20px 50px rgba(15, 23, 42, 0.06); }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid #e2e8f0; padding-bottom: 24px; margin-bottom: 28px; }
    .brand { font-size: 24px; font-weight: 800; letter-spacing: -0.03em; }
    .badge { display: inline-block; background: #0f172a; color: #ffffff; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; padding: 6px 12px; border-radius: 999px; }
    .completed-line { font-size: 12px; font-weight: 700; color: #047857; margin-top: 6px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 28px; }
    .label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.14em; color: #64748b; margin-bottom: 6px; }
    .val { font-size: 14px; font-weight: 600; color: #0f172a; margin: 2px 0; }
    table { width: 100%; border-collapse: collapse; margin: 24px 0; }
    th { text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.12em; color: #64748b; border-bottom: 1px solid #e2e8f0; padding: 12px 8px; }
    td { padding: 16px 8px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
    .total-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 20px; margin-top: 20px; display: flex; justify-content: space-between; align-items: center; gap: 16px; }
    .total-amount { font-size: 26px; font-weight: 800; }
    .footer { margin-top: 32px; font-size: 12px; color: #64748b; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 20px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div>
        <div class="brand">SS. — Sakibul Islam Sabbir</div>
        <div style="font-size: 13px; color: #64748b; margin-top: 4px;">Creative Designer &amp; Digital Media Professional • Rajshahi, Bangladesh</div>
      </div>
      <div style="text-align: right;">
        <span class="badge">${safeBillingStatus}</span>
        ${safeCompletedDate ? `<div class="completed-line">Completed Date: ${safeCompletedDate}</div>` : ""}
        <div style="font-size: 18px; font-weight: 800; margin-top: 8px;">${safeOrderNumber}</div>
        <div style="font-size: 12px; color: #64748b;">Order Date: ${safeOrderDate}</div>
      </div>
    </div>
    <div class="grid">
      <div>
        <div class="label">Billed To</div>
        <div class="val">${safeClientName}</div>
        <div style="font-size: 13px; color: #475569;">${safeClientEmail}</div>
        <div style="font-size: 13px; color: #475569;">${safeCompany} • ${safeLocation}</div>
      </div>
      <div>
        <div class="label">Billing &amp; Delivery Details</div>
        <div class="val">Method: ${safeBillingMethod}</div>
        <div style="font-size: 13px; color: #475569;">Reference: ${safeBillingReference}</div>
        <div style="font-size: 13px; color: #475569;">Project Status: ${safeProjectStatus} (${safeDeliveryEstimate})</div>
        ${safeCompletedDate ? `<div style="font-size: 13px; font-weight: 600; color: #047857; margin-top: 3px;">Completed Date: ${safeCompletedDate}</div>` : ""}
      </div>
    </div>
    <table>
      <thead>
        <tr>
          <th>Project &amp; Scope</th>
          <th>Category</th>
          <th>Package Tier</th>
          <th style="text-align: right;">Amount (BDT)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <div style="font-weight: 700;">${safeProjectTitle}</div>
            <div style="font-size: 12px; color: #64748b; margin-top: 4px;">${safeProjectNotes}</div>
          </td>
          <td>${safeServiceCategory}</td>
          <td>${safePackageTier}</td>
          <td style="text-align: right; font-weight: 700;">৳${amountBdt.toLocaleString("en-US")} BDT</td>
        </tr>
      </tbody>
    </table>
    <div class="total-box">
      <div>
        <div class="label">Payment Method &amp; Verification</div>
        <div class="val">${safeBillingMethod} (${safeBillingReference}) — ${safeBillingStatus}</div>
        ${safeCompletedDate ? `<div class="completed-line">Completed Date: ${safeCompletedDate}</div>` : ""}
      </div>
      <div style="text-align: right;">
        <div class="label">Total Billed (BDT)</div>
        <div class="total-amount">৳${amountBdt.toLocaleString("en-US")} BDT</div>
      </div>
    </div>
    <div class="footer">
      Official Project Order Copy (Bangladeshi Taka • BDT) • Sakibul Islam Sabbir (sakibulislam.rc@gmail.com • +880 1410 957 506)
    </div>
  </div>
</body>
</html>`;
}

function generateApplicationCode(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `APP-${year}-${rand}`;
}

function AccountPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [bannerMessage, setBannerMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Admin Portal Login & Gate State
  const [adminGateVerified, setAdminGateVerified] = useState(false);
  const [adminLoginEmail, setAdminLoginEmail] = useState<string>(PRIMARY_ADMIN_EMAIL);
  const [adminLoginPassword, setAdminLoginPassword] = useState("");
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [adminAuthLoading, setAdminAuthLoading] = useState(false);
  const [adminAuthError, setAdminAuthError] = useState<string | null>(null);
  const [adminNeedsGoogleLink, setAdminNeedsGoogleLink] = useState(false);
  const [adminNeedsEmailVerify, setAdminNeedsEmailVerify] = useState(false);
  const [showAdminLoginModal, setShowAdminLoginModal] = useState(false);

  // User Profile state
  const [profile, setProfile] = useState<UserProfileRecord | null>(null);
  const [profileSaving, setProfileSaving] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [location, setLocation] = useState("");
  const [preferredBillingMethod, setPreferredBillingMethod] = useState<BillingMethod>("bKash");
  const [billingDetails, setBillingDetails] = useState("");
  const [bio, setBio] = useState("");

  // Orders, Course Purchases & Service Applications state
  const [orders, setOrders] = useState<ProjectOrderRecord[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [coursePurchases, setCoursePurchases] = useState<CoursePurchaseRecord[]>([]);
  const [purchasesLoading, setPurchasesLoading] = useState(false);
  const [bookPurchases, setBookPurchases] = useState<BookPurchaseRecord[]>([]);
  const [applications, setApplications] = useState<ServiceApplicationRecord[]>([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);

  // Admin Queues state
  const [adminQueuePurchases, setAdminQueuePurchases] = useState<CoursePurchaseRecord[]>([]);
  const [adminQueueBooks, setAdminQueueBooks] = useState<BookPurchaseRecord[]>([]);
  const [adminQueueOrders, setAdminQueueOrders] = useState<ProjectOrderRecord[]>([]);
  const [adminQueueApplications, setAdminQueueApplications] = useState<ServiceApplicationRecord[]>(
    [],
  );
  const [adminQueueTab, setAdminQueueTab] = useState<
    "orders" | "courses" | "books" | "applications"
  >("orders");
  const [adminNoteDrafts, setAdminNoteDrafts] = useState<Record<string, string>>({});
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  const [dashboardSection, setDashboardSection] = useState<
    "purchases" | "orders" | "applications" | "notices" | "admin"
  >("purchases");
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("All");

  // Quick Paid Course Application Modal inside Account
  const [showCourseApplyModal, setShowCourseApplyModal] = useState(false);
  const [coursePayMethod, setCoursePayMethod] = useState<BillingMethod>("bKash");
  const [coursePayRef, setCoursePayRef] = useState("");
  const [courseStudentPhone, setCourseStudentPhone] = useState("");
  const [courseApplySubmitting, setCourseApplySubmitting] = useState(false);

  // Other / Workshop / Service Application Modal inside Account
  const [showNewAppModal, setShowNewAppModal] = useState(false);
  const [appCategory, setAppCategory] = useState<ApplicationCategory>("AI Workshop 2027 Seat");
  const [appSubject, setAppSubject] = useState("");
  const [appDetails, setAppDetails] = useState("");
  const [appMethod, setAppMethod] = useState<ApplicationMethod>("Free Request");
  const [appRef, setAppRef] = useState("");
  const [appAmountBdt, setAppAmountBdt] = useState("0");
  const [appPhone, setAppPhone] = useState("");
  const [appSubmitting, setAppSubmitting] = useState(false);

  // Website Notices state
  const [notices, setNotices] = useState<WebsiteNoticeRecord[]>([]);
  const [noticesLoading, setNoticesLoading] = useState(false);
  const [noticeSubmitting, setNoticeSubmitting] = useState(false);
  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeCategory, setNoticeCategory] = useState<NoticeCategory>("General");
  const [noticeBody, setNoticeBody] = useState("");
  const [noticeActionLabel, setNoticeActionLabel] = useState("");
  const [noticeActionRoute, setNoticeActionRoute] = useState("/courses");
  const [noticeIsPublished, setNoticeIsPublished] = useState(true);

  // New Order Form state (Bangladeshi Taka - BDT; locked to Pending Verification until Admin approves)
  const [newProjectTitle, setNewProjectTitle] = useState("");
  const [newServiceCategory, setNewServiceCategory] = useState<ServiceCategory>("Web Development");
  const [newPackageTier, setNewPackageTier] = useState<PackageTier>("Professional");
  const [newAmountBdt, setNewAmountBdt] = useState("15000");
  const [newBillingMethod, setNewBillingMethod] = useState<BillingMethod>("bKash");
  const [newBillingReference, setNewBillingReference] = useState("");
  const [newOrderDate, setNewOrderDate] = useState("");
  const [newDeliveryEstimate, setNewDeliveryEstimate] = useState("14 Days");
  const [newProjectNotes, setNewProjectNotes] = useState("");

  const isPrimaryAdmin = isPrimaryAdminUser(user);
  const isAdminUnlocked = isPrimaryAdmin && adminGateVerified;

  useEffect(() => {
    setNewOrderDate((prev) => prev || todayIsoDate());
    fetch("/api/admin/session", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : { authenticated: false }))
      .then((data: { authenticated?: boolean }) => {
        if (data?.authenticated) setAdminGateVerified(true);
      })
      .catch(() => {
        // Ignore network errors on initial check
      });
  }, []);

  useEffect(() => {
    if (!isPrimaryAdmin && dashboardSection === "admin") {
      setDashboardSection("purchases");
    }
  }, [isPrimaryAdmin, dashboardSection]);

  // Track Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setAuthReady(true);

      if (!currentUser) {
        setProfile(null);
        setOrders([]);
        setApplications([]);
        setAdminQueueOrders([]);
        setAdminQueuePurchases([]);
        setAdminQueueApplications([]);
        return;
      }

      if (currentUser.email?.toLowerCase() === PRIMARY_ADMIN_EMAIL && !currentUser.emailVerified) {
        setAdminNeedsEmailVerify(true);
      } else {
        setAdminNeedsEmailVerify(false);
      }

      // Ensure UserProfile exists in Firestore
      const userDocPath = `users/${currentUser.uid}`;
      const userRef = doc(db, "users", currentUser.uid);
      try {
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          const data = snap.data() as UserProfileRecord;
          setProfile(data);
          setDisplayName(data.displayName || currentUser.displayName || "Client");
          setPhone(data.phone || "");
          setCompany(data.company || "");
          setRoleTitle(data.roleTitle || "");
          setLocation(data.location || "");
          setPreferredBillingMethod(data.preferredBillingMethod || "bKash");
          setBillingDetails(data.billingDetails || "");
          setBio(data.bio || "");
          setNewBillingMethod(data.preferredBillingMethod || "bKash");
          setAppPhone(data.phone || "");
          setCourseStudentPhone(data.phone || "");
          if (data.billingDetails) {
            setNewBillingReference(data.billingDetails.slice(0, 80));
          }
        } else {
          const initialProfile: UserProfileRecord = {
            uid: truncateString(currentUser.uid, 128),
            displayName: truncateString(
              currentUser.displayName || currentUser.email?.split("@")[0] || "Valued Client",
              VALIDATION_LIMITS.DISPLAY_NAME_MAX,
            ),
            email: truncateString(
              currentUser.email || "client@example.com",
              VALIDATION_LIMITS.EMAIL_MAX,
            ),
            photoURL: truncateString(currentUser.photoURL || "", VALIDATION_LIMITS.PHOTO_URL_MAX),
            phone: "+880 1410-957506",
            company: "Independent Brand",
            roleTitle: "Project Owner",
            location: "Dhaka, Bangladesh",
            preferredBillingMethod: "bKash",
            billingDetails: "bKash Personal •••• 7506",
            bio: "Collaborating on digital design, video production, and web engineering projects.",
          };

          await setDoc(userRef, {
            ...initialProfile,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });

          setProfile(initialProfile);
          setDisplayName(initialProfile.displayName);
          setPhone(initialProfile.phone);
          setCompany(initialProfile.company);
          setRoleTitle(initialProfile.roleTitle);
          setLocation(initialProfile.location);
          setPreferredBillingMethod(initialProfile.preferredBillingMethod);
          setBillingDetails(initialProfile.billingDetails);
          setBio(initialProfile.bio);
          setNewBillingMethod(initialProfile.preferredBillingMethod);
          setNewBillingReference(initialProfile.billingDetails);
          setAppPhone(initialProfile.phone);
          setCourseStudentPhone(initialProfile.phone);
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, userDocPath);
      }
    });

    return () => unsubscribe();
  }, []);

  // Subscribe to authenticated user's orders (+ all orders for verified primary admin)
  useEffect(() => {
    if (!authReady || !user) return;
    if (!user.emailVerified) {
      setOrders([]);
      setAdminQueueOrders([]);
      return;
    }

    setOrdersLoading(true);
    const ordersPath = "orders";
    const ordersQuery = query(collection(db, "orders"), where("uid", "==", user.uid));

    const unsubscribe = onSnapshot(
      ordersQuery,
      (snapshot) => {
        const list: ProjectOrderRecord[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<ProjectOrderRecord, "id">),
        }));
        list.sort((a, b) => b.orderDate.localeCompare(a.orderDate));
        setOrders(list);
        setOrdersLoading(false);
      },
      (error) => {
        setOrdersLoading(false);
        handleFirestoreError(error, OperationType.LIST, ordersPath);
      },
    );

    let unsubAdminOrders: (() => void) | undefined;
    if (isPrimaryAdminUser(user)) {
      const adminOrdersQuery = query(collection(db, "orders"));
      unsubAdminOrders = onSnapshot(
        adminOrdersQuery,
        (snapshot) => {
          const allOrders: ProjectOrderRecord[] = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...(docSnap.data() as Omit<ProjectOrderRecord, "id">),
          }));
          allOrders.sort((a, b) => {
            if (
              a.projectStatus === "Pending Verification" &&
              b.projectStatus !== "Pending Verification"
            ) {
              return -1;
            }
            if (
              b.projectStatus === "Pending Verification" &&
              a.projectStatus !== "Pending Verification"
            ) {
              return 1;
            }
            return b.orderDate.localeCompare(a.orderDate);
          });
          setAdminQueueOrders(allOrders);
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, ordersPath);
        },
      );
    } else {
      setAdminQueueOrders([]);
    }

    return () => {
      unsubscribe();
      if (unsubAdminOrders) unsubAdminOrders();
    };
  }, [authReady, user]);

  // Subscribe to authenticated user's coursePurchases (+ all queue for verified admin)
  useEffect(() => {
    if (!authReady || !user || !user.emailVerified) {
      setCoursePurchases([]);
      setAdminQueuePurchases([]);
      return;
    }

    setPurchasesLoading(true);
    const purchasesPath = "coursePurchases";
    const userPurchasesQuery = query(
      collection(db, "coursePurchases"),
      where("uid", "==", user.uid),
    );

    const unsubUser = onSnapshot(
      userPurchasesQuery,
      (snapshot) => {
        const list: CoursePurchaseRecord[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<CoursePurchaseRecord, "id">),
        }));
        list.sort((a, b) => b.purchaseDate.localeCompare(a.purchaseDate));
        setCoursePurchases(list);
        setPurchasesLoading(false);
      },
      (error) => {
        setPurchasesLoading(false);
        handleFirestoreError(error, OperationType.LIST, purchasesPath);
      },
    );

    // Sync any local Quran free-course progress into user's account if present
    try {
      const localRaw = window.localStorage.getItem("ss_quran_course_progress_v2");
      if (localRaw && user.emailVerified) {
        const parsed = JSON.parse(localRaw) as {
          watchedIds?: string[];
          quizResults?: Record<string, { score: number; total: number }>;
        };
        const watchedIds = Array.isArray(parsed.watchedIds) ? parsed.watchedIds : [];
        const quizResults = parsed.quizResults || {};
        const completedIds = QURAN_COURSE.lessons
          .filter((l) => watchedIds.includes(l.id) && Boolean(quizResults[l.id]))
          .map((l) => l.id);
        if (completedIds.length > 0 || watchedIds.length > 0) {
          const quizEntries = Object.values(quizResults);
          const avgPct =
            quizEntries.length > 0
              ? quizEntries.reduce((acc, q) => acc + (q.score / Math.max(1, q.total)) * 100, 0) /
                quizEntries.length
              : 0;
          const activeTitle =
            QURAN_COURSE.lessons.find((l) => l.id === watchedIds[watchedIds.length - 1])
              ?.topicTitle || QURAN_COURSE.lessons[0]!.topicTitle;
          void syncVerifiedCourseProgress({
            user,
            courseId: QURAN_COURSE.id,
            courseTitle: QURAN_COURSE.title,
            courseRoute: "/courses",
            courseType: "Free Course",
            totalLessonsCount: QURAN_COURSE.lessons.length,
            completedLessonIds: completedIds,
            averageQuizScore: avgPct,
            lastActiveLessonTitle: activeTitle,
          }).catch(() => {
            // Ignore passive sync issue
          });
        }
      }
    } catch {
      // Ignore storage error
    }

    let unsubAdmin: (() => void) | undefined;
    if (isPrimaryAdminUser(user)) {
      const adminQuery = query(collection(db, "coursePurchases"));
      unsubAdmin = onSnapshot(
        adminQuery,
        (snapshot) => {
          const allList: CoursePurchaseRecord[] = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...(docSnap.data() as Omit<CoursePurchaseRecord, "id">),
          }));
          allList.sort((a, b) => {
            if (
              a.paymentStatus === "Pending Verification" &&
              b.paymentStatus !== "Pending Verification"
            ) {
              return -1;
            }
            if (
              b.paymentStatus === "Pending Verification" &&
              a.paymentStatus !== "Pending Verification"
            ) {
              return 1;
            }
            return b.purchaseDate.localeCompare(a.purchaseDate);
          });
          setAdminQueuePurchases(allList);
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, purchasesPath);
        },
      );
    } else {
      setAdminQueuePurchases([]);
    }

    return () => {
      unsubUser();
      if (unsubAdmin) unsubAdmin();
    };
  }, [authReady, user]);

  // Subscribe to authenticated user's Paid Book Purchases (+ all queue for verified primary admin)
  useEffect(() => {
    if (!authReady || !user || !user.emailVerified) {
      setBookPurchases([]);
      setAdminQueueBooks([]);
      return;
    }

    const userBookQuery = query(collection(db, "bookPurchases"), where("uid", "==", user.uid));
    const unsubUserBooks = onSnapshot(
      userBookQuery,
      (snapshot) => {
        const list: BookPurchaseRecord[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<BookPurchaseRecord, "id">),
        }));
        list.sort((a, b) => b.purchaseDate.localeCompare(a.purchaseDate));
        setBookPurchases(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, "bookPurchases");
      },
    );

    let unsubAdminBooks: (() => void) | undefined;
    if (isPrimaryAdminUser(user)) {
      const adminBookQuery = query(collection(db, "bookPurchases"));
      unsubAdminBooks = onSnapshot(
        adminBookQuery,
        (snapshot) => {
          const allList: BookPurchaseRecord[] = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...(docSnap.data() as Omit<BookPurchaseRecord, "id">),
          }));
          allList.sort((a, b) => {
            if (
              a.paymentStatus === "Pending Verification" &&
              b.paymentStatus !== "Pending Verification"
            ) {
              return -1;
            }
            if (
              b.paymentStatus === "Pending Verification" &&
              a.paymentStatus !== "Pending Verification"
            ) {
              return 1;
            }
            return b.purchaseDate.localeCompare(a.purchaseDate);
          });
          setAdminQueueBooks(allList);
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, "bookPurchases");
        },
      );
    } else {
      setAdminQueueBooks([]);
    }

    return () => {
      unsubUserBooks();
      if (unsubAdminBooks) unsubAdminBooks();
    };
  }, [authReady, user]);

  // Subscribe to authenticated user's Service Applications (+ all applications for primary admin)
  useEffect(() => {
    if (!authReady || !user || !user.emailVerified) {
      setApplications([]);
      setAdminQueueApplications([]);
      return;
    }

    setApplicationsLoading(true);
    const appsPath = "applications";
    const userAppsQuery = query(collection(db, "applications"), where("uid", "==", user.uid));

    const unsubUserApps = onSnapshot(
      userAppsQuery,
      (snapshot) => {
        const list: ServiceApplicationRecord[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<ServiceApplicationRecord, "id">),
        }));
        list.sort((a, b) => b.submittedDate.localeCompare(a.submittedDate));
        setApplications(list);
        setApplicationsLoading(false);
      },
      (error) => {
        setApplicationsLoading(false);
        handleFirestoreError(error, OperationType.LIST, appsPath);
      },
    );

    let unsubAdminApps: (() => void) | undefined;
    if (isPrimaryAdminUser(user)) {
      const adminAppsQuery = query(collection(db, "applications"));
      unsubAdminApps = onSnapshot(
        adminAppsQuery,
        (snapshot) => {
          const allList: ServiceApplicationRecord[] = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...(docSnap.data() as Omit<ServiceApplicationRecord, "id">),
          }));
          allList.sort((a, b) => {
            if (a.status === "Pending Verification" && b.status !== "Pending Verification") {
              return -1;
            }
            if (b.status === "Pending Verification" && a.status !== "Pending Verification") {
              return 1;
            }
            return b.submittedDate.localeCompare(a.submittedDate);
          });
          setAdminQueueApplications(allList);
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, appsPath);
        },
      );
    } else {
      setAdminQueueApplications([]);
    }

    return () => {
      unsubUserApps();
      if (unsubAdminApps) unsubAdminApps();
    };
  }, [authReady, user]);

  // Subscribe to published Website Notices (or all notices for verified primary admin ONLY)
  useEffect(() => {
    if (!authReady || !user || !user.emailVerified) {
      setNotices([]);
      return;
    }

    setNoticesLoading(true);
    const noticesPath = "notices";
    const noticesQuery = isPrimaryAdminUser(user)
      ? query(collection(db, "notices"))
      : query(collection(db, "notices"), where("isPublished", "==", true));

    const unsubscribe = onSnapshot(
      noticesQuery,
      (snapshot) => {
        const list: WebsiteNoticeRecord[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<WebsiteNoticeRecord, "id">),
        }));
        list.sort((a, b) => b.publishedDate.localeCompare(a.publishedDate));
        setNotices(list);
        setNoticesLoading(false);
      },
      (error) => {
        setNoticesLoading(false);
        handleFirestoreError(error, OperationType.LIST, noticesPath);
      },
    );

    return () => unsubscribe();
  }, [authReady, user]);

  const handleGoogleSignIn = async () => {
    setAuthLoading(true);
    setBannerMessage(null);
    try {
      await signInWithGoogle();
      setBannerMessage({
        type: "success",
        text: "Signed in with Google. Your account dashboard is ready.",
      });
    } catch (error) {
      setBannerMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Could not complete Google Sign-In. Please try again.",
      });
    } finally {
      setAuthLoading(false);
    }
  };

  const handleAdminPortalLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminAuthLoading(true);
    setAdminAuthError(null);
    setAdminNeedsGoogleLink(false);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: adminLoginEmail.trim(),
          password: adminLoginPassword,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setAdminAuthError(
          data.error || "ইমেইল অথবা পাসওয়ার্ড সঠিক নয়। শুধুমাত্র প্রাইমারি এডমিন লগইন করতে পারবেন।",
        );
        return;
      }

      setAdminGateVerified(true);

      // Already signed in via Google as verified Primary Admin -> unlock immediately
      if (isPrimaryAdminUser(user)) {
        setAdminLoginPassword("");
        setShowAdminLoginModal(false);
        setDashboardSection("admin");
        setBannerMessage({
          type: "success",
          text: "Admin Portal আনলক হয়েছে! এখন আপনি সব অর্ডার, কোর্স ও আবেদন ম্যানুয়ালি Approve করতে পারবেন।",
        });
        return;
      }

      // Sign into Firebase Auth using Email & Password if enabled
      try {
        const cred = await signInWithAdminEmailPassword(adminLoginEmail, adminLoginPassword);
        setAdminLoginPassword("");
        if (!cred.user.emailVerified) {
          setAdminNeedsEmailVerify(true);
          setAdminAuthError(
            "পাসওয়ার্ড যাচাই হয়েছে, তবে Firebase সিকিউরিটির জন্য আপনার ইমেইল ভেরিফায়েড হতে হবে। নিচের Google Verify বাটনে ক্লিক করে ১ ক্লিকে এডমিন ড্যাশবোর্ডে প্রবেশ করুন।",
          );
          return;
        }
        setShowAdminLoginModal(false);
        setDashboardSection("admin");
        setBannerMessage({
          type: "success",
          text: "Primary Admin লগইন সম্পন্ন হয়েছে! Admin Verification Portal সক্রিয়।",
        });
      } catch {
        // Server password already verified; prompt 1-click Google linkage for Primary Admin Firebase token
        setAdminLoginPassword("");
        setAdminNeedsGoogleLink(true);
      }
    } catch {
      setAdminAuthError("সার্ভারের সাথে সংযোগ করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।");
    } finally {
      setAdminAuthLoading(false);
    }
  };

  const handleCompleteAdminGoogleVerify = async () => {
    setAdminAuthLoading(true);
    setAdminAuthError(null);
    try {
      const cred = await signInAdminWithGoogle();
      if (cred.user.email?.toLowerCase() !== PRIMARY_ADMIN_EMAIL || !cred.user.emailVerified) {
        await logOutUser();
        setAdminAuthError(
          `দয়া করে শুধুমাত্র প্রাইমারি এডমিন ইমেইল (${PRIMARY_ADMIN_EMAIL}) নির্বাচন করে লগইন করুন।`,
        );
        return;
      }
      setAdminNeedsGoogleLink(false);
      setAdminNeedsEmailVerify(false);
      setShowAdminLoginModal(false);
      setDashboardSection("admin");
      setBannerMessage({
        type: "success",
        text: "Primary Admin লগইন সফলভাবে সম্পন্ন হয়েছে! এখন সব পেন্ডিং আবেদন অ্যাপ্রুভ করতে পারবেন।",
      });
    } catch (error) {
      setAdminAuthError(
        error instanceof Error ? error.message : "Google verification সম্পন্ন করা যায়নি।",
      );
    } finally {
      setAdminAuthLoading(false);
    }
  };

  const handleLockAdminPortal = async () => {
    await fetch("/api/admin/logout", { method: "POST", credentials: "include" }).catch(() => {});
    setAdminGateVerified(false);
    if (dashboardSection === "admin") setDashboardSection("purchases");
    setBannerMessage({
      type: "success",
      text: "Admin Portal লক করা হয়েছে।",
    });
  };

  const handleSignOut = async () => {
    await fetch("/api/admin/logout", { method: "POST", credentials: "include" }).catch(() => {});
    setAdminGateVerified(false);
    setAdminNeedsGoogleLink(false);
    setAdminNeedsEmailVerify(false);
    await logOutUser();
    setBannerMessage({
      type: "success",
      text: "You have signed out of your account.",
    });
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setProfileSaving(true);
    setBannerMessage(null);

    const path = `users/${user.uid}`;
    const safeDisplayName = truncateString(
      displayName || user.displayName || "Client",
      VALIDATION_LIMITS.DISPLAY_NAME_MAX,
    );
    const safePhotoURL = truncateString(
      user.photoURL || profile?.photoURL || "",
      VALIDATION_LIMITS.PHOTO_URL_MAX,
    );
    const safePhone = truncateString(phone, VALIDATION_LIMITS.PHONE_MAX);
    const safeCompany = truncateString(company, VALIDATION_LIMITS.COMPANY_MAX);
    const safeRoleTitle = truncateString(roleTitle, VALIDATION_LIMITS.ROLE_TITLE_MAX);
    const safeLocation = truncateString(location, VALIDATION_LIMITS.LOCATION_MAX);
    const safeBillingDetails = truncateString(
      billingDetails,
      VALIDATION_LIMITS.BILLING_DETAILS_MAX,
    );
    const safeBio = truncateString(bio, VALIDATION_LIMITS.BIO_MAX);

    try {
      await updateDoc(doc(db, "users", user.uid), {
        displayName: safeDisplayName,
        photoURL: safePhotoURL,
        phone: safePhone,
        company: safeCompany,
        roleTitle: safeRoleTitle,
        location: safeLocation,
        preferredBillingMethod,
        billingDetails: safeBillingDetails,
        bio: safeBio,
        updatedAt: serverTimestamp(),
      });

      setProfile((prev) =>
        prev
          ? {
              ...prev,
              displayName: safeDisplayName,
              photoURL: safePhotoURL,
              phone: safePhone,
              company: safeCompany,
              roleTitle: safeRoleTitle,
              location: safeLocation,
              preferredBillingMethod,
              billingDetails: safeBillingDetails,
              bio: safeBio,
            }
          : null,
      );
      setBannerMessage({
        type: "success",
        text: "Profile and default billing preferences saved to your account.",
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    } finally {
      setProfileSaving(false);
    }
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setOrderSubmitting(true);
    setBannerMessage(null);

    const orderId = `ord_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const path = `orders/${orderId}`;
    const parsedAmountBdt = Math.min(
      VALIDATION_LIMITS.AMOUNT_BDT_MAX,
      Math.max(100, Math.round(Number(newAmountBdt) || 15000)),
    );
    const equivalentUsd = Math.min(
      VALIDATION_LIMITS.AMOUNT_MAX,
      Math.max(1, Number((parsedAmountBdt / LEGACY_USD_TO_BDT_RATE).toFixed(2))),
    );

    const payload = {
      uid: truncateString(user.uid, 128),
      orderNumber: generateOrderNumber(),
      projectTitle: truncateString(
        newProjectTitle || "Custom Creative & Web Project",
        VALIDATION_LIMITS.PROJECT_TITLE_MAX,
      ),
      serviceCategory: newServiceCategory,
      packageTier: newPackageTier,
      amountUsd: equivalentUsd,
      amountBdt: parsedAmountBdt,
      billingMethod: newBillingMethod,
      billingReference: truncateString(
        newBillingReference || billingDetails || `${newBillingMethod} Reference Submitted`,
        VALIDATION_LIMITS.BILLING_REFERENCE_MAX,
      ),
      billingStatus: "Pending Verification" as BillingStatus,
      projectStatus: "Pending Verification" as ProjectStatus,
      verifiedByEmail: "",
      adminNote: "",
      orderDate: truncateString(newOrderDate || todayIsoDate(), VALIDATION_LIMITS.ORDER_DATE_MAX),
      completedDate: "",
      deliveryEstimate: truncateString(
        newDeliveryEstimate || "14 Days",
        VALIDATION_LIMITS.DELIVERY_ESTIMATE_MAX,
      ),
      projectNotes: truncateString(newProjectNotes, VALIDATION_LIMITS.PROJECT_NOTES_MAX),
      clientName: truncateString(
        displayName || user.displayName || "Valued Client",
        VALIDATION_LIMITS.DISPLAY_NAME_MAX,
      ),
      clientEmail: truncateString(user.email || "client@example.com", VALIDATION_LIMITS.EMAIL_MAX),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    try {
      await setDoc(doc(db, "orders", orderId), payload);
      setNewProjectTitle("");
      setNewProjectNotes("");
      setShowNewOrderModal(false);
      setDashboardSection("orders");
      setBannerMessage({
        type: "success",
        text: `প্রজেক্ট আবেদন ${payload.orderNumber} (৳${parsedAmountBdt.toLocaleString("en-US")} BDT) সফলভাবে জমা হয়েছে! বর্তমানে এটি "Pending Verification" অবস্থায় আছে — অ্যাডমিন ম্যানুয়ালি Approve করলে আপনার ড্যাশবোর্ডে Approved দেখাবে।`,
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    } finally {
      setOrderSubmitting(false);
    }
  };

  const handleSeedSampleOrder = async () => {
    if (!user) return;
    setOrderSubmitting(true);
    setBannerMessage(null);

    const orderId = `ord_sample_${Date.now()}`;
    const path = `orders/${orderId}`;
    const sampleBdt = 50000;
    const payload = {
      uid: truncateString(user.uid, 128),
      orderNumber: generateOrderNumber(),
      projectTitle: "Full-Stack Brand Website & High-Retention Video Reel Suite",
      serviceCategory: "Web Development" as ServiceCategory,
      packageTier: "Enterprise" as PackageTier,
      amountUsd: Math.round(sampleBdt / LEGACY_USD_TO_BDT_RATE),
      amountBdt: sampleBdt,
      billingMethod: preferredBillingMethod || ("Dutch-Bangla Bank" as BillingMethod),
      billingReference: truncateString(
        billingDetails || "DBBL Agent Banking •••• 9506",
        VALIDATION_LIMITS.BILLING_REFERENCE_MAX,
      ),
      billingStatus: "Pending Verification" as BillingStatus,
      projectStatus: "Pending Verification" as ProjectStatus,
      verifiedByEmail: "",
      adminNote: "",
      orderDate: todayIsoDate(),
      completedDate: "",
      deliveryEstimate: "14 Business Days",
      projectNotes:
        "Complete responsive glassmorphic web platform, brand visual system, and 4 vertical short-form promotional video edits.",
      clientName: truncateString(
        displayName || user.displayName || "Valued Client",
        VALIDATION_LIMITS.DISPLAY_NAME_MAX,
      ),
      clientEmail: truncateString(user.email || "client@example.com", VALIDATION_LIMITS.EMAIL_MAX),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    try {
      await setDoc(doc(db, "orders", orderId), payload);
      setBannerMessage({
        type: "success",
        text: `Sample project application (${payload.orderNumber} • ৳${sampleBdt.toLocaleString("en-US")} BDT) submitted as Pending Verification for Admin approval.`,
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    } finally {
      setOrderSubmitting(false);
    }
  };

  const handleCreateCourseApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (coursePayRef.trim().length < 3) {
      setBannerMessage({
        type: "error",
        text: "দয়া করে আপনার সঠিক পেমেন্ট রেফারেন্স বা TrxID লিখুন।",
      });
      return;
    }
    setCourseApplySubmitting(true);
    setBannerMessage(null);
    try {
      await submitPaidCourseEnrollment({
        user,
        courseId: GRAPHIC_DESIGN_COURSE.id,
        courseTitle: GRAPHIC_DESIGN_COURSE.title,
        courseRoute: "/graphic-design-course",
        amountBdt: GRAPHIC_DESIGN_COURSE.priceBdt,
        totalLessonsCount: GRAPHIC_DESIGN_COURSE.lessons.length,
        paymentMethod: coursePayMethod,
        paymentReference: coursePayRef.trim(),
        studentPhone: courseStudentPhone.trim() || phone.trim(),
        studentName: displayName || user.displayName || undefined,
      });
      setCoursePayRef("");
      setShowCourseApplyModal(false);
      setDashboardSection("purchases");
      setBannerMessage({
        type: "success",
        text: "কোর্স এনরোলমেন্ট আবেদন জমা হয়েছে! বর্তমানে এটি Pending Verification অবস্থায় আছে। অ্যাডমিন Approve করলে ক্লাস আনলক হবে।",
      });
    } catch (error) {
      setBannerMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Could not submit course application.",
      });
    } finally {
      setCourseApplySubmitting(false);
    }
  };

  const handleCreateServiceApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const safeSubject = truncateString(appSubject, VALIDATION_LIMITS.APPLICATION_SUBJECT_MAX);
    const safeDetails = truncateString(appDetails, VALIDATION_LIMITS.APPLICATION_DETAILS_MAX);
    if (safeSubject.length < 2 || safeDetails.length < 4) {
      setBannerMessage({
        type: "error",
        text: "দয়া করে আবেদনের বিষয় এবং বিস্তারিত তথ্য সঠিকভাবে লিখুন।",
      });
      return;
    }

    setAppSubmitting(true);
    setBannerMessage(null);
    const appId = `app_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const path = `applications/${appId}`;
    const parsedBdt = Math.min(500000, Math.max(0, Math.round(Number(appAmountBdt) || 0)));

    const payload = {
      uid: truncateString(user.uid, 128),
      applicationCode: generateApplicationCode(),
      applicationCategory: appCategory,
      subject: safeSubject,
      details: safeDetails,
      preferredMethod: appMethod,
      referenceCode: truncateString(appRef, VALIDATION_LIMITS.APPLICATION_REFERENCE_MAX),
      amountBdt: parsedBdt,
      applicantName: truncateString(
        displayName || user.displayName || "Applicant",
        VALIDATION_LIMITS.DISPLAY_NAME_MAX,
      ),
      applicantEmail: truncateString(
        user.email || "client@example.com",
        VALIDATION_LIMITS.EMAIL_MAX,
      ),
      applicantPhone: truncateString(appPhone || phone, VALIDATION_LIMITS.PHONE_MAX),
      status: "Pending Verification" as const,
      verifiedByEmail: "",
      adminNote: "",
      submittedDate: todayIsoDate(),
      approvedDate: "",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    try {
      await setDoc(doc(db, "applications", appId), payload);
      setAppSubject("");
      setAppDetails("");
      setAppRef("");
      setAppAmountBdt("0");
      setShowNewAppModal(false);
      setDashboardSection("applications");
      setBannerMessage({
        type: "success",
        text: `আবেদন ${payload.applicationCode} জমা হয়েছে! বর্তমানে Pending Verification অবস্থায় আছে — অ্যাডমিন ম্যানুয়ালি Approve করলে ড্যাশবোর্ডে Approved দেখাবে।`,
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    } finally {
      setAppSubmitting(false);
    }
  };

  const handleAdminVerifyCourse = async (
    purchase: CoursePurchaseRecord,
    nextStatus: "Verified" | "Rejected",
  ) => {
    if (!user?.email || !isAdminUnlocked) return;
    setVerifyingId(purchase.id);
    setBannerMessage(null);
    const note =
      adminNoteDrafts[purchase.id]?.trim() ||
      (nextStatus === "Verified"
        ? "Approved by Primary Admin. Full course access unlocked."
        : "Transaction ID could not be verified. Please re-submit valid TrxID.");

    try {
      await adminUpdateCourseVerification({
        purchaseId: purchase.id,
        adminEmail: user.email,
        nextStatus,
        adminNote: note,
      });
      setBannerMessage({
        type: "success",
        text: `Course enrollment for ${purchase.studentName} marked as ${nextStatus}.`,
      });
    } catch (error) {
      setBannerMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to update course status.",
      });
    } finally {
      setVerifyingId(null);
    }
  };

  const handleAdminVerifyBook = async (
    purchase: BookPurchaseRecord,
    nextStatus: "Verified" | "Rejected",
  ) => {
    if (!user || !isAdminUnlocked) return;
    setVerifyingId(purchase.id);
    setBannerMessage(null);
    const note =
      adminNoteDrafts[purchase.id]?.trim() ||
      (nextStatus === "Verified"
        ? "Approved by Primary Admin. Full PDF book access unlocked."
        : "Transaction ID could not be verified. Please resubmit valid TrxID.");

    try {
      await adminUpdateBookVerification(user, purchase.id, nextStatus, note);
      setBannerMessage({
        type: "success",
        text: `Book order "${purchase.bookTitle}" for ${purchase.buyerName} marked as ${nextStatus}.`,
      });
    } catch (error) {
      setBannerMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to update book order status.",
      });
    } finally {
      setVerifyingId(null);
    }
  };

  const handleAdminVerifyOrder = async (
    order: ProjectOrderRecord,
    nextProjectStatus: "Approved" | "Completed" | "Rejected",
    nextBillingStatus: BillingStatus,
  ) => {
    if (!user?.email || !isAdminUnlocked) return;
    setVerifyingId(order.id);
    setBannerMessage(null);
    const path = `orders/${order.id}`;
    const note = truncateString(
      adminNoteDrafts[order.id]?.trim() ||
        (nextProjectStatus === "Approved"
          ? "Project order verified & approved by Primary Admin."
          : nextProjectStatus === "Completed"
            ? "Project work completed & payment settled."
            : "Payment reference could not be verified. Please update reference & resubmit."),
      VALIDATION_LIMITS.ADMIN_NOTE_MAX,
    );
    const completedDateValue =
      nextProjectStatus === "Completed" ? todayIsoDate() : order.completedDate || "";

    try {
      await updateDoc(doc(db, "orders", order.id), {
        projectStatus: nextProjectStatus,
        billingStatus: nextBillingStatus,
        completedDate: completedDateValue,
        verifiedByEmail: truncateString(user.email, VALIDATION_LIMITS.EMAIL_MAX),
        adminNote: note,
        updatedAt: serverTimestamp(),
      });
      setBannerMessage({
        type: "success",
        text:
          nextProjectStatus === "Completed"
            ? `Order ${order.orderNumber} marked Completed (${completedDateValue}) & Paid.`
            : `Order ${order.orderNumber} updated to "${nextProjectStatus}".`,
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    } finally {
      setVerifyingId(null);
    }
  };

  const handleAdminVerifyApplication = async (
    application: ServiceApplicationRecord,
    nextStatus: "Approved" | "Rejected",
  ) => {
    if (!user?.email || !isAdminUnlocked) return;
    setVerifyingId(application.id);
    setBannerMessage(null);
    const path = `applications/${application.id}`;
    const note = truncateString(
      adminNoteDrafts[application.id]?.trim() ||
        (nextStatus === "Approved"
          ? "Application approved by Primary Admin."
          : "Application declined. Please check details and re-submit."),
      VALIDATION_LIMITS.ADMIN_NOTE_MAX,
    );

    try {
      await updateDoc(doc(db, "applications", application.id), {
        status: nextStatus,
        verifiedByEmail: truncateString(user.email, VALIDATION_LIMITS.EMAIL_MAX),
        adminNote: note,
        approvedDate: nextStatus === "Approved" ? todayIsoDate() : "",
        updatedAt: serverTimestamp(),
      });
      setBannerMessage({
        type: "success",
        text: `Application ${application.applicationCode} updated to "${nextStatus}".`,
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    } finally {
      setVerifyingId(null);
    }
  };

  const handlePublishNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email || !isAdminUnlocked) return;
    setNoticeSubmitting(true);
    setBannerMessage(null);

    const noticeId = `notice_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const path = `notices/${noticeId}`;
    const safeTitle = truncateString(noticeTitle, VALIDATION_LIMITS.NOTICE_TITLE_MAX);
    const safeBody = truncateString(noticeBody, VALIDATION_LIMITS.NOTICE_BODY_MAX);

    if (safeTitle.length < 2 || safeBody.length < 4) {
      setNoticeSubmitting(false);
      setBannerMessage({
        type: "error",
        text: "Please enter both a notice headline and message body.",
      });
      return;
    }

    const safeActionRoute = isSafeAppRoute(noticeActionRoute) ? noticeActionRoute : "";

    const payload = {
      title: safeTitle,
      category: noticeCategory,
      body: safeBody,
      actionLabel: truncateString(noticeActionLabel, VALIDATION_LIMITS.NOTICE_ACTION_LABEL_MAX),
      actionRoute: truncateString(safeActionRoute, VALIDATION_LIMITS.NOTICE_ACTION_ROUTE_MAX),
      isPublished: noticeIsPublished,
      publishedDate: todayIsoDate(),
      publishedByEmail: truncateString(user.email, VALIDATION_LIMITS.EMAIL_MAX),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    try {
      await setDoc(doc(db, "notices", noticeId), payload);
      setNoticeTitle("");
      setNoticeBody("");
      setNoticeActionLabel("");
      setBannerMessage({
        type: "success",
        text: noticeIsPublished
          ? "Notice published! Signed-in users can now read it inside the Account Dashboard."
          : "Notice saved as draft.",
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    } finally {
      setNoticeSubmitting(false);
    }
  };

  const handleToggleNoticePublish = async (notice: WebsiteNoticeRecord) => {
    if (!user?.email || !isAdminUnlocked) return;
    const path = `notices/${notice.id}`;
    try {
      await updateDoc(doc(db, "notices", notice.id), {
        isPublished: !notice.isPublished,
        publishedDate: todayIsoDate(),
        updatedAt: serverTimestamp(),
      });
      setBannerMessage({
        type: "success",
        text: !notice.isPublished ? "Notice is now live in dashboard." : "Notice moved to draft.",
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const handleDeleteNotice = async (noticeId: string) => {
    if (!user?.email || !isAdminUnlocked) return;
    const path = `notices/${noticeId}`;
    try {
      await deleteDoc(doc(db, "notices", noticeId));
      setBannerMessage({
        type: "success",
        text: "Notice removed.",
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  const handleDownloadAllOrdersCsv = () => {
    if (orders.length === 0) return;
    const headers = [
      "Order Number",
      "Order Date",
      "Completed Date",
      "Project Title",
      "Service Category",
      "Package Tier",
      "Amount (BDT)",
      "Billing Method",
      "Billing Reference",
      "Billing Status",
      "Project Status",
      "Delivery Estimate",
      "Client Name",
      "Client Email",
    ];
    const rows = orders.map((o) =>
      [
        o.orderNumber,
        o.orderDate,
        getOrderCompletedDate(o) || "",
        `"${o.projectTitle.replace(/"/g, '""')}"`,
        o.serviceCategory,
        o.packageTier,
        getOrderAmountBdt(o),
        o.billingMethod,
        `"${o.billingReference.replace(/"/g, '""')}"`,
        o.billingStatus,
        o.projectStatus,
        `"${o.deliveryEstimate.replace(/"/g, '""')}"`,
        `"${o.clientName.replace(/"/g, '""')}"`,
        o.clientEmail,
      ].join(","),
    );
    downloadTextFile(
      `Sakibul-Islam-Client-Orders-${todayIsoDate()}.csv`,
      [headers.join(","), ...rows].join("\n"),
      "text/csv;charset=utf-8",
    );
  };

  const filteredOrders = useMemo(() => {
    if (statusFilter === "All") return orders;
    return orders.filter((o) => o.projectStatus === statusFilter);
  }, [orders, statusFilter]);

  const totalSpentBdt = useMemo(
    () =>
      orders
        .filter((o) => o.projectStatus !== "Cancelled" && o.projectStatus !== "Rejected")
        .reduce((sum, o) => sum + getOrderAmountBdt(o), 0),
    [orders],
  );

  const publishedNotices = useMemo(() => notices.filter((n) => n.isPublished), [notices]);

  const totalAdminPendingCount = useMemo(
    () =>
      adminQueueOrders.filter((o) => o.projectStatus === "Pending Verification").length +
      adminQueuePurchases.filter((p) => p.paymentStatus === "Pending Verification").length +
      adminQueueBooks.filter((b) => b.paymentStatus === "Pending Verification").length +
      adminQueueApplications.filter((a) => a.status === "Pending Verification").length,
    [adminQueueOrders, adminQueuePurchases, adminQueueBooks, adminQueueApplications],
  );

  return (
    <div className="relative flex min-h-screen flex-col bg-background font-sans text-foreground antialiased selection:bg-primary selection:text-primary-foreground">
      {/* Ambient Glassmorphic Background Accents */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -left-28 top-20 h-[28rem] w-[28rem] rounded-full bg-primary/[0.04] blur-3xl" />
        <div className="absolute right-[-6rem] top-[28%] h-[32rem] w-[32rem] rounded-full bg-muted-foreground/[0.06] blur-3xl" />
        <div className="absolute bottom-16 left-1/3 h-96 w-96 rounded-full bg-primary/[0.03] blur-3xl" />
      </div>

      {/* Top Navigation Header */}
      <header className="fixed top-0 z-[60] flex h-16 w-full items-center border-b border-border/80 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex w-full items-center justify-between px-4 lg:px-8">
          <a
            href="/"
            className="group flex items-center font-display text-xl font-bold tracking-tighter"
          >
            SS<span className="transition-transform duration-300 group-hover:scale-125">.</span>
          </a>

          <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-10 md:flex">
            {NAV.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="relative shrink-0 whitespace-nowrap text-xs font-semibold uppercase tracking-wider text-muted-foreground/80 transition-all duration-300 hover:text-foreground"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <PWAInstallButton variant="header" />
            <a
              href="/account"
              className="flex items-center gap-2 rounded-full border border-primary bg-primary px-3.5 py-1.5 text-primary-foreground shadow-sm transition-all duration-300"
            >
              <UserIcon className="h-3.5 w-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-widest">
                {user ? user.displayName?.split(" ")[0] || "Account" : "Account"}
              </span>
            </a>
            <button
              type="button"
              aria-label="Website Notices"
              onClick={() => {
                setDashboardSection("notices");
                document
                  .getElementById("dashboard-sections")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              className="relative cursor-pointer rounded-full p-2 text-muted-foreground transition-all hover:bg-accent hover:text-foreground"
            >
              <Bell className="h-4 w-4" />
              {publishedNotices.length > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 font-mono text-[9px] font-bold text-primary-foreground">
                  {publishedNotices.length}
                </span>
              )}
            </button>
            <a
              href="/account"
              aria-label="Account"
              className="h-9 w-9 overflow-hidden rounded-full border-2 border-primary shadow-sm transition-transform hover:scale-105"
            >
              <img
                src={
                  user?.photoURL ||
                  "https://www.image2url.com/r2/default/images/1793830217029-a79c9985-a662-4e24-a2a7-48ee66156994.png"
                }
                alt="Profile"
                className="h-full w-full object-cover object-top"
              />
            </a>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <PWAInstallButton variant="header" />
            <button
              className="p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        <MobileHeaderMenu
          open={mobileMenuOpen}
          activePath="/account"
          onClose={() => setMobileMenuOpen(false)}
        />
      </header>

      {/* Main Content */}
      <main className="relative z-10 mx-auto w-full max-w-7xl flex-1 px-4 pb-28 pt-24 sm:px-6 md:pb-24 md:pt-32 lg:px-8">
        {/* Page Header */}
        <div className="mb-10 flex flex-col justify-between gap-6 border-b border-border/60 pb-8 lg:flex-row lg:items-end">
          <div>
            <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-border/80 bg-background/60 px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground shadow-sm backdrop-blur-md md:text-xs">
              <ShieldCheck className="h-3.5 w-3.5 text-foreground" />
              Client Account &amp; Order Portal
            </span>
            <h1 className="font-display text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
              Account <span className="text-muted-foreground/70">Dashboard.</span>
            </h1>
            <p className="mt-3 max-w-2xl text-sm font-light leading-relaxed text-muted-foreground sm:text-base">
              Sign in with Google to manage your client profile, default billing preferences, and
              project orders — with instant downloadable copies of your order invoices and receipts.
            </p>
          </div>

          {user && (
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => setShowNewOrderModal(true)}
                className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-full bg-primary px-5 text-xs font-semibold text-primary-foreground shadow-lg shadow-black/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Plus className="h-3.5 w-3.5" />
                Apply for Project
              </button>
              <button
                type="button"
                onClick={() => setShowCourseApplyModal(true)}
                className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-full border border-border/80 bg-background/80 px-4 text-xs font-semibold text-foreground backdrop-blur-md transition-all hover:bg-muted"
              >
                <BookOpen className="h-3.5 w-3.5" />
                Apply for Course
              </button>
              <button
                type="button"
                onClick={() => setShowNewAppModal(true)}
                className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-full border border-border/80 bg-background/80 px-4 text-xs font-semibold text-foreground backdrop-blur-md transition-all hover:bg-muted"
              >
                <ClipboardCheck className="h-3.5 w-3.5" />
                Other Application
              </button>
              {isAdminUnlocked ? (
                <>
                  <button
                    type="button"
                    onClick={() => setDashboardSection("admin")}
                    className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/15 px-4 text-xs font-semibold text-emerald-800 dark:text-emerald-200"
                  >
                    <Unlock className="h-3.5 w-3.5" />
                    Admin Portal ({totalAdminPendingCount})
                  </button>
                  <button
                    type="button"
                    onClick={handleLockAdminPortal}
                    className="inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-full border border-border/80 bg-background/70 px-4 text-xs font-semibold text-foreground hover:bg-muted"
                  >
                    <Lock className="h-3.5 w-3.5" />
                    Lock Admin
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowAdminLoginModal(true)}
                  className="inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-full border border-border/80 bg-background/70 px-4 text-xs font-semibold text-foreground backdrop-blur-md transition-all hover:bg-muted"
                >
                  <KeyRound className="h-3.5 w-3.5" />
                  Admin Login
                </button>
              )}
              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-full border border-border/80 bg-background/70 px-4 text-xs font-semibold text-foreground backdrop-blur-md transition-all hover:bg-muted"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign Out
              </button>
            </div>
          )}
        </div>

        {/* Status Notification Banner */}
        {bannerMessage && (
          <div
            className={`mb-8 flex items-center justify-between gap-3 rounded-2xl border px-5 py-3.5 text-xs font-medium backdrop-blur-xl sm:text-sm ${
              bannerMessage.type === "success"
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200"
                : "border-destructive/40 bg-destructive/10 text-destructive"
            }`}
          >
            <div className="flex items-center gap-2.5">
              {bannerMessage.type === "success" ? (
                <CheckCircle2 className="h-4 w-4 shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0" />
              )}
              <span>{bannerMessage.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setBannerMessage(null)}
              className="rounded-full p-1 opacity-70 hover:opacity-100"
              aria-label="Dismiss notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Loading State */}
        {!authReady ? (
          <div className="flex min-h-[360px] flex-col items-center justify-center rounded-3xl border border-border/70 bg-background/55 p-12 text-center backdrop-blur-2xl">
            <Loader2 className="mb-4 h-8 w-8 animate-spin text-muted-foreground" />
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Connecting to Firebase Authentication…
            </p>
          </div>
        ) : !user ? (
          /* Signed-Out Google Sign-In Gate */
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-background/60 p-8 shadow-[0_24px_60px_-15px_rgba(0,0,0,0.08)] backdrop-blur-2xl sm:p-10 lg:col-span-7">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-foreground/25 to-transparent" />
              <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-border/80 bg-muted/60 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5 text-foreground" />
                One-Click Google Authentication
              </span>
              <h2 className="mb-3 font-display text-2xl font-bold tracking-tight sm:text-3xl">
                Sign in or create your client account
              </h2>
              <p className="mb-8 max-w-xl text-sm font-light leading-relaxed text-muted-foreground sm:text-base">
                Use your Google account to create a personal client profile with Sakibul Islam
                Sabbir. Once signed in, you can manage your contact and billing information, place
                and track project orders, and download official copies of your order invoices.
              </p>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={authLoading}
                className="inline-flex h-12 w-full items-center justify-center gap-3 rounded-full bg-primary px-8 text-xs font-semibold uppercase tracking-widest text-primary-foreground shadow-lg shadow-black/10 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 sm:w-auto"
              >
                {authLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fill="currentColor"
                      d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27c3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10c5.35 0 9.25-3.67 9.25-9.09c0-1.15-.15-1.81-.15-1.81Z"
                    />
                  </svg>
                )}
                Continue with Google
              </button>

              <div className="mt-8 grid grid-cols-1 gap-3 border-t border-border/60 pt-6 sm:grid-cols-3">
                <div className="rounded-2xl border border-border/60 bg-muted/30 p-3.5">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-foreground">
                    01. Client Profile
                  </p>
                  <p className="mt-1 text-xs font-light text-muted-foreground">
                    Manage your name, organization, WhatsApp number, and billing preferences.
                  </p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-muted/30 p-3.5">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-foreground">
                    02. Order Tracking
                  </p>
                  <p className="mt-1 text-xs font-light text-muted-foreground">
                    Review project orders, billing methods, order dates, and delivery timelines.
                  </p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-muted/30 p-3.5">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-foreground">
                    03. Instant Receipts
                  </p>
                  <p className="mt-1 text-xs font-light text-muted-foreground">
                    Download printable HTML/PDF invoices and text summaries for any order.
                  </p>
                </div>
              </div>
            </div>

            {/* Admin Dashboard Login Card */}
            <div className="flex flex-col justify-between rounded-3xl border border-border/80 bg-background/60 p-7 shadow-[0_24px_60px_-15px_rgba(0,0,0,0.08)] backdrop-blur-2xl sm:p-8 lg:col-span-5">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-muted/60 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-foreground">
                  <KeyRound className="h-3 w-3" />
                  Admin Dashboard Login
                </span>
                <h3 className="mt-3 font-display text-xl font-bold tracking-tight">
                  এডমিন ড্যাশবোর্ড লগইন
                </h3>
                <p className="mt-1.5 text-xs font-light leading-relaxed text-muted-foreground">
                  সাধারণ ইউজার শুধু প্রজেক্ট, কোর্স ও সার্ভিসের জন্য আবেদন করতে পারবেন। প্রাইমারি
                  এডমিন লগইন করে প্রতিটি আবেদন ম্যানুয়ালি Approve করলে তা Approved হবে।
                </p>

                <form onSubmit={handleAdminPortalLogin} className="mt-5 space-y-3.5">
                  <div>
                    <label className="mb-1 flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      <Mail className="h-3 w-3" /> Admin Email
                    </label>
                    <input
                      type="email"
                      required
                      value={adminLoginEmail}
                      onChange={(e) => setAdminLoginEmail(e.target.value)}
                      placeholder={PRIMARY_ADMIN_EMAIL}
                      className="h-10 w-full rounded-xl border border-border bg-background/80 px-3.5 text-xs font-medium text-foreground outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="mb-1 flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      <Lock className="h-3 w-3" /> Admin Password
                    </label>
                    <div className="relative">
                      <input
                        type={showAdminPassword ? "text" : "password"}
                        required
                        value={adminLoginPassword}
                        onChange={(e) => setAdminLoginPassword(e.target.value)}
                        placeholder="Enter admin password"
                        className="h-10 w-full rounded-xl border border-border bg-background/80 pl-3.5 pr-10 text-xs font-medium text-foreground outline-none focus:border-primary"
                      />
                      <button
                        type="button"
                        onClick={() => setShowAdminPassword((prev) => !prev)}
                        aria-label={showAdminPassword ? "Hide password" : "Show password"}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:text-foreground"
                      >
                        {showAdminPassword ? (
                          <EyeOff className="h-3.5 w-3.5" />
                        ) : (
                          <Eye className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {adminAuthError && (
                    <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-3.5 py-2.5 text-[11px] font-medium text-destructive">
                      {adminAuthError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={adminAuthLoading}
                    className="inline-flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-primary px-5 text-xs font-semibold text-primary-foreground shadow-sm transition-all hover:scale-[1.01] disabled:opacity-60"
                  >
                    {adminAuthLoading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <ShieldCheck className="h-3.5 w-3.5" />
                    )}
                    Login to Admin Dashboard
                  </button>

                  {(adminNeedsGoogleLink || adminNeedsEmailVerify) && (
                    <div className="space-y-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3.5">
                      <p className="text-[11px] font-medium text-emerald-900 dark:text-emerald-200">
                        পাসওয়ার্ড যাচাই সফল! এডমিন সেশন সম্পন্ন করতে প্রাইমারি এডমিন Google
                        অ্যাকাউন্ট ({PRIMARY_ADMIN_EMAIL}) দিয়ে ১-ক্লিকে যাচাই করুন:
                      </p>
                      <button
                        type="button"
                        disabled={adminAuthLoading}
                        onClick={handleCompleteAdminGoogleVerify}
                        className="inline-flex h-9 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-emerald-700 px-4 text-[11px] font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Complete Admin Google Sign-In
                      </button>
                    </div>
                  )}
                </form>
              </div>

              <div className="mt-6 rounded-2xl border border-border/60 bg-muted/40 p-4">
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Supported Billing Methods ({BILLING_METHODS.length})
                </p>
                <p className="mt-1 text-[11px] font-medium text-foreground">
                  {BILLING_METHODS.join(" · ")}
                </p>
                <p className="mt-1 text-[11px] font-light text-muted-foreground">
                  Every submission starts as Pending Verification until approved by Primary Admin.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Signed-In Dashboard */
          <div className="space-y-10">
            {/* Top Summary Metrics Row */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <div className="rounded-3xl border border-border/80 bg-background/60 p-5 shadow-sm backdrop-blur-2xl">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    {isAdminUnlocked
                      ? "Primary Admin • Unlocked"
                      : isPrimaryAdmin
                        ? "Primary Admin • Locked"
                        : "Student & Client Account"}
                  </span>
                  <ShieldCheck className="h-4 w-4 text-foreground" />
                </div>
                <p className="mt-2 truncate font-display text-lg font-bold">{displayName}</p>
                <p className="truncate font-mono text-[11px] text-muted-foreground">{user.email}</p>
              </div>

              <button
                type="button"
                onClick={() => setDashboardSection("purchases")}
                className={`cursor-pointer rounded-3xl border p-5 text-left shadow-sm backdrop-blur-2xl transition-colors ${
                  dashboardSection === "purchases"
                    ? "border-primary bg-background/85 ring-1 ring-primary/20"
                    : "border-border/80 bg-background/60 hover:border-foreground/30"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    Course Applications
                  </span>
                  <BookOpen className="h-4 w-4 text-foreground" />
                </div>
                <p className="mt-2 font-display text-2xl font-bold tabular-nums">
                  {coursePurchases.length}
                </p>
                <p className="font-mono text-[11px] text-muted-foreground">
                  {coursePurchases.filter((c) => c.paymentStatus === "Verified").length} Approved •{" "}
                  {coursePurchases.filter((c) => c.paymentStatus === "Pending Verification").length}{" "}
                  Pending
                </p>
              </button>

              <button
                type="button"
                onClick={() => setDashboardSection("orders")}
                className={`cursor-pointer rounded-3xl border p-5 text-left shadow-sm backdrop-blur-2xl transition-colors ${
                  dashboardSection === "orders"
                    ? "border-primary bg-background/85 ring-1 ring-primary/20"
                    : "border-border/80 bg-background/60 hover:border-foreground/30"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    Project Orders
                  </span>
                  <Briefcase className="h-4 w-4 text-foreground" />
                </div>
                <p className="mt-2 font-display text-2xl font-bold tabular-nums">{orders.length}</p>
                <p className="font-mono text-[11px] text-muted-foreground">
                  {orders.filter((o) => o.projectStatus === "Pending Verification").length} Pending
                  •{" "}
                  {
                    orders.filter(
                      (o) => o.projectStatus === "Approved" || o.projectStatus === "Completed",
                    ).length
                  }{" "}
                  Approved
                </p>
              </button>

              <button
                type="button"
                onClick={() => setDashboardSection("applications")}
                className={`cursor-pointer rounded-3xl border p-5 text-left shadow-sm backdrop-blur-2xl transition-colors ${
                  dashboardSection === "applications"
                    ? "border-primary bg-background/85 ring-1 ring-primary/20"
                    : "border-border/80 bg-background/60 hover:border-foreground/30"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    Other Applications
                  </span>
                  <ClipboardCheck className="h-4 w-4 text-foreground" />
                </div>
                <p className="mt-2 font-display text-2xl font-bold tabular-nums">
                  {applications.length}
                </p>
                <p className="font-mono text-[11px] text-muted-foreground">
                  {applications.filter((a) => a.status === "Pending Verification").length} Pending •{" "}
                  {applications.filter((a) => a.status === "Approved").length} Approved
                </p>
              </button>

              <button
                type="button"
                onClick={() => setDashboardSection("notices")}
                className={`cursor-pointer rounded-3xl border p-5 text-left shadow-sm backdrop-blur-2xl transition-colors ${
                  dashboardSection === "notices"
                    ? "border-primary bg-background/85 ring-1 ring-primary/20"
                    : "border-border/80 bg-background/60 hover:border-foreground/30"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    Volume (BDT) &amp; Notices
                  </span>
                  <Receipt className="h-4 w-4 text-foreground" />
                </div>
                <p className="mt-2 font-display text-2xl font-bold tabular-nums">
                  ৳{totalSpentBdt.toLocaleString("en-US")}
                  <span className="ml-1 text-xs font-semibold text-muted-foreground">BDT</span>
                </p>
                <p className="truncate font-mono text-[11px] text-muted-foreground">
                  {publishedNotices.length} Website Notice
                  {publishedNotices.length === 1 ? "" : "s"}
                </p>
              </button>
            </div>

            {/* Quick Highlight: Purchased Courses Direct Jump + Latest Website Notice */}
            {(coursePurchases.length > 0 || publishedNotices.length > 0) && (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
                {coursePurchases.length > 0 && (
                  <div
                    className={`rounded-3xl border border-border/80 bg-background/65 p-5 shadow-sm backdrop-blur-2xl ${
                      publishedNotices.length > 0 ? "lg:col-span-7" : "lg:col-span-12"
                    }`}
                  >
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        <PlayCircle className="h-3.5 w-3.5 text-foreground" />
                        Your Purchased Courses — Click to Open
                      </span>
                      <span className="font-mono text-[10px] text-muted-foreground">
                        সরাসরি কোর্স সেকশনে যান
                      </span>
                    </div>
                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                      {coursePurchases.map((course) => (
                        <Link
                          key={course.id}
                          to={course.courseRoute as "/graphic-design-course" | "/courses"}
                          className="group flex items-center justify-between gap-3 rounded-2xl border border-border/80 bg-background/90 px-4 py-3 transition-all hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-sm"
                        >
                          <div className="min-w-0">
                            <p className="truncate font-display text-sm font-bold text-foreground group-hover:underline">
                              {course.courseTitle}
                            </p>
                            <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                              {course.paymentStatus} • {course.progressPct}% Complete
                            </p>
                          </div>
                          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform group-hover:scale-105">
                            <ArrowUpRight className="h-4 w-4" />
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {publishedNotices.length > 0 && (
                  <div
                    className={`flex flex-col justify-between rounded-3xl border border-border/80 bg-background/65 p-5 shadow-sm backdrop-blur-2xl ${
                      coursePurchases.length > 0 ? "lg:col-span-5" : "lg:col-span-12"
                    }`}
                  >
                    <div>
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-foreground">
                          <Bell className="h-3.5 w-3.5" />
                          Latest Website Notice
                        </span>
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {publishedNotices[0]?.publishedDate}
                        </span>
                      </div>
                      <p className="font-display text-base font-bold text-foreground">
                        {publishedNotices[0]?.title}
                      </p>
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                        {publishedNotices[0]?.body}
                      </p>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setDashboardSection("notices")}
                        className="inline-flex cursor-pointer items-center gap-1 font-mono text-[11px] font-bold uppercase tracking-wider text-foreground underline-offset-4 hover:underline"
                      >
                        Read All Notices ({publishedNotices.length})
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </button>
                      {isSafeAppRoute(publishedNotices[0]?.actionRoute) && (
                        <Link
                          to={
                            publishedNotices[0]!.actionRoute as
                              | "/courses"
                              | "/graphic-design-course"
                              | "/workshop"
                              | "/projects"
                              | "/contact"
                          }
                          className="inline-flex h-8 items-center gap-1 rounded-full bg-primary px-3.5 text-[11px] font-semibold text-primary-foreground"
                        >
                          {publishedNotices[0]!.actionLabel || "Open"}
                          <ArrowUpRight className="h-3 w-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Section Switcher Bar */}
            <div
              id="dashboard-sections"
              className="flex flex-wrap items-center gap-2 border-b border-border/60 pb-4 scroll-mt-24"
            >
              <button
                type="button"
                onClick={() => setDashboardSection("purchases")}
                className={`inline-flex h-10 cursor-pointer items-center gap-2 rounded-full px-5 text-xs font-semibold transition-colors ${
                  dashboardSection === "purchases"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "border border-border/80 bg-background/70 text-foreground hover:bg-muted"
                }`}
              >
                <BookOpen className="h-3.5 w-3.5" />
                Courses ({coursePurchases.length})
              </button>

              <button
                type="button"
                onClick={() => setDashboardSection("orders")}
                className={`inline-flex h-10 cursor-pointer items-center gap-2 rounded-full px-5 text-xs font-semibold transition-colors ${
                  dashboardSection === "orders"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "border border-border/80 bg-background/70 text-foreground hover:bg-muted"
                }`}
              >
                <Receipt className="h-3.5 w-3.5" />
                Project Orders ({orders.length})
              </button>

              <button
                type="button"
                onClick={() => setDashboardSection("applications")}
                className={`inline-flex h-10 cursor-pointer items-center gap-2 rounded-full px-5 text-xs font-semibold transition-colors ${
                  dashboardSection === "applications"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "border border-border/80 bg-background/70 text-foreground hover:bg-muted"
                }`}
              >
                <ClipboardCheck className="h-3.5 w-3.5" />
                Other Applications ({applications.length})
              </button>

              <button
                type="button"
                onClick={() => setDashboardSection("notices")}
                className={`inline-flex h-10 cursor-pointer items-center gap-2 rounded-full px-5 text-xs font-semibold transition-colors ${
                  dashboardSection === "notices"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "border border-border/80 bg-background/70 text-foreground hover:bg-muted"
                }`}
              >
                <Megaphone className="h-3.5 w-3.5" />
                Notices ({publishedNotices.length})
              </button>

              {isPrimaryAdmin && (
                <button
                  type="button"
                  onClick={() => setDashboardSection("admin")}
                  className={`inline-flex h-10 cursor-pointer items-center gap-2 rounded-full px-5 text-xs font-semibold transition-colors ${
                    dashboardSection === "admin"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "border border-border/80 bg-background/70 text-foreground hover:bg-muted"
                  }`}
                >
                  {isAdminUnlocked ? (
                    <Unlock className="h-3.5 w-3.5" />
                  ) : (
                    <Lock className="h-3.5 w-3.5" />
                  )}
                  Admin Verification ({totalAdminPendingCount} Pending)
                </button>
              )}
            </div>

            {/* Main Two-Column Layout: Left = Profile & Billing Settings, Right = Purchases / Orders / Admin */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
              {/* Left Column: Profile & Billing Management */}
              <div className="lg:col-span-5">
                <form
                  onSubmit={handleSaveProfile}
                  className="relative overflow-hidden rounded-3xl border border-border/80 bg-background/60 p-6 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.07)] backdrop-blur-2xl sm:p-8"
                >
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-foreground/25 to-transparent" />

                  <div className="mb-6 flex items-center gap-4 border-b border-border/60 pb-5">
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-border bg-muted">
                      <img
                        src={
                          user.photoURL ||
                          "https://www.image2url.com/r2/default/images/1793830217029-a79c9985-a662-4e24-a2a7-48ee66156994.png"
                        }
                        alt={displayName}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        Profile &amp; Billing Settings
                      </span>
                      <h2 className="truncate font-display text-xl font-bold tracking-tight">
                        {displayName}
                      </h2>
                      <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="mb-1.5 flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        <UserIcon className="h-3 w-3" /> Full Name
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={VALIDATION_LIMITS.DISPLAY_NAME_MAX}
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="h-10 w-full rounded-xl border border-border/80 bg-background/80 px-3.5 text-sm text-foreground outline-none transition-colors focus:border-primary"
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1.5 flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                          <Phone className="h-3 w-3" /> Phone / WhatsApp
                        </label>
                        <input
                          type="text"
                          maxLength={VALIDATION_LIMITS.PHONE_MAX}
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+880 1XXX-XXXXXX"
                          className="h-10 w-full rounded-xl border border-border/80 bg-background/80 px-3.5 text-sm text-foreground outline-none transition-colors focus:border-primary"
                        />
                      </div>

                      <div>
                        <label className="mb-1.5 flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                          <MapPin className="h-3 w-3" /> Location
                        </label>
                        <input
                          type="text"
                          maxLength={VALIDATION_LIMITS.LOCATION_MAX}
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          placeholder="City, Country"
                          className="h-10 w-full rounded-xl border border-border/80 bg-background/80 px-3.5 text-sm text-foreground outline-none transition-colors focus:border-primary"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1.5 flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                          <Building2 className="h-3 w-3" /> Company / Brand
                        </label>
                        <input
                          type="text"
                          maxLength={VALIDATION_LIMITS.COMPANY_MAX}
                          value={company}
                          onChange={(e) => setCompany(e.target.value)}
                          placeholder="Your company or brand"
                          className="h-10 w-full rounded-xl border border-border/80 bg-background/80 px-3.5 text-sm text-foreground outline-none transition-colors focus:border-primary"
                        />
                      </div>

                      <div>
                        <label className="mb-1.5 flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                          <Briefcase className="h-3 w-3" /> Role / Title
                        </label>
                        <input
                          type="text"
                          maxLength={VALIDATION_LIMITS.ROLE_TITLE_MAX}
                          value={roleTitle}
                          onChange={(e) => setRoleTitle(e.target.value)}
                          placeholder="Founder, Marketing Lead…"
                          className="h-10 w-full rounded-xl border border-border/80 bg-background/80 px-3.5 text-sm text-foreground outline-none transition-colors focus:border-primary"
                        />
                      </div>
                    </div>

                    <div className="border-t border-border/60 pt-4">
                      <p className="mb-3 font-mono text-[10px] font-bold uppercase tracking-widest text-foreground">
                        Default Billing Configuration
                      </p>

                      <div className="space-y-4">
                        <div>
                          <label className="mb-1.5 flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            <CreditCard className="h-3 w-3" /> Preferred Billing Method
                          </label>
                          <select
                            value={preferredBillingMethod}
                            onChange={(e) =>
                              setPreferredBillingMethod(e.target.value as BillingMethod)
                            }
                            className="h-10 w-full rounded-xl border border-border/80 bg-background/80 px-3.5 text-sm text-foreground outline-none transition-colors focus:border-primary"
                          >
                            {BILLING_METHODS.map((m) => (
                              <option key={m} value={m}>
                                {m}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="mb-1.5 flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            <Wallet className="h-3 w-3" /> Billing Account / Reference
                          </label>
                          <input
                            type="text"
                            maxLength={VALIDATION_LIMITS.BILLING_DETAILS_MAX}
                            value={billingDetails}
                            onChange={(e) => setBillingDetails(e.target.value)}
                            placeholder="e.g., bKash •••• 7506 or Visa •••• 4242"
                            className="h-10 w-full rounded-xl border border-border/80 bg-background/80 px-3.5 text-sm text-foreground outline-none transition-colors focus:border-primary"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="mb-1.5 flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        Project Preferences / Notes
                      </label>
                      <textarea
                        rows={3}
                        maxLength={VALIDATION_LIMITS.BIO_MAX}
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Share your brand guidelines, preferred turnaround times, or communication notes…"
                        className="w-full rounded-xl border border-border/80 bg-background/80 p-3.5 text-sm text-foreground outline-none transition-colors focus:border-primary"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={profileSaving}
                      className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-primary px-6 text-xs font-semibold uppercase tracking-widest text-primary-foreground shadow-md transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60"
                    >
                      {profileSaving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      Save Profile &amp; Billing Info
                    </button>
                  </div>
                </form>
              </div>

              {/* Right Column: Purchases, Project Orders, or Admin Verification Queue */}
              <div className="lg:col-span-7">
                {dashboardSection === "purchases" && (
                  <div className="rounded-3xl border border-border/80 bg-background/60 p-6 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.07)] backdrop-blur-2xl sm:p-8">
                    <div className="mb-6 flex flex-col justify-between gap-4 border-b border-border/60 pb-5 sm:flex-row sm:items-center">
                      <div>
                        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                          Enrolled Courses &amp; Progress
                        </span>
                        <h2 className="mt-1 font-display text-2xl font-bold tracking-tight">
                          Your Purchases &amp; Courses
                        </h2>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setShowCourseApplyModal(true)}
                          className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full bg-primary px-4 text-[11px] font-semibold text-primary-foreground shadow-sm"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Apply for Paid Course
                        </button>
                        <Link
                          to="/graphic-design-course"
                          className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border/80 bg-background/80 px-3.5 text-[11px] font-semibold text-foreground hover:bg-muted"
                        >
                          Course Details
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </Link>
                        <Link
                          to="/courses"
                          className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border/80 bg-background/80 px-3.5 text-[11px] font-semibold text-foreground hover:bg-muted"
                        >
                          Quran Course (Free)
                        </Link>
                      </div>
                    </div>

                    {purchasesLoading ? (
                      <div className="flex flex-col items-center justify-center py-16 text-center">
                        <Loader2 className="mb-3 h-6 w-6 animate-spin text-muted-foreground" />
                        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                          Loading your enrolled courses…
                        </p>
                      </div>
                    ) : coursePurchases.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 p-10 text-center">
                        <BookOpen className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
                        <h3 className="font-display text-lg font-bold">
                          No courses enrolled or purchased yet
                        </h3>
                        <p className="mx-auto mt-1.5 max-w-md text-xs font-light leading-relaxed text-muted-foreground sm:text-sm">
                          Apply for the Advanced Graphic Design with AI Tools Live Course (৳6,000)
                          right here or start the free Quran learning course. Your application
                          enters Pending Verification until approved by Primary Admin.
                        </p>
                        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                          <button
                            type="button"
                            onClick={() => setShowCourseApplyModal(true)}
                            className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-full bg-primary px-5 text-xs font-semibold text-primary-foreground"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            Apply for Paid Course
                          </button>
                          <Link
                            to="/courses"
                            className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-background px-5 text-xs font-semibold text-foreground hover:bg-muted"
                          >
                            Start Quran Course
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-5">
                        {coursePurchases.map((item) => {
                          const isVerified = item.paymentStatus === "Verified";
                          const isPending = item.paymentStatus === "Pending Verification";
                          return (
                            <Link
                              key={item.id}
                              to={item.courseRoute as "/graphic-design-course" | "/courses"}
                              className="group block cursor-pointer rounded-2xl border border-border/80 bg-background/80 p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md sm:p-6"
                            >
                              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
                                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                  <span className="font-mono font-bold text-foreground">
                                    {item.courseType}
                                  </span>
                                  <span aria-hidden="true">·</span>
                                  <span className="font-mono tabular-nums">
                                    Applied: {item.purchaseDate}
                                  </span>
                                </div>

                                <span
                                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider ${
                                    isVerified
                                      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                                      : isPending
                                        ? "bg-amber-500/15 text-amber-800 dark:text-amber-200"
                                        : "bg-destructive/15 text-destructive"
                                  }`}
                                >
                                  {isVerified ? (
                                    <Unlock className="h-3 w-3" />
                                  ) : isPending ? (
                                    <Clock className="h-3 w-3" />
                                  ) : (
                                    <XCircle className="h-3 w-3" />
                                  )}
                                  {isVerified
                                    ? "Approved • Access Active"
                                    : isPending
                                      ? "Pending Verification"
                                      : "Rejected"}
                                </span>
                              </div>

                              <div className="mt-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                                <div>
                                  <h3 className="font-display text-lg font-bold tracking-tight text-foreground transition-colors group-hover:underline sm:text-xl">
                                    {item.courseTitle}
                                  </h3>
                                  <p className="mt-1 text-xs text-muted-foreground">
                                    Method:{" "}
                                    <strong className="text-foreground">
                                      {item.paymentMethod}
                                    </strong>{" "}
                                    · Ref:{" "}
                                    <span className="font-mono">{item.paymentReference}</span>
                                  </p>
                                  {item.adminNote && (
                                    <p className="mt-1.5 text-xs text-muted-foreground">
                                      Note: {item.adminNote}
                                    </p>
                                  )}
                                </div>

                                <div className="shrink-0 rounded-2xl border border-border/70 bg-muted/30 px-4 py-2.5 text-left sm:text-right">
                                  <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                                    Course Fee (BDT)
                                  </p>
                                  <p className="font-display text-xl font-bold tabular-nums text-foreground">
                                    {item.amountBdt > 0
                                      ? `৳${item.amountBdt.toLocaleString("en-US")} BDT`
                                      : "Free"}
                                  </p>
                                </div>
                              </div>

                              {/* Progress Tracker */}
                              <div className="mt-4 rounded-xl border border-border/60 bg-muted/25 p-4">
                                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                                  <span className="flex items-center gap-1.5 font-semibold text-foreground">
                                    <Award className="h-4 w-4 text-muted-foreground" />
                                    Course Progress
                                  </span>
                                  <span className="font-mono font-bold tabular-nums text-foreground">
                                    {item.completedLessonsCount}/{item.totalLessonsCount} Classes (
                                    {item.progressPct}%)
                                  </span>
                                </div>

                                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-background">
                                  <div
                                    className="h-full rounded-full bg-primary transition-all duration-300"
                                    style={{ width: `${item.progressPct}%` }}
                                  />
                                </div>

                                <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground">
                                  <span className="truncate">
                                    Last Active:{" "}
                                    <strong className="text-foreground">
                                      {item.lastActiveLessonTitle || "Ready to begin"}
                                    </strong>
                                  </span>
                                  {item.averageQuizScore > 0 && (
                                    <span className="font-mono tabular-nums">
                                      Avg Quiz Score: {Math.round(item.averageQuizScore)}%
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-1">
                                <span className="text-xs text-muted-foreground">
                                  {isVerified
                                    ? "Access active — click card to enter course classroom."
                                    : isPending
                                      ? "Classroom locked until admin confirms your TrxID (click to view course)."
                                      : "Payment rejected — click to resubmit TrxID on the course page."}
                                </span>

                                <span className="inline-flex h-9 items-center gap-1.5 rounded-full bg-primary px-4 text-[11px] font-semibold text-primary-foreground shadow-sm transition-transform group-hover:scale-105">
                                  {isVerified ? "Open Course Section" : "Go to Course"}
                                  <ArrowUpRight className="h-3.5 w-3.5" />
                                </span>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    )}

                    {/* Purchased Ebooks Library inside Purchases Section */}
                    <div className="mt-8 border-t border-border/70 pt-6">
                      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            Digital Books Library • ই-বুক অর্ডার (Google Connected)
                          </p>
                          <h3 className="mt-0.5 font-display text-lg font-bold">
                            My Purchased Books ({bookPurchases.length})
                          </h3>
                        </div>
                        <Link
                          to="/books"
                          className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-background px-4 text-xs font-semibold text-foreground hover:bg-muted"
                        >
                          Open Books Library
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>

                      {bookPurchases.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-border/80 bg-background/50 p-5 text-center font-['Hind_Siliguri']">
                          <p className="text-sm font-semibold text-foreground">
                            আপনি এখনো কোনো পেইড ই-বুক অর্ডার করেননি।
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Books সেকশনে গিয়ে প্রিমিয়াম বইয়ের “একটু পড়ে দেখুন” স্যাম্পল পড়ুন এবং
                            বিকাশ, নগদ, রকেট বা ব্যাংক একাউন্টের মাধ্যমে অর্ডার করুন।
                          </p>
                          <Link
                            to="/books"
                            className="mt-3 inline-flex h-9 items-center gap-1.5 rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground"
                          >
                            Explore Books &amp; Look Inside
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {bookPurchases.map((bookOrder) => {
                            const isVerified = bookOrder.paymentStatus === "Verified";
                            const isPending = bookOrder.paymentStatus === "Pending Verification";
                            return (
                              <Link
                                key={bookOrder.id}
                                to="/books"
                                search={{ book: bookOrder.bookId }}
                                className="group flex flex-col justify-between gap-3 rounded-2xl border border-border/80 bg-background/80 p-4 transition-all hover:border-primary/50 sm:flex-row sm:items-center"
                              >
                                <div>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="font-display text-base font-bold text-foreground group-hover:underline">
                                      {bookOrder.bookTitle}
                                    </span>
                                    <span
                                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider ${
                                        isVerified
                                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                                          : isPending
                                            ? "bg-amber-500/15 text-amber-800 dark:text-amber-200"
                                            : "bg-destructive/15 text-destructive"
                                      }`}
                                    >
                                      {isVerified
                                        ? "Approved • Read PDF"
                                        : isPending
                                          ? "Pending Verification"
                                          : "Rejected"}
                                    </span>
                                  </div>
                                  <p className="mt-1 text-xs text-muted-foreground">
                                    ৳{bookOrder.amountBdt} BDT • {bookOrder.paymentMethod} • TrxID:{" "}
                                    <span className="font-mono">{bookOrder.paymentReference}</span>{" "}
                                    • {bookOrder.purchaseDate}
                                  </p>
                                  {bookOrder.adminNote && (
                                    <p className="mt-1 text-xs text-muted-foreground">
                                      Note: {bookOrder.adminNote}
                                    </p>
                                  )}
                                </div>
                                <span className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-primary px-4 text-[11px] font-semibold text-primary-foreground">
                                  {isVerified ? "Read PDF Book" : "View Order Status"}
                                  <ArrowUpRight className="h-3.5 w-3.5" />
                                </span>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {dashboardSection === "notices" && (
                  <div className="space-y-6">
                    <div className="rounded-3xl border border-border/80 bg-background/60 p-6 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.07)] backdrop-blur-2xl sm:p-8">
                      <div className="mb-6 flex flex-col justify-between gap-4 border-b border-border/60 pb-5 sm:flex-row sm:items-center">
                        <div>
                          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                            Website Notice Board • নোটিশ বোর্ড
                          </span>
                          <h2 className="mt-1 font-display text-2xl font-bold tracking-tight">
                            Published Website Notices
                          </h2>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Official announcements, live batch schedules, workshop updates, and
                            account notices published from the website.
                          </p>
                        </div>

                        <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-border/80 bg-muted/40 px-3.5 py-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-foreground">
                          <Bell className="h-3.5 w-3.5" />
                          {publishedNotices.length} Active Notice
                          {publishedNotices.length === 1 ? "" : "s"}
                        </span>
                      </div>

                      {noticesLoading ? (
                        <div className="flex flex-col items-center justify-center py-14 text-center">
                          <Loader2 className="mb-3 h-6 w-6 animate-spin text-muted-foreground" />
                          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                            Loading website notices…
                          </p>
                        </div>
                      ) : (isAdminUnlocked ? notices : publishedNotices).length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 p-10 text-center">
                          <Megaphone className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
                          <h3 className="font-display text-lg font-bold">
                            No website notices published yet
                          </h3>
                          <p className="mx-auto mt-1.5 max-w-md text-xs font-light leading-relaxed text-muted-foreground sm:text-sm">
                            Whenever any notice is published from the website (course schedule
                            updates, workshop links, or special offers), it will appear right here
                            inside your account dashboard.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {(isAdminUnlocked ? notices : publishedNotices).map((notice) => (
                            <div
                              key={notice.id}
                              className={`rounded-2xl border p-5 shadow-xs transition-all ${
                                notice.isPublished
                                  ? "border-border/80 bg-background/85"
                                  : "border-dashed border-amber-500/40 bg-amber-500/5"
                              }`}
                            >
                              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="rounded-full bg-primary px-3 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-primary-foreground">
                                    {notice.category}
                                  </span>
                                  <span className="inline-flex items-center gap-1 font-mono text-[11px] text-muted-foreground">
                                    <Calendar className="h-3.5 w-3.5" />
                                    {notice.publishedDate}
                                  </span>
                                  {!notice.isPublished && (
                                    <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-200">
                                      Draft (Hidden)
                                    </span>
                                  )}
                                </div>

                                {isAdminUnlocked && (
                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => handleToggleNoticePublish(notice)}
                                      className="inline-flex h-8 cursor-pointer items-center gap-1 rounded-full border border-border/80 bg-background px-3 font-mono text-[10px] font-bold uppercase tracking-wider text-foreground hover:bg-muted"
                                    >
                                      {notice.isPublished ? (
                                        <>
                                          <EyeOff className="h-3 w-3" /> Unpublish
                                        </>
                                      ) : (
                                        <>
                                          <Eye className="h-3 w-3" /> Publish
                                        </>
                                      )}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteNotice(notice.id)}
                                      className="inline-flex h-8 cursor-pointer items-center gap-1 rounded-full border border-destructive/40 px-3 font-mono text-[10px] font-bold uppercase tracking-wider text-destructive hover:bg-destructive/10"
                                    >
                                      <Trash2 className="h-3 w-3" /> Delete
                                    </button>
                                  </div>
                                )}
                              </div>

                              <h3 className="mt-3 font-display text-lg font-bold tracking-tight text-foreground">
                                {notice.title}
                              </h3>
                              <p className="mt-1.5 whitespace-pre-line text-xs leading-relaxed text-muted-foreground sm:text-sm">
                                {notice.body}
                              </p>

                              {isSafeAppRoute(notice.actionRoute) && (
                                <div className="mt-4 pt-1">
                                  <Link
                                    to={
                                      notice.actionRoute as
                                        | "/courses"
                                        | "/graphic-design-course"
                                        | "/workshop"
                                        | "/projects"
                                        | "/contact"
                                    }
                                    className="inline-flex h-9 items-center gap-1.5 rounded-full bg-primary px-4 text-[11px] font-semibold text-primary-foreground shadow-sm transition-transform hover:scale-105"
                                  >
                                    {notice.actionLabel || "View Section"}
                                    <ArrowUpRight className="h-3.5 w-3.5" />
                                  </Link>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Primary Admin Notice Publisher Form (Requires Unlocked Admin Session) */}
                    {isPrimaryAdmin && !isAdminUnlocked && (
                      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-border/80 bg-background/60 p-6 backdrop-blur-2xl">
                        <div>
                          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                            Admin Notice Publisher Locked
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            নোটিশ পাবলিশ বা এডিট করতে আপনার Admin Password দিয়ে পোর্টাল আনলক করুন।
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowAdminLoginModal(true)}
                          className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-full bg-primary px-5 text-xs font-semibold text-primary-foreground"
                        >
                          <KeyRound className="h-3.5 w-3.5" />
                          Unlock Admin Portal
                        </button>
                      </div>
                    )}

                    {isAdminUnlocked && (
                      <form
                        onSubmit={handlePublishNotice}
                        className="rounded-3xl border border-border/80 bg-background/60 p-6 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.07)] backdrop-blur-2xl sm:p-8"
                      >
                        <div className="mb-5 border-b border-border/60 pb-4">
                          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                            Admin Notice Publisher
                          </span>
                          <h3 className="mt-1 font-display text-xl font-bold tracking-tight">
                            Publish a New Website Notice
                          </h3>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Notices published here appear inside every logged-in user&apos;s Account
                            Dashboard.
                          </p>
                        </div>

                        <div className="space-y-4">
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <div className="sm:col-span-2">
                              <label className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                Notice Headline
                              </label>
                              <input
                                type="text"
                                required
                                maxLength={VALIDATION_LIMITS.NOTICE_TITLE_MAX}
                                value={noticeTitle}
                                onChange={(e) => setNoticeTitle(e.target.value)}
                                placeholder="e.g., Graphic Design Live Batch Orientation Schedule"
                                className="h-10 w-full rounded-xl border border-border bg-background px-3.5 text-sm outline-none focus:border-primary"
                              />
                            </div>
                            <div>
                              <label className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                Category
                              </label>
                              <select
                                value={noticeCategory}
                                onChange={(e) =>
                                  setNoticeCategory(e.target.value as NoticeCategory)
                                }
                                className="h-10 w-full rounded-xl border border-border bg-background px-3.5 text-sm outline-none focus:border-primary"
                              >
                                {NOTICE_CATEGORIES.map((cat) => (
                                  <option key={cat} value={cat}>
                                    {cat}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                              Notice Details / Message
                            </label>
                            <textarea
                              rows={3}
                              required
                              maxLength={VALIDATION_LIMITS.NOTICE_BODY_MAX}
                              value={noticeBody}
                              onChange={(e) => setNoticeBody(e.target.value)}
                              placeholder="Write the full website notice (Bengali or English)..."
                              className="w-full rounded-xl border border-border bg-background p-3.5 text-sm outline-none focus:border-primary"
                            />
                          </div>

                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                              <label className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                Optional Button Label
                              </label>
                              <input
                                type="text"
                                maxLength={VALIDATION_LIMITS.NOTICE_ACTION_LABEL_MAX}
                                value={noticeActionLabel}
                                onChange={(e) => setNoticeActionLabel(e.target.value)}
                                placeholder="e.g., Open Course"
                                className="h-10 w-full rounded-xl border border-border bg-background px-3.5 text-sm outline-none focus:border-primary"
                              />
                            </div>
                            <div>
                              <label className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                Target Website Page
                              </label>
                              <select
                                value={noticeActionRoute}
                                onChange={(e) => setNoticeActionRoute(e.target.value)}
                                className="h-10 w-full rounded-xl border border-border bg-background px-3.5 text-sm outline-none focus:border-primary"
                              >
                                <option value="">No Link Button</option>
                                <option value="/graphic-design-course">
                                  Paid Graphic Design &amp; AI Course (/graphic-design-course)
                                </option>
                                <option value="/courses">
                                  Free Quran Learning Course (/courses)
                                </option>
                                <option value="/books">Published Books Library (/books)</option>
                                <option value="/workshop">AI Workshop 2027 (/workshop)</option>
                                <option value="/projects">
                                  Projects &amp; Courses (/projects)
                                </option>
                                <option value="/contact">Contact Page (/contact)</option>
                              </select>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                            <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-foreground">
                              <input
                                type="checkbox"
                                checked={noticeIsPublished}
                                onChange={(e) => setNoticeIsPublished(e.target.checked)}
                                className="h-4 w-4 rounded border-border accent-primary"
                              />
                              Publish immediately to dashboard
                            </label>

                            <button
                              type="submit"
                              disabled={noticeSubmitting}
                              className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-full bg-primary px-6 text-xs font-semibold text-primary-foreground shadow-sm disabled:opacity-60"
                            >
                              {noticeSubmitting ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Send className="h-3.5 w-3.5" />
                              )}
                              {noticeIsPublished ? "Publish Notice" : "Save as Draft"}
                            </button>
                          </div>
                        </div>
                      </form>
                    )}
                  </div>
                )}

                {dashboardSection === "applications" && (
                  <div className="rounded-3xl border border-border/80 bg-background/60 p-6 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.07)] backdrop-blur-2xl sm:p-8">
                    <div className="mb-6 flex flex-col justify-between gap-4 border-b border-border/60 pb-5 sm:flex-row sm:items-center">
                      <div>
                        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                          Workshop, Mentorship &amp; General Requests
                        </span>
                        <h2 className="mt-1 font-display text-2xl font-bold tracking-tight">
                          Other Applications
                        </h2>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Submit applications for AI Workshops, 1-on-1 Mentorship, Certificates,
                          Partnerships, or Custom Quotes. Every submission waits for Admin approval.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowNewAppModal(true)}
                        className="inline-flex h-10 shrink-0 cursor-pointer items-center gap-1.5 rounded-full bg-primary px-5 text-xs font-semibold text-primary-foreground shadow-sm transition-transform hover:scale-[1.02]"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        New Application
                      </button>
                    </div>

                    {applicationsLoading ? (
                      <div className="flex flex-col items-center justify-center py-16 text-center">
                        <Loader2 className="mb-3 h-6 w-6 animate-spin text-muted-foreground" />
                        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                          Loading your applications…
                        </p>
                      </div>
                    ) : applications.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 p-10 text-center">
                        <ClipboardCheck className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
                        <h3 className="font-display text-lg font-bold">
                          No other applications submitted yet
                        </h3>
                        <p className="mx-auto mt-1.5 max-w-md text-xs font-light leading-relaxed text-muted-foreground sm:text-sm">
                          Need a workshop seat, custom quote, mentorship session, or certificate
                          verification? Submit your application here — Admin will manually approve
                          it.
                        </p>
                        <button
                          type="button"
                          onClick={() => setShowNewAppModal(true)}
                          className="mt-6 inline-flex h-10 cursor-pointer items-center gap-2 rounded-full bg-primary px-5 text-xs font-semibold text-primary-foreground shadow-sm"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Submit Application
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {applications.map((app) => {
                          const isApproved = app.status === "Approved";
                          const isPending = app.status === "Pending Verification";
                          return (
                            <div
                              key={app.id}
                              className="rounded-2xl border border-border/80 bg-background/80 p-5 shadow-sm sm:p-6"
                            >
                              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="rounded-lg bg-primary px-2.5 py-1 font-mono text-xs font-bold text-primary-foreground">
                                    {app.applicationCode}
                                  </span>
                                  <span className="rounded-full border border-border/80 bg-muted/50 px-3 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-foreground">
                                    {app.applicationCategory}
                                  </span>
                                  <span className="font-mono text-xs text-muted-foreground">
                                    Submitted: {app.submittedDate}
                                  </span>
                                </div>

                                <div className="flex flex-col items-end gap-1">
                                  <span
                                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider ${
                                      isApproved
                                        ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                                        : isPending
                                          ? "bg-amber-500/15 text-amber-800 dark:text-amber-200"
                                          : "bg-destructive/15 text-destructive"
                                    }`}
                                  >
                                    {isApproved ? (
                                      <CheckCircle2 className="h-3 w-3" />
                                    ) : isPending ? (
                                      <Clock className="h-3 w-3" />
                                    ) : (
                                      <XCircle className="h-3 w-3" />
                                    )}
                                    {app.status}
                                  </span>
                                  {app.approvedDate && (
                                    <span className="font-mono text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                                      Approved Date: {app.approvedDate}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="mt-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                                <div>
                                  <h3 className="font-display text-lg font-bold tracking-tight text-foreground">
                                    {app.subject}
                                  </h3>
                                  <p className="mt-1 whitespace-pre-line text-xs leading-relaxed text-muted-foreground sm:text-sm">
                                    {app.details}
                                  </p>
                                  {app.adminNote && (
                                    <p className="mt-2 rounded-xl border border-border/60 bg-muted/40 px-3 py-2 text-xs text-foreground">
                                      <strong>Admin Note:</strong> {app.adminNote}
                                    </p>
                                  )}
                                </div>
                                {app.amountBdt > 0 && (
                                  <div className="shrink-0 rounded-2xl border border-border/70 bg-muted/30 px-4 py-2.5 text-left sm:text-right">
                                    <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                                      Fee (BDT)
                                    </p>
                                    <p className="font-display text-lg font-bold tabular-nums text-foreground">
                                      ৳{app.amountBdt.toLocaleString("en-US")} BDT
                                    </p>
                                  </div>
                                )}
                              </div>

                              <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-border/60 pt-3 text-xs text-muted-foreground">
                                <span>
                                  Method:{" "}
                                  <strong className="text-foreground">{app.preferredMethod}</strong>
                                </span>
                                {app.referenceCode && (
                                  <span>
                                    Ref:{" "}
                                    <strong className="font-mono text-foreground">
                                      {app.referenceCode}
                                    </strong>
                                  </span>
                                )}
                                <span>
                                  Phone:{" "}
                                  <strong className="font-mono text-foreground">
                                    {app.applicantPhone || "N/A"}
                                  </strong>
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {dashboardSection === "admin" && isPrimaryAdmin && (
                  <div className="rounded-3xl border border-border/80 bg-background/60 p-6 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.07)] backdrop-blur-2xl sm:p-8">
                    {!isAdminUnlocked ? (
                      <div className="mx-auto max-w-md py-6">
                        <div className="mb-5 text-center">
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-muted/60 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-foreground">
                            <Lock className="h-3 w-3" />
                            Admin Password Verification Required
                          </span>
                          <h2 className="mt-3 font-display text-2xl font-bold tracking-tight">
                            Unlock Admin Verification Portal
                          </h2>
                          <p className="mt-1 text-xs text-muted-foreground">
                            অর্ডার, কোর্স এবং অন্যান্য আবেদন Approve করার আগে আপনার এডমিন পাসওয়ার্ড
                            দিয়ে পোর্টাল আনলক করুন।
                          </p>
                        </div>

                        <form onSubmit={handleAdminPortalLogin} className="space-y-4">
                          <div>
                            <label className="mb-1 block font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                              Admin Email
                            </label>
                            <input
                              type="email"
                              required
                              value={adminLoginEmail}
                              onChange={(e) => setAdminLoginEmail(e.target.value)}
                              className="h-10 w-full rounded-xl border border-border bg-background px-3.5 text-sm outline-none focus:border-primary"
                            />
                          </div>
                          <div>
                            <label className="mb-1 block font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                              Admin Password
                            </label>
                            <div className="relative">
                              <input
                                type={showAdminPassword ? "text" : "password"}
                                required
                                value={adminLoginPassword}
                                onChange={(e) => setAdminLoginPassword(e.target.value)}
                                placeholder="Enter admin password"
                                className="h-10 w-full rounded-xl border border-border bg-background pl-3.5 pr-10 text-sm outline-none focus:border-primary"
                              />
                              <button
                                type="button"
                                onClick={() => setShowAdminPassword((p) => !p)}
                                aria-label="Toggle password visibility"
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
                              >
                                {showAdminPassword ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          </div>

                          {adminAuthError && (
                            <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-3.5 py-2.5 text-xs font-medium text-destructive">
                              {adminAuthError}
                            </div>
                          )}

                          <button
                            type="submit"
                            disabled={adminAuthLoading}
                            className="inline-flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-primary px-6 text-xs font-semibold text-primary-foreground shadow-sm disabled:opacity-60"
                          >
                            {adminAuthLoading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Unlock className="h-4 w-4" />
                            )}
                            Unlock Admin Controls
                          </button>
                        </form>
                      </div>
                    ) : (
                      <>
                        <div className="mb-6 flex flex-col justify-between gap-4 border-b border-border/60 pb-5 sm:flex-row sm:items-center">
                          <div>
                            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                              Primary Admin Verification Center
                            </span>
                            <h2 className="mt-1 font-display text-2xl font-bold tracking-tight">
                              Manual Approval &amp; Order Control
                            </h2>
                            <p className="mt-1 text-xs text-muted-foreground">
                              Only items manually approved here display as Approved on client &amp;
                              student dashboards.
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={handleLockAdminPortal}
                            className="inline-flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-border/80 bg-background px-4 text-xs font-semibold text-foreground hover:bg-muted"
                          >
                            <Lock className="h-3.5 w-3.5" />
                            Lock Admin
                          </button>
                        </div>

                        {/* Admin Sub-tabs */}
                        <div className="mb-6 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => setAdminQueueTab("orders")}
                            className={`cursor-pointer rounded-full px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-widest transition-all ${
                              adminQueueTab === "orders"
                                ? "bg-primary text-primary-foreground shadow-sm"
                                : "border border-border/80 bg-muted/40 text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            Project Orders (
                            {
                              adminQueueOrders.filter(
                                (o) => o.projectStatus === "Pending Verification",
                              ).length
                            }{" "}
                            Pending)
                          </button>
                          <button
                            type="button"
                            onClick={() => setAdminQueueTab("courses")}
                            className={`cursor-pointer rounded-full px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-widest transition-all ${
                              adminQueueTab === "courses"
                                ? "bg-primary text-primary-foreground shadow-sm"
                                : "border border-border/80 bg-muted/40 text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            Course Applications (
                            {
                              adminQueuePurchases.filter(
                                (p) => p.paymentStatus === "Pending Verification",
                              ).length
                            }{" "}
                            Pending)
                          </button>
                          <button
                            type="button"
                            onClick={() => setAdminQueueTab("books")}
                            className={`cursor-pointer rounded-full px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-widest transition-all ${
                              adminQueueTab === "books"
                                ? "bg-primary text-primary-foreground shadow-sm"
                                : "border border-border/80 bg-muted/40 text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            Book Orders (
                            {
                              adminQueueBooks.filter(
                                (b) => b.paymentStatus === "Pending Verification",
                              ).length
                            }{" "}
                            Pending)
                          </button>
                          <button
                            type="button"
                            onClick={() => setAdminQueueTab("applications")}
                            className={`cursor-pointer rounded-full px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-widest transition-all ${
                              adminQueueTab === "applications"
                                ? "bg-primary text-primary-foreground shadow-sm"
                                : "border border-border/80 bg-muted/40 text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            Other Applications (
                            {
                              adminQueueApplications.filter(
                                (a) => a.status === "Pending Verification",
                              ).length
                            }{" "}
                            Pending)
                          </button>
                        </div>

                        {adminQueueTab === "orders" &&
                          (adminQueueOrders.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-border p-10 text-center text-xs text-muted-foreground">
                              No project order applications submitted yet.
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {adminQueueOrders.map((o) => (
                                <div
                                  key={o.id}
                                  className="rounded-2xl border border-border/80 bg-background/85 p-5 shadow-xs"
                                >
                                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
                                    <div>
                                      <p className="font-display text-base font-bold text-foreground">
                                        {o.orderNumber} · {o.projectTitle}
                                      </p>
                                      <p className="mt-0.5 text-xs text-muted-foreground">
                                        {o.clientName} ({o.clientEmail}) • {o.serviceCategory} (
                                        {o.packageTier})
                                      </p>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2">
                                      <span className="rounded-full border border-border/80 bg-muted/60 px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider">
                                        {o.billingStatus}
                                      </span>
                                      <span
                                        className={`rounded-full px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider ${
                                          o.projectStatus === "Completed" ||
                                          o.projectStatus === "Approved"
                                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                                            : o.projectStatus === "Pending Verification"
                                              ? "bg-amber-500/15 text-amber-800 dark:text-amber-200"
                                              : "bg-destructive/15 text-destructive"
                                        }`}
                                      >
                                        {o.projectStatus}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="mt-3 grid grid-cols-1 gap-2 text-xs sm:grid-cols-3">
                                    <div>
                                      <span className="text-muted-foreground">Amount: </span>
                                      <strong className="font-mono">
                                        ৳{getOrderAmountBdt(o).toLocaleString("en-US")} BDT
                                      </strong>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">
                                        Method &amp; Ref:{" "}
                                      </span>
                                      <strong className="font-mono">
                                        {o.billingMethod} ({o.billingReference})
                                      </strong>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Order Date: </span>
                                      <strong className="font-mono">{o.orderDate}</strong>
                                    </div>
                                  </div>

                                  {o.projectNotes && (
                                    <p className="mt-2 text-xs text-muted-foreground">
                                      Scope: {o.projectNotes}
                                    </p>
                                  )}

                                  <div className="mt-4 flex flex-col gap-3 border-t border-border/60 pt-3">
                                    <input
                                      type="text"
                                      value={adminNoteDrafts[o.id] ?? o.adminNote ?? ""}
                                      onChange={(e) =>
                                        setAdminNoteDrafts((prev) => ({
                                          ...prev,
                                          [o.id]: e.target.value,
                                        }))
                                      }
                                      placeholder="Optional admin verification note for client…"
                                      className="h-9 w-full rounded-xl border border-border bg-background px-3 text-xs outline-none focus:border-primary"
                                    />
                                    <div className="flex flex-wrap items-center gap-2">
                                      <button
                                        type="button"
                                        disabled={
                                          verifyingId === o.id || o.projectStatus === "Approved"
                                        }
                                        onClick={() =>
                                          handleAdminVerifyOrder(o, "Approved", "Approved")
                                        }
                                        className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full bg-primary px-4 text-[11px] font-semibold text-primary-foreground disabled:opacity-50"
                                      >
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                        Approve Order
                                      </button>
                                      <button
                                        type="button"
                                        disabled={
                                          verifyingId === o.id || o.projectStatus === "Completed"
                                        }
                                        onClick={() =>
                                          handleAdminVerifyOrder(o, "Completed", "Paid")
                                        }
                                        className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/15 px-4 text-[11px] font-semibold text-emerald-800 hover:bg-emerald-500/25 disabled:opacity-50 dark:text-emerald-200"
                                      >
                                        <Check className="h-3.5 w-3.5" />
                                        Mark Completed (Paid)
                                      </button>
                                      <button
                                        type="button"
                                        disabled={
                                          verifyingId === o.id || o.projectStatus === "Rejected"
                                        }
                                        onClick={() =>
                                          handleAdminVerifyOrder(o, "Rejected", "Rejected")
                                        }
                                        className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full border border-destructive/40 px-4 text-[11px] font-semibold text-destructive hover:bg-destructive/10 disabled:opacity-50"
                                      >
                                        <XCircle className="h-3.5 w-3.5" />
                                        Reject
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ))}

                        {adminQueueTab === "courses" &&
                          (adminQueuePurchases.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-border p-10 text-center text-xs text-muted-foreground">
                              No course enrollment applications submitted yet.
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {adminQueuePurchases.map((p) => (
                                <div
                                  key={p.id}
                                  className="rounded-2xl border border-border/80 bg-background/85 p-5 shadow-xs"
                                >
                                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
                                    <div>
                                      <p className="font-display text-base font-bold text-foreground">
                                        {p.studentName} ·{" "}
                                        <span className="font-mono text-xs font-normal text-muted-foreground">
                                          {p.studentEmail}
                                        </span>
                                      </p>
                                      <p className="mt-0.5 text-xs text-muted-foreground">
                                        {p.courseTitle} ({p.courseType})
                                      </p>
                                    </div>
                                    <span
                                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider ${
                                        p.paymentStatus === "Verified"
                                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                                          : p.paymentStatus === "Pending Verification"
                                            ? "bg-amber-500/15 text-amber-800 dark:text-amber-200"
                                            : "bg-destructive/15 text-destructive"
                                      }`}
                                    >
                                      {p.paymentStatus === "Verified"
                                        ? "Approved"
                                        : p.paymentStatus}
                                    </span>
                                  </div>

                                  <div className="mt-3 grid grid-cols-1 gap-2 text-xs sm:grid-cols-3">
                                    <div>
                                      <span className="text-muted-foreground">Fee: </span>
                                      <strong className="font-mono">
                                        {p.amountBdt > 0 ? `৳${p.amountBdt} BDT` : "Free"}
                                      </strong>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Ref: </span>
                                      <strong className="font-mono">{p.paymentReference}</strong>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Phone: </span>
                                      <strong className="font-mono">
                                        {p.studentPhone || "N/A"}
                                      </strong>
                                    </div>
                                  </div>

                                  <div className="mt-4 flex flex-col gap-3 border-t border-border/60 pt-3 sm:flex-row sm:items-center">
                                    <input
                                      type="text"
                                      value={adminNoteDrafts[p.id] ?? p.adminNote ?? ""}
                                      onChange={(e) =>
                                        setAdminNoteDrafts((prev) => ({
                                          ...prev,
                                          [p.id]: e.target.value,
                                        }))
                                      }
                                      placeholder="Optional verification note / batch link…"
                                      className="h-9 flex-1 rounded-xl border border-border bg-background px-3 text-xs outline-none focus:border-primary"
                                    />
                                    <div className="flex items-center gap-2">
                                      <button
                                        type="button"
                                        disabled={
                                          verifyingId === p.id || p.paymentStatus === "Verified"
                                        }
                                        onClick={() => handleAdminVerifyCourse(p, "Verified")}
                                        className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full bg-primary px-4 text-[11px] font-semibold text-primary-foreground disabled:opacity-50"
                                      >
                                        {verifyingId === p.id ? (
                                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        ) : (
                                          <CheckCircle2 className="h-3.5 w-3.5" />
                                        )}
                                        Approve Course
                                      </button>
                                      <button
                                        type="button"
                                        disabled={
                                          verifyingId === p.id || p.paymentStatus === "Rejected"
                                        }
                                        onClick={() => handleAdminVerifyCourse(p, "Rejected")}
                                        className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full border border-destructive/40 px-4 text-[11px] font-semibold text-destructive hover:bg-destructive/10 disabled:opacity-50"
                                      >
                                        <XCircle className="h-3.5 w-3.5" />
                                        Reject
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ))}

                        {adminQueueTab === "books" &&
                          (adminQueueBooks.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-border p-10 text-center text-xs text-muted-foreground">
                              No paid ebook orders submitted yet.
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {adminQueueBooks.map((b) => (
                                <div
                                  key={b.id}
                                  className="rounded-2xl border border-border/80 bg-background/85 p-5 shadow-xs"
                                >
                                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
                                    <div>
                                      <p className="font-display text-base font-bold text-foreground">
                                        {b.buyerName} ·{" "}
                                        <span className="font-mono text-xs font-normal text-muted-foreground">
                                          {b.buyerEmail}
                                        </span>
                                      </p>
                                      <p className="mt-0.5 text-xs text-muted-foreground">
                                        {b.bookTitle} ({b.purchaseDate})
                                      </p>
                                    </div>
                                    <span
                                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider ${
                                        b.paymentStatus === "Verified"
                                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                                          : b.paymentStatus === "Pending Verification"
                                            ? "bg-amber-500/15 text-amber-800 dark:text-amber-200"
                                            : "bg-destructive/15 text-destructive"
                                      }`}
                                    >
                                      {b.paymentStatus === "Verified"
                                        ? "Approved • Unlocked"
                                        : b.paymentStatus}
                                    </span>
                                  </div>

                                  <div className="mt-3 grid grid-cols-1 gap-2 text-xs sm:grid-cols-3">
                                    <div>
                                      <span className="text-muted-foreground">Price: </span>
                                      <strong className="font-mono">৳{b.amountBdt} BDT</strong>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">
                                        Method &amp; TrxID:{" "}
                                      </span>
                                      <strong className="font-mono">
                                        {b.paymentMethod} ({b.paymentReference})
                                      </strong>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Phone: </span>
                                      <strong className="font-mono">{b.buyerPhone || "N/A"}</strong>
                                    </div>
                                  </div>

                                  <div className="mt-4 flex flex-col gap-3 border-t border-border/60 pt-3 sm:flex-row sm:items-center">
                                    <input
                                      type="text"
                                      value={adminNoteDrafts[b.id] ?? b.adminNote ?? ""}
                                      onChange={(e) =>
                                        setAdminNoteDrafts((prev) => ({
                                          ...prev,
                                          [b.id]: e.target.value,
                                        }))
                                      }
                                      placeholder="Optional admin note for buyer…"
                                      className="h-9 flex-1 rounded-xl border border-border bg-background px-3 text-xs outline-none focus:border-primary"
                                    />
                                    <div className="flex items-center gap-2">
                                      <button
                                        type="button"
                                        disabled={
                                          verifyingId === b.id || b.paymentStatus === "Verified"
                                        }
                                        onClick={() => handleAdminVerifyBook(b, "Verified")}
                                        className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full bg-primary px-4 text-[11px] font-semibold text-primary-foreground disabled:opacity-50"
                                      >
                                        {verifyingId === b.id ? (
                                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        ) : (
                                          <CheckCircle2 className="h-3.5 w-3.5" />
                                        )}
                                        Approve &amp; Unlock PDF
                                      </button>
                                      <button
                                        type="button"
                                        disabled={
                                          verifyingId === b.id || b.paymentStatus === "Rejected"
                                        }
                                        onClick={() => handleAdminVerifyBook(b, "Rejected")}
                                        className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full border border-destructive/40 px-4 text-[11px] font-semibold text-destructive hover:bg-destructive/10 disabled:opacity-50"
                                      >
                                        <XCircle className="h-3.5 w-3.5" />
                                        Reject
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ))}

                        {adminQueueTab === "applications" &&
                          (adminQueueApplications.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-border p-10 text-center text-xs text-muted-foreground">
                              No service or workshop applications submitted yet.
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {adminQueueApplications.map((a) => (
                                <div
                                  key={a.id}
                                  className="rounded-2xl border border-border/80 bg-background/85 p-5 shadow-xs"
                                >
                                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
                                    <div>
                                      <p className="font-display text-base font-bold text-foreground">
                                        {a.applicationCode} · {a.subject}
                                      </p>
                                      <p className="mt-0.5 text-xs text-muted-foreground">
                                        {a.applicantName} ({a.applicantEmail}) •{" "}
                                        {a.applicationCategory}
                                      </p>
                                    </div>
                                    <span
                                      className={`rounded-full px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider ${
                                        a.status === "Approved"
                                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                                          : a.status === "Pending Verification"
                                            ? "bg-amber-500/15 text-amber-800 dark:text-amber-200"
                                            : "bg-destructive/15 text-destructive"
                                      }`}
                                    >
                                      {a.status}
                                    </span>
                                  </div>

                                  <p className="mt-2.5 text-xs leading-relaxed text-muted-foreground">
                                    {a.details}
                                  </p>

                                  <div className="mt-3 grid grid-cols-1 gap-2 text-xs sm:grid-cols-3">
                                    <div>
                                      <span className="text-muted-foreground">Method: </span>
                                      <strong className="font-mono">{a.preferredMethod}</strong>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Ref / Fee: </span>
                                      <strong className="font-mono">
                                        {a.referenceCode || "N/A"}
                                        {a.amountBdt > 0 ? ` • ৳${a.amountBdt} BDT` : ""}
                                      </strong>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Phone: </span>
                                      <strong className="font-mono">
                                        {a.applicantPhone || "N/A"}
                                      </strong>
                                    </div>
                                  </div>

                                  <div className="mt-4 flex flex-col gap-3 border-t border-border/60 pt-3 sm:flex-row sm:items-center">
                                    <input
                                      type="text"
                                      value={adminNoteDrafts[a.id] ?? a.adminNote ?? ""}
                                      onChange={(e) =>
                                        setAdminNoteDrafts((prev) => ({
                                          ...prev,
                                          [a.id]: e.target.value,
                                        }))
                                      }
                                      placeholder="Optional approval note or schedule link…"
                                      className="h-9 flex-1 rounded-xl border border-border bg-background px-3 text-xs outline-none focus:border-primary"
                                    />
                                    <div className="flex items-center gap-2">
                                      <button
                                        type="button"
                                        disabled={verifyingId === a.id || a.status === "Approved"}
                                        onClick={() => handleAdminVerifyApplication(a, "Approved")}
                                        className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full bg-primary px-4 text-[11px] font-semibold text-primary-foreground disabled:opacity-50"
                                      >
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                        Approve Application
                                      </button>
                                      <button
                                        type="button"
                                        disabled={verifyingId === a.id || a.status === "Rejected"}
                                        onClick={() => handleAdminVerifyApplication(a, "Rejected")}
                                        className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full border border-destructive/40 px-4 text-[11px] font-semibold text-destructive hover:bg-destructive/10 disabled:opacity-50"
                                      >
                                        <XCircle className="h-3.5 w-3.5" />
                                        Reject
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ))}
                      </>
                    )}
                  </div>
                )}

                {dashboardSection === "orders" && (
                  <div className="rounded-3xl border border-border/80 bg-background/60 p-6 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.07)] backdrop-blur-2xl sm:p-8">
                    <div className="mb-6 flex flex-col justify-between gap-4 border-b border-border/60 pb-5 sm:flex-row sm:items-center">
                      <div>
                        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                          Order History &amp; Billing Records
                        </span>
                        <h2 className="mt-1 font-display text-2xl font-bold tracking-tight">
                          Your Project Orders
                        </h2>
                      </div>

                      <div className="flex flex-wrap items-center gap-2.5">
                        {orders.length > 0 && (
                          <button
                            type="button"
                            onClick={handleDownloadAllOrdersCsv}
                            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border/80 bg-background/80 px-3.5 text-[11px] font-semibold text-foreground transition-colors hover:bg-muted"
                          >
                            <FileSpreadsheet className="h-3.5 w-3.5" />
                            Export All (CSV)
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setShowNewOrderModal(true)}
                          className="inline-flex h-9 items-center gap-1.5 rounded-full bg-primary px-4 text-[11px] font-semibold text-primary-foreground shadow-sm transition-transform hover:scale-105"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          New Order
                        </button>
                      </div>
                    </div>

                    {/* Filter Tabs */}
                    <div className="mb-6 flex flex-wrap gap-2">
                      {["All", ...PROJECT_STATUSES].map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setStatusFilter(st)}
                          className={`rounded-full px-3.5 py-1.5 font-mono text-[10px] font-bold uppercase tracking-widest transition-all ${
                            statusFilter === st
                              ? "bg-primary text-primary-foreground shadow-sm"
                              : "border border-border/70 bg-muted/40 text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>

                    {/* Orders List */}
                    {ordersLoading ? (
                      <div className="flex flex-col items-center justify-center py-16 text-center">
                        <Loader2 className="mb-3 h-6 w-6 animate-spin text-muted-foreground" />
                        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                          Loading your project orders…
                        </p>
                      </div>
                    ) : filteredOrders.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 p-10 text-center">
                        <Receipt className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
                        <h3 className="font-display text-lg font-bold">
                          {orders.length === 0
                            ? "No project orders placed yet"
                            : `No orders with status "${statusFilter}"`}
                        </h3>
                        <p className="mx-auto mt-1.5 max-w-md text-xs font-light leading-relaxed text-muted-foreground sm:text-sm">
                          Place a new project order for web development, app development, graphic
                          design, or video editing — or generate a sample order to preview invoice
                          downloads.
                        </p>
                        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                          <button
                            type="button"
                            onClick={() => setShowNewOrderModal(true)}
                            className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-xs font-semibold text-primary-foreground shadow-sm"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            Place Project Order
                          </button>
                          {orders.length === 0 && (
                            <button
                              type="button"
                              disabled={orderSubmitting}
                              onClick={handleSeedSampleOrder}
                              className="inline-flex h-10 items-center gap-2 rounded-full border border-border/80 bg-background px-5 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
                            >
                              <Sparkles className="h-3.5 w-3.5" />
                              Generate Sample Order
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-5">
                        {filteredOrders.map((order) => {
                          const orderAmountBdt = getOrderAmountBdt(order);
                          const completedDate = getOrderCompletedDate(order);
                          return (
                            <div
                              key={order.id}
                              className="group relative overflow-hidden rounded-2xl border border-border/80 bg-background/75 p-5 shadow-sm transition-all hover:border-foreground/30 sm:p-6"
                            >
                              {/* Top Row: Order Number, Date, Status Badges */}
                              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border/60 pb-4">
                                <div className="flex flex-wrap items-center gap-2.5">
                                  <span className="rounded-lg bg-primary px-2.5 py-1 font-mono text-xs font-bold text-primary-foreground">
                                    {order.orderNumber}
                                  </span>
                                  <span className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
                                    <Calendar className="h-3.5 w-3.5" />
                                    Order Date:{" "}
                                    <strong className="text-foreground">{order.orderDate}</strong>
                                  </span>
                                </div>

                                <div className="flex flex-col items-end gap-1.5">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span
                                      className={`rounded-full border px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest ${
                                        order.billingStatus === "Paid" ||
                                        order.billingStatus === "Approved"
                                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                                          : order.billingStatus === "Rejected"
                                            ? "border-destructive/30 bg-destructive/10 text-destructive"
                                            : "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-200"
                                      }`}
                                    >
                                      {order.billingStatus}
                                    </span>
                                    <span
                                      className={`rounded-full px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest ${
                                        order.projectStatus === "Completed" ||
                                        order.projectStatus === "Approved"
                                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                                          : order.projectStatus === "Cancelled" ||
                                              order.projectStatus === "Rejected"
                                            ? "bg-destructive/15 text-destructive"
                                            : order.projectStatus === "Pending Verification"
                                              ? "bg-amber-500/15 text-amber-800 dark:text-amber-200"
                                              : "bg-primary/10 text-foreground"
                                      }`}
                                    >
                                      {order.projectStatus}
                                    </span>
                                  </div>
                                  {completedDate && (
                                    <span className="font-mono text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                                      Completed Date: {completedDate}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Middle Row: Project Title, Category, Package, Amount (BDT) */}
                              <div className="mt-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                                <div>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                      {order.serviceCategory}
                                    </span>
                                    <span className="text-muted-foreground">•</span>
                                    <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-foreground">
                                      {order.packageTier} Tier
                                    </span>
                                  </div>
                                  <h3 className="mt-1 font-display text-lg font-bold tracking-tight sm:text-xl">
                                    {order.projectTitle}
                                  </h3>
                                  {order.projectNotes && (
                                    <p className="mt-1.5 text-xs font-light leading-relaxed text-muted-foreground sm:text-sm">
                                      {order.projectNotes}
                                    </p>
                                  )}
                                </div>

                                <div className="shrink-0 rounded-2xl border border-border/70 bg-muted/30 px-4 py-3 text-left sm:text-right">
                                  <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                                    Order Total (BDT)
                                  </p>
                                  <p className="font-display text-2xl font-bold tracking-tight tabular-nums text-foreground">
                                    ৳{orderAmountBdt.toLocaleString("en-US")}
                                    <span className="ml-1 text-xs font-normal text-muted-foreground">
                                      BDT
                                    </span>
                                  </p>
                                </div>
                              </div>

                              {/* Billing Method, Reference & Delivery Grid */}
                              <div className="mt-4 grid grid-cols-1 gap-3 rounded-xl border border-border/60 bg-muted/25 p-3.5 sm:grid-cols-3">
                                <div>
                                  <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                                    Billing Method
                                  </p>
                                  <p className="mt-0.5 flex items-center gap-1.5 text-xs font-semibold text-foreground">
                                    <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
                                    {order.billingMethod}
                                  </p>
                                </div>
                                <div>
                                  <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                                    Billing Reference
                                  </p>
                                  <p className="mt-0.5 truncate font-mono text-xs font-medium text-foreground">
                                    {order.billingReference}
                                  </p>
                                </div>
                                <div>
                                  <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                                    Est. Delivery
                                  </p>
                                  <p className="mt-0.5 flex items-center gap-1.5 text-xs font-medium text-foreground">
                                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                    {order.deliveryEstimate}
                                  </p>
                                </div>
                              </div>

                              {order.adminNote && (
                                <p className="mt-3 rounded-xl border border-border/60 bg-muted/40 px-3.5 py-2 text-xs text-foreground">
                                  <strong>Admin Note:</strong> {order.adminNote}
                                </p>
                              )}

                              {/* Bottom Row: Download Actions & Verification Status */}
                              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-2">
                                <div className="flex flex-wrap items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      downloadTextFile(
                                        `${order.orderNumber}-Invoice.html`,
                                        buildOrderInvoiceHtml(order, profile),
                                        "text/html;charset=utf-8",
                                      )
                                    }
                                    className="inline-flex h-9 items-center gap-1.5 rounded-full bg-primary px-4 text-[11px] font-semibold text-primary-foreground shadow-sm transition-all hover:scale-[1.02]"
                                  >
                                    <Download className="h-3.5 w-3.5" />
                                    Download Invoice (HTML/PDF)
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      downloadTextFile(
                                        `${order.orderNumber}-Receipt.txt`,
                                        buildOrderReceiptText(order, profile),
                                        "text/plain;charset=utf-8",
                                      )
                                    }
                                    className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border/80 bg-background px-3.5 text-[11px] font-semibold text-foreground transition-colors hover:bg-muted"
                                  >
                                    <FileText className="h-3.5 w-3.5" />
                                    Download Copy (.TXT)
                                  </button>
                                </div>

                                <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                  {order.projectStatus === "Pending Verification"
                                    ? "Awaiting Admin Approval"
                                    : order.projectStatus === "Completed"
                                      ? "Approved & Completed by Admin"
                                      : order.projectStatus === "Approved"
                                        ? "Approved by Admin"
                                        : order.projectStatus}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* New Project Order Modal */}
      {showNewOrderModal && user && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
          <div className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-border bg-background p-6 shadow-2xl sm:p-8">
            <div className="mb-6 flex items-center justify-between border-b border-border/60 pb-4">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  New Client Order
                </span>
                <h3 className="font-display text-2xl font-bold tracking-tight">
                  Place a Project Order
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowNewOrderModal(false)}
                className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-4">
              <div>
                <label className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Project Title
                </label>
                <input
                  type="text"
                  required
                  maxLength={VALIDATION_LIMITS.PROJECT_TITLE_MAX}
                  value={newProjectTitle}
                  onChange={(e) => setNewProjectTitle(e.target.value)}
                  placeholder="e.g., Corporate Website Redesign or YouTube Documentary Edit"
                  className="h-10 w-full rounded-xl border border-border bg-background px-3.5 text-sm outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Service Category
                  </label>
                  <select
                    value={newServiceCategory}
                    onChange={(e) => setNewServiceCategory(e.target.value as ServiceCategory)}
                    className="h-10 w-full rounded-xl border border-border bg-background px-3.5 text-sm outline-none focus:border-primary"
                  >
                    {SERVICE_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Package Tier
                  </label>
                  <select
                    value={newPackageTier}
                    onChange={(e) => setNewPackageTier(e.target.value as PackageTier)}
                    className="h-10 w-full rounded-xl border border-border bg-background px-3.5 text-sm outline-none focus:border-primary"
                  >
                    {PACKAGE_TIERS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Budget / Amount (BDT ৳)
                  </label>
                  <input
                    type="number"
                    min={100}
                    max={VALIDATION_LIMITS.AMOUNT_BDT_MAX}
                    required
                    value={newAmountBdt}
                    onChange={(e) => setNewAmountBdt(e.target.value)}
                    className="h-10 w-full rounded-xl border border-border bg-background px-3.5 text-sm outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Order Date
                  </label>
                  <input
                    type="date"
                    required
                    value={newOrderDate}
                    onChange={(e) => setNewOrderDate(e.target.value)}
                    className="h-10 w-full rounded-xl border border-border bg-background px-3.5 text-sm outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Delivery Estimate
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={VALIDATION_LIMITS.DELIVERY_ESTIMATE_MAX}
                    value={newDeliveryEstimate}
                    onChange={(e) => setNewDeliveryEstimate(e.target.value)}
                    placeholder="e.g., 10 Days"
                    className="h-10 w-full rounded-xl border border-border bg-background px-3.5 text-sm outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Billing Method
                  </label>
                  <select
                    value={newBillingMethod}
                    onChange={(e) => setNewBillingMethod(e.target.value as BillingMethod)}
                    className="h-10 w-full rounded-xl border border-border bg-background px-3.5 text-sm outline-none focus:border-primary"
                  >
                    {BILLING_METHODS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Billing Reference / TrxID
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={VALIDATION_LIMITS.BILLING_REFERENCE_MAX}
                    value={newBillingReference}
                    onChange={(e) => setNewBillingReference(e.target.value)}
                    placeholder="bKash •••• 7506 / TrxID"
                    className="h-10 w-full rounded-xl border border-border bg-background px-3.5 text-sm outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-2.5 text-[11px] font-medium text-amber-900 dark:text-amber-200">
                প্রতিটি নতুন প্রজেক্ট আবেদন শুরুতে <strong>Pending Verification</strong> অবস্থায় জমা
                হবে। প্রাইমারি এডমিন ম্যানুয়ালি Approve করলে আপনার ড্যাশবোর্ডে{" "}
                <strong>Approved</strong> হিসেবে দেখাবে।
              </div>

              <div>
                <label className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Project Scope &amp; Deliverables
                </label>
                <textarea
                  rows={3}
                  maxLength={VALIDATION_LIMITS.PROJECT_NOTES_MAX}
                  value={newProjectNotes}
                  onChange={(e) => setNewProjectNotes(e.target.value)}
                  placeholder="Describe key deliverables, references, or milestones…"
                  className="w-full rounded-xl border border-border bg-background p-3.5 text-sm outline-none focus:border-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewOrderModal(false)}
                  className="h-10 rounded-full border border-border px-5 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={orderSubmitting}
                  className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-full bg-primary px-6 text-xs font-semibold text-primary-foreground shadow-md disabled:opacity-60"
                >
                  {orderSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Submit Project Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Apply for Paid Course Modal */}
      {showCourseApplyModal && user && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
          <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-border bg-background p-6 shadow-2xl sm:p-8">
            <div className="mb-5 flex items-center justify-between border-b border-border/60 pb-4">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Course Enrollment Application
                </span>
                <h3 className="font-display text-xl font-bold tracking-tight">
                  Apply for Paid Course
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCourseApplyModal(false)}
                className="rounded-full p-2 text-muted-foreground hover:bg-muted"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCourseApplication} className="space-y-4">
              <div className="rounded-2xl border border-border/80 bg-muted/30 p-4">
                <p className="font-display text-sm font-bold text-foreground">
                  {GRAPHIC_DESIGN_COURSE.title}
                </p>
                <p className="mt-1 font-mono text-xs font-bold text-foreground">
                  Course Fee: ৳{GRAPHIC_DESIGN_COURSE.priceBdt.toLocaleString("en-US")} BDT
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  bKash / Nagad Personal: +880 1410-957506 — সেন্ড মানি করে আপনার TrxID নিচে লিখুন।
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Payment Method
                  </label>
                  <select
                    value={coursePayMethod}
                    onChange={(e) => setCoursePayMethod(e.target.value as BillingMethod)}
                    className="h-10 w-full rounded-xl border border-border bg-background px-3.5 text-sm outline-none focus:border-primary"
                  >
                    {BILLING_METHODS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Phone / WhatsApp
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={VALIDATION_LIMITS.PHONE_MAX}
                    value={courseStudentPhone}
                    onChange={(e) => setCourseStudentPhone(e.target.value)}
                    placeholder="+880 1XXX-XXXXXX"
                    className="h-10 w-full rounded-xl border border-border bg-background px-3.5 text-sm outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Transaction ID / Payment Reference
                </label>
                <input
                  type="text"
                  required
                  maxLength={VALIDATION_LIMITS.BILLING_REFERENCE_MAX}
                  value={coursePayRef}
                  onChange={(e) => setCoursePayRef(e.target.value)}
                  placeholder="e.g., BKH8A93K21P"
                  className="h-10 w-full rounded-xl border border-border bg-background px-3.5 text-sm outline-none focus:border-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCourseApplyModal(false)}
                  className="h-10 rounded-full border border-border px-5 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={courseApplySubmitting}
                  className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-full bg-primary px-6 text-xs font-semibold text-primary-foreground shadow-md disabled:opacity-60"
                >
                  {courseApplySubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Submit Course Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Other / Service Application Modal */}
      {showNewAppModal && user && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
          <div className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-border bg-background p-6 shadow-2xl sm:p-8">
            <div className="mb-5 flex items-center justify-between border-b border-border/60 pb-4">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  General Request Application
                </span>
                <h3 className="font-display text-xl font-bold tracking-tight">
                  Submit Other Application
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowNewAppModal(false)}
                className="rounded-full p-2 text-muted-foreground hover:bg-muted"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateServiceApplication} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Application Category
                  </label>
                  <select
                    value={appCategory}
                    onChange={(e) => setAppCategory(e.target.value as ApplicationCategory)}
                    className="h-10 w-full rounded-xl border border-border bg-background px-3.5 text-sm outline-none focus:border-primary"
                  >
                    {APPLICATION_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Preferred Method
                  </label>
                  <select
                    value={appMethod}
                    onChange={(e) => setAppMethod(e.target.value as ApplicationMethod)}
                    className="h-10 w-full rounded-xl border border-border bg-background px-3.5 text-sm outline-none focus:border-primary"
                  >
                    {APPLICATION_METHODS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Application Subject
                </label>
                <input
                  type="text"
                  required
                  maxLength={VALIDATION_LIMITS.APPLICATION_SUBJECT_MAX}
                  value={appSubject}
                  onChange={(e) => setAppSubject(e.target.value)}
                  placeholder="e.g., AI Workshop 2027 Seat Registration"
                  className="h-10 w-full rounded-xl border border-border bg-background px-3.5 text-sm outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Optional Fee (BDT ৳)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={500000}
                    value={appAmountBdt}
                    onChange={(e) => setAppAmountBdt(e.target.value)}
                    className="h-10 w-full rounded-xl border border-border bg-background px-3.5 text-sm outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Reference / TrxID
                  </label>
                  <input
                    type="text"
                    maxLength={VALIDATION_LIMITS.APPLICATION_REFERENCE_MAX}
                    value={appRef}
                    onChange={(e) => setAppRef(e.target.value)}
                    placeholder="Optional TrxID"
                    className="h-10 w-full rounded-xl border border-border bg-background px-3.5 text-sm outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Phone / WhatsApp
                  </label>
                  <input
                    type="text"
                    maxLength={VALIDATION_LIMITS.PHONE_MAX}
                    value={appPhone}
                    onChange={(e) => setAppPhone(e.target.value)}
                    placeholder="+880 1XXX-XXXXXX"
                    className="h-10 w-full rounded-xl border border-border bg-background px-3.5 text-sm outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Application Details
                </label>
                <textarea
                  rows={3}
                  required
                  maxLength={VALIDATION_LIMITS.APPLICATION_DETAILS_MAX}
                  value={appDetails}
                  onChange={(e) => setAppDetails(e.target.value)}
                  placeholder="Write full details of your request…"
                  className="w-full rounded-xl border border-border bg-background p-3.5 text-sm outline-none focus:border-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewAppModal(false)}
                  className="h-10 rounded-full border border-border px-5 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={appSubmitting}
                  className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-full bg-primary px-6 text-xs font-semibold text-primary-foreground shadow-md disabled:opacity-60"
                >
                  {appSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Portal Login Modal (Accessible from Header even when logged in as viewer/admin) */}
      {showAdminLoginModal && (
        <div className="fixed inset-0 z-[85] flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-3xl border border-border bg-background p-6 shadow-2xl sm:p-8">
            <div className="mb-5 flex items-center justify-between border-b border-border/60 pb-4">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Primary Admin Access
                </span>
                <h3 className="font-display text-xl font-bold tracking-tight">
                  Admin Dashboard Login
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAdminLoginModal(false)}
                className="rounded-full p-2 text-muted-foreground hover:bg-muted"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAdminPortalLogin} className="space-y-4">
              <div>
                <label className="mb-1 block font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Admin Email
                </label>
                <input
                  type="email"
                  required
                  value={adminLoginEmail}
                  onChange={(e) => setAdminLoginEmail(e.target.value)}
                  className="h-10 w-full rounded-xl border border-border bg-background px-3.5 text-sm outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="mb-1 block font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Admin Password
                </label>
                <div className="relative">
                  <input
                    type={showAdminPassword ? "text" : "password"}
                    required
                    value={adminLoginPassword}
                    onChange={(e) => setAdminLoginPassword(e.target.value)}
                    placeholder="Enter admin password"
                    className="h-10 w-full rounded-xl border border-border bg-background pl-3.5 pr-10 text-sm outline-none focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPassword((p) => !p)}
                    aria-label="Toggle password visibility"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
                  >
                    {showAdminPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {adminAuthError && (
                <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-3.5 py-2.5 text-xs font-medium text-destructive">
                  {adminAuthError}
                </div>
              )}

              <button
                type="submit"
                disabled={adminAuthLoading}
                className="inline-flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-primary px-6 text-xs font-semibold text-primary-foreground shadow-md disabled:opacity-60"
              >
                {adminAuthLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ShieldCheck className="h-4 w-4" />
                )}
                Login to Admin Dashboard
              </button>

              {(adminNeedsGoogleLink || adminNeedsEmailVerify) && (
                <div className="space-y-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3.5">
                  <p className="text-[11px] font-medium text-emerald-900 dark:text-emerald-200">
                    পাসওয়ার্ড যাচাই হয়েছে! প্রাইমারি এডমিন Firebase টোকেন সক্রিয় করতে Google দিয়ে
                    যাচাই করুন:
                  </p>
                  <button
                    type="button"
                    disabled={adminAuthLoading}
                    onClick={handleCompleteAdminGoogleVerify}
                    className="inline-flex h-9 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-emerald-700 px-4 text-[11px] font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Complete Admin Google Sign-In
                  </button>
                  {adminNeedsEmailVerify && auth.currentUser && (
                    <button
                      type="button"
                      onClick={() => sendAdminVerificationEmail(auth.currentUser!).catch(() => {})}
                      className="inline-flex h-8 w-full cursor-pointer items-center justify-center gap-1.5 rounded-full border border-emerald-700/40 px-3 text-[10px] font-semibold text-emerald-900 dark:text-emerald-100"
                    >
                      Send Verification Email
                    </button>
                  )}
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav activePath="/account" />
    </div>
  );
}
