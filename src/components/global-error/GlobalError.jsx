import React from 'react';

export default function GlobalError({
  statusCode = "500",
  title = "System Failure",
  message = "A critical error has occurred.",
  referenceCode = "ERR-992-ALPHA",
  reset
}) {
  return (
    <div className="fullscreen-disaster">
      {/* --- Storm & Environment Effects --- */}
      <div className="lightning-flash"></div>
      <div className="siren-pulse"></div>
      <div className="rain-container">
        <div className="rain-layer"></div>
      </div>

      <div className="content-container">
        <div className="error-content">
          <div className="status-badge">FATAL ERROR {statusCode}</div>
          <h1 className="error-title">{title}</h1>
          <p className="error-message">{message}</p>

          <div className="action-section">
            <button
              className="primary-btn danger-btn"
              onClick={() => reset ? reset() : window.location.reload()}
            >
              Try again
            </button>
            <button
              className="secondary-btn stealth-btn"
              onClick={() => window.history.back()}
            >
              Go Back
            </button>
          </div>

          <div className="reference-code">
            Ref Code: <span>{referenceCode}</span>
          </div>
        </div>

        <div className="animation-wrapper">
          <div className="server-rack-disaster">
            <div className="smoke-container">
              <div className="smoke smoke-1"></div>
              <div className="smoke smoke-2"></div>
              <div className="smoke smoke-3"></div>
            </div>

            <div className="rack-cabinet">
              <div className="server-blade slot-1">
                <span className="indicator error-blink"></span>
                <div className="vents"><span></span><span></span><span></span></div>
              </div>
              <div className="server-blade slot-2">
                <span className="indicator offline"></span>
                <div className="vents"><span></span><span></span><span></span></div>
              </div>
              <div className="server-blade slot-3">
                <span className="indicator error-blink"></span>
                <div className="vents"><span></span><span></span><span></span></div>
              </div>
            </div>

            <div className="fire-container">
              <div className="flame flame-back"></div>
              <div className="flame flame-mid"></div>
              <div className="flame flame-front"></div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        /* --- FULL SCREEN CONTAINER --- */
        .fullscreen-disaster {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background-color: #000000;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          overflow: hidden;
          z-index: 99999;
        }

        /* --- GPU-OPTIMIZED STORM EFFECTS --- */
        .lightning-flash {
          position: absolute;
          inset: 0;
          background: #ffffff;
          opacity: 0;
          pointer-events: none;
          z-index: 1;
          animation: storm-flash 7s infinite;
          will-change: opacity; /* GPU Hint */
        }

        @keyframes storm-flash {
          0%, 91%, 94%, 96%, 100% { opacity: 0; }
          92% { opacity: 0.8; }
          93% { opacity: 0; }
          95% { opacity: 0.5; }
        }

        .siren-pulse {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at center, transparent 30%, rgba(220, 38, 38, 0.15) 100%);
          z-index: 2;
          pointer-events: none;
          animation: alert-pulse 2s infinite alternate;
          will-change: opacity; /* GPU Hint */
        }

        @keyframes alert-pulse {
          0% { opacity: 0.3; }
          100% { opacity: 1; }
        }

        /* Rain optimized to use 'transform: translateY' instead of 'background-position' */
        .rain-container {
          position: absolute;
          inset: -20%;
          width: 140%;
          height: 140%;
          z-index: 3;
          pointer-events: none;
          transform: rotate(15deg);
        }

        .rain-layer {
          position: absolute;
          top: -100%;
          left: 0;
          width: 100%;
          height: 200%;
          background-image:
            linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0.1) 50%, rgba(255,255,255,0)),
            linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0.15) 50%, rgba(255,255,255,0));
          background-size: 3px 40px, 2px 50px;
          background-position: 0 0, 20px 20px;
          animation: heavy-rain-transform 0.4s linear infinite;
          will-change: transform; /* GPU Hint - prevents layout repainting */
        }

        @keyframes heavy-rain-transform {
          0% { transform: translateY(0); }
          100% { transform: translateY(50%); }
        }

        /* --- CONTENT LAYOUT --- */
        .content-container {
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: column-reverse;
          align-items: center;
          gap: 4rem;
          width: 100%;
          max-width: 1200px;
          padding: 2rem;
        }

        @media (min-width: 900px) {
          .content-container {
            flex-direction: row;
            justify-content: space-between;
          }
        }

        .error-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          color: white;
        }

        /* Optimized badge glitch by animating opacity instead of box-shadow */
        .status-badge {
          align-self: flex-start;
          background: #7f1d1d;
          color: #fca5a5;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          font-size: 0.875rem;
          font-weight: 800;
          letter-spacing: 0.1em;
          border: 1px solid #ef4444;
          box-shadow: 0 0 15px rgba(239, 68, 68, 0.4);
          animation: badge-fade 3s infinite;
          will-change: opacity;
        }

        @keyframes badge-fade {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        .error-title {
          margin: 0;
          font-size: clamp(3rem, 5vw, 4.5rem);
          font-weight: 900;
          line-height: 1;
          color: #ef4444;
          text-transform: uppercase;
          letter-spacing: -2px;
          text-shadow: 0 0 20px rgba(239, 68, 68, 0.6);
        }

        .error-message {
          margin: 0;
          color: #d1d5db;
          font-size: 1.25rem;
          line-height: 1.6;
          max-width: 500px;
          border-left: 3px solid #ef4444;
          padding-left: 1rem;
        }

        .action-section {
          display: flex;
          gap: 1rem;
          margin-top: 1rem;
        }

        button {
          cursor: pointer;
          font-weight: 700;
          font-size: 1rem;
          padding: 0.875rem 2rem;
          border-radius: 4px;
          transition: transform 0.2s ease, background-color 0.2s ease;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          will-change: transform;
        }

        .danger-btn {
          background-color: #dc2626;
          color: white;
          border: 1px solid #ef4444;
          box-shadow: 0 0 20px rgba(220, 38, 38, 0.4);
        }

        .danger-btn:hover {
          background-color: #b91c1c;
          transform: scale(1.02);
        }

        .stealth-btn {
          background-color: transparent;
          color: #9ca3af;
          border: 1px solid #4b5563;
        }

        .stealth-btn:hover {
          background-color: #1f2937;
          color: white;
          border-color: #6b7280;
        }

        .reference-code {
          margin-top: 2rem;
          font-size: 0.75rem;
          color: #6b7280;
          text-transform: uppercase;
        }

        .reference-code span {
          font-family: monospace;
          background: #111827;
          padding: 0.2rem 0.5rem;
          border-radius: 2px;
          color: #ef4444;
          border: 1px solid #374151;
        }

        /* --- SERVER ANIMATION OPTIMIZED --- */
        .animation-wrapper {
          flex-shrink: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 2rem;
          transform: scale(1.1);
        }

        .server-rack-disaster {
          position: relative;
          width: 200px;
          height: 350px;
          background: transparent;
          display: flex;
          align-items: flex-end;
          justify-content: center;
        }

        .rack-cabinet {
          position: relative;
          width: 120px;
          height: 220px;
          background-color: #1e293b;
          border: 4px solid #0f172a;
          border-radius: 8px;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          z-index: 1;
        }

        .server-blade {
          height: 36px;
          background-color: #334155;
          border-radius: 4px;
          display: flex;
          align-items: center;
          padding: 0 10px;
          gap: 12px;
          border-bottom: 2px solid #0f172a;
        }

        .vents {
          display: flex;
          gap: 4px;
          flex-grow: 1;
        }

        .vents span {
          height: 6px;
          flex-grow: 1;
          background-color: #0f172a;
          border-radius: 3px;
        }

        .indicator {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }

        /* Optimized blinking by removing animated box-shadows */
        .error-blink {
          background-color: #ef4444;
          animation: simple-blink 0.35s infinite alternate;
          will-change: opacity;
        }

        .offline {
          background-color: #475569;
        }

        @keyframes simple-blink {
          from { opacity: 0.3; }
          to { opacity: 1; }
        }

        .fire-container {
          position: absolute;
          bottom: -15px;
          width: 180px;
          height: 220px;
          z-index: 2;
          pointer-events: none;
        }

        /* Hardware Accelerated Flames */
        .flame {
          position: absolute;
          bottom: 10px;
          border-radius: 50% 50% 20% 20% / 60% 60% 40% 40%;
          transform-origin: center bottom;
          mix-blend-mode: screen;
          will-change: transform; /* Critical for GPU acceleration */
        }

        .flame-back {
          left: 20px;
          width: 140px;
          height: 180px;
          background: #ef4444;
          animation: blaze 0.4s infinite alternate ease-in-out;
        }

        .flame-mid {
          left: 45px;
          width: 90px;
          height: 140px;
          background: #f97316;
          animation: blaze 0.3s infinite alternate-reverse ease-in-out;
          animation-delay: 0.1s;
        }

        .flame-front {
          left: 65px;
          width: 50px;
          height: 90px;
          background: #fde047;
          animation: blaze-core 0.25s infinite alternate ease-in-out;
          animation-delay: 0.2s;
        }

        @keyframes blaze {
          0% { transform: scaleY(0.9) scaleX(0.95); }
          100% { transform: scaleY(1.15) scaleX(1.05); }
        }

        @keyframes blaze-core {
          0% { transform: scaleY(0.8) scaleX(0.9); }
          100% { transform: scaleY(1.25) scaleX(1.1); }
        }

        /* Hardware Accelerated Smoke */
        .smoke-container {
          position: absolute;
          top: -40px;
          width: 100%;
          height: 120px;
          z-index: 0;
        }

        .smoke {
          position: absolute;
          bottom: 0;
          background: rgba(71, 85, 105, 0.7);
          border-radius: 50%;
          filter: blur(10px);
          opacity: 0;
          animation: rise-smoke 3s infinite ease-in;
          will-change: transform, opacity; /* Critical for GPU acceleration */
        }

        .smoke-1 { left: 40px; width: 60px; height: 60px; animation-delay: 0s; }
        .smoke-2 { left: 80px; width: 80px; height: 80px; animation-delay: 1s; }
        .smoke-3 { left: 60px; width: 70px; height: 70px; animation-delay: 2s; }

        @keyframes rise-smoke {
          0% { transform: translateY(20px) scale(0.8); opacity: 0; }
          40% { opacity: 0.6; }
          100% { transform: translateY(-120px) scale(2.2); opacity: 0; }
        }
      `}</style>
    </div>
  );
}