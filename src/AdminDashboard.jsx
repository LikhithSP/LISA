import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "./supabaseClient";
import { CURRICULUM_SECTIONS, SKILL_CATEGORIES } from "./curriculumData";
import { assessmentQuestionsByLanguage } from "./assessmentQuestionsData";
import { 
  Users, 
  Search, 
  Trash2, 
  Edit, 
  BookOpen, 
  Download, 
  RefreshCw, 
  Eye, 
  Sparkles, 
  Award, 
  Layers 
} from "lucide-react";

export default function AdminDashboard({ session, t = (key) => key, shopCatalog, onShopCatalogChange }) {
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

  const [activeSubTab, setActiveSubTab] = useState("overview"); // "overview", "users", "words", "curriculum", "xpshop"

  // States for XP Shop Management
  const [localShopCatalog, setLocalShopCatalog] = useState(null);
  const [activeShopCategory, setActiveShopCategory] = useState("themes");
  const [editingShopItem, setEditingShopItem] = useState(null);
  const [isAddingShopItem, setIsAddingShopItem] = useState(false);
  const [shopSaving, setShopSaving] = useState(false);

  useEffect(() => {
    if (shopCatalog) {
      setLocalShopCatalog(JSON.parse(JSON.stringify(shopCatalog)));
    }
  }, [shopCatalog, activeSubTab]);
  
  // States for Users
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [userFilter, setUserFilter] = useState("all"); // "all", "completed", "pending", "not_diagnosed"
  const [userSort, setUserSort] = useState("xp"); // "name", "xp", "streak", "level"
  const [editingUser, setEditingUser] = useState(null); // Profile object being edited
  const [deletingUser, setDeletingUser] = useState(null); // Profile object to delete
  const [viewingUserDetail, setViewingUserDetail] = useState(null); // Profile object being viewed

  // States for Curriculum
  const [selectedCurriculumLang, setSelectedCurriculumLang] = useState("English");
  const [activeCurriculumSection, setActiveCurriculumSection] = useState("");

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
    learningLangCount: {},
    activeLearners: 0,
    totalCompletedLessons: 0,
    completedAssessmentsPct: 0
  });

  // Local Curriculum State for Management
  const [localCurriculum, setLocalCurriculum] = useState([]);
  
  useEffect(() => {
    if (activeSubTab === "curriculum") {
      setLocalCurriculum(JSON.parse(JSON.stringify(CURRICULUM_SECTIONS)));
    }
  }, [activeSubTab]);

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
        let activeLearners = 0;
        let totalCompletedLessons = 0;
        let completedAssessmentsCount = 0;
        const levelsCount = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
        const langCount = {};
        const learningLangCount = {};

        data.forEach(user => {
          if (user.literacy_level) {
            literacySum += user.literacy_level;
            literacyCount++;
            levelsCount[user.literacy_level] = (levelsCount[user.literacy_level] || 0) + 1;
          }
          if (user.preferred_language) {
            langCount[user.preferred_language] = (langCount[user.preferred_language] || 0) + 1;
          }
          if (user.learning_language) {
            learningLangCount[user.learning_language] = (learningLangCount[user.learning_language] || 0) + 1;
          }
          if (user.streak > 0) {
            activeLearners++;
          }
          if (user.completed_lessons && Array.isArray(user.completed_lessons)) {
            totalCompletedLessons += user.completed_lessons.length;
          }
          if (user.assessment_completed) {
            completedAssessmentsCount++;
          }
        });

        setStats({
          totalUsers,
          totalXp,
          avgLiteracyLevel: literacyCount ? (literacySum / literacyCount).toFixed(1) : 0,
          levelsCount,
          langCount,
          learningLangCount,
          activeLearners,
          totalCompletedLessons,
          completedAssessmentsPct: totalUsers ? Math.round((completedAssessmentsCount / totalUsers) * 100) : 0
        });
      }
    } catch (err) {
      console.error("Error fetching admin users data:", err);
    } finally {
      setUsersLoading(false);
    }
  };

  const handleSaveShopCatalog = async (updatedCatalog) => {
    setShopSaving(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("shop_data")
        .eq("id", "3f8601e1-527e-45bd-bc8b-f0429d10a991")
        .maybeSingle();

      let targetId = "3f8601e1-527e-45bd-bc8b-f0429d10a991";
      let existingShopData = {};

      if (data && !error) {
        existingShopData = data.shop_data || {};
      } else {
        const fallback = await supabase
          .from("profiles")
          .select("id, shop_data")
          .eq("full_name", "ADMIN")
          .maybeSingle();
        if (fallback.data && !fallback.error) {
          targetId = fallback.data.id;
          existingShopData = fallback.data.shop_data || {};
        }
      }

      const mergedShopData = {
        ...existingShopData,
        is_global_shop_catalog: true,
        global_shop_catalog: updatedCatalog
      };

      const updateResult = await supabase
        .from("profiles")
        .update({ shop_data: mergedShopData })
        .eq("id", targetId);

      if (updateResult.error) {
        throw updateResult.error;
      }

      if (onShopCatalogChange) {
        onShopCatalogChange(updatedCatalog);
      }
      alert("XP Shop Catalog successfully saved and published!");
    } catch (err) {
      console.error("Error saving XP Shop catalog:", err);
      alert("Failed to save XP Shop Catalog: " + err.message);
    } finally {
      setShopSaving(false);
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

  // Filtered and sorted lists
  const filteredUsers = useMemo(() => {
    let result = [...users];

    // Search query filter
    if (userSearch.trim()) {
      const query = userSearch.toLowerCase();
      result = result.filter(user => 
        (user.full_name || "").toLowerCase().includes(query) ||
        (user.preferred_language || "").toLowerCase().includes(query) ||
        (user.education_level || "").toLowerCase().includes(query) ||
        (user.id || "").toLowerCase().includes(query)
      );
    }

    // Diagnostic/Assessment completion filter
    if (userFilter === "completed") {
      result = result.filter(user => user.assessment_completed === true);
    } else if (userFilter === "pending") {
      result = result.filter(user => !user.assessment_completed);
    } else if (userFilter === "not_diagnosed") {
      result = result.filter(user => !user.literacy_level);
    }

    // Sort order logic
    result.sort((a, b) => {
      if (userSort === "name") {
        return (a.full_name || "").localeCompare(b.full_name || "");
      } else if (userSort === "xp") {
        return (b.xp || 0) - (a.xp || 0);
      } else if (userSort === "streak") {
        return (b.streak || 0) - (a.streak || 0);
      } else if (userSort === "level") {
        return (b.literacy_level || 0) - (a.literacy_level || 0);
      }
      return 0;
    });

    return result;
  }, [users, userSearch, userFilter, userSort]);

  // Client-side CSV export logic
  const exportUsersCSV = () => {
    if (!filteredUsers || filteredUsers.length === 0) return;
    
    const headers = ["User ID", "Full Name", "Age", "Interface Language", "Learning Language", "XP", "Streak", "Literacy Level", "Assessment Completed", "Last Active Date"];
    const rows = filteredUsers.map(u => [
      u.id,
      `"${(u.full_name || "Anonymous Learner").replace(/"/g, '""')}"`,
      u.age || "N/A",
      u.preferred_language || "English",
      u.learning_language || "English",
      u.xp || 0,
      u.streak || 0,
      u.literacy_level ? `Level ${u.literacy_level}` : "Not Diagnosed",
      u.assessment_completed ? "Completed" : "Not Done",
      u.last_active_date || "N/A"
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `lisa_learner_roster_${new Date().toLocaleDateString("en-CA")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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

  // States and Handlers for XP Shop CRUD
  const handleEditShopItem = (item) => {
    setEditingShopItem({ ...item });
    setIsAddingShopItem(false);
  };

  const handleAddShopItemClick = () => {
    const newItem = {
      id: `${activeShopCategory}_new_${Date.now()}`,
      name: "",
      desc: "",
      cost: 50,
      icon: "🎁"
    };
    if (activeShopCategory === "themes") {
      newItem.preview = { accent: "#3b82f6", accentDark: "#1d4ed8", accentSoft: "#dbeafe", bg: "#f8fafc" };
    } else if (activeShopCategory === "fonts") {
      newItem.family = "sans-serif";
    } else if (activeShopCategory === "banners") {
      newItem.image = "";
    } else if (activeShopCategory === "avatars") {
      newItem.emoji = "😀";
    } else if (activeShopCategory === "badges") {
      newItem.rarity = "common";
    }
    setEditingShopItem(newItem);
    setIsAddingShopItem(true);
  };

  const handleDeleteShopItem = (itemId) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    const updatedCatalog = { ...localShopCatalog };
    updatedCatalog[activeShopCategory] = updatedCatalog[activeShopCategory].filter(item => item.id !== itemId);
    setLocalShopCatalog(updatedCatalog);
    handleSaveShopCatalog(updatedCatalog);
  };

  const handleSaveShopItemSubmit = (e) => {
    e.preventDefault();
    if (!editingShopItem) return;
    const updatedCatalog = { ...localShopCatalog };
    const items = [...(updatedCatalog[activeShopCategory] || [])];
    
    if (isAddingShopItem) {
      items.push(editingShopItem);
    } else {
      const idx = items.findIndex(item => item.id === editingShopItem.id);
      if (idx !== -1) {
        items[idx] = editingShopItem;
      }
    }
    
    updatedCatalog[activeShopCategory] = items;
    setLocalShopCatalog(updatedCatalog);
    setEditingShopItem(null);
    setIsAddingShopItem(false);
    handleSaveShopCatalog(updatedCatalog);
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
  // Save Curriculum to Supabase
  const handleSaveCurriculum = async () => {
    try {
      const adminUserId = session?.user?.id;
      if (!adminUserId) return;

      const { data: profileData } = await supabase.from("profiles").select("shop_data").eq("id", adminUserId).single();
      const existingShopData = profileData?.shop_data || {};

      const updatedShopData = {
        ...existingShopData,
        custom_curriculum: localCurriculum
      };

      const { error } = await supabase
        .from("profiles")
        .update({
          shop_data: updatedShopData
        })
        .eq("id", adminUserId);

      if (error) throw error;

      // Update global array in-place so all app modules reflect the changes immediately
      CURRICULUM_SECTIONS.length = 0;
      CURRICULUM_SECTIONS.push(...localCurriculum);

      alert("✅ Curriculum saved successfully and synchronized across the platform!");
    } catch (err) {
      alert("❌ Failed to save curriculum: " + err.message);
    }
  };

  // Section Handlers
  const handleAddSection = () => {
    const newSecId = "sec_" + Date.now();
    const newSection = {
      id: newSecId,
      title: "New Section",
      desc: "Describe what skills this section targets",
      skillTarget: "word_recognition",
      units: []
    };
    setLocalCurriculum(prev => [...prev, newSection]);
    setActiveCurriculumSection(newSecId);
  };

  const handleUpdateSectionField = (secId, field, value) => {
    setLocalCurriculum(prev => prev.map(sec => {
      if (sec.id === secId) {
        return { ...sec, [field]: value };
      }
      return sec;
    }));
  };

  const handleDeleteSection = (secId) => {
    if (!window.confirm("Are you sure you want to delete this section? All its units and lessons will be removed!")) return;
    setLocalCurriculum(prev => prev.filter(sec => sec.id !== secId));
    setActiveCurriculumSection("");
  };

  // Unit Handlers
  const handleAddUnit = (secId) => {
    const newUnitId = "uni_" + Date.now();
    const newUnit = {
      id: newUnitId,
      title: "New Unit",
      skill: "word_recognition",
      lessons: []
    };
    setLocalCurriculum(prev => prev.map(sec => {
      if (sec.id === secId) {
        return { ...sec, units: [...sec.units, newUnit] };
      }
      return sec;
    }));
  };

  const handleUpdateUnitField = (secId, unitId, field, value) => {
    setLocalCurriculum(prev => prev.map(sec => {
      if (sec.id === secId) {
        return {
          ...sec,
          units: sec.units.map(uni => {
            if (uni.id === unitId) {
              return { ...uni, [field]: value };
            }
            return uni;
          })
        };
      }
      return sec;
    }));
  };

  const handleDeleteUnit = (secId, unitId) => {
    if (!window.confirm("Are you sure you want to delete this unit?")) return;
    setLocalCurriculum(prev => prev.map(sec => {
      if (sec.id === secId) {
        return { ...sec, units: sec.units.filter(uni => uni.id !== unitId) };
      }
      return sec;
    }));
  };

  // Lesson Handlers
  const handleAddLesson = (secId, unitId, lessonTitle) => {
    if (!lessonTitle.trim()) return;
    const newLesId = "les_" + Date.now();
    const newLesson = {
      id: newLesId,
      title: lessonTitle
    };
    setLocalCurriculum(prev => prev.map(sec => {
      if (sec.id === secId) {
        return {
          ...sec,
          units: sec.units.map(uni => {
            if (uni.id === unitId) {
              return { ...uni, lessons: [...uni.lessons, newLesson] };
            }
            return uni;
          })
        };
      }
      return sec;
    }));
  };

  const handleDeleteLesson = (secId, unitId, lesId) => {
    setLocalCurriculum(prev => prev.map(sec => {
      if (sec.id === secId) {
        return {
          ...sec,
          units: sec.units.map(uni => {
            if (uni.id === unitId) {
              return { ...uni, lessons: uni.lessons.filter(l => l.id !== lesId) };
            }
            return uni;
          })
        };
      }
      return sec;
    }));
  };

  const handleUpdateLessonTitle = (secId, unitId, lesId, newTitle) => {
    setLocalCurriculum(prev => prev.map(sec => {
      if (sec.id === secId) {
        return {
          ...sec,
          units: sec.units.map(uni => {
            if (uni.id === unitId) {
              return {
                ...uni,
                lessons: uni.lessons.map(l => l.id === lesId ? { ...l, title: newTitle } : l)
              };
            }
            return uni;
          })
        };
      }
      return sec;
    }));
  };

  const getLessonNameById = (lessonId) => {
    if (!lessonId) return "N/A";

    const practiceMatch = lessonId.match(/^l(\d+)_(.+)$/);
    if (practiceMatch) {
      const level = practiceMatch[1];
      const rawType = practiceMatch[2];
      
      let typeLabel = rawType;
      if (rawType === "comp_practice") typeLabel = "Stories Practice";
      else if (rawType === "speak_practice" || rawType === "speak") typeLabel = "Speak Practice";
      else if (rawType === "write_practice" || rawType === "write") typeLabel = "Write Practice";
      else if (rawType === "read_practice" || rawType === "read") typeLabel = "Read Practice";
      else if (rawType === "words_practice" || rawType === "words") typeLabel = "Words Practice";
      else if (rawType === "mistakes_practice") typeLabel = "Mistakes Practice";
      else if (rawType === "perfect_pronunciation" || rawType === "pronunciation_practice") typeLabel = "Perfect Pronunciation";
      
      return `${typeLabel} (Level ${level})`;
    }

    for (const section of localCurriculum) {
      for (const unit of section.units) {
        for (const lesson of unit.lessons) {
          if (lesson.id === lessonId) return lesson.title;
        }
      }
    }
    for (const section of CURRICULUM_SECTIONS) {
      for (const unit of section.units) {
        for (const lesson of unit.lessons) {
          if (lesson.id === lessonId) return lesson.title;
        }
      }
    }
    if (lessonId === "ach_1") return "Diagnostic Assessment Completed";
    return lessonId;
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
          <button 
            type="button" 
            className={`admin-tab-btn ${activeSubTab === "curriculum" ? "active" : ""}`}
            onClick={() => setActiveSubTab("curriculum")}
          >
            📚 Curriculum & Assessment
          </button>
          <button 
            type="button" 
            className={`admin-tab-btn ${activeSubTab === "xpshop" ? "active" : ""}`}
            onClick={() => setActiveSubTab("xpshop")}
          >
            🛍️ XP Shop Items
          </button>
        </div>
      </div>

      <div className="admin-body">
        {/* OVERVIEW SUB-TAB */}
        {activeSubTab === "overview" && (
          <div className="admin-section animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: 'var(--text)' }}>📊 Platform Insights & Analytics</h3>
              <button 
                type="button" 
                className="admin-export-btn"
                onClick={exportUsersCSV}
                style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  background: 'linear-gradient(135deg, var(--accent), #df7f3d)', 
                  color: 'white', 
                  padding: '10px 20px', 
                  borderRadius: '16px', 
                  fontWeight: 800, 
                  border: 'none', 
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(198, 95, 45, 0.2)',
                  fontFamily: 'var(--font-family)',
                  fontSize: '0.85rem'
                }}
              >
                <Download size={15} style={{ strokeWidth: 3 }} /> Export Learner Roster (CSV)
              </button>
            </div>
             <div className="admin-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <div className="admin-stat-card" style={{ transition: 'transform 0.2s ease', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                <span className="stat-card-icon" style={{ background: 'rgba(198, 95, 45, 0.1)', color: 'var(--accent)' }}>👥</span>
                <div className="stat-card-info">
                  <h3>{stats.totalUsers}</h3>
                  <p>Registered Learners</p>
                </div>
              </div>

              <div className="admin-stat-card" style={{ transition: 'transform 0.2s ease', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                <span className="stat-card-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#d97706' }}>⚡</span>
                <div className="stat-card-info">
                  <h3>{stats.totalXp.toLocaleString()}</h3>
                  <p>Total XP Earned</p>
                </div>
              </div>

              <div className="admin-stat-card" style={{ transition: 'transform 0.2s ease', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                <span className="stat-card-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>📚</span>
                <div className="stat-card-info">
                  <h3>{stats.avgLiteracyLevel}</h3>
                  <p>Avg Literacy Level</p>
                </div>
              </div>

              <div className="admin-stat-card" style={{ transition: 'transform 0.2s ease', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                <span className="stat-card-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>🔥</span>
                <div className="stat-card-info">
                  <h3>{stats.activeLearners}</h3>
                  <p>Active Learners</p>
                </div>
              </div>

              <div className="admin-stat-card" style={{ transition: 'transform 0.2s ease', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                <span className="stat-card-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>📖</span>
                <div className="stat-card-info">
                  <h3>{stats.totalCompletedLessons}</h3>
                  <p>Lessons Completed</p>
                </div>
              </div>

              <div className="admin-stat-card" style={{ transition: 'transform 0.2s ease', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                <span className="stat-card-icon" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>🎯</span>
                <div className="stat-card-info">
                  <h3>{stats.completedAssessmentsPct}%</h3>
                  <p>Assessment Complete</p>
                </div>
              </div>
            </div>

            <div className="admin-charts-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
              {/* SVG Vertical Bar Chart for Literacy Levels */}
              <div className="admin-chart-box" style={{ background: 'var(--panel-strong)', border: '1px solid var(--line)', borderRadius: '24px', padding: '24px' }}>
                <h4 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 900, color: 'var(--text)' }}>Literacy Level Distribution</h4>
                {(() => {
                  const counts = [1, 2, 3, 4, 5].map(lvl => stats.levelsCount[lvl] || 0);
                  const maxCount = Math.max(...counts, 1);
                  const chartHeight = 180;
                  const chartWidth = 320;
                  const barWidth = 36;
                  const spacing = (chartWidth - (barWidth * 5)) / 6;

                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <svg width="100%" height="240" viewBox={`0 0 ${chartWidth + 40} 240`} style={{ overflow: 'visible' }}>
                        <defs>
                          <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--accent)" />
                            <stop offset="100%" stopColor="#df7f3d" />
                          </linearGradient>
                        </defs>
                        
                        {/* Horizontal Gridlines */}
                        {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                          const y = chartHeight - (ratio * chartHeight) + 15;
                          const gridVal = Math.round(ratio * maxCount);
                          return (
                            <g key={idx}>
                              <line x1="30" y1={y} x2={chartWidth + 30} y2={y} stroke="var(--line)" strokeWidth="1" strokeDasharray="4 4" />
                              <text x="22" y={y + 4} fill="var(--muted)" fontSize="10" fontWeight="800" textAnchor="end">{gridVal}</text>
                            </g>
                          );
                        })}

                        {/* Bars and labels */}
                        {[1, 2, 3, 4, 5].map((lvl, index) => {
                          const count = stats.levelsCount[lvl] || 0;
                          const barHeight = (count / maxCount) * chartHeight;
                          const x = spacing + index * (barWidth + spacing) + 30;
                          const y = chartHeight - barHeight + 15;

                          return (
                            <g key={lvl} style={{ transition: 'all 0.3s ease' }}>
                              {/* Hover tooltip area */}
                              <title>{`Level ${lvl}: ${count} students`}</title>
                              
                              {/* Rounded top rect for bar */}
                              <rect
                                x={x}
                                y={y}
                                width={barWidth}
                                height={barHeight}
                                rx="8"
                                fill="url(#barGrad)"
                                style={{ cursor: 'pointer' }}
                              />
                              
                              {/* Count Text on top of the bar */}
                              {count > 0 && (
                                <text
                                  x={x + barWidth / 2}
                                  y={y - 6}
                                  fill="var(--text)"
                                  fontSize="10"
                                  fontWeight="900"
                                  textAnchor="middle"
                                >
                                  {count}
                                </text>
                              )}

                              {/* Bottom labels */}
                              <text
                                x={x + barWidth / 2}
                                y={chartHeight + 35}
                                fill="var(--text)"
                                fontSize="10.5"
                                fontWeight="900"
                                textAnchor="middle"
                              >
                                Lvl {lvl}
                              </text>
                            </g>
                          );
                        })}
                        {/* Baseline */}
                        <line x1="30" y1={chartHeight + 15} x2={chartWidth + 30} y2={chartHeight + 15} stroke="var(--line)" strokeWidth="2" />
                      </svg>
                    </div>
                  );
                })()}
              </div>

              {/* SVG Donut Chart for Languages */}
              <div className="admin-chart-box" style={{ background: 'var(--panel-strong)', border: '1px solid var(--line)', borderRadius: '24px', padding: '24px' }}>
                <h4 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 900, color: 'var(--text)' }}>Preferred Interface Languages</h4>
                {(() => {
                  const langData = Object.entries(stats.langCount).filter(([_, count]) => count > 0);
                  const totalUsers = langData.reduce((acc, curr) => acc + curr[1], 0) || 0;
                  
                  if (totalUsers === 0) {
                    return (
                      <div style={{ height: '240px', display: 'grid', placeItems: 'center', color: 'var(--muted)', fontStyle: 'italic' }}>
                        No language metrics configuration available.
                      </div>
                    );
                  }

                  const colors = ["#3b82f6", "#f59e0b", "#10b981", "#8b5cf6", "#ef4444", "#14b8a6"];
                  
                  // Helper function to convert percentage coordinates
                  const getCoords = (percent) => {
                    const angle = (percent * 2 * Math.PI) - (Math.PI / 2);
                    const x = Math.cos(angle);
                    const y = Math.sin(angle);
                    return [x, y];
                  };

                  let accumulatedPercent = 0;

                  return (
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center', justifyContent: 'space-around', flexWrap: 'wrap' }}>
                      <svg width="180" height="180" viewBox="-100 -100 200 200" style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}>
                        {langData.map(([lang, count], idx) => {
                          const pct = count / totalUsers;
                          const startPercent = accumulatedPercent;
                          accumulatedPercent += pct;
                          
                          const [startX, startY] = getCoords(startPercent);
                          const [endX, endY] = getCoords(accumulatedPercent);
                          
                          const largeArc = pct > 0.5 ? 1 : 0;
                          
                          // outer radius 80, inner radius 50
                          const pathData = [
                            `M ${startX * 82} ${startY * 82}`,
                            `A 82 82 0 ${largeArc} 1 ${endX * 82} ${endY * 82}`,
                            `L ${endX * 52} ${endY * 52}`,
                            `A 52 52 0 ${largeArc} 0 ${startX * 52} ${startY * 52}`,
                            'Z'
                          ].join(' ');

                          return (
                            <path
                              key={lang}
                              d={pathData}
                              fill={colors[idx % colors.length]}
                              stroke="var(--panel-strong)"
                              strokeWidth="1.5"
                              style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
                              onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                            >
                              <title>{`${lang}: ${count} users (${(pct * 100).toFixed(0)}%)`}</title>
                            </path>
                          );
                        })}
                        {/* Center Hole Details */}
                        <circle r="46" fill="var(--panel-strong)" />
                        <text x="0" y="-4" fill="var(--text)" fontSize="14" fontWeight="950" textAnchor="middle" style={{ transform: 'rotate(90deg)', transformOrigin: '0 0' }}>
                          {totalUsers}
                        </text>
                        <text x="0" y="14" fill="var(--muted)" fontSize="8.5" fontWeight="800" textAnchor="middle" style={{ transform: 'rotate(90deg)', transformOrigin: '0 0' }}>
                          USERS
                        </text>
                      </svg>

                      {/* Legend */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem' }}>
                        {langData.map(([lang, count], idx) => {
                          const pct = (count / totalUsers) * 100;
                          return (
                            <div key={lang} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ width: '12px', height: '12px', borderRadius: '4px', background: colors[idx % colors.length] }} />
                              <span style={{ fontWeight: 800 }}>{lang}</span>
                              <span style={{ color: 'var(--muted)', fontWeight: 600 }}>({pct.toFixed(0)}%)</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Top performing students list */}
            <div style={{ marginTop: '24px', background: 'var(--panel-strong)', border: '1px solid var(--line)', borderRadius: '24px', padding: '24px' }}>
              <h4 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text)' }}>
                <Award size={18} color="var(--accent)" /> Top Performing Students Leaderboard
              </h4>
              <div className="admin-table-wrapper" style={{ boxShadow: 'none', border: 'none', background: 'transparent', padding: 0 }}>
                <table className="admin-table" style={{ border: 'none' }}>
                  <thead>
                    <tr>
                      <th style={{ background: 'transparent', paddingLeft: '8px' }}>Rank / Learner Name</th>
                      <th style={{ background: 'transparent' }}>XP Score</th>
                      <th style={{ background: 'transparent' }}>Day Streak</th>
                      <th style={{ background: 'transparent', paddingRight: '8px' }}>Placement Rank</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.slice(0, 5).map((u, idx) => (
                      <tr key={u.id}>
                        <td style={{ paddingLeft: '8px' }}>
                          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <span style={{ fontWeight: 950, color: 'var(--accent)', fontSize: '1rem', width: '24px' }}>#{idx+1}</span>
                            <span style={{ fontWeight: 800 }}>{u.full_name || "Anonymous Learner"}</span>
                          </div>
                        </td>
                        <td>⭐ {u.xp ? u.xp.toLocaleString() : 0} XP</td>
                        <td>🔥 {u.streak || 0} days</td>
                        <td style={{ paddingRight: '8px' }}>
                          <span className={`level-badge level-${u.literacy_level || 'none'}`} style={{ display: 'inline-block' }}>
                            {u.literacy_level ? `Level ${u.literacy_level}` : 'Not Diagnosed'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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

            <div className="table-filters-sorting" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '24px', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--muted)', letterSpacing: '0.03em' }}>FILTER:</span>
                <div className="filter-pills" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {[
                    { key: "all", label: "All Students" },
                    { key: "completed", label: "Assessment Done" },
                    { key: "pending", label: "Assessment Pending" },
                    { key: "not_diagnosed", label: "No Diagnosis" }
                  ].map(pill => (
                    <button
                      key={pill.key}
                      type="button"
                      onClick={() => setUserFilter(pill.key)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '12px',
                        border: userFilter === pill.key ? '2px solid var(--accent)' : '2px solid var(--line)',
                        background: userFilter === pill.key ? 'var(--accent-soft)' : 'var(--panel-strong)',
                        color: userFilter === pill.key ? 'var(--accent-dark)' : 'var(--text)',
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {pill.label}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--muted)', letterSpacing: '0.03em' }}>SORT:</span>
                <select
                  value={userSort}
                  onChange={e => setUserSort(e.target.value)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '12px',
                    border: '2px solid var(--line)',
                    background: 'var(--panel-strong)',
                    color: 'var(--text)',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    outline: 'none'
                  }}
                >
                  <option value="xp">Total XP (Highest)</option>
                  <option value="streak">Streak (Highest)</option>
                  <option value="level">Literacy Level (Highest)</option>
                  <option value="name">Alphabetical (Name)</option>
                </select>
              </div>
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
                      <tr 
                        key={user.id} 
                        onClick={() => setViewingUserDetail(user)}
                        style={{ cursor: 'pointer', transition: 'background-color 0.15s ease' }}
                        className="admin-table-row-clickable"
                      >
                        <td>
                          <div className="user-td-cell">
                            <span className="user-td-name">{user.full_name || "Anonymous Learner"}</span>
                            <span className="user-td-id">{user.id}</span>
                          </div>
                        </td>
                        <td>{user.age || "N/A"}</td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                              <span className="lang-chip ui-lang" style={{ background: 'var(--panel-strong)', padding: '2px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 800, border: '1px solid var(--line)' }}>UI</span>
                              <span style={{ fontWeight: 800, fontSize: '0.82rem' }}>{user.preferred_language || "English"}</span>
                            </div>
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                              <span className="lang-chip learn-lang" style={{ background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 800 }}>Learn</span>
                              <span style={{ fontWeight: 800, fontSize: '0.82rem' }}>{user.learning_language || "English"}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.95rem' }}>⭐</span>
                              <span style={{ fontWeight: 850, color: '#d97706', fontSize: '0.85rem' }}>{user.xp || 0}</span>
                              <span style={{ fontSize: '0.72rem', color: 'var(--muted)', fontWeight: 800 }}>XP</span>
                            </div>
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.95rem' }}>🔥</span>
                              <span style={{ fontWeight: 850, color: '#ea580c', fontSize: '0.85rem' }}>{user.streak || 0}</span>
                              <span style={{ fontSize: '0.72rem', color: 'var(--muted)', fontWeight: 800 }}>Streak</span>
                            </div>
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
                              className="admin-action-btn view"
                              onClick={(e) => { e.stopPropagation(); setViewingUserDetail(user); }}
                              style={{ 
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                background: 'rgba(59, 130, 246, 0.08)', 
                                color: '#3b82f6', 
                                border: '1px solid rgba(59, 130, 246, 0.15)',
                                borderRadius: '10px',
                                padding: '6px 12px',
                                fontSize: '0.78rem',
                                fontWeight: 800,
                                cursor: 'pointer',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              <Eye size={12} /> View
                            </button>
                            <button 
                              type="button" 
                              className="admin-action-btn edit"
                              onClick={(e) => { e.stopPropagation(); setEditingUser(user); }}
                            >
                              ✏️ Edit
                            </button>
                            <button 
                              type="button" 
                              className="admin-action-btn delete"
                              onClick={(e) => { e.stopPropagation(); setDeletingUser(user); }}
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

        {/* CURRICULUM & ASSESSMENT INSIGHTS SUB-TAB */}
        {activeSubTab === "curriculum" && (
          <div className="admin-section animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: 'var(--text)' }}>📚 Course Curriculum Builder</h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--muted)' }}>
                  Manage course sections, diagnostic target skills, unit blocks, and adaptive lessons.
                </p>
              </div>
              <button 
                type="button" 
                onClick={handleSaveCurriculum}
                style={{
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '16px',
                  fontWeight: 900,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
                  fontFamily: 'var(--font-family)',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
              >
                💾 Save Changes to Database
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', alignItems: 'start' }}>
              {/* Left Column: Sections List */}
              <div className="curriculum-left" style={{ background: 'var(--panel-strong)', border: '1px solid var(--line)', borderRadius: '24px', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Layers size={18} color="var(--accent)" /> Course Sections
                  </h4>
                  <button 
                    type="button" 
                    onClick={handleAddSection}
                    style={{ background: 'var(--accent-soft)', color: 'var(--accent-dark)', border: 'none', borderRadius: '10px', padding: '4px 10px', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}
                  >
                    ➕ Add
                  </button>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {localCurriculum.map((sec, idx) => {
                    const isSelected = activeCurriculumSection === sec.id || (!activeCurriculumSection && idx === 0);
                    if (idx === 0 && !activeCurriculumSection) {
                      setTimeout(() => setActiveCurriculumSection(sec.id), 0);
                    }
                    return (
                      <div 
                        key={sec.id} 
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '6px',
                          border: isSelected ? '2px solid var(--accent)' : '1px solid var(--line)',
                          borderRadius: '16px',
                          background: isSelected ? 'var(--accent-soft)' : 'transparent',
                          padding: '4px 8px 4px 12px',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => setActiveCurriculumSection(sec.id)}
                          style={{
                            flex: 1,
                            textAlign: 'left',
                            background: 'none',
                            border: 'none',
                            padding: '8px 0',
                            color: isSelected ? 'var(--accent-dark)' : 'var(--text)',
                            fontWeight: 800,
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            outline: 'none'
                          }}
                        >
                          {sec.title}
                          <div style={{ fontSize: '0.7rem', color: 'var(--muted)', marginTop: '2px', fontWeight: 500 }}>
                            Target Skill: {SKILL_CATEGORIES[sec.skillTarget]?.label || sec.skillTarget}
                          </div>
                        </button>
                        <button 
                          type="button" 
                          onClick={() => handleDeleteSection(sec.id)}
                          style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.9rem', cursor: 'pointer', padding: '6px' }}
                          title="Delete Section"
                        >
                          🗑️
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Details & Operations Pane */}
              <div className="curriculum-right" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {activeCurriculumSection && (() => {
                  const section = localCurriculum.find(s => s.id === activeCurriculumSection);
                  if (!section) return null;
                  return (
                    <div style={{ background: 'var(--panel-strong)', border: '1px solid var(--line)', borderRadius: '24px', padding: '24px' }}>
                      {/* Section Editor details */}
                      <h4 style={{ margin: '0 0 16px 0', fontSize: '1.05rem', fontWeight: 900, borderBottom: '1px solid var(--line)', paddingBottom: '12px' }}>
                        ⚙️ Section Configuration: {section.title}
                      </h4>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                        <div>
                          <label style={{ fontWeight: 800, fontSize: '0.78rem', color: 'var(--muted)', display: 'block', marginBottom: '6px' }}>SECTION TITLE</label>
                          <input
                            type="text"
                            value={section.title}
                            onChange={e => handleUpdateSectionField(section.id, "title", e.target.value)}
                            style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '2px solid var(--line)', background: 'var(--bg)', color: 'var(--text)', fontWeight: 800, outline: 'none' }}
                          />
                        </div>
                        <div>
                          <label style={{ fontWeight: 800, fontSize: '0.78rem', color: 'var(--muted)', display: 'block', marginBottom: '6px' }}>TARGET SKILL</label>
                          <select
                            value={section.skillTarget}
                            onChange={e => handleUpdateSectionField(section.id, "skillTarget", e.target.value)}
                            style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '2px solid var(--line)', background: 'var(--bg)', color: 'var(--text)', fontWeight: 800, cursor: 'pointer', outline: 'none' }}
                          >
                            {Object.entries(SKILL_CATEGORIES).map(([key, config]) => (
                              <option key={key} value={key}>{config.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div style={{ marginBottom: '24px' }}>
                        <label style={{ fontWeight: 800, fontSize: '0.78rem', color: 'var(--muted)', display: 'block', marginBottom: '6px' }}>DESCRIPTION</label>
                        <textarea
                          value={section.desc || ""}
                          onChange={e => handleUpdateSectionField(section.id, "desc", e.target.value)}
                          style={{ width: '100%', height: '56px', padding: '10px 14px', borderRadius: '12px', border: '2px solid var(--line)', background: 'var(--bg)', color: 'var(--text)', fontWeight: 600, resize: 'none', outline: 'none', fontFamily: 'var(--font-family)', fontSize: '0.85rem' }}
                        />
                      </div>

                      {/* Units list */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 900 }}>📦 Units in Section ({section.units.length})</h4>
                        <button 
                          type="button" 
                          className="admin-add-btn" 
                          onClick={() => handleAddUnit(section.id)}
                          style={{ padding: '6px 12px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 800 }}
                        >
                          ➕ Add Unit
                        </button>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {section.units.map((unit, uIdx) => (
                          <div key={unit.id} style={{ background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: '20px', padding: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', gap: '10px' }}>
                              <span style={{ fontWeight: 900, color: 'var(--accent)', fontSize: '0.82rem' }}>UNIT {uIdx + 1}</span>
                              <button 
                                type="button" 
                                onClick={() => handleDeleteUnit(section.id, unit.id)}
                                style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.85rem', cursor: 'pointer', padding: '4px' }}
                              >
                                Delete Unit 🗑️
                              </button>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                              <div>
                                <label style={{ fontWeight: 800, fontSize: '0.7rem', color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>UNIT TITLE</label>
                                <input
                                  type="text"
                                  value={unit.title}
                                  onChange={e => handleUpdateUnitField(section.id, unit.id, "title", e.target.value)}
                                  style={{ width: '100%', padding: '8px 12px', borderRadius: '10px', border: '1.5px solid var(--line)', background: 'var(--panel)', color: 'var(--text)', fontWeight: 800, fontSize: '0.8rem', outline: 'none' }}
                                />
                              </div>
                              <div>
                                <label style={{ fontWeight: 800, fontSize: '0.7rem', color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>UNIT SKILL TARGET</label>
                                <select
                                  value={unit.skill}
                                  onChange={e => handleUpdateUnitField(section.id, unit.id, "skill", e.target.value)}
                                  style={{ width: '100%', padding: '8px 12px', borderRadius: '10px', border: '1.5px solid var(--line)', background: 'var(--panel)', color: 'var(--text)', fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer', outline: 'none' }}
                                >
                                  {Object.entries(SKILL_CATEGORIES).map(([key, config]) => (
                                    <option key={key} value={key}>{config.label}</option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            {/* Lessons List inside Unit */}
                            <div style={{ borderTop: '1px dashed var(--line)', paddingTop: '10px', marginTop: '10px' }}>
                              <label style={{ fontWeight: 900, fontSize: '0.75rem', color: 'var(--text)', display: 'block', marginBottom: '8px' }}>📖 Lessons List ({unit.lessons.length})</label>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '10px' }}>
                                {unit.lessons.map((les, lIdx) => (
                                  <div key={les.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--panel-strong)', padding: '6px 12px', borderRadius: '10px', border: '1px solid var(--line)' }}>
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flex: 1 }}>
                                      <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--muted)' }}>{lIdx + 1}.</span>
                                      <input
                                        type="text"
                                        value={les.title}
                                        onChange={e => handleUpdateLessonTitle(section.id, unit.id, les.id, e.target.value)}
                                        style={{
                                          background: 'transparent',
                                          border: 'none',
                                          borderBottom: '1.5px dashed var(--line)',
                                          color: 'var(--text)',
                                          fontWeight: 800,
                                          fontSize: '0.8rem',
                                          padding: '2px 4px',
                                          flex: 1,
                                          outline: 'none'
                                        }}
                                        title="Rename Lesson"
                                      />
                                    </div>
                                    <button 
                                      type="button" 
                                      onClick={() => handleDeleteLesson(section.id, unit.id, les.id)}
                                      style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.8rem', cursor: 'pointer', padding: '2px' }}
                                    >
                                      ✕
                                    </button>
                                  </div>
                                ))}
                                {unit.lessons.length === 0 && (
                                  <div style={{ color: 'var(--muted)', fontStyle: 'italic', fontSize: '0.75rem', padding: '6px' }}>No lessons configured in this unit.</div>
                                )}
                              </div>

                              {/* Add lesson input */}
                              <form 
                                onSubmit={e => {
                                  e.preventDefault();
                                  const formData = new FormData(e.target);
                                  const title = formData.get("lessonTitle");
                                  if (title) {
                                    handleAddLesson(section.id, unit.id, title);
                                    e.target.reset();
                                  }
                                }}
                                style={{ display: 'flex', gap: '8px' }}
                              >
                                <input
                                  type="text"
                                  name="lessonTitle"
                                  placeholder="Enter new lesson title..."
                                  required
                                  style={{ flex: 1, padding: '6px 10px', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--panel)', color: 'var(--text)', fontSize: '0.75rem', outline: 'none' }}
                                />
                                <button type="submit" style={{ background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '8px', padding: '6px 12px', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}>
                                  ➕ Add Lesson
                                </button>
                              </form>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        {/* XP SHOP CATALOG MANAGEMENT SUB-TAB */}
        {activeSubTab === "xpshop" && localShopCatalog && (
          <div className="admin-section animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: 'var(--text)' }}>🛍️ XP Shop Catalog Manager</h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--muted)' }}>
                  Add, edit, or delete items across all categories in the XP Shop catalog.
                </p>
              </div>
              <button 
                type="button" 
                className="admin-add-btn" 
                onClick={handleAddShopItemClick}
                style={{ padding: '8px 16px', borderRadius: '12px', fontSize: '0.8rem' }}
              >
                ➕ Add New Item
              </button>
            </div>

            {/* Category Select Buttons */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid var(--line)', paddingBottom: '10px', overflowX: 'auto' }}>
              {["themes", "fonts", "banners", "avatars", "badges"].map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveShopCategory(cat)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '10px',
                    border: 'none',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    background: activeShopCategory === cat ? 'var(--accent)' : 'var(--line)',
                    color: activeShopCategory === cat ? '#fff' : 'var(--text)',
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Table of Items */}
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Icon/Preview</th>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Cost (XP)</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(localShopCatalog[activeShopCategory] || []).map((item) => (
                    <tr key={item.id}>
                      <td style={{ fontSize: '1.5rem', width: '60px' }}>
                        {activeShopCategory === "themes" ? (
                          <div style={{ display: 'flex', gap: '3px', background: item.preview?.bg || '#fff', padding: '6px', borderRadius: '8px', border: '1px solid var(--line)' }}>
                            <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: item.preview?.accent }} />
                            <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: item.preview?.accentDark }} />
                            <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: item.preview?.accentSoft }} />
                          </div>
                        ) : activeShopCategory === "banners" ? (
                          <img src={item.image} alt={item.name} style={{ width: '50px', height: '24px', borderRadius: '4px', objectFit: 'cover' }} />
                        ) : activeShopCategory === "avatars" ? (
                          item.emoji
                        ) : activeShopCategory === "badges" ? (
                          item.icon
                        ) : (
                          item.icon || "🎁"
                        )}
                      </td>
                      <td style={{ fontWeight: 800, fontSize: '0.8rem', color: 'var(--muted)' }}>
                        <code>{item.id}</code>
                      </td>
                      <td style={{ fontWeight: 850 }}>{item.name}</td>
                      <td style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>{item.desc}</td>
                      <td style={{ fontWeight: 900, color: 'var(--accent)' }}>⭐ {item.cost}</td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                          <button
                            type="button"
                            className="action-btn edit-btn"
                            title="Edit Item"
                            onClick={() => handleEditShopItem(item)}
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            type="button"
                            className="action-btn delete-btn"
                            title="Delete Item"
                            onClick={() => handleDeleteShopItem(item.id)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {(!localShopCatalog[activeShopCategory] || localShopCatalog[activeShopCategory].length === 0) && (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>
                        No items configured in this category. Click "Add New Item" to get started!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ADD/EDIT XP SHOP ITEM MODAL */}
      {editingShopItem && (
        <div className="admin-modal-overlay">
          <div className="admin-modal" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3>{isAddingShopItem ? "➕ Add XP Shop Item" : "📝 Edit XP Shop Item"}</h3>
              <button type="button" className="close-modal-btn" onClick={() => setEditingShopItem(null)}>✕</button>
            </div>
            <form onSubmit={handleSaveShopItemSubmit}>
              <div className="form-grid" style={{ gridTemplateColumns: '1fr' }}>
                <div className="form-group">
                  <label>ITEM UNIQUE ID (e.g. theme_neon, badge_pro)</label>
                  <input 
                    type="text" 
                    required 
                    disabled={!isAddingShopItem}
                    value={editingShopItem.id} 
                    onChange={e => setEditingShopItem({ ...editingShopItem, id: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>ITEM NAME</label>
                  <input 
                    type="text" 
                    required 
                    value={editingShopItem.name} 
                    onChange={e => setEditingShopItem({ ...editingShopItem, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>DESCRIPTION</label>
                  <input 
                    type="text" 
                    required 
                    value={editingShopItem.desc} 
                    onChange={e => setEditingShopItem({ ...editingShopItem, desc: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>COST (XP STARS)</label>
                  <input 
                    type="number" 
                    min="0"
                    required 
                    value={editingShopItem.cost} 
                    onChange={e => setEditingShopItem({ ...editingShopItem, cost: parseInt(e.target.value, 10) || 0 })}
                  />
                </div>

                {activeShopCategory === "themes" && (
                  <>
                    <div className="form-group">
                      <label>ACCENT COLOR (HEX)</label>
                      <input 
                        type="text" 
                        required 
                        value={editingShopItem.preview?.accent || ""} 
                        onChange={e => setEditingShopItem({
                          ...editingShopItem,
                          preview: { ...(editingShopItem.preview || {}), accent: e.target.value }
                        })}
                      />
                    </div>
                    <div className="form-group">
                      <label>ACCENT DARK COLOR (HEX)</label>
                      <input 
                        type="text" 
                        required 
                        value={editingShopItem.preview?.accentDark || ""} 
                        onChange={e => setEditingShopItem({
                          ...editingShopItem,
                          preview: { ...(editingShopItem.preview || {}), accentDark: e.target.value }
                        })}
                      />
                    </div>
                    <div className="form-group">
                      <label>ACCENT SOFT COLOR (HEX)</label>
                      <input 
                        type="text" 
                        required 
                        value={editingShopItem.preview?.accentSoft || ""} 
                        onChange={e => setEditingShopItem({
                          ...editingShopItem,
                          preview: { ...(editingShopItem.preview || {}), accentSoft: e.target.value }
                        })}
                      />
                    </div>
                    <div className="form-group">
                      <label>BACKGROUND COLOR (HEX)</label>
                      <input 
                        type="text" 
                        required 
                        value={editingShopItem.preview?.bg || ""} 
                        onChange={e => setEditingShopItem({
                          ...editingShopItem,
                          preview: { ...(editingShopItem.preview || {}), bg: e.target.value }
                        })}
                      />
                    </div>
                  </>
                )}

                {activeShopCategory === "fonts" && (
                  <div className="form-group">
                    <label>FONT FAMILY NAME (e.g. 'Nunito', sans-serif)</label>
                    <input 
                      type="text" 
                      required 
                      value={editingShopItem.family || ""} 
                      onChange={e => setEditingShopItem({ ...editingShopItem, family: e.target.value })}
                    />
                  </div>
                )}

                {activeShopCategory === "banners" && (
                  <div className="form-group">
                    <label>BANNER IMAGE URL</label>
                    <input 
                      type="text" 
                      required 
                      value={editingShopItem.image || ""} 
                      onChange={e => setEditingShopItem({ ...editingShopItem, image: e.target.value })}
                    />
                  </div>
                )}

                {activeShopCategory === "avatars" && (
                  <div className="form-group">
                    <label>AVATAR EMOJI</label>
                    <input 
                      type="text" 
                      required 
                      value={editingShopItem.emoji || ""} 
                      onChange={e => setEditingShopItem({ ...editingShopItem, emoji: e.target.value })}
                    />
                  </div>
                )}

                {activeShopCategory === "badges" && (
                  <div className="form-group">
                    <label>RARITY (common, rare, legendary)</label>
                    <select
                      value={editingShopItem.rarity || "common"}
                      onChange={e => setEditingShopItem({ ...editingShopItem, rarity: e.target.value })}
                      style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '2px solid var(--line)', background: 'var(--panel)', color: 'var(--text)' }}
                    >
                      <option value="common">Common</option>
                      <option value="rare">Rare</option>
                      <option value="legendary">Legendary</option>
                    </select>
                  </div>
                )}

                {activeShopCategory !== "themes" && activeShopCategory !== "banners" && (
                  <div className="form-group">
                    <label>ITEM DISPLAY ICON/EMOJI</label>
                    <input 
                      type="text" 
                      required 
                      value={editingShopItem.icon || ""} 
                      onChange={e => setEditingShopItem({ ...editingShopItem, icon: e.target.value })}
                    />
                  </div>
                )}
              </div>

              <div className="modal-footer" style={{ marginTop: '20px' }}>
                <button type="button" className="secondary-btn" onClick={() => setEditingShopItem(null)}>Cancel</button>
                <button type="submit" className="primary-btn" disabled={shopSaving}>
                  {shopSaving ? "Saving Catalog..." : "Save Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

      {/* VIEW LEARNER PROGRESS MODAL */}
      {viewingUserDetail && (
        <div className="admin-modal-overlay">
          <div className="admin-modal" style={{ maxWidth: '700px' }}>
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <Eye size={20} color="var(--accent)" /> Student Progress Inspector
              </h3>
              <button type="button" className="close-modal-btn" onClick={() => setViewingUserDetail(null)}>✕</button>
            </div>
            
            <div className="modal-body" style={{ maxHeight: '550px', overflowY: 'auto', paddingRight: '8px', paddingBottom: '12px' }}>
              {/* Profile Card Summary */}
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center', padding: '20px', background: 'var(--bg)', borderRadius: '20px', marginBottom: '24px' }}>
                <div style={{ fontSize: '3rem', width: '72px', height: '72px', borderRadius: '50%', background: 'var(--panel-strong)', display: 'grid', placeItems: 'center', border: '2px solid var(--line)' }}>
                  👤
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900 }}>{viewingUserDetail.full_name || "Anonymous Student"}</h4>
                  <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: '4px' }}>
                    User ID: {viewingUserDetail.id}
                  </div>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '6px', fontSize: '0.8rem' }}>
                    <span>Age: <b>{viewingUserDetail.age || 'N/A'}</b></span>
                    <span>•</span>
                    <span>UI: <b>{viewingUserDetail.preferred_language || 'English'}</b></span>
                    <span>•</span>
                    <span>Learn: <b>{viewingUserDetail.learning_language || 'English'}</b></span>
                  </div>
                </div>
              </div>

              {/* Stats highlights */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
                <div style={{ background: 'var(--panel-strong)', border: '1px solid var(--line)', borderRadius: '16px', padding: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 950, color: 'var(--accent)' }}>⭐ {viewingUserDetail.xp || 0}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--muted)', fontWeight: 800 }}>XP Earned</div>
                </div>
                <div style={{ background: 'var(--panel-strong)', border: '1px solid var(--line)', borderRadius: '16px', padding: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 950, color: '#ef4444' }}>🔥 {viewingUserDetail.streak || 0}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--muted)', fontWeight: 800 }}>Day Streak</div>
                </div>
                <div style={{ background: 'var(--panel-strong)', border: '1px solid var(--line)', borderRadius: '16px', padding: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 950, color: '#10b981' }}>
                    Level {viewingUserDetail.literacy_level || 'N/A'}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--muted)', fontWeight: 800 }}>Literacy Rank</div>
                </div>
              </div>

              {/* Skill Breakdowns */}
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '0.95rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Award size={16} color="var(--accent)" /> Detailed Skill Diagnostic Scores
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {Object.keys(SKILL_CATEGORIES).map(skillKey => {
                    const score = viewingUserDetail.skill_scores ? Math.round(Number(viewingUserDetail.skill_scores[skillKey]) || 0) : 0;
                    const skillConfig = SKILL_CATEGORIES[skillKey];
                    return (
                      <div key={skillKey} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 800 }}>
                          <span>{skillConfig?.icon} {skillConfig?.label || skillKey}</span>
                          <span>{score}%</span>
                        </div>
                        <div style={{ height: '8px', background: 'var(--bg)', borderRadius: '999px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${score}%`, background: skillConfig?.color || '#3b82f6', borderRadius: '999px' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Completed Lessons Roster */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', borderTop: '1px solid var(--line)', paddingTop: '20px', marginTop: '10px' }}>
                <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.15)', borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ fontSize: '3rem', fontWeight: 900, color: '#10b981', lineHeight: 1 }}>
                    {Array.isArray(viewingUserDetail.completed_lessons) ? viewingUserDetail.completed_lessons.length : 0}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--muted)', fontWeight: 800, marginTop: '8px', textAlign: 'center' }}>Completed Lessons</div>
                </div>
                <div>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '0.85rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <BookOpen size={16} color="#10b981" /> Recent Completed Lessons
                  </h4>
                  {Array.isArray(viewingUserDetail.completed_lessons) && viewingUserDetail.completed_lessons.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {viewingUserDetail.completed_lessons.slice(-4).reverse().map((lesId, idx) => (
                        <div key={`${lesId}-${idx}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--panel-strong)', padding: '8px 12px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 700, border: '1px solid var(--line)' }}>
                          <span style={{ color: '#10b981' }}>✓</span>
                          <span>{getLessonNameById(lesId)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--muted)', fontStyle: 'italic' }}>
                      No lessons completed yet.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{ marginTop: '20px' }}>
              <button type="button" className="secondary-btn" onClick={() => setViewingUserDetail(null)}>Close Inspector</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
