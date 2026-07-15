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
import { getSupplier } from "../../api/api";
import DetailField from "../../components/DetailField";
import SupplierScore from "../../components/SupplierScore";
import { money } from "../../utils/currency";
export default function SupplierDetailsPage() {
  const { supplierId = "" } = useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["supplier", supplierId],
    queryFn: () => getSupplier(supplierId),
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
        <span>Supplier ID: {data.id}</span>
      </div>
      <section className="supplier-hero panel">
        <div className="supplier-avatar">{data.initials}</div>
        <div>
          <div className="supplier-heading">
            <h2>{data.name}</h2>
            <span
              className={`supplier-status ${data.status.toLowerCase().replace(" ", "-")}`}
            >
              {data.status}
            </span>
          </div>
          <p>{data.category} · Registered supplier since 2024</p>
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
          value={data.rating ? `${data.rating}/5` : "Not rated"}
          progress={data.rating * 20}
          icon={<Star />}
        />
        <SupplierScore
          label="On-time delivery"
          value={`${data.onTimeDelivery}%`}
          progress={data.onTimeDelivery}
          icon={<CheckCircle2 />}
        />
        <SupplierScore
          label="Quality score"
          value={`${data.qualityScore}%`}
          progress={data.qualityScore}
          icon={<ShieldCheck />}
        />
        <article className="score-card panel">
          <span>Total relationship value</span>
          <strong>{money(data.totalSpend)}</strong>
          <small>{data.totalOrders} purchase orders</small>
        </article>
      </section>
      <div className="supplier-detail-grid">
        <section className="panel supplier-info">
          <h3>Commercial information</h3>
          <div>
            <DetailField label="Payment terms" value="30 days" />
            <DetailField
              label="Default currency"
              value="NGN — Nigerian Naira"
            />
            <DetailField label="Tax status" value="Verified" />
            <DetailField
              label="Compliance expiry"
              value={data.complianceExpiry}
            />
            <DetailField label="Account manager" value={data.contactName} />
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
