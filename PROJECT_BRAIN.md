# PROJECT BRAIN — Live Clubs & Players Platform

## 🧠 Overview
This project is a web platform built with Next.js that allows users to register golf/sport clubs and players, upload imagery, and view live shared content across all users.

The goal is to evolve from a simple frontend prototype (localStorage-based) into a fully interactive live data platform.

---

## ⚙️ Tech Stack
- Framework: Next.js (React)
- Hosting: Vercel
- Current Data Storage: localStorage (temporary / legacy)
- Planned Database: Supabase (Postgres)
- Image Storage: Supabase Storage (planned)

---

## 🧱 Core Features

### 1. Club Registration
- Users can create clubs via a form
- Each club includes:
  - Club name
  - Location (optional)
  - Logo / image (planned)
- Currently stored in localStorage only

---

### 2. Player Registration
- Users can add players linked to clubs
- Each player includes:
  - Name
  - Associated club
  - Profile image (planned)
- Currently stored in localStorage only

---

### 3. Imagery System (planned)
- Clubs and players will support image uploads
- Images will be stored in cloud storage
- URLs stored in database and rendered in UI

---

### 4. Live Content Goal
- All users should see shared, real-time data
- When a club/player is added, it should appear globally
- Eventually support live updates without refresh

---

## 🧩 Current Architecture (IMPORTANT)

### Frontend
- React components render forms and lists
- State is managed locally or via simple React hooks

### Data Layer (CURRENT — TEMPORARY)
- localStorage used for:
  - clubs
  - players
- This means:
  - data is device-specific
  - not shared between users
  - not persistent across devices

---

## 🚨 Known Limitations
- No backend database
- No authentication system
- No shared/global data layer
- Images are not properly stored (if used, likely base64 or local references)
- Not production multi-user ready yet

---

## 🧭 Target Architecture (FUTURE STATE)

### Backend
- Supabase database:
  - clubs table
  - players table
  - relationships via club_id

### Storage
- Supabase storage buckets:
  - club-images
  - player-images

### API Layer
- Next.js API routes used for:
  - creating clubs
  - creating players
  - fetching data

### Data Flow
User Action → Next.js API → Supabase DB → UI updates globally

---

## 🔄 Development Rules

When modifying this project:

1. Keep changes minimal and incremental
2. Do not introduce unnecessary complexity
3. Avoid replacing architecture unless explicitly requested
4. Preserve current UI/UX unless redesign is requested
5. Assume localStorage is legacy and should be replaced gradually

---

## 🧠 AI Development Instructions

If an AI assistant is working on this project:

- Always read this file first
- Do not assume missing context
- Do not redesign the system unless asked
- Prioritise consistency with existing structure
- Ask before introducing new infrastructure (auth, DB changes, etc.)

---

## 🎯 Long-Term Goal

To evolve this into a scalable platform where:
- Clubs and players are globally shared
- Content is live and dynamic
- Media is properly stored and served
- System is ready for real users (not just local testing)

---