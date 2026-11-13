# Quick Test Guide - Class Join & Circle Page

## 🚀 Start Services

### Terminal 1: Backend
```bash
cd backend
npm run dev
```
✅ Should see: "Memora backend running on port 4000"

### Terminal 2: Frontend (Android)
```bash
cd frontend
npx react-native run-android
```
✅ Should build and launch on emulator

---

## 👥 Quick Test (2 Accounts)

### Account A: Create Class

1. **Open app** → Login
2. **Navigate to**: Circle tab → "Create a Class"
3. **Fill in**:
   - Name: Test Class 2024
   - School: Test High School
   - Year: 2024
4. **Submit** → Copy join code (e.g., `A3F7B21E`)
5. **Go to**: Circle tab
6. **✅ Verify**: Class appears

### Account B: Join Class

1. **Open app** → Login (different account)
2. **Navigate to**: Circle tab → "Enter Invite Code"
3. **Enter**: Account A's join code
4. **Submit**
5. **✅ Verify**: Success screen appears with:
   - ✓ "You're inside this class!"
   - Class name shown
   - "Continue to Circle" button
6. **Click**: "Continue to Circle"
7. **✅ Verify**: Class appears in Circle page

### Both Accounts

1. **Restart app** (close and reopen)
2. **Navigate to**: Circle tab
3. **✅ Verify**: Class still visible
4. **✅ Verify**: Member count = 2

---

## ✅ Pass Criteria

- [ ] Account A creates class successfully
- [ ] Account B sees success screen after join
- [ ] Success message: "You're inside this class!"
- [ ] Account B's Circle page shows joined class
- [ ] No app restart needed to see class
- [ ] Member count shows 2
- [ ] Both accounts see class after app restart
- [ ] No errors in logs

---

## 🎯 Key Features to Test

### Success Screen
- Large ✓ checkmark icon
- "You're inside this class!" text
- Class name displayed
- "Welcome to your class community" subtitle
- "Continue to Circle" button

### Circle Page
- All joined classes visible
- Class name, school, year shown
- Member count displayed
- Join code visible
- Can tap class to see details

### Class Details
- Shows complete class info
- Lists all members with roles
- Back navigation works

---

## 🐛 Common Issues

### Backend not reachable
```bash
# In emulator, backend should be at:
http://10.0.2.2:4000
```
Check `frontend/.env`:
```
EXPO_PUBLIC_BACKEND_URL=http://10.0.2.2:4000
```

### "Class not found"
- Check join code is exact (8 uppercase hex)
- Verify backend is running
- Check backend logs for errors

### Class doesn't appear after join
- Check backend logs for successful join
- Pull down to refresh Circle page
- Check Supabase for class_members entry

---

## 📋 Files Changed

Only 3 files modified:
1. `frontend/app/(onboarding)/join-class.tsx`
2. `frontend/app/(tabs)/circle.tsx`
3. `frontend/app/class/[classId].tsx`

Backend unchanged (already working).

---

## 🎓 Success = All Pass

If all ✅ criteria pass → Implementation is working correctly!

If any fail → Check logs and `CLASS_JOIN_COMPLETE.md` for troubleshooting.
