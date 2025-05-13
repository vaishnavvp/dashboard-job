# 🧹 Job Pipeline Dashboard

A real-time job tracking dashboard built with:

* ✅ [Next.js](https://nextjs.org/)
* ✅ [Firebase Firestore](https://firebase.google.com/docs/firestore)
* ✅ [Firebase Auth](https://firebase.google.com/docs/auth)
* ✅ [@dnd-kit/core](https://dndkit.com/) for drag-and-drop
* ✅ Tailwind CSS for styling

Users can:

* Log in via Google
* Add job cards with company, logo, notes
* Drag jobs between statuses (Applied, Interview, Offer, etc.)
* See updates instantly across tabs/devices
* View live job status counts

---

## 📆 Features

* ✨ Realtime Firestore sync
* ✨ Drag-and-drop via `@dnd-kit`
* ✨ Status counters
* ✨ Auth-guarded dashboard
* ✨ Optimized for Vercel

---

## 🚀 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/your-username/job-dashboard.git
cd job-dashboard
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create `.env.local`

```bash
touch .env.local
```

And add your Firebase config:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

### 4. Start the development server

```bash
npm run dev
```

---

## 🔐 Firestore Security Rules

Add these in **Firebase Console → Firestore → Rules**:

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /jobs/{jobId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.owner;
    }
    match /users/{userId}/stats/{statusId} {
      allow read: if request.auth != null && request.auth.uid == userId;
    }
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## 🧪 Firebase Emulator (Optional)

Use the Firebase Emulator Suite for safe local testing.

### Setup

Create a `firebase.json`:

```json
{
  "emulators": {
    "auth": { "port": 9099 },
    "firestore": { "port": 8080 }
  }
}
```

### Start emulators

```bash
firebase emulators:start
```

---

## 🌍 Deploy to Vercel

### 1. Push your project to GitHub

```bash
git remote add origin https://github.com/your-username/job-dashboard.git
git push -u origin main
```

### 2. Deploy with one click

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

* Select your GitHub repo
* Set Firebase environment variables in Vercel settings
* Deploy your app

---

## 🧑‍💻 Author

**Vaishnav Eyyanath**
Built with 💻 and ☕ using Firebase + Next.js

---

## 📸 Screenshot

*Add your dashboard screenshot below:*

![Dashboard Screenshot](./public/dashboard-preview.png)

---

## 📋 License

MIT – free for personal & commercial use
