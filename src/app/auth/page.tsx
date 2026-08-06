"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createBrowserClient } from "@/lib/supabase/client";
import { validateUBCEmail } from "@/lib/auth/validate";

type Step = "email" | "otp";

export default function AuthPage() {
  const router = useRouter();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setEmailError("");

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setEmailError("Please enter your email address.");
      return;
    }

    if (!validateUBCEmail(trimmedEmail)) {
      setEmailError("Only @student.ubc.ca email addresses are allowed.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createBrowserClient();
      const { error } = await supabase.auth.signInWithOtp({
        email: trimmedEmail,
      });

      if (error) {
        toast.error(error.message || "Failed to send verification code.");
        return;
      }

      setStep("otp");
      toast.success("Verification code sent! Check your email.");
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();

    const trimmedOtp = otp.trim();
    if (!trimmedOtp || trimmedOtp.length !== 6) {
      toast.error("Please enter the 6-digit code from your email.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createBrowserClient();
      const { error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: trimmedOtp,
        type: "email",
      });

      if (error) {
        toast.error(error.message || "Invalid code. Please try again.");
        return;
      }

      toast.success("Signed in successfully!");
      router.push("/");
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setLoading(true);
    try {
      const supabase = createBrowserClient();
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
      });

      if (error) {
        toast.error(error.message || "Failed to resend code.");
        return;
      }

      toast.success("New code sent! Check your email.");
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">
            Sign in to StudyHall
          </h1>
          <p className="text-sm text-muted-foreground">
            {step === "email"
              ? "Enter your UBC student email to get started."
              : `We sent a 6-digit code to ${email.trim()}`}
          </p>
        </div>

        {step === "email" ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium leading-none"
              >
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@student.ubc.ca"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError("");
                }}
                disabled={loading}
                aria-invalid={!!emailError}
                aria-describedby={emailError ? "email-error" : undefined}
                autoFocus
              />
              {emailError && (
                <p
                  id="email-error"
                  className="text-sm text-destructive"
                  role="alert"
                >
                  {emailError}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Sending code…
                </>
              ) : (
                "Send verification code"
              )}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="otp" className="text-sm font-medium leading-none">
                Verification code
              </label>
              <Input
                id="otp"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="000000"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))
                }
                disabled={loading}
                autoFocus
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Verifying…
                </>
              ) : (
                "Verify & sign in"
              )}
            </Button>

            <div className="flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={() => {
                  setStep("email");
                  setOtp("");
                }}
                className="text-muted-foreground hover:text-foreground transition-colors"
                disabled={loading}
              >
                ← Change email
              </button>
              <button
                type="button"
                onClick={handleResend}
                className="text-muted-foreground hover:text-foreground transition-colors"
                disabled={loading}
              >
                Resend code
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
