import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

const languages = ["English", "Hindi", "Kannada", "Telugu", "Tamil", "Other"];
const educationLevels = [
  "No formal education",
  "Primary",
  "Secondary",
  "Higher secondary",
  "Graduate",
];

function App() {
  const [activeTab, setActiveTab] = useState("login");
  const [message, setMessage] = useState("");
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setInitialLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        if (session?.user) {
          fetchProfile(session.user.id);
        } else {
          setProfile(null);
          setInitialLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.warn("Could not fetch profile:", error.message);
      } else {
        setProfile(data);
      }
    } catch (err) {
      console.error("Unexpected error fetching profile:", err);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");

    const formData = new FormData(event.currentTarget);
    const email = formData.get("loginEmail");
    const password = formData.get("loginPassword");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(`Login error: ${error.message}`);
    } else {
      setMessage("Login successful!");
    }
    setSubmitting(false);
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");

    const formData = new FormData(event.currentTarget);
    const email = formData.get("registerEmail");
    const password = formData.get("registerPassword");
    const fullName = formData.get("fullName");
    const age = parseInt(formData.get("age"), 10);
    const language = formData.get("language");
    const educationLevel = formData.get("educationLevel");

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          age: age,
          preferred_language: language,
          education_level: educationLevel,
        },
      },
    });

    if (error) {
      setMessage(`Registration error: ${error.message}`);
      setSubmitting(false);
      return;
    }

    const user = data.user;
    if (user) {
      if (data.session) {
        setMessage("Account created successfully!");
        setProfile({
          full_name: fullName,
          age,
          preferred_language: language,
          education_level: educationLevel,
        });
      } else {
        setMessage("Registration successful! Please check your email to confirm your account.");
      }
    }
    setSubmitting(false);
  };

  const handleSignOut = async () => {
    setSubmitting(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      setMessage(`Sign out error: ${error.message}`);
    } else {
      setMessage("Signed out successfully.");
    }
    setSubmitting(false);
  };

  // 1. Initial Loading Screen
  if (initialLoading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p style={{ fontWeight: 600, color: "var(--muted)", margin: 0 }}>
          Loading your learning experience...
        </p>
      </div>
    );
  }

  // 2. Logged-in Dashboard Page
  if (session) {
    return (
      <div className="dashboard-container">
        <header className="dashboard-header">
          <div className="dashboard-logo">LISA</div>
          <div className="dashboard-user">
            <span style={{ fontWeight: 600 }}>
              Hello, {profile?.full_name || session.user.email}
            </span>
            <button
              type="button"
              className="logout-btn"
              disabled={submitting}
              onClick={handleSignOut}
            >
              {submitting ? "Signing Out..." : "Log Out"}
            </button>
          </div>
        </header>
        <main className="dashboard-main">
          <div className="empty-state-card">
            <h2>Welcome to LISA</h2>
            <p>
              Your personalized literacy learning dashboard is ready. Soon you will find your
              adapted lessons, progress metrics, and assistant features here.
            </p>
          </div>
        </main>
      </div>
    );
  }

  // 3. Login / Register Forms
  return (
    <main className="shell">
      <section className="hero-panel">
        <h1>Your AI companion for personalized literacy learning.</h1>
        <p className="hero-copy">
          Built for first-generation learners, senior citizens, and regional language users.
          The assistant adapts learning, gives simple feedback, and supports voice-based interaction.
        </p>
      </section>

      <section className="auth-panel" aria-label="Authentication">
        <div className="auth-card">
          <div className="auth-tabs" role="tablist" aria-label="Authentication tabs">
            <button
              className={`tab-btn ${activeTab === "login" ? "active" : ""}`}
              type="button"
              disabled={submitting}
              onClick={() => {
                setActiveTab("login");
                setMessage("");
              }}
              aria-selected={activeTab === "login"}
            >
              Login
            </button>
            <button
              className={`tab-btn ${activeTab === "register" ? "active" : ""}`}
              type="button"
              disabled={submitting}
              onClick={() => {
                setActiveTab("register");
                setMessage("");
              }}
              aria-selected={activeTab === "register"}
            >
              Register
            </button>
          </div>

          {activeTab === "login" ? (
            <form className="auth-form active" onSubmit={handleLogin}>
              <h2>Welcome back</h2>
              <p>Sign in to continue your learning journey.</p>

              <label>
                Email
                <input
                  type="email"
                  name="loginEmail"
                  placeholder="Enter your Email Address"
                  autoComplete="email"
                  required
                  disabled={submitting}
                />
              </label>

              <label>
                Password
                <input
                  type="password"
                  name="loginPassword"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  disabled={submitting}
                />
              </label>

              <button type="submit" className="primary-btn" disabled={submitting}>
                {submitting ? "Signing In..." : "Login"}
              </button>
              <p className="helper-text">
                New learner? Switch to Register to create your profile.
              </p>
            </form>
          ) : (
            <form className="auth-form active" onSubmit={handleRegister}>
              <h2>Create your learner profile</h2>

              <div className="two-col">
                <label>
                  Full Name
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Your name"
                    autoComplete="name"
                    required
                    disabled={submitting}
                  />
                </label>

                <label>
                  Age
                  <input
                    type="number"
                    name="age"
                    min="5"
                    max="120"
                    placeholder="Age"
                    required
                    disabled={submitting}
                  />
                </label>
              </div>

              <label>
                Email
                <input
                  type="email"
                  name="registerEmail"
                  placeholder="learner@example.com"
                  autoComplete="email"
                  required
                  disabled={submitting}
                />
              </label>

              <label>
                Password
                <input
                  type="password"
                  name="registerPassword"
                  placeholder="Create a password"
                  autoComplete="new-password"
                  required
                  disabled={submitting}
                />
              </label>

              <div className="two-col">
                <label>
                  Preferred Language
                  <select name="language" required defaultValue="" disabled={submitting}>
                    <option value="" disabled>
                      Select language
                    </option>
                    {languages.map((language) => (
                      <option key={language}>{language}</option>
                    ))}
                  </select>
                </label>
              </div>

              <label>
                Education Level
                <select name="educationLevel" required defaultValue="" disabled={submitting}>
                  <option value="" disabled>
                    Select education level
                  </option>
                  {educationLevels.map((educationLevel) => (
                    <option key={educationLevel}>{educationLevel}</option>
                  ))}
                </select>
              </label>

              <button type="submit" className="primary-btn" disabled={submitting}>
                {submitting ? "Creating Account..." : "Register"}
              </button>
              <p className="helper-text">
                This information helps the assistant personalize content, voice, and feedback.
              </p>
            </form>
          )}

          {message ? <p className="status-message">{message}</p> : null}
        </div>
      </section>
    </main>
  );
}

export default App;