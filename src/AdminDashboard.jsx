import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "./supabaseClient";

export default function AdminDashboard({ session, t = (key) => key }) {
  // Guard access
  const isAdmin = session?.user?.email === "admin@gmail.com";

  if (!isAdmin) {
    return (
      <div className="admin-access-denied" style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Access Denied</h2>
        <p>You do not have permissions to view this page.</p>
      </div>
    );
  }

  const [activeSubTab, setActiveSubTab] = useState("overview"); // "overview", "users", "words"
  
  // States for Users
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [editingUser, setEditingUser] = useState(null); // Profile object being edited
  const [deletingUser, setDeletingUser] = useState(null); // Profile object to delete

  // States for Words
  const [words, setWords] = useState([]);
  const [wordsLoading, setWordsLoading] = useState(false);
  const [wordSearch, setWordSearch] = useState("");
  const [editingWord, setEditingWord] = useState(null); // Word object being edited/added
  const [isAddingWord, setIsAddingWord] = useState(false);

  // Stats / Overview
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalXp: 0,
    avgLiteracyLevel: 0,
    levelsCount: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    langCount: {},
  });

  // Fetch Users & Stats
  const fetchUsersData = async () => {
    setUsersLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("xp", { ascending: false });

      if (error) throw error;

      if (data) {
        setUsers(data);
        
        // Calculate stats
        const totalUsers = data.length;
        const totalXp = data.reduce((acc, curr) => acc + (curr.xp || 0), 0);
        
        let literacySum = 0;
        let literacyCount = 0;
        const levelsCount = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        const langCount = {};

        data.forEach(user => {
          if (user.literacy_level) {
            literacySum += user.literacy_level;
            literacyCount++;
            levelsCount[user.literacy_level] = (levelsCount[user.literacy_level] || 0) + 1;
          }
          if (user.preferred_language) {
            langCount[user.preferred_language] = (langCount[user.preferred_language] || 0) + 1;
          }
        });

        setStats({
          totalUsers,
          totalXp,
          avgLiteracyLevel: literacyCount ? (literacySum / literacyCount).toFixed(1) : 0,
          levelsCount,
          langCount,
        });
      }
    } catch (err) {
      console.error("Error fetching admin users data:", err);
    } finally {
      setUsersLoading(false);
    }
  };

  // Fetch Words of the Day
  const fetchWordsData = async () => {
    setWordsLoading(true);
    try {
      const { data, error } = await supabase
        .from("word_of_day")
        .select("*")
        .order("word", { ascending: true });

      if (error) throw error;
      if (data) setWords(data);
    } catch (err) {
      console.error("Error fetching admin words data:", err);
    } finally {
      setWordsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersData();
    fetchWordsData();
  }, []);

  // Filtered lists
  const filteredUsers = useMemo(() => {
    if (!userSearch.trim()) return users;
    const query = userSearch.toLowerCase();
    return users.filter(user => 
      (user.full_name || "").toLowerCase().includes(query) ||
      (user.preferred_language || "").toLowerCase().includes(query) ||
      (user.education_level || "").toLowerCase().includes(query) ||
      (user.id || "").toLowerCase().includes(query)
    );
  }, [users, userSearch]);

  const filteredWords = useMemo(() => {
    if (!wordSearch.trim()) return words;
    const query = wordSearch.toLowerCase();
    return words.filter(w =>
      (w.word || "").toLowerCase().includes(query) ||
      (w.meaning || "").toLowerCase().includes(query) ||
      (w.language || "").toLowerCase().includes(query)
    );
  }, [words, wordSearch]);

  // Handle Edit User Submit
  const handleEditUserSubmit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: editingUser.full_name,
          age: editingUser.age ? parseInt(editingUser.age, 10) : null,
          preferred_language: editingUser.preferred_language,
          learning_language: editingUser.learning_language,
          xp: parseInt(editingUser.xp || 0, 10),
          literacy_level: editingUser.literacy_level ? parseInt(editingUser.literacy_level, 10) : null,
          streak: parseInt(editingUser.streak || 0, 10),
          assessment_completed: editingUser.assessment_completed,
        })
        .eq("id", editingUser.id);

      if (error) throw error;

      // Update state locally
      setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, ...editingUser } : u));
      setEditingUser(null);
    } catch (err) {
      alert("Failed to update user: " + err.message);
    }
  };

  // Handle Delete User Submit
  const handleDeleteUserConfirm = async () => {
    if (!deletingUser) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", deletingUser.id);

      if (error) throw error;

      // Update state locally
      setUsers(prev => prev.filter(u => u.id !== deletingUser.id));
      setDeletingUser(null);
    } catch (err) {
      alert("Failed to delete user: " + err.message);
    }
  };

  // Handle Add/Edit Word Submit
  const handleWordSubmit = async (e) => {
    e.preventDefault();
    if (!editingWord) return;

    try {
      if (isAddingWord) {
        // Insert new word
        const { data, error } = await supabase
          .from("word_of_day")
          .insert([{
            word: editingWord.word,
            language: editingWord.language || "English",
            meaning: editingWord.meaning,
            meaning_hi: editingWord.meaning_hi || "",
            meaning_kn: editingWord.meaning_kn || "",
            meaning_ta: editingWord.meaning_ta || "",
            meaning_te: editingWord.meaning_te || "",
            example: editingWord.example || ""
          }])
          .select();

        if (error) throw error;
        if (data) {
          setWords(prev => [...prev, data[0]].sort((a, b) => a.word.localeCompare(b.word)));
        }
      } else {
        // Update existing word
        const { error } = await supabase
          .from("word_of_day")
          .update({
            word: editingWord.word,
            language: editingWord.language,
            meaning: editingWord.meaning,
            meaning_hi: editingWord.meaning_hi,
            meaning_kn: editingWord.meaning_kn,
            meaning_ta: editingWord.meaning_ta,
            meaning_te: editingWord.meaning_te,
            example: editingWord.example
          })
          .eq("id", editingWord.id);

        if (error) throw error;
        setWords(prev => prev.map(w => w.id === editingWord.id ? editingWord : w));
      }

      setEditingWord(null);
      setIsAddingWord(false);
    } catch (err) {
      alert("Failed to save word: " + err.message);
    }
  };

  // Handle Delete Word Confirm
  const handleDeleteWord = async (wordId) => {
    if (!window.confirm("Are you sure you want to delete this word?")) return;

    try {
      const { error } = await supabase
        .from("word_of_day")
        .delete()
        .eq("id", wordId);

      if (error) throw error;
      setWords(prev => prev.filter(w => w.id !== wordId));
    } catch (err) {
      alert("Failed to delete word: " + err.message);
    }
  };

  return (
    <div className="admin-dashboard-container">
      <div className="admin-header">
        <div className="admin-title-row">
          <h2>🔒 Admin Portal</h2>
          <p>LISA Administrator Operations & Analytics Panel</p>
        </div>
        <div className="admin-tabs">
          <button 
            type="button" 
            className={`admin-tab-btn ${activeSubTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveSubTab("overview")}
          >
            📊 Analytics Overview
          </button>
          <button 
            type="button" 
            className={`admin-tab-btn ${activeSubTab === "users" ? "active" : ""}`}
            onClick={() => setActiveSubTab("users")}
          >
            👥 User Profiles
          </button>
          <button 
            type="button" 
            className={`admin-tab-btn ${activeSubTab === "words" ? "active" : ""}`}
            onClick={() => setActiveSubTab("words")}
          >
            📖 Words of the Day
          </button>
        </div>
      </div>

      <div className="admin-body">
        {/* OVERVIEW SUB-TAB */}
        {activeSubTab === "overview" && (
          <div className="admin-section animate-fade-in">
            <div className="admin-stats-grid">
              <div className="admin-stat-card">
                <span className="stat-card-icon">👥</span>
                <div className="stat-card-info">
                  <h3>{stats.totalUsers}</h3>
                  <p>Registered Learners</p>
                </div>
              </div>

              <div className="admin-stat-card">
                <span className="stat-card-icon">⚡</span>
                <div className="stat-card-info">
                  <h3>{stats.totalXp.toLocaleString()}</h3>
                  <p>Total XP Earned</p>
                </div>
              </div>

              <div className="admin-stat-card">
                <span className="stat-card-icon">📚</span>
                <div className="stat-card-info">
                  <h3>{stats.avgLiteracyLevel}</h3>
                  <p>Average Literacy Level</p>
                </div>
              </div>

              <div className="admin-stat-card">
                <span className="stat-card-icon">🗣️</span>
                <div className="stat-card-info">
                  <h3>{Object.keys(stats.langCount).length || 0}</h3>
                  <p>Languages Configured</p>
                </div>
              </div>
            </div>

            <div className="admin-charts-grid">
              <div className="admin-chart-box">
                <h4>Literacy Level Distribution</h4>
                <div className="bar-chart-container">
                  {[1, 2, 3, 4, 5].map(lvl => {
                    const count = stats.levelsCount[lvl] || 0;
                    const pct = stats.totalUsers ? (count / stats.totalUsers) * 100 : 0;
                    return (
                      <div key={lvl} className="bar-chart-row">
                        <span className="bar-label">Level {lvl}</span>
                        <div className="bar-track">
                          <div className="bar-fill" style={{ width: `${pct}%`, background: "var(--accent)" }} />
                        </div>
                        <span className="bar-value">{count} ({pct.toFixed(0)}%)</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="admin-chart-box">
                <h4>Preferred Interface Languages</h4>
                <div className="bar-chart-container">
                  {Object.entries(stats.langCount).map(([lang, count]) => {
                    const pct = stats.totalUsers ? (count / stats.totalUsers) * 100 : 0;
                    return (
                      <div key={lang} className="bar-chart-row">
                        <span className="bar-label">{lang}</span>
                        <div className="bar-track">
                          <div className="bar-fill" style={{ width: `${pct}%`, background: "var(--flz-ok)" }} />
                        </div>
                        <span className="bar-value">{count} ({pct.toFixed(0)}%)</span>
                      </div>
                    );
                  })}
                  {Object.keys(stats.langCount).length === 0 && (
                    <p style={{ color: "var(--muted)", fontStyle: "italic", textAlign: "center", width: "100%" }}>No language metrics available</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* USERS SUB-TAB */}
        {activeSubTab === "users" && (
          <div className="admin-section animate-fade-in">
            <div className="table-controls">
              <div className="search-bar-wrapper">
                <input 
                  type="text" 
                  className="admin-search-input" 
                  placeholder="Search profiles by name, language, or UUID..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
                {userSearch && <button type="button" className="clear-search-btn" onClick={() => setUserSearch("")}>✕</button>}
              </div>
              <button type="button" className="refresh-data-btn" onClick={fetchUsersData}>
                🔄 Refresh Profiles
              </button>
            </div>

            {usersLoading ? (
              <div className="admin-loading-spinner">Loading profiles list...</div>
            ) : (
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name / ID</th>
                      <th>Age</th>
                      <th>Language Settings</th>
                      <th>XP / Streak</th>
                      <th>Literacy Level</th>
                      <th>Assessment Completed</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(user => (
                      <tr key={user.id}>
                        <td>
                          <div className="user-td-cell">
                            <span className="user-td-name">{user.full_name || "Anonymous Learner"}</span>
                            <span className="user-td-id">{user.id}</span>
                          </div>
                        </td>
                        <td>{user.age || "N/A"}</td>
                        <td>
                          <div className="user-td-cell">
                            <span>UI: <b>{user.preferred_language || "English"}</b></span>
                            <span>Learning: <b>{user.learning_language || "English"}</b></span>
                          </div>
                        </td>
                        <td>
                          <div className="user-td-cell">
                            <span>⭐ {user.xp || 0} XP</span>
                            <span>🔥 {user.streak || 0} Streak</span>
                          </div>
                        </td>
                        <td>
                          <span className={`level-badge level-${user.literacy_level || 'none'}`}>
                            {user.literacy_level ? `Level ${user.literacy_level}` : "Not Diagnosed"}
                          </span>
                        </td>
                        <td>
                          <span className={`status-pill ${user.assessment_completed ? 'completed' : 'pending'}`}>
                            {user.assessment_completed ? "Completed" : "Not Done"}
                          </span>
                        </td>
                        <td>
                          <div className="action-button-row">
                            <button 
                              type="button" 
                              className="admin-action-btn edit"
                              onClick={() => setEditingUser(user)}
                            >
                              ✏️ Edit
                            </button>
                            <button 
                              type="button" 
                              className="admin-action-btn delete"
                              onClick={() => setDeletingUser(user)}
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredUsers.length === 0 && (
                      <tr>
                        <td colSpan="7" style={{ textAlign: "center", padding: "30px", color: "var(--muted)" }}>
                          No users found matching query.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* WORDS SUB-TAB */}
        {activeSubTab === "words" && (
          <div className="admin-section animate-fade-in">
            <div className="table-controls">
              <div className="search-bar-wrapper">
                <input 
                  type="text" 
                  className="admin-search-input" 
                  placeholder="Search words by spelling, translation, or language..."
                  value={wordSearch}
                  onChange={(e) => setWordSearch(e.target.value)}
                />
                {wordSearch && <button type="button" className="clear-search-btn" onClick={() => setWordSearch("")}>✕</button>}
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  type="button" 
                  className="admin-add-btn" 
                  onClick={() => {
                    setIsAddingWord(true);
                    setEditingWord({
                      word: "",
                      language: "English",
                      meaning: "",
                      meaning_hi: "",
                      meaning_kn: "",
                      meaning_ta: "",
                      meaning_te: "",
                      example: ""
                    });
                  }}
                >
                  ➕ Add New Word
                </button>
                <button type="button" className="refresh-data-btn" onClick={fetchWordsData}>
                  🔄 Refresh Words
                </button>
              </div>
            </div>

            {wordsLoading ? (
              <div className="admin-loading-spinner">Loading words database...</div>
            ) : (
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Word</th>
                      <th>Language</th>
                      <th>English Meaning</th>
                      <th>Regional Translations</th>
                      <th>Sample Example</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredWords.map(w => (
                      <tr key={w.id}>
                        <td><b>{w.word}</b></td>
                        <td><span className="lang-tag">{w.language}</span></td>
                        <td>{w.meaning}</td>
                        <td>
                          <div className="translations-preview">
                            {w.meaning_hi && <div><span>Hindi:</span> {w.meaning_hi}</div>}
                            {w.meaning_kn && <div><span>Kannada:</span> {w.meaning_kn}</div>}
                            {w.meaning_ta && <div><span>Tamil:</span> {w.meaning_ta}</div>}
                            {w.meaning_te && <div><span>Telugu:</span> {w.meaning_te}</div>}
                          </div>
                        </td>
                        <td><i style={{ fontSize: '0.9rem' }}>"{w.example}"</i></td>
                        <td>
                          <div className="action-button-row">
                            <button 
                              type="button" 
                              className="admin-action-btn edit"
                              onClick={() => {
                                setIsAddingWord(false);
                                setEditingWord(w);
                              }}
                            >
                              ✏️ Edit
                            </button>
                            <button 
                              type="button" 
                              className="admin-action-btn delete"
                              onClick={() => handleDeleteWord(w.id)}
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredWords.length === 0 && (
                      <tr>
                        <td colSpan="6" style={{ textAlign: "center", padding: "30px", color: "var(--muted)" }}>
                          No words of the day configured. Click "Add New Word" to get started!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* EDIT USER MODAL */}
      {editingUser && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="modal-header">
              <h3>Edit Profile Details</h3>
              <button type="button" className="close-modal-btn" onClick={() => setEditingUser(null)}>✕</button>
            </div>
            <form onSubmit={handleEditUserSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Full Name</label>
                  <input 
                    type="text" 
                    required 
                    value={editingUser.full_name} 
                    onChange={e => setEditingUser({ ...editingUser, full_name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Age</label>
                  <input 
                    type="number" 
                    min="5" 
                    max="120" 
                    value={editingUser.age || ""} 
                    onChange={e => setEditingUser({ ...editingUser, age: e.target.value ? parseInt(e.target.value, 10) : "" })}
                  />
                </div>
                <div className="form-group">
                  <label>XP Score</label>
                  <input 
                    type="number" 
                    min="0" 
                    value={editingUser.xp} 
                    onChange={e => setEditingUser({ ...editingUser, xp: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Streak (Days)</label>
                  <input 
                    type="number" 
                    min="0" 
                    value={editingUser.streak} 
                    onChange={e => setEditingUser({ ...editingUser, streak: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Preferred UI Language</label>
                  <select 
                    value={editingUser.preferred_language || "English"} 
                    onChange={e => setEditingUser({ ...editingUser, preferred_language: e.target.value })}
                  >
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Kannada">Kannada</option>
                    <option value="Telugu">Telugu</option>
                    <option value="Tamil">Tamil</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Learning Language</label>
                  <select 
                    value={editingUser.learning_language || "English"} 
                    onChange={e => setEditingUser({ ...editingUser, learning_language: e.target.value })}
                  >
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Kannada">Kannada</option>
                    <option value="Telugu">Telugu</option>
                    <option value="Tamil">Tamil</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Literacy Diagnosis Level</label>
                  <select 
                    value={editingUser.literacy_level || ""} 
                    onChange={e => setEditingUser({ ...editingUser, literacy_level: e.target.value ? parseInt(e.target.value, 10) : null })}
                  >
                    <option value="">Not Diagnosed</option>
                    <option value="1">Level 1 (Beginner)</option>
                    <option value="2">Level 2</option>
                    <option value="3">Level 3 (Intermediate)</option>
                    <option value="4">Level 4</option>
                    <option value="5">Level 5 (Advanced)</option>
                  </select>
                </div>
                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={editingUser.assessment_completed} 
                      onChange={e => setEditingUser({ ...editingUser, assessment_completed: e.target.checked })}
                    />
                    Initial Assessment Completed
                  </label>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="secondary-btn" onClick={() => setEditingUser(null)}>Cancel</button>
                <button type="submit" className="primary-btn">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM MODAL */}
      {deletingUser && (
        <div className="admin-modal-overlay">
          <div className="admin-modal danger">
            <div className="modal-header">
              <h3>Delete Learner Profile?</h3>
              <button type="button" className="close-modal-btn" onClick={() => setDeletingUser(null)}>✕</button>
            </div>
            <div className="modal-body" style={{ padding: '20px 0' }}>
              <p>Are you sure you want to permanently delete <b>{deletingUser.full_name || "this user"}</b>'s profile?</p>
              <p style={{ color: 'var(--flz-bad)', fontSize: '0.85rem', marginTop: '10px' }}>
                ⚠️ Warning: This action is irreversible. All student progress, XP, completed lessons, and stats will be lost.
              </p>
            </div>
            <div className="modal-footer">
              <button type="button" className="secondary-btn" onClick={() => setDeletingUser(null)}>Cancel</button>
              <button type="button" className="danger-btn" onClick={handleDeleteUserConfirm}>Permanently Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* ADD/EDIT WORD MODAL */}
      {editingWord && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="modal-header">
              <h3>{isAddingWord ? "Add Word of the Day" : "Edit Word of the Day"}</h3>
              <button type="button" className="close-modal-btn" onClick={() => {
                setEditingWord(null);
                setIsAddingWord(false);
              }}>✕</button>
            </div>
            <form onSubmit={handleWordSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Spelling / Word</label>
                  <input 
                    type="text" 
                    required 
                    value={editingWord.word} 
                    onChange={e => setEditingWord({ ...editingWord, word: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Language</label>
                  <select 
                    value={editingWord.language || "English"} 
                    onChange={e => setEditingWord({ ...editingWord, language: e.target.value })}
                  >
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Kannada">Kannada</option>
                    <option value="Telugu">Telugu</option>
                    <option value="Tamil">Tamil</option>
                  </select>
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label>Meaning (in English)</label>
                  <input 
                    type="text" 
                    required 
                    value={editingWord.meaning} 
                    onChange={e => setEditingWord({ ...editingWord, meaning: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Meaning in Hindi (Optional)</label>
                  <input 
                    type="text" 
                    value={editingWord.meaning_hi || ""} 
                    onChange={e => setEditingWord({ ...editingWord, meaning_hi: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Meaning in Kannada (Optional)</label>
                  <input 
                    type="text" 
                    value={editingWord.meaning_kn || ""} 
                    onChange={e => setEditingWord({ ...editingWord, meaning_kn: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Meaning in Tamil (Optional)</label>
                  <input 
                    type="text" 
                    value={editingWord.meaning_ta || ""} 
                    onChange={e => setEditingWord({ ...editingWord, meaning_ta: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Meaning in Telugu (Optional)</label>
                  <input 
                    type="text" 
                    value={editingWord.meaning_te || ""} 
                    onChange={e => setEditingWord({ ...editingWord, meaning_te: e.target.value })}
                  />
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label>Sample Usage Example Sentence</label>
                  <textarea 
                    rows="3" 
                    required
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '10px',
                      border: '2px solid var(--line)',
                      background: 'var(--panel)',
                      color: 'var(--text)'
                    }}
                    value={editingWord.example} 
                    onChange={e => setEditingWord({ ...editingWord, example: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="secondary-btn" onClick={() => {
                  setEditingWord(null);
                  setIsAddingWord(false);
                }}>Cancel</button>
                <button type="submit" className="primary-btn">Save Word</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
