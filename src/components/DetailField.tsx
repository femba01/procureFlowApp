type DetailFieldProps = {
  label: string;
  value: string;
  className?: string;
};

export default function DetailField({
  label,
  value,
  className,
}: DetailFieldProps) {
  return (
    <div className={`leading-4 ${className || ""}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
