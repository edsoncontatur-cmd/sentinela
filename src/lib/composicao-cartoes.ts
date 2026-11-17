/**
 * Montagem pura das linhas de composição dos cartões KPI (testável sem React).
 */
import type {
  ClientEntity,
  CommercialLead,
  Incident,
  MonitoredMailbox,
  TeamWorkloadMember,
} from '@/types';
import type { LinhaComposicao } from '@/components/common/CartaoComposicao';

export function formatarMoedaBr(valor: number): string {
  return `R$ ${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function clientesCriticos(clientes: ClientEntity[]): ClientEntity[] {
  return clientes.filter((c) => c.statusRelacionamento === 'Crítico');
}

export function clientesGhostingCritico(clientes: ClientEntity[]): ClientEntity[] {
  return clientes.filter((c) => c.ghostingStatus === 'CRITICO_GHOSTING');
}

export function honorariosCriticosTotal(clientes: ClientEntity[]): number {
  return clientesCriticos(clientes).reduce((acc, c) => acc + (c.monthlyFee || 0), 0);
}

export function composicaoHonorariosCriticos(clientes: ClientEntity[]): LinhaComposicao[] {
  const criticos = clientesCriticos(clientes);
  if (criticos.length === 0) {
    return [{ rotulo: 'Nenhum cliente com status Crítico', valor: formatarMoedaBr(0) }];
  }
  return criticos
    .slice()
    .sort((a, b) => (b.monthlyFee || 0) - (a.monthlyFee || 0))
    .map((c) => ({
      id: c.id,
      rotulo: c.name,
      valor: `${formatarMoedaBr(c.monthlyFee || 0)}/mês`,
      detalhe: `Status: ${c.statusRelacionamento} · Health ${c.healthScore}/100 · Curva ${c.curveABC}`,
    }));
}

export function composicaoGhosting(clientes: ClientEntity[]): LinhaComposicao[] {
  const lista = clientesGhostingCritico(clientes);
  if (lista.length === 0) {
    return [{ rotulo: 'Nenhum cliente em ghosting crítico', valor: '0' }];
  }
  return lista.map((c) => ({
    id: c.id,
    rotulo: c.name,
    valor: `−${c.interactionDropPercentage}%`,
    detalhe: `Último e-mail: ${new Date(c.lastEmailReceivedDate).toLocaleDateString('pt-BR')} · Honorário ${formatarMoedaBr(c.monthlyFee || 0)}/mês`,
  }));
}

export function leadsAtivosComerciais(leads: CommercialLead[]): CommercialLead[] {
  return leads.filter((l) => l.status !== 'DECLINADO');
}

export function potencialReceitaExtra(leads: CommercialLead[]): number {
  return leadsAtivosComerciais(leads).reduce((acc, l) => acc + (l.estimatedMonthlyValue || 0), 0);
}

const LABEL_OPORTUNIDADE: Record<CommercialLead['opportunityType'], string> = {
  ABERTURA_FILIAL: 'Abertura de filial',
  AUMENTO_QUADRO_FOLHA: 'Expansão de quadro',
  BPO_FINANCEIRO: 'BPO financeiro',
  CONSULTORIA_TRIBUTARIA: 'Consultoria tributária',
  RECUPERACAO_CREDITOS: 'Recuperação de créditos',
  HOLDING_PATRIMONIAL: 'Holding patrimonial',
};

export function composicaoOportunidadesComerciais(leads: CommercialLead[]): LinhaComposicao[] {
  const ativos = leadsAtivosComerciais(leads);
  if (ativos.length === 0) {
    return [{ rotulo: 'Nenhuma oportunidade ativa', valor: formatarMoedaBr(0) }];
  }
  return ativos
    .slice()
    .sort((a, b) => (b.estimatedMonthlyValue || 0) - (a.estimatedMonthlyValue || 0))
    .map((l) => ({
      id: l.id,
      rotulo: l.clientName,
      valor: `${formatarMoedaBr(l.estimatedMonthlyValue || 0)}/mês`,
      detalhe: `${l.title} · ${LABEL_OPORTUNIDADE[l.opportunityType] || l.opportunityType} · ${l.status} · confiança ${l.confidenceScore}%`,
    }));
}

export function composicaoEmailsMonitorados(mailboxes: MonitoredMailbox[]): LinhaComposicao[] {
  if (mailboxes.length === 0) {
    return [{ rotulo: 'Nenhuma caixa monitorada', valor: '0' }];
  }
  return mailboxes
    .slice()
    .sort((a, b) => (b.totalEmailsReceived || 0) - (a.totalEmailsReceived || 0))
    .map((m) => ({
      id: m.id,
      rotulo: m.emailAddress || m.displayName || m.id,
      valor: (m.totalEmailsReceived || 0).toLocaleString('pt-BR'),
      detalhe: m.displayName && m.displayName !== m.emailAddress ? m.displayName : undefined,
    }));
}

export function composicaoIncidentesPorSeveridade(
  incidents: Incident[],
  severidade: Incident['severity'] | 'RESOLVIDO' | 'TODOS'
): LinhaComposicao[] {
  let lista = incidents;
  if (severidade === 'RESOLVIDO') {
    lista = incidents.filter((i) => i.status === 'RESOLVIDO');
  } else if (severidade !== 'TODOS') {
    lista = incidents.filter((i) => i.severity === severidade);
  }
  if (lista.length === 0) {
    return [{ rotulo: 'Nenhuma ocorrência nesta fatia', valor: '0' }];
  }
  return lista.slice(0, 40).map((i) => ({
    id: i.id,
    rotulo: i.senderName,
    valor: i.severity,
    detalhe: `${i.subject} · ${i.status} · churn ${i.churnRiskScore}%`,
  }));
}

export function composicaoVolumeEmailsEquipe(workload: TeamWorkloadMember[]): LinhaComposicao[] {
  if (workload.length === 0) {
    return [{ rotulo: 'Nenhum analista monitorado', valor: '0' }];
  }
  return workload
    .slice()
    .sort((a, b) => b.emailsReceivedThisMonth - a.emailsReceivedThisMonth)
    .map((m) => ({
      id: m.id,
      rotulo: m.analystName,
      valor: m.emailsReceivedThisMonth.toLocaleString('pt-BR'),
      detalhe: `${m.department} · ${m.emailsReceivedThisMonth} e-mails · ${m.activeAssignedClientsCount} clientes`,
    }));
}

export function composicaoTempoRespostaEquipe(workload: TeamWorkloadMember[]): LinhaComposicao[] {
  if (workload.length === 0) {
    return [{ rotulo: 'Nenhum analista monitorado', valor: '—' }];
  }
  return workload
    .slice()
    .sort((a, b) => b.averageResponseTimeHours - a.averageResponseTimeHours)
    .map((m) => ({
      id: m.id,
      rotulo: m.analystName,
      valor: `${m.averageResponseTimeHours.toFixed(1)} h`,
      detalhe: `${m.department} · risco burnout: ${m.burnoutRiskLevel}`,
    }));
}

export function composicaoAnalistasMonitorados(workload: TeamWorkloadMember[]): LinhaComposicao[] {
  if (workload.length === 0) {
    return [{ rotulo: 'Nenhum analista monitorado', valor: '0' }];
  }
  return workload.map((m) => ({
    id: m.id,
    rotulo: m.analystName,
    valor: m.department,
    detalhe: `${m.analystEmail} · ${m.isOverloaded ? 'Sobrecarregado' : 'Carga ok'} · ${m.burnoutRiskLevel}`,
  }));
}
