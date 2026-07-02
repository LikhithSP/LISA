import React, { useState } from "react";

const languages = ["English", "Hindi","Kannada", "Telugu", "Tamil", "Other"];
const studyLevels = ["Beginner", "Intermediate", "Advanced"];
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

  const handleSubmit = (event, formName) => {
    event.preventDefault();
    setMessage(`${formName} form is ready for backend integration.`);
  };

  return (
    <main className="shell">
      <section className="hero-panel">
        {/*<div className="brand-mark">LA</div>
        <p className="eyebrow">AI-Powered Learning Support Assistant</p>*/}
        <h1>Your AI companion for personalized literacy learning.</h1>
        <p className="hero-copy">
          Built for first-generation learners, senior citizens, and regional language users.
          The assistant adapts learning, gives simple feedback, and supports voice-based interaction.
        </p>

      </section>

      <section className="auth-panel" aria-label="Authentication forms">
        <div className="auth-card">
          <div className="auth-tabs" role="tablist" aria-label="Authentication tabs">
            <button
              className={`tab-btn ${activeTab === "login" ? "active" : ""}`}
              type="button"
              onClick={() => setActiveTab("login")}
              aria-selected={activeTab === "login"}
            >
              Login
            </button>
            <button
              className={`tab-btn ${activeTab === "register" ? "active" : ""}`}
              type="button"
              onClick={() => setActiveTab("register")}
              aria-selected={activeTab === "register"}
            >
              Register
            </button>
          </div>

          {activeTab === "login" ? (
            <form className="auth-form active" onSubmit={(event) => handleSubmit(event, "Login")}>
              <h2>Welcome back</h2>
              <p>Sign in to continue your learning journey.</p>

              <label>
                Email
                <input type="email" name="loginEmail" placeholder="Enter your Email Address" autoComplete="email" required />
              </label>

              <label>
                Password
                <input type="password" name="loginPassword" placeholder="Enter your password" autoComplete="current-password" required />
              </label>

              <button type="submit" className="primary-btn">Login</button>
              <p className="helper-text">New learner? Switch to Register to create your profile.</p>
            </form>
          ) : (
            <form className="auth-form active" onSubmit={(event) => handleSubmit(event, "Registration")}>
              <h2>Create your learner profile</h2>

              <div className="two-col">
                <label>
                  Full Name
                  <input type="text" name="fullName" placeholder="Your name" autoComplete="name" required />
                </label>

                <label>
                  Age
                  <input type="number" name="age" min="5" max="120" placeholder="Age" required />
                </label>
              </div>

              <label>
                Email
                <input type="email" name="registerEmail" placeholder="learner@example.com" autoComplete="email" required />
              </label>

              <label>
                Password
                <input type="password" name="registerPassword" placeholder="Create a password" autoComplete="new-password" required />
              </label>

              <div className="two-col">
                <label>
                  Preferred Language
                  <select name="language" required defaultValue="">
                    <option value="" disabled>Select language</option>
                    {languages.map((language) => (
                      <option key={language}>{language}</option>
                    ))}
                  </select>
                </label>
              </div>

              <label>
                Education Level
                <select name="educationLevel" required defaultValue="">
                  <option value="" disabled>Select education level</option>
                  {educationLevels.map((educationLevel) => (
                    <option key={educationLevel}>{educationLevel}</option>
                  ))}
                </select>
              </label>

              <button type="submit" className="primary-btn">Register</button>
              <p className="helper-text">This information helps the assistant personalize content, voice, and feedback.</p>
            </form>
          )}

          {message ? <p className="status-message">{message}</p> : null}
        </div>
      </section>
    </main>
  );
}

export default App;