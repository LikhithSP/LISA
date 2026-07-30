# 📖 LISA — Literacy Intelligent Support Assistant

> **Live Demo**: [lisa-gray.vercel.app](https://lisa-gray.vercel.app/)
---


![Login Screenshot](/Login.png)
![Dashboard Screenshot](/Dashboard.png)
![Course Path Screenshot](/Course%20Path.png)
![Lessons Screenshot](/Lessons.png)


LISA is an interactive, AI-driven educational portal designed to accelerate foundational literacy development for child and adult learners. By integrating speech recognition, adaptive progression algorithms, gamified reward loops, and a course administration workspace, LISA makes learning a new language accessible, engaging, and highly personalized.

LISA supports learning English, Hindi, Kannada, Tamil, and Telugu, with UI translations and text-to-speech feedback tailored dynamically to the learner's chosen preferences.

---

## 🎨 System Architecture & Data Flow

### 1. Detailed Architecture Diagram
```mermaid
graph TB
    subgraph Client Application (React SPA)
        UI[User Interface / Dashboards]
        Audio[Web Speech Recognition & TTS]
        Canvas[Canvas Handwriting Evaluator]
        State[Local Cache / Theme Coordinator]
    end

    subgraph External AI Layer
        OR[OpenRouter - Mistral 7B]
        Gemini[Gemini API - 2.0 Flash]
        Groq[Groq API - Llama 3]
    end

    subgraph Backend Services (Supabase)
        Auth[Supabase Authentication]
        Profiles[(profiles Table - Progress, XP, Settings)]
        Words[(word_of_day Table - Localized Vocab)]
        RLS[Row Level Security Engine]
    end

    UI -->|Uses Speech APIs| Audio
    UI -->|Uses Pointer Events| Canvas
    UI -->|Query/Mutate Profile| RLS
    RLS -->|Read/Write Authorized Rows| Profiles
    RLS -->|Read Vocabulary| Words
    UI -->|Primary Request| OR
    OR -->|Fallback if Down| Gemini
    Gemini -->|Backup if Down| Groq
    Profiles -.->|Dynamic Settings Sync| State
```

### 2. End-to-End Website Flow
1. **Onboarding & Authentication**: New users sign up or log in. A Postgres trigger in Supabase automatically provisions a default profile schema.
2. **Diagnostic Placement Test**: The user takes a 5-step diagnostic assessment matching, reading, and listening tasks. The client computes the baseline score.
3. **Level Calibration & Heuristic Pathing**: The user profile is assigned a literacy level (1 to 5). This unlocks matching sections and curriculum units.
4. **Learning Loop & AI Synthesis**:
   * The user selects a lesson unit.
   * `geminiClient.js` prompts the configured LLM to synthesize age-appropriate reading, translation, spelling, or pronunciation checks.
   * The user reads into the mic (Web Speech API) or draws letters (Canvas).
   * Real-time accuracy algorithms validate the input.
5. **Reward & Evolution (Gamification)**: Correct answers award XP stars and update streaks. The user purchases premium modifications in the XP Shop.
6. **Analytics & Administration**: Parents, teachers, or administrators inspect progress metrics, custom curriculum maps, or manage vocabulary configurations from the Admin Portal.

---

## ⚡ Technical Advancements & Optimizations

* **High-Availability AI Failover Stack**: Utilizes a tiered fallback architecture (`OpenRouter` ➔ `Gemini` ➔ `Groq`) to guarantee lesson generation works even under strict API rate-limits or service outages.
* **Granular Postgres RLS Security Policies**: The profiles update and delete policies explicitly evaluate `auth.jwt() ->> 'email' = 'admin@gmail.com'` allowing secure admin control over student records directly from client-side state without needing an intermediary backend server.
* **Dynamic Custom Curriculum Persistence**: Admins can modify sections, skill classifications, and individual lessons. These client configurations are mapped to JSON metadata in Supabase profiles, which automatically override static defaults on client initialization.
* **Browser-Native Neural Speech Mechanics**: Eliminates the need for expensive speech-to-text API endpoints by wrapping the native Web Speech API (`SpeechRecognition` / `webkitSpeechRecognition`), configuring local language recognition codes (`kn-IN`, `ta-IN`, `hi-IN`, `te-IN`, `en-US`) to process pronunciation grading locally on client devices.
* **Canvas Stroke Vector Analysis**: Implements a pixel-matching threshold formula that compares user pointer coordinates on the HTML5 Canvas to target letter patterns, validating manual writing skills without high-latency OCR calls.
* **Design Tokens & Accessibility Guidelines**: Supports custom design themes, fluid font sizes, `:focus-visible` accessibility keyboard rings, and responsive CSS containers built using pure CSS grid systems for seamless mobile transitions.

---

## 🚀 Key Capability Modules

### 1. Adaptive Learning Content & Assessment Framework
* **Diagnostic Assessment**: A multi-skill entrance test evaluated across reading, spelling, listening comprehension, and pronunciation.
* **Proficiency Benchmarks**: Automatically maps learners to one of five proficiency levels:
  * **Level 1 (Beginner)**: Basic letter tracing, simple word matching, and single-phoneme recognition.
  * **Level 2 (Emerging)**: Short sight words, fill-in-the-blanks, and basic spelling challenges.
  * **Level 3 (Intermediate)**: Sentence reconstruction, audio transcription, and simple voice reading tests.
  * **Level 4 (Advanced)**: Comprehension of short stories, multi-clause translation, and conversation.
  * **Level 5 (Fluent)**: Paragraph composition, advanced vocabulary exercises, and quick word-sprinting games.
* **Curriculum Builder**: Admins can customize segments, append lessons, reorganize unit packages, and publish curriculum structures in real time.

### 2. AI Personalized Lesson Generator
* **Contextual Prompts**: Uses zero-shot structured prompts to request age-appropriate, vocabulary-controlled reading passages and options from LLMs.
* **Model Fallback Stack**: Ensures high availability by chaining model requests:
  1. **Primary Model**: OpenRouter (defaulting to `mistralai/mistral-7b-instruct:free`).
  2. **Fallback Model**: Google Gemini (`gemini-2.0-flash`).
  3. **Backup Model**: Groq (`groq/compound`).
* **Adaptive Block Recommendations**: Generates tailored mistake-practice review modules when performance drop heuristics are detected.

### 3. Voice Learning & Speech Verification
* **Native Web Speech API**: Runs local speech recognition, matching audio patterns from the mic to target texts.
* **Pronunciation Grading**: Compares speech transcripts with target sentences using token filtering and calculates a matching percentage score to reward XP.
* **TTS (Text-to-Speech)**: Offers slow-rate pronunciation audio readouts (including a "Turtle Mode") to assist struggling readers.

### 4. Gamified Reward loops (XP Shop)
* **Streak Tracking**: Tracks consecutive active days, boosting motivation with daily multiplier bonuses.
* **Interactive Playgrounds**: Match pairs, spell, and sprint against the clock to score bonus XP.
* **Reward Redemptions**: Redeem earned XP Stars in the Shop to acquire custom visual themes, typography fonts, avatars, and profile badges.

---

## 📂 Codebase Directory Layout

```
LISA/
├── src/
│   ├── App.jsx                 # Main entry point: routing, dashboards, and core assessment logic
│   ├── AdminDashboard.jsx      # Admin panel: users roster, curriculum, word of the day CRUD, and shop
│   ├── AnalyticsReport.jsx     # Insights workspace: charts, level histograms, and CSV data exporters
│   ├── FunLearnZone.jsx        # Playgrounds: Word Sprint, Word Scramble, and Memory Match games
│   ├── XPShop.jsx              # XP Catalog view: purchasing styles, custom themes, and font upgrades
│   ├── WeeklyLeaderboard.jsx   # Gamified rank listings for students
│   ├── geminiClient.js         # API integration wrapper for OpenRouter, Gemini, and Groq LLMs
│   ├── supabaseClient.js       # Database connectivity client initialization
│   ├── styles.css              # Curated CSS styling, dark/light themes, custom typography, and transitions
│   ├── curriculumData.js       # Default curriculum structures and skill category specifications
│   ├── assessmentTranslations.js# Multilingual JSON localized translation dictionary
│   └── locales/                # Language assets for multilingual configurations
├── schema.sql                  # PostgreSQL database initialization scripts and security policies
├── package.json                # Project dependencies and Vite build scripts
└── .env                        # Local environment credentials configuration
```

---

## 🛠️ Local Installation & Development

### 1. Prerequisites
Ensure you have the following installed on your machine:
* **Node.js** (v18.0.0 or higher)
* **npm** (v9.0.0 or higher)
* A active **Supabase** account

### 2. Step-by-Step Setup

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
   Create a `.env` file in the root directory and append the following variables:
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

4. **Launch Local Server**:
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:5173`.

---

## 🔒 Supabase Security & Database Schema Setup

LISA uses Row Level Security (RLS) policies to allow safe, direct-from-client queries. Execute the following SQL blocks in your **Supabase SQL Editor**:

```sql
-- Create profile tracking schema
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

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 1. Profiles Table Policies
CREATE POLICY "Public profiles are viewable by everyone." 
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile." 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id OR auth.jwt() ->> 'email' = 'admin@gmail.com');

CREATE POLICY "Users can delete their own profile." 
  ON public.profiles FOR DELETE 
  USING (auth.uid() = id OR auth.jwt() ->> 'email' = 'admin@gmail.com');

-- 2. Word of the Day Table Policies
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

CREATE POLICY "Anyone can view word of the day" ON public.word_of_day FOR SELECT USING (true);
CREATE POLICY "Anyone can insert word of the day" ON public.word_of_day FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update word of the day" ON public.word_of_day FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete word of the day" ON public.word_of_day FOR DELETE USING (true);
```

---

## 📱 Progressive Web App (PWA) & Offline Capabilities

LISA is fully configured as a Progressive Web App (PWA), providing a premium, native-app-like experience even for users with low internet access.

### 1. Offline Support & Caching Strategy
LISA utilizes a custom **Service Worker** (`public/sw.js`) to cache key assets dynamically:
* **Cache-First Strategy**: Instantly serves critical static resources like fonts, CDN scripts (such as ResponsiveVoice TTS), icons, and background image panels.
* **Stale-While-Revalidate**: Dynamically updates the main application shell (HTML, CSS, JS bundles) in the background while instantly rendering the cached version to guarantee fast startup times.
* **Network-First with Cache Fallback**: Applies to API responses (Supabase data and Gemini syntheses). If the network is unavailable, LISA displays previously loaded/cached content.
* **Branded Offline Fallback**: In the event that a user visits an uncached pathway while offline, they are automatically redirected to a custom [offline.html](file:///d:/LISA/public/offline.html) interface.

### 2. Background Sync
If the user completes exercises, scores XP, or increments their streak without internet access:
* LISA stores the operations in **IndexedDB** databases (`lisa-offline-queue`).
* Once the internet connection is restored, the Service Worker intercepts the online state and replays the requests, synchronizing the offline actions with Supabase in the background.

### 3. Web Push Notifications
LISA supports scheduled and interactive push notifications (e.g. daily lesson triggers, weekly summaries, streak warnings):
* Notification permissions are requested gracefully inside the dashboard workflow.
* Web Push notifications are routed through a serverless API route (`/api/send-notification.js`) powered by the `web-push` npm package using VAPID credentials.

---

## 📱 Mobile & Tablet Responsiveness

The application layout has been upgraded with dedicated CSS layout overrides at the bottom of [styles.css](file:///d:/LISA/src/styles.css) to support smartphones (vertical layouts) and tablets:

* **Mobile Bottom Navigation Bar**: On mobile displays (`max-width: 768px`), the desktop sidebar navigation collapses, and a native bottom-docked navigation bar appears, giving one-click access to **Home**, **Learn**, **Practice**, **Profile**, and **More**.
* **Device Breakpoints**:
  * **Smartphone Portrait (`max-width: 480px`)**: Grid layouts collapse to single columns, options adapt to full screen widths, and interactive elements expand to touch-friendly sizes (minimum `44px` target).
  * **Tablet View (`769px` - `1024px`)**: Grid lists reflow cleanly into 2-column or 3-column rows to preserve layout alignment.
* **Safe-Area Insets**: Supports modern iOS and Android notch devices using `env(safe-area-inset-bottom)` to prevent navigation overlap with system bars.

---

## 🚀 Production Deployment (Vercel)

LISA is fully configured for deployment on **Vercel** with a clean single-page routing structure and serverless notification triggers:

### 1. SPA Routing (`vercel.json`)
The application includes a [vercel.json](file:///d:/LISA/vercel.json) file that configures optimal cache rules and rewrites all routing queries back to `/index.html` to prevent `404 Not Found` errors when refreshing paths.

### 2. Push Notification Credentials
To enable push notifications, run the following command locally to generate VAPID keys:
```bash
npx web-push generate-vapid-keys
```

Configure the following variables in your **Vercel Dashboard Environment Variables**:
* `VAPID_PUBLIC_KEY`: The generated VAPID public key string.
* `VAPID_PRIVATE_KEY`: The generated VAPID private key string.
* `VAPID_EMAIL`: A contact email prefix with `mailto:` (e.g. `mailto:admin@lisa.app`).
* `VITE_VAPID_PUBLIC_KEY`: Set to the same public key so the client bundle can subscribe users.
