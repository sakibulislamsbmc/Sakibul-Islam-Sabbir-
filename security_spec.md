# Firestore Security Specification (`security_spec.md`)

## 1. Data Invariants

1. **Default-Deny Catch-All**: Every path not explicitly matched under `/users/{userId}` or `/orders/{orderId}` is strictly denied (`allow read, write: if false;`).
2. **Verified Identity & Ownership (`UserProfile` at `/users/{userId}`)**:
   - Only a signed-in user with `request.auth.token.email_verified == true` and `request.auth.uid == userId` can read (`get`), `create`, or `update` their own profile document `/users/{userId}`.
   - `list` and `delete` on `/users/{userId}` are forbidden to prevent user enumeration and accidental profile destruction.
   - `uid` and `createdAt` are immutable on update (`incoming().uid == existing().uid && incoming().createdAt == existing().createdAt`).
   - All string fields enforce strict length limits matching `firebase-blueprint.json`, and `preferredBillingMethod` is restricted to the allowed enum list.
3. **Relational Sync & Ownership (`ProjectOrder` at `/orders/{orderId}`)**:
   - An order can only be created by an authenticated, email-verified user (`request.auth.token.email_verified == true`) whose `/users/$(request.auth.uid)` profile document exists (`exists(/databases/$(database)/documents/users/$(request.auth.uid))`).
   - `incoming().uid` must equal `request.auth.uid`.
   - `get` and `list` on `/orders/{orderId}` are strictly restricted to documents where `resource.data.uid == request.auth.uid` (no blanket `isSignedIn()` reads).
   - `update` on `/orders/{orderId}` is forbidden once `existing().projectStatus in ['Completed', 'Cancelled']` (Terminal State Locking). When active, only action-based updates (`projectNotes`, `billingMethod`, `billingReference`, `billingStatus`, `projectStatus`, `updatedAt`) by the owner are permitted, while `uid`, `orderNumber`, `orderDate`, `amountUsd`, and `createdAt` remain strictly immutable.
   - Timestamp fields (`createdAt` on create, `updatedAt` on create/update) must equal `request.time`.

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
11. **Terminal State Mutation**: Authenticated `user_1` attempting `update /orders/order_completed` when `existing().projectStatus == "Completed"` -> `PERMISSION_DENIED`.
12. **Immutable Order Amount Tampering**: Authenticated `user_1` attempting to modify `amountUsd` on an active `/orders/order_1` during an update -> `PERMISSION_DENIED`.

## 3. Test Suite Reference

See `/firestore.rules.test.ts` for the automated test suite verifying all 12 Dirty Dozen payloads return `PERMISSION_DENIED`.
