import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
interface State {
  hasError: boolean;
}
export default class ErrorBoundary extends Component<
  { children: ReactNode },
  State
> {
  state: State = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ProcureFlow render error", error, info.componentStack);
  }
  render() {
    if (this.state.hasError)
      return (
        <main className="fatal-error" role="alert">
          <div>
            <AlertTriangle />
            <h1>Something went wrong</h1>
            <p>
              The workspace could not display this page. Your saved data has not
              been changed.
            </p>
            <button onClick={() => window.location.reload()}>
              <RefreshCw />
              Reload ProcureFlow
            </button>
          </div>
        </main>
      );
    return this.props.children;
  }
}
