import React, { useState, useEffect, useMemo, useRef } from "react";
import { supabase } from "./supabaseClient";

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

const getWeekDates = () => {
  const days = [];
  const weekStart = getWeekStartDate();
  const start = new Date(weekStart + "T00:00:00");
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    days.push(d.toLocaleDateString("en-CA"));
  }
  return days;
};

// Derive up-to-2-letter initials from a name (e.g. "Likhith SP" -> "LS").
const getInitials = (name) => {
  if (!name) return "U";
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return parts[0].slice(0, 2).toUpperCase();
};

// When a user has no photo and no shop/emoji avatar, fall back to initials
// rendered in a colored circle.
const fallbackAvatar = (name) => ({ type: "initials", value: getInitials(name) });

// Normalize the current user's locally-stored avatar (which may be a photo
// URL string, an emoji string, or a builder/emoji JSON object from the shop)
// into the { type, value } shape used by the leaderboard.
const normalizeCurrentAvatar = (av, canUsePhoto, fallbackName = "") => {
  if (!av) return fallbackAvatar(fallbackName);
  if (typeof av === "string" && av.startsWith("{")) {
    try { av = JSON.parse(av); } catch (e) {}
  }
  if (typeof av === "string") {
    if (av.startsWith("http")) {
      return canUsePhoto
        ? { type: "photo", value: av }
        : fallbackAvatar(fallbackName);
    }
    return { type: "emoji", value: av };
  }
  if (av && typeof av === "object") {
    if (av.type === "builder") {
      return { type: "builder", emoji: av.emoji, bg: av.bg, shape: av.shape };
    }
    if (av.type === "emoji" && av.emoji) {
      return { type: "emoji", value: av.emoji };
    }
  }
  return fallbackAvatar(fallbackName);
};

// Resolve what to show for an avatar:
//  - a photo (avatar_url) only when the learner is allowed to use a custom picture (canUsePhoto)
//  - an emoji avatar (avatar_emoji) if set
//  - otherwise initials in a circle
const resolveAvatar = (u, canUsePhoto) => {
  let av = u.avatar_emoji;
  if (av && typeof av === "string" && av.startsWith("{")) {
    try { av = JSON.parse(av); } catch (e) {}
  }
  if (canUsePhoto && u.avatar_url && u.avatar_url.startsWith("http")) {
    return { type: "photo", value: u.avatar_url };
  }
  if (av) {
    if (typeof av === "object") {
      if (av.type === "builder") {
        return { type: "builder", emoji: av.emoji, bg: av.bg, shape: av.shape };
      }
      if (av.type === "emoji" && av.emoji) {
        return { type: "emoji", value: av.emoji };
      }
    }
    return { type: "emoji", value: av };
  }
  return fallbackAvatar(u.full_name);
};

export default function WeeklyLeaderboard({ t = (key) => key, session, profile, weeklyXp, canUsePhoto }) {
  const [allProfiles, setAllProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentUserId = session?.user?.id || null;
  const currentUserName = profile?.full_name || session?.user?.user_metadata?.full_name || "You";
  const pollRef = useRef(null);

  // Fetch real users from Supabase (ordered by weekly_xp) so the leaderboard
  // reflects actual learners, not demo data.
  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_emoji, avatar_url, xp, weekly_xp, weekly_start")
        .order("weekly_xp", { ascending: false })
        .limit(100);

      if (error) throw error;

      const weekStart = getWeekStartDate();
      const cleaned = (data || []).map((p) => {
        let wx = p.weekly_start && p.weekly_start !== weekStart ? 0 : (p.weekly_xp || 0);
        return {
          ...p,
          weekly_xp: wx,
        };
      });

      setAllProfiles(cleaned);
    } catch (err) {
      console.warn("Could not load weekly leaderboard:", err);
      setAllProfiles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
    pollRef.current = setInterval(fetchLeaderboard, 15000);
    return () => clearInterval(pollRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const leaderboardData = useMemo(() => {
    const rows = allProfiles.map((p) => ({
      id: p.id,
      name: p.full_name || "Learner",
      avatar: resolveAvatar(p, canUsePhoto),
      weeklyXp: p.weekly_xp || 0,
      isCurrentUser: p.id === currentUserId,
    }));

    // Ensure the current user is always present using their live local weekly XP.
    const me = rows.find((r) => r.isCurrentUser);
    if (!me) {
      rows.push({
        id: currentUserId || "me",
        name: currentUserName,
        avatar: profile ? resolveAvatar(profile, canUsePhoto) : fallbackAvatar(currentUserName),
        weeklyXp: weeklyXp || 0,
        isCurrentUser: true,
      });
    } else {
      me.weeklyXp = weeklyXp || me.weeklyXp;
      me.name = currentUserName;
      me.avatar = profile ? resolveAvatar(profile, canUsePhoto) : me.avatar;
    }

    rows.sort((a, b) => b.weeklyXp - a.weeklyXp);

    const currentUserRank = rows.findIndex((u) => u.isCurrentUser) + 1;
    return { sorted: rows, currentUserRank };
  }, [allProfiles, currentUserId, currentUserName, weeklyXp, canUsePhoto, profile]);

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
              const rank = idx + 1;
              const podiumOrder = rank === 1 ? 1 : rank === 2 ? 0 : 2;
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
                    {user.isCurrentUser && <span className="you-badge">{t("youBadge")}</span>}
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
              const rank = idx + 4;
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
                      {user.isCurrentUser && <span className="you-badge">{t("youBadge")}</span>}
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
