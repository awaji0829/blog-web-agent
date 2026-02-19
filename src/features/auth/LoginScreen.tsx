import { useState } from 'react';
import { Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

type Mode = 'login' | 'signup';

export function LoginScreen() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signedUp, setSignedUp] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;

    setLoading(true);
    setError(null);

    try {
      if (mode === 'login') {
        await signIn(email.trim(), password);
        // 로그인 성공 시 onAuthStateChange가 세션을 감지해 AuthGate가 자동으로 앱 진입
      } else {
        await signUp(email.trim(), password);
        setSignedUp(true);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : '오류가 발생했습니다';
      if (msg.includes('Invalid login credentials')) {
        setError('이메일 또는 비밀번호가 올바르지 않습니다');
      } else if (msg.includes('Email not confirmed')) {
        setError('이메일 인증이 필요합니다. 받은 편지함을 확인하세요');
      } else if (msg.includes('User already registered')) {
        setError('이미 가입된 이메일입니다. 로그인을 시도해주세요');
      } else if (msg.includes('Password should be at least')) {
        setError('비밀번호는 6자 이상이어야 합니다');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  // 회원가입 완료 — 이메일 인증 안내
  if (signedUp) {
    return (
      <div className="min-h-screen bg-[#FFF9F2] flex items-center justify-center px-4">
        <div className="w-full max-w-sm bg-white rounded-2xl border border-[#F0E6D8] p-8 text-center shadow-sm">
          <div className="text-4xl mb-4">📬</div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">이메일을 확인하세요</h2>
          <p className="text-sm text-gray-500 mb-6">
            <span className="font-medium text-gray-700">{email}</span>으로<br />
            인증 링크를 보냈습니다. 링크를 클릭하면 자동으로 로그인됩니다.
          </p>
          <button
            onClick={() => { setSignedUp(false); setMode('login'); }}
            className="text-sm text-gray-400 hover:text-gray-600 underline transition-colors"
          >
            로그인 화면으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF9F2] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-orange-100 rounded-2xl mb-4">
            <span className="text-3xl">✍️</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">SPH BLOG AGENT</h1>
          <p className="mt-2 text-sm text-gray-500">
            {mode === 'login' ? '로그인하여 계속하세요' : '계정을 만들어 시작하세요'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#F0E6D8] p-8 shadow-sm space-y-4">
          {/* 이메일 */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
              이메일
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                disabled={loading}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent disabled:bg-gray-50 transition"
              />
            </div>
          </div>

          {/* 비밀번호 */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
              비밀번호
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'signup' ? '6자 이상' : '••••••••'}
                required
                disabled={loading}
                className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent disabled:bg-gray-50 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* 에러 */}
          {error && (
            <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          {/* 제출 버튼 */}
          <button
            type="submit"
            disabled={loading || !email.trim() || !password}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors mt-2"
          >
            {loading
              ? <><Loader2 className="w-4 h-4 animate-spin" /> 처리 중...</>
              : mode === 'login' ? '로그인' : '회원가입'
            }
          </button>

          {/* 모드 전환 */}
          <p className="text-center text-xs text-gray-400 pt-1">
            {mode === 'login' ? (
              <>계정이 없으신가요?{' '}
                <button type="button" onClick={() => { setMode('signup'); setError(null); }}
                  className="text-gray-600 font-medium hover:underline">
                  회원가입
                </button>
              </>
            ) : (
              <>이미 계정이 있으신가요?{' '}
                <button type="button" onClick={() => { setMode('login'); setError(null); }}
                  className="text-gray-600 font-medium hover:underline">
                  로그인
                </button>
              </>
            )}
          </p>
        </form>
      </div>
    </div>
  );
}
