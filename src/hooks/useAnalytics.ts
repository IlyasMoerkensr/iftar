"use client";

// Custom hook for tracking events in Google Analytics
export const useAnalytics = () => {
  // Track a custom event
  const trackEvent = (
    eventName: string,
    eventParams?: Record<string, string | number | boolean>
  ) => {
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", eventName, eventParams);
    }
  };

  // Track page views
  const trackPageView = (url: string) => {
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("config", process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "", {
        page_path: url,
      });
    }
  };

  // Track user interactions with the Quran player
  const trackQuranPlayerEvent = (
    action: "play" | "pause" | "next" | "random" | "volume_change",
    surah?: string
  ) => {
    trackEvent("quran_player_interaction", {
      action,
      surah: surah || "",
    });
  };

  // Track location changes
  const trackLocationChange = (
    city: string,
    country: string,
    source: string
  ) => {
    trackEvent("location_change", {
      city,
      country,
      source,
    });
  };

  return {
    trackEvent,
    trackPageView,
    trackQuranPlayerEvent,
    trackLocationChange,
  };
};

// Add TypeScript global type definition for gtag
declare global {
  interface Window {
    gtag: (
      command: string,
      target: string,
      params?: Record<string, unknown>
    ) => void;
    dataLayer: unknown[];
  }
}
