import { ShieldX } from "lucide-react";
import { Link } from "react-router-dom";
export default function ForbiddenPage() {
  return (
    <div className="placeholder" role="alert">
      <div className="placeholder-icon">
        <ShieldX />
      </div>
      <p className="eyebrow">ACCESS RESTRICTED</p>
      <h2>You don’t have permission to view this module</h2>
      <p>
        Your current role does not include this capability. Contact an
        administrator if your responsibilities have changed.
      </p>
      <Link className="primary-button" to="/dashboard">
        Return to dashboard
      </Link>
    </div>
  );
}
