# TripSplit: Family Trip Expense Tracker

A mobile-first web app (installable as a PWA) for tracking shared expenses on a family trip. Every member can add expenses from their own phone, and everything syncs live across all devices.

## Features

- **Trips and join codes:** create a trip, share a 6-character code, and family members join with their name. Multiple trips are supported.
- **Real-time sync:** expenses added on one phone appear instantly on the others (Firebase Firestore).
- **Expense tracking:** title, amount, category, date, and who paid. Members can edit or delete expenses they created.
- **Equal sharing:** every expense is shared equally among all trip members, with no per-expense split to set up.
- **Balances:** total paid, fair share, and net balance for each member.
- **Settle up:** the minimum number of payments needed to even everyone out.
- **Dashboard:** total spent, your share, expense count, a spending-over-time chart, and a category breakdown.
- **Extras:** CSV export, multi-currency conversion, receipt photo attachments, and offline support.
- **Installable:** add to the home screen like a native app.

## Tech stack

- React + Vite
- Tailwind CSS
- Firebase (Anonymous Authentication + Firestore)
- PWA (web manifest + service worker)

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS version)
- A Firebase project with **Anonymous sign-in** and **Firestore** enabled

### Installation

```bash
git clone https://github.com/YOUR-USERNAME/YOUR-REPO.git
cd YOUR-REPO
npm install --legacy-peer-deps
```

> `--legacy-peer-deps` is needed because of a peer-dependency version conflict between Vite and esbuild.

### Firebase setup

1. In the [Firebase console](https://console.firebase.google.com/), create a project and register a **web app**.
2. Enable **Authentication → Sign-in method → Anonymous**.
3. Create a **Firestore Database**.
4. Put your Firebase web config (`apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, `appId`) in the app's Firebase config file (check `src/` for the file that calls `initializeApp`).

### Run locally

```bash
npm run dev
```

Open http://localhost:3000. To test on a phone on the same Wi-Fi, open `http://<your-computer-ip>:3000`.

### Build for production

```bash
npm run build
```

The output is in the `dist/` folder.

## Deployment

The app is a static site, so it can be hosted on Firebase Hosting, Vercel, or Netlify. After deploying:

1. Add your live domain in **Firebase Authentication → Settings → Authorized domains**.
2. Open the live URL in Chrome on your phone and tap **Add to Home Screen**.

## Firestore data structure

```
trips/{tripId}                      name, baseCurrency, joinCode, createdAt
trips/{tripId}/members/{memberId}   name, uid, joinedAt
trips/{tripId}/expenses/{expenseId} title, amount, category, date, paidBy, createdBy, ...
```

## Security

Before real use, replace Firestore's test-mode rules with rules that only let signed-in trip members read and write that trip's data. Test-mode rules are open to anyone and expire after about 30 days.

## How settle up works

1. Fair share = total spent ÷ number of members.
2. Net balance = amount paid − fair share.
3. Members who owe are matched with members owed money, largest amounts first, giving the fewest possible payments.

Money is stored in integer minor units (such as paise) to avoid rounding errors.

## Contributing

This is a personal family project, but suggestions and fixes are welcome. Open an issue or pull request.

## Author

Built by YOUR NAME.
