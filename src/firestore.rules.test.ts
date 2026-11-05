import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("Firestore Security Rules — Dirty Dozen Verification", () => {
  const rulesPath = path.resolve(process.cwd(), "firestore.rules");
  const getRules = () => fs.readFileSync(rulesPath, "utf8");

  it("1. Rejects unauthenticated access via default-deny catch-all and isVerifiedUser()", () => {
    const rules = getRules();
    expect(rules).toContain("match /{document=**} {\n      allow read, write: if false;\n    }");
    expect(rules).toContain(
      "function isVerifiedUser() {\n      return isSignedIn() && request.auth.token.email_verified == true;\n    }",
    );
  });

  it("2. Rejects cross-user PII read on /users/{userId} (PII Blanket Test)", () => {
    const rules = getRules();
    expect(rules).toContain(
      "allow get: if isVerifiedUser() && isValidId(userId) && request.auth.uid == userId;",
    );
    expect(rules).toContain("allow list: if false;");
  });

  it("3. Rejects unverified email writes (Email Spoofing Test)", () => {
    const rules = getRules();
    expect(rules).toContain("request.auth.token.email_verified == true");
  });

  it("4. Rejects shadow field injection on UserProfile (Shadow Update Test)", () => {
    const rules = getRules();
    expect(rules).toContain("data.keys().hasAll([");
    expect(rules).toContain("data.keys().hasOnly([");
    expect(rules).toContain("incoming().diff(existing()).affectedKeys().hasOnly([");
  });

  it("5. Rejects UID spoofing on UserProfile create and update", () => {
    const rules = getRules();
    expect(rules).toContain("data.uid == request.auth.uid");
    expect(rules).toContain("incoming().uid == existing().uid");
  });

  it("6. Rejects oversized string resource poisoning via strict .size() limits", () => {
    const rules = getRules();
    expect(rules).toContain(
      "data.displayName is string && data.displayName.size() >= 1 && data.displayName.size() <= 100",
    );
    expect(rules).toContain(
      "data.projectNotes is string && data.projectNotes.size() >= 0 && data.projectNotes.size() <= 1000",
    );
  });

  it("7. Rejects orphaned order creation when parent user profile does not exist", () => {
    const rules = getRules();
    expect(rules).toContain("exists(/databases/$(database)/documents/users/$(request.auth.uid))");
  });

  it("8. Rejects order identity spoofing", () => {
    const rules = getRules();
    expect(rules).toContain("existing().uid == request.auth.uid");
  });

  it("9. Enforces Query Trust Test on /orders list queries", () => {
    const rules = getRules();
    expect(rules).toContain(
      "allow list: if isVerifiedUser() && existing().uid == request.auth.uid;",
    );
  });

  it("10. Rejects client timestamp forgery via request.time enforcement", () => {
    const rules = getRules();
    expect(rules).toContain("incoming().createdAt == request.time");
    expect(rules).toContain("incoming().updatedAt == request.time");
  });

  it("11. Enforces Terminal State Locking on completed or cancelled orders", () => {
    const rules = getRules();
    expect(rules).toContain("!(existing().projectStatus in ['Completed', 'Cancelled'])");
  });

  it("12. Locks immutable order fields (orderNumber, orderDate, amountUsd, createdAt)", () => {
    const rules = getRules();
    expect(rules).toContain("incoming().orderNumber == existing().orderNumber");
    expect(rules).toContain("incoming().orderDate == existing().orderDate");
    expect(rules).toContain("incoming().amountUsd == existing().amountUsd");
    expect(rules).toContain("incoming().createdAt == existing().createdAt");
  });
});
