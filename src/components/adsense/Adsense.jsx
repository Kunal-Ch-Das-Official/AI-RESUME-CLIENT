import React from "react";
import Script from "next/script";

const Adsense = ({ pid }) => {
  return (
    <head>
      <Script
        async
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${pid}`}
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />
    </head>
  );
};

export default Adsense;
