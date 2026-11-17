// Cartão de KPI/resumo clicável com composição do número (padrão SGD).
// Clique abre diálogo com a fórmula, filtros e linhas que montam o valor.
import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

export type LinhaComposicao = {
  id?: string;
  rotulo: string;
  valor?: React.ReactNode;
  detalhe?: React.ReactNode;
};

export type DialogoComposicaoProps = {
  aberto: boolean;
  onAbertoChange: (aberto: boolean) => void;
  titulo: string;
  explica?: string;
  linhas?: LinhaComposicao[];
  children?: React.ReactNode;
  rodape?: React.ReactNode;
  className?: string;
};

/** Diálogo padrão de composição — use quando o cartão já existe e só falta o detalhe. */
export const DialogoComposicao: React.FC<DialogoComposicaoProps> = ({
  aberto,
  onAbertoChange,
  titulo,
  explica,
  linhas,
  children,
  rodape,
  className,
}) => (
  <Dialog open={aberto} onOpenChange={onAbertoChange}>
    <DialogContent className={cn('max-h-[85vh] max-w-2xl overflow-y-auto', className)}>
      <DialogHeader>
        <DialogTitle>{titulo}</DialogTitle>
        {explica ? <DialogDescription>{explica}</DialogDescription> : null}
      </DialogHeader>
      {linhas && linhas.length > 0 ? (
        <ul className="space-y-1 text-sm" data-testid="composicao-linhas">
          {linhas.map((l, i) => (
            <li
              key={l.id ?? `${l.rotulo}-${i}`}
              className="flex items-start justify-between gap-3 border-b border-border py-1.5 last:border-0"
            >
              <div className="min-w-0">
                <p className="break-words font-medium text-foreground">{l.rotulo}</p>
                {l.detalhe ? <p className="text-xs text-muted-foreground">{l.detalhe}</p> : null}
              </div>
              {l.valor !== undefined && l.valor !== null && l.valor !== '' ? (
                <span className="shrink-0 whitespace-nowrap font-semibold tabular-nums text-foreground">
                  {l.valor}
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
      {children}
      {rodape ? <div className="border-t border-border pt-3 text-sm">{rodape}</div> : null}
      {(!linhas || linhas.length === 0) && !children ? (
        <p className="text-sm text-muted-foreground">
          Sem linhas de composição para este número neste momento.
        </p>
      ) : null}
    </DialogContent>
  </Dialog>
);

type CartaoComposicaoProps = {
  titulo: string;
  valor: React.ReactNode;
  /** Texto auxiliar sob o valor no cartão. */
  detalhe?: React.ReactNode;
  /** O que o número representa (vai no diálogo). */
  explica?: string;
  linhas?: LinhaComposicao[];
  children?: React.ReactNode;
  rodape?: React.ReactNode;
  /** Rótulo da ação no cartão. Padrão: "Ver composição". */
  acao?: string;
  className?: string;
  valorClassName?: string;
  tituloClassName?: string;
  icone?: React.ReactNode;
  testId?: string;
  /** Clique extra (ex.: filtrar lista) — o diálogo ainda abre se houver composição. */
  onClick?: () => void;
  /** Sem composição própria: só dispara onClick (ex.: abre um modal de domínio já existente). */
  soAcaoExterna?: boolean;
};

/**
 * Cartão de métrica clicável. Por padrão abre o diálogo de composição com `linhas`/`children`.
 * Use `soAcaoExterna` quando o detalhe já vive em outro modal.
 */
export const CartaoComposicao: React.FC<CartaoComposicaoProps> = ({
  titulo,
  valor,
  detalhe,
  explica,
  linhas,
  children,
  rodape,
  acao = 'Ver composição',
  className,
  valorClassName,
  tituloClassName,
  icone,
  testId,
  onClick,
  soAcaoExterna = false,
}) => {
  const [aberto, setAberto] = useState(false);
  const temComposicao =
    !soAcaoExterna && ((linhas && linhas.length > 0) || children != null || Boolean(explica));

  const ativar = () => {
    onClick?.();
    if (temComposicao) setAberto(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={ativar}
        data-testid={testId}
        title={explica || acao}
        className={cn(
          'group relative w-full overflow-hidden rounded-xl border border-border bg-card p-5 text-left shadow-sm transition',
          'hover:border-primary hover:shadow-md active:scale-[0.99] cursor-pointer',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          className
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <p
            className={cn(
              'text-xs font-bold uppercase tracking-wider text-muted-foreground group-hover:text-primary',
              tituloClassName
            )}
          >
            {titulo}
          </p>
          {icone ? (
            <span className="text-muted-foreground">{icone}</span>
          ) : (
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
          )}
        </div>
        <div className={cn('mt-2 text-2xl font-black tracking-tight text-foreground', valorClassName)}>
          {valor}
        </div>
        {detalhe ? <div className="mt-1 text-[11px] text-muted-foreground">{detalhe}</div> : null}
        <div className="mt-2 flex items-center gap-0.5 text-[11px] font-semibold text-primary group-hover:underline">
          {acao} <ChevronRight className="h-3 w-3" />
        </div>
      </button>
      {temComposicao ? (
        <DialogoComposicao
          aberto={aberto}
          onAbertoChange={setAberto}
          titulo={titulo}
          explica={explica}
          linhas={linhas}
          rodape={rodape}
        >
          {children}
        </DialogoComposicao>
      ) : null}
    </>
  );
};
