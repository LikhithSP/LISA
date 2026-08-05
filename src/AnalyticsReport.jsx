import React, { useState, useEffect, useMemo } from "react";
import { 
  ArrowLeft, 
  TrendingUp, 
  Award, 
  BookOpen, 
  Flame, 
  Target, 
  Calendar, 
  Sparkles, 
  Activity, 
  RefreshCw 
} from "lucide-react";
import { 
  SKILL_CATEGORIES, 
  getStrongSkillKeys, 
  getWeakSkillKeys, 
  classifyProficiency, 
  getProficiencyName, 
  CURRICULUM_SECTIONS 
} from "./curriculumData";

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
  selectedLanguage = "English",
  onBack
}) {
  const userId = session?.user?.id || null;
  const todayStr = useMemo(() => new Date().toLocaleDateString("en-CA"), []);

  // Database-driven metrics (zero localStorage dependency)
  const isProfileToday = profile?.daily_quest_date === todayStr;
  const localDailyXp = isProfileToday ? (profile?.daily_xp || 0) : 0;
  const localDailyTime = isProfileToday ? (profile?.daily_time_spent || 0) : 0;
  const localDailyLessons = isProfileToday ? (profile?.daily_lessons || 0) : 0;
  
  const activeDates = useMemo(() => {
    return Array.isArray(profile?.streak_dates) ? profile.streak_dates : [];
  }, [profile]);

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

  // Overall accuracy calculated from actual assessment attempts history in Supabase database
  const overallAccuracy = useMemo(() => {
    if (!profile) return 80;
    const history = profile.attempts_history || [];
    if (history.length > 0) {
      let totalCorrect = 0;
      let totalQuestions = 0;
      history.forEach(att => {
        totalCorrect += (att.score || 0);
        totalQuestions += 40; // baseline diagnostic questions
      });
      return Math.round((totalCorrect / totalQuestions) * 100);
    }
    // Fallback database calculations using daily stats
    const correct = isProfileToday ? (profile.daily_correct_answers || 0) : 0;
    const lessons = isProfileToday ? (profile.daily_lessons || 0) : 0;
    const totalAnswered = lessons > 0 ? (lessons * 10) : (correct > 0 ? correct + 2 : 0);
    if (totalAnswered === 0) return 80;
    return Math.min(100, Math.round((correct / totalAnswered) * 100));
  }, [profile, isProfileToday]);

  const strongSkills = useMemo(() => getStrongSkillKeys(skillScores), [skillScores]);
  const weakSkills = useMemo(() => getWeakSkillKeys(skillScores), [skillScores]);

  const diagnosedLevel = useMemo(() => classifyProficiency(skillScores), [skillScores]);
  const levelInfo = useMemo(() => getProficiencyName(diagnosedLevel, selectedLanguage), [diagnosedLevel, selectedLanguage]);

  // Generate dynamic weekly activity and XP data from attempts history + streak dates (all DB-driven)
  const weeklyXpData = useMemo(() => {
    const daysData = [];
    const history = profile?.attempts_history || [];
    const streakDates = activeDates;
    
    // Get last 7 days of the week leading to today
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(new Date().getDate() - i);
      const dateStr = d.toLocaleDateString("en-CA");
      const dayLabel = d.toLocaleDateString("en-US", { weekday: "short" });
      const dayNum = d.toLocaleDateString("en-US", { day: "numeric" });
      
      // Sum attempt scores for this date in Supabase
      let xpForDay = 0;
      history.forEach(att => {
        const attDate = att.timestamp ? att.timestamp.substring(0, 10) : (att.date ? att.date.substring(0, 10) : "");
        if (attDate === dateStr) {
          xpForDay += (att.score || 0) * 10; // 10 XP per point
        }
      });
      
      // Seed active days with base XP if they have no explicit diagnostic attempt
      if (xpForDay === 0 && streakDates.includes(dateStr)) {
        xpForDay = 20; // baseline activity XP
      }
      
      // Override today's value with the profile daily_xp
      if (dateStr === todayStr && isProfileToday) {
        xpForDay = Math.max(xpForDay, profile.daily_xp || 0);
      }
      
      daysData.push({
        dayLabel,
        dayNum,
        dateStr,
        xp: xpForDay,
        isActive: streakDates.includes(dateStr),
        isToday: dateStr === todayStr
      });
    }
    return daysData;
  }, [profile, activeDates, todayStr, isProfileToday]);

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
        title: t("analyticsMaintainTitle") || "Keep up the excellent work!",
        desc: t("analyticsMaintainDesc") || "You have established strong proficiency in all diagnosed literacy areas. Continue exploring new topics!",
      });
    } else {
      weakSkills.forEach(skillKey => {
        const section = CURRICULUM_SECTIONS.find(s => s.skillTarget === skillKey) ||
          CURRICULUM_SECTIONS.find(s => s.units.some(u => u.skill === skillKey));
        const unit = section?.units.find(u => u.skill === skillKey) || section?.units[0];
        recs.push({
          type: "improve",
          icon: "📚",
          title: (t("analyticsImproveTitle") || "Practice {skill}").replace("{skill}", SKILL_CATEGORIES[skillKey]?.label || skillKey),
          desc: (t("analyticsImproveDesc") || "Target lessons in {unit} under {section}").replace("{unit}", unit?.title || "").replace("{section}", section?.title || ""),
          sectionId: section?.id,
          unitId: unit?.id,
        });
      });
    }

    if (streakCount >= 3) {
      recs.push({
        type: "streak",
        icon: "🔥",
        title: t("analyticsStreakTitle") || "Unstoppable Learning!",
        desc: (t("analyticsStreakDesc") || "You're on a {days} day streak. Keep playing daily!").replace("{days}", streakCount),
      });
    }

    if (userXp >= 100) {
      recs.push({
        type: "xp",
        icon: "⭐",
        title: t("analyticsXpTitle") || "XP Milestone Achieved!",
        desc: (t("analyticsXpDesc") || "You have accumulated {xp} total XP. Incredible milestone!").replace("{xp}", userXp),
      });
    }

    return recs.slice(0, 4);
  }, [weakSkills, skillEntries, streakCount, userXp, t]);

  const getScoreColor = (score) => {
    if (score >= 80) return "#10b981"; // green
    if (score >= 60) return "#f59e0b"; // yellow
    if (score >= 40) return "#f97316"; // orange
    return "#ef4444"; // red
  };

  const getScoreLabel = (score) => {
    if (score >= 90) return t("analyticsScoreExcellent") || "Excellent";
    if (score >= 75) return t("analyticsScoreGood") || "Good";
    if (score >= 50) return t("analyticsScoreAverage") || "Average";
    if (score >= 25) return t("analyticsScoreBelowAvg") || "Below Average";
    return t("analyticsScoreNeedsWork") || "Needs Work";
  };

  // SVG Donut Chart variables
  const rSize = 140;
  const strokeW = 12;
  const centerCoord = rSize / 2;
  const radius = centerCoord - strokeW;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overallAccuracy / 100) * circumference;

  // Find max XP for bar scaling
  const maxWeeklyXp = Math.max(...weeklyXpData.map(d => d.xp), 50);

  return (
    <div className="analytics-report-container">
      <div className="analytics-report-header">
        <div className="analytics-report-title-row">
          {onBack && (
            <button className="analytics-back-btn" onClick={onBack} aria-label="Back to Dashboard">
              <ArrowLeft size={16} style={{ strokeWidth: 3 }} />
              <span className="analytics-back-btn-text">{t("analyticsBack") || "Back"}</span>
            </button>
          )}
          <div className="analytics-title-content">
            <h1 className="analytics-report-title">
              <Activity className="analytics-title-icon" />
              {t("analyticsTitle") || "Performance Report"}
            </h1>
            <p className="analytics-report-subtitle">{t("analyticsSubtitle") || "Inspect your real-time literacy progression & metrics"}</p>
          </div>
        </div>
      </div>

      <div className="analytics-report-body">
        {/* STATS HIGHLIGHT GRID */}
        <div className="analytics-stats-grid">
          <div className="analytics-stat-card card-xp">
            <div className="analytics-stat-icon">⭐</div>
            <div className="analytics-stat-content">
              <span className="analytics-stat-value">{userXp.toLocaleString()}</span>
              <span className="analytics-stat-label">{t("analyticsTotalXp") || "Total XP"}</span>
            </div>
          </div>

          <div className="analytics-stat-card card-lessons">
            <div className="analytics-stat-icon">📖</div>
            <div className="analytics-stat-content">
              <span className="analytics-stat-value">{completedRegularLessons.length}/{totalLessons}</span>
              <span className="analytics-stat-label">{t("analyticsLessonsCompleted") || "Lessons"}</span>
            </div>
          </div>

          <div className="analytics-stat-card card-streak">
            <div className="analytics-stat-icon">🔥</div>
            <div className="analytics-stat-content">
              <span className="analytics-stat-value">{streakCount} {t("analyticsDays") || "Days"}</span>
              <span className="analytics-stat-label">{t("analyticsDayStreak") || "Streak"}</span>
            </div>
          </div>

          <div className="analytics-stat-card card-accuracy">
            <div className="analytics-stat-icon">🎯</div>
            <div className="analytics-stat-content">
              <span className="analytics-stat-value">{overallAccuracy}%</span>
              <span className="analytics-stat-label">{t("analyticsAccuracy") || "Accuracy"}</span>
            </div>
          </div>
        </div>

        {/* VISUAL DATA VISUALIZATION GRID */}
        <div className="visualization-section-row">
          {/* SVG WEEKLY XP PROGRESSION BAR GRAPH */}
          <div className="analytics-visual-card bar-chart-card">
            <div className="card-header-with-icon">
              <TrendingUp size={20} className="header-icon" />
              <h4>{t("analyticsWeeklyActivity") || "Weekly XP Activity"}</h4>
            </div>
            
            <div className="svg-bar-graph-wrapper">
              <svg viewBox="0 0 500 240" className="svg-bar-chart">
                {/* Horizontal Guide Lines */}
                <line x1="40" y1="40" x2="480" y2="40" className="chart-grid-line" />
                <line x1="40" y1="100" x2="480" y2="100" className="chart-grid-line" />
                <line x1="40" y1="160" x2="480" y2="160" className="chart-grid-line" />
                <line x1="40" y1="200" x2="480" y2="200" className="chart-grid-line" />

                {/* Y Axis Labels */}
                <text x="30" y="44" className="chart-axis-text text-right">{maxWeeklyXp}</text>
                <text x="30" y="104" className="chart-axis-text text-right">{Math.round(maxWeeklyXp * 0.7)}</text>
                <text x="30" y="164" className="chart-axis-text text-right">{Math.round(maxWeeklyXp * 0.3)}</text>
                <text x="30" y="204" className="chart-axis-text text-right">0</text>

                {/* Rendering Bars */}
                {weeklyXpData.map((day, idx) => {
                  const barWidth = 36;
                  const spacing = 60;
                  const x = 55 + idx * spacing;
                  const maxBarHeight = 150; // 200 - 50
                  const barHeight = (day.xp / maxWeeklyXp) * maxBarHeight;
                  const y = 200 - barHeight;

                  return (
                    <g key={idx} className="chart-bar-group">
                      {/* Interactive hover tooltip trigger */}
                      <rect 
                        x={x - 8} 
                        y="15" 
                        width={barWidth + 16} 
                        height="200" 
                        fill="transparent" 
                        className="bar-hover-zone"
                      />
                      
                      {/* Background slot */}
                      <rect 
                        x={x} 
                        y="50" 
                        width={barWidth} 
                        height="150" 
                        rx="8" 
                        className="bar-bg-slot"
                      />
                      
                      {/* Active XP Bar */}
                      {day.xp > 0 && (
                        <rect 
                          x={x} 
                          y={y} 
                          width={barWidth} 
                          height={barHeight} 
                          rx="8" 
                          className={`bar-fill-graphic ${day.isToday ? "today-bar" : ""}`}
                          fill={day.isToday ? "url(#todayGrad)" : "url(#barGrad)"}
                        />
                      )}

                      {/* Tooltip value */}
                      <text 
                        x={x + barWidth / 2} 
                        y={Math.min(y - 8, 190)} 
                        className="bar-tooltip-val"
                      >
                        {day.xp} XP
                      </text>

                      {/* X Axis labels */}
                      <text 
                        x={x + barWidth / 2} 
                        y="222" 
                        className={`chart-axis-text text-center ${day.isToday ? "today-label" : ""}`}
                      >
                        {day.dayLabel}
                      </text>
                      <text 
                        x={x + barWidth / 2} 
                        y="234" 
                        className="chart-axis-subtext text-center"
                      >
                        {day.dayNum}
                      </text>
                    </g>
                  );
                })}

                {/* Gradients */}
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent)" />
                    <stop offset="100%" stopColor="#df7f3d" />
                  </linearGradient>
                  <linearGradient id="todayGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            
            <div className="analytics-week-summary">
              <Calendar size={16} className="summary-icon" />
              <span className="analytics-week-summary-value">
                {activeDates.filter(d => {
                  const dayDate = new Date(d);
                  const limit = new Date();
                  limit.setDate(limit.getDate() - 7);
                  return dayDate >= limit;
                }).length}
              </span>
              <span className="analytics-week-summary-label">{t("analyticsActiveDays") || "Active days in last week"}</span>
            </div>
          </div>

          {/* SVG DONUT CHART FOR ACCURACY RELATION */}
          <div className="analytics-visual-card donut-chart-card">
            <div className="card-header-with-icon">
              <Target size={20} className="header-icon" />
              <h4>{t("analyticsAccuracy") || "Accuracy Distribution"}</h4>
            </div>

            <div className="donut-chart-flex">
              <div className="donut-chart-container">
                <svg width={rSize} height={rSize} className="donut-svg">
                  {/* Background Ring */}
                  <circle
                    className="donut-ring-bg"
                    stroke="var(--line)"
                    fill="transparent"
                    strokeWidth={strokeW}
                    r={radius}
                    cx={centerCoord}
                    cy={centerCoord}
                  />
                  {/* Foreground Accuracy Fill */}
                  <circle
                    className="donut-ring-fill"
                    stroke={getScoreColor(overallAccuracy)}
                    fill="transparent"
                    strokeWidth={strokeW}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    r={radius}
                    cx={centerCoord}
                    cy={centerCoord}
                    transform={`rotate(-90 ${centerCoord} ${centerCoord})`}
                  />
                </svg>
                <div className="donut-inner-content">
                  <span className="donut-pct" style={{ color: getScoreColor(overallAccuracy) }}>
                    {overallAccuracy}%
                  </span>
                  <span className="donut-lbl">{t("analyticsAccuracy") || "Accuracy"}</span>
                </div>
              </div>

              <div className="donut-legend">
                <div className="legend-row">
                  <span className="legend-dot" style={{ background: getScoreColor(overallAccuracy) }} />
                  <span className="legend-label">Correct ({overallAccuracy}%)</span>
                </div>
                <div className="legend-row">
                  <span className="legend-dot" style={{ background: "#ef4444" }} />
                  <span className="legend-label">Incorrect ({100 - overallAccuracy}%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CORE REPORT GRID */}
        <div className="analytics-section-grid">
          <div className="analytics-section-left">
            {/* SKILLS BREAKDOWN LIST */}
            <div className="skills-analytics-card">
              <div className="card-header-with-icon">
                <Award size={20} className="header-icon" style={{ color: "var(--accent)" }} />
                <h4>{t("analyticsSkillBreakdown") || "Literacy Skills Breakdown"}</h4>
              </div>
              
              {skillEntries.length === 0 ? (
                <div className="analytics-empty-state">
                  <p>{t("analyticsNoSkills") || "No literacy diagnostic assessment scores stored yet."}</p>
                  <button
                    type="button"
                    className="primary-btn"
                    style={{ marginTop: 16, padding: "12px 24px", fontSize: "0.95rem" }}
                    onClick={() => window.location.reload()}
                  >
                    <RefreshCw size={14} style={{ marginRight: 6 }} />
                    {t("analyticsRefreshBtn") || "Sync Data"}
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
          </div>

          <div className="analytics-section-right">
            {/* LITERACY DIAGNOSIS CARD */}
            <div className="analytics-card level-progress-card">
              <div className="card-header-with-icon">
                <Sparkles size={20} className="header-icon" style={{ color: "#d97706" }} />
                <h4>{t("analyticsLevelProgress") || "Literacy Diagnostic Level"}</h4>
              </div>
              <div className="analytics-level-display">
                <div className="analytics-level-badge" style={{
                  background: `linear-gradient(135deg, var(--accent) 0%, #df7f3d 100%)`,
                }}>
                  <span className="analytics-level-number">{diagnosedLevel}</span>
                </div>
                <div className="analytics-level-info">
                  <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800, color: "var(--text)" }}>
                    {levelInfo?.name || t("analyticsLevelNotSet") || "Unassessed Level"}
                  </h3>
                  <p style={{ margin: "6px 0 0", fontSize: "0.9rem", color: "var(--muted)", lineHeight: 1.5 }}>
                    {levelInfo?.desc || t("analyticsTakeAssessmentHint") || "Take the Literacy Assessment on your dashboard to unlock placement."}
                  </p>
                </div>
              </div>
            </div>

            {/* STRONG SKILLS PILLS */}
            <div className="analytics-card">
              <h4>{t("analyticsStrongSkills") || "Proficient Literacy Focus Areas"}</h4>
              {strongSkills.length === 0 ? (
                <p className="analytics-no-data">{t("analyticsNoStrongSkills") || "Complete assessments to establish strengths"}</p>
              ) : (
                <div className="analytics-pills-list">
                  {strongSkills.map(skillKey => (
                    <span key={skillKey} className="analytics-pill analytics-pill-strong">
                      {SKILL_CATEGORIES[skillKey]?.label || skillKey}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* WEAK SKILLS PILLS */}
            <div className="analytics-card">
              <h4>{t("analyticsWeakSkills") || "Target Improvement Areas"}</h4>
              {weakSkills.length === 0 ? (
                <p className="analytics-no-data">{t("analyticsNoWeakSkills") || "Excellent! No priority weaknesses detected."}</p>
              ) : (
                <div className="analytics-pills-list">
                  {weakSkills.map(skillKey => (
                    <span key={skillKey} className="analytics-pill analytics-pill-weak">
                      {SKILL_CATEGORIES[skillKey]?.label || skillKey}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* AI SYSTEM PATH RECOMMENDATIONS */}
            <div className="analytics-card analytics-recommendations-card">
              <div className="card-header-with-icon">
                <BookOpen size={18} className="header-icon" style={{ color: "var(--accent)" }} />
                <h4>{t("analyticsRecommendations") || "Personalized Study Path Recommendations"}</h4>
              </div>
              {recommendations.length === 0 ? (
                <p className="analytics-no-data">{t("analyticsNoRecs") || "No recommendations at this time"}</p>
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
