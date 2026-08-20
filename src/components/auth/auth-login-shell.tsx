import type { ReactNode } from "react";
import { ThemeToggle } from "@/components/theme-toggle";

type AuthLoginShellProps = {
  appMark?: string;
  title: string;
  tagline: string;
  children: ReactNode;
  toolbar?: ReactNode;
  footer?: ReactNode;
  feedback?: string | null;
};

export function AuthLoginShell({
  appMark = "P",
  title,
  tagline,
  children,
  toolbar,
  footer,
  feedback,
}: AuthLoginShellProps) {
  return (
    <main className="page-auth-login">
      <div className="auth-login-topbar">
        <ThemeToggle />
      </div>
      <div className="auth-login-card">
        <div className="auth-login-brand">
          <div className="auth-login-logo" aria-hidden>
            {appMark}
          </div>
          <h1 className="auth-login-title">{title}</h1>
          <p className="auth-login-tagline">{tagline}</p>
        </div>
        {toolbar}
        {children}
        {feedback ? (
          <p className="auth-login-feedback" role="alert">
            {feedback}
          </p>
        ) : null}
        {footer}
      </div>
    </main>
  );
}
