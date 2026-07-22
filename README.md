# 🐾 Joeyverse

Welcome to **Joeyverse**! A cutting-edge telemedicine and consultation platform connecting Pet Owners with specialized Veterinary Doctors in real-time. Built with modern web technologies, Joeyverse ensures seamless communication, dynamic pricing, and comprehensive pet profiles.

## ✨ Features

- 🩺 **Doctor & Pet Owner Dashboards**: Tailored experiences for both medical professionals and pet parents.
- 💬 **Real-Time WebRTC Consultations**: Instant chat and video-ready routing when doctors accept appointments.
- 💳 **Dynamic Pricing & Wallet System**: Doctors can set their own Per-Minute rates; Pet Owners can recharge their wallets instantly.
- 📊 **Platform Revenue Split**: Automated 70/30 commission split processing tracked directly in the Admin Dashboard.
- 🔔 **Live Notification Center**: Stay updated with Supabase Realtime alerts for appointments and status changes.

## 🚀 Tech Stack

- **Frontend**: React.js, Vite, Tailwind CSS
- **Backend & Database**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **Animations**: Framer Motion
- **UI Components**: React-Hot-Toast, Lucide Icons

## 📂 Project Structure

- `/src/features/doctor`: Logic and UI for the Doctor's panel.
- `/src/features/pet-owner`: Logic and UI for the Pet Owner's panel.
- `/src/features/admin`: Logic and UI for the Admin oversight panel.
- `/src/components/chat`: WebRTC and Chat synchronization hooks.
- `/supabase`: SQL schema definitions and migrations.

## 💻 Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the Vite Frontend:
   ```bash
   npm run dev
   ```

3. Start the Backend API (Payments):
   ```bash
   npm run dev:all
   ```

## 🔒 Environment Setup

Ensure you have a `.env` file populated with your Supabase and payment provider credentials:
```env
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_key
STRIPE_SECRET_KEY=your_stripe_key
```
