import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Award,
  Check,
  Clock3,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { Link } from "react-router-dom";
import { getQuotations, selectQuotation } from "../api/api";
import { money } from "../utils/currency";
export default function QuotationsPage() {
  const client = useQueryClient();
  const { data = [] } = useQuery({
    queryKey: ["quotations", "PR-2026-084"],
    queryFn: () => getQuotations(),
  });
  const mutation = useMutation({
    mutationFn: selectQuotation,
    onSuccess: () => client.invalidateQueries({ queryKey: ["quotations"] }),
  });
  const lowest = Math.min(...data.map((q) => q.total));
  const fastest = Math.min(...data.map((q) => q.deliveryDays));
  return (
    <>
      <div className="back-row">
        <Link to="/suppliers">
          <ArrowLeft size={17} />
          Back to suppliers
        </Link>
        <span>Purchase request PR-2026-084</span>
      </div>
      <section className="welcome quotation-heading">
        <div>
          <h2>Compare supplier quotations</h2>
          <p>Engineering laptops · 8 items · 3 responses received</p>
        </div>
        <div className="comparison-legend">
          <span>
            <i className="best" />
            Best commercial value
          </span>
          <span>
            <i />
            Other responses
          </span>
        </div>
      </section>
      <div className="quote-grid">
        {data.map((q) => (
          <article
            className={`quote-card panel ${q.total === lowest ? "recommended" : ""} ${q.status.toLowerCase()}`}
            key={q.id}
          >
            {q.total === lowest && (
              <div className="recommendation">
                <Award size={14} />
                Recommended
              </div>
            )}
            <div className="quote-supplier">
              <div className="quote-logo">
                {q.supplierName
                  .split(" ")
                  .slice(0, 2)
                  .map((x) => x[0])
                  .join("")}
              </div>
              <div>
                <h3>{q.supplierName}</h3>
                <span>
                  {q.id} · Valid until {q.validUntil}
                </span>
              </div>
            </div>
            <div className="quote-price">
              <span>Total quotation</span>
              <strong>{money(q.total)}</strong>
              <small>{money(q.subtotal)} before fees and tax</small>
            </div>
            <div className="quote-metrics">
              <div>
                <Truck />
                <span>
                  Delivery<strong>{q.deliveryDays} business days</strong>
                </span>
                {q.deliveryDays === fastest && <b>Fastest</b>}
              </div>
              <div>
                <Clock3 />
                <span>
                  Payment terms<strong>{q.paymentTerms}</strong>
                </span>
              </div>
              <div>
                <ShieldCheck />
                <span>
                  Warranty<strong>{q.warranty}</strong>
                </span>
              </div>
              <div>
                <Award />
                <span>
                  Technical score<strong>{q.technicalScore}/100</strong>
                </span>
              </div>
            </div>
            <div className="cost-breakdown">
              <div>
                <span>Items subtotal</span>
                <strong>{money(q.subtotal)}</strong>
              </div>
              <div>
                <span>Delivery fee</span>
                <strong>
                  {q.deliveryFee ? money(q.deliveryFee) : "Included"}
                </strong>
              </div>
              <div>
                <span>Tax</span>
                <strong>{money(q.tax)}</strong>
              </div>
            </div>
            {q.status === "Selected" ? (
              <Link className="selected-quote" to={`/orders/generate/${q.id}`}>
                <Check />
                Generate purchase order
              </Link>
            ) : q.status === "Declined" ? (
              <button className="declined-quote" disabled>
                Not selected
              </button>
            ) : (
              <button
                className="select-quote"
                disabled={mutation.isPending}
                onClick={() => mutation.mutate(q.id)}
              >
                Select this quotation
              </button>
            )}
          </article>
        ))}
      </div>
      <section className="panel comparison-table">
        <div className="panel-title">
          <div>
            <h3>Commercial comparison</h3>
            <p>Normalised view of every supplier response</p>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Evaluation factor</th>
                {data.map((q) => (
                  <th key={q.id}>{q.supplierName}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <CompareRow
                label="Total price"
                values={data.map((q) => money(q.total))}
                best={data.findIndex((q) => q.total === lowest)}
              />
              <CompareRow
                label="Delivery timeline"
                values={data.map((q) => `${q.deliveryDays} business days`)}
                best={data.findIndex((q) => q.deliveryDays === fastest)}
              />
              <CompareRow
                label="Payment terms"
                values={data.map((q) => q.paymentTerms)}
              />
              <CompareRow
                label="Warranty"
                values={data.map((q) => q.warranty)}
              />
              <CompareRow
                label="Technical score"
                values={data.map((q) => `${q.technicalScore}/100`)}
                best={data.findIndex(
                  (q) =>
                    q.technicalScore ===
                    Math.max(...data.map((x) => x.technicalScore)),
                )}
              />
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
function CompareRow({
  label,
  values,
  best,
}: {
  label: string;
  values: string[];
  best?: number;
}) {
  return (
    <tr>
      <td>
        <strong>{label}</strong>
      </td>
      {values.map((value, i) => (
        <td key={value + i} className={best === i ? "best-value" : ""}>
          {value}
          {best === i && <span>Best</span>}
        </td>
      ))}
    </tr>
  );
}
