# Manual Testing Guide

End-to-end test checklist for the Expense Tracker frontend connected to the Spring Boot API.

## Before you start

1. MySQL database `expensetracker` exists and `application.properties` is configured
2. Backend running: `.\mvnw.cmd spring-boot:run` (from repo root)
3. Frontend running: `npm run dev` (from `expense-tracker-frontend/`)
4. Open http://localhost:5173

---

## 1. Register new user

1. Go to `/register`
2. Fill: name, email, password (min 5 chars), confirm password, age
3. Click **Create account**
4. **Expected:** Redirect to `/dashboard`, navbar shows your name

---

## 2. Login

1. Click **Logout**
2. Go to `/login`
3. Enter registered email and password
4. Click **Sign in**
5. **Expected:** Redirect to `/dashboard`, JWT stored (check Application → Local Storage → `expense_tracker_token`)

---

## 3. Create expense

1. Click **Add Expense**
2. Fill: name (min 3 chars), amount, category, date
3. Click **Add Expense**
4. **Expected:** Success banner, redirect to dashboard, new expense in list

---

## 4. Edit expense

1. Click **Edit** on an expense row
2. Change name or amount
3. Click **Update Expense**
4. **Expected:** Success banner, redirect to dashboard, updated values shown

---

## 5. Filter by category

1. On dashboard, click **Category** filter tab
2. Select a category (e.g. Food)
3. **Expected:** Only matching expenses shown, active filter label updates

---

## 6. Delete expense

1. Click **Delete** on an expense
2. Confirm in dialog
3. **Expected:** Expense removed from list after refresh

---

## 7. Update profile

1. Go to `/profile`
2. Change name or age
3. Click **Save changes**
4. **Expected:** Success banner, navbar name updates

---

## 8. Logout

1. Click **Logout** in navbar
2. **Expected:** Redirect to `/login`, protected routes inaccessible

---

## API integration checks

| Check | How to verify |
|-------|----------------|
| JWT field | Network tab → POST `/login` response contains `jwtToken` |
| Auth header | Network tab → GET `/expenses` request has `Authorization: Bearer ...` |
| Delete query param | DELETE `/expenses?id=1` (not `/expenses/1`) |
| Date format | POST `/expenses` body has `"date": "YYYY-MM-DD"` |
| Amount type | POST `/expenses` body has `"amount": 100` (number) |
| CORS | No browser CORS errors in console |

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| CORS error | Restart backend; CORS allows `localhost:5173` |
| 401 on all requests | Login again; check token in localStorage |
| Login fails | Verify backend is running on port 8080 |
| Empty expense list | Create a test expense first |
| Database error | Check MySQL is running and credentials in `application.properties` |
