import posthog from "posthog-js";

const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;

if (posthogKey) {
  posthog.init(posthogKey, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    person_profiles: "identified_only",
    capture_pageview: "history_change",
  });
} else if (process.env.NODE_ENV === "development") {
  console.warn(
    "PostHog não inicializado: NEXT_PUBLIC_POSTHOG_KEY não está definida. Veja .env.example."
  );
}
