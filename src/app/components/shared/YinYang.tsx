interface YinYangProps {
  size?: number;
  className?: string;
}

export function YinYang({ size = 40, className = "" }: YinYangProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Black base */}
      <circle cx="50" cy="50" r="50" fill="#0a0a0a" />
      {/* White yang shape */}
      <path
        d="M50,0 A50,50,0,0,1,50,100 A25,25,0,0,0,50,50 A25,25,0,0,1,50,0Z"
        fill="#f0f0f0"
      />
      {/* Black eye in white lower half */}
      <circle cx="50" cy="75" r="12" fill="#0a0a0a" />
      {/* White eye in black upper half */}
      <circle cx="50" cy="25" r="12" fill="#f0f0f0" />
      {/* Red accent dots */}
      <circle cx="50" cy="75" r="4" fill="#c8102e" />
      <circle cx="50" cy="25" r="4" fill="#c8102e" />
      {/* Red outer border ring */}
      <circle cx="50" cy="50" r="47.5" fill="none" stroke="#c8102e" strokeWidth="2" strokeOpacity="0.85" />
    </svg>
  );
}
