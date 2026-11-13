# Class Join & Circle Page - Testing Checklist

Use this checklist to verify the complete implementation.

---

## Setup

- [ ] Backend running: `cd backend && npm run dev`
- [ ] Port 4000 accessible from emulator
- [ ] Android emulator running
- [ ] Two user accounts created (Account A, Account B)
- [ ] Both accounts logged in on separate devices/sessions

---

## Test 1: Create Class (Account A)

- [ ] Navigate to "Create a Class" screen
- [ ] Enter class name: "Test Class 2024"
- [ ] Enter school name: "Test High School"
- [ ] Enter academic year: 2024
- [ ] Click "Create Class"
- [ ] Success screen appears
- [ ] 8-character join code displayed (e.g., `A3F7B21E`)
- [ ] Copy/note the join code
- [ ] Navigate to Circle page
- [ ] New class appears in Circle page
- [ ] Class name matches: "Test Class 2024"
- [ ] School name matches: "Test High School"
- [ ] Academic year shows: 2024
- [ ] Member count shows: 1
- [ ] Join code visible on class card

**Result**: ⬜ PASS / ⬜ FAIL

---

## Test 2: Join Class (Account B)

- [ ] Navigate to Circle page
- [ ] Click "Enter Invite Code" or "Join another class"
- [ ] Enter Account A's join code
- [ ] Click "Join Class"
- [ ] Loading indicator appears briefly
- [ ] Success screen appears with ✓ icon
- [ ] Message shows: "You're inside this class!"
- [ ] Subtitle shows: "Welcome to your class community."
- [ ] Class name displays: "Test Class 2024"
- [ ] School name displays: "Test High School"
- [ ] Academic year displays: "Class of 2024"
- [ ] "Continue to Circle" button visible
- [ ] Click "Continue to Circle"
- [ ] Navigates to Circle page
- [ ] Joined class appears in class list
- [ ] Member count now shows: 2

**Result**: ⬜ PASS / ⬜ FAIL

---

## Test 3: Already Joined (Account B)

- [ ] Navigate to "Join another class"
- [ ] Enter the SAME join code again
- [ ] Click "Join Class"
- [ ] Success screen appears
- [ ] "Already a member" badge displayed
- [ ] Class information still shown
- [ ] Click "Continue to Circle"
- [ ] Returns to Circle page
- [ ] No duplicate class created
- [ ] Member count still shows: 2

**Result**: ⬜ PASS / ⬜ FAIL

---

## Test 4: Invalid Join Code

- [ ] Navigate to join class screen
- [ ] Enter invalid code: "INVALID1"
- [ ] Click "Join Class"
- [ ] Error message appears
- [ ] Message says: "Class not found" or similar
- [ ] Stays on join screen (no navigation)
- [ ] Input field still editable
- [ ] Can enter new code and retry

**Result**: ⬜ PASS / ⬜ FAIL

---

## Test 5: Class Details (Account A or B)

- [ ] Navigate to Circle page
- [ ] Tap on the class card header
- [ ] Navigates to class detail page
- [ ] Back button visible and working
- [ ] Class name displayed correctly
- [ ] School name displayed correctly
- [ ] Academic year displayed correctly
- [ ] Join code displayed
- [ ] Status badge shows "Active"
- [ ] Member section shows title: "Class Members (2)"
- [ ] Two members listed
- [ ] Each member shows role (owner/member)
- [ ] Each member shows join date
- [ ] Click "Back to Circle" button
- [ ] Returns to Circle page

**Result**: ⬜ PASS / ⬜ FAIL

---

## Test 6: Multiple Classes (Account A)

- [ ] Navigate to "Create a Class"
- [ ] Create second class: "Second Class 2024"
- [ ] Note the join code
- [ ] Navigate to Circle page
- [ ] Both classes visible
- [ ] Class switcher pills appear (horizontal scroll)
- [ ] Tap on second class pill
- [ ] Active class switches
- [ ] Class info card updates
- [ ] Stats show for selected class
- [ ] Can switch back to first class

**Result**: ⬜ PASS / ⬜ FAIL

---

## Test 7: App Restart (Both Accounts)

### Account A:
- [ ] Note which classes are visible
- [ ] Close app completely (swipe away from recent apps)
- [ ] Reopen app
- [ ] Login if prompted
- [ ] Navigate to Circle page
- [ ] Same classes appear
- [ ] Member counts correct
- [ ] Active class selection remembered

### Account B:
- [ ] Repeat same steps
- [ ] Verify joined classes still visible

**Result**: ⬜ PASS / ⬜ FAIL

---

## Test 8: No Classes State

- [ ] Create a new test account (Account C)
- [ ] Login with Account C
- [ ] Navigate to Circle page
- [ ] Empty state appears
- [ ] Message: "No Circle Joined Yet"
- [ ] "Enter Invite Code" button visible
- [ ] "Create a Class" button visible
- [ ] No errors in logs

**Result**: ⬜ PASS / ⬜ FAIL

---

## Test 9: Network Error Handling

- [ ] Stop the backend server
- [ ] Try to join a class
- [ ] Error message appears
- [ ] Message indicates network/connection issue
- [ ] User stays on join screen
- [ ] Restart backend
- [ ] Try joining again
- [ ] Should succeed

**Result**: ⬜ PASS / ⬜ FAIL

---

## Test 10: Circle Page Refresh

- [ ] Account B on Circle page
- [ ] Account A creates a new class
- [ ] Account B pulls down to refresh (if available)
- [ ] OR: Account B switches away and back to Circle tab
- [ ] Classes list refreshes
- [ ] Account A joins Account B's class
- [ ] Account A sees updated member count after refresh

**Result**: ⬜ PASS / ⬜ FAIL

---

## Visual Checks

- [ ] Success screen uses Memora design language
- [ ] Colors match app theme
- [ ] Typography consistent
- [ ] Icons and badges styled appropriately
- [ ] No layout overflow or clipping
- [ ] Buttons properly styled
- [ ] Loading states look good
- [ ] Empty states clear and helpful
- [ ] Error messages readable

**Result**: ⬜ PASS / ⬜ FAIL

---

## Security Checks

- [ ] Unauthenticated requests rejected
- [ ] Cannot join without valid token
- [ ] Service role key NOT in frontend code
- [ ] Join code required (cannot skip)
- [ ] Cannot access other users' classes without membership
- [ ] RLS policies enforced

**Result**: ⬜ PASS / ⬜ FAIL

---

## Navigation Checks

- [ ] Bottom nav unchanged
- [ ] Tab order preserved
- [ ] Back buttons work correctly
- [ ] No unexpected navigation jumps
- [ ] Can navigate freely between tabs
- [ ] Join flow doesn't break navigation stack

**Result**: ⬜ PASS / ⬜ FAIL

---

## Summary

Total tests: 13

Passed: ___ / 13
Failed: ___ / 13

---

## Issues Found

List any issues discovered during testing:

1. ____________________________________________
2. ____________________________________________
3. ____________________________________________

---

## Notes

Additional observations:

____________________________________________
____________________________________________
____________________________________________

---

## Sign-Off

**Tested By**: _________________________

**Date**: _________________________

**Platform**: _________________________

**Build/Version**: _________________________

**Status**: ⬜ APPROVED / ⬜ NEEDS FIXES
