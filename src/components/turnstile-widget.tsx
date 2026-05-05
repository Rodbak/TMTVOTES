"use client";

import { Turnstile } from "@marsidev/react-turnstile";

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

export function isTurnstileEnabled(): boolean {
  return Boolean(SITE_KEY);
}

export function TurnstileWidget({
  onSuccess,
  onExpire,
}: {
  onSuccess: (token: string) => void;
  onExpire?: () => void;
}) {
  if (!SITE_KEY) return null;
  return (
    <div className="my-3 flex justify-center">
      <Turnstile
        siteKey={SITE_KEY}
        onSuccess={onSuccess}
        onExpire={onExpire}
        options={{ theme: "light", size: "flexible" }}
      />
    </div>
  );
}
