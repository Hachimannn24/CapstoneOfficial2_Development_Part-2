# Changelog Specification: Workflow & Dashboard Enhancements

- **Date**: July 3, 2026
- **Version**: `v1.1.0`
- **Release Type**: Enhancement
- **Target Branch**: `developer`
- **Author**: Antigravity Developer System

---

## 📋 Context & Summary
This update resolves critical time calculation bugs caused by 12-hour format string parsing, establishes clear roles/form boundaries for Assistant and SA roles, refactors Carry-Over modalities, and introduces Slide 3 (Workshop Lanes) to the TV monitoring screen.

---

## 🛠️ File Changes

### 1. `frontend/index.html`
- **Time Fixes**:
  - Implemented `convertTimeTo24Hour(timeStr)` to strip AM/PM and parse raw values cleanly.
  - Replaced manual `.split(':')` on metric cards and exports with `parseTimeToMinutes(convertTimeTo24Hour(...))`.
- **UI Customizations**:
  - Added `#delete-confirm-modal` for beautiful, branding-aligned warning confirmations.
  - Removed "Specific Concerns" from SA Walk-in intake.
  - Disabled all interactive inputs for the Assistant Booking list, leaving only static text rendering, **Confirm Active** time-stamp button, and the styled **Delete** action.
- **Master Intake Table**:
  - Changed title to `Daily Intakes - Marikina`.
  - Cleared Branch and Action columns from the static placeholder headers.
  - Excluded `Released` and `Completed` status jobs from TV slides.
- **Carry-Over Updates**:
  - Excluded "Parts" column from layout.
  - Standardized all labels to "Reasons".
- **TV monitor**:
  - Created Slide 3 displaying Express Lane, Flexible Lane, and Specialty Lane populated dynamically from the active jobs.

---

## 🧪 Verification Verification Result
All local servers have been restarted and checked. Real-time actions for Confirm Active, status changes, and SLA calculation toggle tests have passed QA inspection criteria.
