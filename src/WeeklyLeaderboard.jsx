import React, { useState, useEffect, useMemo, useRef } from "react";
import { supabase } from "./supabaseClient";

const getWeekStartDate = (d = new Date()) => {
  const date = new Date(d);
  const day = date.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  const y = date.getFullYear();
        id: p.id,
        name: p.full_name || "Learner",
        avatar: resolveAvatar(p, canUsePhoto),
        weeklyXp: p.weekly_xp || 0,
        isCurrentUser: p.id === currentUserId,
      }));

    // Ensure the current user is added ONLY IF they are NOT an admin
    const isAdminUser = currentUserEmail === "admin@gmail.com" || currentUserName?.toUpperCase().includes("ADMIN");
    if (!isAdminUser) {
      const me = rows.find((r) => r.isCurrentUser);
      if (!me) {
        rows.push({
          id: currentUserId || "me",
          name: currentUserName,
          avatar: profile ? resolveAvatar(profile, canUsePhoto) : fallbackAvatar(currentUserName),
          weeklyXp: weeklyXp !== undefined && weeklyXp !== null ? weeklyXp : 0,
          isCurrentUser: true,
        });
      } else {
        me.weeklyXp = (weeklyXp !== undefined && weeklyXp !== null) ? weeklyXp : me.weeklyXp;
        me.name = currentUserName;
        me.avatar = profile ? resolveAvatar(profile, canUsePhoto) : me.avatar;
      }
    }

    rows.sort((a, b) => b.weeklyXp - a.weeklyXp);

    // Compute dense ranks correctly
    let currentRank = 1;
    for (let i = 0; i < rows.length; i++) {
      if (i > 0 && rows[i].weeklyXp < rows[i - 1].weeklyXp) {
        currentRank = i + 1;
      }
      rows[i].rank = currentRank;
    }

    const meIndex = rows.findIndex((u) => u.isCurrentUser);
    const currentUserRank = meIndex !== -1 ? rows[meIndex].rank : 1;

    return { sorted: rows, currentUserRank };
  }, [allProfiles, currentUserId, currentUserName, currentUserEmail, weeklyXp, canUsePhoto, profile]);

  // Trigger celebratory confetti ONLY if the user is in Top 1 (#1 Rank)
  useEffect(() => {
    if (!loading && leaderboardData.currentUserRank === 1) {
      const timer = setTimeout(() => {
        triggerLeaderboardConfetti();
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [loading, leaderboardData.currentUserRank]);

  const weekDates = useMemo(() => getWeekDates(), []);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const getRankBadge = (rank) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  };

  const getRankColor = (rank) => {
    if (rank === 1) return "#f59e0b";
    if (rank === 2) return "#94a3b8";
    if (rank === 3) return "#b45309";
    return "var(--muted)";
  };

  const renderAvatar = (av) => {
    if (av.type === "photo") {
      return <img src={av.value} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />;
    }
    if (av.type === "builder") {
      const shape = av.shape === "square" ? "8px" : av.shape === "rounded" ? "24px" : "50%";
      return (
        <span style={{
          width: "100%",
          height: "100%",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          background: av.bg,
          borderRadius: shape,
        }}>
          {av.emoji}
        </span>
      );
    }
    if (av.type === "initials") {
      return (
        <span style={{
          width: "36px",
          height: "36px",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--accent)",
          color: "white",
          fontWeight: 800,
          borderRadius: "50%",
          fontSize: "0.75rem",
          flexShrink: 0,
          overflow: "hidden",
          lineHeight: 1,
        }}>
          {av.value}
        </span>
      );
    }
    return <span>{av.value}</span>;
  };

  return (
    <div className="weekly-leaderboard-container">
      <div className="weekly-leaderboard-header">
        <h2 className="weekly-leaderboard-title">{t("weeklyLeaderboardTitle")}</h2>
        <p className="weekly-leaderboard-subtitle">{t("weeklyLeaderboardSubtitle")}</p>
        <div className="weekly-leaderboard-week-range">
          {formatDate(weekDates[0])} — {formatDate(weekDates[6])}
        </div>
      </div>

      {loading ? (
        <div className="weekly-leaderboard-loading">
          <div className="leaderboard-spinner" />
          <p>{t("loadingLearners")}</p>
        </div>
      ) : leaderboardData.sorted.length === 0 ? (
        <div className="weekly-leaderboard-empty">
          <p>{t("leaderboardEmpty")}</p>
        </div>
      ) : (
        <>
          <div className="weekly-leaderboard-podium">
            {leaderboardData.sorted.slice(0, 3).map((user, idx) => {
              const rank = user.rank || (idx + 1);
              const podiumOrder = idx === 0 ? 1 : idx === 1 ? 0 : 2; // Keep visual layout of 2nd, 1st, 3rd podium columns
              return (
                <div
                  key={user.id}
                  className={`weekly-leaderboard-podium-item rank-${rank} ${user.isCurrentUser ? "is-current-user" : ""}`}
                  style={{ order: podiumOrder }}
                >
                  <div className="podium-avatar">{renderAvatar(user.avatar)}</div>
                  <div className="podium-rank-badge">{getRankBadge(rank)}</div>
                  <div className="podium-name">
                    {user.name}
                    {user.isAdmin && <span className="you-badge" style={{ background: "#f59e0b", color: "#fff", marginLeft: "4px" }}>👑 ADMIN</span>}
                    {user.isCurrentUser && !user.isAdmin && <span className="you-badge">{t("youBadge")}</span>}
                  </div>
                  <div className="podium-xp" style={{ color: getRankColor(rank) }}>
                    {user.weeklyXp.toLocaleString()} XP
                  </div>
                </div>
              );
            })}
          </div>

          <div className="weekly-leaderboard-list">
            {leaderboardData.sorted.slice(3, 10).map((user, idx) => {
              const rank = user.rank || (idx + 4);
              return (
                <div
                  key={user.id}
                  className={`weekly-leaderboard-row ${user.isCurrentUser ? "is-current-user" : ""}`}
                >
                  <div className="leaderboard-rank" style={{ color: getRankColor(rank) }}>
                    {getRankBadge(rank)}
                  </div>
                  <div className="leaderboard-avatar">{renderAvatar(user.avatar)}</div>
                  <div className="leaderboard-info">
                    <div className="leaderboard-name">
                      {user.name}
                      {user.isAdmin && <span className="you-badge" style={{ background: "#f59e0b", color: "#fff", marginLeft: "4px" }}>👑 ADMIN</span>}
                      {user.isCurrentUser && !user.isAdmin && <span className="you-badge">{t("youBadge")}</span>}
                    </div>
                  </div>
                  <div className="leaderboard-xp">{user.weeklyXp.toLocaleString()} XP</div>
                </div>
              );
            })}
          </div>

          {leaderboardData.currentUserRank > 10 && (
            <div className="weekly-leaderboard-your-rank">
              <div className="leaderboard-divider" />
              <div className="weekly-leaderboard-row is-current-user highlight">
                <div className="leaderboard-rank" style={{ color: getRankColor(leaderboardData.currentUserRank) }}>
                  {getRankBadge(leaderboardData.currentUserRank)}
                </div>
                <div className="leaderboard-avatar">
                  {renderAvatar(profile ? resolveAvatar(profile, canUsePhoto) : fallbackAvatar(currentUserName))}
                </div>
                <div className="leaderboard-info">
                  <div className="leaderboard-name">
                    {currentUserName}
                    <span className="you-badge">{t("youBadge")}</span>
                  </div>
                </div>
                <div className="leaderboard-xp" style={{ color: "var(--accent)", fontWeight: 800 }}>
                  {(weeklyXp || 0).toLocaleString()} XP
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <div className="weekly-leaderboard-footer">
        <p className="weekly-leaderboard-footer-text">
          {t("leaderboardFooter")}
        </p>
      </div>
    </div>
  );
}
