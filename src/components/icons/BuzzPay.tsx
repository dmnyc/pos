type Props = {
  className?: string;
  style?: React.CSSProperties;
};

export function BuzzPay({ className, style }: Props) {
  return (
    <svg
      width="319"
      height="72"
      viewBox="0 0 319 72"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
    >
      <path
        d="M46.74 13.23C46.74 19.62 42.78 24.3 37.11 26.1C42.06 27.81 45.12 32.13 45.12 37.8C45.12 48.6 36.57 54 23.25 54H0.0300001L9.3 0.539996H30.45C41.61 0.539996 46.74 5.76 46.74 13.23ZM34.68 15.84C34.68 12.24 32.61 10.17 27.57 10.17H19.47L17.31 22.77H25.77C31.35 22.77 34.68 20.52 34.68 15.84ZM33.06 37.26C33.06 33.66 30.99 31.41 25.77 31.41H15.78L13.53 44.28H23.43C29.19 44.28 33.06 42.48 33.06 37.26Z"
        fill="currentColor"
      />
      <path 
        d="M80 16 L80 54 L60 54 L60 16 Z"
        fill="currentColor"
      />
      <path
        d="M100 16 L120 16 L120 24 L100 24 L100 32 L120 32 L120 40 L100 40 L100 48 L120 48 L120 54 L100 54 Z"
        fill="currentColor"
      />
      <path
        d="M140 16 L160 16 L170 46 L180 16 L200 16 L200 54 L190 54 L190 24 L180 54 L160 54 L150 24 L150 54 L140 54 Z"
        fill="currentColor"
      />
      <path
        d="M225 16 L245 16 L245 54 L225 54 Z"
        fill="currentColor"
      />
      <path
        d="M250 16 L270 16 L290 36 L290 16 L300 16 L300 54 L280 54 L260 34 L260 54 L250 54 Z"
        fill="currentColor"
      />
    </svg>
  );
}