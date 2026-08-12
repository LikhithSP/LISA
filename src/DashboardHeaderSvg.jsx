import React from "react";

export default function DashboardHeaderSvg({ className = "dashboard-header-svg" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 450 320"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", height: "auto", maxHeight: "240px" }}
    >
      <defs>
        {/* Gradients */}
        <linearGradient id="doorGlow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFE066" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>

        <linearGradient id="doorFrame" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="100%" stopColor="#EAB308" />
        </linearGradient>

        <linearGradient id="tunnelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#A5B4FC" />
          <stop offset="100%" stopColor="#6366F1" />
        </linearGradient>

        <linearGradient id="platformTop" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#EDE9FE" />
          <stop offset="100%" stopColor="#DDD6FE" />
        </linearGradient>

        <linearGradient id="platformSide" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#A78BFA" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>

        <linearGradient id="platformDark" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#6D28D9" />
        </linearGradient>

        <linearGradient id="orbGrad" x1="30%" y1="30%" x2="90%" y2="90%">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>

        <linearGradient id="treeGreen1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4ADE80" />
          <stop offset="100%" stopColor="#16A34A" />
        </linearGradient>

        <linearGradient id="treeGreen2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#22C55E" />
          <stop offset="100%" stopColor="#15803D" />
        </linearGradient>

        <filter id="orbGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* ISOMETRIC PLATFORM & STEPS */}

      {/* Main Back Platform (under doorway) */}
      {/* Top surface */}
      <path d="M230 140 L350 80 L420 115 L300 175 Z" fill="url(#platformTop)" />
      {/* Right side thickness */}
      <path d="M300 175 L420 115 L420 135 L300 195 Z" fill="url(#platformDark)" />
      {/* Front side thickness */}
      <path d="M230 140 L300 175 L300 195 L230 160 Z" fill="url(#platformSide)" />

      {/* Middle Lower Step */}
      <path d="M190 160 L280 115 L320 135 L230 180 Z" fill="#DDD6FE" />
      <path d="M230 180 L320 135 L320 148 L230 193 Z" fill="url(#platformDark)" />
      <path d="M190 160 L230 180 L230 193 L190 173 Z" fill="url(#platformSide)" />

      {/* Barrel Arch Tunnel behind door */}
      <path
        d="M305 75 C305 50, 345 50, 345 75 L375 90 C375 65, 335 65, 335 90 Z"
        fill="url(#tunnelGrad)"
      />
      <path
        d="M295 98 L335 78 L370 95 L330 115 Z"
        fill="#C7D2FE"
        opacity="0.8"
      />

      {/* Door Frame Arch */}
      {/* Arch background glow */}
      <path
        d="M315 130 L315 85 C315 62, 350 62, 350 85 L350 130 Z"
        fill="url(#doorGlow)"
      />
      {/* Arch yellow frame */}
      <path
        d="M310 132 L310 84 C310 56, 355 56, 355 84 L355 132 L347 132 L347 84 C347 62, 318 62, 318 84 L318 132 Z"
        fill="url(#doorFrame)"
      />
      {/* Door Handle */}
      <circle cx="323" cy="98" r="2.5" fill="#1E1B4B" />

      {/* Stairs descending forward-left */}
      {/* Step 1 */}
      <path d="M255 190 L295 170 L315 180 L275 200 Z" fill="#C4B5FD" />
      <path d="M275 200 L315 180 L315 188 L275 208 Z" fill="#7C3AED" />
      <path d="M255 190 L275 200 L275 208 L255 198 Z" fill="#8B5CF6" />

      {/* Step 2 */}
      <path d="M235 200 L275 180 L295 190 L255 210 Z" fill="#DDD6FE" />
      <path d="M255 210 L295 190 L295 198 L255 218 Z" fill="#7C3AED" />
      <path d="M235 200 L255 210 L255 218 L235 208 Z" fill="#8B5CF6" />

      {/* Step 3 */}
      <path d="M215 210 L255 190 L275 200 L235 220 Z" fill="#C4B5FD" />
      <path d="M235 220 L275 200 L275 208 L235 228 Z" fill="#7C3AED" />
      <path d="M215 210 L235 220 L235 228 L215 218 Z" fill="#8B5CF6" />

      {/* Stair Railing Left */}
      <line x1="290" y1="165" x2="245" y2="188" stroke="#6D28D9" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="290" y1="165" x2="290" y2="175" stroke="#6D28D9" strokeWidth="2" />
      <line x1="268" y1="176" x2="268" y2="186" stroke="#6D28D9" strokeWidth="2" />
      <line x1="245" y1="188" x2="245" y2="198" stroke="#6D28D9" strokeWidth="2" />

      {/* Stair Railing Right */}
      <line x1="310" y1="175" x2="265" y2="198" stroke="#6D28D9" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="310" y1="175" x2="310" y2="185" stroke="#6D28D9" strokeWidth="2" />
      <line x1="288" y1="186" x2="288" y2="196" stroke="#6D28D9" strokeWidth="2" />
      <line x1="265" y1="198" x2="265" y2="208" stroke="#6D28D9" strokeWidth="2" strokeLinecap="round" />

      {/* Stepping Disc Pedestals at Bottom Left */}
      {/* Disc 1 (far bottom left) */}
      <ellipse cx="160" cy="245" rx="14" ry="7" fill="#A78BFA" />
      <path d="M146 245 C146 249, 174 249, 174 245 L174 252 C174 256, 146 256, 146 252 Z" fill="#7C3AED" />
      <ellipse cx="160" cy="245" rx="12" ry="5.5" fill="#DDD6FE" />

      {/* Disc 2 (middle bottom) */}
      <ellipse cx="180" cy="262" rx="16" ry="8" fill="#A78BFA" />
      <path d="M164 262 C164 267, 196 267, 196 262 L196 272 C196 277, 164 277, 164 272 Z" fill="#6D28D9" />
      <ellipse cx="180" cy="262" rx="14" ry="6.5" fill="#C4B5FD" />

      {/* Disc 3 with Golden Orb */}
      <ellipse cx="205" cy="278" rx="18" ry="9" fill="#A78BFA" />
      <path d="M187 278 C187 284, 223 284, 223 278 L223 290 C223 296, 187 296, 187 290 Z" fill="#5B21B6" />
      <ellipse cx="205" cy="278" rx="15" ry="7" fill="#DDD6FE" />

      {/* Golden Glowing Orb */}
      <circle cx="205" cy="268" r="11" fill="url(#orbGrad)" filter="url(#orbGlow)" />
      <circle cx="202" cy="264" r="3" fill="#FFFFFF" opacity="0.7" />

      {/* PINE TREES */}

      {/* Tree 1: Top Left behind entrance */}
      <g transform="translate(230, 45)">
        {/* Trunk */}
        <rect x="18" y="70" width="6" height="22" fill="#1F2937" rx="1" />
        {/* Cone 3 (bottom) */}
        <path d="M3 72 L21 35 L39 72 Z" fill="url(#treeGreen2)" />
        <path d="M21 35 L39 72 L21 72 Z" fill="#15803D" opacity="0.3" />
        {/* Cone 2 (middle) */}
        <path d="M6 55 L21 22 L36 55 Z" fill="url(#treeGreen1)" />
        <path d="M21 22 L36 55 L21 55 Z" fill="#15803D" opacity="0.25" />
        {/* Cone 1 (top) */}
        <path d="M9 38 L21 8 L33 38 Z" fill="#4ADE80" />
      </g>

      {/* Tree 2: Top Right behind entrance */}
      <g transform="translate(380, 50)">
        {/* Trunk */}
        <rect x="18" y="75" width="6" height="24" fill="#1F2937" rx="1" />
        {/* Cone 3 (bottom) */}
        <path d="M2 76 L21 36 L40 76 Z" fill="url(#treeGreen2)" />
        <path d="M21 36 L40 76 L21 76 Z" fill="#15803D" opacity="0.3" />
        {/* Cone 2 (middle) */}
        <path d="M5 58 L21 24 L37 58 Z" fill="url(#treeGreen1)" />
        <path d="M21 24 L37 58 L21 58 Z" fill="#15803D" opacity="0.25" />
        {/* Cone 1 (top) */}
        <path d="M9 40 L21 10 L33 40 Z" fill="#4ADE80" />
      </g>

      {/* Tree 3: Small tree front left */}
      <g transform="translate(150, 125)">
        {/* Trunk */}
        <rect x="13" y="55" width="4" height="15" fill="#1F2937" rx="1" />
        {/* Cone 2 (bottom) */}
        <path d="M2 56 L15 28 L28 56 Z" fill="url(#treeGreen2)" />
        <path d="M15 28 L28 56 L15 56 Z" fill="#15803D" opacity="0.3" />
        {/* Cone 1 (top) */}
        <path d="M5 42 L15 16 L25 42 Z" fill="url(#treeGreen1)" />
      </g>
    </svg>
  );
}
