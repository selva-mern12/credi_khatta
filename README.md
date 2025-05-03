# CrediKhaata – Loan Tracker for Shopkeepers

**CrediKhaata** is a RESTful backend service built with Node.js, Express, and MongoDB.
It helps shopkeepers manage customer loans, repayments, and track overdue amounts with ease.

Live Demo 👉 **[https://credi-khatta-smp.onrender.com](https://credi-khatta-smp.onrender.com)**

---

## 📆 Features

* User Authentication (JWT)
* Customer Management (Add, Get, List)
* Loan Creation with Due Dates and Grace Period
* Repayment Recording
* Automatic Overdue Detection
* Loan Summary Analytics
* Paginated Customer & Loan Listings

---

## 🛠️ Technologies Used

* Node.js
* Express.js
* MongoDB & Mongoose
* JSON Web Tokens (JWT)
* bcrypt (for password hashing)
* Moment.js (for date manipulation)

---

## 🚀 Getting Started

### 📁 Clone the repo

```bash
git clone https://github.com/selva-mern12/credi_khatta
cd credi_khaata
```

### 📆 Install dependencies

```bash
npm install
```

### 🧶 Create `.env` file

```bash
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

### ▶️ Run the project

```bash
npm start
```

---

## 📡 API Endpoints

### 🧑 User Routes

| Method | Endpoint         | Description       |
| ------ | ---------------- | ----------------- |
| POST   | `/user/register` | Register new user |
| POST   | `/user/login`    | User login        |

---

### 👤 Customer Routes

| Method | Endpoint                       | Description           |
| ------ | ------------------------------ | --------------------- |
| POST   | `/add/customer`                | Add new customer      |
| GET    | `/get/customer/:userId`        | Get customers by user |
| PUT    | `/update/customer/:customerId` | Update customer       |
| DELETE | `/delete/customer/:customerId` | Delete customer       |

---

### 💰 Loan Routes

| Method | Endpoint                    | Description            |
| ------ | --------------------------- | ---------------------- |
| POST   | `/add/loan`                 | Add new loan           |
| GET    | `/get/loan/:customerId`     | Get loans for customer |
| PUT    | `/update/loan/:loanId`      | Update loan            |
| DELETE | `/delete/loan/:loanId`      | Delete loan            |
| POST   | `/loan/repayment/:loanId`   | Add repayment to loan  |
| GET    | `/loan/summary/:customerId` | Loan summary           |
| GET    | `/loan/overdue/:customerId` | List overdue loans     |

---

## 📘 Notes

* Ensure MongoDB is running locally or use MongoDB Atlas.
* JWT token is required for all protected routes. Use `Authorization: Bearer <token>` header.
* Repayment automatically updates loan status.
* Overdue loans are detected by comparing due date + grace period with today's date.

---

## 📬 Sample `.env` Template

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/credikhaata
JWT_SECRET=credikhaata_secret_key
```

---

## 📜 License

This project is licensed under the MIT License.

---

## ✨ Quote

"Helping small businesses thrive, one loan at a time."
