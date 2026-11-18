# Firestore Security Specification (`security_spec.md`)

## 1. Data Invariants

1. **Default-Deny Catch-All**: Every path not explicitly matched under `/users/{userId}`, `/orders/{orderId}`, `/coursePurchases/{purchaseId}`, or `/notices/{noticeId}` is strictly denied (`allow read, write: if false;`).
2. **Exclusive Primary Admin Lock (`isCourseAdmin()`)**:
   - Only the single primary admin email (`sakibulislamsbmc@gmail.com`) with `email_verified == true` has admin privileges (`verify/reject` paid course purchases, read admin queue, publish/update/delete `/notices/{noticeId}`).
   - Every other verified Google account has strictly viewer/student/client permissions.
3. **Verified Identity & Ownership (`UserProfile` at `/users/{userId}`)**:
   - Only a signed-in user with `request.auth.token.email_verified == true` and `request.auth.uid == userId` can read (`get`), `create`, or `update` their own profile document `/users/{userId}` with `email == request.auth.token.email`.
   - `list` and `delete` on `/users/{userId}` are forbidden to prevent user enumeration and accidental profile destruction.
   - `uid` and `createdAt` are immutable on update (`incoming().uid == existing().uid && incoming().createdAt == existing().createdAt`).
   - All string fields enforce strict length limits matching `firebase-blueprint.json`, and `preferredBillingMethod` is restricted to the allowed enum list.
4. **Relational Sync & Admin-Only Approval (`ProjectOrder` at `/orders/{orderId}`)**:
   - An order can only be created by an authenticated, email-verified user (`request.auth.token.email_verified == true`) whose `/users/$(request.auth.uid)` profile document exists (`exists(/databases/$(database)/documents/users/$(request.auth.uid))`), with `clientEmail == request.auth.token.email`.
   - `incoming().uid` must equal `request.auth.uid`.
   - On creation by any user, `billingStatus` MUST be `'Pending Verification'`, `projectStatus` MUST be `'Pending Verification'`, `completedDate` MUST be `''`, `verifiedByEmail` MUST be `''`, and `adminNote` MUST be `''`. Regular users CANNOT self-approve orders as `Paid`, `Approved`, or `Completed`.
   - `get` and `list` on `/orders/{orderId}` are restricted to the owner (`existing().uid == request.auth.uid`) OR the primary admin (`isCourseAdmin()`).
   - Regular owners can ONLY update `billingMethod`, `billingReference`, and `projectNotes` (and resubmit a `'Rejected'` order back to `'Pending Verification'`). ONLY the primary admin (`isCourseAdmin()`) can transition `projectStatus` to `'Approved'`, `'In Progress'`, `'In Review'`, `'Completed'`, `'Rejected'`, or `'Cancelled'`, update `billingStatus` (`'Paid'`), or set `completedDate`.
   - Terminal State Locking prevents updates once `existing().projectStatus in ['Completed', 'Cancelled']` (except primary admin corrections if needed, or strictly locked).
   - Timestamp fields (`createdAt` on create, `updatedAt` on create/update) must equal `request.time`.
5. **Course Enrollment & Payment Verification (`CoursePurchase` at `/coursePurchases/{purchaseId}`)**:
   - Students must sign in with a verified Google account (`isVerifiedUser()`), with `purchaseId == request.auth.uid + '_' + incoming().courseId` and `studentEmail == request.auth.token.email`.
   - `Free Course` creation is locked strictly to `courseId == 'shohoj-sutre-quran-shikhi'`; `Paid Course` creation is locked to `courseId == 'advanced-graphic-design-ai-live'`, `amountBdt >= 6000`, `paymentStatus == 'Pending Verification'`, zero progress, and empty admin verification metadata so students cannot bypass payment or self-approve access.
   - Only the primary admin (`isCourseAdmin()`) can transition `paymentStatus` to `'Verified'` or `'Rejected'` (`verifiedByEmail == request.auth.token.email`).
   - Students can update lesson completion and quiz progress (`completedLessonIds`, `completedLessonsCount`, `progressPct`, `averageQuizScore`, `lastActiveLessonTitle`) **only after** `existing().paymentStatus == 'Verified'`.
6. **General, Workshop & Service Applications (`ServiceApplication` at `/applications/{applicationId}`)**:
   - Users can submit workshop registrations, 1-on-1 consultations, certificate requests, custom quotes, or partnership applications with `status == 'Pending Verification'`, `verifiedByEmail == ''`, `adminNote == ''`, and `approvedDate == ''`.
   - `get` and `list` are restricted to owner (`existing().uid == request.auth.uid`) OR primary admin (`isCourseAdmin()`).
   - ONLY the primary admin (`isCourseAdmin()`) can transition `status` to `'Approved'` or `'Rejected'`.
7. **Website Notices (`WebsiteNotice` at `/notices/{noticeId}`)**:
   - Published notices (`isPublished == true`) are publicly readable by verified users; drafts and all write operations (`create`, `update`, `delete`) are strictly restricted to the primary admin (`sakibulislamsbmc@gmail.com`).
   - `actionRoute` must be empty or match `^\/[a-zA-Z0-9\-_\/]*$` to prevent open redirects or `javascript:` URI injection.

## 2. The "Dirty Dozen" Payloads

1. **Unauthenticated Profile Read**: Attempting `get /users/user_1` with `auth == null` -> `PERMISSION_DENIED`.
2. **Cross-User PII Read (PII Blanket Test)**: Authenticated `user_2` attempting `get /users/user_1` -> `PERMISSION_DENIED`.
3. **Unverified Email Write (Email Spoofing Test)**: Authenticated `user_1` with `email_verified: false` attempting `create /users/user_1` -> `PERMISSION_DENIED`.
4. **Shadow Field Injection on Profile (Shadow Update Test)**: Authenticated `user_1` attempting to include `"isAdmin": true` on `/users/user_1` -> `PERMISSION_DENIED`.
5. **UID Spoofing on Profile Update**: Authenticated `user_1` attempting to mutate `uid` to `"user_2"` on `/users/user_1` -> `PERMISSION_DENIED`.
6. **Oversized String Resource Poisoning**: Authenticated `user_1` attempting to write a 200-character `displayName` (exceeding `maxLength: 100`) -> `PERMISSION_DENIED`.
7. **Orphaned Order Creation**: Authenticated `user_1` attempting `create /orders/order_1` before `/users/user_1` exists -> `PERMISSION_DENIED`.
8. **Order Identity Spoofing**: Authenticated `user_1` attempting `create /orders/order_1` with `uid: "user_2"` -> `PERMISSION_DENIED`.
9. **Unauthorized Order List Scraping (Query Trust Test)**: Authenticated `user_2` querying `/orders` without filtering `uid == "user_2"` -> `PERMISSION_DENIED`.
10. **Client Timestamp Forgery**: Authenticated `user_1` attempting `create /orders/order_1` with a forged past/future `createdAt` timestamp != `request.time` -> `PERMISSION_DENIED`.
11. **Paid Course & Project Order Self-Approval Spoofing**: Authenticated `user_1` attempting to create/update `/coursePurchases/p_1` with `paymentStatus: "Verified"`, `/orders/o_1` with `projectStatus: "Approved"`/`"Completed"` or `billingStatus: "Paid"`, or `/applications/a_1` with `status: "Approved"` -> `PERMISSION_DENIED`.
12. **Immutable Order Amount Tampering**: Authenticated `user_1` attempting to modify `amountUsd` on `/orders/order_1` during an update -> `PERMISSION_DENIED`.

## 3. Test Suite Reference

See `/firestore.rules.test.ts` for the automated test suite verifying all 12 Dirty Dozen payloads return `PERMISSION_DENIED`.

