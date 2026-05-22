import { DentQLLogo } from './DentQLLogo';

export function DentEaseLogo({ size = "md" }: { size?: "sm" | "md" }): JSX.Element {
  return (
    <DentQLLogo variant="marketing" size={size === "sm" ? "sm" : "md"} />
  );
}
