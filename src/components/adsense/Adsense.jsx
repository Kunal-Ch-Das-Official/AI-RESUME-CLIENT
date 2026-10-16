// components/Adsense.jsx (or wherever your Adsense component is located)
"use client";

import React, { useEffect } from "react";
import Script from "next/script";

const Adsense = ({ pid }) => {
  useEffect(() => {
    const scriptEl = document.getElementById("adsense-init");
    if (scriptEl) {
      scriptEl.removeAttribute("data-nscript");
    }
  }, []);

  if (!pid) return null;

  return (
    <Script
      id="adsense-init"
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${pid}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
};

export default Adsense;