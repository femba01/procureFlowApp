import { PackageCheck } from "lucide-react";
import { useState } from "react";
import { useAppStore } from "../../store/store";
export default function LoginPage() {
  const [email, setEmail] = useState("muideen@procureflow.demo");
  const login = useAppStore((s) => s.login);
  return (
    <main className="login-page">
      <section className="login-brand">
        <div className="brand light">
          <span className="brand-mark">
            <PackageCheck />
          </span>
          <span>
            Procure<span>Flow</span>
          </span>
        </div>
        <div>
          <p className="eyebrow">SMARTER BUSINESS OPERATIONS</p>
          <h1>
            Control every purchase.
            <br />
            Understand every expense.
          </h1>
          <p>
            ProcureFlow connects requests, approvals, suppliers, orders and
            inventory in one dependable workspace.
          </p>
        </div>
        <blockquote>
          “We reduced purchasing delays by 42% in our first quarter.”
          <footer>— Operations Director, Acme Corporation</footer>
        </blockquote>
      </section>
      <section className="login-form">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            login(email);
          }}
        >
          <p className="eyebrow">WELCOME BACK</p>
          <h2>Sign in to your workspace</h2>
          <p>Use the demo account to explore ProcureFlow.</p>
          <label>
            Work email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label>
            Password
            <input type="password" value="demopassword" readOnly />
          </label>
          <div className="form-row">
            <label className="check">
              <input type="checkbox" defaultChecked />
              Keep me signed in
            </label>
            <button type="button" className="link-button">
              Forgot password?
            </button>
          </div>
          <button className="primary-button full">
            Sign in to ProcureFlow
          </button>
          <small className="demo-note">Demo role: Procurement Officer</small>
        </form>
      </section>
    </main>
  );
}
