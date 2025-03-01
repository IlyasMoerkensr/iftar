"use client";

import Script from "next/script";
import { useEffect } from "react";

export default function Analytics() {
  const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  useEffect(() => {
    // Send pageview when the component mounts
    if (typeof window !== "undefined" && GA_MEASUREMENT_ID) {
      window.gtag?.("config", GA_MEASUREMENT_ID, {
        page_path: window.location.pathname,
      });
    }
  }, [GA_MEASUREMENT_ID]);

  // Don't render anything if there's no measurement ID
  if (!GA_MEASUREMENT_ID) return null;

  return (
    <>
      {/* Google Analytics Script */}
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
    </>
  );
}
