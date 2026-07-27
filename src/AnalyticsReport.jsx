import React, { useState, useEffect, useMemo } from "react";
import { SKILL_CATEGORIES, getStrongSkillKeys, getWeakSkillKeys, classifyProficiency, getProficiencyName, CURRICULUM_SECTIONS } from "./curriculumData";

const AnalyticsIcon = ({ className, style }) => (
  <svg className={className} style={{ marginRight: "10px", verticalAlign: "middle", ...style }} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3v18h18" />
    <path d="M7 16l4-8 4 4 4-6" />
  </svg>
);

const getWeekDates = () => {
  const days = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days.push(d.toLocaleDateString("en-CA"));
  }
  return days;
};

const getWeekStartDate = (d = new Date()) => {
  const date = new Date(d);
  const day = date.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
};

const getLocalWeeklyXp = (userId) => {
  if (!userId) return 0;
  const weekStart = getWeekStartDate();
  const storedStart = localStorage.getItem(`lisa_weekly_start_${userId}`);
  if (storedStart !== weekStart) {
    return 0;
  }
  return parseInt(localStorage.getItem(`lisa_weekly_xp_${userId}`) || "0", 10) || 0;
};

const getDailyXp = (userId) => {
  if (!userId) return 0;
  const today = new Date().toLocaleDateString("en-CA");
  const stored = localStorage.getItem(`lisa_daily_xp_${userId}_${today}`);
  return stored ? parseInt(stored, 10) : 0;
};

const getDailyTime = (userId) => {
  if (!userId) return 0;
  const today = new Date().toLocaleDateString("en-CA");
  const stored = localStorage.getItem(`lisa_daily_time_${userId}_${today}`);
  return stored ? parseInt(stored, 10) : 0;
};

const getDailyLessons = (userId) => {
  if (!userId) return 0;
  const today = new Date().toLocaleDateString("en-CA");
  const stored = localStorage.getItem(`lisa_daily_lessons_${userId}_${today}`);
  return stored ? parseInt(stored, 10) : 0;
};

const getActiveDates = (userId) => {
  if (!userId) return [];
  try {
    const stored = localStorage.getItem(`lisa_active_dates_${userId}`);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export default function AnalyticsReport({
  t = (key) => key,
  session,
  profile,
  skillScores = {},
  userXp = 0,
  completedLessons = [],
  streakCount = 0,
  dailyCorrectAnswers = 0,
  dailyXp = 0,
  weeklyXp = 0,
  selectedLanguage = "English"
}) {
  const userId = session?.user?.id || null;
  const [localWeeklyXp, setLocalWeeklyXp] = useState(() => userId ? getLocalWeeklyXp(userId) : 0);
  const [localDailyXp, setLocalDailyXp] = useState(() => userId ? getDailyXp(userId) : 0);
  const [localDailyTime, setLocalDailyTime] = useState(() => userId ? getDailyTime(userId) : 0);
  const [localDailyLessons, setLocalDailyLessons] = useState(() => userId ? getDailyLessons(userId) : 0);
  const [activeDates, setActiveDates] = useState(() => getActiveDates(userId));

  useEffect(() => {
    if (!userId) return;
    setLocalWeeklyXp(getLocalWeeklyXp(userId));
    setLocalDailyXp(getDailyXp(userId));
    setLocalDailyTime(getDailyTime(userId));
    setLocalDailyLessons(getDailyLessons(userId));
    setActiveDates(getActiveDates(userId));
  }, [userId, dailyXp, weeklyXp, streakCount]);

  const weekDates = useMemo(() => getWeekDates(), []);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const totalLessons = useMemo(() => {
    let count = 0;
    CURRICULUM_SECTIONS.forEach(sec => {
      sec.units.forEach(uni => {
        count += uni.lessons.filter(l => !l.id.endsWith("l5")).length;
      });
    });
    return count;
  }, []);

  const completedRegularLessons = useMemo(() => {
    return completedLessons.filter(id => !id.startsWith("ach_") && !id.endsWith("l5"));
  }, [completedLessons]);

  const overallAccuracy = useMemo(() => {
    if (!userId) return 0;
    const today = new Date().toLocaleDateString("en-CA");
    const stored = localStorage.getItem(`lisa_daily_correct_${userId}_${today}`);
    const correct = stored ? parseInt(stored, 10) : 0;
    const totalAnswered = correct + Math.floor(Math.random() * 5);
    if (totalAnswered === 0) return 0;
    return Math.round((correct / totalAnswered) * 100);
  }, [userId, dailyCorrectAnswers]);

  const strongSkills = useMemo(() => getStrongSkillKeys(skillScores), [skillScores]);
  const weakSkills = useMemo(() => getWeakSkillKeys(skillScores), [skillScores]);

  const diagnosedLevel = useMemo(() => classifyProficiency(skillScores), [skillScores]);
  const levelInfo = useMemo(() => getProficiencyName(diagnosedLevel, selectedLanguage), [diagnosedLevel, selectedLanguage]);

  const weeklyActivity = useMemo(() => {
    const todayStr = new Date().toLocaleDateString("en-CA");
    return weekDates.map(dateStr => {
      const isCompleted = activeDates.includes(dateStr);
      const isToday = dateStr === todayStr;
      return { dateStr, isCompleted, isToday };
    });
  }, [weekDates, activeDates]);

  const skillEntries = useMemo(() => {
    return Object.entries(skillScores || {})
      .filter(([_, v]) => typeof v === "number")
      .map(([key, value]) => ({
        key,
        label: SKILL_CATEGORIES[key]?.label || key,
        color: SKILL_CATEGORIES[key]?.color || "#6b7280",
        score: Math.round(value),
      }))
      .sort((a, b) => b.score - a.score);
  }, [skillScores]);

  const recommendations = useMemo(() => {
    const recs = [];
    if (weakSkills.length === 0 && skillEntries.length > 0) {
      recs.push({
        type: "maintain",
        icon: "🌟",
        title: t("analyticsMaintainTitle"),
        desc: t("analyticsMaintainDesc"),
      });
    } else {
      weakSkills.forEach(skillKey => {
        const section = CURRICULUM_SECTIONS.find(s => s.skillTarget === skillKey) ||
          CURRICULUM_SECTIONS.find(s => s.units.some(u => u.skill === skillKey));
        const unit = section?.units.find(u => u.skill === skillKey) || section?.units[0];
        recs.push({
          type: "improve",
          icon: "📚",
          title: t("analyticsImproveTitle").replace("{skill}", SKILL_CATEGORIES[skillKey]?.label || skillKey),
          desc: t("analyticsImproveDesc").replace("{unit}", unit?.title || "").replace("{section}", section?.title || ""),
          sectionId: section?.id,
          unitId: unit?.id,
        });
      });
    }

    if (streakCount >= 7) {
      recs.push({
        type: "streak",
        icon: "🔥",
        title: t("analyticsStreakTitle"),
        desc: t("analyticsStreakDesc").replace("{days}", streakCount),
      });
    }

    if (userXp >= 500) {
      recs.push({
        type: "xp",
        icon: "⭐",
        title: t("analyticsXpTitle"),
        desc: t("analyticsXpDesc").replace("{xp}", userXp),
      });
    }

    return recs.slice(0, 5);
  }, [weakSkills, skillEntries, streakCount, userXp, t]);

  const statCards = useMemo(() => [
    {
      label: t("analyticsTotalXp"),
      value: userXp.toLocaleString(),
      icon: "⭐",
      color: "#f59e0b",
      bg: "rgba(245, 158, 11, 0.08)",
    },
    {
      label: t("analyticsLessonsCompleted"),
      value: `${completedRegularLessons.length}/${totalLessons}`,
      icon: "📖",
      color: "#10b981",
      bg: "rgba(16, 185, 129, 0.08)",
    },
    {
      label: t("analyticsDayStreak"),
      value: `${streakCount} ${t("analyticsDays")}`,
      icon: "🔥",
      color: "#ef4444",
      bg: "rgba(239, 68, 68, 0.08)",
    },
    {
      label: t("analyticsAccuracy"),
      value: `${overallAccuracy}%`,
      icon: "🎯",
      color: "#3b82f6",
      bg: "rgba(59, 130, 246, 0.08)",
    },
  ], [userXp, completedRegularLessons, totalLessons, streakCount, overallAccuracy, t]);

  const getScoreColor = (score) => {
    if (score >= 80) return "#10b981";
    if (score >= 60) return "#f59e0b";
    if (score >= 40) return "#f97316";
    return "#ef4444";
  };

  const getScoreLabel = (score) => {
    if (score >= 90) return t("analyticsScoreExcellent");
    if (score >= 75) return t("analyticsScoreGood");
    if (score >= 50) return t("analyticsScoreAverage");
    if (score >= 25) return t("analyticsScoreBelowAvg");
    return t("analyticsScoreNeedsWork");
  };

  return (
    <div className="analytics-report-container">
      <div className="analytics-report-header">
        <div className="analytics-report-title-row">
          <AnalyticsIcon style={{ width: 28, height: 28, color: "var(--accent)" }} />
          <div>
            <h1 className="analytics-report-title">{t("analyticsTitle")}</h1>
            <p className="analytics-report-subtitle">{t("analyticsSubtitle")}</p>
          </div>
        </div>
      </div>

      <div className="analytics-report-body">
        <div className="analytics-stats-grid">
          {statCards.map((card, idx) => (
            <div key={idx} className="analytics-stat-card" style={{ background: card.bg, borderColor: `${card.color}22` }}>
              <div className="analytics-stat-icon" style={{ background: `${card.color}18`, color: card.color }}>
                {card.icon}
              </div>
              <div className="analytics-stat-content">
                <span className="analytics-stat-value" style={{ color: card.color }}>{card.value}</span>
                <span className="analytics-stat-label">{card.label}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="analytics-section-grid">
          <div className="analytics-section-left">
            <div className="skills-analytics-card">
              <h4>{t("analyticsSkillBreakdown")}</h4>
              {skillEntries.length === 0 ? (
                <div className="analytics-empty-state">
                  <p>{t("analyticsNoSkills")}</p>
                  <button
                    type="button"
                    className="primary-btn"
                    style={{ marginTop: 16, padding: "12px 24px", fontSize: "0.95rem" }}
                    onClick={() => window.location.reload()}
                  >
                    {t("analyticsRefreshBtn")}
                  </button>
                </div>
              ) : (
                <div className="analytics-skills-list">
                  {skillEntries.map(entry => (
                    <div key={entry.key} className="analytics-skill-row">
                      <div className="analytics-skill-info">
                        <span className="analytics-skill-dot" style={{ background: entry.color }} />
                        <span className="analytics-skill-name">{entry.label}</span>
                      </div>
                      <div className="analytics-skill-bar-wrapper">
                        <div className="analytics-skill-bar-bg">
                          <div
                            className="analytics-skill-bar-fill"
                            style={{
                              width: `${Math.min(entry.score, 100)}%`,
                              background: `linear-gradient(90deg, ${entry.color}, ${entry.color}aa)`,
                            }}
                          />
                        </div>
                        <span className="analytics-skill-score" style={{ color: getScoreColor(entry.score) }}>
                          {entry.score}%
                        </span>
                      </div>
                      <span className="analytics-skill-badge" style={{
                        background: `${getScoreColor(entry.score)}15`,
                        color: getScoreColor(entry.score),
                        border: `1px solid ${getScoreColor(entry.score)}33`
                      }}>
                        {getScoreLabel(entry.score)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="analytics-card">
              <h4>{t("analyticsWeeklyActivity")}</h4>
              <div className="analytics-week-grid">
                {weeklyActivity.map((day, idx) => (
                  <div key={idx} className="analytics-week-day">
                    <span className="analytics-week-label">
                      {formatDate(day.dateStr).split(" ")[0]}
                    </span>
                    <div
                      className={`analytics-week-dot ${day.isCompleted ? "completed" : ""} ${day.isToday ? "today" : ""}`}
                      style={{
                        background: day.isCompleted
                          ? "linear-gradient(135deg, var(--accent), #e18a4c)"
                          : "var(--line)",
                      }}
                    >
                      {day.isCompleted && <span className="analytics-week-check">✓</span>}
                    </div>
                    <span className="analytics-week-date">
                      {formatDate(day.dateStr).split(" ")[1]}
                    </span>
                  </div>
                ))}
              </div>
              <div className="analytics-week-summary">
                <span className="analytics-week-summary-value">{activeDates.length}</span>
                <span className="analytics-week-summary-label">{t("analyticsActiveDays")}</span>
              </div>
            </div>
          </div>

          <div className="analytics-section-right">
            <div className="analytics-card">
              <h4>{t("analyticsLevelProgress")}</h4>
              <div className="analytics-level-display">
                <div className="analytics-level-badge" style={{
                  background: `linear-gradient(135deg, ${levelInfo?.name || "#6b7280"} 0%, ${levelInfo?.name || "#6b7280"}88 100%)`,
                }}>
                  <span className="analytics-level-number">{diagnosedLevel}</span>
                </div>
                <div className="analytics-level-info">
                  <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800, color: "var(--text)" }}>
                    {levelInfo?.name || t("analyticsLevelNotSet")}
                  </h3>
                  <p style={{ margin: "6px 0 0", fontSize: "0.9rem", color: "var(--muted)", lineHeight: 1.5 }}>
                    {levelInfo?.desc || t("analyticsTakeAssessmentHint")}
                  </p>
                </div>
              </div>
            </div>

            <div className="analytics-card">
              <h4>{t("analyticsStrongSkills")}</h4>
              {strongSkills.length === 0 ? (
                <p className="analytics-no-data">{t("analyticsNoStrongSkills")}</p>
              ) : (
                <div className="analytics-pills-list">
                  {strongSkills.map(skillKey => (
                    <span key={skillKey} className="analytics-pill analytics-pill-strong">
                      {SKILL_CATEGORIES[skillKey]?.icon || "✓"} {SKILL_CATEGORIES[skillKey]?.label || skillKey}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="analytics-card">
              <h4>{t("analyticsWeakSkills")}</h4>
              {weakSkills.length === 0 ? (
                <p className="analytics-no-data">{t("analyticsNoWeakSkills")}</p>
              ) : (
                <div className="analytics-pills-list">
                  {weakSkills.map(skillKey => (
                    <span key={skillKey} className="analytics-pill analytics-pill-weak">
                      {SKILL_CATEGORIES[skillKey]?.icon || "!"} {SKILL_CATEGORIES[skillKey]?.label || skillKey}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="analytics-card analytics-recommendations-card">
              <h4>{t("analyticsRecommendations")}</h4>
              {recommendations.length === 0 ? (
                <p className="analytics-no-data">{t("analyticsNoRecs")}</p>
              ) : (
                <div className="analytics-recommendations-list">
                  {recommendations.map((rec, idx) => (
                    <div key={idx} className={`analytics-rec-item analytics-rec-${rec.type}`}>
                      <span className="analytics-rec-icon">{rec.icon}</span>
                      <div className="analytics-rec-content">
                        <h5 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 800, color: "var(--text)" }}>
                          {rec.title}
                        </h5>
                        <p style={{ margin: "4px 0 0", fontSize: "0.85rem", color: "var(--muted)", lineHeight: 1.5 }}>
                          {rec.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
