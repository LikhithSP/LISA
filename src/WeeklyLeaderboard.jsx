import React, { useState, useEffect, useMemo, useRef } from "react";
import { supabase } from "./supabaseClient";

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
  const day = date.getDay(); // 0 = Sunday, 1 = Monday
  const diff = (day === 0 ? -6 : 1) - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date.toLocaleDateString("en-CA");
};

const getLocalWeeklyXp = (userId) => {
  if (!userId) return 0;
  const weekStart = getWeekStartDate();
  const storedStart = localStorage.getItem(`lisa_weekly_start_${userId}`);
  if (storedStart !== weekStart) {
    localStorage.setItem(`lisa_weekly_start_${userId}`, weekStart);
    localStorage.setItem(`lisa_weekly_xp_${userId}`, "0");
    return 0;
  }
  return parseInt(localStorage.getItem(`lisa_weekly_xp_${userId}`) || "0", 10) || 0;
};

const AVATARS = ["🦊", "🐼", "🐨", "🦁", "🐸", "🦄", "🐙", "🦋", "🐳", "🦉"];

const fallbackAvatar = (name) => {
  if (!name) return "🌟";
  const trimmed = String(name).trim();
  const letter = trimmed.charAt(0).toUpperCase();
  // Pick a stable emoji based on the name
  const idx = trimmed.charCodeAt(0) % AVATARS.length;
  return `${AVATARS[idx]}`;
};

// Resolve what to show for an avatar:
//  - a photo (avatar_url) only when the learner is allowed to use a custom picture (canUsePhoto)
//  - an emoji avatar (avatar_emoji) if set
//  - otherwise a deterministic emoji fallback
const resolveAvatar = (u, canUsePhoto) => {
  if (canUsePhoto && u.avatar_url && u.avatar_url.startsWith("http")) {
    return { type: "photo", value: u.avatar_url };
  }
  if (u.avatar_emoji) {
    return { type: "emoji", value: u.avatar_emoji };
  }
  return { type: "emoji", value: fallbackAvatar(u.full_name) };
};

export default function WeeklyLeaderboard({ session, profile, weeklyXp, canUsePhoto }) {
  const [allProfiles, setAllProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserAvatar, setCurrentUserAvatar] = useState("🌟");

  const currentUserId = session?.user?.id || null;
  const currentUserName = profile?.full_name || session?.user?.user_metadata?.full_name || "You";
  const pollRef = useRef(null);

  // Track the current user's live weekly XP locally so it stays fresh.
  const [liveWeeklyXp, setLiveWeeklyXp] = useState(() =>
    currentUserId ? getLocalWeeklyXp(currentUserId) : 0
  );

  useEffect(() => {
    if (!currentUserId) return;
    setLiveWeeklyXp(getLocalWeeklyXp(currentUserId));
    const onStorage = (e) => {
      if (e.key === `lisa_weekly_xp_${currentUserId}`) {
        setLiveWeeklyXp(getLocalWeeklyXp(currentUserId));
      }
    };
    window.addEventListener("storage", onStorage);
    const id = setInterval(() => setLiveWeeklyXp(getLocalWeeklyXp(currentUserId)), 5000);
    return () => {
      window.removeEventListener("storage", onStorage);
      clearInterval(id);
    };
  }, [currentUserId]);

  useEffect(() => {
    if (!currentUserId) return;
    const av = localStorage.getItem(`lisa_profile_avatar_${currentUserId}`);
    setCurrentUserAvatar(av || "🌟");
  }, [currentUserId, profile]);

  // Fetch real users from Supabase (ordered by weekly_xp) so the leaderboard
  // reflects actual learners, not demo data.
  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_emoji, avatar_url, weekly_xp, weekly_start")
        .order("weekly_xp", { ascending: false })
        .limit(100);

      if (error) throw error;

      const weekStart = getWeekStartDate();
      const cleaned = (data || []).map((p) => ({
        ...p,
        // Only count weekly_xp if it belongs to the current week; otherwise 0
        weekly_xp: p.weekly_start === weekStart ? (p.weekly_xp || 0) : 0,
      }));

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
        avatar: canUsePhoto && currentUserAvatar.startsWith("http")
          ? { type: "photo", value: currentUserAvatar }
          : { type: "emoji", value: currentUserAvatar },
        weeklyXp: liveWeeklyXp,
        isCurrentUser: true,
      });
    } else {
      // Override with the most accurate live value from localStorage.
      me.weeklyXp = liveWeeklyXp;
      me.name = currentUserName;
    }

    rows.sort((a, b) => b.weeklyXp - a.weeklyXp);

    const currentUserRank = rows.findIndex((u) => u.isCurrentUser) + 1;
    return { sorted: rows, currentUserRank };
  }, [allProfiles, currentUserId, currentUserName, liveWeeklyXp, currentUserAvatar, canUsePhoto]);

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

  const renderAvatar = (av) =>
    av.type === "photo" ? (
      <img src={av.value} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
    ) : (
      <span>{av.value}</span>
    );

  return (
    <div className="weekly-leaderboard-container">
      <div className="weekly-leaderboard-header">
        <h2 className="weekly-leaderboard-title">🏆 Weekly Leaderboard</h2>
        <p className="weekly-leaderboard-subtitle">See who earned the most XP this week!</p>
        <div className="weekly-leaderboard-week-range">
          {formatDate(weekDates[0])} — {formatDate(weekDates[6])}
        </div>
      </div>

      {loading ? (
        <div className="weekly-leaderboard-loading">
          <div className="leaderboard-spinner" />
          <p>Loading learners…</p>
        </div>
      ) : leaderboardData.sorted.length === 0 ? (
        <div className="weekly-leaderboard-empty">
          <p>No XP earned this week yet. Be the first on the board! 🚀</p>
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
                    {user.isCurrentUser && <span className="you-badge">YOU</span>}
                  </div>
                  <div className="podium-xp" style={{ color: getRankColor(rank) }}>
                    {user.weeklyXp.toLocaleString()} XP
                  </div>
                </div>
              );
            })}
          </div>

          <div className="weekly-leaderboard-list">
            {leaderboardData.sorted.slice(3).map((user, idx) => {
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
                      {user.isCurrentUser && <span className="you-badge">YOU</span>}
                    </div>
                  </div>
                  <div className="leaderboard-xp">{user.weeklyXp.toLocaleString()} XP</div>
                </div>
              );
            })}
          </div>

          {leaderboardData.currentUserRank > 3 && (
            <div className="weekly-leaderboard-your-rank">
              <div className="leaderboard-divider" />
              <div className="weekly-leaderboard-row is-current-user highlight">
                <div className="leaderboard-rank" style={{ color: getRankColor(leaderboardData.currentUserRank) }}>
                  {getRankBadge(leaderboardData.currentUserRank)}
                </div>
                <div className="leaderboard-avatar">
                  {canUsePhoto && currentUserAvatar.startsWith("http") ? (
                    <img src={currentUserAvatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
                  ) : (
                    <span>{currentUserAvatar}</span>
                  )}
                </div>
                <div className="leaderboard-info">
                  <div className="leaderboard-name">
                    {currentUserName}
                    <span className="you-badge">YOU</span>
                  </div>
                </div>
                <div className="leaderboard-xp" style={{ color: "var(--accent)", fontWeight: 800 }}>
                  {liveWeeklyXp.toLocaleString()} XP
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <div className="weekly-leaderboard-footer">
        <p className="weekly-leaderboard-footer-text">
          Top learners this week earn bonus rewards!
        </p>
      </div>
    </div>
  );
}
