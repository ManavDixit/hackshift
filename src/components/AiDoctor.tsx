export type AvatarState =
  | 'idle'
  | 'greeting'
  | 'listening'
  | 'thinking'
  | 'speaking'
  | 'success'
  | 'error'
  | 'urgent';

interface Props {
  size?: number;
  state?: AvatarState;
  /** 0..1 mouth openness, driven by live audio level when speaking */
  mouth?: number;
  className?: string;
}

/**
 * MediLink AI Doctor — signature character.
 * A warm female physician in a white coat, teal scrubs, stethoscope and
 * MediLink emblem. One design reused across the site. The mouth geometry is
 * driven by the `mouth` prop (audio amplitude) so lip movement follows real
 * speech playback rather than animating at random.
 */
export function AiDoctor({ size = 160, state = 'idle', mouth = 0, className = '' }: Props) {
  const speaking = state === 'speaking';
  const listening = state === 'listening';
  const thinking = state === 'thinking';
  const greeting = state === 'greeting';
  const error = state === 'error' || state === 'urgent';

  // Mouth geometry: neutral closed line vs open ellipse scaled by amplitude.
  const open = speaking ? Math.min(1, Math.max(0.12, mouth)) : 0;
  const mouthW = 13 + open * 4;
  const mouthH = 1.5 + open * 9;
  const lipY = 92.5;

  // Head tilt while listening / gentle look-up while greeting.
  const tilt = listening ? -4 : greeting ? 2 : 0;
  const browRaise = greeting ? 1.4 : 0;

  const ring =
    state === 'thinking'
      ? '#3978F6'
      : speaking
        ? '#14B8A6'
        : listening
          ? '#5DD5C5'
          : null;

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`MediLink AI Doctor — ${state}`}
    >
      {ring && (
        <span
          className="absolute inset-0 rounded-full animate-pulse-ring"
          style={{ border: `2px solid ${ring}` , opacity: 0.55 }}
        />
      )}
      <span
        className="absolute rounded-full"
        style={{
          inset: size * 0.08,
          background:
            'radial-gradient(circle at 50% 42%, rgba(20,184,166,0.22), rgba(57,120,246,0.10) 55%, transparent 72%)',
        }}
      />
      <svg
        viewBox="0 0 200 200"
        width={size}
        height={size}
        className={`relative ${state === 'idle' || greeting ? 'animate-breathe' : ''}`}
        style={{ transformOrigin: '50% 62%' }}
      >
        <defs>
          <radialGradient id="md-glow" cx="50%" cy="42%" r="55%">
            <stop offset="0%" stopColor="#14B8A6" stopOpacity="0.22" />
            <stop offset="60%" stopColor="#3978F6" stopOpacity="0.10" />
            <stop offset="100%" stopColor="#3978F6" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="md-coat" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#E8EEF7" />
          </linearGradient>
          <linearGradient id="md-scrub" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#3978F6" />
            <stop offset="100%" stopColor="#1C4BAF" />
          </linearGradient>
          <linearGradient id="md-skin" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F6D3B8" />
            <stop offset="100%" stopColor="#EAB99A" />
          </linearGradient>
          <linearGradient id="md-hair" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4A3628" />
            <stop offset="100%" stopColor="#2E1F16" />
          </linearGradient>
          <radialGradient id="md-emblem" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#7DE8DC" />
            <stop offset="100%" stopColor="#14B8A6" />
          </radialGradient>
          <radialGradient id="md-cheek" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#F07E5C" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#F07E5C" stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle cx="100" cy="92" r="88" fill="url(#md-glow)" />

        {/* shoulders + white coat */}
        <path
          d="M100 112c-30 0-48 16-52 40-2 12-3 24-3 32h110c0-8-1-20-3-32-4-24-22-40-52-40z"
          fill="url(#md-coat)"
          stroke="#D7DFEC"
          strokeWidth="1.5"
        />
        {/* blue scrub v-neck */}
        <path d="M100 112 L85 129 L93 184 L107 184 L115 129 Z" fill="url(#md-scrub)" />
        <path d="M100 112 L85 129 L79 121 Z" fill="#FFFFFF" stroke="#D7DFEC" strokeWidth="1.2" />
        <path d="M100 112 L115 129 L121 121 Z" fill="#FFFFFF" stroke="#D7DFEC" strokeWidth="1.2" />
        <path d="M100 112 L85 129 L93 184 L74 184 C74 160 76 136 85 122 Z" fill="#FFFFFF" opacity="0.92" />
        <rect x="71" y="152" width="18" height="14" rx="2.5" fill="none" stroke="#D7DFEC" strokeWidth="1.4" />
        <rect x="111" y="152" width="18" height="14" rx="2.5" fill="none" stroke="#D7DFEC" strokeWidth="1.4" />

        {/* neck */}
        <rect x="91" y="98" width="18" height="18" rx="8" fill="url(#md-skin)" />
        <path d="M91 104c4 3.6 14 3.6 18 0v-6h-18z" fill="#DEA884" opacity="0.55" />

        {/* head group (tilt) */}
        <g style={{ transform: `rotate(${tilt}deg)`, transformOrigin: '100px 112px', transition: 'transform 0.5s ease' }}>
          {/* hair back */}
          <path d="M71 74c-2-18 10-30 29-30s31 12 29 30c1 12-1 22-3 28l-4-16c1-14-8-22-22-22s-23 8-22 22l-4 16c-2-6-4-16-3-28z" fill="url(#md-hair)" />
          {/* face */}
          <ellipse cx="100" cy="76" rx="25" ry="27" fill="url(#md-skin)" />
          {/* front hair sweep */}
          <path d="M75 70c1-13 11-21 25-21s24 8 25 21c-5-8-11-11-16-11 2 3 2 6 1 8-6-5-16-7-25-3-4 2-8 4-10 6z" fill="url(#md-hair)" />
          {/* ears + earrings */}
          <circle cx="75" cy="78" r="4.6" fill="url(#md-skin)" />
          <circle cx="125" cy="78" r="4.6" fill="url(#md-skin)" />
          <circle cx="75" cy="83" r="1.6" fill="#2EC4B0" />
          <circle cx="125" cy="83" r="1.6" fill="#2EC4B0" />

          {/* brows — raise on greeting, neutral on error */}
          <path
            d={`M86 ${68.5 - browRaise}c3-2 7-2 10 0`}
            stroke="#3A2A1E"
            strokeWidth="2.1"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d={`M104 ${68.5 - browRaise}c3-2 7-2 10 0`}
            stroke="#3A2A1E"
            strokeWidth="2.1"
            strokeLinecap="round"
            fill="none"
          />

          {/* eyes */}
          <g className="animate-blink" style={{ transformOrigin: '93px 77px' }}>
            <ellipse cx="93" cy="77" rx="3.6" ry={error ? 3.2 : 4} fill="#22314B" />
            <circle cx="94.2" cy="75.6" r="1.2" fill="#FFFFFF" />
          </g>
          <g className="animate-blink" style={{ transformOrigin: '107px 77px' }}>
            <ellipse cx="107" cy="77" rx="3.6" ry={error ? 3.2 : 4} fill="#22314B" />
            <circle cx="108.2" cy="75.6" r="1.2" fill="#FFFFFF" />
          </g>

          {/* cheeks */}
          <ellipse cx="86" cy="86" rx="5" ry="3" fill="url(#md-cheek)" opacity={error ? 0.3 : 0.8} />
          <ellipse cx="114" cy="86" rx="5" ry="3" fill="url(#md-cheek)" opacity={error ? 0.3 : 0.8} />

          {/* nose */}
          <path d="M100 80v5.2c0 1.6-1.2 2.6-2.6 2.6" stroke="#D89B76" strokeWidth="1.8" strokeLinecap="round" fill="none" />

          {/* mouth — driven by audio amplitude when speaking */}
          {speaking ? (
            <>
              <ellipse cx="100" cy={lipY} rx={mouthW / 2} ry={Math.max(1.2, mouthH / 2)} fill="#8A4A3A" />
              <ellipse cx="100" cy={lipY + mouthH * 0.12} rx={mouthW / 3.2} ry={Math.max(0.6, mouthH / 4)} fill="#C96A5B" opacity="0.7" />
            </>
          ) : error ? (
            <path d="M94 95c3-1.6 9-1.6 12 0" stroke="#B4714E" strokeWidth="1.9" strokeLinecap="round" fill="none" transform="translate(0 2) scale(1 -1) translate(0 -192)" />
          ) : (
            <path d="M93 91c4 3.6 10 3.6 14 0" stroke="#B4714E" strokeWidth="2.1" strokeLinecap="round" fill="none" />
          )}
        </g>

        {/* stethoscope */}
        <path d="M88 128c-6 10-6 22 2 30 5 5 12 7 18 7" stroke="#4B5B76" strokeWidth="3.4" strokeLinecap="round" fill="none" />
        <circle cx="110" cy="165" r="6.5" fill="#C9D4E4" stroke="#4B5B76" strokeWidth="2" />
        <circle cx="110" cy="165" r="2" fill="#4B5B76" />
        <path d="M88 128c-3-2-5-5-5-9" stroke="#4B5B76" strokeWidth="3.4" strokeLinecap="round" fill="none" />

        {/* MediLink AI emblem badge */}
        <circle cx="121" cy="142" r="8" fill="url(#md-emblem)" />
        <path d="M117.5 142h7M121 138.5v7" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />

        {/* welcoming hand on greeting */}
        <g style={{ transform: greeting ? 'translateY(-8px)' : 'translateY(6px)', opacity: greeting ? 1 : 0.85, transition: 'transform 0.6s cubic-bezier(0.22,1,0.36,1), opacity 0.4s' }}>
          <circle cx="60" cy="156" r="9" fill="url(#md-skin)" />
          <path d="M60 156c-6-2-12-4-16-8" stroke="#4B5B76" strokeWidth="7" strokeLinecap="round" fill="none" opacity="0.9" />
        </g>

        {/* listening waveform */}
        {listening && (
          <g>
            <rect x="148" y="118" width="4" height="10" rx="2" fill="#14B8A6" className="animate-wave-x" />
            <rect x="155" y="112" width="4" height="22" rx="2" fill="#3978F6" className="animate-wave-x" style={{ animationDelay: '0.15s' }} />
            <rect x="162" y="118" width="4" height="10" rx="2" fill="#14B8A6" className="animate-wave-x" style={{ animationDelay: '0.3s' }} />
          </g>
        )}

        {/* thinking dots above head */}
        {thinking && (
          <g fill="#3978F6">
            <circle cx="140" cy="52" r="3" className="animate-wave-x" />
            <circle cx="150" cy="46" r="3.6" className="animate-wave-x" style={{ animationDelay: '0.2s' }} />
            <circle cx="160" cy="40" r="4.2" className="animate-wave-x" style={{ animationDelay: '0.4s' }} />
          </g>
        )}
      </svg>
    </div>
  );
}
