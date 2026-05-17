import { Component, type ErrorInfo, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const NS = "pages.routeError";

type Props = { children: ReactNode };
type State = { hasError: boolean; message?: string };

export class RouteErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("Route error:", error, info.componentStack);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return <RouteErrorFallback message={this.state.message} />;
    }
    return this.props.children;
  }
}

function RouteErrorFallback({ message }: { message?: string }): JSX.Element {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-xl font-black text-slate-900 dark:text-white">{t(`${NS}.title`)}</h1>
      <p className="max-w-md text-sm text-slate-500">{t(`${NS}.subtitle`)}</p>
      {message ? <p className="max-w-lg rounded-xl bg-rose-50 px-4 py-2 text-xs text-rose-700">{message}</p> : null}
      <Link
        to="/dashboard"
        className="rounded-xl bg-sky-600 px-5 py-2.5 text-xs font-black uppercase tracking-widest text-white"
      >
        {t(`${NS}.back`)}
      </Link>
    </div>
  );
}
