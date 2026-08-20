/**
 * Metadados de build injetados pelo Vite (build-time).
 */

export type AppBuildInfo = {
  version: string;
  gitSha: string;
  buildTimeIso: string;
  label: string;
  title: string;
};

function formatBuildTimePtBr(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

export function readAppBuildInfo(): AppBuildInfo {
  const version = (import.meta.env.VITE_APP_VERSION as string | undefined)?.trim() || "0.0.0";
  const gitSha = (import.meta.env.VITE_APP_GIT_SHA as string | undefined)?.trim() || "dev";
  const buildTimeIso =
    (import.meta.env.VITE_APP_BUILD_TIME as string | undefined)?.trim() || new Date().toISOString();
  const when = formatBuildTimePtBr(buildTimeIso);
  const label = `v${version} (${gitSha}) · ${when}`;
  const title = `Versão ${version}, commit ${gitSha}, publicado em ${when} (horário de Brasília).`;
  return { version, gitSha, buildTimeIso, label, title };
}
