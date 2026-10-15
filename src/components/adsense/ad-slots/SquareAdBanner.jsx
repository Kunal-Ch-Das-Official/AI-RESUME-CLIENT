// ./adsense/ad-slots/SquareAdBanner.jsx
"use client";

import React, { useEffect, useRef } from "react";

const SquareAdBanner = ({
  slotNo,
  dataAdFormat = "auto",
  dataFullWidthResponsive = true,
  className = "w-full",
}) => {
  const adRef = useRef(null);

  useEffect(() => {
    if (adRef.current && adRef.current.innerHTML.trim() !== "") {
      return;
    }

    try {
      if (typeof window !== "undefined") {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (error) {
      console.error(
        error?.message || "Something went wrong. Unable to push the ad.",
      );
    }
  }, []);

  return (
    <div className={`no-print w-full overflow-hidden ${className}`}>
      <ins
        ref={adRef}
        className="adsbygoogle block w-full"
        data-ad-client={
          process.env.NEXT_PUBLIC_AD_SENSE_ID_CONFIG ||
          "ca-pub-1076275714941453"
        }
        data-ad-slot={slotNo}
        data-ad-format={dataAdFormat}
        data-full-width-responsive={String(dataFullWidthResponsive)}
      />
    </div>
  );
};

export default SquareAdBanner;
