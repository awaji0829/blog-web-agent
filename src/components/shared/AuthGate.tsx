import { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { LoginScreen } from '@/features/auth/LoginScreen';

interface AuthGateProps {
  children: ReactNode;
}

export function AuthGate({ children }: AuthGateProps) {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-3"
        style={{ background: "var(--mist)" }}
      >
        <Loader2
          className="w-6 h-6 animate-spin"
          style={{ color: "var(--forest)" }}
          strokeWidth={1.5}
        />
        <p style={{ fontSize: 13, color: "var(--dusk)" }}>
          계정을 확인하고 있어요 · 잠깐만요
        </p>
      </div>
    );
  }

  if (!session) {
    return <LoginScreen />;
  }

  return <>{children}</>;
}
