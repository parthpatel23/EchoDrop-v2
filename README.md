# 🚀 EchoDrop – Scheduled Messaging Platform

EchoDrop is a **full-stack web application** that allows users to schedule and send messages automatically using third-party services like **Twilio** and **Email APIs**.
It is built with a **modern Angular frontend** and a **Node.js + Express backend**, following real-world project architecture and security practices.

🔹 Designed to demonstrate **real-world full-stack development**, authentication, API integration, and task scheduling.

---

## 🧠 Problem Statement

Many users need to send reminders, alerts, or important messages at a **specific future time** without manual effort.
EchoDrop solves this by providing a **secure, automated scheduled messaging system** with authentication and third-party API integration.

---

## ✨ Features

* 🔐 User authentication (JWT & OAuth)
* ⏰ Schedule messages for future delivery
* 📩 Send messages via Email & SMS APIs
* 🧑‍💻 User-friendly dashboard
* 🌐 RESTful API architecture
* 🔄 Secure backend using environment variables

---

## ⏱ Scheduling Logic

Messages are stored with scheduled timestamps in the database.
A backend job checks pending messages and triggers delivery at the correct time using **Email** or **Twilio SMS APIs**, ensuring reliable automation.

---

## 🛠 Tech Stack

### Frontend

* Angular
* TypeScript
* HTML5, CSS3

### Backend

* Node.js
* Express.js
* MongoDB
* JWT Authentication

### APIs & Tools

* Twilio API (SMS)
* Email API (Gmail / SMTP)
* Git & GitHub

---

## 📁 Project Structure

```
EchoDrop/
├── backend/                     # Node.js + Express backend
│   ├── src/
│   │   ├── config/
│   │   │   └── passport.js      # Authentication configuration
│   │   │
│   │   ├── controllers/         # Request handlers
│   │   │
│   │   ├── middleware/
│   │   │   └── auth.js          # Authentication middleware
│   │   │
│   │   ├── models/              # Database models
│   │   │   ├── User.js
│   │   │   ├── Drop.js
│   │   │   ├── MessageLog.js
│   │   │   ├── ScheduledMessage.js
│   │   │   └── list-users.js
│   │   │
│   │   ├── routes/              # API routes
│   │   │   ├── auth.js
│   │   │   ├── messages.js
│   │   │   └── messageRoutes.js
│   │   │
│   │   ├── services/
│   │   │   └── sendMessage.js   # Email / SMS delivery logic
│   │   │
│   │   ├── utils/
│   │   │   └── twilio.js        # Twilio helper
│   │   │
│   │   └── index.js             # Backend entry point
│   │
│   ├── server.js                # Server bootstrap
│   ├── scheduler.js             # Message scheduling logic
│   ├── generate-token.js        # Token generation utility
│   ├── package.json
│   └── package-lock.json
│
├── frontend-angular/             # Angular frontend
│   ├── public/
│   │   ├── EchoDrop.ico
│   │   └── favicon.ico
│   ├── src/
│   │   ├── app/
│   │   │   ├── auth/             # Login & signup components
│   │   │   ├── dashboard/        # Dashboard UI
│   │   │   ├── messages/
│   │   │   │   ├── messages-list/
│   │   │   │   └── schedule-message/
│   │   │   ├── navbar/
│   │   │   ├── guards/
│   │   │   │   └── auth.guard.ts
│   │   │   ├── services/
│   │   │   │   └── auth.service.ts
│   │   │   ├── app.config.ts
│   │   │   ├── app.routes.ts
│   │   │   ├── app.component.ts
│   │   │   └── auth.interceptor.ts
│   │   │
│   │   ├── assets/              # Static assets
│   │   ├── main.ts
│   │   ├── index.html
│   │   └── styles.scss
│   │
│   ├── angular.json
│   ├── tsconfig.json
│   ├── tsconfig.app.json
│   ├── tsconfig.spec.json
│   ├── package.json
│   └── package-lock.json
│
├── .gitignore
├── LICENSE
├── package-lock.json
├── package.json
└── README.md

```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/parthpatel23/EchoDrop.git
cd EchoDrop
```

---

### 2️⃣ Backend Setup

```bash
cd backend
npm install
```

```md
Create a `.env` file (you can refer to `.env.example`):

```env
PORT=5000
MONGO_URI=your_mongodb_url
JWT_SECRET=your_secret_key

GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REFRESH_TOKEN=your_refresh_token
GOOGLE_REDIRECT_URI=your_redirect_url

EMAIL_USER=your_email

TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_SMS_PHONE=your_sms_number
TWILIO_WHATSAPP_PHONE=your_whatsapp_number
```

Run backend:

```bash
npm start
```

---

### 3️⃣ Frontend Setup

⚠️ Make sure the backend server is running before starting the frontend.

```bash
cd frontend-angular
npm install
ng serve
```

Open in browser:

```
http://localhost:4200
```

---

## 🖼 Screenshots

### Login Page
<img width="1919" height="967" alt="Login Screen" src="https://github.com/user-attachments/assets/c4af2700-c77a-469a-ba8e-f95516489f4c" />

### Dashboard
<img width="1916" height="970" alt="Dashboard" src="https://github.com/user-attachments/assets/72fd0925-dc6b-45ee-b89c-dd381fddca4f" />

### Schedule Message
<img width="1919" height="972" alt="Schedule Message" src="https://github.com/user-attachments/assets/e0a51530-c9c3-4339-bbf2-73af0e39fc1b" />

---

## 🔒 Environment Variables

Sensitive credentials are managed using `.env` files and are not committed to the repository.

📌 A `.env.example` file is provided to help contributors configure the project safely.

---

## 📚 What I Learned

* Implementing JWT-based authentication
* Integrating third-party APIs securely
* Designing scalable backend architecture
* Handling scheduled background tasks
* Connecting Angular frontend with REST APIs
* Managing environment variables and application security

---

## 🚀 Future Improvements

* 📱 Mobile responsiveness
* 📊 Message delivery analytics
* 🔔 Push notifications
* 🧪 Unit & API testing
* 🌍 Deployment (Render / Vercel)

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a new branch
3. Commit your changes
4. Submit a Pull Request

---

## 📜 License

This project is licensed under the **MIT License**.

---

## 👨‍💻 Author

**Parth Patel**
* 🎓 Bachelor of Computer Applications (BCA)
* 🔗 GitHub: [https://github.com/parthpatel23](https://github.com/parthpatel23)
