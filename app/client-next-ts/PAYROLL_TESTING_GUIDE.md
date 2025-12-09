# Owlban Group Payroll - Manual Testing Guide

**Test Type:** Critical-Path Testing
**Purpose:** Verify main user workflows function correctly
**Estimated Time:** 15-20 minutes

---

## 🧪 Test Environment Setup

1. **Start the dev server:**
   ```bash
   cd app/client-next-ts
   npm run dev
   ```

2. **Open browser to:** `http://localhost:5173`

3. **Navigate to:**
   - Click "SellSense Demo"
   - Select an **active seller scenario** (NOT onboarding)
   - Click "Payroll" in the sidebar

---

## ✅ Critical Path Test Cases

### Test 1: Dashboard Overview (2 minutes)

**Objective:** Verify dashboard displays correctly

**Steps:**
1. ✅ Verify you see the Payroll Dashboard
2. ✅ Check 4 summary cards are visible:
   - Total Employees (should show a number)
   - Upcoming Payroll (should show a date)
   - Last Payroll Run (should show amount)
   - Year to Date (should show total)
3. ✅ Verify 3 quick action buttons:
   - "Run Payroll"
   - "Add Employee"
   - "View History"
4. ✅ Check "Recent Activity" section shows activity items

**Expected Results:**
- All cards display with proper formatting
- Numbers are formatted as currency ($X,XXX.XX)
- Dates are formatted properly
- No console errors

**Status:** ⬜ Pass / ⬜ Fail

---

### Test 2: View Employee List (2 minutes)

**Objective:** Verify employee list displays and filters work

**Steps:**
1. ✅ Click "Employees" tab at top
2. ✅ Verify employee list displays with columns:
   - Name
   - Email
   - Department
   - Position
   - Salary
   - Status
   - Actions (Edit/Delete icons)
3. ✅ Test search:
   - Type "John" in search box
   - Verify list filters to show only matching employees
   - Clear search
4. ✅ Test status filter:
   - Select "Active" from status dropdown
   - Verify only active employees show
   - Select "All Statuses"

**Expected Results:**
- Employee list displays with 12 employees
- Search filters results in real-time
- Status filter works correctly
- All data formatted properly

**Status:** ⬜ Pass / ⬜ Fail

---

### Test 3: Add New Employee (5 minutes)

**Objective:** Verify complete add employee workflow

**Steps:**
1. ✅ Click "Add Employee" button
2. ✅ Verify modal opens with form
3. ✅ Test validation - try to submit empty form:
   - Click "Add Employee" button
   - Verify error messages appear for required fields
4. ✅ Fill in form with test data:
   - **First Name:** Test
   - **Last Name:** Employee
   - **Email:** test.employee@company.com
   - **Phone:** (555) 999-8888
   - **Department:** Testing
   - **Position:** QA Engineer
   - **Salary:** 65000
   - **Payment Frequency:** Bi-Weekly
   - **Employment Type:** Full Time
   - **Status:** Active
   - **Bank Name:** Test Bank
   - **Account Type:** Checking
   - **Routing Number:** 123456789
   - **Account Number:** 9876543210
5. ✅ Click "Add Employee"
6. ✅ Verify modal closes
7. ✅ Verify new employee appears in list
8. ✅ Search for "Test Employee" to confirm

**Expected Results:**
- Form validation works (shows errors for empty fields)
- All fields accept input
- Employee number auto-generated
- Form submits successfully
- New employee appears in list
- No console errors

**Status:** ⬜ Pass / ⬜ Fail

---

### Test 4: Edit Employee (3 minutes)

**Objective:** Verify edit employee workflow

**Steps:**
1. ✅ Find "Test Employee" in list
2. ✅ Click edit icon (pencil)
3. ✅ Verify modal opens with pre-populated data
4. ✅ Modify salary to: 70000
5. ✅ Modify department to: Quality Assurance
6. ✅ Click "Update Employee"
7. ✅ Verify modal closes
8. ✅ Verify changes reflected in list

**Expected Results:**
- Edit form opens with existing data
- Changes save successfully
- Updated data displays in list
- No console errors

**Status:** ⬜ Pass / ⬜ Fail

---

### Test 5: Process Payroll (5 minutes)

**Objective:** Verify complete payroll processing workflow

**Steps:**

**Step 1: Select Employees**
1. ✅ Click "Run Payroll" tab
2. ✅ Verify Step 1 of 4 displays
3. ✅ Verify employee list with checkboxes
4. ✅ Click "Select All" checkbox
5. ✅ Verify all employees selected
6. ✅ Set payment date (use today's date)
7. ✅ Set pay period start (2 weeks ago)
8. ✅ Set pay period end (today)
9. ✅ Click "Review Payroll"

**Step 2: Review Payments**
10. ✅ Verify Step 2 of 4 displays
11. ✅ Verify summary cards show:
    - Total Employees
    - Total Gross Pay
    - Total Deductions
    - Total Net Pay
12. ✅ Verify employee payment details table
13. ✅ Check calculations (Net = Gross - Deductions)
14. ✅ Click "Process Payroll"

**Step 3: Processing**
15. ✅ Verify Step 3 of 4 displays
16. ✅ Verify processing animation/spinner
17. ✅ Wait for processing to complete (2-3 seconds)

**Step 4: Success**
18. ✅ Verify Step 4 of 4 displays
19. ✅ Verify success message
20. ✅ Verify payroll run number displayed
21. ✅ Verify totals displayed
22. ✅ Click "View Payroll History"

**Expected Results:**
- All 4 steps work sequentially
- Employee selection works
- Calculations are correct (30% deductions)
- Processing completes successfully
- Success confirmation displays
- No console errors

**Status:** ⬜ Pass / ⬜ Fail

---

### Test 6: View Payroll History (3 minutes)

**Objective:** Verify history display and filters

**Steps:**
1. ✅ Verify you're on History tab
2. ✅ Verify payroll run list displays
3. ✅ Verify your new payroll run appears at top
4. ✅ Test date range filter:
   - Set start date to 1 month ago
   - Set end date to today
   - Verify results update
5. ✅ Test status filter:
   - Select "Completed"
   - Verify only completed runs show
6. ✅ Click "Clear Filters"
7. ✅ Verify all runs display again
8. ✅ Click on your new payroll run
9. ✅ Verify detail view displays:
   - Run summary
   - Employee payment details
   - Individual amounts
10. ✅ Click "Back to History"

**Expected Results:**
- History list displays all runs
- Filters work correctly
- Clear filters resets view
- Detail view shows complete information
- Navigation works
- No console errors

**Status:** ⬜ Pass / ⬜ Fail

---

### Test 7: Delete Employee (2 minutes)

**Objective:** Verify delete employee workflow

**Steps:**
1. ✅ Click "Employees" tab
2. ✅ Find "Test Employee"
3. ✅ Click delete icon (trash)
4. ✅ Verify confirmation modal appears
5. ✅ Click "Cancel" first
6. ✅ Verify modal closes, employee still there
7. ✅ Click delete icon again
8. ✅ Click "Delete" in modal
9. ✅ Verify modal closes
10. ✅ Verify employee removed from list

**Expected Results:**
- Confirmation modal displays
- Cancel works (doesn't delete)
- Delete removes employee
- List updates immediately
- No console errors

**Status:** ⬜ Pass / ⬜ Fail

---

## 📊 Test Results Summary

### Overall Results
- **Total Tests:** 7
- **Passed:** ___
- **Failed:** ___
- **Pass Rate:** ___%

### Critical Issues Found
(List any blocking issues that prevent core functionality)

1. 
2. 
3. 

### Minor Issues Found
(List any non-blocking issues or improvements)

1. 
2. 
3. 

### Console Errors
(List any JavaScript errors in browser console)

1. 
2. 
3. 

---

## ✅ Sign-Off

**Tested By:** _______________
**Date:** _______________
**Browser:** _______________
**Result:** ⬜ All Tests Passed / ⬜ Issues Found

---

## 🐛 Issue Reporting Template

If you find issues, please report using this format:

**Issue #:** 
**Severity:** Critical / High / Medium / Low
**Test Case:** (which test above)
**Steps to Reproduce:**
1. 
2. 
3. 

**Expected Result:**

**Actual Result:**

**Screenshots:** (if applicable)

**Console Errors:** (if any)

---

## 📝 Notes

- All tests should be performed in a clean browser session
- Clear browser cache if you encounter issues
- Test in Chrome/Firefox/Safari for best compatibility
- Report any TypeScript errors in the console
- Note any performance issues (slow loading, lag)

---

**Testing Complete!** 🎉

Once all tests pass, the Owlban Group Payroll system is ready for production use!
