import { ArrowRight, Construction } from "lucide-react";
export default function PlaceholderPage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="placeholder">
      <div className="placeholder-icon">
        <Construction />
      </div>
      <p className="eyebrow">NEXT MILESTONE</p>
      <h2>{title}</h2>
      <p>{description}</p>
      <button className="primary-button">
        View module roadmap <ArrowRight size={17} />
      </button>
    </div>
  );
}
