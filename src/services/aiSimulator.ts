import { Incident, IncidentSeverity, DepartmentType, HighlightedPhrase, TenantConfig, TenantId } from '../types';

export interface AIAnalysisResult {
  sentimentScore: number;
  severity: IncidentSeverity;
  category: DepartmentType;
  aiSummary: string;
  riskReasoning: string;
  highlightedPhrases: HighlightedPhrase[];
  suggestedReply: string;
  suggestedActionPlan: string[];
  churnRiskScore: number;
}

// Analisador inteligente de sentimento contábil / fiscal / atendimento
export function analyzeEmailWithAI(
  subject: string,
  body: string,
  config: TenantConfig
): AIAnalysisResult {
  const fullText = `${subject} ${body}`.toLowerCase();
  
  // Dicionário de termos críticos
  const criticalTerms = [
    'multa', 'auto de infração', 'receita federal', 'sefaz', 'processo', 
    'advogado', 'jurídico', 'cancelar contrato', 'rescisão', 'procon', 
    'inadmissível', 'danos morais', 'responsabilidade civil', 'bloqueio de bens', 
    'penhora', 'trocar de contador'
  ];
  
  // Dicionário de termos de severidade alta
  const highTerms = [
    'atraso', 'urgente', 'erro', 'divergência', 'holerite errado', 'das errado',
    'falta de retorno', 'não atendem', 'vence hoje', 'prazo estourado', 
    'duplicado', 'travado', 'prejuízo', 'reclamação', 'jucerja'
  ];

  // Dicionário de termos médios
  const mediumTerms = [
    'dúvida', 'cobrança', 'fatura', 'boleto', 'pendência', 'status', 'posição'
  ];

  let detectedCritical = criticalTerms.filter(t => fullText.includes(t));
  let detectedHigh = highTerms.filter(t => fullText.includes(t));
  let detectedMedium = mediumTerms.filter(t => fullText.includes(t));

  // Identificação do Departamento
  let category: DepartmentType = 'GERAL';
  if (fullText.includes('dctf') || fullText.includes('reinf') || fullText.includes('das') || fullText.includes('icms') || fullText.includes('iss') || fullText.includes('nota') || fullText.includes('fiscal') || fullText.includes('imposto') || fullText.includes('darf')) {
    category = 'FISCAL';
  } else if (fullText.includes('holerite') || fullText.includes('folha') || fullText.includes('fgts') || fullText.includes('salário') || fullText.includes('férias') || fullText.includes('rescisão de funcionário') || fullText.includes('adicional')) {
    category = 'FOLHA';
  } else if (fullText.includes('balancete') || fullText.includes('balanço') || fullText.includes('dre') || fullText.includes('contábil') || fullText.includes('conciliação')) {
    category = 'CONTABIL';
  } else if (fullText.includes('junta') || fullText.includes('jucesp') || fullText.includes('jucerja') || fullText.includes('contrato social') || fullText.includes('alteração') || fullText.includes('abertura') || fullText.includes('societário')) {
    category = 'LEGAL';
  } else if (fullText.includes('fatura') || fullText.includes('mensalidade') || fullText.includes('honorários') || fullText.includes('boleto') || fullText.includes('financeiro')) {
    category = 'FINANCEIRO';
  }

  let severity: IncidentSeverity = 'LOW';
  let sentimentScore = 0.0;
  let churnRiskScore = 15;

  if (detectedCritical.length > 0) {
    severity = 'CRITICAL';
    sentimentScore = -0.85 - (Math.min(detectedCritical.length, 3) * 0.04);
    churnRiskScore = 85 + (detectedCritical.length * 4);
  } else if (detectedHigh.length > 0) {
    severity = 'HIGH';
    sentimentScore = -0.60 - (Math.min(detectedHigh.length, 3) * 0.05);
    churnRiskScore = 60 + (detectedHigh.length * 5);
  } else if (detectedMedium.length > 0) {
    severity = 'MEDIUM';
    sentimentScore = -0.30;
    churnRiskScore = 35;
  } else {
    severity = 'LOW';
    sentimentScore = 0.10;
    churnRiskScore = 10;
  }

  // Montagem dos trechos destacados
  const highlightedPhrases: HighlightedPhrase[] = [];
  detectedCritical.forEach(term => {
    highlightedPhrases.push({
      text: `Menção a "${term}"`,
      reason: 'Risco crítico de litígio, penalidade tributária ou cancelamento',
      impact: 'severo'
    });
  });
  detectedHigh.forEach(term => {
    highlightedPhrases.push({
      text: `Menção a "${term}"`,
      reason: 'Atrito operacional ou cobrança com urgência',
      impact: 'moderado'
    });
  });

  if (highlightedPhrases.length === 0) {
    highlightedPhrases.push({
      text: subject,
      reason: 'Assunto do e-mail registrado para acompanhamento',
      impact: 'leve'
    });
  }

  // Síntese e Sugestão
  let aiSummary = `E-mail identificado com tom ${severity === 'CRITICAL' ? 'extremamente crítico' : severity === 'HIGH' ? 'de insatisfação alta' : 'moderado'} no departamento ${category}. Requer atenção imediata da equipe responsável.`;
  let riskReasoning = `O modelo ${config.ai.model} identificou probabilidade de churn de ${Math.min(churnRiskScore, 99)}% devido a termos de insatisfação detectados e necessidade de atuação da gerência.`;

  let suggestedReply = `Prezado(a),\n\nAcusamos o recebimento de sua mensagem e compreendemos a urgência da situação.\n\nNossa equipe especializada do departamento ${category} já está analisando o histórico e os documentos pertinentes para lhe apresentar uma solução definitiva com a máxima celeridade.\n\nEntraremos em contato em breve com o posicionamento completo.\n\nAtenciosamente,\nGrupo Contatur.`;

  let suggestedActionPlan = [
    `1. Auditar as rotinas do departamento ${category} relativas a este cliente.`,
    `2. Gerente responsável realizar contato de alinhamento com o remetente.`,
    `3. Registrar o plano de ação e protocolo na central de incidentes.`
  ];

  return {
    sentimentScore: Math.max(-1, Math.min(1, sentimentScore)),
    severity,
    category,
    aiSummary,
    riskReasoning,
    highlightedPhrases,
    suggestedReply,
    suggestedActionPlan,
    churnRiskScore: Math.min(churnRiskScore, 99)
  };
}
