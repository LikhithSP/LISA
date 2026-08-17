import React, { useState, useEffect, useRef } from "react";

// ─── Shop Catalog ──────────────────────────────────────────────────────────────
export const SHOP_CATALOG = {
  themes: [
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
