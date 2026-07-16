import { PackageCheck } from "lucide-react";
import { useState } from "react";
import { useAppStore } from "../../store/store";

export default function LoginPage() {
  const [email, setEmail] = useState("demo@procureFlow.com");
  const [password, setPassword] = useState("procureFlow");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const login = useAppStore((s) => s.login);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login(email.trim(), password);
    } catch (loginError) {
      setError(
        loginError instanceof Error
          ? loginError.message
          : "Unable to sign in. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

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
        <form onSubmit={handleSubmit}>
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
            <input
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          {error && (
            <p className="login-error" role="alert">
              {error}
            </p>
          )}
          <div className="form-row">
            <label className="check">
              <input type="checkbox" defaultChecked />
              Keep me signed in
            </label>
            <button type="button" className="link-button">
              Forgot password?
            </button>
          </div>
          <button className="primary-button full" disabled={isSubmitting}>
            {isSubmitting ? "Signing in…" : "Sign in to ProcureFlow"}
          </button>
          <small className="demo-note">Demo role: Administrator</small>
          <small className="demo-note"> Demo login: Email: demo@procureFlow.com <br/> Password: procureFlow</small>
        </form>
      </section>
    </main>
  );
}
