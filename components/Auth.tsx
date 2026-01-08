
import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { LogIn, UserPlus, Mail, Lock, Loader2, ShieldAlert, Sparkles } from 'lucide-react';
import Button from './Button';

export const Auth: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (isSignUp) {
        // 1. 檢查信箱是否在授權白名單內
        const { data: allowed, error: checkError } = await supabase
          .from('allowed_users')
          .select('email')
          .eq('email', email.toLowerCase().trim())
          .single();

        if (checkError || !allowed) {
          throw new Error('您的信箱尚未獲得授權，請聯繫管理員開通權限。');
        }

        // 2. 在白名單內，允許註冊
        const { error } = await supabase.auth.signUp({ 
          email: email.toLowerCase().trim(), 
          password 
        });
        if (error) throw error;
        setMessage({ type: 'success', text: '註冊成功！請檢查您的 Email 驗證信件。' });
      } else {
        // 登入邏輯
        const { error } = await supabase.auth.signInWithPassword({ 
          email: email.toLowerCase().trim(), 
          password 
        });
        if (error) throw error;
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || '認證失敗，請檢查資料或確認 Supabase 已正確配置。' });
    } finally {
      setLoading(false);
    }
  };

  // 快捷 Demo 進入功能
  const enterDemoMode = () => {
    const mockSession = {
      user: { email: 'demo-user@studio.pro', id: 'demo-id' },
      isDemo: true
    };
    // 透過發送自定義事件或直接重載狀態（這裡假設 App.tsx 會聽取 Session）
    // 我們直接讓 App 重新檢查 session，由於這裡沒辦法直接改 App state，
    // 我們將 mockSession 暫存於 localStorage
    localStorage.setItem('demo_session', JSON.stringify(mockSession));
    window.location.reload(); 
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-6">
      <div className="w-full max-w-md space-y-12 animate-in fade-in zoom-in-95 duration-700">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-black font-black italic text-3xl mx-auto shadow-2xl shadow-white/10">M</div>
          <h1 className="text-2xl font-black tracking-tight text-white uppercase tracking-tighter">Quotation Pro</h1>
          <p className="text-zinc-500 text-sm font-medium tracking-wide">Studio Management System v2.5</p>
        </div>

        <div className="space-y-8 bg-zinc-900/20 p-8 rounded-[2.5rem] border border-zinc-900 shadow-3xl">
          <form onSubmit={handleAuth} className="space-y-6">
            <div className="space-y-4">
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-white transition-colors" size={18} />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/40 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-zinc-700 focus:border-zinc-500 outline-none transition-all text-sm"
                  required
                />
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-white transition-colors" size={18} />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/40 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-zinc-700 focus:border-zinc-500 outline-none transition-all text-sm"
                  required
                />
              </div>
            </div>

            {message && (
              <div className={`p-4 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-start gap-3 ${
                message.type === 'error' 
                ? 'bg-red-500/10 text-red-500 border border-red-500/20' 
                : 'bg-green-500/10 text-green-500 border border-green-500/20'
              }`}>
                {message.type === 'error' && <ShieldAlert size={14} className="shrink-0 mt-0.5" />}
                <span>{message.text}</span>
              </div>
            )}

            <Button 
              variant="primary" 
              className="w-full py-4 text-sm font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-white/5" 
              disabled={loading}
              icon={loading ? <Loader2 size={18} className="animate-spin" /> : (isSignUp ? <UserPlus size={18} /> : <LogIn size={18} />)}
            >
              {loading ? 'Processing...' : (isSignUp ? '建立帳號 Register' : '立即登入 Login')}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setMessage(null);
                }}
                className="text-zinc-600 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors"
              >
                {isSignUp ? '已有帳號？返回登入' : '還沒有帳號？立即註冊'}
              </button>
            </div>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-zinc-800/50"></div></div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-black"><span className="bg-[#080808] px-4 text-zinc-700">Or Continue With</span></div>
          </div>

          <button
            onClick={enterDemoMode}
            className="w-full py-4 bg-zinc-800/40 hover:bg-white hover:text-black border border-zinc-800 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 group"
          >
            <Sparkles size={14} className="group-hover:animate-pulse" />
            快速體驗展示模式 Demo Mode
          </button>
        </div>

        <div className="pt-8 text-center space-y-2">
          <p className="text-[10px] text-zinc-700 font-bold uppercase tracking-[0.2em] leading-relaxed">
            Authorized Personnel Only<br/>
            此系統僅限授權人員存取
          </p>
        </div>
      </div>
    </div>
  );
};
