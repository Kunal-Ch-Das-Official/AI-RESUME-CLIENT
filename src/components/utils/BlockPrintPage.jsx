// src/components/utils/BlockPrintPage.jsx
"use client";

import React, { useState, useEffect } from "react";
import { IconAlertCircle, IconX } from "@tabler/icons-react";

export default function BlockPrintPage({ children }) {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Safeguard against missing or undefined event / key properties
      if (!e || typeof e.key !== "string") {
        return;
      }

      const isCtrlOrCmd = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();

      // Block 'p' (Print) and 's' (Save)
      if (isCtrlOrCmd && (key === "p" || key === "s")) {
        e.preventDefault();
        e.stopPropagation();
        setShowModal(true);
        return false;
      }

      // Optional: Block F12, Ctrl+Shift+I, etc.
      if (e.key === "F12" || (isCtrlOrCmd && e.shiftKey && key === "i")) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    const handleBeforePrint = (e) => {
      e.preventDefault();
      setShowModal(true);
    };

    window.addEventListener("keydown", handleKeyDown, true);
    window.addEventListener("beforeprint", handleBeforePrint);

    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
      window.removeEventListener("beforeprint", handleBeforePrint);
    };
  }, []);

  return (
    <>
      <style jsx global>{`
        @media print {
          body {
            display: none !important;
          }
        }
      `}</style>

      {children}

      {/* Custom Modal with Raw Inline CSS */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(4px)",
            padding: "16px",
          }}
        >
          <div
            style={{
              position: "relative",
              width: "100%",
              maxWidth: "420px",
              borderRadius: "16px",
              backgroundColor: "#ffffff",
              padding: "24px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              fontFamily: "system-ui, -apple-system, sans-serif",
            }}
          >
            <button
              type="button"
              onClick={() => setShowModal(false)}
              style={{
                position: "absolute",
                right: "16px",
                top: "16px",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#94a3b8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IconX size={20} />
            </button>

            <div
              style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}
            >
              <div
                style={{
                  display: "flex",
                  height: "40px",
                  width: "40px",
                  flexShrink: 0,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "50%",
                  backgroundColor: "#e0e7ff",
                  color: "#4f46e5",
                }}
              >
                <IconAlertCircle size={22} />
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: "4px" }}
              >
                <h3
                  style={{
                    margin: 0,
                    fontSize: "16px",
                    fontWeight: "700",
                    color: "#0f172a",
                  }}
                >
                  Nice try being over smart! 😉
                </h3>
                <p
                  style={{
                    margin: 0,
                    fontSize: "13px",
                    lineHeight: "1.5",
                    color: "#475569",
                  }}
                >
                  Direct printing or saving has been disabled on this page. Feel
                  free to use the official export options provided in the
                  workspace instead!
                </p>
              </div>
            </div>

            <div
              style={{
                marginTop: "24px",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{
                  borderRadius: "12px",
                  backgroundColor: "#4f46e5",
                  border: "none",
                  color: "#ffffff",
                  padding: "10px 18px",
                  fontSize: "12px",
                  fontWeight: "600",
                  cursor: "pointer",
                  boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                  transition: "background-color 0.2s",
                }}
                onMouseOver={(e) =>
                  (e.target.style.backgroundColor = "#4338ca")
                }
                onMouseOut={(e) => (e.target.style.backgroundColor = "#4f46e5")}
              >
                Got it, my bad!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
