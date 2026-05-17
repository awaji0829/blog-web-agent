import { useState } from "react";
import { Mail, Lock, Loader2, Eye, EyeOff, MailCheck } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

type Mode = "login" | "signup";

export function LoginScreen() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      if (mode === "login") {
        await signIn(email.trim(), password);
      } else {
        await signUp(email.trim(), password);
        setSignedUp(true);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "문제가 생겼어요";
      if (msg.includes("Invalid login credentials")) {
        setError("이메일 또는 비밀번호가 맞지 않아요 · 다시 확인해 주세요");
      } else if (msg.includes("Email not confirmed")) {
        setError("이메일 인증이 필요해요 · 받은 편지함을 확인해 주세요");
      } else if (msg.includes("User already registered")) {
        setError("이미 가입된 이메일이에요 · 로그인을 시도해 주세요");
      } else if (msg.includes("Password should be at least")) {
        setError("비밀번호는 6자 이상으로 정해 주세요");
      } else {
        setError(`문제가 생겼어요 · ${msg}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const Brand = () => (
    <div className="text-center mb-10">
      <img
        src="/image/logo-sph.png"
        alt="SPH"
        className="h-9 w-auto mx-auto mb-5"
      />
      <p style={{ fontSize: 14, color: "var(--ink-soft)" }}>
        {mode === "login"
          ? "로그인하면 이어서 작성할 수 있어요"
          : "계정을 만들면 바로 시작할 수 있어요"}
      </p>
    </div>
  );

  if (signedUp) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ background: "var(--mist)" }}
      >
        <div
          className="w-full max-w-sm text-center"
          style={{
            background: "var(--page)",
            border: "1px solid var(--border-sage)",
            borderRadius: "var(--r-xl)",
            padding: 32,
          }}
        >
          <div
            className="sage-icon-tile mx-auto mb-5"
            style={{ width: 56, height: 56 }}
          >
            <MailCheck className="w-6 h-6" strokeWidth={1.5} />
          </div>
          <h3 style={{ color: "var(--ink)", marginBottom: 8 }}>
            이메일을 확인해 주세요
          </h3>
          <p
            style={{
              fontSize: 13,
              color: "var(--ink-soft)",
              lineHeight: 1.6,
              marginBottom: 24,
            }}
          >
            <span style={{ color: "var(--forest)" }}>{email}</span>으로 인증
            링크를 보냈어요 · 링크를 누르면 자동으로 로그인돼요
          </p>
          <button
            onClick={() => {
              setSignedUp(false);
              setMode("login");
            }}
            className="sage-btn sage-btn--ghost mx-auto"
          >
            로그인 화면으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "var(--mist)" }}
    >
      <div className="w-full max-w-sm">
        <Brand />

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
          style={{
            background: "var(--page)",
            border: "1px solid var(--border-sage)",
            borderRadius: "var(--r-xl)",
            padding: 32,
          }}
        >
          <div>
            <label
              htmlFor="email"
              className="block mb-1.5"
              style={{ color: "var(--ink)", fontWeight: 500 }}
            >
              이메일
            </label>
            <div className="relative">
              <Mail
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4"
                style={{ color: "var(--dusk)" }}
                strokeWidth={1.5}
              />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                disabled={loading}
                className="sage-input"
                style={{ paddingLeft: 38 }}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block mb-1.5"
              style={{ color: "var(--ink)", fontWeight: 500 }}
            >
              비밀번호
            </label>
            <div className="relative">
              <Lock
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4"
                style={{ color: "var(--dusk)" }}
                strokeWidth={1.5}
              />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === "signup" ? "6자 이상" : "••••••••"}
                required
                disabled={loading}
                className="sage-input"
                style={{ paddingLeft: 38, paddingRight: 38 }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: "var(--dusk)" }}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" strokeWidth={1.5} />
                ) : (
                  <Eye className="w-4 h-4" strokeWidth={1.5} />
                )}
              </button>
            </div>
          </div>

          {error && (
            <p
              style={{
                fontSize: 13,
                color: "#7a4f1e",
                background: "var(--warm)",
                borderRadius: "var(--r-md)",
                padding: "10px 14px",
                lineHeight: 1.5,
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !email.trim() || !password}
            className="sage-btn sage-btn--primary w-full mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.5} />
                {mode === "login" ? "로그인하고 있어요" : "계정을 만들고 있어요"}
              </>
            ) : mode === "login" ? (
              "로그인"
            ) : (
              "회원가입"
            )}
          </button>

          <p
            className="text-center pt-1"
            style={{ fontSize: 13, color: "var(--dusk)" }}
          >
            {mode === "login" ? (
              <>
                계정이 없으신가요?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("signup");
                    setError(null);
                  }}
                  style={{ color: "var(--forest)", fontWeight: 500 }}
                >
                  회원가입
                </button>
              </>
            ) : (
              <>
                이미 계정이 있으신가요?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setError(null);
                  }}
                  style={{ color: "var(--forest)", fontWeight: 500 }}
                >
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
