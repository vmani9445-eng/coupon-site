"use client";

import { signIn } from "next-auth/react";

export default function GoogleLoginButton() {
  return (
    <button
      type="button"
      className="googleLoginBtn"
      onClick={() => signIn("google", { callbackUrl: "/" })}
    >
      <img src="/google-icon.svg" alt="Google" width={20} height={20} />
      <span>Continue with Google</span>
    </button>
  );
}