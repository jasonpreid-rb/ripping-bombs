export function RBLogo({ height = 40, color = "#111111" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 841.89 595.28" style={{height,width:"auto",display:"block"}} aria-label="Ripping Bombs">
      <polygon fill={color} points="146.662,300.557 22.035,521.864 155.217,521.864 279.933,300.406 216.568,188.458 369.538,188.458 421.032,72.414 17.521,72.414"/>
      <polygon fill={color} points="695.492,293.872 824.537,72.414 820.016,72.414 820.029,72.414 686.834,72.414 686.834,72.414 421.032,72.414 472.527,188.458 621.49,188.458 562.133,293.872 623.367,405.807 472.527,405.807 421.032,521.864 686.834,521.851 686.834,521.864 820.029,521.864 820.016,521.851 824.537,521.851"/>
    </svg>
  );
}
export function RBLogoWhite({ height = 40 }) { return <RBLogo height={height} color="#ffffff"/>; }
export function RBLogoGreen({ height = 40 }) { return <RBLogo height={height} color="#a3e635"/>; }
