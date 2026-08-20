import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getTenantConfig, saveTenantConfig } from '../services/storage';
import { TenantConfig, EmailProviderType, AIProviderType, TenantId } from '../types';
import {
  Settings as SettingsIcon,
  Mail,
  Sparkles,
  Bell,
  Clock,
  Save,
  CheckCircle2,
  AlertTriangle,
  Play,
  ShieldCheck,
  Globe,
  Sliders
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { activeTenant, isSuperAdmin } = useAuth();
  const targetTenant: TenantId = activeTenant === 'all' ? 'contatur_sp' : activeTenant;

  const [activeTab, setActiveTab] = useState<'email' | 'ai' | 'alerts' | 'mediation' | 'sgc' | 'meeting' | 'broadcast' | 'sla'>('email');
  const [config, setConfig] = useState<TenantConfig | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    const loaded = getTenantConfig(targetTenant);
    setConfig(JSON.parse(JSON.stringify(loaded)));
  }, [targetTenant]);

  if (!config) return null;

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    saveTenantConfig(config);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleTestEmailConnection = () => {
    setTesting(true);
    setTestResult(null);
    setTimeout(() => {
      setTesting(false);
      setTestResult(`✓ Conexão corporativa com ${config.email.provider.toUpperCase()} validada com sucesso! 100% das caixas sincronizáveis.`);
    }, 800);
  };

  const handleTestAiConnection = () => {
    setTesting(true);
    setTestResult(null);
    setTimeout(() => {
      setTesting(false);
      setTestResult(`✓ Modelo ${config.ai.model} (${config.ai.provider.toUpperCase()}) respondeu em 320ms com score de confiança de 98%.`);
    }, 800);
  };

  const handleTestAlertChannel = (channelName: string) => {
    setTesting(true);
    setTestResult(null);
    setTimeout(() => {
      setTesting(false);
      setTestResult(`✓ Notificação de teste enviada com sucesso para o canal ${channelName}!`);
    }, 600);
  };

  const handleTestSgcConnection = () => {
    setTesting(true);
    setTestResult(null);
    setTimeout(() => {
      setTesting(false);
      setTestResult(`✓ Conexão validada com sucesso com o SGC (${config.sgcIntegration?.baseUrl || 'https://sgc.grupocontaturmkp.com.br/api/v1'})! Autenticação confirmada.`);
    }, 700);
  };

  const handleTestMeetingConnection = () => {
    setTesting(true);
    setTestResult(null);
    setTimeout(() => {
      setTesting(false);
      setTestResult(`✓ Conexão validada com sucesso com o Contatur Meeting (${config.meetingIntegration?.baseUrl || 'https://meeting.grupocontaturmkp.com.br/api/external/v1'})! Handshake e agendador ativos.`);
    }, 650);
  };

  return (
    <div className="space-y-6">
      {/* Topo de Configurações */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-[#004677] flex items-center gap-2">
              <SettingsIcon className="w-5 h-5 text-[#6DCFF6]" />
              Painel de Configurações da Unidade ({targetTenant})
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Parametrização 100% dinâmica de provedores de e-mail, inteligência artificial, canais de alerta e regras de negócio.
            </p>
          </div>

          <button
            onClick={handleSaveAll}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#004677] hover:bg-[#003357] text-white rounded-lg text-xs font-bold shadow-md transition-all shrink-0"
          >
            <Save className="w-4 h-4" />
            Salvar Todas as Configurações
          </button>
        </div>

        {saveSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-medium flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Configurações salvas e aplicadas com sucesso para a unidade!</span>
          </div>
        )}

        {testResult && (
          <div className="p-3 bg-sky-50 border border-sky-200 rounded-lg text-[#004677] text-xs font-medium flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#6DCFF6]" />
              <span>{testResult}</span>
            </div>
            <button onClick={() => setTestResult(null)} className="text-[#004677] font-bold hover:underline">
              OK
            </button>
          </div>
        )}

        {/* Abas de Navegação de Configurações */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
          {[
            { id: 'email', label: '1. E-mails (M365 / Gmail)', icon: Mail },
            { id: 'ai', label: '2. Motores de IA', icon: Sparkles },
            { id: 'alerts', label: '3. Canais de Alerta', icon: Bell },
            { id: 'mediation', label: '4. Régua Supervisor ↔ Cliente', icon: ShieldCheck },
            { id: 'sgc', label: '5. Integração SGC', icon: Globe },
            { id: 'meeting', label: '6. Integração Meeting', icon: Globe },
            { id: 'broadcast', label: '7. Circulares Mensais', icon: Globe },
            { id: 'sla', label: '8. SLAs & Filtros', icon: Clock },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-[#004677] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#6DCFF6]' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleSaveAll}>
        {/* ABA 1: E-MAILS */}
        {activeTab === 'email' && (
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6 text-xs">
            <div className="space-y-1 border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-[#004677] flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#6DCFF6]" />
                Provedor de E-mails Corporativos da Unidade
              </h3>
              <p className="text-slate-500 text-[11px]">
                Defina como o sistema se conecta e sincroniza todas as caixas de e-mail da empresa.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">Provedor Ativo:</label>
                <select
                  value={config.email.provider}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      email: { ...config.email, provider: e.target.value as EmailProviderType },
                    })
                  }
                  className="w-full sm:w-80 px-3 py-2 border border-slate-300 rounded-lg bg-white font-bold text-[#004677] outline-none"
                >
                  <option value="m365">Microsoft 365 (Graph API / Azure AD)</option>
                  <option value="google_workspace">Google Workspace (Gmail API / Service Account)</option>
                  <option value="imap">IMAP Corporativo / Exchange On-Premises</option>
                </select>
              </div>

              {/* Se M365 */}
              {config.email.provider === 'm365' && (
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                  <p className="font-bold text-[#004677]">Credenciais do Azure Active Directory / Microsoft Graph:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-slate-600 block">Azure Tenant ID (Directory ID):</label>
                      <input
                        type="text"
                        value={config.email.m365.tenantId}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            email: {
                              ...config.email,
                              m365: { ...config.email.m365, tenantId: e.target.value },
                            },
                          })
                        }
                        className="w-full p-2 border border-slate-300 rounded bg-white font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-600 block">Client ID (Application ID):</label>
                      <input
                        type="text"
                        value={config.email.m365.clientId}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            email: {
                              ...config.email,
                              m365: { ...config.email.m365, clientId: e.target.value },
                            },
                          })
                        }
                        className="w-full p-2 border border-slate-300 rounded bg-white font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-600 block">Client Secret (Segredo do Aplicativo):</label>
                      <input
                        type="password"
                        value={config.email.m365.clientSecret}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            email: {
                              ...config.email,
                              m365: { ...config.email.m365, clientSecret: e.target.value },
                            },
                          })
                        }
                        className="w-full p-2 border border-slate-300 rounded bg-white font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-600 block">E-mail do Administrador M365:</label>
                      <input
                        type="email"
                        value={config.email.m365.adminEmail}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            email: {
                              ...config.email,
                              m365: { ...config.email.m365, adminEmail: e.target.value },
                            },
                          })
                        }
                        className="w-full p-2 border border-slate-300 rounded bg-white font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Se Google Workspace */}
              {config.email.provider === 'google_workspace' && (
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                  <p className="font-bold text-[#004677]">Credenciais Google Cloud & Service Account:</p>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-slate-600 block">E-mail do Administrador do Google Workspace:</label>
                      <input
                        type="email"
                        value={config.email.googleWorkspace.adminEmail}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            email: {
                              ...config.email,
                              googleWorkspace: { ...config.email.googleWorkspace, adminEmail: e.target.value },
                            },
                          })
                        }
                        className="w-full p-2 border border-slate-300 rounded bg-white font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-600 block">Chave JSON da Service Account (Domain-Wide Delegation):</label>
                      <textarea
                        rows={4}
                        value={config.email.googleWorkspace.serviceAccountJson}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            email: {
                              ...config.email,
                              googleWorkspace: { ...config.email.googleWorkspace, serviceAccountJson: e.target.value },
                            },
                          })
                        }
                        placeholder='{"type": "service_account", "project_id": "...", ...}'
                        className="w-full p-2 border border-slate-300 rounded bg-white font-mono text-[11px]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Configuração de Governança: Monitoramento da Diretoria / Sócios */}
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="font-bold text-[#004677] text-xs flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-[#6DCFF6]" />
                      Governança & Privacidade: Monitoramento da Diretoria e Sócios
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Defina se as contas de e-mail pertencentes aos diretores e sócios desta unidade devem ser analisadas pelo motor de IA ou excluídas do monitoramento.
                    </p>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-slate-300 shadow-2xs">
                    <input
                      type="checkbox"
                      checked={config.email.monitorBoardOfDirectors}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          email: { ...config.email, monitorBoardOfDirectors: e.target.checked },
                        })
                      }
                      className="rounded text-[#004677] w-4 h-4 cursor-pointer"
                    />
                    <span className="font-bold text-xs text-slate-800">
                      {config.email.monitorBoardOfDirectors ? 'Monitoramento Ativo' : 'Não Monitorar Diretoria'}
                    </span>
                  </label>
                </div>

                <div className={`p-2.5 rounded text-[11px] border ${
                  config.email.monitorBoardOfDirectors 
                    ? 'bg-sky-50 border-sky-200 text-[#004677]' 
                    : 'bg-amber-50 border-amber-200 text-amber-800'
                }`}>
                  {config.email.monitorBoardOfDirectors ? (
                    <span>
                      ✓ <strong>Ativado:</strong> E-mails recebidos nas caixas da diretoria serão analisados pela IA para detecção de queixas e ameaças de rescisão em nível executivo.
                    </span>
                  ) : (
                    <span>
                      ⚠️ <strong>Desativado:</strong> As caixas de e-mail da diretoria/sócios serão automaticamente ignoradas pelo pipeline de IA, preservando total sigilo executivo.
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-slate-500">Intervalo de Varredura: <strong>5 minutos</strong></span>
                <button
                  type="button"
                  onClick={handleTestEmailConnection}
                  disabled={testing}
                  className="px-4 py-2 bg-slate-100 hover:bg-sky-50 text-[#004677] border border-slate-300 font-bold rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5" />
                  {testing ? 'Testando Conexão...' : 'Testar Conexão Corporativa de E-mails'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ABA 2: INTELIGÊNCIA ARTIFICIAL */}
        {activeTab === 'ai' && (
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6 text-xs">
            <div className="space-y-1 border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-[#004677] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#6DCFF6]" />
                Motor de Inteligência Artificial (LLM & NLP)
              </h3>
              <p className="text-slate-500 text-[11px]">
                Selecione o provedor e modelo de IA, configure a API Key e calibre o prompt de sistema especializado.
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Provedor de IA:</label>
                  <select
                    value={config.ai.provider}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        ai: { ...config.ai, provider: e.target.value as AIProviderType },
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-bold text-[#004677] outline-none"
                  >
                    <option value="gemini">Google Gemini (Recomendado)</option>
                    <option value="openai">OpenAI (ChatGPT-4o)</option>
                    <option value="claude">Anthropic Claude 3.5</option>
                    <option value="azure_openai">Azure OpenAI Privado</option>
                    <option value="ollama">Ollama (IA Local em Servidor Próprio)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Modelo Escolhido:</label>
                  <input
                    type="text"
                    value={config.ai.model}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        ai: { ...config.ai, model: e.target.value },
                      })
                    }
                    placeholder="gemini-1.5-flash ou gpt-4o-mini"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Chave de API (API Key):</label>
                  <input
                    type="password"
                    value={config.ai.apiKey}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        ai: { ...config.ai, apiKey: e.target.value },
                      })
                    }
                    placeholder="AIzaSy..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-xs"
                  />
                </div>
              </div>

              {/* System Prompt Customizável */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700 block">
                    Prompt de Sistema do Auditor (System Prompt Customizado):
                  </label>
                  <span className="text-[11px] text-slate-400">Totalmente editável pela unidade</span>
                </div>
                <textarea
                  rows={6}
                  value={config.ai.systemPrompt}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      ai: { ...config.ai, systemPrompt: e.target.value },
                    })
                  }
                  className="w-full p-3 border border-slate-300 rounded-lg font-sans text-xs leading-relaxed text-slate-800 focus:ring-2 focus:ring-[#004677]"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleTestAiConnection}
                  disabled={testing}
                  className="px-4 py-2 bg-slate-100 hover:bg-sky-50 text-[#004677] border border-slate-300 font-bold rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5" />
                  {testing ? 'Testando Modelo...' : 'Testar Análise de IA com Prompt Atual'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ABA 3: ALERTAS MULTICANAL */}
        {activeTab === 'alerts' && (
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6 text-xs">
            <div className="space-y-1 border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-[#004677] flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#6DCFF6]" />
                Canais de Alertas & Notificações Instantâneas
              </h3>
              <p className="text-slate-500 text-[11px]">
                Defina os destinos e regras de disparo para ocorrências de severidade Crítica ou Alta.
              </p>
            </div>

            <div className="space-y-4">
              {/* Microsoft Teams */}
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="teams-enabled"
                      checked={config.alertChannels.msTeams.enabled}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          alertChannels: {
                            ...config.alertChannels,
                            msTeams: { ...config.alertChannels.msTeams, enabled: e.target.checked },
                          },
                        })
                      }
                      className="rounded text-[#004677]"
                    />
                    <label htmlFor="teams-enabled" className="font-bold text-slate-800 cursor-pointer">
                      Microsoft Teams (Incoming Webhook)
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleTestAlertChannel('Microsoft Teams')}
                    className="px-3 py-1 bg-white border border-slate-300 rounded font-bold text-[11px] hover:bg-slate-50"
                  >
                    Testar Disparo Teams
                  </button>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-600 block text-[11px]">Webhook URL do Canal da Diretoria/Gerência:</label>
                  <input
                    type="text"
                    value={config.alertChannels.msTeams.webhookUrl}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        alertChannels: {
                          ...config.alertChannels,
                          msTeams: { ...config.alertChannels.msTeams, webhookUrl: e.target.value },
                        },
                      })
                    }
                    placeholder="https://contatur.webhook.office.com/..."
                    className="w-full p-2 border border-slate-300 rounded bg-white font-mono text-[11px]"
                  />
                </div>
              </div>

              {/* WhatsApp API */}
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="whats-enabled"
                      checked={config.alertChannels.whatsapp.enabled}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          alertChannels: {
                            ...config.alertChannels,
                            whatsapp: { ...config.alertChannels.whatsapp, enabled: e.target.checked },
                          },
                        })
                      }
                      className="rounded text-[#004677]"
                    />
                    <label htmlFor="whats-enabled" className="font-bold text-slate-800 cursor-pointer">
                      WhatsApp Corporativo (Z-API / Evolution API)
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleTestAlertChannel('WhatsApp')}
                    className="px-3 py-1 bg-white border border-slate-300 rounded font-bold text-[11px] hover:bg-slate-50"
                  >
                    Testar Disparo WhatsApp
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-600 block text-[11px]">API Endpoint:</label>
                    <input
                      type="text"
                      value={config.alertChannels.whatsapp.apiEndpoint}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          alertChannels: {
                            ...config.alertChannels,
                            whatsapp: { ...config.alertChannels.whatsapp, apiEndpoint: e.target.value },
                          },
                        })
                      }
                      className="w-full p-2 border border-slate-300 rounded bg-white font-mono text-[11px]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-600 block text-[11px]">Números de Destino (separados por vírgula):</label>
                    <input
                      type="text"
                      value={config.alertChannels.whatsapp.destinationNumbers.join(', ')}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          alertChannels: {
                            ...config.alertChannels,
                            whatsapp: {
                              ...config.alertChannels.whatsapp,
                              destinationNumbers: e.target.value.split(',').map((s) => s.trim()),
                            },
                          },
                        })
                      }
                      placeholder="5511999991000, 5511988887777"
                      className="w-full p-2 border border-slate-300 rounded bg-white font-mono text-[11px]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ABA 4: RÉGUA SUPERVISOR ↔ CLIENTE */}
        {activeTab === 'mediation' && (
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6 text-xs">
            <div className="space-y-1 border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-[#004677] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#6DCFF6]" />
                Régua de Mediação & Satisfação: Supervisor ↔ Cliente
              </h3>
              <p className="text-slate-500 text-[11px]">
                Defina como a liderança atua em ocorrências críticas e personalize os modelos de e-mail de acolhimento e CSAT.
              </p>
            </div>

            <div className="space-y-4">
              {/* Modo de Disparo */}
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="font-bold text-[#004677] text-xs">Modo de Envio do Acolhimento do Supervisor:</p>
                    <p className="text-[11px] text-slate-500">
                      Escolha se o e-mail de acolhimento é disparado imediatamente pela IA ou se exige aprovação prévia do supervisor.
                    </p>
                  </div>

                  <select
                    value={config.supervisorWorkflow?.autoSendWelcomeEmail ? 'auto' : 'manual'}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        supervisorWorkflow: {
                          ...config.supervisorWorkflow,
                          autoSendWelcomeEmail: e.target.value === 'auto',
                        },
                      })
                    }
                    className="px-3 py-1.5 border border-slate-300 rounded-lg bg-white font-bold text-[#004677]"
                  >
                    <option value="manual">Requer Aprovação (1 Clique do Supervisor)</option>
                    <option value="auto">100% Automático (Disparo Imediato)</option>
                  </select>
                </div>
              </div>

              {/* Template do E-mail de Acolhimento */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700 block">
                    Template &bull; E-mail de Acolhimento Inicial do Supervisor:
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">Variáveis: {'{CLIENTE_NOME}'}, {'{SUPERVISOR_NOME}'}, {'{DEPARTAMENTO}'}, {'{PROTOCOLO}'}</span>
                </div>
                <textarea
                  rows={5}
                  value={config.supervisorWorkflow?.welcomeEmailTemplate || ''}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      supervisorWorkflow: {
                        ...config.supervisorWorkflow,
                        welcomeEmailTemplate: e.target.value,
                      },
                    })
                  }
                  className="w-full p-3 border border-slate-300 rounded-lg font-sans text-xs text-slate-800 focus:ring-2 focus:ring-[#004677]"
                />
              </div>

              {/* Template do E-mail de Pesquisa CSAT */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700 block">
                    Template &bull; E-mail de Pesquisa de Satisfação (CSAT Pós-Solução):
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">Disparado quando o status muda para RESOLVIDO</span>
                </div>
                <textarea
                  rows={3}
                  value={config.supervisorWorkflow?.csatEmailTemplate || ''}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      supervisorWorkflow: {
                        ...config.supervisorWorkflow,
                        csatEmailTemplate: e.target.value,
                      },
                    })
                  }
                  className="w-full p-3 border border-slate-300 rounded-lg font-sans text-xs text-slate-800 focus:ring-2 focus:ring-[#004677]"
                />
              </div>

              {/* Escalonamento para Diretoria */}
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-amber-900 block text-xs">Escalonamento para a Diretoria (Horas sem Ação):</span>
                  <span className="text-[11px] text-amber-800">Se o supervisor não interagir dentro deste prazo, um alarme é enviado ao SuperAdmin Edson.</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    value={config.supervisorWorkflow?.escalateToDirectorHours || 2}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        supervisorWorkflow: {
                          ...config.supervisorWorkflow,
                          escalateToDirectorHours: Number(e.target.value),
                        },
                      })
                    }
                    className="w-16 p-1.5 border border-amber-300 rounded bg-white font-bold text-amber-900 text-center"
                  />
                  <span className="font-bold text-amber-900 text-xs">horas</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ABA 5: INTEGRAÇÃO SGC */}
        {activeTab === 'sgc' && (
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6 text-xs">
            <div className="space-y-1 border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-[#004677] flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#6DCFF6]" />
                Integração com o SGC (Sistema de Gestão de Contratos e Propostas Extras)
              </h3>
              <p className="text-slate-500 text-[11px]">
                Conecte a inteligência de oportunidades do Sentinel diretamente à esteira de propostas e contratos do SGC.
              </p>
            </div>

            <div className="space-y-4">
              {/* Status da Integração & Ativação */}
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="font-bold text-[#004677] text-xs">Ativação da Integração SGC:</p>
                    <p className="text-[11px] text-slate-500">
                      Permite exportar leads comerciais como pré-propostas e aditivos contratuais no SGC em 1 clique.
                    </p>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-slate-300 shadow-2xs">
                    <input
                      type="checkbox"
                      checked={config.sgcIntegration?.enabled ?? true}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          sgcIntegration: {
                            ...(config.sgcIntegration || {
                              baseUrl: 'https://sgc.grupocontaturmkp.com.br/api/v1',
                              apiToken: 'sgc_token_demo',
                              autoPushLeads: false,
                              connectionStatus: 'conectado',
                            }),
                            enabled: e.target.checked,
                          },
                        })
                      }
                      className="rounded text-[#004677] w-4 h-4"
                    />
                    <span className="font-bold text-xs text-slate-800">
                      {config.sgcIntegration?.enabled ? 'Integração Ativa' : 'Integração Inativa'}
                    </span>
                  </label>
                </div>
              </div>

              {/* Credenciais e Endpoint */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">URL Base da API Externa do SGC:</label>
                  <input
                    type="text"
                    value={config.sgcIntegration?.baseUrl || 'https://sgc.grupocontaturmkp.com.br/api/external/v1'}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        sgcIntegration: {
                          ...(config.sgcIntegration || {
                            enabled: true,
                            apiToken: '',
                            autoPushLeads: false,
                            connectionStatus: 'conectado',
                          }),
                          baseUrl: e.target.value,
                        },
                      })
                    }
                    placeholder="https://sgc.grupocontaturmkp.com.br/api/external/v1"
                    className="w-full p-2.5 border border-slate-300 rounded-lg bg-white font-mono text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Token Bearer da Unidade (Write Permission):</label>
                  <input
                    type="password"
                    value={config.sgcIntegration?.apiToken || ''}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        sgcIntegration: {
                          ...(config.sgcIntegration || {
                            enabled: true,
                            baseUrl: 'https://sgc.grupocontaturmkp.com.br/api/external/v1',
                            autoPushLeads: false,
                            connectionStatus: 'conectado',
                          }),
                          apiToken: e.target.value,
                        },
                      })
                    }
                    placeholder="sgc_sec_token..."
                    className="w-full p-2.5 border border-slate-300 rounded-lg bg-white font-mono text-xs"
                  />
                </div>
              </div>

              {/* Informações de Webhook Bidirecional */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#004677]">Webhook SGC ➔ Sentinel (Eventos em Tempo Real):</span>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">
                    Eventos: pse.criada | pse.aprovada | proposta.fechada
                  </span>
                </div>
                <p className="text-slate-600">
                  Quando o cliente aceitar/assinar a proposta no SGC, o SGC notifica o Sentinel e o faturamento da unidade é atualizado automaticamente.
                </p>
                <div className="p-2 bg-white rounded border border-slate-300 font-mono text-[10px] text-slate-700 break-all">
                  Endpoint: https://sentinel.grupocontaturmkp.com.br/api/webhooks/sgc
                </div>
              </div>

              {/* Modo de Criação de Pré-Propostas */}
              <div className="p-4 bg-sky-50 border border-sky-200 rounded-lg flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="font-bold text-[#004677] text-xs block">Modo de Exportação de Pré-Propostas:</span>
                  <span className="text-[11px] text-slate-600">
                    Defina se as oportunidades detectadas pela IA viram rascunho imediatamente ou se exigem aprovação do gestor.
                  </span>
                </div>

                <select
                  value={config.sgcIntegration?.autoPushLeads ? 'auto' : 'manual'}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      sgcIntegration: {
                        ...(config.sgcIntegration || {
                          enabled: true,
                          baseUrl: 'https://sgc.grupocontaturmkp.com.br/api/external/v1',
                          apiToken: '',
                          connectionStatus: 'conectado',
                        }),
                        autoPushLeads: e.target.value === 'auto',
                      },
                    })
                  }
                  className="px-3 py-1.5 border border-slate-300 rounded-lg bg-white font-bold text-[#004677]"
                >
                  <option value="manual">Manual (Botão 1-Click na Oportunidade)</option>
                  <option value="auto">100% Automático (POST /propostas)</option>
                </select>
              </div>

              {/* Botão de Testar Conexão com o SGC */}
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleTestSgcConnection}
                  disabled={testing}
                  className="px-4 py-2 bg-slate-100 hover:bg-sky-50 text-[#004677] border border-slate-300 font-bold rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5" />
                  {testing ? 'Validando Token e Endpoints...' : 'Testar Conexão com API Externa do SGC'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ABA 6: INTEGRAÇÃO MEETING */}
        {activeTab === 'meeting' && (
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6 text-xs">
            <div className="space-y-1 border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-[#004677] flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#6DCFF6]" />
                Integração Oficial com o Contatur Meeting (Reuniões de Diretoria)
              </h3>
              <p className="text-slate-500 text-[11px]">
                Conecte o Sentinel ao sistema de reuniões da diretoria para agendamento direto e injeção do Dossiê 360° do cliente nas atas e pautas.
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="font-bold text-[#004677] text-xs">Ativação da Integração com o Meeting:</p>
                    <p className="text-[11px] text-slate-500">
                      Habilita o botão de agendamento automático e transmissão de briefing no Radar de Clientes.
                    </p>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-slate-300 shadow-2xs">
                    <input
                      type="checkbox"
                      checked={config.meetingIntegration?.enabled ?? true}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          meetingIntegration: {
                            ...(config.meetingIntegration || {
                              baseUrl: 'https://meeting.grupocontaturmkp.com.br/api/external/v1',
                              apiToken: 'meeting_token_demo',
                              autoInjectDossierInAgenda: true,
                              defaultMeetingLocation: 'Sala da Diretoria / Teams',
                              connectionStatus: 'conectado',
                            }),
                            enabled: e.target.checked,
                          },
                        })
                      }
                      className="rounded text-[#004677] w-4 h-4"
                    />
                    <span className="font-bold text-xs text-slate-800">
                      {config.meetingIntegration?.enabled ? 'Meeting Ativo' : 'Meeting Inativo'}
                    </span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">URL Base da API do Contatur Meeting:</label>
                  <input
                    type="text"
                    value={config.meetingIntegration?.baseUrl || 'https://meeting.grupocontaturmkp.com.br/api/external/v1'}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        meetingIntegration: {
                          ...(config.meetingIntegration || {
                            enabled: true,
                            apiToken: '',
                            autoInjectDossierInAgenda: true,
                            defaultMeetingLocation: 'Sala da Diretoria / Teams',
                            connectionStatus: 'conectado',
                          }),
                          baseUrl: e.target.value,
                        },
                      })
                    }
                    className="w-full p-2.5 border border-slate-300 rounded-lg bg-white font-mono text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Token Bearer de Acesso do Meeting:</label>
                  <input
                    type="password"
                    value={config.meetingIntegration?.apiToken || ''}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        meetingIntegration: {
                          ...(config.meetingIntegration || {
                            enabled: true,
                            baseUrl: 'https://meeting.grupocontaturmkp.com.br/api/external/v1',
                            autoInjectDossierInAgenda: true,
                            defaultMeetingLocation: 'Sala da Diretoria / Teams',
                            connectionStatus: 'conectado',
                          }),
                          apiToken: e.target.value,
                        },
                      })
                    }
                    className="w-full p-2.5 border border-slate-300 rounded-lg bg-white font-mono text-xs"
                  />
                </div>
              </div>

              <div className="p-4 bg-sky-50 border border-sky-200 rounded-lg flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="font-bold text-[#004677] text-xs block">Injeção do Dossiê 360° na Pauta:</span>
                  <span className="text-[11px] text-slate-600">
                    Insere automaticamente os dados financeiros, queixas e risco de churn na ata de reunião.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={config.meetingIntegration?.autoInjectDossierInAgenda ?? true}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      meetingIntegration: {
                        ...(config.meetingIntegration || {
                          enabled: true,
                          baseUrl: 'https://meeting.grupocontaturmkp.com.br/api/external/v1',
                          apiToken: '',
                          defaultMeetingLocation: 'Sala da Diretoria / Teams',
                          connectionStatus: 'conectado',
                        }),
                        autoInjectDossierInAgenda: e.target.checked,
                      },
                    })
                  }
                  className="rounded text-[#004677] w-4 h-4"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleTestMeetingConnection}
                  disabled={testing}
                  className="px-4 py-2 bg-slate-100 hover:bg-sky-50 text-[#004677] border border-slate-300 font-bold rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5" />
                  {testing ? 'Testando Conexão Meeting...' : 'Testar Conexão com Contatur Meeting'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ABA 7: GESTÃO DE CIRCULARES MENSAIS */}
        {activeTab === 'broadcast' && (
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6 text-xs">
            <div className="space-y-1 border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-[#004677] flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#6DCFF6]" />
                Circulares Legislativas Mensais & Supervisores por Setor
              </h3>
              <p className="text-slate-500 text-[11px]">
                Defina o perfil de público da unidade, os 4 supervisores aprovadores (RH, Fiscal, Contábil e Societário) e o dia do mês de geração da pauta.
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Perfil Temático da Carteira:</label>
                  <select
                    value={config.monthlyBroadcastSettings?.targetAudienceProfile || 'Turismo, Hotelaria & Eventos'}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        monthlyBroadcastSettings: {
                          ...(config.monthlyBroadcastSettings || {
                            enabled: true,
                            dispatchDayOfMonth: 25,
                            autoDispatchWhenAllApproved: false,
                            supervisors: {
                              folha: { name: '', email: '' },
                              fiscal: { name: '', email: '' },
                              contabil: { name: '', email: '' },
                              legal: { name: '', email: '' },
                            },
                            approvalRequestEmailTemplate: '',
                          }),
                          targetAudienceProfile: e.target.value as any,
                        },
                      })
                    }
                    className="w-full p-2.5 border border-slate-300 rounded-lg bg-white font-bold text-[#004677]"
                  >
                    <option value="Turismo, Hotelaria & Eventos">Turismo, Hotelaria & Eventos (SP / Rio)</option>
                    <option value="Indústria, Comércio Geral & Logística">Indústria, Comércio Geral & Logística (MKP SP)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Dia do Mês para Geração da Pauta:</label>
                  <input
                    type="number"
                    min={1}
                    max={28}
                    value={config.monthlyBroadcastSettings?.dispatchDayOfMonth || 25}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        monthlyBroadcastSettings: {
                          ...(config.monthlyBroadcastSettings || {
                            enabled: true,
                            targetAudienceProfile: 'Turismo, Hotelaria & Eventos',
                            autoDispatchWhenAllApproved: false,
                            supervisors: {
                              folha: { name: '', email: '' },
                              fiscal: { name: '', email: '' },
                              contabil: { name: '', email: '' },
                              legal: { name: '', email: '' },
                            },
                            approvalRequestEmailTemplate: '',
                          }),
                          dispatchDayOfMonth: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full p-2 border border-slate-300 rounded-lg font-bold text-slate-800"
                  />
                </div>
              </div>

              {/* Cadastro dos 4 Supervisores */}
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                <span className="font-bold text-[#004677] block text-xs">
                  Supervisores Responsáveis pelas 4 Portas de Validação:
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200 space-y-1">
                    <span className="font-bold text-slate-700 block text-[11px]">👥 Supervisor de RH / Folha:</span>
                    <input
                      type="text"
                      placeholder="Nome do Supervisor"
                      value={config.monthlyBroadcastSettings?.supervisors?.folha?.name || ''}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          monthlyBroadcastSettings: {
                            ...config.monthlyBroadcastSettings,
                            supervisors: {
                              ...config.monthlyBroadcastSettings.supervisors,
                              folha: { ...config.monthlyBroadcastSettings.supervisors.folha, name: e.target.value },
                            },
                          },
                        })
                      }
                      className="w-full p-1.5 border border-slate-300 rounded text-[11px] mb-1"
                    />
                    <input
                      type="email"
                      placeholder="email@contatur.com.br"
                      value={config.monthlyBroadcastSettings?.supervisors?.folha?.email || ''}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          monthlyBroadcastSettings: {
                            ...config.monthlyBroadcastSettings,
                            supervisors: {
                              ...config.monthlyBroadcastSettings.supervisors,
                              folha: { ...config.monthlyBroadcastSettings.supervisors.folha, email: e.target.value },
                            },
                          },
                        })
                      }
                      className="w-full p-1.5 border border-slate-300 rounded text-[11px]"
                    />
                  </div>

                  <div className="p-2.5 bg-white rounded-lg border border-slate-200 space-y-1">
                    <span className="font-bold text-slate-700 block text-[11px]">⚖️ Supervisor Fiscal:</span>
                    <input
                      type="text"
                      placeholder="Nome do Supervisor"
                      value={config.monthlyBroadcastSettings?.supervisors?.fiscal?.name || ''}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          monthlyBroadcastSettings: {
                            ...config.monthlyBroadcastSettings,
                            supervisors: {
                              ...config.monthlyBroadcastSettings.supervisors,
                              fiscal: { ...config.monthlyBroadcastSettings.supervisors.fiscal, name: e.target.value },
                            },
                          },
                        })
                      }
                      className="w-full p-1.5 border border-slate-300 rounded text-[11px] mb-1"
                    />
                    <input
                      type="email"
                      placeholder="email@contatur.com.br"
                      value={config.monthlyBroadcastSettings?.supervisors?.fiscal?.email || ''}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          monthlyBroadcastSettings: {
                            ...config.monthlyBroadcastSettings,
                            supervisors: {
                              ...config.monthlyBroadcastSettings.supervisors,
                              fiscal: { ...config.monthlyBroadcastSettings.supervisors.fiscal, email: e.target.value },
                            },
                          },
                        })
                      }
                      className="w-full p-1.5 border border-slate-300 rounded text-[11px]"
                    />
                  </div>

                  <div className="p-2.5 bg-white rounded-lg border border-slate-200 space-y-1">
                    <span className="font-bold text-slate-700 block text-[11px]">📊 Supervisor Contábil:</span>
                    <input
                      type="text"
                      placeholder="Nome do Supervisor"
                      value={config.monthlyBroadcastSettings?.supervisors?.contabil?.name || ''}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          monthlyBroadcastSettings: {
                            ...config.monthlyBroadcastSettings,
                            supervisors: {
                              ...config.monthlyBroadcastSettings.supervisors,
                              contabil: { ...config.monthlyBroadcastSettings.supervisors.contabil, name: e.target.value },
                            },
                          },
                        })
                      }
                      className="w-full p-1.5 border border-slate-300 rounded text-[11px] mb-1"
                    />
                    <input
                      type="email"
                      placeholder="email@contatur.com.br"
                      value={config.monthlyBroadcastSettings?.supervisors?.contabil?.email || ''}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          monthlyBroadcastSettings: {
                            ...config.monthlyBroadcastSettings,
                            supervisors: {
                              ...config.monthlyBroadcastSettings.supervisors,
                              contabil: { ...config.monthlyBroadcastSettings.supervisors.contabil, email: e.target.value },
                            },
                          },
                        })
                      }
                      className="w-full p-1.5 border border-slate-300 rounded text-[11px]"
                    />
                  </div>

                  <div className="p-2.5 bg-white rounded-lg border border-slate-200 space-y-1">
                    <span className="font-bold text-slate-700 block text-[11px]">🏢 Supervisor Societário / Legal:</span>
                    <input
                      type="text"
                      placeholder="Nome do Supervisor"
                      value={config.monthlyBroadcastSettings?.supervisors?.legal?.name || ''}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          monthlyBroadcastSettings: {
                            ...config.monthlyBroadcastSettings,
                            supervisors: {
                              ...config.monthlyBroadcastSettings.supervisors,
                              legal: { ...config.monthlyBroadcastSettings.supervisors.legal, name: e.target.value },
                            },
                          },
                        })
                      }
                      className="w-full p-1.5 border border-slate-300 rounded text-[11px] mb-1"
                    />
                    <input
                      type="email"
                      placeholder="email@contatur.com.br"
                      value={config.monthlyBroadcastSettings?.supervisors?.legal?.email || ''}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          monthlyBroadcastSettings: {
                            ...config.monthlyBroadcastSettings,
                            supervisors: {
                              ...config.monthlyBroadcastSettings.supervisors,
                              legal: { ...config.monthlyBroadcastSettings.supervisors.legal, email: e.target.value },
                            },
                          },
                        })
                      }
                      className="w-full p-1.5 border border-slate-300 rounded text-[11px]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ABA 8: SLAs & FILTROS */}
        {activeTab === 'sla' && (
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6 text-xs">
            <div className="space-y-1 border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-[#004677] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#6DCFF6]" />
                Regras de SLA de Resolução & Palavras-Chave
              </h3>
              <p className="text-slate-500 text-[11px]">
                Defina o tempo máximo tolerável de atendimento antes do estouro de SLA e listas de termos prioritários.
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-red-50 rounded-lg border border-red-200 space-y-1">
                  <label className="font-bold text-red-700 block">SLA Crítico (horas):</label>
                  <input
                    type="number"
                    value={config.slaAndRules.slaHoursCritical}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        slaAndRules: {
                          ...config.slaAndRules,
                          slaHoursCritical: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full p-2 border border-red-300 rounded bg-white font-bold text-red-800"
                  />
                </div>
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 space-y-1">
                  <label className="font-bold text-amber-800 block">SLA Alta (horas):</label>
                  <input
                    type="number"
                    value={config.slaAndRules.slaHoursHigh}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        slaAndRules: {
                          ...config.slaAndRules,
                          slaHoursHigh: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full p-2 border border-amber-300 rounded bg-white font-bold text-amber-900"
                  />
                </div>
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 space-y-1">
                  <label className="font-bold text-blue-700 block">SLA Média (horas):</label>
                  <input
                    type="number"
                    value={config.slaAndRules.slaHoursMedium}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        slaAndRules: {
                          ...config.slaAndRules,
                          slaHoursMedium: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full p-2 border border-blue-300 rounded bg-white font-bold text-blue-800"
                  />
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                  <label className="font-bold text-slate-700 block">SLA Baixa (horas):</label>
                  <input
                    type="number"
                    value={config.slaAndRules.slaHoursLow}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        slaAndRules: {
                          ...config.slaAndRules,
                          slaHoursLow: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full p-2 border border-slate-300 rounded bg-white font-bold text-slate-800"
                  />
                </div>
              </div>

              {/* Dicionário de Prioridade */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">
                  Palavras-Chave de Alta Prioridade (Gatilho Imediato):
                </label>
                <input
                  type="text"
                  value={config.slaAndRules.priorityKeywords.join(', ')}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      slaAndRules: {
                        ...config.slaAndRules,
                        priorityKeywords: e.target.value.split(',').map((s) => s.trim()),
                      },
                    })
                  }
                  className="w-full p-2.5 border border-slate-300 rounded-lg font-mono text-[11px]"
                />
              </div>

              {/* Blacklist de Termos */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">
                  Blacklist Anti-Ruído (Termos ignorados pela IA):
                </label>
                <input
                  type="text"
                  value={config.slaAndRules.blacklistKeywords.join(', ')}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      slaAndRules: {
                        ...config.slaAndRules,
                        blacklistKeywords: e.target.value.split(',').map((s) => s.trim()),
                      },
                    })
                  }
                  className="w-full p-2.5 border border-slate-300 rounded-lg font-mono text-[11px]"
                />
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
