import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "./ui/Button";
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
    <main
          className="grid min-h-screen place-items-center bg-[#f5f6f8] p-5 text-center"
          role="alert"
        >
          <div className="max-w-[430px] rounded-[14px] border border-[#e4e8ee] bg-white p-9">
            <AlertTriangle className="mx-auto text-amber-600" />
            <h1 className="mt-4 font-[Manrope] text-2xl font-bold">
              Something went wrong
            </h1>
            <p className="my-4 text-xs leading-6 text-[#748094]">
              The workspace could not display this page. Your saved data has not
              been changed.
            </p>
            <Button onClick={() => window.location.reload()}>
              <RefreshCw size={16} />
              Reload ProcureFlow
            </Button>
          </div>
        </main>
      );
    return this.props.children;
  }
}
