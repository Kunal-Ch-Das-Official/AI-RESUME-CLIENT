
"use client";

import { useEffect, useRef, useState } from "react";

const AD_CLIENT =
  process.env.NEXT_PUBLIC_AD_SENSE_ID_CONFIG ||
  "ca-pub-1076275714941453";

export default function MultiplexGridAdBanner({
  slotNo = "5994568790",
  showBadge = true,
}) {
  const [mounted, setMounted] = useState(false);
  const adRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const adElement = adRef.current;
    if (!adElement) return;

    // AdSense may have already initialized this element.
    if (adElement.hasAttribute("data-adsbygoogle-status")) return;

    try {
      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.push({});
    } catch (error) {
      console.error("Multiplex AdSense initialization failed:", error);
    }
  }, [mounted]);

  return (
    <div className="no-print w-full">
      {showBadge && (
        <p className="mb-2 text-xs font-medium text-slate-500">
          Advertisement
        </p>
      )}

      <div className="min-h-[280px] w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white/70 p-3 shadow-sm sm:p-5">
        {mounted && (
          <ins
            ref={adRef}
            className="adsbygoogle block w-full"
            style={{ display: "block" }}
            data-ad-client={AD_CLIENT}
            data-ad-slot={slotNo}
            data-ad-format="autorelaxed"
          />
        )}
      </div>
    </div>
  );
}
