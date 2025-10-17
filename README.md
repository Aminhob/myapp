# eMaamul (Expo + Firebase)

Small business management app for sales, expenses, inventory, customers and reports. Somali UI.

## Run

- Node 18+
- npm install
- npx expo start

## Firebase

Firebase config is injected via `app.json -> expo.extra.firebase` using the values you provided:

- projectId: data-81861
- projectNumber: 850721536439
- storageBucket: data-81861.firebasestorage.app
- apiKey: AIzaSyBFOglK931vQI7sZ_aaDl2zB_vVsIY3644
- webApiKey: AIzaSyBBr1LKcE348oIrAe38MHOAxVQPfSNsPz8
- appIdAndroid: 1:850721536439:android:bde444ccc377fa07169032

The app reads these using `expo-constants` in `src/lib/firebase.js`.

## Features in this baseline

- Auth (Email/Password) + Roles scaffold
- Bottom Tabs: Dashboard, Customers, Transactions, Inventory, Reports, Settings
- Somali UI and theme (#FF4500 / #002366)
- Barcode Scanner modal (expo-barcode-scanner)
- Offline DB setup (SQLite) + AsyncStorage helpers
- PDF generation + share (expo-print / expo-sharing)
- Currency context (SOS/USD/ETB) with conversion helpers
- Notifications handler prepared

## Next steps

- Implement Firestore data models and sync between SQLite and Firestore
- Complete CRUD flows for Customers, Inventory, Transactions
- Add invoices list and receipt/invoice PDFs
- Reports (P&L daily/weekly/monthly) with export to PDF/Excel
- Low stock and payment reminders (expo-notifications + Cloud Functions)

## Build for Android/iOS

You can use `eas build` when ready. Icons/splash are not referenced to avoid asset errors in dev. Add your images to `assets/` and update `app.json` when finalizing branding.
# emaamul-app
# myapp
