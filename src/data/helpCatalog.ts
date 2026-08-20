export interface DetailedHelpItem {
  route: string;
  title: string;
  subtitle: string;
  sections: {
    whatIs: {
      title: string;
      content: string;
      highlights?: string[];
    };
    beforeYouStart: {
      title: string;
      requirements: string[];
      rolePermissions: string;
    };
    fieldGuide: {
      title: string;
      items: { name: string; description: string; tip?: string }[];
    };
    stepByStep: {
      title: string;
      steps: string[];
    };
    troubleshooting: {
      title: string;
      issues: { problem: string; solution: string }[];
    };
  };
}

export const COMPREHENSIVE_HELP_CATALOG: Record<string, DetailedHelpItem> = {
  '/': {
    route: '/',
    title: 'Dashboard Executivo & Cockpit de Comando',
    subtitle: 'Painel unificado de monitoramento preventivo de e-mails, risco financeiro e oportunidades para as 3 unidades Contatur.',
    sections: {
      whatIs: {
        title: '1. O que é o Dashboard Executivo?',
        content: 'É a central de controle em tempo real do Contatur Sentinel. Ele consolida os sinais de inteligência artificial de todas as caixas de e-mail corporativas monitoradas no Microsoft 365 e Google Workspace, detectando atritos com clientes, riscos de multas fiscais e oportunidades de faturamento antes que virem crises.',
        highlights: [
          'Visão Multi-Tenant: Alterne entre Contatur São Paulo, Contatur Rio e MKP São Paulo no topo da tela.',
          'Cockpit Financeiro: Visualize em tempo real o valor total de honorários contábeis sob risco (R$/mês).',
          'Radar de Silêncio (Ghosting Alert): Clientes com queda repentina de troca de e-mails são sinalizados para prevenção de cancelamento.',
        ],
      },
      beforeYouStart: {
        title: '2. Antes de Começar (Pré-requisitos & Permissões)',
        requirements: [
          'Certifique-se de selecionar a Unidade correta no seletor do Topbar (ou "Todas as Unidades" se você for SuperAdmin).',
          'Verifique se os provedores de e-mail e as chaves de IA estão ativos na aba de Configurações.',
        ],
        rolePermissions: 'Acesso liberado para Administradores, Diretores, Supervisores e Analistas (com filtro por unidade do colaborador).',
      },
      fieldGuide: {
        title: '3. Guia Detalhado de Indicadores & Cards',
        items: [
          {
            name: 'Honorários sob Risco Crítico (R$)',
            description: 'Soma dos honorários mensais de todos os clientes que possuem reclamações graves ou sentimento crítico acumulado.',
            tip: 'Priorize imediatamente o atendimento desses clientes para evitar cancelamento de contrato (churn).',
          },
          {
            name: 'Alerta de Silêncio / Ghosting',
            description: 'Indica quantos clientes da unidade reduziram em mais de 70% o volume de interações nos últimos 21 dias.',
            tip: 'O silêncio do cliente contábil quase sempre precede o pedido de transferência de escritório.',
          },
          {
            name: 'Receita Comercial Extra (SGC)',
            description: 'Total em R$/mês de novas demandas identificadas pela IA nos e-mails (aberturas de filiais, expansão de folha, BPO).',
          },
          {
            name: 'Alerta Proativo de Calendário Fiscal',
            description: 'Banner de urgência máxima acionado quando mensagens sobre DCTFWeb, EFD-Reinf, FGTS Digital ou DAS chegam a menos de 48h do vencimento legal.',
          },
          {
            name: 'Simulador de Ingestão de E-mails',
            description: 'Permite colar o corpo de um e-mail de teste para validar a inferência da IA, sentimento e extração de dados em tempo real.',
          },
        ],
      },
      stepByStep: {
        title: '4. Fluxo Operacional Recomendado (Dia a Dia)',
        steps: [
          '1. Ao abrir o sistema pela manhã, verifique o card de "Honorários sob Risco" e o "Alerta de Calendário Fiscal".',
          '2. Se houver incidentes críticos com risco financeiro, clique no card ou acesse o menu "Incidentes" para tratar.',
          '3. Verifique a lista de "Ocorrências Recentes" e atribua analistas aos chamados em aberto.',
          '4. Revise os alertas de Ghosting para agendar ligações de cortesia da gerência.',
        ],
      },
      troubleshooting: {
        title: '5. Problemas Comuns & Como Resolver',
        issues: [
          {
            problem: 'Os números de incidentes não atualizam após a troca de unidade.',
            solution: 'Verifique o seletor de unidade no topo. Se for SuperAdmin, o modo "Todas as Unidades" consolida os dados das 3 empresas.',
          },
          {
            problem: 'O simulador de e-mails não responde.',
            solution: 'Acesse "Configurações > 2. Motores de IA" e valide se a chave de API (Gemini/OpenAI) está configurada e com conexão testada.',
          },
        ],
      },
    },
  },

  '/incidentes': {
    route: '/incidentes',
    title: 'Central de Incidentes & Gestão de Ocorrências',
    subtitle: 'Triagem, resposta empática com copiloto de IA, esteira de mediação de supervisores, OCR de notificações fiscais e pesquisa CSAT.',
    sections: {
      whatIs: {
        title: '1. O que é a Central de Incidentes?',
        content: 'É o coração operacional do Contatur Sentinel. Todas as mensagens recebidas nas caixas de e-mail corporativas que apresentam queixas, insatisfação, notificações fiscais ou risco jurídico são transformadas automaticamente em Incidentes numerados com classificação de severidade.',
        highlights: [
          'Visão Flexível: Alterne entre Quadro Kanban (por etapas de atendimento) e Tabela Completa.',
          'Leitura Ótica (OCR) & Áudio: A IA extrai texto de autos de infração (PDFs) e transcreve áudios anexados aos e-mails.',
          'Régua de Mediação Supervisor ↔ Cliente: O supervisor assume formalmente o chamado e envia posições de andamento.',
          'Pesquisa de Satisfação (CSAT 1-Click): O cliente avalia a solução e o Health Score é recalculado.',
        ],
      },
      beforeYouStart: {
        title: '2. Antes de Começar (Regras de Negócio)',
        requirements: [
          'Incidentes de severidade CRÍTICA possuem SLA rígido de atendimento (padrão: até 2 horas).',
          'Nenhum incidente deve ser marcado como "RESOLVIDO" sem o preenchimento das notas técnicas de solução.',
        ],
        rolePermissions: 'Supervisores e Analistas podem responder e alterar status. Diretores e SuperAdmin têm visão irrestrita.',
      },
      fieldGuide: {
        title: '3. Guia de Campos, Badges e Botões da Ficha',
        items: [
          {
            name: 'Classificação de Severidade (Crítica / Alta / Média / Baixa)',
            description: 'Definida pelo motor de NLP com base em palavras-chave (multa, cancelamento, processo, fiscal) e tom emocional do remetente.',
          },
          {
            name: 'Status (Triagem / Em Atendimento / Aguardando Cliente / Resolvido)',
            description: 'Etapa atual do fluxo de trabalho. Arraste os cards no Kanban ou use o seletor na visualização em Tabela.',
          },
          {
            name: 'Copiloto de IA & Minuta de Resposta',
            description: 'Gera uma proposta de resposta técnica, polida e humanizada com 1 clique, pronta para envio ao cliente.',
            tip: 'Revise sempre os dados específicos (valores, datas) antes de transmitir.',
          },
          {
            name: 'Régua de Mediação Supervisor ↔ Cliente',
            description: 'Esteira de 3 fases: 1) Acolhimento do Supervisor; 2) Status Update em tempo real; 3) Pesquisa CSAT 1 a 5 estrelas.',
          },
          {
            name: 'Touchpoint de Retenção Pós-Atendimento',
            description: 'Permite disparar um e-mail de cortesia assinado pela diretoria 48h após a solução do chamado.',
          },
          {
            name: 'OCR & Transcrição de Áudio',
            description: 'Exibe o texto extraído de anexos em PDF (notificações da Receita Federal/SEFAZ) e mensagens de voz do WhatsApp.',
          },
        ],
      },
      stepByStep: {
        title: '4. Passo a Passo para Resolução de uma Ocorrência',
        steps: [
          '1. Abra o incidente clicando no card ou na linha da tabela.',
          '2. Analise o "Diagnóstico da IA", o e-mail original e eventuais textos de OCR/Áudio transcrito.',
          '3. Clique em "Disparar Acolhimento do Supervisor" para tranquilizar o cliente com protocolo oficial.',
          '4. Utilize a sugestão do "Copiloto de IA" para redigir a resposta técnica definitiva e envie ao cliente.',
          '5. Após a confirmação da solução, altere o status para "RESOLVIDO" inserindo as notas de conclusão.',
          '6. O sistema dispara a pesquisa CSAT e agenda o Touchpoint de Retenção de 48h.',
        ],
      },
      troubleshooting: {
        title: '5. Problemas Comuns & Soluções',
        issues: [
          {
            problem: 'O incidente é de um cliente parceiro, mas foi classificado como Crítico indevidamente.',
            solution: 'Você pode rebaixar a severidade diretamente na ficha do incidente e incluir o termo na Blacklist em Configurações.',
          },
          {
            problem: 'O cliente não respondeu à pesquisa CSAT.',
            solution: 'O sistema mantém o Health Score prévio. Você pode simular ou registrar a nota manualmente através do simulador de estrelas.',
          },
        ],
      },
    },
  },

  '/radar-clientes': {
    route: '/radar-clientes',
    title: 'Radar 360° de Clientes & Fornecedores (Health Score)',
    subtitle: 'Monitoramento contínuo da saúde relacional, honorários sob risco, classificação Curva ABC e alerta de desengajamento silencioso (Ghosting).',
    sections: {
      whatIs: {
        title: '1. O que é o Radar 360°?',
        content: 'É a ferramenta preditiva de retenção do Grupo Contatur. Ela monitora o histórico acumulado de cada cliente e fornecedor, gerando uma pontuação de saúde (Health Score de 0 a 100) baseada no volume de reclamações, elogios, respostas a pesquisas CSAT e frequência de comunicação.',
        highlights: [
          'Health Score (0 a 100): Verde (>85) Excelente, Amarelo (70-85) Estável, Laranja (50-70) Em Risco, Vermelho (<50) Crítico.',
          'Curva ABC de Honorários: Classifica o peso financeiro do cliente na receita da unidade.',
          'Alerta de Silêncio / Ghosting: Avisa quando um cliente habitual para repentinamente de trocar e-mails.',
        ],
      },
      beforeYouStart: {
        title: '2. Antes de Começar',
        requirements: [
          'Os clientes são sincronizados automaticamente a partir dos e-mails processados e cadastros contábeis.',
          'Mantenha as anotações de alinhamento atualizadas no histórico 360° do cliente.',
        ],
        rolePermissions: 'Disponível para Gestores de Atendimento, Sócios e Diretores.',
      },
      fieldGuide: {
        title: '3. Guia de Campos e Indicadores do Radar',
        items: [
          {
            name: 'Score de Saúde Relacional (Health Score)',
            description: 'Cálculo algorítmico ponderado que desconta pontos por incidentes e soma pontos por notas altas no CSAT e novos serviços contratados.',
          },
          {
            name: 'Honorário Mensal (R$/mês)',
            description: 'Valor cobrado mensalmente do cliente pela assessoria contábil, fiscal e trabalhista.',
          },
          {
            name: 'Curva ABC (A, B ou C)',
            description: 'Classificação de relevância na carteira. Clientes Curva A representam o núcleo de faturamento do escritório.',
          },
          {
            name: 'Alerta de Ghosting (👻)',
            description: 'Destaque visual ativado quando a queda de interações ultrapassa 70% em relação à média histórica.',
          },
          {
            name: 'Histórico 360° & Notas de Alinhamento',
            description: 'Registro auditável de reuniões de retenção, contatos telefônicos e acordos com o cliente.',
          },
        ],
      },
      stepByStep: {
        title: '4. Fluxo de Ação Preventiva de Retenção',
        steps: [
          '1. Filtre a lista de clientes por status "Crítico" ou "Em Risco".',
          '2. Ordene visualmente pelos clientes de Curva A ou maiores honorários mensais.',
          '3. Abra a ficha "Histórico 360°" para ler o histórico de queixas recentes do cliente.',
          '4. Realize o contato de alinhamento com a diretoria do cliente e registre a ação no campo de "Nova Anotação".',
        ],
      },
      troubleshooting: {
        title: '5. Dúvidas Frequentes',
        issues: [
          {
            problem: 'Como recuperar os pontos de Health Score de um cliente?',
            solution: 'O score aumenta automaticamente quando chamados são resolvidos sem reabertura, quando o cliente avalia com 4 ou 5 estrelas no CSAT ou quando contrata novos serviços no SGC.',
          },
        ],
      },
    },
  },

  '/oportunidades-comerciais': {
    route: '/oportunidades-comerciais',
    title: 'Radar de Oportunidades Comerciais & Integrador SGC',
    subtitle: 'Detecção de novos honorários por IA com exportação em 1 clique para o SGC (Sistema de Gestão de Contratos e Propostas Extras).',
    sections: {
      whatIs: {
        title: '1. O que é o Radar de Oportunidades & SGC?',
        content: 'É o motor de receita adicional do Contatur Sentinel. A IA analisa as conversas operacionais do dia a dia e identifica quando o cliente menciona demandas de novos serviços (abertura de filiais em outros estados, contratação de novos empregados CLT, necessidade de terceirizar financeiro ou planejamento tributário). O sistema gera a proposta e a envia diretamente para o SGC da Contatur.',
        highlights: [
          'Integração SGC Oficial: Conectado a https://sgc.grupocontaturmkp.com.br/api/external/v1.',
          '1-Click Push: Transmite os dados do lead e gera o rascunho com protocolo no SGC (#PROP-SGC-2026-XXXX).',
          'Minuta sob Medida: A IA gera o texto comercial pronto para envio ao cliente.',
          'Cálculo de Receita: Projeta o incremento financeiro recorrente no faturamento.',
        ],
      },
      beforeYouStart: {
        title: '2. Antes de Começar (Requisitos)',
        requirements: [
          'A unidade deve estar com a URL e o Token Bearer da API do SGC configurados em "Configurações > 5. Integração SGC".',
          'O cliente deve possuir CNPJ cadastrado para correta vinculação no SGC.',
        ],
        rolePermissions: 'Equipe Comercial, Supervisores de Departamento e Sócios.',
      },
      fieldGuide: {
        title: '3. Guia de Campos e Ações Comerciais',
        items: [
          {
            name: 'Tipo de Oportunidade',
            description: 'Classificação automática (Abertura de Filial, Expansão de Folha, BPO Financeiro, Consultoria Tributária, Holding).',
          },
          {
            name: 'Honorário Estimado (R$/mês)',
            description: 'Projeção do valor mensal adicional a ser acrescido ao contrato contábil.',
          },
          {
            name: 'Botão "Criar Proposta no SGC" (1-Click Push)',
            description: 'Chama o endpoint POST /propostas do SGC, enviando tenantId, CNPJ, serviceCode e o trecho de contexto capturado pela IA.',
          },
          {
            name: 'Protocolo SGC & Link Direto',
            description: 'Exibe o código oficial da proposta e abre a página de edição no painel do SGC.',
          },
        ],
      },
      stepByStep: {
        title: '4. Como Converter uma Oportunidade em Contrato',
        steps: [
          '1. Acesse o Radar de Oportunidades e localize o lead com status "NOVO".',
          '2. Clique em "Ver Minuta & Ações SGC" para conferir o trecho do e-mail e a proposta gerada pela IA.',
          '3. Clique em "Criar Proposta no SGC" para exportar o rascunho oficial para a esteira comercial.',
          '4. O comercial revisa os valores no SGC e envia o link para assinatura digital do cliente.',
          '5. Quando assinada, o SGC notifica o Sentinel via Webhook e atualiza o faturamento da carteira automaticamente!',
        ],
      },
      troubleshooting: {
        title: '5. Problemas Comuns & Soluções',
        issues: [
          {
            problem: 'Erro ao tentar exportar a proposta para o SGC.',
            solution: 'Verifique em "Configurações > 5. Integração SGC" se o Token de API está preenchido e clique no botão de teste de conexão.',
          },
        ],
      },
    },
  },

  '/auditoria-qualidade': {
    route: '/auditoria-qualidade',
    title: 'Auditoria de Qualidade & Tom de Resposta dos Analistas',
    subtitle: 'Supervisão do padrão de escrita, empatia e clareza nos e-mails enviados pela equipe Contatur para os clientes.',
    sections: {
      whatIs: {
        title: '1. O que é a Auditoria de Qualidade?',
        content: 'É o módulo de garantia de excelência no atendimento. A IA audita os e-mails enviados pelos analistas do escritório (via de saída), identificando respostas ríspidas, termos inadequados, transferências indevidas de culpa ao cliente ou falta de clareza antes que isso se torne uma reclamação formal.',
        highlights: [
          'Nota de Qualidade (0 a 100): Mede a clareza, empatia e cordialidade da mensagem.',
          'Destaque de Frases Sinalizadas: A IA aponta exatamente quais expressões foram inadequadas.',
          'Feedback Construtivo da IA: Orientações de como a resposta poderia ser formulada com maior excelência.',
        ],
      },
      beforeYouStart: {
        title: '2. Pré-requisitos & Diretrizes',
        requirements: [
          'A auditoria de qualidade deve estar habilitada nas configurações de IA da unidade.',
          'O foco da ferramenta é o desenvolvimento e treinamento contínuo da equipe técnica.',
        ],
        rolePermissions: 'Supervisores de Departamento, Gerência de Operações e Sócios.',
      },
      fieldGuide: {
        title: '3. Guia de Indicadores de Qualidade',
        items: [
          {
            name: 'Classificação de Tom',
            description: 'Classifica a comunicação em Excelente/Empático, Neutro/Técnico ou Ríspido/Inadequado.',
          },
          {
            name: 'Score de Qualidade',
            description: 'Pontuação de 0 a 100 atribuída pelo motor de IA especializado no manual de atendimento Contatur.',
          },
          {
            name: 'Frases Inadequadas / Alertas',
            description: 'Trechos destacados que violam o tom acolhedor (ex: "já falei que isso não é do fiscal", "você que preencheu errado").',
          },
        ],
      },
      stepByStep: {
        title: '4. Rotina de Supervisão de Qualidade',
        steps: [
          '1. Acesse o menu "Auditoria de Qualidade" semanalmente.',
          '2. Filtre os registros com score abaixo de 60 pontos.',
          '3. Abra a ficha de auditoria para ler o e-mail completo e o feedback gerado pela IA.',
          '4. Realize 1-on-1 de alinhamento e orientação com o analista responsável.',
        ],
      },
      troubleshooting: {
        title: '5. Dúvidas Frequentes',
        issues: [
          {
            problem: 'A IA sinalizou uma resposta técnica que continha citação da lei como ríspida.',
            solution: 'Você pode calibrar o System Prompt da IA em "Configurações > 2. Motores de IA" instruindo o modelo a considerar termos legais técnicos como adequados.',
          },
        ],
      },
    },
  },

  '/benchmark': {
    route: '/benchmark',
    title: 'Benchmark Executivo do Grupo Contatur',
    subtitle: 'Painel comparativo de eficiência operacional, tempo de resposta, satisfação e faturamento entre as 3 empresas do grupo.',
    sections: {
      whatIs: {
        title: '1. O que é o Benchmark Executivo?',
        content: 'É o painel de governança corporativa que permite à diretoria comparar lado a lado o desempenho operacional e relacional de Contatur São Paulo, Contatur Rio e MKP São Paulo.',
        highlights: [
          'Faturamento Total da Carteira por Unidade.',
          'Volume de Honorários sob Risco Crítico em cada escritório.',
          'Taxa de Resolução de Incidentes dentro do SLA contratual.',
          'Health Score Médio (NPS Relacional da Unidade).',
        ],
      },
      beforeYouStart: {
        title: '2. Requisitos & Acesso',
        requirements: [
          'Os dados são consolidados automaticamente a partir das operações de cada unidade.',
        ],
        rolePermissions: 'Exclusivo para Diretoria Executiva, Sócios e SuperAdmin Edson.',
      },
      fieldGuide: {
        title: '3. Indicadores Comparativos',
        items: [
          {
            name: 'Faturamento da Carteira',
            description: 'Receita recorrente mensal de honorários gerenciada pela unidade.',
          },
          {
            name: 'Honorários sob Risco Crítico',
            description: 'Valor total em risco de cancelamento imediato na unidade.',
          },
          {
            name: 'Taxa de Resolução no Prazo',
            description: 'Percentual de chamados finalizados antes do estouro de SLA.',
          },
          {
            name: 'Satisfação Média',
            description: 'Média aritmética do Health Score de todos os clientes da empresa.',
          },
        ],
      },
      stepByStep: {
        title: '4. Como Utilizar nas Reuniões de Diretoria',
        steps: [
          '1. Utilize a tela durante os comitês quinzenais de gestão de clientes.',
          '2. Compare os índices de risco financeiro e tempo de resposta.',
          '3. Identifique boas práticas da unidade líder para replicar nas demais.',
        ],
      },
      troubleshooting: {
        title: '5. Dúvidas Frequentes',
        issues: [
          {
            problem: 'Os valores de faturamento de uma unidade estão desatualizados.',
            solution: 'O faturamento é atualizado automaticamente conforme novas propostas são contratadas no SGC ou editadas no cadastro de clientes.',
          },
        ],
      },
    },
  },

  '/caixas-postais': {
    route: '/caixas-postais',
    title: 'Central de Caixas Postais Monitoradas',
    subtitle: 'Gestão de todas as contas de e-mail sincronizadas no domínio da unidade (Microsoft 365 / Google Workspace).',
    sections: {
      whatIs: {
        title: '1. O que é a Central de Caixas Monitoradas?',
        content: 'Exibe a listagem completa de todas as contas de e-mail institucionais monitoradas pelo Contatur Sentinel na unidade ativa, com status de conexão, contadores de mensagens lidas e badges de sigilo da diretoria.',
        highlights: [
          'Varredura Automática: Sincronização periódica a cada 5 minutos via Graph API / Gmail API.',
          'Governança da Diretoria: Sinalização clara de contas da diretoria/sócios protegidas por sigilo ou ativas.',
        ],
      },
      beforeYouStart: {
        title: '2. Requisitos',
        requirements: [
          'As credenciais de aplicativo no Azure AD (para M365) ou Service Account (Google Workspace) devem estar válidas.',
        ],
        rolePermissions: 'Administradores do Sistema e Supervisores de TI.',
      },
      fieldGuide: {
        title: '3. Guia de Campos',
        items: [
          {
            name: 'Endereço de E-mail & Departamento',
            description: 'Identificação da conta e setor vinculado (Fiscal, DP, Contábil, Legal, Financeiro ou Diretoria).',
          },
          {
            name: 'Status de Sincronização',
            description: 'Indica se a caixa está sincronizando normalmente ou se há erro de autenticação/token.',
          },
          {
            name: 'Badge de Sigilo Executivo',
            description: 'Indica se a conta de diretoria está com monitoramento ativo ou isento pelo compliance.',
          },
        ],
      },
      stepByStep: {
        title: '4. Como Adicionar ou Testar uma Caixa Postal',
        steps: [
          '1. Clique em "Adicionar Nova Caixa Postal".',
          '2. Informe o e-mail, nome do titular e departamento.',
          '3. Salve o registro. O sistema iniciará a ingestão automática no próximo ciclo.',
        ],
      },
      troubleshooting: {
        title: '5. Problemas Comuns',
        issues: [
          {
            problem: 'Caixa postal com status "Erro de Conexão".',
            solution: 'Acesse Configurações e teste a conexão do provedor M365/Gmail ou verifique as permissões de Mail.Read no Azure AD.',
          },
        ],
      },
    },
  },

  '/usuarios': {
    route: '/usuarios',
    title: 'Gestão de Usuários & Matriz de Permissões (RBAC)',
    subtitle: 'Controle granular de acesso a telas, botões, recursos e isolamento multi-empresa entre os escritórios Contatur.',
    sections: {
      whatIs: {
        title: '1. O que é a Gestão de Usuários?',
        content: 'Permite cadastrar colaboradores do Grupo Contatur e definir com extrema precisão quais telas, botões, relatórios e recursos cada perfil pode acessar, garantindo segurança da informação e isolamento absoluto entre as 3 empresas.',
        highlights: [
          'Perfis Prontos: Administrador, Supervisor, Analista e Diretor.',
          'Matriz Granular de Telas: Marque ou desmarque o acesso a cada rota individualmente.',
          'Isolamento de Tenants: Um colaborador só tem acesso aos dados da sua própria empresa.',
        ],
      },
      beforeYouStart: {
        title: '2. Requisitos & Segurança',
        requirements: [
          'Apenas o SuperAdmin Edson tem permissão para visualizar todas as unidades simultaneamente e gerenciar permissões globais.',
        ],
        rolePermissions: 'Exclusivo para SuperAdmin e Administradores de Unidade.',
      },
      fieldGuide: {
        title: '3. Guia de Perfis e Permissões',
        items: [
          {
            name: 'SuperAdmin',
            description: 'Acesso irrestrito a todas as 3 empresas, matrizes de permissão e configurações mestres.',
          },
          {
            name: 'Supervisor',
            description: 'Pode gerenciar incidentes, disparar a régua de mediação, auditar qualidade e criar propostas no SGC.',
          },
          {
            name: 'Analista',
            description: 'Visualiza e responde incidentes atribuídos à sua fila de trabalho.',
          },
        ],
      },
      stepByStep: {
        title: '4. Como Cadastrar um Novo Colaborador',
        steps: [
          '1. Clique no botão "Novo Usuário".',
          '2. Preencha nome, e-mail corporativo, cargo e selecione a Unidade de lotação.',
          '3. Defina a senha de acesso e selecione as telas liberadas na matriz de permissões.',
          '4. Clique em "Salvar Usuário". O acesso estará liberado imediatamente.',
        ],
      },
      troubleshooting: {
        title: '5. Dúvidas Frequentes',
        issues: [
          {
            problem: 'Um supervisor não está conseguindo acessar o SGC.',
            solution: 'Edite o usuário e certifique-se de marcar a permissão da tela "Radar de Oportunidades & SGC".',
          },
        ],
      },
    },
  },

  '/configuracoes': {
    route: '/configuracoes',
    title: 'Configurações 100% Dinâmicas da Unidade (Zero Hardcoding)',
    subtitle: 'Parametrização completa de Provedores de E-mail, Inteligência Artificial, Alertas Multicanal, Régua de Mediação, SGC e SLAs.',
    sections: {
      whatIs: {
        title: '1. O que é o Painel de Configurações?',
        content: 'É o centro de parametrização da unidade. Nenhuma regra de negócio, chave de API, webhook ou texto é fixo no código do sistema. Cada um dos 3 escritórios pode personalizar totalmente seu provedor de e-mails, modelo de IA, canais de notificação e regras de SLA.',
        highlights: [
          'Zero Hardcoding: Todos os campos são editáveis e salvos dinamicamente por unidade.',
          'Testes ao Vivo: Todos os provedores possuem botões de validação imediata de conexão.',
        ],
      },
      beforeYouStart: {
        title: '2. Requisitos',
        requirements: [
          'Tenha em mãos as credenciais de API do Azure AD (M365), Google Workspace, chaves de IA (Gemini/OpenAI) e Token do SGC.',
        ],
        rolePermissions: 'Exclusivo para Administradores e SuperAdmin.',
      },
      fieldGuide: {
        title: '3. Guia das 6 Abas de Configuração',
        items: [
          {
            name: '1. E-mails (M365 / Google Workspace / IMAP)',
            description: 'Define as credenciais de ingestão de caixas postais corporativas e governança de sigilo da diretoria.',
          },
          {
            name: '2. Motores de IA (Gemini / OpenAI / Claude / Ollama)',
            description: 'Escolha do provedor de IA, modelo, temperatura e editor do System Prompt do auditor.',
          },
          {
            name: '3. Canais de Alerta (MS Teams / WhatsApp / E-mails)',
            description: 'Configuração de webhooks e números de WhatsApp para envio de alertas imediatos de incidentes críticos.',
          },
          {
            name: '4. Régua Supervisor ↔ Cliente & CSAT',
            description: 'Editor de templates de acolhimento, status update, pesquisa CSAT e tempo de escalonamento para a diretoria.',
          },
          {
            name: '5. Integração SGC (Serviços Extras)',
            description: 'URL base da API oficial (https://sgc.grupocontaturmkp.com.br/api/external/v1), Token Bearer e modo de exportação de propostas.',
          },
          {
            name: '6. SLAs, Palavras-Chave & Filtros Anti-Ruído',
            description: 'Tempos de atendimento em horas por severidade e dicionários de termos prioritários e blacklist de spam.',
          },
        ],
      },
      stepByStep: {
        title: '4. Como Salvar e Validar Configurações',
        steps: [
          '1. Navegue até a aba desejada e altere os campos necessários.',
          '2. Utilize o botão "Testar Conexão" no rodapé da aba para validar as credenciais.',
          '3. Clique em "Salvar Todas as Configurações" no topo da página para aplicar as alterações imediatamente.',
        ],
      },
      troubleshooting: {
        title: '5. Problemas Comuns & Soluções',
        issues: [
          {
            problem: 'O teste de IA retornou erro de API Key.',
            solution: 'Verifique se a chave de API inserida possui cotas e permissão para o modelo informado (ex: gemini-1.5-flash ou gpt-4o-mini).',
          },
        ],
      },
    },
  },

  '/circulares-mensais': {
    route: '/circulares-mensais',
    title: 'Esteira de Circulares Legislativas Mensais & Portas de Aprovação',
    subtitle: 'Geração mensal de pautas legislativas por IA (Folha, Fiscal, Contábil e Societário) segmentadas por perfil e validadas pelos 4 supervisores.',
    sections: {
      whatIs: {
        title: '1. O que é a Esteira de Circulares Mensais?',
        content: 'É a esteira inteligente onde a IA compila as novidades legislativas do mês com impacto direto no perfil da carteira (Turismo/Hotelaria na Contatur SP/Rio ou Indústria/Comércio na MKP SP). A circular só é transmitida aos clientes após a aprovação formal dos 4 supervisores setoriais.',
        highlights: [
          '4 Portas de Aprovação: Folha/RH, Fiscal, Contábil e Societário devem aprovar suas respectivas seções.',
          'Iteração e Regeneração com IA: Caso um supervisor rejeite, ele insere o motivo e a IA gera uma nova versão focada exclusivamente naquela área.',
          'Segmentação Setorial: Pautas focadas em PERSE/Hotelaria para Contatur e Bloco K/ICMS-ST para MKP.',
        ],
      },
      beforeYouStart: {
        title: '2. Requisitos & Aprovadores',
        requirements: [
          'Os e-mails dos 4 supervisores devem estar parametrizados na aba "7. Circulares Mensais" em Configurações.',
        ],
        rolePermissions: 'Supervisores Setoriais, Gerentes e Diretoria Executiva.',
      },
      fieldGuide: {
        title: '3. Guia das 4 Seções da Circular',
        items: [
          {
            name: 'Seção 1: Recursos Humanos & Departamento Pessoal',
            description: 'Convenções coletivas, eSocial, folha de pagamento, FGTS Digital e encargos trabalhistas.',
          },
          {
            name: 'Seção 2: Legislação Fiscal & Tributária',
            description: 'Mudanças no SPED, ICMS, ISS, IRPJ/CSLL, PERSE ou Bloco K da unidade.',
          },
          {
            name: 'Seção 3: Contabilidade & Demonstrações Financeiras',
            description: 'Normas contábeis CPC, fechamento de balanço e conciliações fiscais.',
          },
          {
            name: 'Seção 4: Societário & Legalização de Empresas',
            description: 'Juntas Comerciais (JUCESP/JUCERJA), alterações contratuais e certidões negativas.',
          },
        ],
      },
      stepByStep: {
        title: '4. Passo a Passo do Fluxo de Aprovação',
        steps: [
          '1. No dia parametrizado (ex: dia 25), a IA gera a minuta consolidada da circular.',
          '2. Os 4 supervisores recebem notificação para revisar o conteúdo do seu departamento.',
          '3. Se o conteúdo estiver correto, o supervisor clica em "Aprovar Seção".',
          '4. Se necessitar de ajustes, clica em "Solicitar Ajustes com IA", informa o direcionamento e a IA regenera a seção.',
          '5. Com as 4 seções aprovadas (4/4), o botão "Disparar Circular Oficial para Todos os Clientes" é liberado.',
        ],
      },
      troubleshooting: {
        title: '5. Problemas Comuns',
        issues: [
          {
            problem: 'O botão de disparo geral para clientes está bloqueado.',
            solution: 'O disparo em massa só é liberado quando todas as 4 áreas (Folha, Fiscal, Contábil e Societário) estiverem com status APROVADO.',
          },
        ],
      },
    },
  },

  '/equipe-workload': {
    route: '/equipe-workload',
    title: 'Matriz de Carga de Trabalho & Prevenção de Burnout',
    subtitle: 'Monitoramento de volume de e-mails, tempo médio de resposta e equalização inteligente de carteira nas quinzenas críticas.',
    sections: {
      whatIs: {
        title: '1. O que é a Matriz de Carga de Trabalho?',
        content: 'É o painel preventivo de saúde operacional da equipe. Ele cruza o número de clientes na carteira, o volume de e-mails recebidos e a velocidade de resposta de cada analista, alertando os supervisores sobre sobrecarga nas quinzenas de fechamento (dias 1 a 10 e 15 a 20).',
        highlights: [
          'Score de Risco de Burnout: Alerta quando um analista atinge níveis de sobrecarga crítica.',
          'Rebalanceamento de Carteira em 1-Click: A IA sugere e aplica a redistribuição equilibrada de empresas entre a equipe.',
        ],
      },
      beforeYouStart: {
        title: '2. Requisitos',
        requirements: [
          'As caixas postais da equipe devem estar sincronizadas para contabilização dos volumes.',
        ],
        rolePermissions: 'Supervisores de Departamento e Diretoria.',
      },
      fieldGuide: {
        title: '3. Indicadores de Capacidade',
        items: [
          {
            name: 'Volume de E-mails no Mês',
            description: 'Quantidade total de mensagens recebidas pelo analista no período.',
          },
          {
            name: 'Tempo Médio de Resposta',
            description: 'Média de horas decorridas até a primeira resposta oficial ao cliente.',
          },
          {
            name: 'Nível de Risco de Sobrecarga',
            description: 'Classificação automática em Saudável, Moderado, Alto ou Sobrecarga Crítica.',
          },
        ],
      },
      stepByStep: {
        title: '4. Como Equalizar a Carga de Trabalho',
        steps: [
          '1. Identifique os analistas com badge vermelho de "Sobrecarga Crítica".',
          '2. Leia a recomendação de redistribuição formulada pela IA.',
          '3. Clique em "Aplicar Rebalanceamento Automático de Carteira".',
        ],
      },
      troubleshooting: {
        title: '5. Dúvidas Frequentes',
        issues: [
          {
            problem: 'Como o sistema calcula o risco de burnout?',
            solution: 'O cálculo combina o número de empresas atendidas, volume de chamados críticos e oscilação no tempo de resposta.',
          },
        ],
      },
    },
  },

  '/diagnostico-setores': {
    route: '/diagnostico-setores',
    title: 'Termômetro de Eficiência por Departamento',
    subtitle: 'Comparativo setorial de velocidade de resposta, satisfação média dos clientes (CSAT) e cumprimento de SLAs.',
    sections: {
      whatIs: {
        title: '1. O que é o Termômetro de Eficiência?',
        content: 'Permite à diretoria e aos supervisores comparar a performance e satisfação dos clientes entre os 4 departamentos operacionais: Fiscal, Folha/DP, Contábil e Societário.',
        highlights: [
          'Nota Média CSAT: Média de satisfação dos clientes pós-atendimento por departamento.',
          'Conformidade de SLA: Percentual de cumprimento de prazos contratuais.',
          'Volume de Elogios Registrados: Monitoramento de feedbacks positivos dos clientes.',
        ],
      },
      beforeYouStart: {
        title: '2. Requisitos',
        requirements: [
          'Os incidentes finalizados devem receber nota do cliente ou simulação na régua de mediação.',
        ],
        rolePermissions: 'Supervisores, Gerentes e Diretoria.',
      },
      fieldGuide: {
        title: '3. Indicadores por Setor',
        items: [
          {
            name: 'Nota Média CSAT',
            description: 'Pontuação de 1.0 a 5.0 estrelas atribuída pelos clientes aos analistas do departamento.',
          },
          {
            name: 'Tempo Médio de Resposta',
            description: 'Velocidade com que o departamento encerra ou responde solicitações.',
          },
          {
            name: 'Cumprimento de SLA',
            description: 'Taxa percentual de solicitações atendidas dentro do prazo limite.',
          },
        ],
      },
      stepByStep: {
        title: '4. Como Acompanhar a Eficiência',
        steps: [
          '1. Analise os cards dos 4 setores operacionais.',
          '2. Verifique os departamentos com menor CSAT ou maior tempo de resposta.',
          '3. Promova alinhamentos pontuais com a supervisão da área afetada.',
        ],
      },
      troubleshooting: {
        title: '5. Dúvidas Frequentes',
        issues: [
          {
            problem: 'Qual a nota mínima esperada de CSAT para os departamentos?',
            solution: 'O padrão de excelência Contatur estabelece nota média mínima de 4.5 estrelas em todos os setores.',
          },
        ],
      },
    },
  },

  '/relatorios': {
    route: '/relatorios',
    title: 'Relatórios Executivos & Auditoria de Atendimento',
    subtitle: 'Geração de relatórios consolidados, exportação em CSV/Excel e impressão em PDF para diretoria e auditoria.',
    sections: {
      whatIs: {
        title: '1. O que é o Módulo de Relatórios?',
        content: 'Permite gerar relatórios executivos analíticos de todos os incidentes tratados, desempenho por analista e departamento, histórico de retenção e oportunidades comerciais geradas no período.',
        highlights: [
          'Exportação Completa para Planilhas CSV / Excel.',
          'Relatórios Formatados prontos para impressão em PDF.',
        ],
      },
      beforeYouStart: {
        title: '2. Requisitos',
        requirements: [
          'Selecione o intervalo de datas desejado para correta filtragem dos dados.',
        ],
        rolePermissions: 'Supervisores, Gerentes e Diretores.',
      },
      fieldGuide: {
        title: '3. Guia de Relatórios Disponíveis',
        items: [
          {
            name: 'Relatório Analítico de Incidentes',
            description: 'Lista completa de chamados com tempos de resposta, severidade, departamento e notas de resolução.',
          },
          {
            name: 'Relatório de Eficiência de SLAs',
            description: 'Percentual de chamados atendidos dentro do prazo estipulado por severidade.',
          },
          {
            name: 'Relatório Comercial de Oportunidades SGC',
            description: 'Total de novos honorários prospectados e contratados no período.',
          },
        ],
      },
      stepByStep: {
        title: '4. Como Exportar ou Imprimir',
        steps: [
          '1. Selecione a Unidade e o período de análise.',
          '2. Escolha o tipo de relatório desejado.',
          '3. Clique em "Exportar CSV" ou "Imprimir em PDF".',
        ],
      },
      troubleshooting: {
        title: '5. Dúvidas Frequentes',
        issues: [
          {
            problem: 'O arquivo CSV gerado abriu com caracteres desconfigurados no Excel.',
            solution: 'Os arquivos são gerados com codificação UTF-8 com BOM para compatibilidade nativa perfeita com o Microsoft Excel em português.',
          },
        ],
      },
    },
  },
};
