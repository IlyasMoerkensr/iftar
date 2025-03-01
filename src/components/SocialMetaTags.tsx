"use client";

import Head from "next/head";
import { useEffect } from "react";

export default function SocialMetaTags() {
  useEffect(() => {
    // Facebook sometimes needs a push to refresh its cache
    if (typeof window !== "undefined") {
      const fbScript = document.createElement("script");
      fbScript.innerHTML = `
        setTimeout(function() {
          if (window.FB) {
            FB.XFBML.parse();
          }
        }, 500);
      `;
      document.body.appendChild(fbScript);
    }
  }, []);

  return (
    <Head>
      {/* Facebook specific meta tags */}
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:type" content="image/jpeg" />
      <meta
        property="og:image"
        content="https://iftar-countdown.vercel.app/og-image-simple.jpg"
      />
      <meta
        property="og:image:secure_url"
        content="https://iftar-countdown.vercel.app/og-image-simple.jpg"
      />
      <meta property="og:url" content="https://iftar-countdown.vercel.app" />
      <meta property="og:type" content="website" />
      <meta property="og:title" content="Iftar Countdown" />
      <meta
        property="og:description"
        content="Know exactly when to break your fast based on your location"
      />
      <meta property="og:site_name" content="Iftar Countdown" />

      {/* Twitter specific meta tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@iftarcountdown" />
      <meta name="twitter:creator" content="@iftarcountdown" />
      <meta name="twitter:title" content="Iftar Countdown" />
      <meta
        name="twitter:description"
        content="Know exactly when to break your fast based on your location"
      />
      <meta
        name="twitter:image"
        content="https://iftar-countdown.vercel.app/og-image-simple.jpg"
      />
      <meta name="twitter:image:alt" content="Iftar Countdown App Preview" />
    </Head>
  );
}
