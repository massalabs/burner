export function FireAnimation() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      marginBottom: '20px',
    }}>
      <svg 
        width="120" 
        height="150" 
        viewBox="0 0 100 120"
        style={{
          filter: 'drop-shadow(0 0 20px rgba(255, 107, 53, 0.8))',
          animation: 'flicker 1.5s ease-in-out infinite',
        }}
      >
        <defs>
          <linearGradient id="fireGradient" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#ff4500">
              <animate attributeName="stop-color" 
                values="#ff4500;#ff6b35;#ff4500" 
                dur="2s" 
                repeatCount="indefinite" />
            </stop>
            <stop offset="40%" stopColor="#ff8c00">
              <animate attributeName="stop-color" 
                values="#ff8c00;#ffa500;#ff8c00" 
                dur="1.5s" 
                repeatCount="indefinite" />
            </stop>
            <stop offset="100%" stopColor="#ffd700">
              <animate attributeName="stop-color" 
                values="#ffd700;#ffed4a;#ffd700" 
                dur="1s" 
                repeatCount="indefinite" />
            </stop>
          </linearGradient>
          <filter id="fireGlow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Main flame */}
        <path 
          fill="url(#fireGradient)" 
          filter="url(#fireGlow)"
          d="M50 10 C50 10 25 35 25 60 C25 75 32 90 50 95 C35 80 40 60 50 50 C60 60 65 80 50 95 C68 90 75 75 75 60 C75 35 50 10 50 10 Z"
        >
          <animate 
            attributeName="d" 
            dur="0.5s" 
            repeatCount="indefinite"
            values="
              M50 10 C50 10 25 35 25 60 C25 75 32 90 50 95 C35 80 40 60 50 50 C60 60 65 80 50 95 C68 90 75 75 75 60 C75 35 50 10 50 10 Z;
              M50 8 C50 8 23 33 23 58 C23 73 30 92 50 97 C33 82 38 58 50 48 C62 58 67 82 50 97 C70 92 77 73 77 58 C77 33 50 8 50 8 Z;
              M50 10 C50 10 25 35 25 60 C25 75 32 90 50 95 C35 80 40 60 50 50 C60 60 65 80 50 95 C68 90 75 75 75 60 C75 35 50 10 50 10 Z
            "
          />
        </path>
        
        {/* Inner flame */}
        <path 
          fill="#ffcc00" 
          opacity="0.9"
          d="M50 35 C50 35 38 50 38 62 C38 70 42 78 50 80 C43 72 45 62 50 55 C55 62 57 72 50 80 C58 78 62 70 62 62 C62 50 50 35 50 35 Z"
        >
          <animate 
            attributeName="d" 
            dur="0.4s" 
            repeatCount="indefinite"
            values="
              M50 35 C50 35 38 50 38 62 C38 70 42 78 50 80 C43 72 45 62 50 55 C55 62 57 72 50 80 C58 78 62 70 62 62 C62 50 50 35 50 35 Z;
              M50 33 C50 33 36 48 36 60 C36 68 40 80 50 82 C41 74 43 60 50 53 C57 60 59 74 50 82 C60 80 64 68 64 60 C64 48 50 33 50 33 Z;
              M50 35 C50 35 38 50 38 62 C38 70 42 78 50 80 C43 72 45 62 50 55 C55 62 57 72 50 80 C58 78 62 70 62 62 C62 50 50 35 50 35 Z
            "
          />
        </path>
        
        {/* Logs */}
        <ellipse cx="50" cy="105" rx="35" ry="8" fill="#4a2c0a" />
        <rect x="20" y="98" width="25" height="10" rx="5" fill="#5a3510" transform="rotate(-10 32 103)" />
        <rect x="55" y="98" width="25" height="10" rx="5" fill="#5a3510" transform="rotate(10 68 103)" />
        
        {/* Sparks */}
        <circle cx="40" cy="25" r="2" fill="#ffd700" opacity="0.8">
          <animate attributeName="cy" values="25;10;25" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.8;0;0.8" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="60" cy="20" r="1.5" fill="#ff8c00" opacity="0.7">
          <animate attributeName="cy" values="20;5;20" dur="2.5s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.7;0;0.7" dur="2.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="55" cy="30" r="1" fill="#ffd700" opacity="0.6">
          <animate attributeName="cy" values="30;15;30" dur="1.8s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.6;0;0.6" dur="1.8s" repeatCount="indefinite" />
        </circle>
      </svg>
    </div>
  );
}

