function AchievementMedal() {
  return (
    <div className="flex h-20 w-20 items-center justify-center rounded-[55px] bg-[#ECECEC] px-5 py-2">
      <svg
        width="40"
        height="48"
        viewBox="0 0 40 52"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        focusable="false"
      >
        <path
          d="M13 21L5 47L16 44L20 38L24 44L35 47L27 21"
          fill="white"
          stroke="#F94449"
          strokeWidth="2"
        />
        <circle
          cx="20"
          cy="16"
          r="13.5"
          fill="url(#achievement-medal-face)"
          stroke="#ECC440"
          strokeOpacity="0.72"
          strokeWidth="3"
        />
        <path d="M9 15.5H31" stroke="#FFFBA8" strokeWidth="3" strokeLinecap="round" />
        <path d="M10.5 21.5H29.5" stroke="#DDAC17" strokeWidth="2" strokeLinecap="round" />
        <defs>
          <linearGradient
            id="achievement-medal-face"
            x1="20"
            y1="2.5"
            x2="20"
            y2="29.5"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#ECC440" />
            <stop offset="0.54" stopColor="#FFFFAA" />
            <stop offset="1" stopColor="#DDAC17" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

export { AchievementMedal };
