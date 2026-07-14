import React, { useState, useEffect, useRef } from "react";
import { supabase } from "./supabaseClient";
import {
  getRandomAssessment, computeSkillScores, generateLearningPath, getOrderedSections,
  classifyProficiency, getProficiencyName, getWeakSkills, getStrongSkills, getStrongSkillKeys, getWeakSkillKeys, SKILL_TRANSLATION_KEYS,
  SKILL_CATEGORIES, CURRICULUM_SECTIONS, PROFICIENCY_LEVELS, lessonsData
} from "./curriculumData";
import { generateLessonContent, fetchWordOfDay, generatePracticeContent, translateTextContent, translateMCQContent } from "./geminiClient";
import enJson from "./locales/en.json";
import hiJson from "./locales/hi.json";
import knJson from "./locales/kn.json";
import teJson from "./locales/te.json";
import taJson from "./locales/ta.json";

const languages = ["English", "Hindi", "Kannada", "Telugu", "Tamil"];
const educationLevels = ["No formal education", "Primary", "Secondary", "Higher secondary", "Graduate"];

// Draws a faint guide letter/word on the tracing canvas
const drawTracingGuide = (canvas, item) => {
  if (!canvas || !item) return;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const text = (item.letter || item.word || "A").toString();
  ctx.save();
  ctx.globalAlpha = 0.18;
  ctx.fillStyle = "#0284c7";
  ctx.font = `bold ${Math.floor(canvas.width * 0.5)}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);
  ctx.restore();
  ctx.strokeStyle = "rgba(2,132,199,0.25)";
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);
};

const DashboardIcon = ({ className, style }) => (
  <svg className={className} style={{ marginRight: "10px", verticalAlign: "middle", ...style }} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="9" rx="1" />
    <rect x="14" y="3" width="7" height="5" rx="1" />
    <rect x="14" y="12" width="7" height="9" rx="1" />
    <rect x="3" y="16" width="7" height="5" rx="1" />
  </svg>
);

const LearnIcon = ({ className, style }) => (
  <svg className={className} style={{ marginRight: "10px", verticalAlign: "middle", ...style }} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const PracticeIcon = ({ className, style }) => (
  <svg className={className} style={{ marginRight: "10px", verticalAlign: "middle", ...style }} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
    <rect x="2" y="8" width="16" height="8" rx="2" />
    <line x1="6" y1="12" x2="14" y2="12" />
  </svg>
);

const ProfileIcon = ({ className, style }) => (
  <svg className={className} style={{ marginRight: "10px", verticalAlign: "middle", ...style }} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const LogoutIcon = ({ className, style }) => (
  <svg className={className} style={{ marginRight: "10px", verticalAlign: "middle", ...style }} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const FlameIcon = ({ className, style }) => (
  <svg className={className} style={{ marginRight: "4px", verticalAlign: "middle", ...style }} width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
  </svg>
);

const StarIcon = ({ className, style }) => (
  <svg className={className} style={{ marginRight: "4px", verticalAlign: "middle", ...style }} width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const BookIcon = ({ className, style }) => (
  <svg className={className} style={{ verticalAlign: "middle", ...style }} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);

const TrophyIcon = ({ className, style }) => (
  <svg className={className} style={{ verticalAlign: "middle", ...style }} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34" />
    <path d="M12 2a6 6 0 0 1 6 6v5a6 6 0 0 1-6 6 6 6 0 0 1-6-6V8a6 6 0 0 1 6-6Z" />
  </svg>
);

const LightbulbIcon = ({ className, style }) => (
  <svg className={className} style={{ verticalAlign: "middle", ...style }} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A5 5 0 0 0 8 8c0 1 .5 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
    <path d="M9 18h6" />
    <path d="M10 22h4" />
  </svg>
);

const AlertTriangleIcon = ({ className, style }) => (
  <svg className={className} style={{ verticalAlign: "middle", ...style }} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const ClockIcon = ({ className, style }) => (
  <svg className={className} style={{ verticalAlign: "middle", ...style }} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const selectQuestsForToday = (userId, todayStr) => {
  const seedStr = `${userId}_${todayStr}`;
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = seedStr.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const pool = [
    { id: 'earn_20_xp', type: 'xp', title: 'Earn 20 XP today', target: 20, unit: 'XP' },
    { id: 'practice_5_min', type: 'time', title: 'Practice for 5 mins', target: 300, unit: 'min' },
    { id: 'complete_1_lesson', type: 'lessons', title: 'Complete 1 Lesson', target: 1, unit: 'lesson' },
    { id: 'practice_10_min', type: 'time', title: 'Practice for 10 mins', target: 600, unit: 'min' },
    { id: 'earn_30_xp', type: 'xp', title: 'Earn 30 XP today', target: 30, unit: 'XP' },
    { id: 'complete_2_lessons', type: 'lessons', title: 'Complete 2 Lessons', target: 2, unit: 'lessons' }
  ];
  
  const nextRandom = (seed) => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };
  
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const r = Math.floor(nextRandom(hash + i) * (i + 1));
    const temp = shuffled[i];
    shuffled[i] = shuffled[r];
    shuffled[r] = temp;
  }
  
  const selected = [];
  selected.push(shuffled[0]);
  
  // Find a second quest with a different type
  for (let i = 1; i < shuffled.length; i++) {
    if (shuffled[i].type !== selected[0].type) {
      selected.push(shuffled[i]);
      break;
    }
  }
  
  // Fallback
  if (selected.length < 2) {
    selected.push(shuffled[1]);
  }
  
  return selected;
};

// Translation dictionary for regional languages
const translations = {
  English: enJson,
  Hindi: hiJson,
  Kannada: knJson,
  Telugu: teJson,
  Tamil: taJson
};

const getLiteracyLevel = (userProfile) => {
  if (userProfile?.literacy_level) return Number(userProfile.literacy_level);
  const ed = userProfile?.education_level;
  if (ed) {
    if (ed.includes("Level 1") || ed.includes("स्तर 1") || ed.includes("ಹಂತ 1") || ed.includes("స్థాయి 1") || ed.includes("நிலை 1")) return 1;
    if (ed.includes("Level 2") || ed.includes("स्तर 2") || ed.includes("ಹಂತ 2") || ed.includes("స్థాయి 2") || ed.includes("நிலை 2")) return 2;
    if (ed.includes("Level 3") || ed.includes("स्तर 3") || ed.includes("ಹಂತ 3") || ed.includes("స్థాయి 3") || ed.includes("நிலை 3")) return 3;
    if (ed.includes("Level 4") || ed.includes("स्तर 4") || ed.includes("ಹಂತ 4") || ed.includes("స్థాయి 4") || ed.includes("நிலை 4")) return 4;
    if (ed.includes("Level 5") || ed.includes("स्तर 5") || ed.includes("ಹಂತ 5") || ed.includes("స్థాయి 5") || ed.includes("நிலை 5")) return 5;
  }
  return null;
};

const calculateProgressiveLevel = (userProfile, completedLessonsList) => {
  const baseLevel = getLiteracyLevel(userProfile) || 1;
  const completedCount = completedLessonsList?.filter(id => typeof id === 'string' && !id.startsWith("ach_")).length || 0;
  // Every 2 completed lessons increases the level by 1, up to level 12!
  const levelBonus = Math.floor(completedCount / 2);
  return Math.min(12, baseLevel + levelBonus);
};

const hasCompletedAssessment = (userProfile) => {
  return userProfile?.assessment_completed === true || getLiteracyLevel(userProfile) !== null;
};

const getAssessmentStorageKey = (userId) => `lisa_assessment_state_${userId || "anonymous"}`;

const getStoredAssessmentState = (userId) => {
  try {
    return JSON.parse(localStorage.getItem(getAssessmentStorageKey(userId))) || null;
  } catch {
    return null;
  }
};

const setStoredAssessmentState = (userId, state) => {
  localStorage.setItem(getAssessmentStorageKey(userId), JSON.stringify(state));
};

const clearStoredAssessmentState = (userId) => {
  localStorage.removeItem(getAssessmentStorageKey(userId));
};

const getLocalizedLevelName = (level, lang) => {
  const currentLang = lang || "English";
  const defs = PROFICIENCY_LEVELS[currentLang] || PROFICIENCY_LEVELS["English"];
  const found = defs.find(d => d.level === level);
  return found ? found.name : `Level ${level}`;
};

const getLevelCategoryAndDescription = (level, lang) => {
  const currentLang = lang || "English";
  const defs = PROFICIENCY_LEVELS[currentLang] || PROFICIENCY_LEVELS["English"];
  const found = defs.find(d => d.level === level);
  return {
    category: found ? found.name : `Level ${level}`,
    description: found ? found.desc : ""
  };
};

const darkenHex = (hex, factor = 0.85) => {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, Math.round(((num >> 16) & 0xff) * factor));
  const g = Math.max(0, Math.round(((num >> 8) & 0xff) * factor));
  const b = Math.max(0, Math.round((num & 0xff) * factor));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
};

const levelBadgeColor = (level) => {
  const colors = {
    1: "#10b981",
    2: "#3b82f6",
    3: "#f59e0b",
    4: "#a855f7",
    5: "#ef4444",
    6: "#0ea5e9",
    7: "#ec4899",
    8: "#f43f5e",
    9: "#06b6d4",
    10: "#8b5cf6",
    11: "#6366f1",
    12: "#e11d48"
  };
  return colors[level] || "#6b7280";
};

const levelBadgeIcon = (level) => {
  const icons = {
    1: "🌱",
    2: "📖",
    3: "✍️",
    4: "🧠",
    5: "👑",
    6: "🌟",
    7: "🎓",
    8: "🏆",
    9: "🚀",
    10: "🔥",
    11: "🌌",
    12: "🎖️"
  };
  return icons[level] || "📚";
};

const getStreakMessage = (streak) => {
  if (streak === 0) return "Start learning today to build your streak!";
  if (streak === 1) return "Great start! Come back tomorrow to keep it going.";
  if (streak >= 2 && streak <= 4) return `${streak} days in a row! You're building a great habit.`;
  if (streak >= 5 && streak <= 9) return `Amazing! A ${streak} day streak. You are unstoppable!`;
  if (streak >= 10 && streak <= 20) return `Incredible! A ${streak} day streak of continuous learning. Keep it up!`;
  return `You're on fire! An epic ${streak} day streak. Keep the momentum going!`;
};

function App() {
  const [selectedLanguage, setSelectedLanguage] = useState(
    localStorage.getItem("lisa_lang") || null
  );
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef(null);

  const [streakPopupOpen, setStreakPopupOpen] = useState(false);
  const streakPopupRef = useRef(null);

  const [activeLessonPopup, setActiveLessonPopup] = useState(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileDropdownOpen && profileDropdownRef.current && !profileDropdownRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
      if (streakPopupOpen && streakPopupRef.current && !streakPopupRef.current.contains(e.target)) {
        setStreakPopupOpen(false);
      }
      if (activeLessonPopup && !e.target.closest('.duo-node-container')) {
        setActiveLessonPopup(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profileDropdownOpen, streakPopupOpen, activeLessonPopup]);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [profileBg, setProfileBg] = useState("#e86b6b");
  const [profileAvatar, setProfileAvatar] = useState("/as1.png");
  const [isEditingCover, setIsEditingCover] = useState(false);
  const [activeTab, setActiveTab] = useState("login"); // "login", "register", "forgot"
  const [dashboardTab, setDashboardTab] = useState("dashboard"); // "dashboard", "learn", "practice", "profile"
  const [activeSection, setActiveSection] = useState(0); // paginated section in learn tab
  const learnJourneyRef = useRef(null);
  const activeNodeRef = useRef(null);

  const [userXp, setUserXp] = useState(0);
  const [showAllAchievementsModal, setShowAllAchievementsModal] = useState(false);

  const getLevelEncouragementMessage = (level) => {
    const messages = {
      1: "You're taking your first steps! Proud of you.",
      2: "Great start! You're recognizing words and building skills.",
      3: "Amazing! You are reading simple sentences smoothly.",
      4: "Keep it up! Your reading fluency is expanding.",
      5: "Fantastic progress! You are understanding more complex texts.",
      6: "Sensational! You are capturing key insights from paragraphs.",
      7: "Superb! Your communications are getting highly refined.",
      8: "Excellent! You are mastering functional daily literacy.",
      9: "Brilliant! Spelling and grammar are becoming second nature.",
      10: "Outstanding! You communicate with absolute confidence.",
      11: "Spectacular! You read and write at a professional level.",
      12: "Literacy Champion! You have achieved complete mastery."
    };
    return messages[level] || "Keep it up! Good Work";
  };
  const [completedLessons, setCompletedLessons] = useState([]);
  const [lessonSession, setLessonSession] = useState(null);
  const [streakCount, setStreakCount] = useState(0);
  const [wordOfDay, setWordOfDay] = useState({ word: "Diligent", meaning: "Hardworking and showing care", example: "A diligent student practices reading a little every day." });

  const [dailyXp, setDailyXp] = useState(0);
  const [dailyTimeSpent, setDailyTimeSpent] = useState(0); // in seconds
  const [dailyLessons, setDailyLessons] = useState(0);
  const [activeQuests, setActiveQuests] = useState([]);
  const [timeLeftStr, setTimeLeftStr] = useState("24h 00m 00s");
  const [questBonusClaimed, setQuestBonusClaimed] = useState(false);

  const getQuestProgress = (quest) => {
    if (quest.type === 'xp') {
      return {
        current: dailyXp,
        target: quest.target,
        completed: dailyXp >= quest.target,
        percent: Math.min((dailyXp / quest.target) * 100, 100),
        displayProgress: `${dailyXp}/${quest.target} XP`
      };
    } else if (quest.type === 'time') {
      const minsCurrent = Math.floor(dailyTimeSpent / 60);
      const minsTarget = quest.target / 60;
      return {
        current: minsCurrent,
        target: minsTarget,
        completed: dailyTimeSpent >= quest.target,
        percent: Math.min((dailyTimeSpent / quest.target) * 100, 100),
        displayProgress: `${Math.min(minsCurrent, minsTarget)}/${minsTarget} min`
      };
    } else if (quest.type === 'lessons') {
      return {
        current: dailyLessons,
        target: quest.target,
        completed: dailyLessons >= quest.target,
        percent: Math.min((dailyLessons / quest.target) * 100, 100),
        displayProgress: `${Math.min(dailyLessons, quest.target)}/${quest.target} ${quest.target === 1 ? 'lesson' : 'lessons'}`
      };
    }
    return { current: 0, target: 1, completed: false, percent: 0, displayProgress: '0/1' };
  };

  useEffect(() => {
    if (!session?.user?.id) return;
    const userId = session.user.id;
    const today = new Date().toLocaleDateString("en-CA");

    const storedDailyXp = localStorage.getItem(`lisa_daily_xp_${userId}_${today}`);
    const storedDailyTime = localStorage.getItem(`lisa_daily_time_${userId}_${today}`);
    const storedDailyLessons = localStorage.getItem(`lisa_daily_lessons_${userId}_${today}`);

    const initDaily = async () => {
      let dbDailyXp = 0, dbDailyTime = 0, dbDailyLessons = 0;
      try {
        const { data } = await supabase.from("profiles").select("daily_xp,daily_time_spent,daily_lessons,daily_quest_date").eq("id", userId).single();
        if (data) {
          const storedDate = data.daily_quest_date;
          if (storedDate === today) {
            dbDailyXp = data.daily_xp || 0;
            dbDailyTime = data.daily_time_spent || 0;
            dbDailyLessons = data.daily_lessons || 0;
          }
        }
      } catch {}

      const finalXp = storedDailyXp !== null ? parseInt(storedDailyXp, 10) : dbDailyXp;
      const finalTime = storedDailyTime !== null ? parseInt(storedDailyTime, 10) : dbDailyTime;
      const finalLessons = storedDailyLessons !== null ? parseInt(storedDailyLessons, 10) : dbDailyLessons;

      setDailyXp(finalXp);
      setDailyTimeSpent(finalTime);
      setDailyLessons(finalLessons);

      localStorage.setItem(`lisa_daily_xp_${userId}_${today}`, finalXp);
      localStorage.setItem(`lisa_daily_time_${userId}_${today}`, finalTime);
      localStorage.setItem(`lisa_daily_lessons_${userId}_${today}`, finalLessons);
    };

    initDaily();

    const questsKey = `lisa_daily_quests_${userId}_${today}`;
    const storedQuests = localStorage.getItem(questsKey);
    if (storedQuests) {
      try {
        setActiveQuests(JSON.parse(storedQuests));
      } catch {
        const selected = selectQuestsForToday(userId, today);
        setActiveQuests(selected);
        localStorage.setItem(questsKey, JSON.stringify(selected));
      }
    } else {
      const selected = selectQuestsForToday(userId, today);
      setActiveQuests(selected);
      localStorage.setItem(questsKey, JSON.stringify(selected));
    }

    const questBonusKey = `lisa_quest_bonus_${userId}_${today}`;
    setQuestBonusClaimed(!!localStorage.getItem(questBonusKey));
  }, [session?.user?.id]);

  useEffect(() => {
    if (!session?.user?.id || questBonusClaimed) return;
    const userId = session.user.id;
    const today = new Date().toLocaleDateString("en-CA");

    if (activeQuests.length > 0 && activeQuests.every(q => getQuestProgress(q).completed)) {
      setQuestBonusClaimed(true);
      const bonusXp = 20;
      setUserXp(prev => {
        const next = prev + bonusXp;
        localStorage.setItem(`lisa_user_xp_${userId}`, next);
        return next;
      });
      localStorage.setItem(`lisa_quest_bonus_${userId}_${today}`, "1");
    }
  }, [activeQuests, dailyXp, dailyTimeSpent, dailyLessons, questBonusClaimed, session?.user?.id]);

  useEffect(() => {
    if (!session?.user?.id) return;
    const userId = session.user.id;
    
    const timer = setInterval(() => {
      const today = new Date().toLocaleDateString("en-CA");
      setDailyTimeSpent(prev => {
        const next = prev + 1;
        localStorage.setItem(`lisa_daily_time_${userId}_${today}`, next);
        return next;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [session?.user?.id]);

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0); // Next midnight
      const diffMs = midnight - now;
      
      const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const diffSecs = Math.floor((diffMs % (1000 * 60)) / 1000);
      
      setTimeLeftStr(`${diffHrs}h ${diffMins}m ${diffSecs}s`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll to the current active (resumed) lesson node
  useEffect(() => {
    if (dashboardTab === "learn") {
      const scrollActiveNode = () => {
        if (activeNodeRef.current) {
          activeNodeRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      };

      // Staggered scrolls to guarantee accuracy as images load and DOM finishes laying out
      const t1 = setTimeout(scrollActiveNode, 100);
      const t2 = setTimeout(scrollActiveNode, 400);
      const t3 = setTimeout(scrollActiveNode, 800);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
  }, [dashboardTab, completedLessons]);

  useEffect(() => {
    let active = true;
    const loadWordOfDay = async () => {
      const levelCtx = calculateProgressiveLevel(profile, completedLessons);
      const res = await fetchWordOfDay(selectedLanguage || "English", {
        level: levelCtx,
        age: profile?.age ?? null,
        education: profile?.education_level ?? null
      });
      if (active && res) {
        setWordOfDay(res);
      }
    };
    loadWordOfDay();
    return () => { active = false; };
  }, [selectedLanguage, profile, completedLessons]);

  useEffect(() => {
    if (profile?.avatar_url) {
      setProfileAvatar(profile.avatar_url);
    }
  }, [profile?.avatar_url]);

  const updateStreak = async (userId, currentProfile) => {
    try {
      const today = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD local format
      const yesterdayDate = new Date();
      yesterdayDate.setDate(yesterdayDate.getDate() - 1);
      const yesterday = yesterdayDate.toLocaleDateString("en-CA");

      let currentStreak = currentProfile?.streak ?? 0;
      let lastActive = currentProfile?.last_active_date;

      const localStreak = localStorage.getItem(`lisa_streak_${userId}`);
      const localLastActive = localStorage.getItem(`lisa_last_active_date_${userId}`);

      if (localStreak && !currentProfile?.streak) {
        currentStreak = parseInt(localStreak, 10);
      }
      if (localLastActive && !lastActive) {
        lastActive = localLastActive;
      }

      let newStreak = currentStreak;

      if (!lastActive) {
        newStreak = 1;
      } else if (lastActive === today) {
        newStreak = currentStreak || 1;
      } else if (lastActive === yesterday) {
        newStreak = currentStreak + 1;
      } else {
        newStreak = 1;
      }

      localStorage.setItem(`lisa_streak_${userId}`, newStreak);
      localStorage.setItem(`lisa_last_active_date_${userId}`, today);
      
      let activeDates = [];
      try {
        const stored = localStorage.getItem(`lisa_active_dates_${userId}`);
        activeDates = stored ? JSON.parse(stored) : [];
      } catch {}
      if (!activeDates.includes(today)) {
        activeDates.push(today);
        localStorage.setItem(`lisa_active_dates_${userId}`, JSON.stringify(activeDates));
      }

      // Merge with any dates already stored in Supabase (cross-device)
      const dbDates = Array.isArray(currentProfile?.streak_dates) ? currentProfile.streak_dates : [];
      const mergedDates = Array.from(new Set([...dbDates, ...activeDates]));

      setStreakCount(newStreak);

      await supabase
        .from("profiles")
        .update({
          streak: newStreak,
          last_active_date: today,
          streak_dates: mergedDates
        })
        .eq("id", userId);

      setProfile(prev => prev ? { ...prev, streak: newStreak, last_active_date: today, streak_dates: mergedDates } : null);
    } catch (err) {
      console.warn("Could not sync streak with DB, utilizing local storage:", err);
    }
  };
  const getPastSevenDaysStatus = () => {
    if (!session?.user?.id) return [];
    const userId = session.user.id;
    
    let activeDates = [];
    try {
      const stored = localStorage.getItem(`lisa_active_dates_${userId}`);
      activeDates = stored ? JSON.parse(stored) : [];
    } catch {
      activeDates = [];
    }

    // Include dates persisted in Supabase so the streak calendar is cross-device
    const dbDates = Array.isArray(profile?.streak_dates) ? profile.streak_dates : [];
    activeDates = Array.from(new Set([...dbDates, ...activeDates]));

    const todayStr = new Date().toLocaleDateString("en-CA");
    const lastActiveLocal = localStorage.getItem(`lisa_last_active_date_${userId}`);
    if (lastActiveLocal === todayStr && !activeDates.includes(todayStr)) {
      activeDates.push(todayStr);
      try {
        localStorage.setItem(`lisa_active_dates_${userId}`, JSON.stringify(activeDates));
      } catch {}
    }

    // Derive completed days from the actual streak count so the calendar always
    // reflects the streak (e.g. a 2-day streak lights up today + yesterday)
    const completedSet = new Set(activeDates);
    const anchorStr = profile?.last_active_date || lastActiveLocal || todayStr;
    const anchor = new Date(`${anchorStr}T00:00:00`);
    if (!isNaN(anchor.getTime())) {
      for (let j = 0; j < streakCount; j++) {
        const d = new Date(anchor);
        d.setDate(d.getDate() - j);
        completedSet.add(d.toLocaleDateString("en-CA"));
      }
    }

    const days = [];
    const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString("en-CA");
      const dayLabel = weekdayLabels[d.getDay()];
      days.push({
        label: dayLabel,
        date: dateStr,
        isCompleted: completedSet.has(dateStr),
        isToday: i === 0
      });
    }
    return days;
  };

  useEffect(() => {
    if (session?.user?.id) {
      const userId = session.user.id;
      const storedXp = localStorage.getItem(`lisa_user_xp_${userId}`);
      setUserXp(storedXp ? parseInt(storedXp, 10) : 0);

      const storedLessons = localStorage.getItem(`lisa_completed_lessons_${userId}`);
      setCompletedLessons(storedLessons ? JSON.parse(storedLessons) : []);

      const localStreak = localStorage.getItem(`lisa_streak_${userId}`);
      setStreakCount(localStreak ? parseInt(localStreak, 10) : 0);

      const bg = localStorage.getItem(`lisa_profile_bg_${userId}`) || "#e86b6b";
      const av = localStorage.getItem(`lisa_profile_avatar_${userId}`) || "/as1.png";
      setProfileBg(bg);
      setProfileAvatar(av);
    } else {
      setUserXp(0);
      setCompletedLessons([]);
      setStreakCount(0);
      setProfileBg("#e86b6b");
      setProfileAvatar("/as1.png");
    }
  }, [session]);

  const [lessonLoading, setLessonLoading] = useState(false);
  const [lessonStep, setLessonStep] = useState(0); // 0=explanation, 1=MCQs, 2=fillBlanks, 3=reading, 4=writing, 5=pronunciation
  const [lessonMcqAnswers, setLessonMcqAnswers] = useState({});
  const [lessonFillAnswers, setLessonFillAnswers] = useState({});
  const [lessonWritingText, setLessonWritingText] = useState("");
  const [lessonAiContent, setLessonAiContent] = useState(null);

  // Single-question-at-a-time state variables
  const [lessonMcqIndex, setLessonMcqIndex] = useState(0);
  const [lessonMcqFeedback, setLessonMcqFeedback] = useState(null);
  const [lessonFillIndex, setLessonFillIndex] = useState(0);
  const [lessonFillFeedback, setLessonFillFeedback] = useState(null);
  const [lessonReadingStep, setLessonReadingStep] = useState(1); // 1 = Task 1 (passage+question), 2 = Task 2 (writing)
  const [lessonReadingFeedback, setLessonReadingFeedback] = useState(null);
  const [lessonReadingAnswer, setLessonReadingAnswer] = useState("");
  const [lessonMeaningFeedback, setLessonMeaningFeedback] = useState(null);
  const [lessonMeaningAnswer, setLessonMeaningAnswer] = useState(null);
  const [lessonTranslationFeedback, setLessonTranslationFeedback] = useState(null);
  const [lessonTranslationSelected, setLessonTranslationSelected] = useState([]);
  const [lessonListeningFeedback, setLessonListeningFeedback] = useState(null);
  const [lessonListeningSelected, setLessonListeningSelected] = useState([]);
  const [lessonMatchFeedback, setLessonMatchFeedback] = useState(null);
  const [lessonMatchCompleted, setLessonMatchCompleted] = useState([]);
  const [lessonMatchSelectedLeft, setLessonMatchSelectedLeft] = useState(null);
  const [lessonMatchSelectedRight, setLessonMatchSelectedRight] = useState(null);
  const [lessonSpeakFeedback, setLessonSpeakFeedback] = useState(null);
  const [lessonSpeakError, setLessonSpeakError] = useState("");
  const [lessonSpeakIsListening, setLessonSpeakIsListening] = useState(false);
  const [lessonSpeakTranscript, setLessonSpeakTranscript] = useState("");

  // New lesson activities: Unscramble, Image choice, Tracing
  const [lessonUnscrambleIndex, setLessonUnscrambleIndex] = useState(0);
  const [lessonUnscrambleSelected, setLessonUnscrambleSelected] = useState([]);
  const [lessonUnscrambleFeedback, setLessonUnscrambleFeedback] = useState(null);
  const [lessonImageChoiceIndex, setLessonImageChoiceIndex] = useState(0);
  const [lessonImageChoiceSel, setLessonImageChoiceSel] = useState(null);
  const [lessonImageChoiceFeedback, setLessonImageChoiceFeedback] = useState(null);
  const [lessonTracingIndex, setLessonTracingIndex] = useState(0);
  const [lessonTracingDone, setLessonTracingDone] = useState(false);
  const tracingCanvasRef = useRef(null);

  // Redraw the tracing guide whenever the tracing step or item changes
  useEffect(() => {
    if (lessonStep === 12 && tracingCanvasRef.current && lessonAiContent?.tracing?.length) {
      const item = lessonAiContent.tracing[lessonTracingIndex] || lessonAiContent.tracing[0];
      drawTracingGuide(tracingCanvasRef.current, item);
      setLessonTracingDone(false);
    }
  }, [lessonStep, lessonTracingIndex, lessonAiContent]);

  const renderPracticeSession = (ai) => {
    const currentQuestion = ai.questions?.[lessonStep] || {};
    const practiceType = lessonSession.practiceType;
    const isChecked = 
      practiceType.includes("Speak") || practiceType.includes("Pronunciation") 
        ? lessonSpeakFeedback !== null 
        : practiceType.includes("Listen") 
        ? lessonListeningFeedback !== null 
        : currentQuestion.type === "mcq" || currentQuestion.type === "meaning"
        ? lessonMeaningFeedback !== null || lessonMcqFeedback !== null
        : lessonFillFeedback !== null;

    const handleNext = () => {
      // Clear current step state
      setLessonSpeakFeedback(null);
      setLessonSpeakError("");
      setLessonListeningFeedback(null);
      setLessonListeningSelected([]);
      setLessonMeaningFeedback(null);
      setLessonMeaningAnswer(null);
      setLessonMcqFeedback(null);
      setLessonFillFeedback(null);
      setLessonFillAnswers({});
      advanceLessonStep();
    };

    return (
      <div className="ai-lesson-content">
        <div className="ai-lesson-step" style={{ paddingBottom: '140px' }}>
          <div className="ai-lesson-step-header" style={{ marginBottom: '20px' }}>
            <span className="ai-step-badge">
              ⚡ Practice Mode: {practiceType} (Step {lessonStep + 1} of 10)
            </span>
          </div>

          {/* Stories Practice: Story section */}
          {practiceType === "Stories Practice" && ai.story && (
            <div style={{
              background: 'rgba(2, 132, 199, 0.05)',
              border: '2px solid rgba(2, 132, 199, 0.2)',
              borderRadius: '20px',
              padding: '20px',
              marginBottom: '24px',
              maxHeight: '200px',
              overflowY: 'auto'
            }}>
              <h4 style={{ margin: '0 0 8px', color: '#0284c7', fontWeight: 800 }}>📖 Reread Story:</h4>
              <p style={{ margin: 0, fontSize: '1.15rem', lineHeight: '1.6', fontWeight: '500' }}>{ai.story}</p>
            </div>
          )}

          {/* Render content based on Practice Type */}
          {(() => {
            // 1. Speak/Pronunciation Practice
            if (practiceType.includes("Speak") || practiceType.includes("Pronunciation")) {
              const sentence = currentQuestion.sentence || "";
              const startSpeaking = () => {
                const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                if (!SpeechRecognition) {
                  setLessonSpeakError("Speech recognition is not supported in this browser. Please use Chrome/Edge.");
                  return;
                }
                try {
                  const rec = new SpeechRecognition();
                  rec.continuous = false;
                  rec.interimResults = false;
                  rec.lang = selectedLanguage === "Kannada" ? "kn-IN" :
                             selectedLanguage === "Hindi" ? "hi-IN" :
                             selectedLanguage === "Telugu" ? "te-IN" :
                             selectedLanguage === "Tamil" ? "ta-IN" : "en-US";
                  rec.onstart = () => {
                    setLessonSpeakIsListening(true);
                    setLessonSpeakTranscript("");
                    setLessonSpeakError("");
                  };
                  rec.onerror = (e) => {
                    setLessonSpeakError("Mic error, please check connection.");
                    setLessonSpeakIsListening(false);
                  };
                  rec.onend = () => { setLessonSpeakIsListening(false); };
                  rec.onresult = (event) => {
                    const transcript = event.results[0][0].transcript;
                    setLessonSpeakTranscript(transcript);
                    const clean = (w) => w.replace(/[.,\/#!$%\^&\*;:{}=\-_\u0060()?]/g, "").toLowerCase().trim();
                    const targetWords = sentence.split(/\s+/).filter(Boolean).map(clean);
                    const spokenWords = transcript.split(/\s+/).filter(Boolean).map(clean);
                    let matched = 0;
                    targetWords.forEach(w => { if (spokenWords.includes(w)) matched++; });
                    const percent = targetWords.length > 0 ? (matched / targetWords.length) * 100 : 100;
                    const isCorrect = percent >= 50;
                    if (!isCorrect) {
                      recordUserMistake({
                        type: "speak",
                        sentence: sentence,
                        englishTranslation: currentQuestion.englishTranslation || "Pronunciation practice"
                      });
                    }
                    setLessonSpeakFeedback({
                      isCorrect,
                      matchedCount: matched,
                      totalWords: targetWords.length,
                      percent: Math.round(percent)
                    });
                  };
                  rec.start();
                } catch (err) {
                  setLessonSpeakError("Could not start speech recognition.");
                  setLessonSpeakIsListening(false);
                }
              };

              return (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                  <div style={{
                    background: 'var(--panel)',
                    border: '2px solid var(--line)',
                    borderRadius: '24px',
                    padding: '30px',
                    width: '100%',
                    textAlign: 'center',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.02)'
                  }}>
                    <p style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--text)', margin: '0 0 10px' }}>{sentence}</p>
                    <p style={{ fontSize: '1.1rem', color: 'var(--muted)', margin: 0 }}>{currentQuestion.englishTranslation}</p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', marginTop: '20px' }}>
                    <button
                      type="button"
                      onClick={startSpeaking}
                      disabled={lessonSpeakIsListening || isChecked}
                      style={{
                        width: '90px',
                        height: '90px',
                        borderRadius: '50%',
                        background: lessonSpeakIsListening ? '#ef4444' : 'var(--accent)',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 8px 20px rgba(2, 132, 199, 0.3)',
                        transition: 'all 0.2s ease',
                        animation: lessonSpeakIsListening ? 'pulse 1.5s infinite' : 'none'
                      }}
                    >
                      <span style={{ fontSize: '2.5rem' }}>{lessonSpeakIsListening ? "🎙️" : "🎤"}</span>
                    </button>
                    <span style={{ fontWeight: 800, color: lessonSpeakIsListening ? '#ef4444' : 'var(--muted)', fontSize: '0.95rem' }}>
                      {lessonSpeakIsListening ? "🛑 RECORDING... SPEAK NOW" : "CLICK TO RECORD"}
                    </span>
                    {lessonSpeakTranscript && (
                      <p style={{ fontSize: '1.1rem', marginTop: '10px' }}>
                        <strong>You said:</strong> <span style={{ color: 'var(--accent)' }}>"{lessonSpeakTranscript}"</span>
                      </p>
                    )}
                    {lessonSpeakError && <p style={{ color: '#ef4444', fontWeight: '700' }}>{lessonSpeakError}</p>}
                  </div>

                  {lessonSpeakFeedback && (
                    <div style={{
                      position: 'absolute',
                      bottom: 0, left: 0, right: 0,
                      background: lessonSpeakFeedback.isCorrect ? '#d1fae5' : '#fee2e2',
                      borderTop: `2px solid ${lessonSpeakFeedback.isCorrect ? '#10b981' : '#ef4444'}`,
                      padding: '20px 40px',
                      zIndex: 100,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <h4 style={{ margin: 0, color: lessonSpeakFeedback.isCorrect ? '#065f46' : '#991b1b', fontWeight: '800', fontSize: '1.2rem' }}>
                          {lessonSpeakFeedback.isCorrect ? "Awesome Pronunciation!" : "Need Practice!"}
                        </h4>
                        <p style={{ margin: '4px 0 0', color: lessonSpeakFeedback.isCorrect ? '#047857' : '#b91c1c', fontSize: '0.95rem' }}>
                          Accuracy: {lessonSpeakFeedback.percent}% ({lessonSpeakFeedback.matchedCount} of {lessonSpeakFeedback.totalWords} words matched)
                        </p>
                      </div>
                      <button type="button" className="primary-btn" onClick={handleNext}>
                        Continue
                      </button>
                    </div>
                  )}
                </div>
              );
            }

            // 2. Listen Practice
            if (practiceType.includes("Listen")) {
              const audioText = currentQuestion.audioText || "";
              const tiles = currentQuestion.tiles || [];
              const isChecked = lessonListeningFeedback !== null;

              return (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                  <h3 style={{ margin: '0 0 10px', textAlign: 'center' }}>Listen to the sentence and reconstruct it:</h3>
                  
                  <div style={{ display: 'flex', gap: '16px', margin: '10px 0 20px' }}>
                    <button
                      type="button"
                      onClick={() => speakText(audioText, 1.0)}
                      style={{
                        width: '70px',
                        height: '70px',
                        borderRadius: '20px',
                        background: 'var(--accent)',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                      }}
                    >
                      <span style={{ fontSize: '2.5rem' }}>🔊</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => speakText(audioText, 0.5)}
                      style={{
                        width: '70px',
                        height: '70px',
                        borderRadius: '20px',
                        background: '#0284c7',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                      }}
                      title="Listen slowly"
                    >
                      <span style={{ fontSize: '1.8rem' }}>🐢</span>
                    </button>
                  </div>

                  {/* Selected Words Area */}
                  <div style={{
                    width: '100%',
                    borderBottom: '2px solid var(--line)',
                    minHeight: '80px',
                    margin: '20px 0',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '10px',
                    padding: '10px 0',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}>
                    {lessonListeningSelected.map((word, wIdx) => (
                      <button
                        key={wIdx}
                        type="button"
                        style={{
                          background: 'var(--accent)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '10px',
                          padding: '10px 16px',
                          fontSize: '1.1rem',
                          fontWeight: '700',
                          cursor: 'pointer',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}
                        onClick={() => {
                          if (!isChecked) {
                            setLessonListeningSelected(prev => prev.filter((_, idx) => idx !== wIdx));
                          }
                        }}
                        disabled={isChecked}
                      >
                        {word}
                      </button>
                    ))}
                  </div>

                  {/* Available Tiles */}
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '10px',
                    justifyContent: 'center',
                    margin: '20px 0 30px'
                  }}>
                    {tiles.map((word, wIdx) => {
                      const isUsed = lessonListeningSelected.includes(word);
                      return (
                        <button
                          key={wIdx}
                          type="button"
                          style={{
                            background: isUsed ? 'var(--line)' : 'var(--panel)',
                            color: isUsed ? 'transparent' : 'var(--text)',
                            border: '2px solid var(--line)',
                            borderRadius: '10px',
                            padding: '10px 16px',
                            fontSize: '1.1rem',
                            fontWeight: '700',
                            cursor: isUsed ? 'default' : 'pointer',
                            boxShadow: isUsed ? 'none' : '0 2px 4px rgba(0,0,0,0.05)',
                            opacity: isUsed ? 0.3 : 1
                          }}
                          onClick={() => {
                            if (!isChecked && !isUsed) {
                              setLessonListeningSelected(prev => [...prev, word]);
                            }
                          }}
                          disabled={isChecked || isUsed}
                        >
                          {word}
                        </button>
                      );
                    })}
                  </div>

                  {!isChecked && (
                    <button
                      type="button"
                      className="primary-btn"
                      style={{ padding: '12px 40px', borderRadius: '12px' }}
                      onClick={() => {
                        const userSentence = lessonListeningSelected.join(" ").trim().toLowerCase();
                        const clean = (s) => s.replace(/[.,\/#!$%\^&\*;:{}=\-_\u0060()?]/g, "").toLowerCase().trim();
                        const correct = clean(userSentence) === clean(audioText);
                        if (!correct) {
                          recordUserMistake({
                            type: "listening",
                            audioText: audioText,
                            tiles: tiles
                          });
                        }
                        setLessonListeningFeedback({
                          isCorrect: correct,
                          correctAnswer: audioText
                        });
                      }}
                      disabled={lessonListeningSelected.length === 0}
                    >
                      Check Answer
                    </button>
                  )}

                  {isChecked && (
                    <div style={{
                      position: 'absolute',
                      bottom: 0, left: 0, right: 0,
                      background: lessonListeningFeedback.isCorrect ? '#d1fae5' : '#fee2e2',
                      borderTop: `2px solid ${lessonListeningFeedback.isCorrect ? '#10b981' : '#ef4444'}`,
                      padding: '20px 40px',
                      zIndex: 100,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <h4 style={{ margin: 0, color: lessonListeningFeedback.isCorrect ? '#065f46' : '#991b1b', fontWeight: '800', fontSize: '1.2rem' }}>
                          {lessonListeningFeedback.isCorrect ? "Excellent!" : "Incorrect"}
                        </h4>
                        <p style={{ margin: '4px 0 0', color: lessonListeningFeedback.isCorrect ? '#047857' : '#b91c1c', fontSize: '0.95rem' }}>
                          {lessonListeningFeedback.isCorrect ? "You heard it correctly!" : `Correct Translation: "${lessonListeningFeedback.correctAnswer}"`}
                        </p>
                      </div>
                      <button type="button" className="primary-btn" onClick={handleNext}>
                        Continue
                      </button>
                    </div>
                  )}
                </div>
              );
            }

            // 3. Mistakes, Words & Stories Practice Questions
            if (currentQuestion.type === "mcq" || currentQuestion.type === "meaning" || practiceType === "Stories Practice") {
              const questionText = currentQuestion.question || `Select the correct translation/meaning of "${currentQuestion.phrase}"`;
              const options = currentQuestion.options || [];
              const selectedAnswer = lessonMeaningAnswer;
              const isChecked = lessonMeaningFeedback !== null;

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{
                    background: 'var(--panel)',
                    border: '2px solid var(--line)',
                    borderRadius: '20px',
                    padding: '24px',
                    fontSize: '1.3rem',
                    fontWeight: '800',
                    textAlign: 'center'
                  }}>
                    {questionText}
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '16px',
                    margin: '20px 0'
                  }}>
                    {options.map((opt, oIdx) => {
                      const isSelected = selectedAnswer === oIdx;
                      let btnBg = 'var(--panel)';
                      let btnBorder = '2px solid var(--line)';
                      let btnColor = 'var(--text)';

                      if (isChecked) {
                        if (oIdx === currentQuestion.correctIndex) {
                          btnBg = 'rgba(16, 185, 129, 0.1)';
                          btnBorder = '2px solid #10b981';
                          btnColor = '#065f46';
                        } else if (isSelected) {
                          btnBg = 'rgba(239, 68, 68, 0.1)';
                          btnBorder = '2px solid #ef4444';
                          btnColor = '#991b1b';
                        }
                      } else if (isSelected) {
                        btnBorder = '2px solid var(--accent)';
                        btnColor = 'var(--accent-dark)';
                      }

                      return (
                        <button
                          key={oIdx}
                          type="button"
                          onClick={() => { if (!isChecked) setLessonMeaningAnswer(oIdx); }}
                          style={{
                            background: btnBg,
                            border: btnBorder,
                            color: btnColor,
                            borderRadius: '16px',
                            padding: '20px',
                            fontSize: '1.1rem',
                            fontWeight: '600',
                            cursor: isChecked ? 'default' : 'pointer',
                            textAlign: 'center',
                            transition: 'all 0.2s ease'
                          }}
                          disabled={isChecked}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  {!isChecked && (
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <button
                        type="button"
                        className="primary-btn"
                        style={{ padding: '12px 40px', borderRadius: '12px' }}
                        disabled={selectedAnswer === null}
                        onClick={() => {
                          const correct = selectedAnswer === currentQuestion.correctIndex;
                          if (!correct) {
                            recordUserMistake({
                              type: currentQuestion.type || "mcq",
                              question: questionText,
                              options: options,
                              correctIndex: currentQuestion.correctIndex,
                              explanation: currentQuestion.explanation || ""
                            });
                          }
                          setLessonMeaningFeedback({
                            isCorrect: correct,
                            correctAnswer: options[currentQuestion.correctIndex]
                          });
                        }}
                      >
                        Check Answer
                      </button>
                    </div>
                  )}

                  {isChecked && (
                    <div style={{
                      position: 'absolute',
                      bottom: 0, left: 0, right: 0,
                      background: lessonMeaningFeedback.isCorrect ? '#d1fae5' : '#fee2e2',
                      borderTop: `2px solid ${lessonMeaningFeedback.isCorrect ? '#10b981' : '#ef4444'}`,
                      padding: '20px 40px',
                      zIndex: 100,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <h4 style={{ margin: 0, color: lessonMeaningFeedback.isCorrect ? '#065f46' : '#991b1b', fontWeight: '800', fontSize: '1.2rem' }}>
                          {lessonMeaningFeedback.isCorrect ? "Excellent!" : "Incorrect"}
                        </h4>
                        <p style={{ margin: '4px 0 0', color: lessonMeaningFeedback.isCorrect ? '#047857' : '#b91c1c', fontSize: '0.95rem' }}>
                          {lessonMeaningFeedback.isCorrect ? "You got it right!" : `Correct Answer: "${lessonMeaningFeedback.correctAnswer}"`}
                        </p>
                      </div>
                      <button type="button" className="primary-btn" onClick={handleNext}>
                        Continue
                      </button>
                    </div>
                  )}
                </div>
              );
            }

            // Fill Blank or Spelling Practice
            if (currentQuestion.type === "fillBlank" || currentQuestion.type === "spelling") {
              const sentence = currentQuestion.sentence || "";
              const answer = currentQuestion.answer || "";
              const hint = currentQuestion.hint || "";
              const userAnswer = lessonFillAnswers[lessonStep] || "";
              const isChecked = lessonFillFeedback !== null;

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{
                    background: 'var(--panel)',
                    border: '2px solid var(--line)',
                    borderRadius: '24px',
                    padding: '30px',
                    textAlign: 'center'
                  }}>
                    <p style={{ fontSize: '1.5rem', fontWeight: '800', margin: '0 0 10px' }}>{sentence}</p>
                    {hint && <p style={{ fontSize: '1rem', color: '#b45309', margin: 0 }}>💡 Hint: {hint}</p>}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
                    <input
                      type="text"
                      className="ai-fill-input"
                      placeholder="Type your answer here..."
                      style={{
                        maxWidth: '300px',
                        padding: '12px 20px',
                        borderRadius: '12px',
                        border: '2px solid var(--line)',
                        fontSize: '1.1rem',
                        textAlign: 'center',
                        background: 'var(--panel)'
                      }}
                      value={userAnswer}
                      onChange={(e) => setLessonFillAnswers(prev => ({ ...prev, [lessonStep]: e.target.value }))}
                      disabled={isChecked}
                    />
                  </div>

                  {!isChecked && (
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <button
                        type="button"
                        className="primary-btn"
                        style={{ padding: '12px 40px', borderRadius: '12px' }}
                        disabled={!userAnswer.trim()}
                        onClick={() => {
                          const correct = userAnswer.trim().toLowerCase() === answer.toLowerCase();
                          if (!correct) {
                            recordUserMistake({
                              type: currentQuestion.type || "fillBlank",
                              sentence: sentence,
                              answer: answer,
                              hint: hint
                            });
                          }
                          setLessonFillFeedback({
                            isCorrect: correct,
                            correctAnswer: answer
                          });
                        }}
                      >
                        Check Answer
                      </button>
                    </div>
                  )}

                  {isChecked && (
                    <div style={{
                      position: 'absolute',
                      bottom: 0, left: 0, right: 0,
                      background: lessonFillFeedback.isCorrect ? '#d1fae5' : '#fee2e2',
                      borderTop: `2px solid ${lessonFillFeedback.isCorrect ? '#10b981' : '#ef4444'}`,
                      padding: '20px 40px',
                      zIndex: 100,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <h4 style={{ margin: 0, color: lessonFillFeedback.isCorrect ? '#065f46' : '#991b1b', fontWeight: '800', fontSize: '1.2rem' }}>
                          {lessonFillFeedback.isCorrect ? "Excellent!" : "Incorrect"}
                        </h4>
                        <p style={{ margin: '4px 0 0', color: lessonFillFeedback.isCorrect ? '#047857' : '#b91c1c', fontSize: '0.95rem' }}>
                          {lessonFillFeedback.isCorrect ? "You got it right!" : `Correct Answer: "${lessonFillFeedback.correctAnswer}"`}
                        </p>
                      </div>
                      <button type="button" className="primary-btn" onClick={handleNext}>
                        Continue
                      </button>
                    </div>
                  )}
                </div>
              );
            }

            return null;
          })()}
        </div>
      </div>
    );
  };

  const completeLesson = async (lessonId, xpAwarded) => {

    if (!session?.user?.id) return;
    const userId = session.user.id;

    // Update XP
    const newXp = userXp + xpAwarded;
    setUserXp(newXp);
    localStorage.setItem(`lisa_user_xp_${userId}`, newXp);

    // Update daily XP
    const todayStr = new Date().toLocaleDateString("en-CA");
    const storedDailyXp = localStorage.getItem(`lisa_daily_xp_${userId}_${todayStr}`);
    const nextDailyXp = (storedDailyXp ? parseInt(storedDailyXp, 10) : 0) + xpAwarded;
    setDailyXp(nextDailyXp);
    localStorage.setItem(`lisa_daily_xp_${userId}_${todayStr}`, nextDailyXp);

    // Update completed lessons
    let newLessons = completedLessons;
    if (!completedLessons.includes(lessonId)) {
      newLessons = [...completedLessons, lessonId];
      setCompletedLessons(newLessons);
      localStorage.setItem(`lisa_completed_lessons_${userId}`, JSON.stringify(newLessons));
    }

    // Update daily lessons completed
    const storedDailyLessons = localStorage.getItem(`lisa_daily_lessons_${userId}_${todayStr}`);
    const nextDailyLessons = (storedDailyLessons ? parseInt(storedDailyLessons, 10) : 0) + 1;
    setDailyLessons(nextDailyLessons);
    localStorage.setItem(`lisa_daily_lessons_${userId}_${todayStr}`, nextDailyLessons);

    // Save active dates
    const today = new Date().toLocaleDateString("en-CA");
    let activeDates = [];
    try {
      const stored = localStorage.getItem(`lisa_active_dates_${userId}`);
      activeDates = stored ? JSON.parse(stored) : [];
    } catch {}
    if (!activeDates.includes(today)) {
      activeDates.push(today);
      localStorage.setItem(`lisa_active_dates_${userId}`, JSON.stringify(activeDates));
    }

    // Refresh day streak in real-time
    updateStreak(userId, profile);

    // Bonus XP for completing all daily quests
    if (!questBonusClaimed && activeQuests.length > 0 && activeQuests.every(q => getQuestProgress(q).completed)) {
      setQuestBonusClaimed(true);
      const bonusXp = 20;
      const bonusNewXp = newXp + bonusXp;
      setUserXp(bonusNewXp);
      localStorage.setItem(`lisa_user_xp_${userId}`, bonusNewXp);
      localStorage.setItem(`lisa_quest_bonus_${userId}_${todayStr}`, "1");
    }

    // Sync XP, completed lessons, and daily quest progress to the database
    try {
      await supabase
        .from("profiles")
        .update({
          xp: newXp,
          completed_lessons: newLessons,
          daily_xp: nextDailyXp,
          daily_time_spent: dailyTimeSpent,
          daily_lessons: nextDailyLessons,
          daily_quest_date: todayStr
        })
        .eq("id", userId);
    } catch (dbErr) {
      console.warn("Could not sync lesson progress to Supabase:", dbErr);
    }
  };

  // AI-powered lesson session starter
  const startLessonSession = async (lesson, sectionInfo, unitInfo) => {
    setLessonLoading(true);
    setLessonStep(0);
    setLessonMcqAnswers({});
    setLessonFillAnswers({});
    setLessonWritingText("");
    setLessonAiContent(null);
    setLessonMcqIndex(0);
    setLessonMcqFeedback(null);
    setLessonFillIndex(0);
    setLessonFillFeedback(null);
    setLessonReadingStep(1);
    setLessonReadingFeedback(null);
    setLessonReadingAnswer("");
    setLessonSession({
      lessonId: lesson.id,
      title: lesson.title,
      sectionNum: sectionInfo?.num || 1,
      sectionTitle: sectionInfo?.title || "",
      unitNum: unitInfo?.num || 1,
      unitTitle: unitInfo?.title || "",
      lessonNum: lesson.num || 1,
      status: "loading",
      feedback: null
    });

    const storedSkillScores = (() => {
      try {
        const stored = getStoredAssessmentState(session?.user?.id);
        return stored?.skill_scores || profile?.skill_scores || {};
      } catch { return {}; }
    })();
    const weakAreas = getWeakSkills(storedSkillScores);
    const currentLevelNum = calculateProgressiveLevel(profile, completedLessons);
    const profInfo = getProficiencyName(currentLevelNum, "English");

    const aiContent = await generateLessonContent({
      age: profile?.age || 25,
      educationLevel: profile?.education_level || "No formal education",
      language: selectedLanguage || "English",
      literacyLevel: currentLevelNum,
      literacyLevelName: profInfo?.name || "Beginner",
      weakAreas,
      sectionNum: sectionInfo?.num || 1,
      sectionTitle: sectionInfo?.title || "",
      unitNum: unitInfo?.num || 1,
      unitTitle: unitInfo?.title || "",
      lessonNum: lesson.num || 1,
      lessonTitle: lesson.title || "",
      difficulty: currentLevelNum <= 2 ? "beginner" : currentLevelNum <= 4 ? "intermediate" : "advanced"
    });

    setLessonAiContent(aiContent);
    setLessonSession(prev => prev ? ({ ...prev, status: "active" }) : null);
    setLessonLoading(false);
  };


  // AI Lesson step handlers
  const advanceLessonStep = () => {
    const totalSteps = 5; // 0=explanation, 1=MCQs, 2=fillBlanks, 3=reading+writing, 4=complete
    if (lessonStep < totalSteps - 1) {
      setLessonStep(prev => prev + 1);
    } else {
      // Complete the lesson
      const isExam = lessonSession?.lessonId?.endsWith("l5");
      completeLesson(lessonSession?.lessonId, isExam ? 60 : 15);
      setLessonSession(prev => prev ? { ...prev, status: "completed" } : null);
    }
  };

  const checkLessonMcq = (qIdx, selectedIdx) => {
    setLessonMcqAnswers(prev => ({ ...prev, [qIdx]: selectedIdx }));
  };


  const [message, setMessage] = useState("");
  const [initialLoading, setInitialLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Dark mode (Claude-inspired) theme state
  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem("lisa_theme");
    if (stored) return stored === "dark";
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
    localStorage.setItem("lisa_theme", isDark ? "dark" : "light");
  }, [isDark]);

  const toggleTheme = () => setIsDark((prev) => !prev);

  // Initial Assessment states
  const [assessmentState, setAssessmentState] = useState("not_started"); // "not_started" | "answering" | "results"
  const [assessmentQuestionsList, setAssessmentQuestionsList] = useState([]);
  const [currentStep, setCurrentStep] = useState(0); // 0-4
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { index: optionIndex }
  const [writingAnswers, setWritingAnswers] = useState({}); // { index: "user text" }
  const [readingAttempts, setReadingAttempts] = useState({}); // { index: { matchedCount, totalWords, transcript, scores } }
  const [translatingQ, setTranslatingQ] = useState(false);
  const [translatedQ, setTranslatedQ] = useState(null);

  // Voice speech states
  const [isListening, setIsListening] = useState(false);
  const [spokenTranscript, setSpokenTranscript] = useState("");
  const [micError, setMicError] = useState("");
  const [manualTextFallback, setManualTextFallback] = useState("");
  const recognitionRef = useRef(null);

  // Fetch translation dynamically when selected language is not English and the question changes
  useEffect(() => {
    if (assessmentState !== "answering" || !assessmentQuestionsList || assessmentQuestionsList.length === 0) {
      return;
    }
    const q = assessmentQuestionsList[currentStep];
    if (!q) return;

    const lang = selectedLanguage || "English";
    if (lang === "English") {
      setTranslatedQ(q.rawQuestion);
      setTranslatingQ(false);
      return;
    }

    let active = true;
    const fetchTranslation = async () => {
      setTranslatingQ(true);
      try {
        if (q.type === "comprehension") {
          const res = await translateMCQContent(
            q.rawQuestion.question,
            q.rawQuestion.options,
            lang
          );
          if (active) {
            setTranslatedQ({
              ...q.rawQuestion,
              question: res.question,
              options: res.options
            });
          }
        } else if (q.type === "reading") {
          const translatedReading = await translateTextContent(q.rawQuestion.reading, lang);
          const translatedWriting = await translateTextContent(q.rawQuestion.writing, lang);
          if (active) {
            setTranslatedQ({
              ...q.rawQuestion,
              reading: translatedReading,
              writing: translatedWriting
            });
          }
        } else if (q.type === "writing") {
          const translatedWriting = await translateTextContent(q.rawQuestion.writing, lang);
          if (active) {
            setTranslatedQ({
              ...q.rawQuestion,
              writing: translatedWriting
            });
          }
        }
      } catch (err) {
        console.error("Error translating assessment question:", err);
        if (active) {
          setTranslatedQ(q.rawQuestion);
        }
      } finally {
        if (active) {
          setTranslatingQ(false);
        }
      }
    };

    fetchTranslation();
    return () => {
      active = false;
    };
  }, [currentStep, selectedLanguage, assessmentQuestionsList, assessmentState]);

  // History and analytics
  const [historyAttempts, setHistoryAttempts] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("lisa_attempts_history")) || [];
    } catch {
      return [];
    }
  });

  // Edit Profile States
  const [editingProfile, setEditingProfile] = useState(false);
  const [editFullName, setEditFullName] = useState("");
  const [editAge, setEditAge] = useState("");
  const [editPreferredLang, setEditPreferredLang] = useState("");
  const [editEdLevel, setEditEdLevel] = useState("");

  // Reset scroll position on view / tab switch
  useEffect(() => {
    const resetScroll = () => {
      const mainContent = document.querySelector(".dashboard-main-content");
      const mainView = document.querySelector(".dashboard-main-view");
      if (mainContent) mainContent.scrollTop = 0;
      if (mainView) mainView.scrollTop = 0;
      window.scrollTo(0, 0);
    };

    resetScroll();
    const t = setTimeout(resetScroll, 100);
    return () => clearTimeout(t);
  }, [dashboardTab, assessmentState, lessonSession]);

  useEffect(() => {
    if (!profile) return;
    setEditFullName(profile.full_name || "");
    setEditAge(profile.age || "");
    setEditPreferredLang(profile.preferred_language || selectedLanguage || "English");
    setEditEdLevel(profile.education_level || "No formal education");
  }, [profile]);

    const localUiTranslations = {
    English: {
      sidebarDashboard: "Dashboard",
      sidebarLearn: "Learn",
      sidebarPractice: "Practice",
      sidebarProfile: "Profile",
      dashboardHello: "Hello, {name} 👋🏻",
      dashboardWelcomeBack: "Welcome back! Pick up right where you left off.",
      dashboardContinueLearning: "Continue learning",
      dashboardStartLearning: "Start Learning",
      dashboardSection: "Section",
      dashboardUnit: "Unit",
      dashboardResume: "Resume",
      dashboardWordOfDay: "Word of the Day",
      dashboardCurrentLevel: "Current Level",
      dashboardStreakSociety: "Streak Society",
      dashboardDayStreak: "day streak",
      dashboardDailyQuests: "Daily Quests",
      dashboardAchievements: "Achievements",
      dashboardViewAll: "VIEW ALL",
      practiceTodaysReview: "Today's Review",
      practicePerfectPronunciation: "Perfect Pronunciation",
      practicePerfectPronunciationDesc: "Finish this session to build confidence with speaking!",
      practiceStart: "START",
      practiceConversation: "Conversation",
      practiceSpeak: "Speak",
      practiceSpeakDesc: "Improve your speaking skills with these phrases",
      practiceListen: "Listen",
      practiceListenDesc: "Boost your listening skills with an audio-only session",
      practiceYourCollections: "Your collections",
      practiceMistakes: "Mistakes",
      practiceWords: "Words",
      practiceStories: "Stories",
      practiceMistakesDesc: "Start a personalized lesson to practice your mistakes",
      practiceWordsDesc: "Review your vocabulary at any time",
      practiceStoriesDesc: "Reread a story to review words in context",
      profileUpdateSettings: "Update Profile Settings",
      profileEducationStatus: "Current Education Status",
      profileSaveChanges: "Save Changes",
      profileSaving: "Saving...",
      profileResetLessons: "Reset Completed Lessons (Dev)",
      profileAllAchievements: "All Achievements"
    },
    Hindi: {
      sidebarDashboard: "डैशबोर्ड",
      sidebarLearn: "सीखें",
      sidebarPractice: "अभ्यास",
      sidebarProfile: "प्रोफ़ाइल",
      dashboardHello: "नमस्ते, {name} 👋🏻",
      dashboardWelcomeBack: "वापस स्वागत है! वहीं से शुरू करें जहां आपने छोड़ा था।",
      dashboardContinueLearning: "सीखना जारी रखें",
      dashboardStartLearning: "सीखना शुरू करें",
      dashboardSection: "अनुभाग",
      dashboardUnit: "इकाई",
      dashboardResume: "जारी रखें",
      dashboardWordOfDay: "आज का शब्द",
      dashboardCurrentLevel: "वर्तमान स्तर",
      dashboardStreakSociety: "सक्रियता समाज",
      dashboardDayStreak: "दिनों की सक्रियता",
      dashboardDailyQuests: "दैनिक कार्य",
      dashboardAchievements: "उपलब्धियां",
      dashboardViewAll: "सभी देखें",
      practiceTodaysReview: "आज की समीक्षा",
      practicePerfectPronunciation: "उत्कृष्ट उच्चारण",
      practicePerfectPronunciationDesc: "बोलने में आत्मविश्वास बढ़ाने के लिए यह सत्र पूरा करें!",
      practiceStart: "शुरू करें",
      practiceConversation: "बातचीत",
      practiceSpeak: "बोलें",
      practiceSpeakDesc: "इन वाक्यांशों के साथ अपने बोलने के कौशल में सुधार करें",
      practiceListen: "सुनें",
      practiceListenDesc: "केवल सुनने वाले सत्र के साथ अपने सुनने के कौशल को बढ़ाएं",
      practiceYourCollections: "आपके संग्रह",
      practiceMistakes: "गलतियाँ",
      practiceWords: "शब्द",
      practiceStories: "कहानियाँ",
      practiceMistakesDesc: "अपनी गलतियों का अभ्यास करने के लिए एक व्यक्तिगत पाठ शुरू करें",
      practiceWordsDesc: "किसी भी समय अपनी शब्दावली की समीक्षा करें",
      practiceStoriesDesc: "संदर्भ में शब्दों की समीक्षा करने के लिए कहानी को दोबारा पढ़ें",
      profileUpdateSettings: "प्रोफ़ाइल सेटिंग्स अपडेट करें",
      profileEducationStatus: "वर्तमान शिक्षा स्थिति",
      profileSaveChanges: "बदलाव सहेजें",
      profileSaving: "सहेजा जा रहा है...",
      profileResetLessons: "पूरे किए गए पाठ रीसेट करें (Dev)",
      profileAllAchievements: "सभी उपलब्धियां"
    },
    Kannada: {
      sidebarDashboard: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
      sidebarLearn: "ಕಲಿ",
      sidebarPractice: "ಅಭ್ಯಾಸ",
      sidebarProfile: "ಪ್ರೊಫೈಲ್",
      dashboardHello: "ನಮಸ್ಕಾರ, {name} 👋🏻",
      dashboardWelcomeBack: "ಮರಳಿ ಸುಸ್ವಾಗತ! ನೀವು ಎಲ್ಲಿ ನಿಲ್ಲಿಸಿದ್ದೀರೋ ಅಲ್ಲಿಂದ ಮುಂದುವರಿಸಿ.",
      dashboardContinueLearning: "ಕಲಿಕೆಯನ್ನು ಮುಂದುವರಿಸಿ",
      dashboardStartLearning: "ಕಲಿಕೆ ಪ್ರಾರಂಭಿಸಿ",
      dashboardSection: "ವಿಭಾಗ",
      dashboardUnit: "ಘಟಕ",
      dashboardResume: "ಪುನರಾರಂಭಿಸಿ",
      dashboardWordOfDay: "ದಿನದ ಪದ",
      dashboardCurrentLevel: "ಪ್ರಸ್ತುತ ಹಂತ",
      dashboardStreakSociety: "ನಿರಂತರ ಕಲಿಕಾ ಸಂಘ",
      dashboardDayStreak: "ದಿನಗಳ ನಿರಂತರತೆ",
      dashboardDailyQuests: "ದಿನನಿತ್ಯದ ಗುರಿಗಳು",
      dashboardAchievements: "ಸಾಧನೆಗಳು",
      dashboardViewAll: "ಎಲ್ಲವನ್ನೂ ವೀಕ್ಷಿಸಿ",
      practiceTodaysReview: "ಇಂದಿನ ವಿಮರ್ಶೆ",
      practicePerfectPronunciation: "ಪರಿಪೂರ್ಣ ಉಚ್ಚಾರಣೆ",
      practicePerfectPronunciationDesc: "ಮಾತನಾಡುವಲ್ಲಿ ಆತ್ಮವಿಶ್ವಾಸ ಬೆಳೆಸಿಕೊಳ್ಳಲು ಈ ಸೆಷನ್ ಪೂರ್ಣಗೊಳಿಸಿ!",
      practiceStart: "ಪ್ರಾರಂಭಿಸಿ",
      practiceConversation: "ಸಂಭಾಷಣೆ",
      practiceSpeak: "ಮಾತನಾಡು",
      practiceSpeakDesc: "ಈ ನುಡಿಗಟ್ಟುಗಳೊಂದಿಗೆ ನಿಮ್ಮ ಮಾತನಾಡುವ ಕೌಶಲ್ಯವನ್ನು ಸುಧಾರಿಸಿ",
      practiceListen: "ಕೇಳು",
      practiceListenDesc: "ಕೇವಲ ಆಲಿಸುವ ಸೆಷನ್ ಮೂಲಕ ನಿಮ್ಮ ಆಲಿಸುವ ಕೌಶಲ್ಯವನ್ನು ಹೆಚ್ಚಿಸಿ",
      practiceYourCollections: "ನಿಮ್ಮ ಸಂಗ್ರಹಗಳು",
      practiceMistakes: "ತಪ್ಪುಗಳು",
      practiceWords: "ಪದಗಳು",
      practiceStories: "ಕಥೆಗಳು",
      practiceMistakesDesc: "ನಿಮ್ಮ ತಪ್ಪುಗಳನ್ನು ಅಭ್ಯಾಸ ಮಾಡಲು ವೈಯಕ್ತికಗೊಳಿಸಿದ ಪಾಠವನ್ನು ಪ್ರಾರಂಭಿಸಿ",
      practiceWordsDesc: "ಯಾವಾಗಲಾದರೂ ನಿಮ್ಮ ಶಬ್ದಕೋಶವನ್ನು ಮರುಪರಿಶೀಲಿಸಿ",
      practiceStoriesDesc: "ಸಂದರ್ಭಕ್ಕೆ ಅನುಗುಣವಾಗಿ ಪದಗಳನ್ನು ಪರಿಶೀಲಿಸಲು ಕಥೆಯನ್ನು ಮತ್ತೊಮ್ಮೆ ಓದಿ",
      profileUpdateSettings: "ಪ್ರೊಫೈಲ್ ಸೆಟ್ಟಿಂಗ್‌ಗಳನ್ನು ನವೀಕರಿಸಿ",
      profileEducationStatus: "ಪ್ರಸ್ತುತ ಶಿಕ್ಷಣದ ಸ್ಥಿತಿ",
      profileSaveChanges: "ಬದಲಾವಣೆಗಳನ್ನು ಉಳಿಸಿ",
      profileSaving: "ಉಳಿಸಲಾಗುತ್ತಿದೆ...",
      profileResetLessons: "ಪೂರ್ಣಗೊಂಡ ಪಾಠಗಳನ್ನು ಮರುಹೊಂದಿಸಿ (Dev)",
      profileAllAchievements: "ಎಲ್ಲಾ ಸಾಧನೆಗಳು"
    },
    Telugu: {
      sidebarDashboard: "డ్యాష్‌బోర్డ్",
      sidebarLearn: "నేర్చుకోండి",
      sidebarPractice: "అభ్యాసం",
      sidebarProfile: "ప్రొఫైల్",
      dashboardHello: "నమస్కారం, {name} 👋🏻",
      dashboardWelcomeBack: "మరలా సుస్వాగతం! మీరు ఎక్కడ ఆపివేసారో అక్కడి నుండి ప్రారంభించండి.",
      dashboardContinueLearning: "నేర్చుకోవడం కొనసాగించండి",
      dashboardStartLearning: "నేర్చుకోవడం ప్రారంభించండి",
      dashboardSection: "విభాగం",
      dashboardUnit: "యూనిట్",
      dashboardResume: "కొనసాగించు",
      dashboardWordOfDay: "ఈనాటి పదం",
      dashboardCurrentLevel: "ప్రస్తుత స్థాయి",
      dashboardStreakSociety: "నిరంతర అభ్యాసక సంఘం",
      dashboardDayStreak: "రోజుల నిరంతరత",
      dashboardDailyQuests: "రోజువారీ లక్ష్యాలు",
      dashboardAchievements: "సాధనలు",
      dashboardViewAll: "అన్నీ చూడండి",
      practiceTodaysReview: "ఈ రోజు సమీక్ష",
      practicePerfectPronunciation: "ఖచ్చితమైన ఉచ్చారణ",
      practicePerfectPronunciationDesc: "మాట్లాడటంలో ఆత్మవిశ్వాసం పెంచుకోవడానికి ఈ సెషన్‌ను పూర్తి చేయండి!",
      practiceStart: "ప్రారంభించు",
      practiceConversation: "సంభాషణ",
      practiceSpeak: "మాట్లాడండి",
      practiceSpeakDesc: "ఈ పదబంధాలతో మీ మాట్లాడే నైపుణ్యాలను మెరుగుపరచుకోండి",
      practiceListen: "వినండి",
      practiceListenDesc: "ఆడియో మాత్రమే ఉండే సెషన్‌తో మీ వినికిడి నైపుణ్యాలను పెంచుకోండి",
      practiceYourCollections: "మీ సేకరణలు",
      practiceMistakes: "తప్పులు",
      practiceWords: "పదాలు",
      practiceStories: "కథలు",
      practiceMistakesDesc: "మీ తప్పులను సరిదిద్దుకోవడానికి వ్యక్తిగతీకరించిన పాఠాన్ని ప్రారంభించండి",
      practiceWordsDesc: "ఏ సమయంలోనైనా మీ పదజాలాన్ని సమీక్షించుకోండి",
      practiceStoriesDesc: "సందర్భంలో పదాలను సమీక్షించడానికి కథను మళ్లీ చదవండి",
      profileUpdateSettings: "ప్రొఫైల్ సెట్టంగ్లను నవీకరించండి",
      profileEducationStatus: "ప్రస్తుత విద్యా స్థితి",
      profileSaveChanges: "మార్పులను సేవ్ చేయి",
      profileSaving: "సేవ్ అవుతోంది...",
      profileResetLessons: "పూర్తయిన పాఠాలను రీసెట్ చేయి (Dev)",
      profileAllAchievements: "అన్ని సాధనలు"
    },
    Tamil: {
      sidebarDashboard: "டாஷ்போர்டு",
      sidebarLearn: "கற்றுக்கொள்",
      sidebarPractice: "பயிற்சி",
      sidebarProfile: "சுயவிவரம்",
      dashboardHello: "வணக்கம், {name} 👋🏻",
      dashboardWelcomeBack: "நல்வரவு! நீங்கள் விட்ட இடத்திலிருந்து தொடங்குங்கள்.",
      dashboardContinueLearning: "கற்றலைத் தொடரவும்",
      dashboardStartLearning: "கற்றலைத் தொடங்குங்கள்",
      dashboardSection: "பிரிவு",
      dashboardUnit: "அலகு",
      dashboardResume: "தொடரவும்",
      dashboardWordOfDay: "இன்றைய வார்த்தை",
      dashboardCurrentLevel: "தற்போதைய நிலை",
      dashboardStreakSociety: "தொடர் கற்றல் சங்கம்",
      dashboardDayStreak: "நாட்கள் தொடர்ச்சி",
      dashboardDailyQuests: "தினசரி இலக்குகள்",
      dashboardAchievements: "சாதனைகள்",
      dashboardViewAll: "அனைத்தையும் காட்டு",
      practiceTodaysReview: "இன்றைய ஆய்வு",
      practicePerfectPronunciation: "சரியான உச்சரிப்பு",
      practicePerfectPronunciationDesc: "பேசுவதில் நம்பிக்கையை வளர்க்க இந்த அமர்வை முடிக்கவும்!",
      practiceStart: "தொடங்கு",
      practiceConversation: "உரையாடல்",
      practiceSpeak: "பேசு",
      practiceSpeakDesc: "இந்த சொற்றொடர்களைக் கொண்டு உங்கள் பேசும் திறனை மேம்படுத்துங்கள்",
      practiceListen: "கேள்",
      practiceListenDesc: "ஆடியோ மூலம் உங்கள் கேட்கும் திறனை அதிகரிக்கவும்",
      practiceYourCollections: "உங்கள் சேகரிப்புகள்",
      practiceMistakes: "தவறுகள்",
      practiceWords: "வார்த்தைகள்",
      practiceStories: "கதைகள்",
      practiceMistakesDesc: "உங்கள் தவறுகளைப் பயிற்சி செய்ய தனிப்பயனாக்கப்பட்ட பாடத்தைத் தொடங்குங்கள்",
      practiceWordsDesc: "எந்த நேரத்திலும் உங்கள் சொற்களஞ்சியத்தை மதிப்பாய்வு செய்யவும்",
      practiceStoriesDesc: "சூழலில் வார்த்தைகளை மதிப்பாய்வு செய்ய கதையை மீண்டும் படிக்கவும்",
      profileUpdateSettings: "சுயவிவர அமைப்புகளைப் புதுப்பிக்கவும்",
      profileEducationStatus: "தற்போதைய கல்வி நிலை",
      profileSaveChanges: "மாற்றங்களைச் சேமிக்கவும்",
      profileSaving: "சேமிக்கப்படுகிறது...",
      profileResetLessons: "முடிந்த பாடங்களை மீட்டமை (Dev)",
      profileAllAchievements: "அனைத்து சாதனைகள்"
    }
  };

  const t = (key) => {
    const lang = selectedLanguage || "English";
    const localDict = localUiTranslations[lang] || localUiTranslations["English"];
    if (localDict && localDict[key]) {
      return localDict[key];
    }
    const dict = translations[lang] || translations["English"];
    if (key === "successForgotPasswordLink") {
      return lang === "Hindi" ? "पासवर्ड रीसेट लिंक भेजा गया! कृपया अपना ईमेल जांचें।" :
        lang === "Kannada" ? "ಪಾಸ್‌ವರ್ಡ್ ಮರುಹೊಂದಿಸುವ ಲಿಂಕ್ ಕಳುಹಿಸಲಾಗಿದೆ! ಇಮೇಲ್ ಪರಿಶೀಲಿಸಿ." :
          lang === "Telugu" ? "పాసవర్డ్ రీసెట్ లింక్ పంపబడింది! దయచేసి ఇమెయిల్ తనిఖీ చేయండి." :
            lang === "Tamil" ? "கடவுச்சொல் மீட்பு இணைப்பு அனுப்பப்பட்டது! மின்னஞ்சலைச் சரிபார்க்கவும்." :
              "Password reset link sent! Please check your email.";
    }
    if (key === "successResetPassword") {
      return lang === "Hindi" ? "पासवर्ड रीसेट सफल रहा! अब आप लॉगिन कर सकते हैं।" :
        lang === "Kannada" ? "ಪಾಸ್‌ವರ್ಡ್ ಮರುಹೊಂದಿಕೆ ಯಶಸ್ವಿಯಾಗಿದೆ! ನೀವು ಈಗ ಲಾಗಿನ್ ಮಾಡಬಹುದು." :
          lang === "Telugu" ? "పాస్వర్డ్ రీసెట్ విజయవంతమైంది! మీరు ఇప్పుడు లాగిన్ చేయవచ్చు." :
            lang === "Tamil" ? "கடவுச்சொல் மீட்டமைக்கப்பட்டது! நீங்கள் இப்போது உள்நுழையலாம்." :
              "Password reset successfully! You can now log in.";
    }
    return dict[key] || translations["English"][key] || key;
  };

  useEffect(() => {
    const checkAndAwardAchievements = async () => {
      if (!session?.user?.id || !profile) return;
      const userId = session.user.id;
      const currentLevel = calculateProgressiveLevel(profile, completedLessons);
      
      const achievementsDefinitions = [
        { id: 1, condition: true },
        { id: 2, condition: calculateSkillProficiency("reading") >= 75 },
        { id: 3, condition: calculateSkillProficiency("comprehension") >= 75 },
        { id: 4, condition: calculateSkillProficiency("writing") >= 75 },
        { id: 5, condition: userXp >= 100 },
        { id: 6, condition: completedLessons.filter(id => !id.startsWith("ach_")).length >= 3 },
        { id: 7, condition: calculateSkillProficiency("pronunciation") >= 75 },
        { id: 8, condition: currentLevel >= 8 },
        { id: 9, condition: currentLevel >= 12 },
      ];

      let newLessons = completedLessons.filter(id => typeof id === 'string' && !id.startsWith("ach_"));

      achievementsDefinitions.forEach(a => {
        const achIdStr = `ach_${a.id}`;
        if (a.condition) {
          newLessons.push(achIdStr);
        }
      });

      const currentAchList = completedLessons.filter(id => typeof id === 'string' && id.startsWith("ach_")).sort();
      const newAchList = newLessons.filter(id => typeof id === 'string' && id.startsWith("ach_")).sort();
      const changed = JSON.stringify(currentAchList) !== JSON.stringify(newAchList);

      if (changed) {
        setCompletedLessons(newLessons);
        localStorage.setItem(`lisa_completed_lessons_${userId}`, JSON.stringify(newLessons));
        try {
          await supabase
            .from("profiles")
            .update({
              completed_lessons: newLessons
            })
            .eq("id", userId);
        } catch (e) {
          console.warn("Error syncing achievements to Supabase:", e);
        }
      }
    };

    checkAndAwardAchievements();
  }, [userXp, completedLessons, profile, session]);

  useEffect(() => {
    // Load ResponsiveVoice client script on initial mount
    if (!window.responsiveVoice) {
      const script = document.createElement("script");
      script.src = "https://code.responsivevoice.org/responsivevoice.js?key=8Q7W8t4L";
      script.async = true;
      document.body.appendChild(script);
    }

    // Check initial auth session
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
      (event, session) => {
        setSession(session);
        if (event === "PASSWORD_RECOVERY") {
          setRecoveryMode(true);
        }
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

  // Update document title dynamically based on the current page/state
  useEffect(() => {
    if (!session) {
      if (!selectedLanguage) {
        document.title = "LISA | Choose Language";
      } else if (recoveryMode) {
        document.title = "LISA | Reset Password";
      } else if (activeTab === "register") {
        document.title = "LISA | Create Learner Profile";
      } else if (activeTab === "forgot") {
        document.title = "LISA | Forgot Password";
      } else {
        document.title = "LISA | Login";
      }
    } else {
      if (assessmentState === "answering") {
        document.title = "LISA | Initial Assessment";
      } else if (assessmentState === "results") {
        document.title = "LISA | Assessment Results";
      } else if (lessonSession) {
        document.title = `LISA | Lesson: ${lessonSession.title || "Personalized Lesson"}`;
      } else {
        switch (dashboardTab) {
          case "dashboard":
            document.title = "LISA | Dashboard";
            break;
          case "learn":
            document.title = "LISA | Learning Path";
            break;
          case "practice":
            document.title = "LISA | Practice";
            break;
          case "profile":
            document.title = "LISA | Profile Settings";
            break;
          default:
            document.title = "LISA | AI Literacy Companion";
        }
      }
    }
  }, [session, selectedLanguage, recoveryMode, activeTab, assessmentState, lessonSession, dashboardTab]);

  // Auto-play the dictation sentence when the writing section is opened
  useEffect(() => {
    if (assessmentState !== "answering") return;
    const cq = assessmentQuestionsList[currentStep];
    if (cq?.type !== "writing") return;
    const dText = cq.rawQuestion?.dictation || "";
    if (!dText) return;
    const id = setTimeout(() => speakText(dText), 400);
    return () => clearTimeout(id);
  }, [assessmentState, currentStep, selectedLanguage, assessmentQuestionsList]);
  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.warn("Could not fetch profile, setting default session:", error.message);
        const storedAssessment = getStoredAssessmentState(userId);
        // Fallback for demo users
        const defaultProfile = {
          id: userId,
          full_name: session?.user?.user_metadata?.full_name || session?.user?.email || "Learner",
          age: session?.user?.user_metadata?.age || 20,
          preferred_language: session?.user?.user_metadata?.preferred_language || selectedLanguage || "English",
          education_level: session?.user?.user_metadata?.education_level || "No formal education",
          literacy_level: storedAssessment?.literacy_level ?? null,
          assessment_completed: storedAssessment?.assessment_completed ?? false,
          xp: 0,
          completed_lessons: [],
          attempts_history: []
        };
        setProfile(defaultProfile);
        updateStreak(userId, defaultProfile);
      } else {
        const storedAssessment = getStoredAssessmentState(userId);
        const mergedProfile = storedAssessment
          ? {
            ...data,
            literacy_level: data.literacy_level ?? storedAssessment.literacy_level ?? null,
            assessment_completed: data.assessment_completed ?? storedAssessment.assessment_completed ?? false
          }
          : data;

        setProfile(mergedProfile);
        updateStreak(userId, mergedProfile);

        // Load progress and preferences from the database, updating both React state and localStorage cache
        if (mergedProfile.xp !== undefined && mergedProfile.xp !== null && Number(mergedProfile.xp) > 0) {
          setUserXp(Number(mergedProfile.xp));
          localStorage.setItem(`lisa_user_xp_${userId}`, mergedProfile.xp);
        }
        if (mergedProfile.completed_lessons && Array.isArray(mergedProfile.completed_lessons) && mergedProfile.completed_lessons.length > 0) {
          const dbLessons = mergedProfile.completed_lessons;
          const storedLessons = localStorage.getItem(`lisa_completed_lessons_${userId}`);
          const localLessons = storedLessons ? JSON.parse(storedLessons) : [];
          const merged = Array.from(new Set([...dbLessons, ...localLessons]));
          setCompletedLessons(merged);
          localStorage.setItem(`lisa_completed_lessons_${userId}`, JSON.stringify(merged));
        }
        if (mergedProfile.attempts_history) {
          const historyList = Array.isArray(mergedProfile.attempts_history) ? mergedProfile.attempts_history : [];
          setHistoryAttempts(historyList);
          localStorage.setItem("lisa_attempts_history", JSON.stringify(historyList));
        }
        if (mergedProfile.profile_bg) {
          setProfileBg(mergedProfile.profile_bg);
          localStorage.setItem(`lisa_profile_bg_${userId}`, mergedProfile.profile_bg);
        }
        if (mergedProfile.avatar_url) {
          setProfileAvatar(mergedProfile.avatar_url);
          localStorage.setItem(`lisa_profile_avatar_${userId}`, mergedProfile.avatar_url);
        }

        // Sync locally selected language from login screen to database profile
        const localLang = localStorage.getItem("lisa_lang") || selectedLanguage || "English";
        if (localLang && mergedProfile.preferred_language !== localLang) {
          await supabase.from("profiles").update({ preferred_language: localLang }).eq("id", userId);
          setProfile(prev => prev ? { ...prev, preferred_language: localLang } : null);
          setSelectedLanguage(localLang);
        } else if (mergedProfile.preferred_language) {
          setSelectedLanguage(mergedProfile.preferred_language);
          localStorage.setItem("lisa_lang", mergedProfile.preferred_language);
        }
      }
    } catch (err) {
      console.error("Unexpected error fetching profile:", err);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleLanguageSelect = async (lang) => {
    setSelectedLanguage(lang);
    localStorage.setItem("lisa_lang", lang);
    if (session?.user) {
      try {
        const { error } = await supabase
          .from("profiles")
          .update({ preferred_language: lang })
          .eq("id", session.user.id);
        if (!error) {
          setProfile(prev => prev ? { ...prev, preferred_language: lang } : null);
        }
      } catch (err) {
        console.error("Error saving profile language preference:", err);
      }
    }
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    const formData = new FormData(event.currentTarget);
    const email = formData.get("loginEmail");
    const password = formData.get("loginPassword");

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setMessage(`Login error: ${error.message}`);
    } else {
      setMessage(t("successLogin"));
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
    const confirmPassword = formData.get("confirmPassword");
    const fullName = formData.get("fullName");
    const age = parseInt(formData.get("age"), 10);
    const language = formData.get("language");
    const educationLevel = formData.get("educationLevel");

    if (password !== confirmPassword) {
      setMessage(t("passwordsDoNotMatch"));
      setSubmitting(false);
      return;
    }

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

    if (data.user) {
      if (data.session) {
        setMessage(t("successAccountCreated"));
        const newProfile = {
          id: data.user.id,
          full_name: fullName,
          age,
          preferred_language: language,
          education_level: educationLevel,
          literacy_level: null,
          assessment_completed: false
        };
        setProfile(newProfile);
        updateStreak(data.user.id, newProfile);
      } else {
        setMessage(t("checkEmailConfirm"));
      }
    }
    setSubmitting(false);
  };

  const handleForgotPassword = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    const formData = new FormData(event.currentTarget);
    const email = formData.get("forgotEmail");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage(t("successForgotPasswordLink"));
    }
    setSubmitting(false);
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    const formData = new FormData(event.currentTarget);
    const password = formData.get("resetPassword");

    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setMessage(`Error resetting password: ${error.message}`);
    } else {
      await supabase.auth.signOut();
      setRecoveryMode(false);
      setActiveTab("login");
      setMessage(t("successResetPassword"));
    }
    setSubmitting(false);
  };

  const handleSignOut = async () => {
    setSubmitting(true);
    await supabase.auth.signOut();
    setMessage(t("successSignOut"));
    setTimeout(() => setMessage(""), 3000);
    setSubmitting(false);
  };

  // Dynamic Assessment Shuffled Initialization (Taken Once)
  const handleStartInitialAssessment = () => {
    setSelectedAnswers({});
    setWritingAnswers({});
    setReadingAttempts({});
    setSpokenTranscript("");
    setManualTextFallback("");
    setMicError("");

    // Generates a dynamic test where the questions are shuffled
    // and MCQ options are shuffled as well.
    const assessment = getRandomAssessment(
      profile?.age || 20,
      profile?.education_level || "No formal education",
      selectedLanguage || "English"
    );
    setAssessmentQuestionsList(assessment.questions);
    setCurrentStep(0);
    setAssessmentState("answering");
  };

  // Speech Recognition Logic
  const startListening = (targetText) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMicError("Speech recognition is not supported in this browser. Please use Chrome/Edge or type manually.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      // Always use English (en-US) for speech recognition in the English reading assessment
      let locale = "en-US";
      recognition.lang = locale;
      recognitionRef.current = recognition;

      recognition.onstart = () => {
        setIsListening(true);
        setSpokenTranscript("");
        setMicError("");
      };

      recognition.onerror = (e) => {
        console.error("Speech Recognition Error:", e);
        setMicError("Unable to access mic or understand audio. Please click again or try manual text entry.");
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setSpokenTranscript(transcript);
        evaluateSpeechText(transcript, targetText);
      };

      recognition.start();
    } catch (err) {
      console.error("Failed to start speech recognition", err);
      setMicError("Mic error, please check connection.");
      setIsListening(false);
    }
  };

  const getLocale = (lang) => {
    if (lang === "Hindi") return "hi-IN";
    if (lang === "Kannada") return "kn-IN";
    if (lang === "Telugu") return "te-IN";
    if (lang === "Tamil") return "ta-IN";
    return "en-US";
  };

  const speakText = (text) => {
    const lang = selectedLanguage || "English";

    if (window.responsiveVoice) {
      let voiceName = "US English Female";
      if (lang === "Hindi") voiceName = "Hindi Female";
      else if (lang === "Kannada") voiceName = "Kannada Female";
      else if (lang === "Telugu") voiceName = "Telugu Female";
      else if (lang === "Tamil") voiceName = "Tamil Female";

      console.log(`Speaking using ResponsiveVoice: "${text}" with voice "${voiceName}"`);
      window.responsiveVoice.speak(text, voiceName, {
        pitch: 1,
        rate: 0.9,
        onerror: (e) => {
          console.error("ResponsiveVoice error, trying fallback:", e);
          fallbackSpeechSynthesis(text, getLocale(lang));
        }
      });
    } else {
      console.warn("ResponsiveVoice not loaded yet, falling back to native SpeechSynthesis.");
      fallbackSpeechSynthesis(text, getLocale(lang));
    }
  };

  const fallbackSpeechSynthesis = (text, locale) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = locale;

      const voices = window.speechSynthesis.getVoices();
      const matchingVoice = voices.find(v =>
        v.lang.toLowerCase() === locale.toLowerCase() ||
        v.lang.toLowerCase().replace("_", "-") === locale.toLowerCase() ||
        v.lang.toLowerCase().startsWith(locale.split("-")[0].toLowerCase())
      );
      if (matchingVoice) {
        utterance.voice = matchingVoice;
      }

      utterance.onerror = (e) => console.error("TTS SpeechSynthesisUtterance Error:", e);
      window.speechSynthesis.speak(utterance);
    }
  };

  const getUserInitials = (name) => {
    if (!name) return "L";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  // String cleaning helper
  const cleanWord = (w) => {
    return w.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").toLowerCase().trim();
  };

  const evaluateSpeechText = (transcript, targetText) => {
    const targetWords = targetText.split(/\s+/).filter(Boolean);
    const spokenWords = transcript.split(/\s+/).filter(Boolean).map(cleanWord);

    let matchedCount = 0;
    const scores = targetWords.map((word) => {
      const cleaned = cleanWord(word);
      const isMatched = spokenWords.includes(cleaned);
      if (isMatched) matchedCount++;
      return isMatched;
    });

    if (lessonSession) {
      setLessonSession(prev => ({
        ...prev,
        spokenText: transcript,
        matchedCount,
        totalWords: targetWords.length,
        scores
      }));
    } else {
      setReadingAttempts(prev => ({
        ...prev,
        [currentStep]: {
          transcript,
          matchedCount,
          totalWords: targetWords.length,
          scores
        }
      }));
    }
  };

  // Fallback Text Match
  const handleManualTextSubmit = (targetText) => {
    if (!manualTextFallback.trim()) return;
    evaluateSpeechText(manualTextFallback, targetText);
  };

  const handleNextStep = () => {
    if (currentStep < assessmentQuestionsList.length - 1) {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      setCurrentStep(currentStep + 1);
      setSpokenTranscript("");
      setManualTextFallback("");
      setMicError("");
    }
  };

  // Evaluate & Diagnose — 6-Skill Assessment Engine
  const submitInitialAssessment = async () => {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    setSubmitting(true);

    // Compute per-skill scores from all question answers
    const skillScores = computeSkillScores(
      assessmentQuestionsList,
      selectedAnswers,
      readingAttempts,
      writingAnswers
    );

    // Classify proficiency level (1-5) from skill averages
    const diagnosedLevel = classifyProficiency(skillScores);

    // Generate learning path from weak skills
    const learningPath = generateLearningPath(skillScores);
    const weakAreas = getWeakSkills(skillScores);
    const strongAreas = getStrongSkills(skillScores);
    const strongSkillKeys = getStrongSkillKeys(skillScores);
    const weakSkillKeys = getWeakSkillKeys(skillScores);

    // Compute marks out of 30: 10 comprehension MCQ (1 mark each) + 10 reading + 10 writing
    let compMarks = 0;
    let readingMarks = 0;
    let writingMarks = 0;
    assessmentQuestionsList.forEach((q, idx) => {
      if (q.type === "comprehension") {
        if (selectedAnswers[idx] === q.correctIndex) compMarks += 1;
      } else if (q.type === "reading") {
        const attempt = readingAttempts[idx];
        const ratio = (attempt && attempt.totalWords > 0) ? attempt.matchedCount / attempt.totalWords : 0;
        readingMarks = Math.round(ratio * 10);
      } else if (q.type === "writing") {
        const text = writingAnswers[idx] || "";
        const res = q.evaluator ? q.evaluator(text) : { score: 0 };
        writingMarks = res.score;
      }
    });
    const totalMarks = compMarks + readingMarks + writingMarks;
    const overallPercent = Math.round((totalMarks / 30) * 100);

    try {
      // Save to history
      const attemptResult = {
        date: new Date().toLocaleDateString(),
        type: "Diagnostic Evaluation",
        score: totalMarks,
        maxScore: 30,
        percentage: overallPercent,
        level: diagnosedLevel,
        skills: {
          reading: skillScores.sentence_reading || 0,
          comprehension: skillScores.comprehension || 0,
          writing: skillScores.writing || 0,
          letter_recognition: skillScores.letter_recognition || 0,
          word_recognition: skillScores.word_recognition || 0,
          pronunciation: skillScores.pronunciation || 0,
        },
        skillScores,
        weakAreas,
        strongAreas,
        strongSkillKeys,
        weakSkillKeys,
        learningPath,
        passed: overallPercent >= 40
      };

      const updatedHistory = [attemptResult, ...historyAttempts];
      setHistoryAttempts(updatedHistory);
      localStorage.setItem("lisa_attempts_history", JSON.stringify(updatedHistory));

      // Update Supabase profile (do not overwrite the user's chosen education_level)
      await supabase.from("profiles").update({
        literacy_level: diagnosedLevel,
        assessment_completed: true,
        attempts_history: updatedHistory
      }).eq("id", session.user.id);

      // Update local state
      setProfile(prev => ({
        ...prev,
        literacy_level: diagnosedLevel,
        assessment_completed: true,
        skill_scores: skillScores,
        learning_path: learningPath
      }));

      // Store skill scores + learning path in localStorage
      setStoredAssessmentState(session.user.id, {
        literacy_level: diagnosedLevel,
        assessment_completed: true,
        skill_scores: skillScores,
        learning_path: learningPath
      });

      setDashboardTab("dashboard");
      setAssessmentState("results");
    } catch (err) {
      console.error("Error updating test results:", err);
    } finally {
      setSubmitting(false);
    }
  };


  // Profile Edit Submission
  const handleSaveProfileEdit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: editFullName,
          age: parseInt(editAge, 10),
          preferred_language: editPreferredLang,
          education_level: editEdLevel
        })
        .eq("id", session.user.id);

      if (error) {
        console.warn("DB profile save error, caching:", error.message);
      }

      setProfile(prev => ({
        ...prev,
        full_name: editFullName,
        age: parseInt(editAge, 10),
        preferred_language: editPreferredLang,
        education_level: editEdLevel
      }));
      setSelectedLanguage(editPreferredLang);
      localStorage.setItem("lisa_lang", editPreferredLang);
      setEditingProfile(false);
    } catch (err) {
      console.error("Profile edit error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !session?.user?.id) return;

    try {
      setSubmitting(true);
      const userId = session.user.id;
      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}/avatar_${Date.now()}.${fileExt}`;

      // Upload file to Supabase Storage bucket 'avatars'
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile avatar_url in the database
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', userId);

      if (updateError) {
        throw updateError;
      }

      // Update states
      setProfileAvatar(publicUrl);
      setProfile(prev => prev ? { ...prev, avatar_url: publicUrl } : null);
      localStorage.setItem(`lisa_profile_avatar_${userId}`, publicUrl);
    } catch (error) {
      console.error("Error uploading avatar:", error.message);
      alert("Failed to upload avatar: " + error.message + "\n\nPlease ensure you have created a public bucket named 'avatars' in your Supabase storage.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartEdit = () => {
    setEditFullName(profile?.full_name || "");
    setEditAge(profile?.age || "");
    setEditPreferredLang(profile?.preferred_language || selectedLanguage || "English");
    setEditEdLevel(profile?.education_level || "No formal education");
    setEditingProfile(true);
  };

  const handleResetAssessmentStatus = async () => {
    try {
      const primaryUpdate = await supabase
        .from("profiles")
        .update({
          education_level: "No formal education",
          literacy_level: null,
          assessment_completed: false,
          attempts_history: []
        })
        .eq("id", session.user.id);

      let error = primaryUpdate.error;

      if (error) {
        console.warn("Primary reset failed, retrying with guaranteed schema fields:", error.message);
        const retry = await supabase
          .from("profiles")
          .update({ education_level: "No formal education" })
          .eq("id", session.user.id);
        error = retry.error;
      }

      if (error) throw error;

      setProfile(prev => prev ? {
        ...prev,
        education_level: "No formal education",
        literacy_level: null,
        assessment_completed: false,
        attempts_history: []
      } : null);
      clearStoredAssessmentState(session.user.id);
      setHistoryAttempts([]);
      localStorage.removeItem("lisa_attempts_history");
      setAssessmentState("not_started");
      alert("Diagnostic status reset successfully! You will now see the initial assessment welcome screen.");
    } catch (err) {
      console.error("Error resetting profile:", err);
      alert("Failed to reset profile: " + err.message);
    }
  };

  const handleResetLessons = async () => {
    if (!session?.user?.id) return;
    const userId = session.user.id;
    try {
      await supabase
        .from("profiles")
        .update({
          completed_lessons: [],
          xp: 0
        })
        .eq("id", userId);
    } catch (dbErr) {
      console.warn("Could not reset lessons in database:", dbErr);
    }
    setCompletedLessons([]);
    setUserXp(0);
    localStorage.removeItem(`lisa_completed_lessons_${userId}`);
    localStorage.removeItem(`lisa_user_xp_${userId}`);
    alert("Completed lessons and XP have been reset successfully!");
  };

  // Skill calculations for Progress Analytics
  const calculateSkillProficiency = (skill) => {
    let totalScore = 0;
    let count = 0;
    historyAttempts.forEach((attempt) => {
      if (attempt.skills && attempt.skills[skill] !== undefined) {
        totalScore += attempt.skills[skill];
        count++;
      }
    });
    return count > 0 ? Math.round(totalScore / count) : 0;
  };

  // initial loading spinner
  if (initialLoading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p style={{ fontWeight: 600, color: "var(--muted)", margin: 0 }}>
          {t("loadingMessage")}
        </p>
      </div>
    );
  }

  // Dark Mode Toggle Button
  const renderThemeToggle = () => (
    <div className="theme-toggle-container" key="theme-toggle">
      <button
        type="button"
        className="theme-toggle-btn"
        onClick={toggleTheme}
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      >
        {isDark ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        )}
      </button>
    </div>
  );

  // Language Dropdown Render
  const renderLanguageDropdown = (isRelative = false) => (
    <div className={isRelative ? "lang-selector-relative" : "lang-selector-container"}>
      <button
        className="lang-selector-trigger"
        onClick={() => setLangDropdownOpen(!langDropdownOpen)}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          <path d="M2 12h20" />
        </svg>
        <span>{t("changeLanguageBtn")}</span>
      </button>
      {langDropdownOpen && (
        <div className="lang-selector-dropdown">
          {[
            { key: "English", native: "English" },
            { key: "Hindi", native: "हिन्दी" },
            { key: "Kannada", native: "ಕನ್ನಡ" },
            { key: "Telugu", native: "తెలుగు" },
            { key: "Tamil", native: "தமிழ்" },
          ].map((lang) => (
            <button
              key={lang.key}
              className={`lang-dropdown-item ${selectedLanguage === lang.key ? "active" : ""}`}
              onClick={() => {
                handleLanguageSelect(lang.key);
                setLangDropdownOpen(false);
              }}
            >
              {lang.native}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  // Profile settings dropdown menu render helper
  const renderProfileDropdown = () => {
    const handleToggle = () => {
      if (!profileDropdownOpen) {
        setEditFullName(profile?.full_name || "");
        setEditAge(profile?.age || "");
        setEditPreferredLang(profile?.preferred_language || selectedLanguage || "English");
        setEditEdLevel(profile?.education_level || "No formal education");
      }
      setProfileDropdownOpen(!profileDropdownOpen);
    };

    return (
      <div className="profile-dropdown-container" ref={profileDropdownRef}>
        <button
          type="button"
          className="profile-dropdown-trigger"
          onClick={handleToggle}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--panel-strong)',
            border: '1px solid var(--line)',
            borderRadius: '20px',
            padding: '6px 16px',
            fontWeight: '600',
            cursor: 'pointer',
            color: 'var(--text)'
          }}
        >
          <span className="profile-avatar-mini" style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            background: 'var(--accent)',
            color: 'white',
            display: 'grid',
            placeItems: 'center',
            fontSize: '0.75rem',
            fontWeight: '800'
          }}>
            {getUserInitials(profile?.full_name)}
          </span>
          <span className="profile-trigger-text">{t("myProfile") || "My Profile"}</span>
          <span className="dropdown-arrow" style={{ fontSize: '0.8rem', opacity: 0.7 }}>▼</span>
        </button>
        {profileDropdownOpen && (
          <div className="profile-dropdown-menu profile-dropdown-card" style={{ right: 0, padding: '20px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 16px 0', color: 'var(--text)' }}>
              {t("profileUpdateSettings")}
            </h3>
            <form onSubmit={(e) => {
              handleSaveProfileEdit(e);
              setProfileDropdownOpen(false);
            }} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label className="profile-dropdown-label">
                {t("fullName")}
                <input
                  type="text"
                  required
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  style={{ width: "100%", boxSizing: "border-box" }}
                />
              </label>
              
              <label className="profile-dropdown-label">
                {t("age")}
                <input
                  type="number"
                  min="5"
                  max="120"
                  required
                  value={editAge}
                  onChange={(e) => setEditAge(e.target.value)}
                  style={{ width: "100%", boxSizing: "border-box" }}
                />
              </label>

              <label className="profile-dropdown-label">
                Preferred Language
                <select
                  required
                  value={editPreferredLang}
                  onChange={(e) => setEditPreferredLang(e.target.value)}
                  style={{ width: "100%", boxSizing: "border-box" }}
                >
                  {languages.map((l) => (
                    <option key={l} value={l}>{t(l + "Option")}</option>
                  ))}
                </select>
              </label>

              <label className="profile-dropdown-label">
                {t("profileEducationStatus")}
                <select
                  required
                  value={editEdLevel}
                  onChange={(e) => setEditEdLevel(e.target.value)}
                  style={{ width: "100%", boxSizing: "border-box" }}
                >
                  {educationLevels.map((ed) => (
                    <option key={ed} value={ed}>{t(ed + "Option")}</option>
                  ))}
                </select>
              </label>

              <button
                type="submit"
                className="primary-btn"
                style={{ width: '100%', padding: '10px', borderRadius: '12px', background: 'var(--accent)', color: '#fff', border: 'none', fontWeight: '700', cursor: 'pointer', marginTop: '4px' }}
                disabled={submitting}
              >
                {submitting ? t("profileSaving") : t("profileSaveChanges")}
              </button>
            </form>
            
            <hr style={{ border: '0', borderTop: '1px solid var(--line)', margin: '16px 0 12px 0' }} />

            <button
              type="button"
              className="profile-dropdown-item logout"
              style={{ color: '#ef4444', background: 'rgba(198, 95, 45, 0.08)', justifyContent: 'center', width: '100%', padding: '10px 0' }}
              onClick={() => {
                setProfileDropdownOpen(false);
                handleSignOut();
              }}
            >
              🚪 {t("logout") || "Log Out"}
            </button>
          </div>
        )}
      </div>
    );
  };

  // Recovery Mode Form
  if (recoveryMode) {
    return (
      <main className="shell">
        <div className="brand-logo-top">LISA</div>
        {renderThemeToggle()}
        {renderLanguageDropdown()}
        <section className="hero-panel">
          <h1>{t("resetAccountPassword")}</h1>
          <p className="hero-copy">{t("regainAccessCopy")}</p>
        </section>
        <section className="auth-panel">
          <div className="auth-card">
            <form className="auth-form active" onSubmit={handleResetPassword}>
              <h2>{t("createNewPassword")}</h2>
              <p>{t("typeSecurePassword")}</p>
              <label>
                {t("newPassword")}
                <input
                  type="password"
                  name="resetPassword"
                  placeholder={t("newPasswordPlaceholder")}
                  autoComplete="new-password"
                  required
                  disabled={submitting}
                />
              </label>
              <button type="submit" className="primary-btn" disabled={submitting}>
                {submitting ? t("resettingPassword") : t("updatePassword")}
              </button>
            </form>
            {message ? <p className="status-message">{message}</p> : null}
          </div>
        </section>
      </main>
    );
  }

  // Dashboard / Assessment Screens when Logged In
  if (session) {
    const userLevel = getLiteracyLevel(profile);
    const hasDiagnosed = hasCompletedAssessment(profile);
    const currentLevelNum = calculateProgressiveLevel(profile, completedLessons);
    const currentLang = selectedLanguage || "English";

    // Build flat list of all lessons with their section/unit info
    const flatLessonsWithLocation = [];
    const sections = CURRICULUM_SECTIONS;
    sections.forEach((sec, secIdx) => {
      sec.units.forEach((uni, uniIdx) => {
        uni.lessons.forEach((les, lesIdx) => {
          flatLessonsWithLocation.push({
            lesson: les,
            section: sec,
            unit: uni,
            secIdx,
            uniIdx,
            lesIdx
          });
        });
      });
    });

    // Determine starting lesson ID based on diagnosed literacy level (consistent with Learn tab)
    const diagnosedLevel = profile?.literacy_level || 1;
    const startingLessonId = (() => {
      if (diagnosedLevel === 2) return "s2u1l1";
      if (diagnosedLevel === 3) return "s3u1l1";
      if (diagnosedLevel === 4) return "s5u1l1";
      if (diagnosedLevel === 5) return "s7u1l1";
      return "s1u1l1";
    })();

    const startingIndex = flatLessonsWithLocation.findIndex(item => item.lesson.id === startingLessonId);
    const startIndexToUse = startingIndex !== -1 ? startingIndex : 0;

    // Find the active resumed lesson item (first incomplete starting from startingIndex)
    const activeItem = flatLessonsWithLocation.slice(startIndexToUse).find(item => !completedLessons.includes(item.lesson.id))
      || flatLessonsWithLocation[startIndexToUse]
      || flatLessonsWithLocation[0];

    const currentUnit = activeItem?.lesson;
    const currentUnitPos = {
      sectionIdx: activeItem?.secIdx ?? 0,
      unitIdx: activeItem?.uniIdx ?? 0,
      lessonIdx: activeItem?.lesIdx ?? 0
    };



    const speakWord = (text) => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        const u = new SpeechSynthesisUtterance(text);
        u.lang = getLocale(selectedLanguage);
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(u);
      }
    };

    if (!hasDiagnosed || assessmentState !== "not_started") {
      return (
        <div className="dashboard-container">
          {/* Navigation Top Bar Header */}
          <header className="dashboard-header" style={{ background: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '16px 32px', borderBottom: '1px solid var(--line)' }}>
            {/* Brand Logo & Info (same design as login page) */}
            <div className="brand-logo-top dashboard-brand">
              LISA
              <span className="brand-logo-tagline">Literacy Intelligence Support Assistant</span>
            </div>

            {/* Right User Actions Area */}
            <div className="dashboard-user-actions" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              {renderThemeToggle()}
              {renderLanguageDropdown(true)}
              {renderProfileDropdown()}
            </div>
          </header>

          {/* Main Content Area */}
          <div className="dashboard-content-area" style={{ flexGrow: 1 }}>
            <main className="dashboard-main-view centered-layout">
              {/* 1. Welcome state when not diagnosed and assessment not started */}
              {!hasDiagnosed && assessmentState === "not_started" && (
                <div className="diagnostic-welcome-wrapper" style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
                  <div className="welcome-banner welcome-banner-mascot">
                    <img
                      src="/as1.png"
                      alt="LISA mascot"
                      className="welcome-mascot"
                    />
                    <div className="welcome-banner-text">
                      <h1>{t("hello")}, {profile?.full_name || "Learner"} 👋</h1>
                      <h2 style={{ fontSize: "1.3rem", marginTop: "8px", color: "var(--muted)", fontWeight: 600 }}>{t("welcomeToLisa")}!</h2>
                    </div>
                  </div>
                  <div className="empty-state-assessment">
                    <p className="intro-copy">{t("initialAssessmentDesc")}</p>
                    <div className="assessment-tours">
                      <div className="tour-badge">📄 {t("compSecTitle")}</div>
                      <div className="tour-badge">🗣️ {t("readingSecTitle")}</div>
                      <div className="tour-badge">✍️ {t("writingSecTitle")}</div>
                    </div>
                    <button
                      type="button"
                      className="primary-btn start-assessment-btn"
                      onClick={handleStartInitialAssessment}
                    >
                      {t("takeAssessmentBtn")}
                    </button>
                  </div>
                </div>
              )}

              {/* 2. Answering state */}
              {assessmentState === "answering" && (() => {
                const q = assessmentQuestionsList[currentStep];
                const isVoiceReading = q?.type === "reading";
                const isCompMCQ = q?.type === "comprehension";
                const isWriting = q?.type === "writing";

                // Group question indices by section type for the 3-step stepper
                const typeIndices = { comprehension: [], reading: [], writing: [] };
                assessmentQuestionsList.forEach((item, i) => {
                  if (typeIndices[item.type]) typeIndices[item.type].push(i);
                });
                const compIdx = typeIndices.comprehension;
                const readIdx = typeIndices.reading[0];
                const writeIdx = typeIndices.writing[0];

                const currentSectionNum = isWriting ? 3 : isVoiceReading ? 2 : 1;

                const compCompleted = compIdx.length > 0 && compIdx.every((i) => selectedAnswers[i] !== undefined);
                const readCompleted = !!readingAttempts[readIdx];
                const writeCompleted = !!(writingAnswers[writeIdx] || "").trim();

                const sectionMeta = [
                  { num: 1, title: t("compSecTitle"), done: compCompleted },
                  { num: 2, title: t("readingSecTitle"), done: readCompleted },
                  { num: 3, title: t("writingSecTitle"), done: writeCompleted },
                ];

                // 1. Resolve reading targetText
                const readingTargetText = isVoiceReading
                  ? (translatedQ?.reading || "Read this text aloud.")
                  : "";

                // 2. Resolve comprehension question & options
                const compQuestionText = isCompMCQ
                  ? (translatedQ?.question || "")
                  : "";

                const compOptions = isCompMCQ && translatedQ?.options
                  ? q.shuffledIndices.map((originalIdx) => translatedQ.options[originalIdx] || "")
                  : [];

                // 3. Resolve writing prompt + dictation sentence
                const writingPromptText = isWriting
                  ? (translatedQ?.writing || "")
                  : "";

                const dictationText = isWriting
                  ? (q.rawQuestion?.dictation || "")
                  : "";

                return (
                  <div className="assessment-card" style={{ maxWidth: '800px', margin: '20px auto' }}>
                    <div className="assessment-card-header assessment-header-with-mascot">
                      <div className="assessment-header-content">
                        <div className="step-tag-row">
                          <div className="step-tag">
                            {t("stepTitle").replace("{current}", currentSectionNum).replace("{total}", 3)}
                          </div>
                          <span className="step-subtitle">Initial Assessment</span>
                        </div>
                        <h2>
                          {isVoiceReading && t("readingSecTitle")}
                          {isCompMCQ && t("compSecTitle")}
                          {isWriting && t("writingSecTitle")}
                        </h2>
                        {isCompMCQ && compIdx.length > 0 && (
                          <p className="section-sub-progress">
                            {t("questionOf").replace("{current}", compIdx.indexOf(currentStep) + 1).replace("{total}", compIdx.length)}
                          </p>
                        )}
                      </div>
                      <div className="section-stepper">
                        {sectionMeta.map((s) => (
                          <div key={s.num} className={`step-node ${s.done ? "done" : currentSectionNum === s.num ? "active" : "pending"}`}>
                            <span className="step-circle">{s.done ? "✓" : s.num}</span>
                          </div>
                        ))}
                      </div>
                      <img
                        src="/as2.png"
                        alt="LISA mascot"
                        className="assessment-mascot"
                      />
                    </div>

                    <div className="question-content-box">
                      {translatingQ || !translatedQ ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 40px', width: '100%' }}>
                          <div style={{
                            width: '45px',
                            height: '45px',
                            borderRadius: '50%',
                            border: '4px solid var(--line)',
                            borderTopColor: 'var(--accent)',
                            animation: 'spin 1s linear infinite'
                          }} className="spinner"></div>
                          <p style={{ marginTop: '18px', fontWeight: '600', color: 'var(--muted)', fontSize: '1.05rem' }}>Translating question...</p>
                        </div>
                      ) : (
                        <>
                          {/* READING VOICE TO TEXT WITH MONKEYTYPE UI */}
                      {isVoiceReading && (
                        <div className="reading-q-container">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                            <p className="helper-text" style={{ margin: 0 }}>{t("monkeyTypeTip")}</p>
                            <button
                              type="button"
                              className="tts-btn"
                              onClick={() => speakText(readingTargetText)}
                              title="Listen to pronunciation"
                            >
                              🔊 {t("listenBtn") || "Listen"}
                            </button>
                          </div>

                          <div className="monkeytype-text-block">
                            {readingTargetText.split(/\s+/).map((word, idx) => {
                              const cleaned = cleanWord(word);
                              const attempt = readingAttempts[currentStep];
                              let wordClass = "unspoken";
                              if (attempt && attempt.scores) {
                                const targetWordsCleaned = readingTargetText.split(/\s+/).map(cleanWord);
                                const cleanIdx = targetWordsCleaned.indexOf(cleaned);
                                if (cleanIdx !== -1 && attempt.scores[cleanIdx]) {
                                  wordClass = "correct";
                                } else if (!isListening) {
                                  wordClass = "incorrect";
                                }
                              }
                              return (
                                <span key={idx} className={`mt-word ${wordClass}`}>
                                  {word}{" "}
                                </span>
                              );
                            })}
                          </div>

                          <div className="voice-mic-controls">
                            {!isListening ? (
                              <div className="mic-outer-container">
                                <button
                                  type="button"
                                  className="mic-btn"
                                  onClick={() => startListening(readingTargetText)}
                                >
                                  <svg className="mic-icon" width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                    <path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3z" />
                                    <path d="M17 11a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-3.08A7 7 0 0 0 19 11h-2z" />
                                  </svg>
                                  <span className="mic-btn-text">CLICK TO SPEAK</span>
                                </button>
                              </div>
                            ) : (
                              <div className="mic-outer-container">
                                <button
                                  type="button"
                                  className="mic-btn"
                                  onClick={stopListening}
                                >
                                  <span className="voice-wave" aria-hidden="true">
                                    <span></span><span></span><span></span><span></span><span></span><span></span><span></span>
                                  </span>
                                </button>
                              </div>
                            )}
                          </div>

                          {spokenTranscript && (
                            <div className="voice-transcript-log">
                              <strong>Spoken:</strong> "{spokenTranscript}"
                            </div>
                          )}

                          {micError && <p className="mic-error-text">{micError}</p>}

                          {/* Manual fallback input */}
                          <div className="voice-fallback-area">
                            <label className="fallback-label">{t("skipVoicePrompt")}</label>
                            <div className="fallback-input-row">
                              <input
                                type="text"
                                placeholder="Type sentence here if mic fails..."
                                value={manualTextFallback}
                                onChange={(e) => setManualTextFallback(e.target.value)}
                              />
                              <button
                                type="button"
                                className="secondary-btn"
                                onClick={() => handleManualTextSubmit(readingTargetText)}
                              >
                                {t("skipVoiceBtn")}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* COMPREHENSION SHUFFLED MCQS */}
                      {isCompMCQ && (
                        <div className="comprehension-q-container">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                            <p className="comprehension-question" style={{ margin: 0, flex: 1, fontWeight: 700, fontSize: "1.2rem" }}>{compQuestionText}</p>
                            <button
                              type="button"
                              className="tts-btn"
                              onClick={() => speakText(compQuestionText)}
                              title="Listen to question"
                            >
                              🔊 {t("listenBtn") || "Listen"}
                            </button>
                          </div>
                          <div className="options-grid">
                            {compOptions.map((opt, idx) => {
                              const isSelected = selectedAnswers[currentStep] === idx;
                              return (
                                <button
                                  key={idx}
                                  type="button"
                                  className={`option-btn ${isSelected ? "selected" : ""}`}
                                  onClick={() => setSelectedAnswers({ ...selectedAnswers, [currentStep]: idx })}
                                >
                                  <span className="option-indicator">{String.fromCharCode(65 + idx)}</span>
                                  <span className="option-label">{opt}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* WRITING DICTATION SECTION */}
                      {isWriting && (
                        <div className="writing-q-container">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', justifyContent: 'space-between', width: '100%' }}>
                            <div style={{ flex: 1 }}>
                              <p className="writing-prompt" style={{ margin: 0, fontWeight: 700, fontSize: "1.2rem" }}>{writingPromptText}</p>
                              <p className="helper-text" style={{ margin: '8px 0 0' }}>{t("dictationTip") || "Press play and write the sentence you hear."}</p>
                            </div>
                            <button
                              type="button"
                              className="tts-btn dictation-play"
                              onClick={() => speakText(dictationText)}
                              title="Listen to the sentence"
                            >
                              🔊 {t("listenBtn") || "Listen"}
                            </button>
                          </div>
                          <textarea
                            className="writing-textarea"
                            placeholder="Write the sentence you heard here..."
                            rows={6}
                            value={writingAnswers[currentStep] || ""}
                            onChange={(e) => setWritingAnswers({ ...writingAnswers, [currentStep]: e.target.value })}
                          />
                          <div className="text-counter">
                            Characters: {(writingAnswers[currentStep] || "").length} | Words: {(writingAnswers[currentStep] || "").split(/\s+/).filter(Boolean).length}
                          </div>
                        </div>
                      )}
                        </>
                      )}</div>

                    <div className="assessment-nav-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', gap: '12px' }}>
                      <div>
                        {currentStep > 0 && (
                          <button
                            type="button"
                            className="secondary-btn nav-btn"
                            onClick={() => {
                              setCurrentStep(currentStep - 1);
                              setSpokenTranscript("");
                              setMicError("");
                              setManualTextFallback("");
                            }}
                          >
                            <span style={{ display: 'inline-block', transform: 'scaleX(-1)' }}>➜</span> {t("prevBtn")}
                          </button>
                        )}
                      </div>

                      <div>
                        {currentStep < assessmentQuestionsList.length - 1 ? (
                          <button
                            type="button"
                            className="primary-btn nav-btn"
                            onClick={handleNextStep}
                            disabled={
                              (isVoiceReading && !readingAttempts[currentStep]) ||
                              (isCompMCQ && selectedAnswers[currentStep] === undefined) ||
                              (isWriting && !(writingAnswers[currentStep] || "").trim())
                            }
                          >
                            {t("nextQuestion")} ➜
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="primary-btn submit-btn"
                            onClick={submitInitialAssessment}
                            disabled={
                              submitting ||
                              (isVoiceReading && !readingAttempts[currentStep]) ||
                              (isCompMCQ && selectedAnswers[currentStep] === undefined) ||
                              (isWriting && !(writingAnswers[currentStep] || "").trim())
                            }
                          >
                            {submitting ? t("submittingAssessment") : t("submitAssessmentBtn")}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* 3. Results feedback state */}
              {assessmentState === "results" && (() => {
                const currentLevelIndex = getLiteracyLevel(profile) || 1;
                const latestAttempt = historyAttempts[0];
                const skillScores = latestAttempt?.skillScores || {};
                const overallPercent = latestAttempt?.percentage || 0;

                // New 6-skill analysis
                const strongKeys = latestAttempt?.strongSkillKeys || getStrongSkillKeys(skillScores);
                const weakKeys = latestAttempt?.weakSkillKeys || getWeakSkillKeys(skillScores);

                // Recommend Daily Practice Time
                let dailyPracticeTime = t("daily15min");
                if (overallPercent >= 90) dailyPracticeTime = t("daily10min");
                else if (overallPercent < 50) dailyPracticeTime = t("daily25min");

                const skillOrder = [
                  { key: "letter_recognition", label: "Letter Recognition", color: "#f59e0b", icon: "🔤" },
                  { key: "word_recognition",   label: "Word Recognition",   color: "#3b82f6", icon: "📝" },
                  { key: "sentence_reading",   label: "Sentence Reading",   color: "#10b981", icon: "📖" },
                  { key: "comprehension",       label: "Comprehension",       color: "#8b5cf6", icon: "🧠" },
                  { key: "writing",             label: "Writing",             color: "#ef4444", icon: "✍️" },
                  { key: "pronunciation",       label: "Pronunciation",       color: "#06b6d4", icon: "🎤" },
                ];


                return (
                  <div className="results-card" style={{ maxWidth: '800px', margin: '20px auto' }}>
                    <h2 className="results-completed-title">{t("resultsTitle")}</h2>
                    <div className="results-hero-section">
                      <div className="results-hero-left">
                        <div className="results-percentage-circle">
                          <span className="percent-val">{latestAttempt?.percentage ? latestAttempt.percentage : 0}%</span>
                        </div>
                        <span className="results-percent-text">{t("percentage")}</span>
                      </div>

                      <div className="results-hero-center-score">
                        <span className="hero-score-label">{t("overallScore")}</span>
                        <span className="hero-score-val">{latestAttempt?.score || 0} / {latestAttempt?.maxScore || 30}</span>
                      </div>

                      <div className="results-hero-right">
                        <img
                          src="/as3.png"
                          alt="LISA mascot"
                          className="assessment-mascot results-mascot-medium"
                        />
                      </div>
                    </div>

                    <div className="results-detail-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      <div className="benchmark-card" style={{ margin: 0 }}>
                        <div className="benchmark-badge-icon">🎖️</div>
                        <h3 className="benchmark-title">{getLevelCategoryAndDescription(currentLevelIndex, currentLang).category}</h3>
                        <p className="benchmark-desc">
                          {getLevelCategoryAndDescription(currentLevelIndex, currentLang).description}
                        </p>
                      </div>

                      <div className="skill-breakdowns-box" style={{ margin: 0 }}>
                        <h3>{t("skillBreakdown")}</h3>
                        <div className="skill-progress-bar">
                          <div className="skill-progress-label">
                            <span>{t("readingSkill")}</span>
                            <span>{latestAttempt?.skills?.reading || 0}%</span>
                          </div>
                          <div className="bar-bg">
                            <div className="bar-fill reading" style={{ width: `${latestAttempt?.skills?.reading || 0}%` }}></div>
                          </div>
                        </div>
                        <div className="skill-progress-bar">
                          <div className="skill-progress-label">
                            <span>{t("compSkill")}</span>
                            <span>{latestAttempt?.skills?.comprehension || 0}%</span>
                          </div>
                          <div className="bar-bg">
                            <div className="bar-fill comprehension" style={{ width: `${latestAttempt?.skills?.comprehension || 0}%` }}></div>
                          </div>
                        </div>
                        <div className="skill-progress-bar">
                          <div className="skill-progress-label">
                            <span>{t("writingSkill")}</span>
                            <span>{latestAttempt?.skills?.writing || 0}%</span>
                          </div>
                          <div className="bar-bg">
                            <div className="bar-fill writing" style={{ width: `${latestAttempt?.skills?.writing || 0}%` }}></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Insights & Recommendations Card */}
                    <div className="insights-card">
                      <div className="insights-card-head">
                        <span className="insights-card-icon">💡</span>
                        <h3>{t("personalizedInsights")}</h3>
                      </div>
                      <div className="insights-grid">
                        <div className="insight-box insight-strong">
                          <div className="insight-badge">🌟</div>
                          <h4>{t("strongAreas")}</h4>
                          <ul>
                            {strongKeys.map((k) => <li key={k}>{t(SKILL_TRANSLATION_KEYS[k])}</li>)}
                          </ul>
                        </div>

                        <div className="insight-box insight-improve">
                          <div className="insight-badge">⚠️</div>
                          <h4>{t("areasToImprove")}</h4>
                          <ul>
                            {weakKeys.length > 0
                              ? weakKeys.map((k) => <li key={k}>{t(SKILL_TRANSLATION_KEYS[k])}</li>)
                              : <li>{t("noAreasToImprove")}</li>}
                          </ul>
                        </div>

                        <div className="insight-box insight-time">
                          <div className="insight-badge">🕒</div>
                          <h4>{t("dailyCommitment")}</h4>
                          <p className="insight-time-val">{dailyPracticeTime}</p>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '32px' }}>
                      <button
                        type="button"
                        className="primary-btn"
                        style={{ background: 'var(--accent)', border: 'none', color: 'white', padding: '12px 24px', borderRadius: '12px', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', flex: 1, maxWidth: '300px' }}
                        onClick={() => {
                          setDashboardTab("learn");
                          setAssessmentState("not_started");
                        }}
                      >
                        🧭 {t("viewLearningPath")}
                      </button>
                      <button
                        type="button"
                        className="secondary-btn"
                        style={{ padding: '12px 24px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', flex: 1, maxWidth: '300px' }}
                        onClick={() => {
                          setAssessmentState("not_started");
                        }}
                      >
                        {t("continueToDashboard")}
                      </button>
                    </div>
                  </div>
                );
              })()}
            </main>
          </div>
        </div>
      );
    }

    return (
      <div className="dashboard-container-new">
        {/* Left Navigation Sidebar */}
        <aside className="dashboard-sidebar">
          <div className="sidebar-logo" style={{ color: 'var(--accent)', cursor: 'default' }}>
            LISA
          </div>
          <div className="sidebar-menu">
            <button
              type="button"
              className={`sidebar-item ${dashboardTab === "dashboard" ? "active" : ""}`}
              onClick={() => setDashboardTab("dashboard")}
            >
              <DashboardIcon /> {t("sidebarDashboard")}
            </button>
            <button
              type="button"
              className={`sidebar-item ${dashboardTab === "learn" ? "active" : ""}`}
              onClick={() => setDashboardTab("learn")}
            >
              <LearnIcon /> {t("sidebarLearn")}
            </button>
            <button
              type="button"
              className={`sidebar-item ${dashboardTab === "practice" ? "active" : ""}`}
              onClick={() => setDashboardTab("practice")}
            >
              <PracticeIcon /> {t("sidebarPractice")}
            </button>
            <button
              type="button"
              className={`sidebar-item ${dashboardTab === "profile" ? "active" : ""}`}
              onClick={() => setDashboardTab("profile")}
              style={{ display: 'flex', alignItems: 'center' }}
            >
              {profileAvatar && profileAvatar.startsWith("http") ? (
                <img 
                  src={profileAvatar} 
                  alt="Profile" 
                  style={{ 
                    width: "28px", 
                    height: "28px", 
                    borderRadius: "50%", 
                    objectFit: "cover", 
                    marginRight: "10px" 
                  }} 
                />
              ) : (
                <ProfileIcon />
              )}
              {t("sidebarProfile")}
            </button>
          </div>
          <div className="sidebar-footer">
            <button
              type="button"
              className="sidebar-item"
              style={{ color: '#ef4444' }}
              onClick={() => handleSignOut()}
            >
              <LogoutIcon /> {t("logout")}
            </button>
          </div>
        </aside>

        {/* Main Content Column */}
        <div className="dashboard-main-content">
          {/* Topbar */}
          <div className="dashboard-topbar">
            <div className="topbar-indicators" style={{ position: 'relative' }}>
              <div 
                className="indicator-pill streak" 
                onClick={() => setStreakPopupOpen(!streakPopupOpen)}
                style={{ cursor: 'pointer', position: 'relative' }}
                ref={streakPopupRef}
              >
                <FlameIcon style={{ color: '#ff4d00' }} /> {streakCount}

                {/* Streak Popup */}
                {streakPopupOpen && (
                  <div 
                    className="streak-popup-overlay" 
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: '0',
                      marginTop: '12px',
                      width: '290px',
                      background: 'var(--panel-strong)',
                      border: '2px solid var(--line)',
                      borderRadius: '16px',
                      boxShadow: 'var(--shadow)',
                      padding: '16px',
                      zIndex: 1000,
                      cursor: 'default'
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', textAlign: 'left' }}>
                      <FlameIcon style={{ width: '28px', height: '28px', color: '#ff4d00', marginRight: 0 }} />
                      <div>
                        <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--text)' }}>{streakCount} Day Streak!</h3>
                        <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: 'var(--muted)' }}>
                          {streakCount > 0 ? "You're doing great! Keep it up." : "Start a lesson to begin your streak!"}
                        </p>
                      </div>
                    </div>

                    {/* Past 7 days grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', textAlign: 'center' }}>
                      {getPastSevenDaysStatus().map((day, idx) => (
                        <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: day.isToday ? 'var(--accent)' : 'var(--muted)' }}>
                            {day.label}
                          </span>
                          <div style={{
                            width: '26px',
                            height: '26px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: day.isCompleted 
                              ? 'linear-gradient(135deg, #ff6b00, #ff4d00)' 
                              : 'rgba(0,0,0,0.05)',
                            color: day.isCompleted ? 'white' : 'var(--muted)',
                            border: day.isToday ? '2px solid var(--accent)' : 'none',
                            fontSize: '0.75rem',
                            fontWeight: 700
                          }}>
                            {day.isCompleted ? '✓' : ''}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="indicator-pill xp"><StarIcon style={{ color: '#f59e0b' }} /> {userXp} XP</div>
            </div>
            {renderThemeToggle()}
            {renderLanguageDropdown(true)}
          </div>

          {/* Main View Area */}
          <main className="dashboard-main-view">
            {/* Dashboard / Home - overview widgets */}
            {dashboardTab === "dashboard" && (
              <div className="dashboard-overview">
                <div className="dashboard-col dashboard-col-left">
                  <div className="dashboard-greeting">
                    <h1>{t("dashboardHello").replace("{name}", profile?.full_name || "Learner")}</h1>
                    <p>{t("dashboardWelcomeBack")}</p>
                  </div>

                   <div className="resume-card">
                     <div className="resume-card-info">
                       <span className="resume-card-label">{t("dashboardContinueLearning")}</span>
                       <h3 className="resume-card-title">{currentUnit?.title || t("dashboardStartLearning")}</h3>
                       <div className="resume-card-sub" style={{ display: 'flex', flexDirection: 'column' }}>
                         <span style={{ fontSize: '0.85rem' }}>
                           {t("dashboardSection")}: {sections[currentUnitPos.sectionIdx]?.title || `${t("dashboardSection")} ${currentUnitPos.sectionIdx + 1}`}
                         </span>
                         <span style={{ 
                           fontSize: '0.78rem', 
                           marginTop: '10px', 
                           whiteSpace: 'nowrap'
                         }}>
                           {t("dashboardUnit")}: {sections[currentUnitPos.sectionIdx]?.units[currentUnitPos.unitIdx]?.title || `${t("dashboardUnit")} ${currentUnitPos.unitIdx + 1}`}
                         </span>
                       </div>
                     </div>
                     <button
                       type="button"
                       className="resume-btn"
                       onClick={() => {
                         setDashboardTab("learn");
                       }}
                     >
                       ▶ {t("dashboardResume")}
                     </button>
                   </div>

                  <div className="word-of-day-card">
                    <div className="word-of-day-head">
                      <span className="word-of-day-label">{t("dashboardWordOfDay")}</span>
                      <button
                        type="button"
                        className="word-of-day-speak"
                        onClick={() => speakWord(wordOfDay.word)}
                        aria-label="Listen to word"
                      >
                        🔊
                      </button>
                    </div>
                    <h3 className="word-of-day-word">{wordOfDay.word}</h3>
                    <div className="word-of-day-block">
                      <span className="word-of-day-heading">Meaning</span>
                      <p className="word-of-day-meaning">
                        {wordOfDay.meaning}
                        <button
                          type="button"
                          className="word-of-day-speak word-of-day-speak-inline"
                          onClick={() => speakText(wordOfDay.meaning || "")}
                          aria-label="Listen to meaning"
                        >
                          🔊
                        </button>
                      </p>
                    </div>
                    <div className="word-of-day-block">
                      <span className="word-of-day-heading">Example</span>
                      <p className="word-of-day-example">
                        "{wordOfDay.example}"
                        <button
                          type="button"
                          className="word-of-day-speak word-of-day-speak-inline"
                          onClick={() => speakText(wordOfDay.example || "")}
                          aria-label="Listen to example"
                        >
                          🔊
                        </button>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="dashboard-col dashboard-col-right">
                  <div className="current-level-card" style={{ 
                    margin: 0,
                    background: `linear-gradient(135deg, ${levelBadgeColor(currentLevelNum)} 0%, ${darkenHex(levelBadgeColor(currentLevelNum), 0.88)} 100%)`,
                    border: `2px solid ${levelBadgeColor(currentLevelNum)}88`,
                    boxShadow: `0 8px 32px ${levelBadgeColor(currentLevelNum)}40`,
                    color: '#ffffff',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    {/* Premium abstract background glow */}
                    <div style={{
                      position: 'absolute',
                      top: '-20px',
                      right: '-20px',
                      width: '120px',
                      height: '120px',
                      borderRadius: '50%',
                      background: 'rgba(255, 255, 255, 0.12)',
                      filter: 'blur(20px)',
                      pointerEvents: 'none'
                    }} />
                    <div className="current-level-header">
                      <h3 className="current-level-title" style={{ color: '#ffffff', textShadow: '0 2px 4px rgba(0,0,0,0.15)' }}>{t("dashboardCurrentLevel")}</h3>
                    </div>
                    <div className="current-level-body">
                      <div className="current-level-badge" style={{ background: 'rgba(255, 255, 255, 0.25)', border: '2px solid rgba(255, 255, 255, 0.4)' }}>
                        <span className="current-level-badge-icon">{levelBadgeIcon(currentLevelNum)}</span>
                        <span className="current-level-badge-level" style={{ color: '#ffffff', fontWeight: '900' }}>{t("level").toUpperCase()} {currentLevelNum}</span>
                      </div>
                      <div className="current-level-info">
                        <p className="current-level-name" style={{ color: '#ffffff', textShadow: '0 2px 4px rgba(0,0,0,0.15)' }}>{getLevelCategoryAndDescription(currentLevelNum, selectedLanguage).category}</p>
                        <p className="current-level-msg" style={{ color: 'rgba(255, 255, 255, 0.9)', fontWeight: '500' }}>{getLevelEncouragementMessage(currentLevelNum)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="dashboard-overview-row">
                    <div className="streak-widget-card streak-society-card" style={{ margin: 0 }}>
                      <div className="streak-society-header">
                        <span className="streak-society-badge">{t("dashboardStreakSociety").toUpperCase()}</span>
                        <div className="streak-society-icon"><FlameIcon style={{ width: "36px", height: "36px", color: '#ff4d00', marginRight: 0 }} /></div>
                      </div>
                      <h4 className="streak-society-title">{streakCount} {t("dashboardDayStreak")}</h4>
                      <p className="streak-society-message">{getStreakMessage(streakCount)}</p>
                    </div>

                    <div className="daily-quests-card" style={{ margin: 0 }}>
                      <div className="daily-quests-header">
                        <h3>{t("dashboardDailyQuests")}</h3>
                        {activeQuests.length > 0 && activeQuests.every(q => getQuestProgress(q).completed) ? (
                          <span className="daily-quests-timer" style={{ background: '#d1fae5', color: '#10b981' }}>✓ ALL COMPLETED</span>
                        ) : (
                          <span className="daily-quests-timer">{timeLeftStr.toUpperCase()} LEFT</span>
                        )}
                      </div>
                      <div className="quest-list" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {activeQuests.map((quest) => {
                          const prog = getQuestProgress(quest);
                          return (
                            <div key={quest.id} className="quest-item" style={{ 
                              gap: '10px', 
                              padding: '12px',
                              opacity: prog.completed ? 0.65 : 1,
                              background: prog.completed ? 'var(--line)' : '#fafafa',
                              borderColor: prog.completed ? 'transparent' : 'rgba(0, 0, 0, 0.04)'
                            }}>
                              <div className="quest-icon" style={{ width: '32px', height: '32px', borderRadius: '8px' }}>
                                {quest.type === 'xp' && (
                                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle' }}>
                                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                                  </svg>
                                )}
                                {quest.type === 'time' && (
                                  <ClockIcon style={{ color: '#3b82f6', marginRight: 0, width: '20px', height: '20px' }} />
                                )}
                                {quest.type === 'lessons' && (
                                  <BookIcon style={{ color: '#10b981', marginRight: 0, width: '20px', height: '20px' }} />
                                )}
                              </div>
                              <div className="quest-content">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                                  <span style={{ fontWeight: '700', fontSize: '0.85rem', color: 'var(--text)', whiteSpace: 'nowrap', textDecoration: prog.completed ? 'line-through' : 'none' }}>
                                    {quest.title}
                                  </span>
                                  <span style={{ fontWeight: '800', fontSize: '0.85rem', color: 'var(--accent)', whiteSpace: 'nowrap' }}>
                                    {prog.displayProgress}
                                  </span>
                                </div>
                                <div className="quest-progress-bg">
                                  <div className="quest-progress-fill" style={{ 
                                    width: `${prog.percent}%`,
                                    background: prog.completed ? '#9ca3af' : '#f59e0b'
                                  }}></div>
                                </div>
                              </div>
                              <div className="quest-reward" style={{ display: 'grid', placeItems: 'center' }}>
                                {prog.completed ? (
                                  <div style={{
                                    width: '22px',
                                    height: '22px',
                                    borderRadius: '50%',
                                    background: '#10b981',
                                    color: 'white',
                                    display: 'grid',
                                    placeItems: 'center',
                                    fontWeight: 'bold',
                                    fontSize: '0.8rem'
                                  }}>✓</div>
                                ) : (
                                  <TrophyIcon style={{ color: '#8b8d96', marginRight: 0, width: '20px', height: '20px' }} />
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="achievements-card" style={{ margin: 0 }}>
                    <div className="achievements-card-header">
                      <h4>{t("badgesEarned")}</h4>
                      <button className="achievements-view-all" onClick={() => setShowAllAchievementsModal(true)}>{t("dashboardViewAll")}</button>
                    </div>
                    <div className="achievements-list">
                      {(() => {
                        const achievementsList = [
                          { id: 1, title: "First Steps", desc: "Complete your first assessment", icon: "⭐", earned: true, color: "#f59e0b", progress: 100 },
                          { id: 2, title: "Reading Star", desc: "Score 75% or higher in reading", icon: "📚", earned: calculateSkillProficiency("reading") >= 75, color: "#3b82f6", progress: Math.min(100, Math.round(calculateSkillProficiency("reading"))) },
                          { id: 3, title: "Comprehension Pro", desc: "Score 75% or higher in comprehension", icon: "🧠", earned: calculateSkillProficiency("comprehension") >= 75, color: "#10b981", progress: Math.min(100, Math.round(calculateSkillProficiency("comprehension"))) },
                          { id: 4, title: "Wordsmith", desc: "Score 75% or higher in writing", icon: "✍️", earned: calculateSkillProficiency("writing") >= 75, color: "#a855f7", progress: Math.min(100, Math.round(calculateSkillProficiency("writing"))) },
                          { id: 5, title: "XP Collector", desc: "Earn 100 XP or more", icon: "💎", earned: userXp >= 100, color: "#e11d48", progress: Math.min(100, Math.round((userXp / 100) * 100)) },
                          { id: 6, title: "Dedicated Learner", desc: "Complete 3 lessons or more", icon: "🔥", earned: completedLessons.filter(id => !id.startsWith("ach_")).length >= 3, color: "#f97316", progress: Math.min(100, Math.round((completedLessons.filter(id => !id.startsWith("ach_")).length / 3) * 100)) },
                          { id: 7, title: "Speech Maestro", desc: "Score 75% or higher in pronunciation", icon: "🗣️", earned: calculateSkillProficiency("pronunciation") >= 75, color: "#06b6d4", progress: Math.min(100, Math.round(calculateSkillProficiency("pronunciation"))) },
                          { id: 8, title: "Elite Scholar", desc: "Reach Progressive Level 8", icon: "🎓", earned: currentLevelNum >= 8, color: "#8b5cf6", progress: Math.min(100, Math.round((currentLevelNum / 8) * 100)) },
                          { id: 9, title: "Grandmaster", desc: "Reach Progressive Level 12", icon: "👑", earned: currentLevelNum >= 12, color: "#ef4444", progress: Math.min(100, Math.round((currentLevelNum / 12) * 100)) },
                        ];

                        // Find chronologically earned achievements from completed_lessons order
                        const earnedAchievementIds = completedLessons
                          .filter(id => id.startsWith("ach_"))
                          .map(id => parseInt(id.replace("ach_", ""), 10));

                        // Find corresponding badge definitions
                        const earnedList = earnedAchievementIds
                          .map(id => achievementsList.find(a => a.id === id))
                          .filter(Boolean);

                        // Display only the last 2 recently earned badges, or the first two items in general if none earned yet
                        const displayedList = earnedList.length > 0 
                          ? earnedList.slice(-2) 
                          : achievementsList.slice(0, 2);

                        return displayedList.map((a) => (
                          <div key={a.id} className={`achievement-row ${a.earned ? "earned" : ""}`}>
                            <div className="achievement-badge-box" style={{ background: a.earned ? a.color : 'var(--line)' }}>
                              <span className="achievement-badge-icon">{a.earned ? a.icon : '🔒'}</span>
                            </div>
                            <div className="achievement-info">
                              <div className="achievement-info-header">
                                <span className="achievement-title">{a.title}</span>
                              </div>
                              <p className="achievement-desc">{a.desc}</p>
                              <div className="achievement-progress-track">
                                <div className="achievement-progress-fill" style={{ width: `${a.progress}%`, background: '#facc15' }}></div>
                              </div>
                            </div>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3.1. Learn Tab — Duolingo-style Continuous Curriculum Path */}
            {dashboardTab === "learn" && (() => {
              const storedSkills = (() => { try { const s = getStoredAssessmentState(session?.user?.id); return s?.skill_scores || profile?.skill_scores || {}; } catch { return {}; } })();
              const weakSkillLabels = getWeakSkills(storedSkills);

              // Render all sections sequentially in standard order (1 to 7) per spec
              const orderedSections = CURRICULUM_SECTIONS; 

              // Build a flat ordered list of all lessons in the curriculum for chain unlocking
              const allLessonsList = [];
              orderedSections.forEach((sec) => {
                sec.units.forEach((uni) => {
                  uni.lessons.forEach((les) => {
                    allLessonsList.push(les.id);
                  });
                });
              });

              // Determine starting lesson index based on diagnosed literacy level (per Spec mapping 1-5 levels)
              const startingLessonId = (() => {
                const level = profile?.literacy_level || 1;
                if (level === 2) return "s2u1l1";
                if (level === 3) return "s3u1l1";
                if (level === 4) return "s5u1l1";
                if (level === 5) return "s7u1l1";
                return "s1u1l1"; // Default/Level 1
              })();

              const startingLessonIndex = allLessonsList.indexOf(startingLessonId);

              let unitCounter = 0;

              return (
                <div className="duo-learn-container" ref={learnJourneyRef}>
                  {orderedSections.map((section, secIdx) => {
                    const isSectionRecommended = weakSkillLabels.some(w => w.toLowerCase().includes(section.skillTarget?.replace("_", " ") || ""));

                    return (
                      <div key={section.id} className="duo-section-block">
                        {/* Section Checkpoint Header */}
                        <div className="duo-section-banner" style={{ background: `linear-gradient(135deg, ${section.color} 0%, ${section.color}cc 100%)`, boxShadow: `0 8px 24px ${section.color}33` }}>
                          <span className="duo-section-banner-icon">{section.icon}</span>
                          <div className="duo-section-banner-text">
                            <span className="duo-section-banner-meta">Section {section.num} of {orderedSections.length}</span>
                            <h2 className="duo-section-banner-title">{section.title}</h2>
                          </div>
                          {isSectionRecommended && (
                            <span className="duo-section-badge">⭐ Recommended</span>
                          )}
                        </div>

                        {section.units.map((unit) => {
                          const unitLessons = unit.lessons;
                          const completedInUnit = unitLessons.filter(l => completedLessons.includes(l.id)).length;
                          const currentUnitIndex = unitCounter++;
                          const mascotNum = (currentUnitIndex % 4) + 1;
                          const sideClass = currentUnitIndex % 2 === 0 ? "mascot-left" : "mascot-right";

                          return (
                            <div key={unit.id} className="duo-unit-block">
                              <div className="duo-unit-header">
                                <h3 className="duo-unit-title">Unit {unit.num}</h3>
                                <span className="duo-unit-topic">{unit.title}</span>
                                <span className="duo-unit-progress">{completedInUnit}/{unitLessons.length} Done</span>
                              </div>

                              {/* Centered Snaking Lesson Path */}
                              <div className="duo-lessons-path" style={{ position: 'relative' }}>
                                <div className="duo-path-line"></div>
                                
                                {/* Mascot on alternating sides per unit */}
                                <div className={`duo-path-mascot ${sideClass}`}>
                                  <img 
                                    src={`/as${mascotNum}.png`} 
                                    alt="LISA Mascot" 
                                    style={{ width: '130px', height: '130px', objectFit: 'contain' }} 
                                  />
                                </div>
                                
                                {unitLessons.map((lesson, lIdx) => {
                                  const isCompleted = completedLessons.includes(lesson.id);
                                  const lessonIndexInCurriculum = allLessonsList.indexOf(lesson.id);
                                  const isUnlocked = lessonIndexInCurriculum <= startingLessonIndex || completedLessons.includes(allLessonsList[lessonIndexInCurriculum - 1]);
                                  const status = isCompleted ? "completed" : isUnlocked ? "unlocked" : "locked";
                                  const lessonXp = lIdx === 4 ? 60 : 15;

                                  // Calculate snaking offset class
                                  // Path: Center -> Right -> Center -> Left -> Repeat
                                  const snakePositions = ["snake-center", "snake-right", "snake-center", "snake-left"];
                                  const snakeClass = snakePositions[lIdx % 4];

                                  const isPopupOpen = activeLessonPopup === lesson.id;

                                  // Find the active resumed lesson ID (starting from their diagnosed level)
                                  const currentActiveLessonId = allLessonsList.slice(startingLessonIndex).find(id => !completedLessons.includes(id)) || allLessonsList[0];
                                  const isActiveNode = lesson.id === currentActiveLessonId;

                                  return (
                                    <div 
                                      key={lesson.id} 
                                      className={`duo-node-container ${snakeClass} ${status}`}
                                      style={{ zIndex: isPopupOpen ? 1100 : 2 }}
                                      ref={isActiveNode ? activeNodeRef : null}
                                    >
                                      {/* Circular Checkpoint Node */}
                                      <button
                                        type="button"
                                        className={`duo-node-circle ${status}`}
                                        style={{ 
                                          background: isCompleted ? '#10b981' : isUnlocked ? section.color : undefined
                                        }}
                                        onClick={() => {
                                          if (activeLessonPopup === lesson.id) {
                                            setActiveLessonPopup(null);
                                          } else {
                                            setActiveLessonPopup(lesson.id);
                                          }
                                        }}
                                      >
                                        <span className="duo-node-icon" style={{ color: isCompleted || isUnlocked ? 'white' : 'var(--muted)' }}>
                                          {isCompleted ? '✓' : lesson.icon || '📚'}
                                        </span>
                                      </button>

                                      {/* Duolingo Info Popover */}
                                      {isPopupOpen && (
                                        <div className="duo-popover-card">
                                          <div className="duo-popover-header">
                                            <span className="duo-popover-badge" style={{ 
                                              background: isCompleted ? 'rgba(16, 185, 129, 0.15)' : isUnlocked ? `${section.color}22` : 'rgba(120, 120, 120, 0.15)',
                                              color: isCompleted ? '#0f9d6b' : isUnlocked ? section.color : '#8a8f98'
                                            }}>
                                              {status === "completed" ? "✓ Done" : status === "unlocked" ? "Ready" : "🔒 Locked"}
                                            </span>
                                            <span className="duo-popover-xp">+{lessonXp} XP</span>
                                          </div>
                                          <h4 className="duo-popover-title">{unit.title} — {lIdx === 4 ? "Unit Exam" : `Lesson ${lIdx + 1}`}</h4>
                                          <p className="duo-popover-desc">
                                            {lIdx === 4 
                                              ? "A comprehensive unit exam testing skills from the first 4 lessons." 
                                              : "Personalized AI lesson targeting your curriculum goals."}
                                          </p>
                                          
                                          <button
                                            type="button"
                                            className="duo-popover-btn"
                                            disabled={status === "locked" || lessonLoading}
                                            onClick={() => {
                                              setActiveLessonPopup(null);
                                              startLessonSession(lesson, section, unit);
                                            }}
                                            style={{ 
                                              background: isCompleted ? '#10b981' : isUnlocked ? section.color : '#6b7280',
                                              boxShadow: isCompleted ? '0 4px 12px rgba(16, 185, 129, 0.3)' : isUnlocked ? `0 4px 12px ${section.color}55` : 'none'
                                            }}
                                          >
                                            {lIdx === 4 
                                              ? (status === "completed" ? "Review Exam" : "Start Exam") 
                                              : (status === "completed" ? "Review Lesson" : "Start Lesson")}
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}

                  {/* Floating Scroll to Top button */}
                  <button 
                    type="button" 
                    className="scroll-top-btn"
                    onClick={() => {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                      learnJourneyRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                    title="Scroll to Top"
                    aria-label="Scroll to top of learning path"
                  >
                    ↑
                  </button>
                </div>
              );
            })()}


            {/* 3.2. Practice Tab */}
            {dashboardTab === "practice" && (
              <div className="practice-grid-layout">
                {/* Left/Center Column - Custom Practice Sections */}
                <div className="practice-content-column">

                  {/* Today's Review Section */}
                  <div className="practice-section">
                    <h2 className="practice-section-title">{t("practiceTodaysReview")}</h2>
                    <div className="perfect-pronunciation-card" onClick={() => startLessonSession({ id: `l${currentLevelNum}_read_practice`, title: "Perfect Pronunciation", desc: "Speak out sentences aloud" })}>
                      <div className="perfect-pronunciation-info">
                        <h3 className="perfect-pronunciation-title">{t("practicePerfectPronunciation")}</h3>
                        <p className="perfect-pronunciation-desc">{t("practicePerfectPronunciationDesc")}</p>
                        <button type="button" className="perfect-pronunciation-btn">{t("practiceStart")}</button>
                      </div>
                      <img src="/as4.png" alt="Mascot" className="perfect-pronunciation-mascot" />
                    </div>
                  </div>

                  {/* Conversation Section */}
                  <div className="practice-section">
                    <h2 className="practice-section-title">{t("practiceConversation")}</h2>
                    <div className="practice-row-cards">
                      <div className="practice-row-card" onClick={() => startLessonSession({ id: `l${currentLevelNum}_read_practice`, title: "Speak Practice", desc: "Improve your speaking skills with these phrases" })}>
                        <div className="practice-row-card-content">
                          <h3 className="practice-row-card-title">Speak</h3>
                          <p className="practice-row-card-desc">{t("practiceSpeakDesc")}</p>
                        </div>
                        <div className="practice-row-card-icon speak-icon">🎙️</div>
                      </div>
                      <div className="practice-row-card" onClick={() => startLessonSession({ id: `l${currentLevelNum}_write_practice`, title: "Listen Practice", desc: "Boost your listening skills with an audio-only session" })}>
                        <div className="practice-row-card-content">
                          <h3 className="practice-row-card-title">Listen</h3>
                          <p className="practice-row-card-desc">{t("practiceListenDesc")}</p>
                        </div>
                        <div className="practice-row-card-icon listen-icon">🎧</div>
                      </div>
                    </div>
                  </div>

                  {/* Your collections Section */}
                  <div className="practice-section">
                    <h2 className="practice-section-title">{t("practiceYourCollections")}</h2>
                    <div className="practice-row-cards">
                      <div className="practice-row-card" onClick={() => startLessonSession({ id: `l${currentLevelNum}_write_practice`, title: "Mistakes Practice", desc: "Start a personalized lesson to practice your mistakes" })}>
                        <div className="practice-row-card-content">
                          <h3 className="practice-row-card-title">
                            {t("practiceMistakes")}
                            <span className="practice-badge">7</span>
                          </h3>
                          <p className="practice-row-card-desc">{t("practiceMistakesDesc")}</p>
                        </div>
                        <div className="practice-row-card-icon mistakes-icon">🔄</div>
                      </div>

                      <div className="practice-row-card" onClick={() => startLessonSession({ id: `l${currentLevelNum}_write_practice`, title: "Words Practice", desc: "Review your vocabulary at any time" })}>
                        <div className="practice-row-card-content">
                          <h3 className="practice-row-card-title">
                            {t("practiceWords")}
                            <span className="practice-badge">30+</span>
                          </h3>
                          <p className="practice-row-card-desc">{t("practiceWordsDesc")}</p>
                        </div>
                        <div className="practice-row-card-icon words-icon">✨</div>
                      </div>

                      <div className="practice-row-card" onClick={() => startLessonSession({ id: `l${currentLevelNum}_comp_practice`, title: "Stories Practice", desc: "Reread a story to review words in context" })}>
                        <div className="practice-row-card-content">
                          <h3 className="practice-row-card-title">Stories</h3>
                          <p className="practice-row-card-desc">{t("practiceStoriesDesc")}</p>
                        </div>
                        <div className="practice-row-card-icon stories-icon">📖</div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* 3.3. Profile Tab */}
            {dashboardTab === "profile" && (
              <div className="profile-view-container">
                <div className="profile-card-large">
                  <div 
                    className="profile-avatar-large" 
                    style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      justifyContent: "center", 
                      overflow: "hidden",
                      position: "relative",
                      border: "4px solid var(--accent)",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.12)"
                    }}
                  >
                    {profileAvatar && profileAvatar.startsWith("http") ? (
                      <img src={profileAvatar} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      getUserInitials(profile?.full_name)
                    )}

                    {/* Direct Image File Uploader Input */}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      disabled={submitting}
                      style={{ display: "none" }}
                      id="direct-avatar-upload-file"
                    />
                    
                    {/* Pencil Edit Badge overlay at bottom right */}
                    <label 
                      htmlFor="direct-avatar-upload-file" 
                      style={{
                        position: "absolute",
                        bottom: "4px",
                        right: "4px",
                        width: "28px",
                        height: "28px",
                        borderRadius: "50%",
                        background: "var(--accent)",
                        color: "white",
                        display: "grid",
                        placeItems: "center",
                        cursor: "pointer",
                        fontSize: "0.75rem",
                        boxShadow: "0 4px 10px rgba(0,0,0,0.25)",
                        transition: "all 0.15s ease",
                        border: "none"
                      }}
                      title={submitting ? "Uploading image..." : "Upload Profile Picture"}
                      className="profile-avatar-edit-badge"
                    >
                      {submitting ? "⏳" : "✏️"}
                    </label>
                  </div>
                  <div className="profile-info-large">
                    <h2>{profile?.full_name || "Learner"}</h2>
                    <p>{session.user.email}</p>
                    <div style={{ display: "flex", gap: "16px", marginTop: "12px" }}>
                      <span style={{ fontWeight: 700 }}>Age: {profile?.age || "N/A"}</span>
                      <span style={{ fontWeight: 700 }}>Education: {profile?.education_level || "N/A"}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px" }}>
                  <div className="achievements-card" style={{ margin: 0, padding: "24px" }}>
                    <h3 style={{ fontSize: "1.2rem", fontWeight: 800, marginBottom: "20px" }}>Update Profile Settings</h3>
                    <form onSubmit={handleSaveProfileEdit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      <label className="profile-dropdown-label">
                        Full Name
                        <input
                          type="text"
                          required
                          value={editFullName}
                          onChange={(e) => setEditFullName(e.target.value)}
                          style={{ width: "100%", boxSizing: "border-box" }}
                        />
                      </label>
                      <label className="profile-dropdown-label">
                        Age
                        <input
                          type="number"
                          min="5"
                          max="120"
                          required
                          value={editAge}
                          onChange={(e) => setEditAge(e.target.value)}
                          style={{ width: "100%", boxSizing: "border-box" }}
                        />
                      </label>
                      <label className="profile-dropdown-label">
                        Preferred Language
                        <select
                          required
                          value={editPreferredLang}
                          onChange={(e) => setEditPreferredLang(e.target.value)}
                          style={{ width: "100%", boxSizing: "border-box" }}
                        >
                          {languages.map((l) => (
                            <option key={l} value={l}>{t(l + "Option")}</option>
                          ))}
                        </select>
                      </label>
                      <label className="profile-dropdown-label">
                        Current Education Status
                        <select
                          required
                          value={editEdLevel}
                          onChange={(e) => setEditEdLevel(e.target.value)}
                          style={{ width: "100%", boxSizing: "border-box" }}
                        >
                          {educationLevels.map((ed) => (
                            <option key={ed} value={ed}>{t(ed + "Option")}</option>
                          ))}
                        </select>
                      </label>
                      <button type="submit" className="primary-btn" disabled={submitting}>
                        {submitting ? "Saving..." : "Save Changes"}
                      </button>
                    </form>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                     <div className="current-level-card" style={{ margin: 0, padding: "24px", background: '#5e4a87' }}>
                      <h3 className="current-level-title">Diagnostic & Dev Control</h3>
                      <p style={{ fontSize: "0.85rem", color: "#ffffff", marginBottom: "16px" }}>Manage diagnostic state or clear developer progress milestones.</p>
                      <button
                        type="button"
                        className="secondary-btn"
                        style={{ borderColor: "#ff1a1a", color: "#ff1a1a", width: "100%", marginBottom: "12px" }}
                        onClick={() => handleResetAssessmentStatus()}
                      >
                        Reset Assessment Status
                      </button>
                      <button
                        type="button"
                        className="secondary-btn"
                        style={{ borderColor: "#e67e22", color: "#e67e22", width: "100%" }}
                        onClick={() => handleResetLessons()}
                      >
                        {t("profileResetLessons")}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>

        {/* 4. AI Lesson Session Overlay */}
        {(lessonLoading || lessonSession) && (
          <div className="lesson-overlay-screen">
            <div className="lesson-overlay-header">
              <div className="lesson-overlay-header-content">
                <button className="lesson-overlay-close" onClick={() => { setLessonSession(null); setLessonAiContent(null); setLessonLoading(false); setLessonStep(0); }}>✕</button>
                <div className="lesson-progress-container">
                  <div className="lesson-progress-bar" style={{ width: lessonSession?.status === "completed" ? "100%" : `${(lessonStep / 4) * 100}%` }}></div>
                </div>
                <div className="lesson-overlay-controls">
                  <div style={{ fontWeight: 800, whiteSpace: "nowrap" }}>XP +15</div>
                  {renderThemeToggle()}
                </div>
              </div>
            </div>

            <div className="lesson-overlay-body">
              {/* Loading state */}
              {lessonLoading && (
                <div className="ai-lesson-loading">
                  <div className="ai-spinner"></div>
                  <h3>🤖 LISA is generating your personalized lesson...</h3>
                  <p>Powered by Gemini AI — creating content just for you</p>
                </div>
              )}

              {/* Lesson Complete */}
              {!lessonLoading && lessonSession?.status === "completed" && (
                <div style={{ textAlign: "center", maxWidth: "480px", padding: "32px" }}>
                  <div style={{ fontSize: "4rem", marginBottom: "16px" }}>🎉</div>
                  <h2 style={{ fontSize: "2rem", fontWeight: 800, color: "#10b981", marginBottom: "12px" }}>Lesson Complete!</h2>
                  <p style={{ fontSize: "1.1rem", color: "var(--muted)", marginBottom: "8px" }}>{lessonAiContent?.aiFeedbackPositive || "Great job! You earned 15 XP!"}</p>
                  <p style={{ fontSize: "0.9rem", color: "var(--muted)", marginBottom: "28px" }}>Section: {lessonSession.sectionTitle} · Unit: {lessonSession.unitTitle}</p>
                  <button className="primary-btn" style={{ width: "100%", padding: "14px", marginBottom: "12px" }} onClick={() => { setLessonSession(null); setLessonAiContent(null); setLessonStep(0); }}>
                    ✓ Continue Learning
                  </button>
                </div>
              )}

              {/* Active Lesson Steps */}
              {!lessonLoading && lessonSession && lessonSession.status !== "completed" && lessonAiContent && (() => {
                const ai = lessonAiContent;
                if (lessonSession?.isPractice) {
                  return renderPracticeSession(ai);
                }

                return (
                  <div className="ai-lesson-content">
                    {/* Step 0: Explanation */}
                    {lessonStep === 0 && (
                      <div className="ai-lesson-step">
                        <div className="ai-lesson-step-header">
                          <span className="ai-step-badge">📖 Lesson Explanation</span>
                          <h3>{ai.lessonTitle}</h3>
                          <p style={{ color: 'var(--accent)', fontWeight: 600 }}>Skill Focus: {ai.skillFocus}</p>
                        </div>

                        {/* Mascot & Speech bubble */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '24px',
                          margin: '24px 0'
                        }}>
                          {/* Mascot */}
                          <div style={{ flexShrink: 0 }}>
                            <img 
                              src="/as1.png" 
                              alt="LISA Mascot" 
                              style={{ width: '120px', height: '120px', objectFit: 'contain' }}
                            />
                          </div>
                          {/* Speech bubble */}
                          <div style={{
                            flexGrow: 1,
                            background: 'var(--panel)',
                            border: '2px solid var(--line)',
                            borderRadius: '24px',
                            padding: '20px',
                            position: 'relative'
                          }}>
                            {/* Speech bubble tail */}
                            <div style={{
                              position: 'absolute',
                              left: '-10px',
                              top: '40px',
                              width: '16px',
                              height: '16px',
                              background: 'var(--panel)',
                              borderLeft: '2px solid var(--line)',
                              borderBottom: '2px solid var(--line)',
                              transform: 'rotate(45deg)'
                            }}></div>
                            
                            <div className="ai-lesson-explanation" style={{ fontSize: '1.05rem', lineHeight: '1.6', margin: 0 }}>
                              {ai.explanation?.split("\n").map((para, i) => para.trim() && <p key={i} style={{ margin: '0 0 10px 0' }}>{para}</p>)}
                            </div>
                          </div>
                        </div>

                        {/* Audio Example Cards */}
                        {ai.examples?.length > 0 && (
                          <div className="ai-lesson-examples" style={{ margin: '24px 0' }}>
                            <h4 style={{ marginBottom: '16px', fontWeight: '800' }}>Examples (Tap to listen)</h4>
                            <div style={{
                              display: 'grid',
                              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                              gap: '16px'
                            }}>
                              {ai.examples.map((ex, i) => (
                                <div 
                                  key={i} 
                                  className="ai-example-card"
                                  style={{
                                    border: '2px solid var(--line)',
                                    borderRadius: '16px',
                                    padding: '16px',
                                    background: 'var(--panel)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '14px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    boxShadow: '0 4px 6px rgba(0,0,0,0.03)'
                                  }}
                                  onClick={() => speakText(ex.text)}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = 'var(--accent)';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = 'var(--line)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                  }}
                                >
                                  <button 
                                    type="button" 
                                    className="tts-btn" 
                                    style={{
                                      background: 'var(--accent)',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: '50%',
                                      width: '36px',
                                      height: '36px',
                                      display: 'grid',
                                      placeItems: 'center',
                                      cursor: 'pointer',
                                      flexShrink: 0
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      speakText(ex.text);
                                    }}
                                  >
                                    🔊
                                  </button>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <span className="ai-example-text" style={{ fontWeight: '700', fontSize: '1.1rem' }}>{ex.text}</span>
                                    {ex.translation && <span className="ai-example-trans" style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>{ex.translation}</span>}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Highlighted Tip Banner */}
                        {ai.guidedPractice && (
                          <div className="ai-lesson-tip" style={{
                            background: 'rgba(245, 158, 11, 0.1)',
                            border: '2px dashed #f59e0b',
                            borderRadius: '16px',
                            padding: '16px 20px',
                            margin: '24px 0',
                            display: 'flex',
                            gap: '12px',
                            alignItems: 'center'
                          }}>
                            <span style={{ fontSize: '1.5rem' }}>💡</span>
                            <div style={{ color: '#b45309', fontSize: '0.95rem' }}>
                              <strong style={{ display: 'block', marginBottom: '2px', fontWeight: '800' }}>Guided Tip:</strong> 
                              {ai.guidedPractice}
                            </div>
                          </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                          <button
                            type="button"
                            className="primary-btn"
                            style={{
                              background: 'var(--accent)',
                              color: 'white',
                              border: 'none',
                              padding: '12px 30px',
                              borderRadius: '12px',
                              fontWeight: '800',
                              cursor: 'pointer'
                            }}
                            onClick={() => setLessonStep(1)}
                          >
                            Continue
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Step 1: MCQs */}
                    {lessonStep === 1 && ai.mcqs?.length > 0 && (() => {
                      const q = ai.mcqs[lessonMcqIndex];
                      const selected = lessonMcqAnswers[lessonMcqIndex];
                      const isAnswered = selected !== undefined;
                      const isCorrect = isAnswered && selected === q.correctIndex;

                      return (
                        <div className="ai-lesson-step" style={{ paddingBottom: '120px' }}>
                          <div className="ai-lesson-step-header" style={{ marginBottom: '16px' }}>
                            <span className="ai-step-badge">🎯 Multiple Choice (Question {lessonMcqIndex + 1} of {ai.mcqs.length})</span>
                          </div>
                          
                          {/* Mascot & Speech bubble */}
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '20px',
                            margin: '20px 0'
                          }}>
                            {/* Mascot */}
                            <div style={{ flexShrink: 0 }}>
                              <img 
                                src="/as1.png" 
                                alt="LISA Mascot" 
                                style={{ width: '80px', height: '80px', objectFit: 'contain' }}
                              />
                            </div>
                            {/* Speech bubble */}
                            <div style={{
                              flexGrow: 1,
                              background: 'var(--panel)',
                              border: '2px solid var(--line)',
                              borderRadius: '20px',
                              padding: '16px 24px',
                              position: 'relative'
                            }}>
                              <div style={{
                                position: 'absolute',
                                left: '-9px',
                                top: '32px',
                                width: '14px',
                                height: '14px',
                                background: 'var(--panel)',
                                borderLeft: '2px solid var(--line)',
                                borderBottom: '2px solid var(--line)',
                                transform: 'rotate(45deg)'
                              }}></div>
                              <h3 style={{ fontSize: '1.4rem', fontWeight: '800', margin: 0 }}>{q.question}</h3>
                            </div>
                          </div>
                          
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: '16px',
                            margin: '30px 0'
                          }}>
                            {q.options.map((opt, oIdx) => {
                              const isSelectedOption = selected === oIdx;
                              let btnBg = 'var(--panel)';
                              let btnBorder = '2px solid var(--line)';
                              let btnColor = 'var(--text)';
                              let badgeBg = 'var(--line)';
                              let badgeColor = 'var(--text)';

                              if (isAnswered) {
                                if (oIdx === q.correctIndex) {
                                  btnBg = 'rgba(16, 185, 129, 0.1)';
                                  btnBorder = '2px solid #10b981';
                                  btnColor = '#065f46';
                                  badgeBg = '#10b981';
                                  badgeColor = 'white';
                                } else if (isSelectedOption) {
                                  btnBg = 'rgba(239, 68, 68, 0.1)';
                                  btnBorder = '2px solid #ef4444';
                                  btnColor = '#991b1b';
                                  badgeBg = '#ef4444';
                                  badgeColor = 'white';
                                } else {
                                  btnColor = 'var(--muted)';
                                }
                              } else if (isSelectedOption) {
                                btnBorder = '2px solid var(--accent)';
                                btnColor = 'var(--accent-dark)';
                                badgeBg = 'var(--accent)';
                                badgeColor = 'white';
                              }

                              return (
                                <button
                                  key={oIdx}
                                  type="button"
                                  style={{
                                    background: btnBg,
                                    border: btnBorder,
                                    color: btnColor,
                                    opacity: 1,
                                    WebkitTextFillColor: btnColor,
                                    borderRadius: '16px',
                                    padding: '20px',
                                    fontSize: '1.1rem',
                                    fontWeight: '600',
                                    cursor: isAnswered ? 'default' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    transition: 'all 0.2s ease',
                                    textAlign: 'left'
                                  }}
                                  onClick={() => {
                                    if (!isAnswered) {
                                      checkLessonMcq(lessonMcqIndex, oIdx);
                                      const correct = oIdx === q.correctIndex;
                                      setLessonMcqFeedback({
                                        isCorrect: correct,
                                        title: correct ? "Excellent!" : "Incorrect",
                                        explanation: q.explanation
                                      });
                                    }
                                  }}
                                  disabled={isAnswered}
                                >
                                  <span style={{
                                    background: badgeBg,
                                    color: badgeColor,
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '8px',
                                    display: 'grid',
                                    placeItems: 'center',
                                    fontWeight: '800'
                                  }}>
                                    {String.fromCharCode(65 + oIdx)}
                                  </span>
                                  <span>{opt}</span>
                                </button>
                              );
                            })}
                          </div>

                          {/* Duolingo style bottom feedback bar */}
                          {lessonMcqFeedback && (
                            <div style={{
                              position: 'absolute',
                              bottom: 0,
                              left: 0,
                              right: 0,
                              background: lessonMcqFeedback.isCorrect ? '#d1fae5' : '#fee2e2',
                              borderTop: `2px solid ${lessonMcqFeedback.isCorrect ? '#10b981' : '#ef4444'}`,
                              padding: '20px 40px',
                              zIndex: 100
                            }}>
                              <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                width: '100%',
                                maxWidth: '1000px',
                                margin: '0 auto'
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                  <span style={{ fontSize: '2rem' }}>{lessonMcqFeedback.isCorrect ? "🎉" : "❌"}</span>
                                  <div>
                                    <h4 style={{ margin: 0, color: lessonMcqFeedback.isCorrect ? '#065f46' : '#991b1b', fontWeight: '800', fontSize: '1.2rem' }}>
                                      {lessonMcqFeedback.title}
                                    </h4>
                                    <p style={{ margin: '4px 0 0', color: lessonMcqFeedback.isCorrect ? '#047857' : '#b91c1c', fontSize: '0.95rem' }}>
                                      {lessonMcqFeedback.explanation}
                                    </p>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  className="primary-btn"
                                  style={{
                                    background: lessonMcqFeedback.isCorrect ? '#10b981' : '#ef4444',
                                    color: 'white',
                                    border: 'none',
                                    padding: '12px 30px',
                                    borderRadius: '12px',
                                    fontWeight: '800',
                                    cursor: 'pointer'
                                  }}
                                  onClick={() => {
                                    setLessonMcqFeedback(null);
                                    if (lessonMcqIndex < ai.mcqs.length - 1) {
                                      setLessonMcqIndex(lessonMcqIndex + 1);
                                    } else {
                                      setLessonStep(2);
                                    }
                                  }}
                                >
                                  Continue
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* Step 2: Fill in the Blanks */}
                    {lessonStep === 2 && ai.fillBlanks?.length > 0 && (() => {
                      const fb = ai.fillBlanks[lessonFillIndex];
                      const userAnswer = lessonFillAnswers[lessonFillIndex] || "";
                      const isChecked = lessonFillFeedback !== null;
                      
                      // Build a list of tiles for word bank
                      const otherBlanks = ai.fillBlanks.map(x => x.answer).filter(x => x !== fb.answer);
                      const allChoices = Array.from(new Set([fb.answer, ...otherBlanks])).slice(0, 4);
                      
                      return (
                        <div className="ai-lesson-step" style={{ paddingBottom: '120px' }}>
                          <div className="ai-lesson-step-header" style={{ marginBottom: '16px' }}>
                            <span className="ai-step-badge">✍️ Fill in the Blank (Question {lessonFillIndex + 1} of {ai.fillBlanks.length})</span>
                          </div>

                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '20px',
                            margin: '20px 0'
                          }}>
                            {/* Mascot */}
                            <div style={{ flexShrink: 0 }}>
                              <img 
                                src="/as1.png" 
                                alt="LISA Mascot" 
                                style={{ width: '80px', height: '80px', objectFit: 'contain' }}
                              />
                            </div>
                            {/* Speech bubble */}
                            <div style={{
                              flexGrow: 1,
                              background: 'var(--panel)',
                              border: '2px solid var(--line)',
                              borderRadius: '20px',
                              padding: '24px',
                              position: 'relative',
                              fontSize: '1.3rem',
                              fontWeight: '700',
                              textAlign: 'center'
                            }}>
                              <div style={{
                                position: 'absolute',
                                left: '-9px',
                                top: '32px',
                                width: '14px',
                                height: '14px',
                                background: 'var(--panel)',
                                borderLeft: '2px solid var(--line)',
                                borderBottom: '2px solid var(--line)',
                                transform: 'rotate(45deg)'
                              }}></div>
                              
                              {/* Render sentence with blank highlighted */}
                              <div>
                                {fb.sentence.split("___").map((part, index, arr) => (
                                  <React.Fragment key={index}>
                                    {part}
                                    {index < arr.length - 1 && (
                                      <span style={{
                                        borderBottom: '3px solid var(--accent)',
                                        padding: '2px 10px',
                                        color: 'var(--accent)',
                                        margin: '0 8px',
                                        minWidth: '100px',
                                        display: 'inline-block',
                                        textAlign: 'center',
                                        background: 'rgba(var(--accent-rgb), 0.05)'
                                      }}>
                                        {userAnswer || "\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0"}
                                      </span>
                                    )}
                                  </React.Fragment>
                                ))}
                              </div>

                              {/* Hint placed inside speech bubble */}
                              {fb.hint && (
                                <div style={{ 
                                  fontSize: '0.9rem', 
                                  color: 'var(--muted)', 
                                  marginTop: '16px',
                                  fontWeight: '600',
                                  fontStyle: 'italic',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '6px'
                                }}>
                                  <span>💡</span>
                                  <span>Hint: {fb.hint}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Interactive word bank tiles */}
                          {!isChecked && (
                            <div style={{
                              display: 'flex',
                              justifyContent: 'center',
                              gap: '12px',
                              margin: '20px 0',
                              flexWrap: 'wrap'
                            }}>
                              {allChoices.map((choice, cIdx) => (
                                <button
                                  key={cIdx}
                                  type="button"
                                  style={{
                                    background: 'var(--panel-strong)',
                                    border: '2px solid var(--line)',
                                    borderRadius: '12px',
                                    padding: '10px 20px',
                                    fontSize: '1.1rem',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                    transition: 'all 0.15s ease'
                                  }}
                                  onClick={() => {
                                    setLessonFillAnswers(prev => ({ ...prev, [lessonFillIndex]: choice }));
                                  }}
                                >
                                  {choice}
                                </button>
                              ))}
                            </div>
                          )}

                          {/* Fallback Text Input */}
                          <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
                            <input
                              type="text"
                              className="ai-fill-input"
                              placeholder="Or type your answer here..."
                              style={{
                                maxWidth: '300px',
                                padding: '12px 20px',
                                borderRadius: '12px',
                                border: '2px solid var(--line)',
                                fontSize: '1rem',
                                textAlign: 'center'
                              }}
                              value={userAnswer}
                              onChange={(e) => setLessonFillAnswers(prev => ({ ...prev, [lessonFillIndex]: e.target.value }))}
                              disabled={isChecked}
                            />
                          </div>

                          {!isChecked && (
                            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                              <button
                                type="button"
                                className="primary-btn"
                                style={{ padding: '12px 40px', borderRadius: '12px' }}
                                onClick={() => {
                                  const correct = userAnswer.trim().toLowerCase() === fb.answer.toLowerCase();
                                  setLessonFillFeedback({
                                    isCorrect: correct,
                                    title: correct ? "Excellent!" : "Incorrect",
                                    correctAnswer: fb.answer
                                  });
                                }}
                                disabled={!userAnswer.trim()}
                              >
                                Check Answer
                              </button>
                            </div>
                          )}

                          {/* Duolingo style bottom feedback bar */}
                          {lessonFillFeedback && (
                            <div style={{
                              position: 'absolute',
                              bottom: 0,
                              left: 0,
                              right: 0,
                              background: lessonFillFeedback.isCorrect ? '#d1fae5' : '#fee2e2',
                              borderTop: `2px solid ${lessonFillFeedback.isCorrect ? '#10b981' : '#ef4444'}`,
                              padding: '20px 40px',
                              zIndex: 100
                            }}>
                              <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                width: '100%',
                                maxWidth: '1000px',
                                margin: '0 auto'
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                  <span style={{ fontSize: '2rem' }}>{lessonFillFeedback.isCorrect ? "🎉" : "❌"}</span>
                                  <div>
                                    <h4 style={{ margin: 0, color: lessonFillFeedback.isCorrect ? '#065f46' : '#991b1b', fontWeight: '800', fontSize: '1.2rem' }}>
                                      {lessonFillFeedback.title}
                                    </h4>
                                    <p style={{ margin: '4px 0 0', color: lessonFillFeedback.isCorrect ? '#047857' : '#b91c1c', fontSize: '0.95rem' }}>
                                      {lessonFillFeedback.isCorrect ? "You got it right!" : `Correct Answer: "${lessonFillFeedback.correctAnswer}"`}
                                    </p>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  className="primary-btn"
                                  style={{
                                    background: lessonFillFeedback.isCorrect ? '#10b981' : '#ef4444',
                                    color: 'white',
                                    border: 'none',
                                    padding: '12px 30px',
                                    borderRadius: '12px',
                                    fontWeight: '800',
                                    cursor: 'pointer'
                                  }}
                                  onClick={() => {
                                    setLessonFillFeedback(null);
                                    if (lessonFillIndex < ai.fillBlanks.length - 1) {
                                      setLessonFillIndex(lessonFillIndex + 1);
                                    } else {
                                      setLessonStep(3);
                                    }
                                  }}
                                >
                                  Continue
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* Step 3: Reading Comprehension */}
                    {lessonStep === 3 && (() => {
                      const isChecked = lessonReadingFeedback !== null;
                      return (
                        <div className="ai-lesson-step" style={{ paddingBottom: '120px' }}>
                          <div className="ai-lesson-step-header" style={{ marginBottom: '16px' }}>
                            <span className="ai-step-badge">📚 Reading Comprehension</span>
                          </div>

                          <div style={{
                            background: 'var(--panel)',
                            border: '2px solid var(--line)',
                            borderRadius: '24px',
                            padding: '24px',
                            margin: '20px 0',
                            position: 'relative'
                          }}>
                            <div style={{ display: 'flex', ['justify' + 'Content']: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                              <h4 style={{ margin: 0 }}>Reading Passage:</h4>
                              <button type="button" className="tts-btn" onClick={() => speakText(ai.readingPassage)}>🔊 Listen</button>
                            </div>
                            <div className="ai-passage-text" style={{ fontSize: '1.15rem', lineHeight: '1.6', fontWeight: 500 }}>
                              {ai.readingPassage}
                            </div>
                          </div>

                          {/* Mascot & Speech bubble for reading question */}
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '20px',
                            margin: '20px 0'
                          }}>
                            {/* Mascot */}
                            <div style={{ flexShrink: 0 }}>
                              <img 
                                src="/as1.png" 
                                alt="LISA Mascot" 
                                style={{ width: '80px', height: '80px', objectFit: 'contain' }}
                              />
                            </div>
                            {/* Speech bubble */}
                            <div style={{
                              flexGrow: 1,
                              background: 'var(--panel)',
                              border: '2px solid var(--line)',
                              borderRadius: '20px',
                              padding: '16px 24px',
                              position: 'relative'
                            }}>
                              <div style={{
                                position: 'absolute',
                                left: '-9px',
                                top: '32px',
                                width: '14px',
                                height: '14px',
                                background: 'var(--panel)',
                                borderLeft: '2px solid var(--line)',
                                borderBottom: '2px solid var(--line)',
                                transform: 'rotate(45deg)'
                              }}></div>
                              <p style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0 }}>{ai.readingQuestion}</p>
                            </div>
                          </div>

                          <div style={{ marginTop: '24px' }}>
                            <input
                              type="text"
                              className="ai-fill-input"
                              placeholder="Type your answer based on the passage..."
                              style={{
                                width: '100%',
                                padding: '12px 20px',
                                borderRadius: '12px',
                                border: '2px solid var(--line)',
                                fontSize: '1rem',
                                marginTop: '10px'
                              }}
                              value={lessonReadingAnswer}
                              onChange={(e) => setLessonReadingAnswer(e.target.value)}
                              disabled={isChecked}
                            />
                          </div>

                          {!isChecked && (
                            <div style={{ display: 'flex', ['justify' + 'Content']: 'center', marginTop: '20px' }}>
                              <button
                                type="button"
                                className="primary-btn"
                                style={{ padding: '12px 40px', borderRadius: '12px' }}
                                  onClick={() => {
                                    setLessonReadingFeedback({
                                      userAnswer: lessonReadingAnswer,
                                      suggestedAnswer: ai.readingAnswer
                                    });
                                  }}
                                disabled={!lessonReadingAnswer.trim()}
                              >
                                Check Answer
                              </button>
                            </div>
                          )}

                          {lessonReadingFeedback && (
                            <div style={{
                              position: 'absolute',
                              bottom: 0,
                              left: 0,
                              right: 0,
                              background: 'var(--panel-strong)',
                              borderTop: '2px solid var(--accent)',
                              padding: '20px 40px',
                              zIndex: 100
                            }}>
                              <div style={{
                                display: 'flex',
                                ['justify' + 'Content']: 'space-between',
                                alignItems: 'center',
                                width: '100%',
                                maxWidth: '1000px',
                                margin: '0 auto'
                              }}>
                                <div style={{ flex: 1, marginRight: '20px' }}>
                                  <div style={{ marginBottom: '8px' }}>
                                    <strong style={{ color: 'var(--muted)' }}>Your Answer:</strong>
                                    <p style={{ margin: '2px 0 0', fontWeight: '700' }}>{lessonReadingFeedback.userAnswer}</p>
                                  </div>
                                  <div>
                                    <strong style={{ color: 'var(--accent)' }}>LISA's Suggested Answer:</strong>
                                    <p style={{ margin: '2px 0 0', fontWeight: '700', color: 'var(--accent)' }}>{lessonReadingFeedback.suggestedAnswer}</p>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  className="primary-btn"
                                  onClick={() => {
                                    setLessonReadingFeedback(null);
                                    setLessonStep(4);
                                  }}
                                >
                                  Continue
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* Step 4: Writing Activity */}
                    {lessonStep === 4 && (
                      <div className="ai-lesson-step" style={{ paddingBottom: '120px' }}>
                        <div className="ai-lesson-step-header" style={{ marginBottom: '16px' }}>
                          <span className="ai-step-badge">✍️ Writing Activity</span>
                        </div>

                        {/* Mascot & Speech bubble for prompt */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '20px',
                          margin: '20px 0'
                        }}>
                          {/* Mascot */}
                          <div style={{ flexShrink: 0 }}>
                            <img 
                              src="/as1.png" 
                              alt="LISA Mascot" 
                              style={{ width: '80px', height: '80px', objectFit: 'contain' }}
                            />
                          </div>
                          {/* Speech bubble */}
                          <div style={{
                            flexGrow: 1,
                            background: 'var(--panel)',
                            border: '2px solid var(--line)',
                            borderRadius: '20px',
                            padding: '16px 24px',
                            position: 'relative'
                          }}>
                            <div style={{
                              position: 'absolute',
                              left: '-9px',
                              top: '32px',
                              width: '14px',
                              height: '14px',
                              background: 'var(--panel)',
                              borderLeft: '2px solid var(--line)',
                              borderBottom: '2px solid var(--line)',
                              transform: 'rotate(45deg)'
                            }}></div>
                            <p style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0 }}>{ai.writingActivity}</p>
                          </div>
                        </div>

                        <textarea
                          className="writing-textarea"
                          rows={6}
                          placeholder="Type your response here..."
                          value={lessonWritingText}
                          onChange={(e) => setLessonWritingText(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '16px',
                            borderRadius: '16px',
                            border: '2px solid var(--line)',
                            fontSize: '1rem',
                            fontFamily: 'inherit',
                            background: 'var(--panel)'
                          }}
                        />

                        <div style={{ display: 'flex', ['justify' + 'Content']: 'center', marginTop: '20px' }}>
                          <button
                            type="button"
                            className="primary-btn"
                            style={{ padding: '12px 40px', borderRadius: '12px' }}
                            onClick={() => {

                              setLessonStep(5);
                            }}
                            disabled={!lessonWritingText.trim()}
                          >
                            Continue
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Step 5: Speak this sentence */}
                    {lessonStep === 5 && (() => {
                      const sentence = ai.speakSentence || "Hello, welcome to LISA.";
                      const isChecked = lessonSpeakFeedback !== null;
                      
                      const startSpeaking = () => {
                        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                        if (!SpeechRecognition) {
                          setLessonSpeakError("Speech recognition is not supported in this browser. Please use Chrome/Edge.");
                          return;
                        }
                        
                        try {
                          const rec = new SpeechRecognition();
                          rec.continuous = false;
                          rec.interimResults = false;
                          rec.lang = selectedLanguage === "Kannada" ? "kn-IN" :
                                     selectedLanguage === "Hindi" ? "hi-IN" :
                                     selectedLanguage === "Telugu" ? "te-IN" :
                                     selectedLanguage === "Tamil" ? "ta-IN" : "en-US";
                                     
                          rec.onstart = () => {
                            setLessonSpeakIsListening(true);
                            setLessonSpeakTranscript("");
                            setLessonSpeakError("");
                          };
                          
                          rec.onerror = (e) => {
                            setLessonSpeakError("Mic error, please check connection.");
                            setLessonSpeakIsListening(false);
                          };
                          
                          rec.onend = () => {
                            setLessonSpeakIsListening(false);
                          };
                          
                          rec.onresult = (event) => {
                            const transcript = event.results[0][0].transcript;
                            setLessonSpeakTranscript(transcript);
                            
                            const clean = (w) => w.replace(/[.,\/#!$%\^&\*;:{}=\-_\u0060()?]/g, "").toLowerCase().trim();
                            const targetWords = sentence.split(/\s+/).filter(Boolean).map(clean);
                            const spokenWords = transcript.split(/\s+/).filter(Boolean).map(clean);
                            
                            let matched = 0;
                            targetWords.forEach(w => {
                              if (spokenWords.includes(w)) matched++;
                            });
                            
                            const percent = targetWords.length > 0 ? (matched / targetWords.length) * 100 : 100;
                            const isCorrect = percent >= 50;
                            
                              setLessonSpeakFeedback({
                                isCorrect,
                                matchedCount: matched,
                                totalWords: targetWords.length,
                                percent: Math.round(percent)
                              });
                              
                            };
                          
                          rec.start();
                        } catch (err) {
                          setLessonSpeakError("Could not start speech recognition.");
                          setLessonSpeakIsListening(false);
                        }
                      };
                      
                      return (
                        <div className="ai-lesson-step" style={{ paddingBottom: '120px' }}>
                          <div className="ai-lesson-step-header" style={{ marginBottom: '16px' }}>
                            <span className="ai-step-badge">🎤 Speak this sentence</span>
                          </div>
                          
                          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', margin: '20px 0' }}>
                            <img src="/as1.png" alt="LISA Mascot" style={{ width: '80px', height: '80px', objectFit: 'contain' }} />
                            <div style={{
                              flexGrow: 1,
                              background: 'var(--panel)',
                              border: '2px solid var(--line)',
                              borderRadius: '20px',
                              padding: '24px',
                              position: 'relative',
                              fontSize: '1.4rem',
                              fontWeight: '700',
                              textAlign: 'center',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              gap: '12px'
                            }}>
                              <div style={{
                                position: 'absolute',
                                left: '-9px',
                                top: '32px',
                                width: '14px',
                                height: '14px',
                                background: 'var(--panel)',
                                borderLeft: '2px solid var(--line)',
                                borderBottom: '2px solid var(--line)',
                                transform: 'rotate(45deg)'
                              }}></div>
                              
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <button type="button" className="tts-btn" style={{ borderRadius: '50%', width: '40px', height: '40px', padding: 0 }} onClick={() => speakText(sentence)}>🔊</button>
                                <span style={{ color: 'var(--text)' }}>{sentence}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', margin: '30px 0' }}>
                            <button
                              type="button"
                              onClick={startSpeaking}
                              disabled={lessonSpeakIsListening || isChecked}
                              style={{
                                background: lessonSpeakIsListening ? '#ef4444' : 'var(--accent)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '16px',
                                padding: '16px 32px',
                                fontSize: '1.2rem',
                                fontWeight: '800',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                              }}
                            >
                              <span>{lessonSpeakIsListening ? "🛑 RECORDING..." : "🎙️ CLICK TO SPEAK"}</span>
                            </button>
                            
                            {lessonSpeakTranscript && (
                              <p style={{ fontStyle: 'italic', color: 'var(--text)', fontSize: '1.1rem' }}>
                                You said: "<strong>{lessonSpeakTranscript}</strong>"
                              </p>
                            )}
                            
                            {lessonSpeakError && (
                              <p style={{ color: '#ef4444', fontWeight: 600 }}>{lessonSpeakError}</p>
                            )}
                          </div>
                          
                          {isChecked && (
                            <div style={{
                              position: 'absolute',
                              bottom: 0,
                              left: 0,
                              right: 0,
                              background: lessonSpeakFeedback.isCorrect ? '#d1fae5' : '#fee2e2',
                              borderTop: `2px solid ${lessonSpeakFeedback.isCorrect ? '#10b981' : '#ef4444'}`,
                              padding: '20px 40px',
                              zIndex: 100
                            }}>
                              <div style={{
                                display: 'flex',
                                ['justify' + 'Content']: 'space-between',
                                alignItems: 'center',
                                width: '100%',
                                maxWidth: '1000px',
                                margin: '0 auto'
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                  <span style={{ fontSize: '2rem' }}>{lessonSpeakFeedback.isCorrect ? "🎉" : "❌"}</span>
                                  <div>
                                    <h4 style={{ margin: 0, color: lessonSpeakFeedback.isCorrect ? '#065f46' : '#991b1b', fontWeight: '800', fontSize: '1.2rem' }}>
                                      {lessonSpeakFeedback.isCorrect ? "Awesome Pronunciation!" : "Need Practice!"}
                                    </h4>
                                    <p style={{ margin: '4px 0 0', color: lessonSpeakFeedback.isCorrect ? '#047857' : '#b91c1c', fontSize: '0.95rem' }}>
                                      Matched {lessonSpeakFeedback.percent}% of the sentence ({lessonSpeakFeedback.matchedCount}/{lessonSpeakFeedback.totalWords} words).
                                    </p>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  className="primary-btn"
                                  style={{
                                    background: lessonSpeakFeedback.isCorrect ? '#10b981' : '#ef4444',
                                    color: 'white',
                                    border: 'none',
                                    padding: '12px 30px',
                                    borderRadius: '12px',
                                    fontWeight: '800',
                                    cursor: 'pointer'
                                  }}
                                  onClick={() => {
                                    setLessonSpeakFeedback(null);
                                    setLessonSpeakTranscript("");
                                    setLessonStep(6);
                                  }}
                                >
                                  Continue
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* Step 6: Select the correct meaning */}
                    {lessonStep === 6 && (() => {
                      const mq = ai.meaningQuestion || { phrase: "Thank you", options: ["Dhanyavadagalu", "Namaskara", "Hogi baruttene"], correctIndex: 0 };
                      const isChecked = lessonMeaningFeedback !== null;
                      
                      return (
                        <div className="ai-lesson-step" style={{ paddingBottom: '120px' }}>
                          <div className="ai-lesson-step-header" style={{ marginBottom: '16px' }}>
                            <span className="ai-step-badge">🧠 Select the correct meaning</span>
                          </div>
                          
                          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', margin: '20px 0' }}>
                            <img src="/as1.png" alt="LISA Mascot" style={{ width: '80px', height: '80px', objectFit: 'contain' }} />
                            <div style={{
                              flexGrow: 1,
                              background: 'var(--panel)',
                              border: '2px solid var(--line)',
                              borderRadius: '20px',
                              padding: '16px 24px',
                              position: 'relative'
                            }}>
                              <div style={{
                                position: 'absolute',
                                left: '-9px',
                                top: '32px',
                                width: '14px',
                                height: '14px',
                                background: 'var(--panel)',
                                borderLeft: '2px solid var(--line)',
                                borderBottom: '2px solid var(--line)',
                                transform: 'rotate(45deg)'
                              }}></div>
                              <p style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0 }}>"{mq.phrase}" means:</p>
                            </div>
                          </div>
                          
                          <div className="mcq-options-container" style={{ display: 'flex', flexDirection: 'column', gap: '12px', margin: '20px 0' }}>
                            {mq.options.map((opt, oIdx) => {
                              const isSelected = lessonMeaningAnswer === oIdx;
                              let btnBorder = '2px solid var(--line)';
                              let btnBg = 'var(--panel)';
                              if (isSelected) {
                                btnBorder = '2px solid var(--accent)';
                                btnBg = 'rgba(var(--accent-rgb), 0.05)';
                              }
                              
                              return (
                                <button
                                  key={oIdx}
                                  type="button"
                                  style={{
                                    border: btnBorder,
                                    borderRadius: '16px',
                                    padding: '16px 20px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    background: btnBg,
                                    width: '100%',
                                    textAlign: 'left',
                                    fontSize: '1.1rem',
                                    fontWeight: '700',
                                    color: 'var(--text)',
                                    cursor: 'pointer'
                                  }}
                                  onClick={() => {
                                    if (!isChecked) {
                                      setLessonMeaningAnswer(oIdx);
                                    }
                                  }}
                                  disabled={isChecked}
                                >
                                  <span style={{
                                    background: isSelected ? 'var(--accent)' : 'var(--panel-strong)',
                                    color: isSelected ? 'white' : 'var(--text-muted)',
                                    width: '30px',
                                    height: '30px',
                                    borderRadius: '50%',
                                    display: 'grid',
                                    placeItems: 'center',
                                    fontWeight: '800'
                                  }}>{oIdx + 1}</span>
                                  <span>{opt}</span>
                                </button>
                              );
                            })}
                          </div>
                          
                          {!isChecked && (
                            <div style={{ display: 'flex', ['justify' + 'Content']: 'center', marginTop: '20px' }}>
                              <button
                                type="button"
                                className="primary-btn"
                                style={{ padding: '12px 40px', borderRadius: '12px' }}
                                onClick={() => {
                                  const correct = lessonMeaningAnswer === mq.correctIndex;
                                  setLessonMeaningFeedback({
                                    isCorrect: correct,
                                    correctAnswer: mq.options[mq.correctIndex]
                                  });
                                }}
                                disabled={lessonMeaningAnswer === null}
                              >
                                Check Answer
                              </button>
                            </div>
                          )}
                          
                          {isChecked && (
                            <div style={{
                              position: 'absolute',
                              bottom: 0,
                              left: 0,
                              right: 0,
                              background: lessonMeaningFeedback.isCorrect ? '#d1fae5' : '#fee2e2',
                              borderTop: `2px solid ${lessonMeaningFeedback.isCorrect ? '#10b981' : '#ef4444'}`,
                              padding: '20px 40px',
                              zIndex: 100
                            }}>
                              <div style={{
                                display: 'flex',
                                ['justify' + 'Content']: 'space-between',
                                alignItems: 'center',
                                width: '100%',
                                maxWidth: '1000px',
                                margin: '0 auto'
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                  <span style={{ fontSize: '2rem' }}>{lessonMeaningFeedback.isCorrect ? "🎉" : "❌"}</span>
                                  <div>
                                    <h4 style={{ margin: 0, color: lessonMeaningFeedback.isCorrect ? '#065f46' : '#991b1b', fontWeight: '800', fontSize: '1.2rem' }}>
                                      {lessonMeaningFeedback.isCorrect ? "Excellent!" : "Incorrect"}
                                    </h4>
                                    <p style={{ margin: '4px 0 0', color: lessonMeaningFeedback.isCorrect ? '#047857' : '#b91c1c', fontSize: '0.95rem' }}>
                                      {lessonMeaningFeedback.isCorrect ? "You matched the meaning correctly!" : `Correct meaning: "${lessonMeaningFeedback.correctAnswer}"`}
                                    </p>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  className="primary-btn"
                                  style={{
                                    background: lessonMeaningFeedback.isCorrect ? '#10b981' : '#ef4444',
                                    color: 'white',
                                    border: 'none',
                                    padding: '12px 30px',
                                    borderRadius: '12px',
                                    fontWeight: '800',
                                    cursor: 'pointer'
                                  }}
                                  onClick={() => {
                                    setLessonMeaningFeedback(null);
                                    setLessonMeaningAnswer(null);
                                    setLessonStep(7);
                                  }}
                                >
                                  Continue
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* Step 7: Write this in English (word tiles) */}
                    {lessonStep === 7 && (() => {
                      const tt = ai.translationTask || { sentence: "Namaskara", englishTranslation: "Hello", tiles: ["Hello", "Bye", "Thank", "You"] };
                      const isChecked = lessonTranslationFeedback !== null;
                      
                      return (
                        <div className="ai-lesson-step" style={{ paddingBottom: '120px' }}>
                          <div className="ai-lesson-step-header" style={{ marginBottom: '16px' }}>
                            <span className="ai-step-badge">✍️ Write this in English</span>
                          </div>
                          
                          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', margin: '20px 0' }}>
                            <img src="/as1.png" alt="LISA Mascot" style={{ width: '80px', height: '80px', objectFit: 'contain' }} />
                            <div style={{
                              flexGrow: 1,
                              background: 'var(--panel)',
                              border: '2px solid var(--line)',
                              borderRadius: '20px',
                              padding: '16px 24px',
                              position: 'relative'
                            }}>
                              <div style={{
                                position: 'absolute',
                                left: '-9px',
                                top: '32px',
                                width: '14px',
                                height: '14px',
                                background: 'var(--panel)',
                                borderLeft: '2px solid var(--line)',
                                borderBottom: '2px solid var(--line)',
                                transform: 'rotate(45deg)'
                              }}></div>
                              <p style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0 }}>"{tt.sentence}"</p>
                            </div>
                          </div>
                          
                          <div style={{
                            borderBottom: '2px solid var(--line)',
                            minHeight: '80px',
                            margin: '30px 0 20px',
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '10px',
                            padding: '10px 0',
                            alignItems: 'center'
                          }}>
                            {lessonTranslationSelected.map((word, wIdx) => (
                              <button
                                key={wIdx}
                                type="button"
                                style={{
                                  background: 'var(--accent)',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '10px',
                                  padding: '10px 16px',
                                  fontSize: '1.1rem',
                                  fontWeight: '700',
                                  cursor: 'pointer',
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                }}
                                onClick={() => {
                                  if (!isChecked) {
                                    setLessonTranslationSelected(prev => prev.filter((_, idx) => idx !== wIdx));
                                  }
                                }}
                                disabled={isChecked}
                              >
                                {word}
                              </button>
                            ))}
                            {lessonTranslationSelected.length === 0 && (
                              <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Tap words below to translate...</span>
                            )}
                          </div>
                          
                          <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '10px',
                            ['justify' + 'Content']: 'center',
                            margin: '20px 0 30px'
                          }}>
                            {tt.tiles.map((word, wIdx) => {
                              const isUsed = lessonTranslationSelected.includes(word);
                              return (
                                <button
                                  key={wIdx}
                                  type="button"
                                  style={{
                                    background: isUsed ? 'var(--line)' : 'var(--panel)',
                                    color: isUsed ? 'transparent' : 'var(--text)',
                                    border: '2px solid var(--line)',
                                    borderRadius: '10px',
                                    padding: '10px 16px',
                                    fontSize: '1.1rem',
                                    fontWeight: '700',
                                    cursor: isUsed ? 'default' : 'pointer',
                                    boxShadow: isUsed ? 'none' : '0 2px 4px rgba(0,0,0,0.05)',
                                    opacity: isUsed ? 0.3 : 1
                                  }}
                                  onClick={() => {
                                    if (!isChecked && !isUsed) {
                                      setLessonTranslationSelected(prev => [...prev, word]);
                                    }
                                  }}
                                  disabled={isChecked || isUsed}
                                >
                                  {word}
                                </button>
                              );
                            })}
                          </div>
                          
                          {!isChecked && (
                            <div style={{ display: 'flex', ['justify' + 'Content']: 'center' }}>
                              <button
                                type="button"
                                className="primary-btn"
                                style={{ padding: '12px 40px', borderRadius: '12px' }}
                                onClick={() => {
                                  const userSentence = lessonTranslationSelected.join(" ").trim().toLowerCase();
                                  const clean = (s) => s.replace(/[.,\/#!$%\^&\*;:{}=\-_\u0060()?]/g, "").toLowerCase().trim();
                                  const correct = clean(userSentence) === clean(tt.englishTranslation);
                                  
                                  setLessonTranslationFeedback({
                                    isCorrect: correct,
                                    correctAnswer: tt.englishTranslation
                                  });
                                }}
                                disabled={lessonTranslationSelected.length === 0}
                              >
                                Check Answer
                              </button>
                            </div>
                          )}
                          
                          {isChecked && (
                            <div style={{
                              position: 'absolute',
                              bottom: 0,
                              left: 0,
                              right: 0,
                              background: lessonTranslationFeedback.isCorrect ? '#d1fae5' : '#fee2e2',
                              borderTop: `2px solid ${lessonTranslationFeedback.isCorrect ? '#10b981' : '#ef4444'}`,
                              padding: '20px 40px',
                              zIndex: 100
                            }}>
                              <div style={{
                                display: 'flex',
                                ['justify' + 'Content']: 'space-between',
                                alignItems: 'center',
                                width: '100%',
                                maxWidth: '1000px',
                                margin: '0 auto'
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                  <span style={{ fontSize: '2rem' }}>{lessonTranslationFeedback.isCorrect ? "🎉" : "❌"}</span>
                                  <div>
                                    <h4 style={{ margin: 0, color: lessonTranslationFeedback.isCorrect ? '#065f46' : '#991b1b', fontWeight: '800', fontSize: '1.2rem' }}>
                                      {lessonTranslationFeedback.isCorrect ? "Excellent!" : "Incorrect"}
                                    </h4>
                                    <p style={{ margin: '4px 0 0', color: lessonTranslationFeedback.isCorrect ? '#047857' : '#b91c1c', fontSize: '0.95rem' }}>
                                      {lessonTranslationFeedback.isCorrect ? "Beautiful translation!" : `Correct Translation: "${lessonTranslationFeedback.correctAnswer}"`}
                                    </p>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  className="primary-btn"
                                  style={{
                                    background: lessonTranslationFeedback.isCorrect ? '#10b981' : '#ef4444',
                                    color: 'white',
                                    border: 'none',
                                    padding: '12px 30px',
                                    borderRadius: '12px',
                                    fontWeight: '800',
                                    cursor: 'pointer'
                                  }}
                                  onClick={() => {
                                    setLessonTranslationFeedback(null);
                                    setLessonTranslationSelected([]);
                                    setLessonStep(8);
                                  }}
                                >
                                  Continue
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* Step 8: Match Sentence / Pairs */}
                    {lessonStep === 8 && (() => {
                      const pairs = ai.matchingPairs || [
                        { left: "Shale", right: "School" },
                        { left: "Pustaka", right: "Book" },
                        { left: "Huduga", right: "Boy" },
                        { left: "Neeru", right: "Water" }
                      ];
                      
                      const leftItems = pairs.map(p => p.left);
                      const rightItems = [...pairs].map(p => p.right).sort();

                      const isStepFinished = lessonMatchCompleted.length === pairs.length;

                      const handleLeftClick = (item) => {
                        if (lessonMatchCompleted.includes(item)) return;
                        setLessonMatchSelectedLeft(item);
                        if (lessonMatchSelectedRight) {
                          const pair = pairs.find(p => p.left === item && p.right === lessonMatchSelectedRight);
                          if (pair) {
                            setLessonMatchCompleted(prev => [...prev, item]);
                          } else {
                            setLessonMatchFeedback("Incorrect pair!");
                            setTimeout(() => setLessonMatchFeedback(null), 1000);
                          }
                          setLessonMatchSelectedLeft(null);
                          setLessonMatchSelectedRight(null);
                        }
                      };

                      const handleRightClick = (item) => {
                        const pair = pairs.find(p => p.right === item);
                        if (pair && lessonMatchCompleted.includes(pair.left)) return;
                        
                        setLessonMatchSelectedRight(item);
                        if (lessonMatchSelectedLeft) {
                          const pObj = pairs.find(p => p.left === lessonMatchSelectedLeft && p.right === item);
                          if (pObj) {
                            setLessonMatchCompleted(prev => [...prev, lessonMatchSelectedLeft]);
                          } else {
                            setLessonMatchFeedback("Incorrect pair!");
                            setTimeout(() => setLessonMatchFeedback(null), 1000);
                          }
                          setLessonMatchSelectedLeft(null);
                          setLessonMatchSelectedRight(null);
                        }
                      };

                      return (
                        <div className="ai-lesson-step" style={{ paddingBottom: '120px' }}>
                          <div className="ai-lesson-step-header" style={{ marginBottom: '16px' }}>
                            <span className="ai-step-badge">🔗 Make the correct pairs of words</span>
                          </div>

                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '24px',
                            margin: '30px 0'
                          }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                              {leftItems.map((item, idx) => {
                                const isCompleted = lessonMatchCompleted.includes(item);
                                const isSelected = lessonMatchSelectedLeft === item;
                                
                                return (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={() => handleLeftClick(item)}
                                    style={{
                                      padding: '16px',
                                      borderRadius: '16px',
                                      border: isSelected ? '2px solid var(--accent)' : '2px solid var(--line)',
                                      background: isCompleted ? 'var(--line)' : isSelected ? 'rgba(var(--accent-rgb), 0.1)' : 'var(--panel)',
                                      color: isCompleted ? 'var(--text-muted)' : 'var(--text)',
                                      textDecoration: isCompleted ? 'line-through' : 'none',
                                      fontWeight: '700',
                                      fontSize: '1.1rem',
                                      cursor: isCompleted ? 'default' : 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      ['justify' + 'Content']: 'space-between',
                                      opacity: isCompleted ? 0.6 : 1
                                    }}
                                    disabled={isCompleted}
                                  >
                                    <span>{item}</span>
                                    {isCompleted && <span>✅</span>}
                                  </button>
                                );
                              })}
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                              {rightItems.map((item, idx) => {
                                const matchedPair = pairs.find(p => p.right === item);
                                const isCompleted = matchedPair && lessonMatchCompleted.includes(matchedPair.left);
                                const isSelected = lessonMatchSelectedRight === item;

                                return (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={() => handleRightClick(item)}
                                    style={{
                                      padding: '16px',
                                      borderRadius: '16px',
                                      border: isSelected ? '2px solid var(--accent)' : '2px solid var(--line)',
                                      background: isCompleted ? 'var(--line)' : isSelected ? 'rgba(var(--accent-rgb), 0.1)' : 'var(--panel)',
                                      color: isCompleted ? 'var(--text-muted)' : 'var(--text)',
                                      textDecoration: isCompleted ? 'line-through' : 'none',
                                      fontWeight: '700',
                                      fontSize: '1.1rem',
                                      cursor: isCompleted ? 'default' : 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      ['justify' + 'Content']: 'space-between',
                                      opacity: isCompleted ? 0.6 : 1
                                    }}
                                    disabled={isCompleted}
                                  >
                                    <span>{item}</span>
                                    {isCompleted && <span>✅</span>}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {lessonMatchFeedback && (
                            <div style={{ textAlign: 'center', color: '#ef4444', fontWeight: '800', fontSize: '1.2rem', margin: '10px 0' }}>
                              ❌ {lessonMatchFeedback}
                            </div>
                          )}

                          {isStepFinished && (
                            <div style={{
                              position: 'absolute',
                              bottom: 0,
                              left: 0,
                              right: 0,
                              background: '#d1fae5',
                              borderTop: '2px solid #10b981',
                              padding: '20px 40px',
                              zIndex: 100
                            }}>
                              <div style={{
                                display: 'flex',
                                ['justify' + 'Content']: 'space-between',
                                alignItems: 'center',
                                width: '100%',
                                maxWidth: '1000px',
                                margin: '0 auto'
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                  <span style={{ fontSize: '2rem' }}>🎉</span>
                                  <div>
                                    <h4 style={{ margin: 0, color: '#065f46', fontWeight: '800', fontSize: '1.2rem' }}>
                                      Pairs Matched Successfully!
                                    </h4>
                                    <p style={{ margin: '4px 0 0', color: '#047857', fontSize: '0.95rem' }}>
                                      Perfect matching speed! Keep it up.
                                    </p>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  className="primary-btn"
                                  style={{
                                    background: '#10b981',
                                    color: 'white',
                                    border: 'none',
                                    padding: '12px 30px',
                                    borderRadius: '12px',
                                    fontWeight: '800',
                                    cursor: 'pointer'
                                  }}
                                  onClick={() => {
                                    setLessonMatchCompleted([]);
                                    setLessonStep(9);
                                  }}
                                >
                                  Continue
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* Step 9: Choose the word you hear */}
                    {lessonStep === 9 && (() => {
                      const lt = ai.listeningTask || { audioText: "Hello", tiles: ["Hello", "Bye", "Welcome"] };
                      const isChecked = lessonListeningFeedback !== null;

                      return (
                        <div className="ai-lesson-step" style={{ paddingBottom: '120px' }}>
                          <div className="ai-lesson-step-header" style={{ marginBottom: '16px' }}>
                            <span className="ai-step-badge">🎧 Choose the words you hear</span>
                          </div>

                          <div style={{
                            display: 'flex',
                            ['justify' + 'Content']: 'center',
                            alignItems: 'center',
                            gap: '20px',
                            margin: '30px 0'
                          }}>
                            <button
                              type="button"
                              onClick={() => speakText(lt.audioText, 1.0)}
                              style={{
                                width: '80px',
                                height: '80px',
                                borderRadius: '24px',
                                background: '#38bdf8',
                                border: 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                ['justify' + 'Content']: 'center',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                              }}
                            >
                              <span style={{ fontSize: '2.5rem' }}>🔊</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => speakText(lt.audioText, 0.5)}
                              style={{
                                width: '60px',
                                height: '60px',
                                borderRadius: '18px',
                                background: '#0284c7',
                                border: 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                ['justify' + 'Content']: 'center',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                              }}
                              title="Listen slowly"
                            >
                              <span style={{ fontSize: '1.8rem' }}>🐢</span>
                            </button>
                          </div>

                          <div style={{
                            borderBottom: '2px solid var(--line)',
                            minHeight: '80px',
                            margin: '30px 0 20px',
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '10px',
                            padding: '10px 0',
                            alignItems: 'center',
                            ['justify' + 'Content']: 'center'
                          }}>
                            {lessonListeningSelected.map((word, wIdx) => (
                              <button
                                key={wIdx}
                                type="button"
                                style={{
                                  background: 'var(--accent)',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '10px',
                                  padding: '10px 16px',
                                  fontSize: '1.1rem',
                                  fontWeight: '700',
                                  cursor: 'pointer',
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                }}
                                onClick={() => {
                                  if (!isChecked) {
                                    setLessonListeningSelected(prev => prev.filter((_, idx) => idx !== wIdx));
                                  }
                                }}
                                disabled={isChecked}
                              >
                                {word}
                              </button>
                            ))}
                            {lessonListeningSelected.length === 0 && (
                              <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Tap words below to translate...</span>
                            )}
                          </div>

                          <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '10px',
                            ['justify' + 'Content']: 'center',
                            margin: '20px 0 30px'
                          }}>
                            {lt.tiles.map((word, wIdx) => {
                              const isUsed = lessonListeningSelected.includes(word);
                              return (
                                <button
                                  key={wIdx}
                                  type="button"
                                  style={{
                                    background: isUsed ? 'var(--line)' : 'var(--panel)',
                                    color: isUsed ? 'transparent' : 'var(--text)',
                                    border: '2px solid var(--line)',
                                    borderRadius: '10px',
                                    padding: '10px 16px',
                                    fontSize: '1.1rem',
                                    fontWeight: '700',
                                    cursor: isUsed ? 'default' : 'pointer',
                                    boxShadow: isUsed ? 'none' : '0 2px 4px rgba(0,0,0,0.05)',
                                    opacity: isUsed ? 0.3 : 1
                                  }}
                                  onClick={() => {
                                    if (!isChecked && !isUsed) {
                                      setLessonListeningSelected(prev => [...prev, word]);
                                    }
                                  }}
                                  disabled={isChecked || isUsed}
                                >
                                  {word}
                                </button>
                              );
                            })}
                          </div>

                          {!isChecked && (
                            <div style={{ display: 'flex', ['justify' + 'Content']: 'center' }}>
                              <button
                                type="button"
                                className="primary-btn"
                                style={{ padding: '12px 40px', borderRadius: '12px' }}
                                onClick={() => {
                                  const userSentence = lessonListeningSelected.join(" ").trim().toLowerCase();
                                  const clean = (s) => s.replace(/[.,\/#!$%\^&\*;:{}=\-_\u0060()?]/g, "").toLowerCase().trim();
                                  const correct = clean(userSentence) === clean(lt.audioText);

                                  setLessonListeningFeedback({
                                    isCorrect: correct,
                                    correctAnswer: lt.audioText
                                  });
                                }}
                                disabled={lessonListeningSelected.length === 0}
                              >
                                Check Answer
                              </button>
                            </div>
                          )}

                          {isChecked && (
                            <div style={{
                              position: 'absolute',
                              bottom: 0,
                              left: 0,
                              right: 0,
                              background: lessonListeningFeedback.isCorrect ? '#d1fae5' : '#fee2e2',
                              borderTop: `2px solid ${lessonListeningFeedback.isCorrect ? '#10b981' : '#ef4444'}`,
                              padding: '20px 40px',
                              zIndex: 100
                            }}>
                              <div style={{
                                display: 'flex',
                                ['justify' + 'Content']: 'space-between',
                                alignItems: 'center',
                                width: '100%',
                                maxWidth: '1000px',
                                margin: '0 auto'
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                  <span style={{ fontSize: '2rem' }}>{lessonListeningFeedback.isCorrect ? "🎉" : "❌"}</span>
                                  <div>
                                    <h4 style={{ margin: 0, color: lessonListeningFeedback.isCorrect ? '#065f46' : '#991b1b', fontWeight: '800', fontSize: '1.2rem' }}>
                                      {lessonListeningFeedback.isCorrect ? "Excellent!" : "Incorrect"}
                                    </h4>
                                    <p style={{ margin: '4px 0 0', color: lessonListeningFeedback.isCorrect ? '#047857' : '#b91c1c', fontSize: '0.95rem' }}>
                                      {lessonListeningFeedback.isCorrect ? "You heard it correctly!" : `Correct Translation: "${lessonListeningFeedback.correctAnswer}"`}
                                    </p>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  className="primary-btn"
                                  style={{
                                    background: lessonListeningFeedback.isCorrect ? '#10b981' : '#ef4444',
                                    color: 'white',
                                    border: 'none',
                                    padding: '12px 30px',
                                    borderRadius: '12px',
                                    fontWeight: '800',
                                    cursor: 'pointer'
                                  }}
                                  onClick={() => {
                                    setLessonListeningFeedback(null);
                                    setLessonListeningSelected([]);
                                    setLessonUnscrambleIndex(0);
                                    setLessonUnscrambleSelected([]);
                                    setLessonUnscrambleFeedback(null);
                                    setLessonStep(10);
                                  }}
                                >
                                  Continue
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* Step 10: Unscramble / Rearrange letters */}
                    {lessonStep === 10 && (() => {
                      const list = ai.unscramble && ai.unscramble.length ? ai.unscramble : [{ hint: "Where we study", emoji: "🏫", answer: "SCHOOL", tiles: ["L","O","C","S","H","O"] }];
                      const item = list[lessonUnscrambleIndex] || list[0];
                      const isChecked = lessonUnscrambleFeedback !== null;
                      const built = lessonUnscrambleSelected.map(i => item.tiles[i]).join("");

                      const handleTile = (tIdx) => {
                        if (isChecked || lessonUnscrambleSelected.includes(tIdx)) return;
                        setLessonUnscrambleSelected(prev => [...prev, tIdx]);
                      };
                      const handleRemove = (pos) => {
                        if (isChecked) return;
                        setLessonUnscrambleSelected(prev => prev.filter((_, i) => i !== pos));
                      };

                      return (
                        <div className="ai-lesson-step" style={{ paddingBottom: '120px' }}>
                          <div className="ai-lesson-step-header" style={{ marginBottom: '16px' }}>
                            <span className="ai-step-badge">🔤 Unscramble (Question {lessonUnscrambleIndex + 1} of {list.length})</span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', margin: '20px 0' }}>
                            <img src="/as1.png" alt="LISA Mascot" style={{ width: '80px', height: '80px', objectFit: 'contain' }} />
                            <div style={{ flexGrow: 1, background: 'var(--panel)', border: '2px solid var(--line)', borderRadius: '20px', padding: '16px 24px', position: 'relative' }}>
                              <div style={{ position: 'absolute', left: '-9px', top: '32px', width: '14px', height: '14px', background: 'var(--panel)', borderLeft: '2px solid var(--line)', borderBottom: '2px solid var(--line)', transform: 'rotate(45deg)' }}></div>
                              <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700' }}>{item.emoji} {item.hint}</p>
                            </div>
                          </div>

                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', margin: '24px 0', minHeight: '56px' }}>
                            {lessonUnscrambleSelected.length === 0 && <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Tap the letters below to build the word</span>}
                            {lessonUnscrambleSelected.map((tIdx, pos) => (
                              <button key={pos} type="button" onClick={() => handleRemove(pos)} disabled={isChecked}
                                style={{ background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '10px', padding: '10px 16px', fontSize: '1.3rem', fontWeight: '800', cursor: isChecked ? 'default' : 'pointer' }}>
                                {item.tiles[tIdx]}
                              </button>
                            ))}
                          </div>

                          {!isChecked && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', margin: '20px 0 30px' }}>
                              {item.tiles.map((letter, tIdx) => {
                                const used = lessonUnscrambleSelected.includes(tIdx);
                                return (
                                  <button key={tIdx} type="button" onClick={() => handleTile(tIdx)} disabled={used}
                                    style={{ background: used ? 'var(--line)' : 'var(--panel)', color: used ? 'transparent' : 'var(--text)', border: '2px solid var(--line)', borderRadius: '10px', padding: '10px 16px', fontSize: '1.3rem', fontWeight: '800', cursor: used ? 'default' : 'pointer' }}>
                                    {letter}
                                  </button>
                                );
                              })}
                            </div>
                          )}

                          {!isChecked && (
                            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                              <button type="button" className="primary-btn" style={{ padding: '12px 40px', borderRadius: '12px' }}
                                onClick={() => {
                                  const correct = built.trim().toUpperCase() === item.answer.trim().toUpperCase();
                                  setLessonUnscrambleFeedback({ isCorrect: correct, correctAnswer: item.answer });
                                }}
                                disabled={lessonUnscrambleSelected.length === 0}>
                                Check Answer
                              </button>
                            </div>
                          )}

                          {lessonUnscrambleFeedback && (
                            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: lessonUnscrambleFeedback.isCorrect ? '#d1fae5' : '#fee2e2', borderTop: `2px solid ${lessonUnscrambleFeedback.isCorrect ? '#10b981' : '#ef4444'}`, padding: '20px 40px', zIndex: 100 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', maxWidth: '1000px', margin: '0 auto' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                  <span style={{ fontSize: '2rem' }}>{lessonUnscrambleFeedback.isCorrect ? "🎉" : "❌"}</span>
                                  <div>
                                    <h4 style={{ margin: 0, color: lessonUnscrambleFeedback.isCorrect ? '#065f46' : '#991b1b', fontWeight: '800', fontSize: '1.2rem' }}>{lessonUnscrambleFeedback.isCorrect ? "Excellent!" : "Incorrect"}</h4>
                                    <p style={{ margin: '4px 0 0', color: lessonUnscrambleFeedback.isCorrect ? '#047857' : '#b91c1c', fontSize: '0.95rem' }}>{lessonUnscrambleFeedback.isCorrect ? "You unscrambled it!" : `Correct word: "${lessonUnscrambleFeedback.correctAnswer}"`}</p>
                                  </div>
                                </div>
                                <button type="button" className="primary-btn" style={{ background: lessonUnscrambleFeedback.isCorrect ? '#10b981' : '#ef4444', color: 'white', border: 'none', padding: '12px 30px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer' }}
                                  onClick={() => {
                                    setLessonUnscrambleFeedback(null);
                                    setLessonUnscrambleSelected([]);
                                    if (lessonUnscrambleIndex < list.length - 1) {
                                      setLessonUnscrambleIndex(lessonUnscrambleIndex + 1);
                                    } else {
                                      setLessonImageChoiceIndex(0);
                                      setLessonImageChoiceSel(null);
                                      setLessonImageChoiceFeedback(null);
                                      setLessonStep(11);
                                    }
                                  }}>Continue</button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* Step 11: Choose the correct picture */}
                    {lessonStep === 11 && (() => {
                      const list = ai.imageChoice && ai.imageChoice.length ? ai.imageChoice : [{ word: "school", prompt: "Tap the picture that means school", options: ["🏫","🍎","🚗"], correctIndex: 0 }];
                      const item = list[lessonImageChoiceIndex] || list[0];
                      const isChecked = lessonImageChoiceFeedback !== null;

                      return (
                        <div className="ai-lesson-step" style={{ paddingBottom: '120px' }}>
                          <div className="ai-lesson-step-header" style={{ marginBottom: '16px' }}>
                            <span className="ai-step-badge">🖼️ Choose the correct picture (Question {lessonImageChoiceIndex + 1} of {list.length})</span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', margin: '20px 0' }}>
                            <img src="/as1.png" alt="LISA Mascot" style={{ width: '80px', height: '80px', objectFit: 'contain' }} />
                            <div style={{ flexGrow: 1, background: 'var(--panel)', border: '2px solid var(--line)', borderRadius: '20px', padding: '16px 24px', position: 'relative' }}>
                              <div style={{ position: 'absolute', left: '-9px', top: '32px', width: '14px', height: '14px', background: 'var(--panel)', borderLeft: '2px solid var(--line)', borderBottom: '2px solid var(--line)', transform: 'rotate(45deg)' }}></div>
                              <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700' }}>{item.prompt}</p>
                              <p style={{ margin: '6px 0 0', fontSize: '1.4rem', fontWeight: '800', color: 'var(--accent)' }}>{item.word}</p>
                            </div>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', margin: '30px 0' }}>
                            {item.options.map((opt, oIdx) => {
                              const selected = lessonImageChoiceSel === oIdx;
                              let border = '2px solid var(--line)';
                              let bg = 'var(--panel)';
                              if (isChecked) {
                                if (oIdx === item.correctIndex) { border = '2px solid #10b981'; bg = '#d1fae5'; }
                                else if (selected) { border = '2px solid #ef4444'; bg = '#fee2e2'; }
                              } else if (selected) { border = '2px solid var(--accent)'; bg = 'rgba(var(--accent-rgb),0.05)'; }
                              return (
                                <button key={oIdx} type="button" onClick={() => { if (!isChecked) setLessonImageChoiceSel(oIdx); }} disabled={isChecked}
                                  style={{ border, background: bg, borderRadius: '20px', padding: '24px 10px', fontSize: '3.5rem', cursor: isChecked ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  {opt}
                                </button>
                              );
                            })}
                          </div>

                          {!isChecked && (
                            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                              <button type="button" className="primary-btn" style={{ padding: '12px 40px', borderRadius: '12px' }}
                                onClick={() => {
                                  const correct = lessonImageChoiceSel === item.correctIndex;
                                  setLessonImageChoiceFeedback({ isCorrect: correct });
                                }}
                                disabled={lessonImageChoiceSel === null}>Check Answer</button>
                            </div>
                          )}

                          {lessonImageChoiceFeedback && (
                            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: lessonImageChoiceFeedback.isCorrect ? '#d1fae5' : '#fee2e2', borderTop: `2px solid ${lessonImageChoiceFeedback.isCorrect ? '#10b981' : '#ef4444'}`, padding: '20px 40px', zIndex: 100 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', maxWidth: '1000px', margin: '0 auto' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                  <span style={{ fontSize: '2rem' }}>{lessonImageChoiceFeedback.isCorrect ? "🎉" : "❌"}</span>
                                  <div>
                                    <h4 style={{ margin: 0, color: lessonImageChoiceFeedback.isCorrect ? '#065f46' : '#991b1b', fontWeight: '800', fontSize: '1.2rem' }}>{lessonImageChoiceFeedback.isCorrect ? "Excellent!" : "Incorrect"}</h4>
                                    <p style={{ margin: '4px 0 0', color: lessonImageChoiceFeedback.isCorrect ? '#047857' : '#b91c1c', fontSize: '0.95rem' }}>{lessonImageChoiceFeedback.isCorrect ? "You picked the right picture!" : `Correct picture: ${item.options[item.correctIndex]}`}</p>
                                  </div>
                                </div>
                                <button type="button" className="primary-btn" style={{ background: lessonImageChoiceFeedback.isCorrect ? '#10b981' : '#ef4444', color: 'white', border: 'none', padding: '12px 30px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer' }}
                                  onClick={() => {
                                    setLessonImageChoiceFeedback(null);
                                    setLessonImageChoiceSel(null);
                                    if (lessonImageChoiceIndex < list.length - 1) {
                                      setLessonImageChoiceIndex(lessonImageChoiceIndex + 1);
                                    } else {
                                      setLessonTracingIndex(0);
                                      setLessonTracingDone(false);
                                      setLessonStep(12);
                                    }
                                  }}>Continue</button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* Step 12: Tracing on canvas */}
                    {lessonStep === 12 && (() => {
                      const list = ai.tracing && ai.tracing.length ? ai.tracing : [{ letter: "A", word: "Apple", info: "A is for Apple", sound: "Apple" }];
                      const item = list[lessonTracingIndex] || list[0];

                      const getPos = (e) => {
                        const canvas = tracingCanvasRef.current;
                        const rect = canvas.getBoundingClientRect();
                        return { x: (e.clientX - rect.left) * (canvas.width / rect.width), y: (e.clientY - rect.top) * (canvas.height / rect.height) };
                      };
                      const startDraw = (e) => {
                        const canvas = tracingCanvasRef.current;
                        const ctx = canvas.getContext("2d");
                        canvas.isDrawing = true;
                        const p = getPos(e);
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        setLessonTracingDone(true);
                      };
                      const moveDraw = (e) => {
                        const canvas = tracingCanvasRef.current;
                        if (!canvas.isDrawing) return;
                        const ctx = canvas.getContext("2d");
                        const p = getPos(e);
                        ctx.lineTo(p.x, p.y);
                        ctx.strokeStyle = "#0284c7";
                        ctx.lineWidth = 8;
                        ctx.lineCap = "round";
                        ctx.lineJoin = "round";
                        ctx.stroke();
                      };
                      const endDraw = () => { if (tracingCanvasRef.current) tracingCanvasRef.current.isDrawing = false; };
                      const clearCanvas = () => {
                        if (tracingCanvasRef.current) {
                          drawTracingGuide(tracingCanvasRef.current, item);
                          setLessonTracingDone(false);
                        }
                      };

                      return (
                        <div className="ai-lesson-step" style={{ paddingBottom: '120px' }}>
                          <div className="ai-lesson-step-header" style={{ marginBottom: '16px' }}>
                            <span className="ai-step-badge">✍️ Trace the letter (Step {lessonTracingIndex + 1} of {list.length})</span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', margin: '16px 0' }}>
                            <img src="/as1.png" alt="LISA Mascot" style={{ width: '80px', height: '80px', objectFit: 'contain' }} />
                            <div style={{ flexGrow: 1, background: 'var(--panel)', border: '2px solid var(--line)', borderRadius: '20px', padding: '16px 24px', position: 'relative' }}>
                              <div style={{ position: 'absolute', left: '-9px', top: '32px', width: '14px', height: '14px', background: 'var(--panel)', borderLeft: '2px solid var(--line)', borderBottom: '2px solid var(--line)', transform: 'rotate(45deg)' }}></div>
                              <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700' }}>{item.info}</p>
                            </div>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'center', margin: '16px 0' }}>
                            <canvas
                              ref={tracingCanvasRef}
                              width={300}
                              height={300}
                              onPointerDown={startDraw}
                              onPointerMove={moveDraw}
                              onPointerUp={endDraw}
                              onPointerLeave={endDraw}
                              style={{ border: '2px solid var(--line)', borderRadius: '16px', background: 'var(--panel)', touchAction: 'none', maxWidth: '100%' }}
                            />
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', margin: '16px 0' }}>
                            <button type="button" onClick={() => speakText(item.sound)} style={{ background: '#38bdf8', border: 'none', color: 'white', borderRadius: '12px', padding: '12px 20px', fontWeight: '800', cursor: 'pointer', fontSize: '1rem' }}>🔊 Play sound</button>
                            <button type="button" onClick={clearCanvas} style={{ background: 'var(--panel-strong)', border: '2px solid var(--line)', borderRadius: '12px', padding: '12px 20px', fontWeight: '800', cursor: 'pointer', fontSize: '1rem' }}>↺ Clear</button>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                            <button type="button" className="primary-btn" style={{ padding: '12px 40px', borderRadius: '12px' }}
                              onClick={() => {
                                if (lessonTracingIndex < list.length - 1) {
                                  setLessonTracingIndex(lessonTracingIndex + 1);
                                } else {
                                  advanceLessonStep();
                                }
                              }}
                              disabled={!lessonTracingDone}>Continue</button>
                          </div>
                        </div>
                      );
                    })()}

                  </div>
                );
              })()}
            </div>
          </div>
        )}


      {showAllAchievementsModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 10000,
          padding: '20px'
        }}>
          <div className="achievements-modal-scroll" style={{
            background: 'var(--panel)',
            border: '2px solid var(--line)',
            borderRadius: '24px',
            width: '100%',
              maxWidth: '550px',
              maxHeight: '92vh',
              overflowY: 'auto',
              padding: '30px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
              position: 'relative'
            }}>
            <button 
              onClick={() => setShowAllAchievementsModal(false)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                color: 'var(--text)',
                cursor: 'pointer'
              }}
            >✕</button>
            <h3 style={{ margin: '0 0 20px', fontSize: '1.6rem', fontWeight: '800' }}>{t("profileAllAchievements")}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { id: 1, title: "First Steps", desc: "Complete your first assessment", icon: "⭐", earned: true, color: "#f59e0b", progress: 100 },
                { id: 2, title: "Reading Star", desc: "Score 75% or higher in reading", icon: "📚", earned: calculateSkillProficiency("reading") >= 75, color: "#3b82f6", progress: Math.min(100, Math.round(calculateSkillProficiency("reading"))) },
                { id: 3, title: "Comprehension Pro", desc: "Score 75% or higher in comprehension", icon: "🧠", earned: calculateSkillProficiency("comprehension") >= 75, color: "#10b981", progress: Math.min(100, Math.round(calculateSkillProficiency("comprehension"))) },
                { id: 4, title: "Wordsmith", desc: "Score 75% or higher in writing", icon: "✍️", earned: calculateSkillProficiency("writing") >= 75, color: "#a855f7", progress: Math.min(100, Math.round(calculateSkillProficiency("writing"))) },
                { id: 5, title: "XP Collector", desc: "Earn 100 XP or more", icon: "💎", earned: userXp >= 100, color: "#e11d48", progress: Math.min(100, Math.round((userXp / 100) * 100)) },
                { id: 6, title: "Dedicated Learner", desc: "Complete 3 lessons or more", icon: "🔥", earned: completedLessons.filter(id => !id.startsWith("ach_")).length >= 3, color: "#f97316", progress: Math.min(100, Math.round((completedLessons.filter(id => !id.startsWith("ach_")).length / 3) * 100)) },
                { id: 7, title: "Speech Maestro", desc: "Score 75% or higher in pronunciation", icon: "🗣️", earned: calculateSkillProficiency("pronunciation") >= 75, color: "#06b6d4", progress: Math.min(100, Math.round(calculateSkillProficiency("pronunciation"))) },
                { id: 8, title: "Elite Scholar", desc: "Reach Progressive Level 8", icon: "🎓", earned: currentLevelNum >= 8, color: "#8b5cf6", progress: Math.min(100, Math.round((currentLevelNum / 8) * 100)) },
                { id: 9, title: "Grandmaster", desc: "Reach Progressive Level 12", icon: "👑", earned: currentLevelNum >= 12, color: "#ef4444", progress: Math.min(100, Math.round((currentLevelNum / 12) * 100)) },
              ].map((a) => (
                <div key={a.id} className={`achievement-row ${a.earned ? "earned" : ""}`} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px', border: '2px solid var(--line)', borderRadius: '16px', background: 'var(--panel-strong)', opacity: a.earned ? 1 : 0.55 }}>
                  <div className="achievement-badge-box" style={{ background: a.earned ? a.color : '#d1d5db', width: '50px', height: '50px', borderRadius: '12px', display: 'grid', placeItems: 'center', fontSize: '1.5rem', flexShrink: 0, filter: a.earned ? 'none' : 'grayscale(1)' }}>
                    <span className="achievement-badge-icon">{a.earned ? a.icon : '🔒'}</span>
                  </div>
                  <div style={{ flexGrow: 1 }}>
                    <div style={{ fontWeight: '800', color: a.earned ? 'var(--text)' : 'var(--muted)' }}>{a.title}</div>
                    <p style={{ margin: '4px 0 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>{a.desc}</p>
                    <div className="achievement-progress-track" style={{ height: '8px', background: 'var(--line)', borderRadius: '4px', overflow: 'hidden', marginTop: '8px' }}>
                      <div className="achievement-progress-fill" style={{ width: `${a.progress}%`, height: '100%', background: '#facc15' }}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      </div>
    );
  }

  // LOGIN / REGISTER SCREENS (Not Logged In)
  return (
    <main className="shell">
      <div className="brand-logo-top">
        LISA
        <span className="brand-logo-tagline">Literacy Intelligence Support Assistant</span>
      </div>
      {renderThemeToggle()}
      {renderLanguageDropdown()}
      <section className="hero-panel">
        <h1>{t("heroTitle")}</h1>
        <p className="hero-copy">{t("heroCopy")}</p>
      </section>

      <section className="auth-panel" aria-label="Authentication">
        <div className="auth-card">
          {activeTab !== "forgot" && (
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
                {t("login")}
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
                {t("register")}
              </button>
            </div>
          )}

          {activeTab === "login" && (
            <form className="auth-form active" onSubmit={handleLogin}>
              <h2>{t("welcomeBack")}</h2>
              <p>{t("signInToContinue")}</p>

              <label>
                {t("email")}
                <input
                  type="email"
                  name="loginEmail"
                  placeholder={t("emailPlaceholder")}
                  autoComplete="email"
                  required
                  disabled={submitting}
                />
              </label>

              <label>
                {t("password")}
                <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    name="loginPassword"
                    style={{ paddingRight: "44px", width: "100%" }}
                    placeholder={t("passwordPlaceholder")}
                    autoComplete="current-password"
                    required
                    disabled={submitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    style={{
                      position: "absolute",
                      right: "12px",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: "4px",
                      display: "flex",
                      alignItems: "center",
                      color: "var(--muted)",
                    }}
                  >
                    {showLoginPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </label>

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "-8px" }}>
                <button
                  type="button"
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--accent)",
                    fontWeight: "600",
                    cursor: "pointer",
                    padding: 0,
                    font: "inherit",
                  }}
                  onClick={() => {
                    setActiveTab("forgot");
                    setMessage("");
                  }}
                >
                  {t("forgotPasswordLink")}
                </button>
              </div>

              <button type="submit" className="primary-btn" disabled={submitting}>
                {submitting ? t("signingIn") : t("login")}
              </button>
              <p className="helper-text">{t("newLearnerPrompt")}</p>
            </form>
          )}

          {activeTab === "register" && (
            <form className="auth-form active" onSubmit={handleRegister}>
              <h2>{t("createProfile")}</h2>

              <div className="two-col">
                <label>
                  {t("fullName")}
                  <input
                    type="text"
                    name="fullName"
                    placeholder={t("fullNamePlaceholder")}
                    autoComplete="name"
                    required
                    disabled={submitting}
                  />
                </label>

                <label>
                  {t("age")}
                  <input
                    type="number"
                    name="age"
                    min="5"
                    max="120"
                    placeholder={t("agePlaceholder")}
                    required
                    disabled={submitting}
                  />
                </label>
              </div>

              <label>
                {t("email")}
                <input
                  type="email"
                  name="registerEmail"
                  placeholder={t("emailRegisterPlaceholder")}
                  autoComplete="email"
                  required
                  disabled={submitting}
                />
              </label>

              <label>
                {t("password")}
                <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                  <input
                    type={showRegisterPassword ? "text" : "password"}
                    name="registerPassword"
                    style={{ paddingRight: "44px", width: "100%" }}
                    placeholder={t("passwordRegisterPlaceholder")}
                    autoComplete="new-password"
                    required
                    disabled={submitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                    style={{
                      position: "absolute",
                      right: "12px",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: "4px",
                      display: "flex",
                      alignItems: "center",
                      color: "var(--muted)",
                    }}
                  >
                    {showRegisterPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </label>

              <label>
                {t("confirmPassword")}
                <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    style={{ paddingRight: "44px", width: "100%" }}
                    placeholder={t("confirmPasswordPlaceholder")}
                    autoComplete="new-password"
                    required
                    disabled={submitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{
                      position: "absolute",
                      right: "12px",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: "4px",
                      display: "flex",
                      alignItems: "center",
                      color: "var(--muted)",
                    }}
                  >
                    {showConfirmPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </label>

              <div className="two-col">
                <label>
                  {t("preferredLanguage")}
                  <select name="language" required value={selectedLanguage || ""} onChange={(e) => handleLanguageSelect(e.target.value)} disabled={submitting}>
                    <option value="" disabled>{t("selectLanguage")}</option>
                    {languages.map((language) => (
                      <option key={language} value={language}>{t(language + "Option")}</option>
                    ))}
                  </select>
                </label>
              </div>

              <label>
                {t("educationLevel")}
                <select name="educationLevel" required defaultValue="" disabled={submitting}>
                  <option value="" disabled>{t("selectEducation")}</option>
                  {educationLevels.map((ed) => (
                    <option key={ed} value={ed}>{t(ed + "Option")}</option>
                  ))}
                </select>
              </label>

              <button type="submit" className="primary-btn" disabled={submitting}>
                {submitting ? t("creatingAccount") : t("register")}
              </button>
              <p className="helper-text">{t("personalizationHelp")}</p>
            </form>
          )}

          {activeTab === "forgot" && (
            <form className="auth-form active" onSubmit={handleForgotPassword}>
              <h2>{t("resetPasswordTitle")}</h2>
              <p>{t("enterEmailForLink")}</p>

              <label>
                {t("email")}
                <input
                  type="email"
                  name="forgotEmail"
                  placeholder={t("emailPlaceholder")}
                  autoComplete="email"
                  required
                  disabled={submitting}
                />
              </label>

              <button type="submit" className="primary-btn" disabled={submitting}>
                {submitting ? t("sendingLink") : t("sendResetLink")}
              </button>

              <div style={{ display: "flex", justifyContent: "center", marginTop: "12px" }}>
                <button
                  type="button"
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--muted)",
                    fontWeight: "600",
                    cursor: "pointer",
                    padding: 0,
                    font: "inherit",
                  }}
                  onClick={() => {
                    setActiveTab("login");
                    setMessage("");
                  }}
                >
                  {t("backToLogin")}
                </button>
              </div>
            </form>
          )}

          {message ? <p className="status-message">{message}</p> : null}
        </div>
      </section>
      {!selectedLanguage && (
        <div className="lang-screen">
          <div className="lang-card">
            <h2>{t("chooseLanguage")}</h2>
            <p>{t("selectLanguagePrompt")}</p>
            <div className="lang-grid">
              {languages.map((l) => (
                <button key={l} className="lang-btn" onClick={() => handleLanguageSelect(l)}>
                  <span className="native">
                    {l === "English" && "English"}
                    {l === "Hindi" && "हिन्दी"}
                    {l === "Kannada" && "ಕನ್ನಡ"}
                    {l === "Telugu" && "తెలుగు"}
                    {l === "Tamil" && "தமிழ்"}
                  </span>
                  <span style={{ fontSize: "0.85rem", opacity: 0.7 }}>{l}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default App;