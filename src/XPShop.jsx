import React, { useState, useEffect, useRef } from "react";

// ─── Shop Catalog ──────────────────────────────────────────────────────────────
export const SHOP_CATALOG = {
  themes: [
    {
      id: "theme_ocean",
      name: "Ocean Blue",
      desc: "Cool ocean vibes",
      cost: 80,
      icon: "🌊",
      preview: { accent: "#0ea5e9", accentDark: "#0284c7", accentSoft: "#e0f2fe", bg: "#f0f9ff" },
    },
    {
      id: "theme_forest",
      name: "Forest Green",
      desc: "Calm and earthy tones",
      cost: 80,
      icon: "🌿",
      preview: { accent: "#16a34a", accentDark: "#15803d", accentSoft: "#dcfce7", bg: "#f0fdf4" },
    },
    {
      id: "theme_sunset",
      name: "Sunset Purple",
      desc: "Warm dusk palette",
      cost: 100,
      icon: "🌅",
      preview: { accent: "#9333ea", accentDark: "#7e22ce", accentSoft: "#f3e8ff", bg: "#faf5ff" },
    },
    {
      id: "theme_cherry",
      name: "Cherry Blossom",
      desc: "Soft pink and rose",
      cost: 100,
      icon: "🌸",
      preview: { accent: "#e11d48", accentDark: "#be123c", accentSoft: "#ffe4e6", bg: "#fff1f2" },
    },
    {
      id: "theme_gold",
      name: "Golden Hour",
      desc: "Rich amber & gold",
      cost: 150,
      icon: "✨",
      preview: { accent: "#d97706", accentDark: "#b45309", accentSoft: "#fef3c7", bg: "#fffbeb" },
    },
    {
      id: "theme_midnight",
      name: "Midnight Teal",
      desc: "Deep teal & slate",
      cost: 150,
      icon: "🌙",
      preview: { accent: "#0d9488", accentDark: "#0f766e", accentSoft: "#ccfbf1", bg: "#f0fdfa" },
    },
  ],
  fonts: [
    { id: "font_default", name: "Inter (Default)", desc: "Clean & modern", cost: 0, icon: "Aa", family: "'Inter', sans-serif" },
    { id: "font_outfit", name: "Outfit", desc: "Friendly & rounded", cost: 50, icon: "Aa", family: "'Outfit', sans-serif" },
    { id: "font_playfair", name: "Playfair Display", desc: "Elegant & literary", cost: 60, icon: "Aa", family: "'Playfair Display', serif" },
    { id: "font_roboto_mono", name: "Roboto Mono", desc: "Techy & precise", cost: 60, icon: "Aa", family: "'Roboto Mono', monospace" },
    { id: "font_nunito", name: "Nunito", desc: "Soft & approachable", cost: 50, icon: "Aa", family: "'Nunito', sans-serif" },
    { id: "font_space_grotesk", name: "Space Grotesk", desc: "Bold & futuristic", cost: 80, icon: "Aa", family: "'Space Grotesk', sans-serif" },
  ],
  banners: [
    {
      id: "banner_cosmos",
      name: "Cosmos",
      desc: "Starfield header",
      cost: 120,
      icon: "🌌",
      gradient: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
    },
    {
      id: "banner_aurora",
      name: "Aurora",
      desc: "Northern lights",
      cost: 120,
      icon: "🌈",
      gradient: "linear-gradient(135deg, #43e97b, #38f9d7, #667eea)",
    },
    {
      id: "banner_fire",
      name: "Blaze",
      desc: "Fiery and bold",
      cost: 100,
      icon: "🔥",
      gradient: "linear-gradient(135deg, #f83600, #f9d423)",
    },
    {
      id: "banner_ocean",
      name: "Deep Ocean",
      desc: "Underwater calm",
      cost: 100,
      icon: "🐋",
      gradient: "linear-gradient(135deg, #2980b9, #6dd5fa, #ffffff)",
    },
    {
      id: "banner_sakura",
      name: "Sakura",
      desc: "Cherry blossom",
      cost: 130,
      icon: "🌸",
      gradient: "linear-gradient(135deg, #ff9a9e, #fad0c4, #ffecd2)",
    },
    {
      id: "banner_forest",
      name: "Enchanted Forest",
      desc: "Mystical woods",
      cost: 130,
      icon: "🌲",
      gradient: "linear-gradient(135deg, #134e5e, #71b280)",
    },
    {
      id: "banner_galaxy",
      name: "Galaxy",
      desc: "Swirling nebula",
      cost: 200,
      icon: "🪐",
      gradient: "linear-gradient(135deg, #0d0d0d, #5c258d, #4389a2)",
    },
    {
      id: "banner_royal",
      name: "Royal Gold",
      desc: "Majestic & premium",
      cost: 200,
      icon: "👑",
      gradient: "linear-gradient(135deg, #c6a855, #f7e98e, #c6a855)",
    },
  ],
  avatars: [
    // Preset avatar styles (emoji-based)
    { id: "avatar_astronaut", name: "Astronaut", cost: 60, icon: "👨‍🚀", emoji: "👨‍🚀" },
    { id: "avatar_wizard", name: "Wizard", cost: 60, icon: "🧙", emoji: "🧙" },
    { id: "avatar_ninja", name: "Ninja", cost: 60, icon: "🥷", emoji: "🥷" },
    { id: "avatar_robot", name: "Robot", cost: 80, icon: "🤖", emoji: "🤖" },
    { id: "avatar_fox", name: "Fox", cost: 70, icon: "🦊", emoji: "🦊" },
    { id: "avatar_owl", name: "Owl", cost: 70, icon: "🦉", emoji: "🦉" },
    { id: "avatar_lion", name: "Lion", cost: 80, icon: "🦁", emoji: "🦁" },
    { id: "avatar_dragon", name: "Dragon", cost: 120, icon: "🐲", emoji: "🐲" },
    { id: "avatar_cat", name: "Cat", cost: 50, icon: "🐱", emoji: "🐱" },
    { id: "avatar_unicorn", name: "Unicorn", cost: 100, icon: "🦄", emoji: "🦄" },
    { id: "avatar_panda", name: "Panda", cost: 70, icon: "🐼", emoji: "🐼" },
    { id: "avatar_phoenix", name: "Phoenix", cost: 150, icon: "🔥", emoji: "🐦‍🔥" },
  ],
  badges: [
    { id: "badge_bookworm", name: "Bookworm", desc: "Show off your love for reading", cost: 40, icon: "📚", rarity: "common" },
    { id: "badge_champion", name: "Champion", desc: "You're a true language champion", cost: 80, icon: "🏆", rarity: "rare" },
    { id: "badge_lightning", name: "Lightning", desc: "Fast learner badge", cost: 60, icon: "⚡", rarity: "rare" },
    { id: "badge_diamond", name: "Diamond", desc: "Precious and rare", cost: 200, icon: "💎", rarity: "legendary" },
    { id: "badge_rocket", name: "Rocket", desc: "Shoot for the stars", cost: 80, icon: "🚀", rarity: "rare" },
    { id: "badge_crown", name: "Crown", desc: "Ruler of words", cost: 150, icon: "👑", rarity: "legendary" },
    { id: "badge_star", name: "Gold Star", desc: "Shining bright", cost: 50, icon: "⭐", rarity: "common" },
    { id: "badge_fire", name: "On Fire", desc: "Can't stop, won't stop", cost: 60, icon: "🔥", rarity: "rare" },
  ],
};

// Theme application helper
export function applyTheme(themeId) {
  const theme = SHOP_CATALOG.themes.find(t => t.id === themeId);
  if (!theme) return;
  const root = document.documentElement;
  root.style.setProperty("--accent", theme.preview.accent);
  root.style.setProperty("--accent-dark", theme.preview.accentDark);
  root.style.setProperty("--accent-soft", theme.preview.accentSoft);
}

export function resetTheme() {
  const root = document.documentElement;
  root.style.removeProperty("--accent");
  root.style.removeProperty("--accent-dark");
  root.style.removeProperty("--accent-soft");
}

export function applyFont(fontFamily) {
  document.documentElement.style.setProperty("font-family", fontFamily);
  document.body.style.fontFamily = fontFamily;
}

// ─── Avatar Builder ────────────────────────────────────────────────────────────
const AVATAR_BG_COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#ef4444", "#f97316",
  "#eab308", "#22c55e", "#10b981", "#06b6d4", "#3b82f6",
  "#1e293b", "#78716c", "#e86b6b", "#9333ea", "#0d9488",
];
const AVATAR_SHAPES = ["circle", "square", "rounded"];

function AvatarBuilder({ currentAvatar, onSave, ownedAvatars, onClose }) {
  const [selectedEmoji, setSelectedEmoji] = useState(() => {
    if (currentAvatar?.type === "builder") return currentAvatar.emoji || "😊";
    return "😊";
  });
  const [bgColor, setBgColor] = useState(() => {
    if (currentAvatar?.type === "builder") return currentAvatar.bg || "#6366f1";
    return "#6366f1";
  });
  const [shape, setShape] = useState(() => {
    if (currentAvatar?.type === "builder") return currentAvatar.shape || "circle";
    return "circle";
  });

  const EMOJI_OPTIONS = [
    "😊","😎","🤩","🥳","😄","😁","🤓","🧐","😇","🥰",
    "😏","🤔","🤗","😤","😌","🥸","😝","🤑","😈","👽",
    "🤖","💀","👻","🎭","🦸","🦹","🧛","🧟","🧜","🧚",
  ];

  const shapeStyle = {
    circle: { borderRadius: "50%" },
    square: { borderRadius: "8px" },
    rounded: { borderRadius: "24px" },
  };

  const preview = {
    type: "builder",
    emoji: selectedEmoji,
    bg: bgColor,
    shape,
  };

  return (
    <div className="avatar-builder">
      <div className="avatar-builder-header">
        <h3 className="avatar-builder-title">🎨 Custom Avatar Builder</h3>
        <button className="avatar-builder-close" onClick={onClose}>✕</button>
      </div>

      {/* Preview */}
      <div className="avatar-builder-preview-wrap">
        <div
          className="avatar-builder-preview"
          style={{ background: bgColor, ...shapeStyle[shape] }}
        >
          <span style={{ fontSize: "3.5rem" }}>{selectedEmoji}</span>
        </div>
        <p className="avatar-builder-preview-label">Your Avatar</p>
      </div>

      {/* Emoji Picker */}
      <div className="avatar-builder-section">
        <label className="avatar-builder-label">Choose Emoji</label>
        <div className="avatar-emoji-grid">
          {EMOJI_OPTIONS.map((em) => (
            <button
              key={em}
              className={`avatar-emoji-btn ${selectedEmoji === em ? "selected" : ""}`}
              onClick={() => setSelectedEmoji(em)}
            >
              {em}
            </button>
          ))}
        </div>
      </div>

      {/* Owned avatar emojis */}
      {ownedAvatars.length > 0 && (
        <div className="avatar-builder-section">
          <label className="avatar-builder-label">Your Unlocked Avatars</label>
          <div className="avatar-emoji-grid">
            {ownedAvatars.map((id) => {
              const av = SHOP_CATALOG.avatars.find(a => a.id === id);
              if (!av) return null;
              return (
                <button
                  key={id}
                  className={`avatar-emoji-btn ${selectedEmoji === av.emoji ? "selected" : ""}`}
                  onClick={() => setSelectedEmoji(av.emoji)}
                >
                  {av.emoji}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Background Color */}
      <div className="avatar-builder-section">
        <label className="avatar-builder-label">Background Color</label>
        <div className="avatar-color-grid">
          {AVATAR_BG_COLORS.map((c) => (
            <button
              key={c}
              className={`avatar-color-swatch ${bgColor === c ? "selected" : ""}`}
              style={{ background: c }}
              onClick={() => setBgColor(c)}
            />
          ))}
        </div>
      </div>

      {/* Shape */}
      <div className="avatar-builder-section">
        <label className="avatar-builder-label">Shape</label>
        <div className="avatar-shape-row">
          {AVATAR_SHAPES.map((s) => (
            <button
              key={s}
              className={`avatar-shape-btn ${shape === s ? "selected" : ""}`}
              onClick={() => setShape(s)}
              style={{ borderRadius: shapeStyle[s].borderRadius }}
            >
              <span style={{ background: bgColor, ...shapeStyle[s], display: "inline-flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, fontSize: "1.2rem" }}>{selectedEmoji}</span>
              <span style={{ fontSize: "0.75rem", marginTop: 4, display: "block" }}>{s.charAt(0).toUpperCase() + s.slice(1)}</span>
            </button>
          ))}
        </div>
      </div>

      <button className="avatar-builder-save-btn" onClick={() => onSave(preview)}>
        ✓ Apply Avatar
      </button>
    </div>
  );
}

// ─── Main XP Shop ──────────────────────────────────────────────────────────────
export default function XPShop({
  userXp,
  onSpendXp,
  session,
  ownedItems,
  onOwnedItemsChange,
  currentTheme,
  onThemeChange,
  currentFont,
  onFontChange,
  currentBanner,
  onBannerChange,
  currentAvatar,
  onAvatarChange,
  activeProfileBadges,
  onBadgesChange,
  onPurchaseItem,
}) {
  const [activeCategory, setActiveCategory] = useState("themes");
  const [toast, setToast] = useState(null);
  const [confirmItem, setConfirmItem] = useState(null);
  const [showAvatarBuilder, setShowAvatarBuilder] = useState(false);
  const [previewTheme, setPreviewTheme] = useState(null);

  const owned = ownedItems || [];

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const isOwned = (id) => owned.includes(id);

  const handlePurchase = (item) => {
    if (isOwned(item.id)) {
      // Already owned — equip it
      handleEquip(item);
      return;
    }
    if (userXp < item.cost) {
      showToast(`Not enough XP! You need ${item.cost - userXp} more XP.`, "error");
      return;
    }
    setConfirmItem(item);
  };

  const confirmPurchase = () => {
    if (!confirmItem) return;
    const newXp = userXp - confirmItem.cost;
    const newOwned = [...owned, confirmItem.id];
    if (onPurchaseItem) {
      onPurchaseItem(confirmItem, newXp, newOwned);
    } else {
      onSpendXp(newXp);
      onOwnedItemsChange(newOwned);
      handleEquip(confirmItem, newOwned);
    }
    showToast(`🎉 "${confirmItem.name}" unlocked!`, "success");
    setConfirmItem(null);
  };

  const handleEquip = (item, newOwned) => {
    const o = newOwned || owned;
    if (!o.includes(item.id) && !isOwned(item.id)) return;
    if (item.id.startsWith("theme_")) {
      onThemeChange(item.id);
      applyTheme(item.id);
    } else if (item.id.startsWith("font_")) {
      onFontChange(item.id);
      applyFont(SHOP_CATALOG.fonts.find(f => f.id === item.id)?.family || "'Inter', sans-serif");
    } else if (item.id.startsWith("banner_")) {
      onBannerChange(item.id);
    } else if (item.id.startsWith("avatar_")) {
      const av = SHOP_CATALOG.avatars.find(a => a.id === item.id);
      if (av) {
        onAvatarChange({ type: "emoji", emoji: av.emoji, id: item.id });
      }
    } else if (item.id.startsWith("badge_")) {
      const current = activeProfileBadges || [];
      if (current.includes(item.id)) {
        onBadgesChange(current.filter(b => b !== item.id));
      } else if (current.length < 3) {
        onBadgesChange([...current, item.id]);
      } else {
        showToast("Max 3 badges active. Tap an active badge to remove it first.", "error");
      }
    }
  };

  const categories = [
    { id: "themes", label: "Themes", icon: "🎨" },
    { id: "fonts", label: "Fonts", icon: "🔤" },
    { id: "banners", label: "Banners", icon: "🖼️" },
    { id: "avatars", label: "Avatars", icon: "🪄" },
    { id: "badges", label: "Badges", icon: "🏅" },
  ];

  const renderThemesGrid = () => (
    <div className="shop-grid shop-grid-2">
      {SHOP_CATALOG.themes.map((theme) => {
        const owned_flag = isOwned(theme.id);
        const active = currentTheme === theme.id;
        const prev = previewTheme === theme.id;
        return (
          <div
            key={theme.id}
            className={`shop-item-card ${active ? "shop-item-active" : ""} ${owned_flag ? "shop-item-owned" : ""}`}
            onMouseEnter={() => { if (owned_flag) applyTheme(theme.id); setPreviewTheme(theme.id); }}
            onMouseLeave={() => {
              if (!active && currentTheme) applyTheme(currentTheme);
              else if (!active) resetTheme();
              setPreviewTheme(null);
            }}
          >
            {active && <div className="shop-active-badge">✓ Active</div>}
            {owned_flag && !active && <div className="shop-owned-badge">Owned</div>}
            <div className="shop-theme-preview">
              {[theme.preview.accent, theme.preview.accentDark, theme.preview.accentSoft].map((c, i) => (
                <div key={i} style={{ background: c, flex: 1, height: "100%" }} />
              ))}
            </div>
            <div className="shop-item-info">
              <span className="shop-item-icon">{theme.icon}</span>
              <div>
                <div className="shop-item-name">{theme.name}</div>
                <div className="shop-item-desc">{theme.desc}</div>
              </div>
            </div>
            <div className="shop-item-footer">
              <span className="shop-item-cost">
                {theme.cost === 0 ? "Free" : `⭐ ${theme.cost} XP`}
              </span>
              <button
                className={`shop-buy-btn ${active ? "shop-btn-active" : owned_flag ? "shop-btn-equip" : userXp >= theme.cost ? "" : "shop-btn-disabled"}`}
                onClick={() => handlePurchase(theme)}
              >
                {active ? "✓ Equipped" : owned_flag ? "Equip" : `Buy`}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderFontsGrid = () => (
    <div className="shop-grid shop-grid-2">
      {SHOP_CATALOG.fonts.map((font) => {
        const owned_flag = isOwned(font.id) || font.cost === 0;
        const active = currentFont === font.id || (!currentFont && font.id === "font_default");
        return (
          <div
            key={font.id}
            className={`shop-item-card ${active ? "shop-item-active" : ""} ${owned_flag ? "shop-item-owned" : ""}`}
          >
            {active && <div className="shop-active-badge">✓ Active</div>}
            {owned_flag && !active && <div className="shop-owned-badge">{font.cost === 0 ? "Default" : "Owned"}</div>}
            <div className="shop-font-preview" style={{ fontFamily: font.family }}>
              <span className="shop-font-sample">Aa Bb Cc</span>
              <span className="shop-font-phrase" style={{ fontFamily: font.family }}>Hello World! 123</span>
            </div>
            <div className="shop-item-info">
              <span className="shop-item-icon" style={{ fontFamily: font.family, fontWeight: 900 }}>{font.icon}</span>
              <div>
                <div className="shop-item-name" style={{ fontFamily: font.family }}>{font.name}</div>
                <div className="shop-item-desc">{font.desc}</div>
              </div>
            </div>
            <div className="shop-item-footer">
              <span className="shop-item-cost">{font.cost === 0 ? "Free" : `⭐ ${font.cost} XP`}</span>
              <button
                className={`shop-buy-btn ${active ? "shop-btn-active" : owned_flag ? "shop-btn-equip" : userXp >= font.cost ? "" : "shop-btn-disabled"}`}
                onClick={() => handlePurchase(font)}
              >
                {active ? "✓ Equipped" : owned_flag ? "Equip" : "Buy"}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderBannersGrid = () => (
    <div className="shop-grid shop-grid-2">
      {SHOP_CATALOG.banners.map((banner) => {
        const owned_flag = isOwned(banner.id);
        const active = currentBanner === banner.id;
        return (
          <div
            key={banner.id}
            className={`shop-item-card ${active ? "shop-item-active" : ""} ${owned_flag ? "shop-item-owned" : ""}`}
          >
            {active && <div className="shop-active-badge">✓ Active</div>}
            {owned_flag && !active && <div className="shop-owned-badge">Owned</div>}
            <div className="shop-banner-preview" style={{ background: banner.gradient }}>
              <span className="shop-banner-icon">{banner.icon}</span>
            </div>
            <div className="shop-item-info">
              <span className="shop-item-icon">{banner.icon}</span>
              <div>
                <div className="shop-item-name">{banner.name}</div>
                <div className="shop-item-desc">{banner.desc}</div>
              </div>
            </div>
            <div className="shop-item-footer">
              <span className="shop-item-cost">⭐ {banner.cost} XP</span>
              <button
                className={`shop-buy-btn ${active ? "shop-btn-active" : owned_flag ? "shop-btn-equip" : userXp >= banner.cost ? "" : "shop-btn-disabled"}`}
                onClick={() => handlePurchase(banner)}
              >
                {active ? "✓ Equipped" : owned_flag ? "Equip" : "Buy"}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderAvatarsGrid = () => (
    <>
      {/* Custom Avatar Builder Card */}
      <div className="shop-avatar-builder-cta" onClick={() => setShowAvatarBuilder(true)}>
        <div className="shop-avatar-builder-icon">🎨</div>
        <div>
          <div className="shop-avatar-builder-title">Custom Avatar Builder</div>
          <div className="shop-avatar-builder-desc">Mix emojis, colors & shapes — always free!</div>
        </div>
        <button className="shop-avatar-builder-btn">Open Builder →</button>
      </div>

      <div className="shop-grid shop-grid-3" style={{ marginTop: 16 }}>
        {SHOP_CATALOG.avatars.map((av) => {
          const owned_flag = isOwned(av.id);
          const active = currentAvatar?.id === av.id;
          return (
            <div
              key={av.id}
              className={`shop-item-card shop-avatar-card ${active ? "shop-item-active" : ""} ${owned_flag ? "shop-item-owned" : ""}`}
            >
              {active && <div className="shop-active-badge">✓</div>}
              {owned_flag && !active && <div className="shop-owned-badge">Owned</div>}
              <div className="shop-avatar-preview">{av.emoji}</div>
              <div className="shop-item-name" style={{ textAlign: "center" }}>{av.name}</div>
              <div className="shop-item-footer" style={{ justifyContent: "center" }}>
                <span className="shop-item-cost">⭐ {av.cost}</span>
                <button
                  className={`shop-buy-btn ${active ? "shop-btn-active" : owned_flag ? "shop-btn-equip" : userXp >= av.cost ? "" : "shop-btn-disabled"}`}
                  onClick={() => handlePurchase(av)}
                >
                  {active ? "✓" : owned_flag ? "Use" : "Buy"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );

  const renderBadgesGrid = () => {
    const activeBadges = activeProfileBadges || [];
    return (
      <>
        <p className="shop-badge-hint">Up to 3 badges can be active on your profile. Tap to toggle.</p>
        <div className="shop-grid shop-grid-3">
          {SHOP_CATALOG.badges.map((badge) => {
            const owned_flag = isOwned(badge.id);
            const active = activeBadges.includes(badge.id);
            const rarityColors = { common: "#6b7280", rare: "#3b82f6", legendary: "#f59e0b" };
            return (
              <div
                key={badge.id}
                className={`shop-item-card shop-badge-card ${active ? "shop-item-active" : ""} ${owned_flag ? "shop-item-owned" : ""}`}
              >
                <div className="shop-badge-rarity" style={{ color: rarityColors[badge.rarity] }}>
                  {badge.rarity.toUpperCase()}
                </div>
                {active && <div className="shop-active-badge">✓</div>}
                <div className="shop-badge-preview">{badge.icon}</div>
                <div className="shop-item-name" style={{ textAlign: "center" }}>{badge.name}</div>
                <div className="shop-item-desc" style={{ textAlign: "center", fontSize: "0.78rem" }}>{badge.desc}</div>
                <div className="shop-item-footer" style={{ justifyContent: "center" }}>
                  <span className="shop-item-cost">⭐ {badge.cost}</span>
                  <button
                    className={`shop-buy-btn ${active ? "shop-btn-active" : owned_flag ? "shop-btn-equip" : userXp >= badge.cost ? "" : "shop-btn-disabled"}`}
                    onClick={() => handlePurchase(badge)}
                  >
                    {active ? "✓ Active" : owned_flag ? "Equip" : "Buy"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </>
    );
  };

  return (
    <div className="shop-zone">
      {/* Toast */}
      {toast && (
        <div className={`shop-toast ${toast.type}`}>
          {toast.type === "success" ? "🎉" : "⚠️"} {toast.msg}
        </div>
      )}

      {/* Confirm Modal */}
      {confirmItem && (
        <div className="shop-confirm-overlay">
          <div className="shop-confirm-modal">
            <div className="shop-confirm-icon">{confirmItem.icon}</div>
            <h3 className="shop-confirm-title">Unlock "{confirmItem.name}"?</h3>
            <p className="shop-confirm-desc">This will cost <strong>⭐ {confirmItem.cost} XP</strong>.<br />You have <strong>{userXp} XP</strong>.</p>
            <div className="shop-confirm-actions">
              <button className="shop-confirm-yes" onClick={confirmPurchase}>
                Yes, Unlock!
              </button>
              <button className="shop-confirm-no" onClick={() => setConfirmItem(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Avatar Builder Modal */}
      {showAvatarBuilder && (
        <div className="shop-confirm-overlay">
          <div className="shop-avatar-builder-modal">
            <AvatarBuilder
              currentAvatar={currentAvatar}
              ownedAvatars={owned.filter(id => id.startsWith("avatar_"))}
              onSave={(avatar) => { onAvatarChange(avatar); setShowAvatarBuilder(false); showToast("Avatar updated! ✨"); }}
              onClose={() => setShowAvatarBuilder(false)}
            />
          </div>
        </div>
      )}

      {/* Header */}
      <div className="shop-header">
        <div>
          <div className="shop-header-badge">🛒 XP Shop</div>
          <h2 className="shop-title">Customize Your LISA</h2>
          <p className="shop-subtitle">Spend your XP to unlock themes, avatars, banners & more!</p>
        </div>
        <div className="shop-xp-display">
          <div className="shop-xp-icon">⭐</div>
          <div>
            <div className="shop-xp-value">{userXp}</div>
            <div className="shop-xp-label">XP Available</div>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="shop-category-tabs">
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`shop-cat-tab ${activeCategory === cat.id ? "active" : ""}`}
            onClick={() => setActiveCategory(cat.id)}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Items Grid */}
      <div className="shop-items-area">
        {activeCategory === "themes" && renderThemesGrid()}
        {activeCategory === "fonts" && renderFontsGrid()}
        {activeCategory === "banners" && renderBannersGrid()}
        {activeCategory === "avatars" && renderAvatarsGrid()}
        {activeCategory === "badges" && renderBadgesGrid()}
      </div>
    </div>
  );
}
