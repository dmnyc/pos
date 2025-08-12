type Props = {
  className?: string;
  style?: React.CSSProperties;
};

export function LightningPOS({ className, style }: Props) {
  return (
    <svg
      width="300"
      height="72"
      viewBox="0 0 300 72"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
    >
      <path
        d="M20 16 L20 48 L40 48 L40 54 L14 54 L14 16 Z"
        fill="currentColor"
      />
      <path
        d="M50 16 L56 16 L56 54 L50 54 Z"
        fill="currentColor"
      />
      <path
        d="M65 16 L88 16 L88 22 L71 22 L71 32 L85 32 L85 38 L71 38 L71 54 L65 54 Z"
        fill="currentColor"
      />
      <path
        d="M95 16 L101 16 L101 32 L115 32 L115 16 L121 16 L121 54 L115 54 L115 38 L101 38 L101 54 L95 54 Z"
        fill="currentColor"
      />
      <path
        d="M130 16 L151 16 L156 40 L161 16 L182 16 L182 54 L176 54 L176 22 L169 54 L143 54 L136 22 L136 54 L130 54 Z"
        fill="currentColor"
      />
      <path
        d="M190 16 L196 16 L196 54 L190 54 Z"
        fill="currentColor"
      />
      <path
        d="M205 16 L211 16 L211 48 L230 48 L230 54 L205 54 Z"
        fill="currentColor"
      />
      <path
        d="M237 16 L259 16 L263 54 L257 54 L255 42 L241 42 L239 54 L233 54 Z M242 36 L254 36 L251 22 L245 22 Z"
        fill="currentColor"
      />
      <path
        d="M270 16 L290 16 L295 54 L289 54 L285 22 L275 22 L271 54 L265 54 Z"
        fill="currentColor"
      />

      {/* Lightning Bolt */}
      <path
        d="M40 14 L30 34 L38 34 L26 60 L36 40 L28 40 Z"
        fill="currentColor"
      />
    </svg>
  );
}