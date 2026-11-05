import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import {
  collection,
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
  Bell,
  Briefcase,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  CreditCard,
  Download,
  FileSpreadsheet,
  FileText,
  Globe2,
  Loader2,
  LogOut,
  Mail,
  MapPin,
  Menu,
  Phone,
  Plus,
  Receipt,
  Save,
  Search,
  ShieldCheck,
  Sparkles,
  User as UserIcon,
  Wallet,
  X,
} from "lucide-react";
import { MobileBottomNav, MobileHeaderMenu } from "@/components/MobileNavigation";
import { PWAInstallButton } from "@/components/PWAInstallButton";
import {
  auth,
  BILLING_METHODS,
  BILLING_STATUSES,
  type BillingMethod,
  type BillingStatus,
  db,
  handleFirestoreError,
  logOutUser,
  OperationType,
  PACKAGE_TIERS,
  type PackageTier,
  PROJECT_STATUSES,
  type ProjectOrderRecord,
  type ProjectStatus,
  SERVICE_CATEGORIES,
  type ServiceCategory,
  signInWithGoogle,
  truncateString,
  type UserProfileRecord,
  VALIDATION_LIMITS,
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

function buildOrderReceiptText(
  order: ProjectOrderRecord,
  profile: UserProfileRecord | null,
): string {
  return [
    "================================================================",
    "         SAKIBUL ISLAM SABBIR — OFFICIAL ORDER RECEIPT          ",
    "     Creative Design, Video Production & Web/App Engineering    ",
    "================================================================",
    "",
    `ORDER NUMBER      : ${order.orderNumber}`,
    `ORDER DATE        : ${order.orderDate}`,
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
    "BILLING & PAYMENT SUMMARY",
    "----------------------------------------------------------------",
    `Billing Method    : ${order.billingMethod}`,
    `Billing Reference : ${order.billingReference}`,
    `Payment Status    : ${order.billingStatus}`,
    `Total Amount (USD): $${order.amountUsd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    "",
    "================================================================",
    "Thank you for collaborating with Sakibul Islam Sabbir.",
    "Contact: sakibulislam.rc@gmail.com | WhatsApp: +880 1410 957 506",
    "================================================================",
  ].join("\n");
}

function buildOrderInvoiceHtml(
  order: ProjectOrderRecord,
  profile: UserProfileRecord | null,
): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Invoice ${order.orderNumber} — Sakibul Islam Sabbir</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; color: #0f172a; margin: 0; padding: 40px 20px; }
    .card { max-width: 760px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 20px; padding: 40px; box-shadow: 0 20px 50px rgba(15, 23, 42, 0.06); }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid #e2e8f0; padding-bottom: 24px; margin-bottom: 28px; }
    .brand { font-size: 24px; font-weight: 800; letter-spacing: -0.03em; }
    .badge { display: inline-block; background: #0f172a; color: #ffffff; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; padding: 6px 12px; border-radius: 999px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 28px; }
    .label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.14em; color: #64748b; margin-bottom: 6px; }
    .val { font-size: 14px; font-weight: 600; color: #0f172a; margin: 2px 0; }
    table { width: 100%; border-collapse: collapse; margin: 24px 0; }
    th { text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.12em; color: #64748b; border-bottom: 1px solid #e2e8f0; padding: 12px 8px; }
    td { padding: 16px 8px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
    .total-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 20px; margin-top: 20px; display: flex; justify-content: space-between; align-items: center; }
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
        <span class="badge">${order.billingStatus}</span>
        <div style="font-size: 18px; font-weight: 800; margin-top: 8px;">${order.orderNumber}</div>
        <div style="font-size: 12px; color: #64748b;">Order Date: ${order.orderDate}</div>
      </div>
    </div>
    <div class="grid">
      <div>
        <div class="label">Billed To</div>
        <div class="val">${order.clientName}</div>
        <div style="font-size: 13px; color: #475569;">${order.clientEmail}</div>
        <div style="font-size: 13px; color: #475569;">${profile?.company || "Direct Client"} • ${profile?.location || "Global"}</div>
      </div>
      <div>
        <div class="label">Billing &amp; Delivery Details</div>
        <div class="val">Method: ${order.billingMethod}</div>
        <div style="font-size: 13px; color: #475569;">Reference: ${order.billingReference}</div>
        <div style="font-size: 13px; color: #475569;">Project Status: ${order.projectStatus} (${order.deliveryEstimate})</div>
      </div>
    </div>
    <table>
      <thead>
        <tr>
          <th>Project &amp; Scope</th>
          <th>Category</th>
          <th>Package Tier</th>
          <th style="text-align: right;">Amount (USD)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <div style="font-weight: 700;">${order.projectTitle}</div>
            <div style="font-size: 12px; color: #64748b; margin-top: 4px;">${order.projectNotes || "Full deliverable package"}</div>
          </td>
          <td>${order.serviceCategory}</td>
          <td>${order.packageTier}</td>
          <td style="text-align: right; font-weight: 700;">$${order.amountUsd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        </tr>
      </tbody>
    </table>
    <div class="total-box">
      <div>
        <div class="label">Payment Method &amp; Verification</div>
        <div class="val">${order.billingMethod} (${order.billingReference}) — ${order.billingStatus}</div>
      </div>
      <div style="text-align: right;">
        <div class="label">Total Billed</div>
        <div class="total-amount">$${order.amountUsd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD</div>
      </div>
    </div>
    <div class="footer">
      Official Project Order Copy • Sakibul Islam Sabbir (sakibulislam.rc@gmail.com • +880 1410 957 506)
    </div>
  </div>
</body>
</html>`;
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

  // Orders state
  const [orders, setOrders] = useState<ProjectOrderRecord[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("All");

  // New Order Form state
  const [newProjectTitle, setNewProjectTitle] = useState("");
  const [newServiceCategory, setNewServiceCategory] = useState<ServiceCategory>("Web Development");
  const [newPackageTier, setNewPackageTier] = useState<PackageTier>("Professional");
  const [newAmountUsd, setNewAmountUsd] = useState("450");
  const [newBillingMethod, setNewBillingMethod] = useState<BillingMethod>("bKash");
  const [newBillingReference, setNewBillingReference] = useState("");
  const [newBillingStatus, setNewBillingStatus] = useState<BillingStatus>("Paid");
  const [newOrderDate, setNewOrderDate] = useState(todayIsoDate());
  const [newDeliveryEstimate, setNewDeliveryEstimate] = useState("14 Days");
  const [newProjectNotes, setNewProjectNotes] = useState("");

  // Track Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setAuthReady(true);

      if (!currentUser) {
        setProfile(null);
        setOrders([]);
        return;
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
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, userDocPath);
      }
    });

    return () => unsubscribe();
  }, []);

  // Subscribe to authenticated user's orders
  useEffect(() => {
    if (!authReady || !user) return;

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
        // Sort newest orderDate first
        list.sort((a, b) => b.orderDate.localeCompare(a.orderDate));
        setOrders(list);
        setOrdersLoading(false);
      },
      (error) => {
        setOrdersLoading(false);
        handleFirestoreError(error, OperationType.LIST, ordersPath);
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

  const handleSignOut = async () => {
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
    const parsedAmount = Math.min(
      VALIDATION_LIMITS.AMOUNT_MAX,
      Math.max(1, Number(newAmountUsd) || 250),
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
      amountUsd: parsedAmount,
      billingMethod: newBillingMethod,
      billingReference: truncateString(
        newBillingReference || billingDetails || `${newBillingMethod} Verified Account`,
        VALIDATION_LIMITS.BILLING_REFERENCE_MAX,
      ),
      billingStatus: newBillingStatus,
      projectStatus: "In Progress" as ProjectStatus,
      orderDate: truncateString(newOrderDate || todayIsoDate(), VALIDATION_LIMITS.ORDER_DATE_MAX),
      deliveryEstimate: truncateString(
        newDeliveryEstimate || "14 Days",
        VALIDATION_LIMITS.DELIVERY_ESTIMATE_MAX,
      ),
      projectNotes: truncateString(newProjectNotes, VALIDATION_LIMITS.PROJECT_NOTES_MAX),
      clientName: truncateString(
        displayName || user.displayName || "Valued Client",
        VALIDATION_LIMITS.DISPLAY_NAME_MAX,
      ),
      clientEmail: truncateString(
        user.email || profile?.email || "client@example.com",
        VALIDATION_LIMITS.EMAIL_MAX,
      ),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    try {
      await setDoc(doc(db, "orders", orderId), payload);
      setNewProjectTitle("");
      setNewProjectNotes("");
      setShowNewOrderModal(false);
      setBannerMessage({
        type: "success",
        text: `Order ${payload.orderNumber} placed! You can now view billing details or download your receipt below.`,
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
    const payload = {
      uid: truncateString(user.uid, 128),
      orderNumber: generateOrderNumber(),
      projectTitle: "Full-Stack Brand Website & High-Retention Video Reel Suite",
      serviceCategory: "Web Development" as ServiceCategory,
      packageTier: "Enterprise" as PackageTier,
      amountUsd: 1250,
      billingMethod: preferredBillingMethod || ("Dutch-Bangla Bank" as BillingMethod),
      billingReference: truncateString(
        billingDetails || "DBBL Agent Banking •••• 9506",
        VALIDATION_LIMITS.BILLING_REFERENCE_MAX,
      ),
      billingStatus: "Paid" as BillingStatus,
      projectStatus: "In Progress" as ProjectStatus,
      orderDate: todayIsoDate(),
      deliveryEstimate: "14 Business Days",
      projectNotes:
        "Complete responsive glassmorphic web platform, brand visual system, and 4 vertical short-form promotional video edits.",
      clientName: truncateString(
        displayName || user.displayName || "Valued Client",
        VALIDATION_LIMITS.DISPLAY_NAME_MAX,
      ),
      clientEmail: truncateString(
        user.email || profile?.email || "client@example.com",
        VALIDATION_LIMITS.EMAIL_MAX,
      ),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    try {
      await setDoc(doc(db, "orders", orderId), payload);
      setBannerMessage({
        type: "success",
        text: `Sample project order (${payload.orderNumber}) added to your account.`,
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    } finally {
      setOrderSubmitting(false);
    }
  };

  const handleUpdateOrderStatus = async (
    order: ProjectOrderRecord,
    nextStatus: ProjectStatus,
    nextBillingStatus?: BillingStatus,
  ) => {
    if (!user) return;
    if (order.projectStatus === "Completed" || order.projectStatus === "Cancelled") return;
    const path = `orders/${order.id}`;
    try {
      await updateDoc(doc(db, "orders", order.id), {
        projectStatus: nextStatus,
        billingStatus: nextBillingStatus || order.billingStatus,
        updatedAt: serverTimestamp(),
      });
      setBannerMessage({
        type: "success",
        text: `Order ${order.orderNumber} updated to "${nextStatus}".`,
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const handleDownloadAllOrdersCsv = () => {
    if (orders.length === 0) return;
    const headers = [
      "Order Number",
      "Order Date",
      "Project Title",
      "Service Category",
      "Package Tier",
      "Amount (USD)",
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
        `"${o.projectTitle.replace(/"/g, '""')}"`,
        o.serviceCategory,
        o.packageTier,
        o.amountUsd,
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

  const totalSpentUsd = useMemo(
    () =>
      orders
        .filter((o) => o.projectStatus !== "Cancelled")
        .reduce((sum, o) => sum + (Number(o.amountUsd) || 0), 0),
    [orders],
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
              aria-label="Notifications"
              className="rounded-full p-2 text-muted-foreground transition-all hover:bg-accent hover:text-foreground"
            >
              <Bell className="h-4 w-4" />
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
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setShowNewOrderModal(true)}
                className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-6 text-xs font-semibold text-primary-foreground shadow-lg shadow-black/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Plus className="h-4 w-4" />
                Place Project Order
              </button>
              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex h-11 items-center gap-2 rounded-full border border-border/80 bg-background/70 px-5 text-xs font-semibold text-foreground backdrop-blur-md transition-all hover:bg-muted"
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

            {/* Preview Card on Right */}
            <div className="flex flex-col justify-between rounded-3xl border border-border/80 bg-background/50 p-7 backdrop-blur-2xl sm:p-8 lg:col-span-5">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Supported Billing Methods
                </p>
                <h3 className="mt-2 font-display text-xl font-bold tracking-tight">
                  Flexible Local &amp; Global Billing
                </h3>
                <p className="mt-2 text-xs font-light leading-relaxed text-muted-foreground sm:text-sm">
                  All project orders record your chosen payment method, reference ID, order date,
                  and package tier for transparent accounting.
                </p>

                <div className="mt-5 grid grid-cols-2 gap-2.5">
                  {BILLING_METHODS.map((method) => (
                    <div
                      key={method}
                      className="flex items-center gap-2 rounded-xl border border-border/60 bg-muted/30 px-3 py-2.5 text-xs font-medium text-foreground"
                    >
                      <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
                      {method}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-border/60 bg-muted/40 p-4">
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Firebase Project Connected
                </p>
                <p className="mt-1 font-mono text-xs font-semibold text-foreground">
                  sabbir-portfolio-b86e1
                </p>
                <p className="mt-0.5 text-[11px] font-light text-muted-foreground">
                  Protected by Zero-Trust Firestore Security Rules with strict owner isolation.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Signed-In Dashboard */
          <div className="space-y-10">
            {/* Top Summary Metrics Row */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-3xl border border-border/80 bg-background/60 p-5 shadow-sm backdrop-blur-2xl">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    Authenticated Account
                  </span>
                  <ShieldCheck className="h-4 w-4 text-foreground" />
                </div>
                <p className="mt-2 truncate font-display text-lg font-bold">{displayName}</p>
                <p className="truncate font-mono text-[11px] text-muted-foreground">{user.email}</p>
              </div>

              <div className="rounded-3xl border border-border/80 bg-background/60 p-5 shadow-sm backdrop-blur-2xl">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    Total Project Orders
                  </span>
                  <Briefcase className="h-4 w-4 text-foreground" />
                </div>
                <p className="mt-2 font-display text-2xl font-bold">{orders.length}</p>
                <p className="font-mono text-[11px] text-muted-foreground">
                  {orders.filter((o) => o.projectStatus === "In Progress").length} Active •{" "}
                  {orders.filter((o) => o.projectStatus === "Completed").length} Completed
                </p>
              </div>

              <div className="rounded-3xl border border-border/80 bg-background/60 p-5 shadow-sm backdrop-blur-2xl">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    Preferred Billing
                  </span>
                  <Wallet className="h-4 w-4 text-foreground" />
                </div>
                <p className="mt-2 font-display text-lg font-bold">{preferredBillingMethod}</p>
                <p className="truncate font-mono text-[11px] text-muted-foreground">
                  {billingDetails || "No reference saved"}
                </p>
              </div>

              <div className="rounded-3xl border border-border/80 bg-background/60 p-5 shadow-sm backdrop-blur-2xl">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    Total Order Volume
                  </span>
                  <Receipt className="h-4 w-4 text-foreground" />
                </div>
                <p className="mt-2 font-display text-2xl font-bold">
                  ${totalSpentUsd.toLocaleString("en-US")}
                </p>
                <p className="font-mono text-[11px] text-muted-foreground">
                  Downloadable receipts available
                </p>
              </div>
            </div>

            {/* Main Two-Column Layout: Left = Profile & Billing Settings, Right = Project Orders */}
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

              {/* Right Column: Project Orders & Downloadable Receipts */}
              <div className="lg:col-span-7">
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
                      {filteredOrders.map((order) => (
                        <div
                          key={order.id}
                          className="group relative overflow-hidden rounded-2xl border border-border/80 bg-background/75 p-5 shadow-sm transition-all hover:border-foreground/30 sm:p-6"
                        >
                          {/* Top Row: Order Number, Date, Status Badges */}
                          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
                            <div className="flex flex-wrap items-center gap-2.5">
                              <span className="rounded-lg bg-primary px-2.5 py-1 font-mono text-xs font-bold text-primary-foreground">
                                {order.orderNumber}
                              </span>
                              <span className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
                                <Calendar className="h-3.5 w-3.5" />
                                Ordered:{" "}
                                <strong className="text-foreground">{order.orderDate}</strong>
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-full border border-border/80 bg-muted/60 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-foreground">
                                {order.billingStatus}
                              </span>
                              <span
                                className={`rounded-full px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest ${
                                  order.projectStatus === "Completed"
                                    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                                    : order.projectStatus === "Cancelled"
                                      ? "bg-destructive/15 text-destructive"
                                      : "bg-primary/10 text-foreground"
                                }`}
                              >
                                {order.projectStatus}
                              </span>
                            </div>
                          </div>

                          {/* Middle Row: Project Title, Category, Package, Amount */}
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
                                Order Total
                              </p>
                              <p className="font-display text-2xl font-bold tracking-tight text-foreground">
                                ${order.amountUsd.toLocaleString("en-US")}
                                <span className="ml-1 text-xs font-normal text-muted-foreground">
                                  USD
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

                          {/* Bottom Row: Download Actions & Status Controls */}
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

                            {order.projectStatus !== "Completed" &&
                              order.projectStatus !== "Cancelled" && (
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleUpdateOrderStatus(order, "Completed", "Paid")
                                    }
                                    className="inline-flex h-8 items-center gap-1 rounded-full border border-border/70 bg-muted/50 px-3 text-[10px] font-bold uppercase tracking-wider text-foreground transition-colors hover:bg-muted"
                                  >
                                    <Check className="h-3 w-3" />
                                    Mark Completed
                                  </button>
                                </div>
                              )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
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
                    Budget / Amount (USD)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={VALIDATION_LIMITS.AMOUNT_MAX}
                    required
                    value={newAmountUsd}
                    onChange={(e) => setNewAmountUsd(e.target.value)}
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

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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

                <div>
                  <label className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Payment Status
                  </label>
                  <select
                    value={newBillingStatus}
                    onChange={(e) => setNewBillingStatus(e.target.value as BillingStatus)}
                    className="h-10 w-full rounded-xl border border-border bg-background px-3.5 text-sm outline-none focus:border-primary"
                  >
                    {BILLING_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
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
                  className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-6 text-xs font-semibold text-primary-foreground shadow-md disabled:opacity-60"
                >
                  {orderSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Confirm &amp; Create Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav activePath="/account" />
    </div>
  );
}
