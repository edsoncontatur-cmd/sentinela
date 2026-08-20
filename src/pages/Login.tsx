import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Lock, Mail, AlertCircle, Sparkles, Eye, EyeOff } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    setTimeout(() => {
      const res = login(email, password);
      if (!res.success) {
        setErrorMsg(res.message || 'Credenciais inválidas. Verifique seu e-mail e senha.');
      }
      setLoading(false);
    }, 400);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f3f0] p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Topo Institucional com Filete Ocre */}
        <div className="h-1.5 w-full bg-[#D2BE8C]" />
        
        <div className="p-8 text-center bg-[#004677] text-white relative">
          <div className="w-14 h-14 bg-white/10 rounded-2xl mx-auto flex items-center justify-center border border-white/20 shadow-inner mb-3">
            <ShieldCheck className="w-8 h-8 text-[#6DCFF6]" />
          </div>
          <h1 className="text-2xl font-black tracking-tight">CONTATUR SENTINELA</h1>
          <p className="text-xs text-slate-200 mt-1 font-medium">
            Monitoramento Corporativo de E-mails & IA Preventiva
          </p>
          <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#6DCFF6] bg-[#003357] px-3 py-1 rounded-full mt-3 border border-[#002540]">
            <Sparkles className="w-3 h-3" />
            <span>São Paulo &bull; Rio &bull; MKP</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="text-center pb-2">
            <h2 className="text-base font-bold text-slate-800">Autenticação de Acesso</h2>
            <p className="text-xs text-slate-500">Informe suas credenciais para acessar o painel</p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">E-mail Corporativo</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@contatur.com.br"
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#004677] focus:border-[#004677] outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">Senha de Acesso</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-10 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#004677] focus:border-[#004677] outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                tabIndex={-1}
                aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-[#004677] hover:bg-[#003357] text-white font-bold rounded-lg text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Autenticando...</span>
              </>
            ) : (
              'Acessar Sistema'
            )}
          </button>
        </form>

        <div className="p-4 bg-slate-50 border-t border-slate-200 text-center text-[11px] text-slate-500">
          Acesso restrito a colaboradores autorizados do Grupo Contatur.
        </div>
      </div>
    </div>
  );
};
