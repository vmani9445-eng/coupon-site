"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import "./auth.css";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const { status } = useSession();

  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "authenticated") {
      window.location.href = "/dashboard";
    }
  }, [status]);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const form = new FormData(e.currentTarget);
      const emailValue = String(form.get("email") || "").trim().toLowerCase();
      const passwordValue = String(form.get("password") || "");

      const res = await fetch("/api/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: emailValue,
          password: passwordValue,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(data?.error || "Login failed");
        return;
      }

      window.location.href = "/dashboard";
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setError("");
    setGoogleLoading(true);

    try {
      const res = await signIn("google", {
        callbackUrl,
        redirect: false,
      });

      if (res?.error) {
        setError("Google login failed. Please try again.");
        setGoogleLoading(false);
        return;
      }

      if (res?.url) {
        window.location.href = res.url;
        return;
      }

      window.location.href = callbackUrl;
    } catch {
      setError("Google login failed. Please try again.");
      setGoogleLoading(false);
    }
  }

  if (status === "loading") return null;

  return (
    <main className="authPage">
      <section className="authShell">
        <div className="authVisual">
          <div className="visualGlow visualGlowOne" />
          <div className="visualGlow visualGlowTwo" />

          <div className="authVisualInner">
            <div className="brandPill">Trusted Cashback Platform</div>

            <h1 className="visualTitle">
              Shop smarter.
              <br />
              Earn cashback.
            </h1>

            <p className="visualText">
              Start from Cashlio, complete your order normally, and track your
              cashback till withdrawal.
            </p>

            <div className="journeyGrid">
              <div className="journeyPill">
                <span>Step 1</span>
                <strong>Visit store</strong>
              </div>
              <div className="journeyPill">
                <span>Step 2</span>
                <strong>Make purchase</strong>
              </div>
              <div className="journeyPill">
                <span>Step 3</span>
                <strong>Cashback</strong>
              </div>
              <div className="journeyPill journeyPillAccent">
                <span>Step 4</span>
                <strong>Withdrawal</strong>
              </div>
            </div>

            <div className="trustGrid">
              <div className="trustCard">
                <span>Total verified</span>
                <strong>Reliable tracking</strong>
              </div>
              <div className="trustCard">
                <span>Daily deals</span>
                <strong>Fresh offers</strong>
              </div>
              <div className="trustCard">
                <span>Fast withdrawal</span>
                <strong>UPI • Bank • Gift Cards</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="authFormWrap">
          <div className="authCard">
            <div className="authHeader">
              <span className="authEyebrow">Welcome back</span>
              <h2>Login</h2>
              <p>Continue to your cashback account.</p>
            </div>

            <form className="authForm" onSubmit={handleLogin}>
              <div className="field">
                <label>Email address</label>
                <div className="inputWrap">
                  <Mail size={18} />
                  <input
                    name="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="field">
                <div className="fieldTop">
                  <label>Password</label>
                  <Link href="/forgot-password" className="miniLink">
                    Forgot password?
                  </Link>
                </div>

                <div className="inputWrap">
                  <LockKeyhole size={18} />
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="eyeBtn"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error ? <p className="formError">{error}</p> : null}

              <button
                type="submit"
                className="primaryAuthBtn"
                disabled={loading || googleLoading}
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>

            <div className="authDivider">
              <span>or</span>
            </div>

            <button
              type="button"
              className="socialAuthBtn"
              onClick={handleGoogleLogin}
              disabled={loading || googleLoading}
            >
              <span className="googleMark">G</span>
              {googleLoading ? "Connecting..." : "Continue with Google"}
            </button>

            <div className="authFooter">
              <p>
                Don’t have an account? <Link href="/register">Create account</Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}