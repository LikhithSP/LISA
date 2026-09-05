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
      id: "banner_kids_learning",
      name: "Kids Learning",
      desc: "Colorful kids learning header",
      cost: 100,
      icon: "📚",
      image: "https://media.globaldev.tech/images/header_kids_learning.format-jpeg.jpg",
    },
    {
      id: "banner_bookshelf",
      name: "Bookshelf",
      desc: "Cozy bookshelf with plants",
      cost: 100,
      icon: "🌿",
      image: "https://static.vecteezy.com/system/resources/thumbnails/006/033/288/small_2x/bookshelf-shelf-for-books-with-plants-in-pot-illustration-in-flat-cartoon-style-vector.jpg",
    },
    {
      id: "banner_confidence",
      name: "Confidence",
      desc: "Branded learning confidence",
      cost: 120,
      icon: "💪",
      image: "https://cdn.prod.website-files.com/6744bdb342b0a7660e7b7c7d/67df66d85cbde22c48b44303_f5a1cc83-4ba9-4052-8e67-57c3c3a3285b_Branded%2BBlog%2BHeader%2B-%2BA%2BLook%2Bat%2BConfidence%2Bin%2BLearning.jpeg",
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

function hexToRgb(hex) {
  if (!hex) return "198, 95, 45";
  let c = hex.replace("#", "");
  if (c.length === 3) c = c.split("").map(x => x + x).join("");
  const num = parseInt(c, 16);
  return `${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}`;
}

// Theme application helper
export function applyTheme(themeId) {
  let themes = SHOP_CATALOG.themes;
  try {
    const cached = localStorage.getItem("lisa_global_shop_catalog");
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && Array.isArray(parsed.themes)) {
        themes = parsed.themes;
      }
    }
  } catch (e) {}
  const theme = themes.find(t => t.id === themeId);
  if (!theme) return;
  const root = document.documentElement;
  const isDark = root.getAttribute("data-theme") === "dark";
  const rgb = hexToRgb(theme.preview.accent);

  root.style.setProperty("--accent", theme.preview.accent);
  root.style.setProperty("--accent-dark", theme.preview.accentDark);
  root.style.setProperty("--accent-rgb", rgb);
  root.style.setProperty("--accent-soft", isDark ? `rgba(${rgb}, 0.22)` : theme.preview.accentSoft);
  root.style.setProperty("--theme-bg", theme.preview.bg);
  
  // Calculate and apply hue-rotate filter for mascot images matching the theme
  let filterVal = "none";
  if (themeId === "theme_ocean") filterVal = "hue-rotate(165deg)";
  else if (themeId === "theme_forest") filterVal = "hue-rotate(85deg)";
  else if (themeId === "theme_sunset") filterVal = "hue-rotate(235deg)";
  else if (themeId === "theme_cherry") filterVal = "hue-rotate(313deg)";
  else if (themeId === "theme_midnight") filterVal = "hue-rotate(139deg)";
  else if (themeId === "theme_gold") filterVal = "none";
  root.style.setProperty("--mascot-filter", filterVal);
  
  // Also store in localStorage to persist immediately across reloads
  localStorage.setItem("lisa_current_theme", themeId);
}

export function resetTheme() {
  const root = document.documentElement;
  root.style.removeProperty("--accent");
  root.style.removeProperty("--accent-dark");
  root.style.removeProperty("--accent-soft");
  root.style.removeProperty("--theme-bg");
  root.style.removeProperty("--mascot-filter");
  localStorage.removeItem("lisa_current_theme");
}

export function applyFont(fontFamily) {
  const root = document.documentElement;
  root.style.setProperty("--font-family", fontFamily);
  root.style.setProperty("font-family", fontFamily);
  document.body.style.fontFamily = fontFamily;
}


export default function XPShop({
  t = (key) => key,
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
  catalog
}) {
  const currentCatalog = catalog || SHOP_CATALOG;
  const [activeCategory, setActiveCategory] = useState("themes");
  const [toast, setToast] = useState(null);
  const [confirmItem, setConfirmItem] = useState(null);

  const [previewTheme, setPreviewTheme] = useState(null);

  const owned = ownedItems || [];

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const getItemName = (item) => {
    if (!item) return "";
    const key = item.id + "_name";
    const val = t(key);
    return val === key ? item.name : val;
  };

  const getItemDesc = (item) => {
    if (!item) return "";
    const key = item.id + "_desc";
    const val = t(key);
    return val === key ? item.desc : val;
  };

  const isOwned = (id) => owned.includes(id);

  const handlePurchase = (item) => {
    if (isOwned(item.id)) {
      // Already owned — equip it
      handleEquip(item);
      return;
    }
    if (userXp < item.cost) {
      showToast(t("notEnoughXpError").replace("{need}", item.cost - userXp), "error");
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
      applyFont(currentCatalog.fonts.find(f => f.id === item.id)?.family || "'Inter', sans-serif");
    } else if (item.id.startsWith("banner_")) {
      onBannerChange(item.id);
    } else if (item.id.startsWith("avatar_")) {
      const av = currentCatalog.avatars.find(a => a.id === item.id);
      if (av) {
        onAvatarChange({ type: "emoji", emoji: av.emoji, id: item.id });
      }
    } else if (item.id.startsWith("badge_")) {
      const current = activeProfileBadges || [];
      if (current.includes(item.id)) {
        onBadgesChange(current.filter(b => b !== item.id));
      } else {
        onBadgesChange([...current, item.id]);
      }
    }
  };

  const categories = [
    { id: "themes", label: t("themesTab"), icon: "🎨" },
    { id: "fonts", label: t("fontsTab"), icon: "🔤" },
    { id: "banners", label: t("bannersTab"), icon: "🖼️" },
    { id: "avatars", label: t("avatarsTab"), icon: "🪄" },
    { id: "badges", label: t("badgesTab"), icon: "🏅" },
  ];

  const renderThemesGrid = () => (
    <div className="shop-grid shop-grid-2">
      {currentCatalog.themes.map((theme) => {
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
            {active && <div className="shop-active-badge">✓ {t("activeLabel")}</div>}
            {owned_flag && !active && <div className="shop-owned-badge">{t("ownedLabel")}</div>}
            <div className="shop-theme-preview">
              {[theme.preview.accent, theme.preview.accentDark, theme.preview.accentSoft].map((c, i) => (
                <div key={i} style={{ background: c, flex: 1, height: "100%" }} />
              ))}
            </div>
            <div className="shop-item-info">
              <span className="shop-item-icon">{theme.icon}</span>
              <div>
                <div className="shop-item-name">{getItemName(theme)}</div>
                <div className="shop-item-desc">{getItemDesc(theme)}</div>
              </div>
            </div>
            <div className="shop-item-footer">
              <span className="shop-item-cost">
                {theme.cost === 0 ? t("freeLabel") : `⭐ ${theme.cost} XP`}
              </span>
              <button
                className={`shop-buy-btn ${active ? "shop-btn-active" : owned_flag ? "shop-btn-equip" : userXp >= theme.cost ? "" : "shop-btn-disabled"}`}
                onClick={() => handlePurchase(theme)}
              >
                {active ? t("equippedLabel") : owned_flag ? t("equipBtn") : t("buyBtn")}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderFontsGrid = () => (
    <div className="shop-grid shop-grid-2">
      {currentCatalog.fonts.map((font) => {
        const owned_flag = isOwned(font.id) || font.cost === 0;
        const active = currentFont === font.id || (!currentFont && font.id === "font_default");
        return (
          <div
            key={font.id}
            className={`shop-item-card ${active ? "shop-item-active" : ""} ${owned_flag ? "shop-item-owned" : ""}`}
          >
            {active && <div className="shop-active-badge">✓ {t("activeLabel")}</div>}
            {owned_flag && !active && <div className="shop-owned-badge">{font.cost === 0 ? t("defaultLabel") : t("ownedLabel")}</div>}
            <div className="shop-font-preview" style={{ fontFamily: font.family }}>
              <span className="shop-font-sample">Aa Bb Cc</span>
              <span className="shop-font-phrase" style={{ fontFamily: font.family }}>Hello World! 123</span>
            </div>
            <div className="shop-item-info">
              <span className="shop-item-icon" style={{ fontFamily: font.family, fontWeight: 900 }}>{font.icon}</span>
              <div>
                <div className="shop-item-name" style={{ fontFamily: font.family }}>{getItemName(font)}</div>
                <div className="shop-item-desc">{getItemDesc(font)}</div>
              </div>
            </div>
            <div className="shop-item-footer">
              <span className="shop-item-cost">{font.cost === 0 ? t("freeLabel") : `⭐ ${font.cost} XP`}</span>
              <button
                className={`shop-buy-btn ${active ? "shop-btn-active" : owned_flag ? "shop-btn-equip" : userXp >= font.cost ? "" : "shop-btn-disabled"}`}
                onClick={() => handlePurchase(font)}
              >
                {active ? t("equippedLabel") : owned_flag ? t("equipBtn") : t("buyBtn")}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderBannersGrid = () => (
    <div className="shop-grid shop-grid-2">
      {currentCatalog.banners.map((banner) => {
        const owned_flag = isOwned(banner.id);
        const active = currentBanner === banner.id;
        return (
          <div
            key={banner.id}
            className={`shop-item-card ${active ? "shop-item-active" : ""} ${owned_flag ? "shop-item-owned" : ""}`}
          >
            {active && <div className="shop-active-badge">✓ {t("activeLabel")}</div>}
            {owned_flag && !active && <div className="shop-owned-badge">{t("ownedLabel")}</div>}
            <div className="shop-banner-preview" style={{ backgroundImage: `url(${banner.image})` }}>
              <span className="shop-banner-icon">{banner.icon}</span>
            </div>
            <div className="shop-item-info">
              <span className="shop-item-icon">{banner.icon}</span>
              <div>
                <div className="shop-item-name">{getItemName(banner)}</div>
                <div className="shop-item-desc">{getItemDesc(banner)}</div>
              </div>
            </div>
            <div className="shop-item-footer">
              <span className="shop-item-cost">⭐ {banner.cost} XP</span>
              <button
                className={`shop-buy-btn ${active ? "shop-btn-active" : owned_flag ? "shop-btn-equip" : userXp >= banner.cost ? "" : "shop-btn-disabled"}`}
                onClick={() => handlePurchase(banner)}
              >
                {active ? t("equippedLabel") : owned_flag ? t("equipBtn") : t("buyBtn")}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderAvatarsGrid = () => (
    <div className="shop-grid shop-grid-3">
      {currentCatalog.avatars.map((av) => {
        const owned_flag = isOwned(av.id);
        const active = currentAvatar?.id === av.id;
        return (
          <div
            key={av.id}
            className={`shop-item-card shop-avatar-card ${active ? "shop-item-active" : ""} ${owned_flag ? "shop-item-owned" : ""}`}
          >
            {active && <div className="shop-active-badge">✓</div>}
            {owned_flag && !active && <div className="shop-owned-badge">{t("ownedLabel")}</div>}
            <div className="shop-avatar-preview">{av.emoji}</div>
            <div className="shop-item-name" style={{ textAlign: "center" }}>{getItemName(av)}</div>
            <div className="shop-item-footer" style={{ justifyContent: "center" }}>
              <span className="shop-item-cost">⭐ {av.cost}</span>
              <button
                className={`shop-buy-btn ${active ? "shop-btn-active" : owned_flag ? "shop-btn-equip" : userXp >= av.cost ? "" : "shop-btn-disabled"}`}
                onClick={() => handlePurchase(av)}
              >
                {active ? "✓" : owned_flag ? t("useBtn") : t("buyBtn")}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderBadgesGrid = () => {
    const activeBadges = activeProfileBadges || [];
    return (
      <>
        <p className="shop-badge-hint">{t("badgeHint")}</p>
        <div className="shop-grid shop-grid-3">
          {currentCatalog.badges.map((badge) => {
            const owned_flag = isOwned(badge.id);
            const active = activeBadges.includes(badge.id);
            const rarityColors = { common: "#6b7280", rare: "#3b82f6", legendary: "#f59e0b" };
            return (
              <div
                key={badge.id}
                className={`shop-item-card shop-badge-card ${active ? "shop-item-active" : ""} ${owned_flag ? "shop-item-owned" : ""}`}
              >
                <div className="shop-badge-rarity" style={{ color: rarityColors[badge.rarity] }}>
                  {t(badge.rarity)}
                </div>
                {active && <div className="shop-active-badge">✓</div>}
                <div className="shop-badge-preview">{badge.icon}</div>
                <div className="shop-item-name" style={{ textAlign: "center" }}>{getItemName(badge)}</div>
                <div className="shop-item-desc" style={{ textAlign: "center", fontSize: "0.78rem" }}>{getItemDesc(badge)}</div>
                <div className="shop-item-footer" style={{ justifyContent: "center" }}>
                  <span className="shop-item-cost">⭐ {badge.cost}</span>
                  <button
                    className={`shop-buy-btn ${active ? "shop-btn-active" : owned_flag ? "shop-btn-equip" : userXp >= badge.cost ? "" : "shop-btn-disabled"}`}
                    onClick={() => handlePurchase(badge)}
                  >
                    {active ? `✓ ${t("activeLabel")}` : owned_flag ? t("equipBtn") : t("buyBtn")}
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


      {/* Confirm Modal */}
      {confirmItem && (
        <div className="shop-confirm-overlay">
          <div className="shop-confirm-modal">
            <div className="shop-confirm-icon">{confirmItem.icon}</div>
            <h3 className="shop-confirm-title">{t("unlockConfirmTitle").replace("{name}", getItemName(confirmItem))}</h3>
            <p className="shop-confirm-desc" dangerouslySetInnerHTML={{
              __html: t("unlockConfirmDesc")
                .replace("{cost}", confirmItem.cost)
                .replace("{userXp}", userXp)
            }} />
            <div className="shop-confirm-actions">
              <button className="shop-confirm-yes" onClick={confirmPurchase}>
                {t("yesUnlockBtn")}
              </button>
              <button className="shop-confirm-no" onClick={() => setConfirmItem(null)}>
                {t("cancelBtn")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="shop-header">
        <div>
          <div className="shop-header-badge">{t("xpShopTitle")}</div>
          <h2 className="shop-title">{t("customizeLisa")}</h2>
          <p className="shop-subtitle">{t("shopSubtitle")}</p>
        </div>
        <div className="shop-xp-display">
          <div className="shop-xp-icon">⭐</div>
          <div>
            <div className="shop-xp-value">{userXp}</div>
            <div className="shop-xp-label">{t("xpAvailable")}</div>
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
