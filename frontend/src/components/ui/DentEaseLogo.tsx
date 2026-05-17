import { DentQLLogo } from './DentQLLogo';

export function DentEaseLogo({ size = "md" }: { size?: "sm" | "md" }): JSX.Element {
  return (
    <DentQLLogo size={size === "sm" ? "sm" : "md"} className={size === "sm" ? "scale-50" : "scale-75"} />
  );
}
