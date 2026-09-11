import type { ReactNode } from "react";

/**
 * Casca canônica da tela de login do Grupo Contatur.
 *
 * POR QUE ELA NÃO IMPORTA NADA DO APP
 *
 * Até 10/09/2026 este arquivo importava `@/components/theme-toggle` e
 * `@/components/help/help-trigger` — componentes que existem no SGD, de onde a
 * casca nasceu, mas não nos outros apps. Ao propagá-la para o portfólio, todo
 * app sem esses dois passava a **não compilar**, mesmo sem usar a casca: o
 * `tsc` confere o arquivo por existir, não por ser importado.
 *
 * Componente compartilhado não pode presumir o que o app tem. O que era import
 * virou a prop `acoesTopo`: quem tem ajuda e alternador de tema passa; quem não
 * tem, omite e a barra some.
 */
type AuthLoginShellProps = {
  /** Letra ou sigla curta exibida no bloco da marca. */
  appMark?: string;
  /** Nome do produto. Ex.: "SGC", "Contatur Legal". */
  title: string;
  /** Uma linha dizendo para que o sistema serve. */
  tagline: string;
  /** O formulário de acesso. */
  children: ReactNode;
  /**
   * Canto superior da tela — tipicamente ajuda e alternador de tema.
   * Omitido, a barra não é renderizada.
   */
  acoesTopo?: ReactNode;
  /** Faixa entre a marca e o formulário (avisos, seletor de ambiente). */
  toolbar?: ReactNode;
  /** Rodapé do cartão: links de recuperação, aviso de acesso restrito. */
  footer?: ReactNode;
  /** Mensagem de erro ou aviso, anunciada a leitores de tela. */
  feedback?: string | null;
};

export function AuthLoginShell({
  appMark = "C",
  title,
  tagline,
  children,
  acoesTopo,
  toolbar,
  footer,
  feedback,
}: AuthLoginShellProps) {
  return (
    <main className="page-auth-login">
      {acoesTopo ? <div className="auth-login-topbar">{acoesTopo}</div> : null}
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
