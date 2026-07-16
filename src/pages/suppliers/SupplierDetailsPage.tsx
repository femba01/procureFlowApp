import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  CheckCircle2,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Star,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { getSupplierById } from "../../api/suppliersApi";
import DetailField from "../../components/DetailField";
import SupplierScore from "../../components/SupplierScore";
export default function SupplierDetailsPage() {
  const { supplierId = "" } = useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["supplier", supplierId],
    queryFn: () => getSupplierById(supplierId),
  });
  if (isLoading) return <div className="detail-loading" />;
  if (!data) return null;
  return (
    <>
      <div className="back-row">
        <Link to="/suppliers">
          <ArrowLeft size={17} />
          Back to suppliers
        </Link>
        <span>Supplier ID: {data.supplier_number}</span>
      </div>
      <section className="supplier-hero panel">
        <div className="supplier-avatar">{initials(data.name)}</div>
        <div>
          <div className="supplier-heading">
            <h2>{data.name}</h2>
            <span
              className={`supplier-status ${data.status.replaceAll("_", "-")}`}
            >
              {displayStatus(data.status)}
            </span>
          </div>
          <p>
            {data.category} · Registered supplier since{" "}
            {new Date(data.created_at).getFullYear()}
          </p>
          <div className="contact-row">
            <span>
              <Mail /> {data.email}
            </span>
            <span>
              <Phone /> {data.phone}
            </span>
            <span>
              <MapPin /> {data.location}
            </span>
          </div>
        </div>
        <button className="secondary-button">Edit supplier</button>
      </section>
      <section className="performance-grid">
        <SupplierScore
          label="Supplier rating"
          value={data.rating ? `${data.rating}/9.99` : "Not rated"}
          progress={(data.rating / 9.99) * 100}
          icon={<Star />}
        />
        <SupplierScore
          label="On-time delivery"
          value={`${data.on_time_delivery_pct}%`}
          progress={data.on_time_delivery_pct}
          icon={<CheckCircle2 />}
        />
        <SupplierScore
          label="Quality score"
          value={`${data.quality_score_pct}%`}
          progress={data.quality_score_pct}
          icon={<ShieldCheck />}
        />
        <article className="score-card panel">
          <span>Supplier number</span>
          <strong>{data.supplier_number}</strong>
          <small>{displayStatus(data.status)}</small>
        </article>
      </section>
      <div className="supplier-detail-grid">
        <section className="panel supplier-info">
          <h3>Commercial information</h3>
          <div>
            <DetailField
              label="Payment terms"
              value={data.payment_terms || "Not provided"}
            />
            <DetailField
              label="Default currency"
              value="NGN — Nigerian Naira"
            />
            <DetailField label="Tax ID" value={data.tax_id || "Not provided"} />
            <DetailField
              label="Created"
              value={new Date(data.created_at).toLocaleDateString()}
            />
            <DetailField label="Primary contact" value={data.contact_name} />
            <DetailField label="Last order" value="02 Jul 2026" />
          </div>
        </section>
        <section className="panel compliance-card">
          <h3>Compliance checklist</h3>
          {[
            "Business registration",
            "Tax clearance certificate",
            "Bank verification",
            "Signed supplier agreement",
          ].map((item, i) => (
            <div key={item}>
              <CheckCircle2 />
              <span>
                {item}
                <small>
                  {i === 3 ? "Renewal due December 2026" : "Verified"}
                </small>
              </span>
            </div>
          ))}
        </section>
      </div>
    </>
  );
}

const initials = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

const displayStatus = (status: string) =>
  status
    .replaceAll("_", " ")
    .replace(/^./, (letter) => letter.toUpperCase());
