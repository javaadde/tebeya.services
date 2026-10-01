# PRD: Catering Staff Booking App

**Version:** 1.0 (Draft) · **Platforms:** Android + iOS (React Native), Admin Web Panel

---

## 1. Overview

We run a catering **service-staff** business. We don't provide food or equipment; we provide trained, uniformed serving staff to events. A client says how many staff they need (30, 100, etc.), and we fill the event.

This product replaces manual coordination (calls/WhatsApp) with:

- a **mobile app** for staff to discover, join, and track events and earnings
- an **admin web panel** for us to control who joins, publish events, verify staff, and manage payouts

## 2. Goals

| Goal | Success metric |
| --- | --- |
| Fill events faster | Time from event publish to 100% headcount filled |
| Only approved people can join | 0 signups without an admin-issued code |
| Prevent double-booking / no-shows | Clash attempts blocked 100%; no-show rate tracked |
| Transparent earnings | Staff can see per-event pay and totals without asking admin |

**Non-goals (v1):** client-facing booking, online payments/payroll, in-app chat, attendance via face/biometrics.

## 3. Users

1. **Staff (mobile app):** serving staff, mostly mobile-first, varied tech comfort. Needs simple UI, clear event details, clear pay.
2. **Admin (web panel):** owner/coordinators. Creates events, issues signup codes, verifies staff, monitors fill status.

## 4. Core User Flow

1. Onboarding (3 slides) → Login / Sign up
2. Sign up requires an **admin-issued invite code (OTP)** → verified → account created (status: *Pending verification* until admin approves ID/phone, if enabled)
3. Home → browse upcoming events → **Join** → conflict check → confirmed
4. Push notification for new/updated/cancelled events
5. Upcoming tab → joined events; History tab → past work and earnings
6. Settings → profile, ID proof, mobile verification, address, wage details

## 5. Functional Requirements

### 5.1 Authentication & Restricted Signup

- **FR-1** Sign up requires: invite code, full name, email, mobile number, password.
- **FR-2** Admin generates invite codes in the panel. Each code is **single-use**, has an **expiry** (e.g. 48h), and can optionally be **locked to a phone number/email** so it can't be shared.
- **FR-3** Invalid, expired, or used codes are rejected with a clear message. Rate-limit attempts (e.g. 5 per hour per device/IP).
- **FR-4** Login with email + password; session via JWT (access + refresh). Forgot-password via email.
- **FR-5** Admin can deactivate/ban a staff account; they're logged out and can't rejoin.

> Note: "OTP" here is really an *invite code*. A true SMS OTP can be added later for phone verification.

### 5.2 Home

- **FR-6** Top section: **New / upcoming open events** (sorted by date, soonest first), each card showing event image, title, date, time slot, venue/area, staff needed vs. filled, pay per person, distance from user's home (if address set).
- **FR-7** Bottom section: **My joined events**.
- **FR-8** Event detail screen: description, dress code/uniform notes, reporting time, venue + map link, contact person, pay, and **Join / Leave** button.

### 5.3 Joining Events & Clash Rules

- **FR-9** Every event has a **date, start time, end time, and meal slot** (Breakfast / Lunch / Snacks / Dinner / Custom).
- **FR-10** **Hard block:** a user cannot join an event whose time range **overlaps** one they've already joined (compare actual times, not just slot labels).
- **FR-11** **Daily limit:** max **2 events per day**, and only if they're different non-overlapping slots (e.g. Lunch + Dinner). Add a configurable minimum gap (e.g. 2 hours) for travel.
- **FR-12** When a user joins a **second event on the same day**, show a confirmation dialog + push/in-app notice: *"You've taken two events today. You must be present at both. Absence or lateness may have consequences."* User must tick **"I understand"** to confirm.
- **FR-13** Joining is only allowed if seats remain. Join is atomic (no overbooking when two people tap simultaneously).
- **FR-14** Leave/cancel: allowed until a cutoff (configurable, e.g. 24h before). After cutoff, Leave is disabled and the user must contact admin. Late cancellations are logged.
- **FR-15** If an event is full, optional **waitlist**; auto-promote when someone leaves and notify them.

### 5.4 Upcoming Events Tab

- **FR-16** List of joined, future events with countdown, reporting time, venue, and pay. Shows reminders (see 5.7).

### 5.5 History & Earnings

- **FR-17** Overview cards: total events worked, total earnings, this month's earnings.
- **FR-18** History list: event, date, status (*Completed / Absent / Cancelled*), amount earned, payment status (*Pending / Paid*).
- **FR-19** Filter by month. Admin marks attendance and payment per person; user sees the result.

### 5.6 Settings & Profile

- **FR-20** Profile: profile photo, full name, email, mobile number.
- **FR-21** **Mobile verified tick:** admin verifies in panel (or via SMS OTP later); app shows a verified badge.
- **FR-22** **ID proof:** upload photo of ID. Visible to admin only; stored privately (see 8).
- **FR-23** **Address:** user enters and confirms home address (map pin + text). Used to compute distance to event venues.
- **FR-24** **Wage details:** shows pay rate and **distance-based travel allowance** rules (e.g. base pay + per-km above X km). Displayed per event on the detail page as estimated total.
- **FR-25** Logout, change password, notification preferences, support contact.

### 5.7 Push Notifications

- **FR-26** Triggers: new event published, event updated (time/venue/pay), event cancelled, seat opened (waitlist), reminder (day before and 2h before), account verified, payment marked paid.
- **FR-27** Delivered via **FCM** (Firebase Cloud Messaging) for Android and iOS (APNs through FCM). Device tokens stored per user; stale tokens removed.
- **FR-28** In-app notification inbox so messages aren't lost.

### 5.8 Admin Panel (Web)

- **FR-29** Admin login (separate role; optionally 2FA).
- **FR-30** **Events:** create/edit/cancel events: title, image, date, time range, slot, venue, map link, headcount required, pay, dress code, notes. Publish triggers push.
- **FR-31** **Event roster:** see who joined, filled/remaining, remove a user, add manually, mark **attendance** (present/absent/late), export CSV/PDF for the client or event day.
- **FR-32** **Invite codes:** generate (single or bulk), view status (unused/used/expired), revoke.
- **FR-33** **Staff management:** list/search, view profile + ID proof, verify mobile, approve/suspend, view history and no-show count.
- **FR-34** **Payments:** mark per-event payout, bulk mark paid, export earnings report.
- **FR-35** **Settings:** wage rules, daily event limit, gap between events, cancellation cutoff.
- **FR-36** **Dashboard:** upcoming events fill status, pending verifications, no-shows this month.

## 6. Roles & Permissions

| Action | Staff | Admin |
| --- | --- | --- |
| Sign up with code | ✔ | n/a |
| Browse/join/leave events | ✔ | ✔ (on behalf) |
| Create/edit events | ✘ | ✔ |
| Issue invite codes | ✘ | ✔ |
| View ID proof | Own only | ✔ |
| Mark attendance/payment | ✘ | ✔ |

## 7. Data Model (high level)

- **User** (id, name, email, phone, phoneVerified, passwordHash, role, status, profileImageUrl, idProofUrl, address{text, lat, lng, confirmed}, fcmTokens\[\])
- **InviteCode** (code, createdBy, phone/email lock, expiresAt, usedBy, usedAt, status)
- **Event** (id, title, imageUrl, date, startTime, endTime, slot, venue{text, lat, lng}, headcount, filledCount, payPerPerson, status, notes)
- **Booking** (id, userId, eventId, status \[confirmed/waitlisted/cancelled\], attendance, acknowledgedDoubleBooking, payoutAmount, payoutStatus, createdAt) — unique on (userId, eventId)
- **WageRule** (basePay, freeKm, perKmRate)
- **Notification** (userId, type, title, body, readAt)

## 8. Technical Approach

**Frontend:** React Native (Expo recommended for faster setup, push, and OTA updates).

**Backend (decided):** Node.js + Express + MongoDB, hosted on a VPS/cloud server.

**Decision rationale:**

- The core rules (clash check, daily limit, atomic seat booking, invite-code signup) are server-side logic; plain Node code is easier to write and test than Cloud Functions + security rules.
- The team already works in the MERN stack, so build and debug time is lower.
- Predictable flat hosting cost, versus Firestore's per-read/write billing as staff refresh event lists.
- The admin panel is just another client of the same API with the same business logic.

**Services around it:**

| Concern | Choice |
| --- | --- |
| Mobile app | React Native (Expo) |
| Auth | Custom JWT (access + refresh) with invite-code signup; email-based password reset via an email provider |
| Database | MongoDB |
| Images | Cloudinary (profile photos, event images, private ID proof) |
| Push notifications | Firebase Cloud Messaging (FCM) only; Firebase is not used for data or auth |
| Admin panel | React web app calling the same Node API |

**Rejected alternative:** Firebase-only (Auth + Firestore + Functions). Faster for a prototype but harder to enforce the booking rules, costlier at scale, and it needs a separate admin build.

**Security notes**

- Store **ID proof** as Cloudinary *authenticated/private* assets (signed URLs, admin-only), not public links. Minimise retention and disclose usage in a privacy notice.
- Hash passwords (bcrypt/argon2); validate all input; rate-limit auth routes.
- Enforce clash rules and seat counts **on the server**, never only in the app.

## 9. Non-Functional Requirements

- Works on low-end Android and slow networks; event list loads in under 3s on 4G.
- Join action is atomic and idempotent.
- App store compliance: privacy policy, account deletion option, notification permission prompt.
- Audit log for admin actions (code generation, removals, payments).
- Backups for DB; monitoring/error tracking (e.g. Sentry).

## 10. Edge Cases

- Event time edited after users joined → re-run clash check, notify affected users, allow them to leave penalty-free.
- Two events same day with long travel distance between them → show warning using distance.
- User tries signup with a code already used → clear error, no account details leaked.
- Admin cancels an event → all bookings cancelled, push sent.
- User deletes account → anonymise history, delete ID proof.

## 11. Milestones

| Phase | Scope |
| --- | --- |
| **M1: Foundation** | Auth with invite codes, admin login, event CRUD, DB + API |
| **M2: Core booking** | Home, event detail, join/leave, clash rules, double-booking disclaimer, upcoming tab |
| **M3: Ops** | Roster, attendance, history & earnings, wage rules, payments marking |
| **M4: Engagement** | Push notifications, reminders, notification inbox, waitlist |
| **M5: Polish & launch** | Profile/ID/address verification, QA, store release |

## 12. Open Questions

1. Is a pay rate **fixed per event** or **per hour**? Does it vary by role (e.g. captain vs. server)?
2. How is the **distance allowance** calculated: straight-line or road distance? Who pays above a certain km?
3. What are the **consequences** for no-shows (warning, suspension, deduction)? These should be written in app terms.
4. Should staff be able to **choose** events freely, or does admin **approve** each join?
5. Is a **team lead/captain** role needed on event day?
6. Do you need **attendance check-in** (e.g. GPS or QR at venue) in v1?
7. Languages needed (English, Malayalam, Hindi)?