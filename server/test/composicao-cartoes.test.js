/**
 * Testes da lógica de composição dos cartões KPI (espelho das regras em src/lib/composicao-cartoes.ts).
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

function formatarMoedaBr(valor) {
  return `R$ ${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function honorariosCriticosTotal(clientes) {
  return clientes
    .filter((c) => c.statusRelacionamento === 'Crítico')
    .reduce((acc, c) => acc + (c.monthlyFee || 0), 0);
}

function potencialReceitaExtra(leads) {
  return leads
    .filter((l) => l.status !== 'DECLINADO')
    .reduce((acc, l) => acc + (l.estimatedMonthlyValue || 0), 0);
}

function composicaoGhosting(clientes) {
  return clientes
    .filter((c) => c.ghostingStatus === 'CRITICO_GHOSTING')
    .map((c) => ({ id: c.id, rotulo: c.name, valor: `−${c.interactionDropPercentage}%` }));
}

describe('composicao-cartoes', () => {
  it('soma honorários apenas de clientes críticos', () => {
    const clientes = [
      { statusRelacionamento: 'Crítico', monthlyFee: 5000 },
      { statusRelacionamento: 'Estável', monthlyFee: 9000 },
      { statusRelacionamento: 'Crítico', monthlyFee: 2500.5 },
    ];
    assert.equal(honorariosCriticosTotal(clientes), 7500.5);
    assert.match(formatarMoedaBr(7500.5), /7\.500,50/);
  });

  it('ignora leads declinados no potencial comercial', () => {
    const leads = [
      { status: 'NOVO', estimatedMonthlyValue: 3500 },
      { status: 'DECLINADO', estimatedMonthlyValue: 9999 },
      { status: 'EM_PROPOSTA', estimatedMonthlyValue: 2800 },
    ];
    assert.equal(potencialReceitaExtra(leads), 6300);
  });

  it('lista só ghosting crítico', () => {
    const clientes = [
      { id: '1', name: 'A', ghostingStatus: 'NORMAL', interactionDropPercentage: 10 },
      { id: '2', name: 'B', ghostingStatus: 'CRITICO_GHOSTING', interactionDropPercentage: 78 },
    ];
    const linhas = composicaoGhosting(clientes);
    assert.equal(linhas.length, 1);
    assert.equal(linhas[0].rotulo, 'B');
    assert.equal(linhas[0].valor, '−78%');
  });
});
