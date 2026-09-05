# 📖 LISA — Literacy Intelligent Support Assistant

[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-4.4.5-purple.svg)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-green.svg)](https://supabase.io/)
[![AI Powered](https://img.shields.io/badge/AI-Powered-orange.svg)]()
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Live Demo**: [lisa-gray.vercel.app](https://lisa-gray.vercel.app/)

---

## 📸 System Previews

![Login Page](/Preview%20Images/Login%20Page.png)
![Assessment Questions](/Preview%20Images/Assesement%20Questions.png)
![User Dashboard](/Preview%20Images/User%20Dashboard.png)
![Learn Page](/Preview%20Images/Learn%20Page.png)
![Practice Question](/Preview%20Images/Practice%20Question.png)
![Lesson Question](/Preview%20Images/Lesson%20Question.png)
![Profile Page](/Preview%20Images/Profile%20Page.png)
![Admin Dashboard](/Preview%20Images/Admin%20Dashboard.png)
![Mobile Screen](/Preview%20Images/Mobile%20Screen.png)

---

## 📑 Table of Contents

- [Overview](#-overview)
- [System Architecture](#-system-architecture)
- [Component Deep-Dive](#-component-deep-dive)
- [Local Development Setup](#-local-development-setup)
- [Database Setup (Supabase)](#-database-setup-supabase)
- [Deployment Guide (Vercel)](#-deployment-guide-vercel)
- [Progressive Web App (PWA)](#-progressive-web-app-pwa)
- [Technical Innovations](#-technical-innovations)

---

## 🌟 Overview

**LISA** is an interactive, AI-driven educational portal designed to accelerate foundational literacy development for child and adult learners. By integrating speech recognition, adaptive progression algorithms, gamified reward loops, and a comprehensive course administration workspace, LISA makes learning a new language accessible, engaging, and highly personalized.

### Project Statement & Outcomes
Millions of adults and first-generation learners face challenges in acquiring foundational reading, writing, and communication skills. Traditional literacy programs often lack personalization and accessibility. This project aims to develop an AI-powered literacy platform that provides personalized learning experiences through regional language content, voice-based interactions, and adaptive learning pathways.

The system will evaluate learner proficiency, recommend customized lessons, monitor progress, and deliver engaging literacy exercises. AI-powered speech recognition and pronunciation assessment will provide immediate feedback, enabling learners to improve their language skills effectively.

The deliverable is a complete web-based literacy platform featuring learning modules, proficiency assessments, pronunciation coaching, progress tracking, and multilingual content delivery.

**Supported Languages:** English, Hindi, Kannada, Tamil, and Telugu (with dynamic UI translations and text-to-speech feedback tailored to the learner's preferences).

---

## 🎨 System Architecture

![System Architecture Diagram](https://mermaid.ink/img/eyJjb2RlIjoiZ3JhcGggVEJcbiAgICBzdWJncmFwaCBDbGllbnRfQXBwbGljYXRpb25cbiAgICAgICAgVUlbVXNlciBJbnRlcmZhY2VdXG4gICAgICAgIEF1ZGlvW1dlYiBTcGVlY2ggQVBJXVxuICAgICAgICBDYW52YXNbSGFuZHdyaXRpbmcgRXZhbHVhdG9yXVxuICAgICAgICBTdGF0ZVtMb2NhbCBDYWNoZV1cbiAgICBlbmRcblxuICAgIHN1YmdyYXBoIEV4dGVybmFsX0FJX0xheWVyXG4gICAgICAgIE9SW09wZW5Sb3V0ZXIgTWlzdHJhbF1cbiAgICAgICAgR2VtaW5pW0dlbWluaSBBUEldXG4gICAgICAgIEdyb3FbR3JvcSBBUEldXG4gICAgZW5kXG5cbiAgICBzdWJncmFwaCBCYWNrZW5kX1NlcnZpY2VzXG4gICAgICAgIEF1dGhbU3VwYWJhc2UgQXV0aF1cbiAgICAgICAgUHJvZmlsZXNbKFByb2ZpbGVzIFRhYmxlKV1cbiAgICAgICAgV29yZHNbKFdvcmQgb2YgRGF5IFRhYmxlKV1cbiAgICAgICAgUkxTW1NlY3VyaXR5IEVuZ2luZV1cbiAgICBlbmRcblxuICAgIFVJIC0tPnxTcGVlY2ggQXVkaW98IEF1ZGlvXG4gICAgVUkgLS0+fFBvaW50ZXIgRGF0YXwgQ2FudmFzXG4gICAgVUkgLS0+fE11dGF0ZSBQcm9maWxlfCBSTFNcbiAgICBSTFMgLS0+fEF1dGggQWNjZXNzfCBQcm9maWxlc1xuICAgIFJMUyAtLT58UmVhZCBWb2NhYnwgV29yZHNcbiAgICBVSSAtLT58UHJpbWFyeXwgT1JcbiAgICBPUiAtLT58RmFsbGJhY2t8IEdlbWluaVxuICAgIEdlbWluaSAtLT58QmFja3VwfCBHcm9xXG4gICAgUHJvZmlsZXMgLS4tPnxTdGF0ZSBTeW5jfCBTdGF0ZSIsIm1lcm1haWQiOnsidGhlbWUiOiJkZWZhdWx0In19)

### User Flow Chart
```text
 Learner Registration
          ↓
  Initial Assessment
          ↓
   Skill Evaluation
          ↓
Personalized Learning Plan
          ↓
  Learning Activities
          ↓
   Voice Assessment
          ↓
   Progress Tracking
          ↓
  Performance Reports
```
---

## 🧩 Component Deep-Dive

LISA is built using a modular component architecture. Here is a detailed breakdown of the core systems that power the application:

### 1. Core Engine: `App.jsx`
The central nervous system of LISA. It handles routing, user state management, and the core learning loop.
- **Onboarding & Diagnostic Engine**: Runs the initial multi-tier assessment (reading, writing, comprehension) to determine the user's proficiency level (1-5).
- **Speech Recognition Engine**: Utilizes the native Web Speech API (`webkitSpeechRecognition`) to listen to learner pronunciation, dynamically evaluating accuracy using Levenshtein-style token matching and providing immediate visual feedback.
- **Canvas Evaluator**: A custom HTML5 Canvas implementation that captures handwriting strokes and evaluates them against target shapes using pixel-density thresholds.
- **Adaptive Pathing**: Calculates heuristic difficulty curves and unlocks new modules automatically as the user masters previous units.

### 2. Administration & Curriculum: `AdminDashboard.jsx`
A robust workspace for educators, parents, and platform administrators.
- **Curriculum Builder**: Allows real-time CRUD operations on the course structure. Admins can add new literacy modules, modify skill targets, and deploy updates globally.
- **Roster & Progress Inspector**: A dedicated view to monitor registered learners, inspect their diagnostic assessment scores, track their daily streaks, and view completed lessons.
- **Vocabulary Manager**: An interface to manage the "Word of the Day" database across 5 languages.
- **Announcement System**: A push-notification trigger hub to send platform-wide alerts to all active learners.

### 3. Progress Tracking: `AnalyticsReport.jsx`
The data visualization center for learners.
- **Proficiency Radar**: Maps out the learner's skill distribution across 4 domains (Letter Recognition, Vocabulary, Practical Literacy, Comprehension).
- **Activity Visualizer**: Renders SVG-based bar charts showing weekly XP gains.
- **AI Recommendations**: Analyzes the weakest skill areas and generates actionable study recommendations (e.g., "Focus on Vowel Blends").

### 4. Gamification: `FunLearnZone.jsx`
A dedicated playground designed to reinforce learning through play.
- **Word Sprint**: A fast-paced vocabulary matching game against a countdown timer.
- **Scramble Resolver**: A drag-and-drop or typing-based game to unjumble localized words.
- **Memory Match**: A card-flipping game pairing images/meanings with target words.

### 5. Economy & Rewards: `XPShop.jsx` & `WeeklyLeaderboard.jsx`
The internal motivation engine.
- **XP Shop**: Users spend XP earned from lessons to buy global platform themes (e.g., Midnight Teal, Sunset Purple), custom avatars, and font upgrades. Purchases are synced to Supabase and immediately applied via CSS variable injection.
- **Weekly Leaderboard**: Fetches the top-performing users dynamically from the database and ranks them in a competitive, localized podium view to drive engagement.

---

## 🛠️ Local Development Setup

### 1. Prerequisites
- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher)
- A **Supabase** account (Free tier is sufficient)

### 2. Installation Steps
1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd LISA
   ```

2. **Install project dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory and add the following keys:
   ```env
   VITE_SUPABASE_URL=https://<your-project-id>.supabase.co
   VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
   
   VITE_OPENROUTER_API_KEY=<your-openrouter-key>
   VITE_OPENROUTER_MODEL=mistralai/mistral-7b-instruct:free
   
   VITE_GEMINI_API_KEY=<your-gemini-key>
   VITE_GEMINI_MODEL=gemini-2.0-flash
   
   VITE_GROQ_API_KEY=<your-groq-key>
   VITE_GROQ_MODEL=groq/compound
   ```

4. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:5173`.

---

## 🔒 Database Setup (Supabase)

LISA uses Supabase for Authentication, Database, and Row Level Security (RLS). Execute the following SQL blocks in your **Supabase SQL Editor** to initialize the platform:

```sql
-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  age INTEGER CHECK (age >= 5 AND age <= 120),
  preferred_language TEXT DEFAULT 'English',
  learning_language TEXT DEFAULT 'English',
  xp INTEGER NOT NULL DEFAULT 0,
  streak INTEGER NOT NULL DEFAULT 0,
  literacy_level INTEGER,
  assessment_completed BOOLEAN NOT NULL DEFAULT false,
  completed_lessons TEXT[] DEFAULT '{}',
  shop_data JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles viewable by all." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id OR auth.jwt() ->> 'email' = 'admin@gmail.com');
CREATE POLICY "Users delete own profile." ON public.profiles FOR DELETE USING (auth.uid() = id OR auth.jwt() ->> 'email' = 'admin@gmail.com');

-- 2. Word of the Day Table
CREATE TABLE IF NOT EXISTS public.word_of_day (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  language TEXT NOT NULL,
  word TEXT NOT NULL,
  meaning TEXT NOT NULL,
  meaning_hi TEXT,
  meaning_kn TEXT,
  meaning_ta TEXT,
  meaning_te TEXT,
  example TEXT NOT NULL,
  UNIQUE (language, word)
);

ALTER TABLE public.word_of_day ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public view WOTD" ON public.word_of_day FOR SELECT USING (true);
CREATE POLICY "Admin manage WOTD" ON public.word_of_day FOR ALL USING (true);

-- 3. User Feedback Table
CREATE TABLE IF NOT EXISTS public.user_feedback (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  user_name TEXT,
  user_email TEXT,
  category TEXT,
  rating INTEGER,
  subject TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'New',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.user_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public insert feedback" ON public.user_feedback FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin manage feedback" ON public.user_feedback FOR ALL USING (true);

-- 4. Announcements Table
CREATE TABLE IF NOT EXISTS public.announcements (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  icon TEXT DEFAULT '📢',
  color TEXT DEFAULT '#6366f1',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public view announcements" ON public.announcements FOR SELECT USING (true);
CREATE POLICY "Admin manage announcements" ON public.announcements FOR ALL USING (true);
```

---

## 🚀 Deployment Guide (Vercel)

LISA is optimized for seamless deployment on **Vercel** as a Single Page Application (SPA).

1. **Push your code to GitHub/GitLab/Bitbucket**.
2. **Import the project** into your Vercel Dashboard.
3. **Configure Environment Variables**:
   In the Vercel deployment settings, add all the variables from your local `.env` file (`VITE_SUPABASE_URL`, `VITE_OPENROUTER_API_KEY`, etc.).
4. **Build Settings**:
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. **Deploy**:
   Click **Deploy**. Vercel will automatically read the included `vercel.json` file to route all traffic to `index.html` (preventing 404 errors on page refresh).

---

## 📱 Progressive Web App (PWA)

LISA provides a native-app-like experience, even on unreliable networks:
- **Offline Support**: A custom Service Worker caches static assets, fonts, and core UI structures. 
- **IndexedDB Sync**: Completed lessons and XP gains are stored locally if the internet drops and automatically sync with Supabase once the connection is restored.
- **Mobile Optimized**: Custom CSS break-points (`max-width: 480px`) collapse the desktop sidebar into a native bottom navigation bar for smartphone users.

---

## ⚡ Technical Innovations

* **High-Availability AI Failover Stack**: Utilizes a tiered fallback architecture (`OpenRouter` ➔ `Gemini` ➔ `Groq`) to guarantee lesson generation works even under strict API rate-limits.
* **Granular Postgres Security**: Implements `auth.jwt() ->> 'email' = 'admin@gmail.com'` RLS policies to securely manage platform privileges directly from the client without an intermediary backend server.
* **Zero-Latency Canvas Analysis**: Avoids expensive OCR API calls by mathematically evaluating handwriting strokes via pixel-density algorithms directly in the browser memory.
* **Native Speech Mechanics**: Wraps the OS-level Web Speech APIs to process heavy audio processing locally on the client's hardware.
