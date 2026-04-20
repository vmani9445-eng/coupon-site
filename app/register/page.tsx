"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  User,
} from "lucide-react";
import "../login/auth.css";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agree, setAgree] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!agree) {
      setError("Please accept the terms of use.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="authPage">
      <section className="authShell">
        <div className="authVisual registerVisual">
          <div className="visualGlow visualGlowOne" />
          <div className="visualGlow visualGlowTwo" />

          <div className="authVisualInner">
            <div className="brandPill">Join Cashlio</div>

            <h1 className="visualTitle">
              Create account.
              <br />
              Start saving.
            </h1>

            <p className="visualText">
              Join free and unlock store visits, cashback tracking, and easy
              withdrawal options in one simple wallet flow.
            </p>

            <div className="journeyGrid">
              <div className="journeyPill">
                <span>Visit</span>
                <strong>Store click</strong>
              </div>
              <div className="journeyPill">
                <span>Purchase</span>
                <strong>Order normally</strong>
              </div>
              <div className="journeyPill">
                <span>Track</span>
                <strong>Cashback status</strong>
              </div>
              <div className="journeyPill journeyPillAccent">
                <span>Withdraw</span>
                <strong>UPI / Bank / Gift Card</strong>
              </div>
            </div>

            <div className="trustGrid">
              <div className="trustCard">
                <span>Verified flow</span>
                <strong>Store to wallet</strong>
              </div>
              <div className="trustCard">
                <span>Daily updates</span>
                <strong>Best live deals</strong>
              </div>
              <div className="trustCard">
                <span>Quick payouts</span>
                <strong>Flexible withdrawal</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="authFormWrap">
        

          <div className="authCard">
            <div className="authHeader">
              <span className="authEyebrow">Let’s get started</span>
              <h2>Create account</h2>
              <p>Fill your details to continue.</p>
            </div>

            <form className="authForm" onSubmit={handleRegister}>
              <div className="field">
                <label>Full name</label>
                <div className="inputWrap">
                  <User size={18} />
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                    required
                  />
                </div>
              </div>

              <div className="field">
                <label>Email address</label>
                <div className="inputWrap">
                  <Mail size={18} />
                  <input
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
                <label>Password</label>
                <div className="inputWrap">
                  <LockKeyhole size={18} />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Minimum 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
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

              <label className="checkRow">
                <input
                  type="checkbox"
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                />
                <span>I agree to the terms of use</span>
              </label>

              {error ? <p className="formError">{error}</p> : null}

              <button type="submit" className="darkAuthBtn" disabled={loading}>
                {loading ? "Creating account..." : "Sign up"}
              </button>
            </form>

            <div className="authDivider">
              <span>or</span>
            </div>

            <button type="button" className="socialAuthBtn">
              <span className="googleMark">G</span>
              Continue with Google
            </button>

            <div className="authFooter">
              <p>
                Already have an account? <Link href="/login">Log in</Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}