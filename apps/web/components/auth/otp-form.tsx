"use client";

import { useEffect, useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GalleryVerticalEnd } from "lucide-react";
import { toast } from "sonner";

import { verifyEmailOtp, type VerifyEmailOtpState } from "@/app/auth/actions";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";

const INITIAL_STATE: VerifyEmailOtpState = { success: false };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Verifying..." : "Confirm"}
    </Button>
  );
}

export function OTPForm({
  className,
  email,
  ...props
}: React.ComponentProps<"div"> & { email?: string }) {
  const router = useRouter();
  const [state, formAction] = useActionState(verifyEmailOtp, INITIAL_STATE);

  useEffect(() => {
    if (state.success) {
      router.replace("/space");
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [router, state]);

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form action={formAction}>
        <input type="hidden" name="email" value={email ?? ""} />
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <Link
              href="/"
              className="flex flex-col items-center gap-2 font-medium"
            >
              <div className="flex size-8 items-center justify-center rounded-md">
                <GalleryVerticalEnd className="size-6" />
              </div>
              <span className="sr-only">Mengo</span>
            </Link>
            <h1 className="text-xl font-bold">Enter verification code</h1>
            <FieldDescription>
              {email ? (
                <>
                  We have sent a 6-digit code to your email{" "}
                  <span className="font-semibold">{email}</span>
                </>
              ) : (
                "Please check your email to get the OTP code."
              )}
            </FieldDescription>
          </div>
          <Field>
            <FieldLabel htmlFor="otp" className="sr-only">
              Verification code
            </FieldLabel>
            <InputOTP
              id="otp"
              name="otp"
              maxLength={6}
              required
              containerClassName="gap-4"
              autoFocus
            >
              <InputOTPGroup className="gap-2.5 *:data-[slot=input-otp-slot]:h-16 *:data-[slot=input-otp-slot]:w-12 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border *:data-[slot=input-otp-slot]:text-xl">
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup className="gap-2.5 *:data-[slot=input-otp-slot]:h-16 *:data-[slot=input-otp-slot]:w-12 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border *:data-[slot=input-otp-slot]:text-xl">
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
            {state.error ? (
              <p className="mt-2 text-center text-sm text-destructive">
                {state.error}
              </p>
            ) : null}
            <FieldDescription className="text-center">
              Didn&apos;t receive a code? Go back to{" "}
              <Link href="/auth/login" className="text-blue-500">
                resend OTP
              </Link>
              .
            </FieldDescription>
          </Field>
          <Field>
            <SubmitButton />
          </Field>
        </FieldGroup>
      </form>
      <FieldDescription className="px-6 text-center">
        By continuing, you agree to our{" "}
        <Link href="/terms-of-service" className="text-blue-500">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href="/privacy-policy" className="text-blue-500">
          Privacy Policy
        </Link>
        .
      </FieldDescription>
    </div>
  );
}
