type Props = {
  className?: string;
  style?: React.CSSProperties;
};

export function SatsFactoryPOS({ className, style }: Props) {
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
      {/* Sats Factory POS - Simple text representation */}
      <text x="10" y="45" fontFamily="Space Mono, monospace" fontSize="32" fontWeight="bold" fill="currentColor">
        Sats Factory POS
      </text>
    </svg>
  );
}