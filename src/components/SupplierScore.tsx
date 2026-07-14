import type { ReactNode } from "react";

type SupplierScoreProps = {
  label: string;
  value: string;
  progress: number;
  icon: ReactNode;
};

export default function SupplierScore({
  label,
  value,
  progress,
  icon,
}: SupplierScoreProps) {
  return (
    <article className="score-card panel">
      <div className="score-icon">{icon}</div>
      <span>{label}</span>
      <strong>{value}</strong>
      <div className="progress">
        <i style={{ width: `${progress}%` }} />
      </div>
    </article>
  );
}
