import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { Spinner } from '../components/ui/index.jsx';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await login(form.email, form.password);
    if (result.success) {
      toast.success('Welcome back!');
      navigate('/projects');
    } else {
      setError(result.error);
    }
  };

  const fillDemo = (role) => {
    if (role === 'admin') setForm({ email: 'admin@taskmanager.com', password: 'password123' });
    else setForm({ email: 'user@taskmanager.com', password: 'password123' });
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      {/* Background accents */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-volt-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-ink-700/30 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="text-center mb-10 animate-fade-in">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-volt-500 mb-5 shadow-lg shadow-volt-500/30">
            <Zap size={26} className="text-ink-950" fill="currentColor" />
          </div>
          <h1 className="text-4xl font-extrabold text-ink-50 tracking-tight">TaskFlow</h1>
          <p className="text-ink-500 mt-2">Project management, simplified</p>
        </div>

        {/* Card */}
        <div className="glass-card p-8 animate-slide-up">
          <h2 className="text-xl font-bold text-ink-50 mb-6">Sign in to your account</h2>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-coral-500/10 border border-coral-500/20 text-coral-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email address</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                className="input-field"
                placeholder="you@example.com"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
                  className="input-field pr-12"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-500 hover:text-ink-300 transition-colors"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
              {loading ? <Spinner size="sm" /> : (
                <>Sign In <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 pt-5 border-t border-ink-800">
            <p className="text-xs text-ink-500 font-mono mb-3 text-center">— Quick demo access —</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => fillDemo('admin')}
                className="btn-secondary text-xs py-2 flex flex-col items-center gap-0.5"
              >
                <span className="text-volt-400 font-semibold">⚡ Admin</span>
                <span className="text-ink-500 font-mono">admin@taskmanager.com</span>
              </button>
              <button
                onClick={() => fillDemo('user')}
                className="btn-secondary text-xs py-2 flex flex-col items-center gap-0.5"
              >
                <span className="text-ink-300 font-semibold">👤 Member</span>
                <span className="text-ink-500 font-mono">user@taskmanager.com</span>
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-ink-600 text-xs mt-6 font-mono">
          TaskFlow © 2024 — Task & Project Management System
        </p>
      </div>
    </div>
  );
}
