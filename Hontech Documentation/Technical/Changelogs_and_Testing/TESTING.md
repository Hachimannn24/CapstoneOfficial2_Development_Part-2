# HonTech System Verification and Testing Protocol

This document details the test scenarios, verification procedures, and QA validation checklists designed to maintain code quality and prevent regressions in the HonTech Operations System.

---

## 🧪 Verification Matrix

### 1. Time Format & SLA Goal Status
- **Goal**: Confirm that toggle settings (12h/24h) change the visual display formats but **do not** break turnaround time difference computations (SLA status goals).
- **Procedure**:
  1. Open the settings panel and set time format to `12h`.
  2. View the Daily Intakes table or periodic records and inspect the `SLA Status (2h)`.
  3. Ensure it computes correctly as `Successful` or `Failed` instead of showing `N/A` or throwing JavaScript `NaN` errors.
  4. Toggle time format back to `24h` and verify same calculations align.

### 2. Intake Status & Queue Flows
- **Goal**: Confirm newly registered walk-ins default to `Waiting` and are hidden from the TV Monitor queue list until explicitly changed to `Monitoring`.
- **Procedure**:
  1. Log in as a Service Advisor (SA).
  2. Fill out the Walk-In form and register a new vehicle.
  3. Confirm the default status is saved as `Waiting`.
  4. Access the TV Monitor page (`http://localhost:5001/?mode=tv`) and verify the new vehicle **does not** appear in the Service Queue (Slide 2).
  5. Back in the dashboard, change status to `Monitoring`. Verify the vehicle now displays in the TV monitor's upcoming queue.
  6. Change status to `Ready to Release`. Verify it shifts to the TV monitor's "Ready for Release" column and renders with the "Ready" badge.
  7. Change status to `Released`. Verify the vehicle is completely removed from both active screens.

### 3. Assistant Form & Action Boundaries
- **Goal**: Restrict Assistant bookings to online registrations and block editing of critical queue columns.
- **Procedure**:
  1. Log in as an Assistant.
  2. Verify that the booking form has no `Type of Lane` selector.
  3. Access the pending online table. Confirm all booking data (dates, times, lane types) render as read-only static text.
  4. Click **Confirm Active**. Verify status updates to `Waiting` and the arrival time is stamped with the exact current local system time (e.g., `12:28`).
  5. Click the trash icon. Confirm the custom red deletion modal displays and cleanly deletes the booking upon approval.
