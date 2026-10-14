"use client";

import { motion } from "framer-motion";
import { IconSparkles } from "@tabler/icons-react";

export default function AboutHero() {
  return (
    <section
      style={{
        position: "relative",
        overflow: "hidden",
        borderBottom: "1px solid #e2e8f0",
        background: "linear-gradient(to bottom, rgba(238, 242, 255, 0.5), #ffffff)",
        paddingTop: "5rem", // lg:pt-20 equivalent
        paddingBottom: "4rem",
      }}
    >
      <div
        style={{
          pointerEvents: "none",
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
        }}
      >
        {/* Glow Effect */}
        <div
          style={{
            position: "absolute",
            top: "-5rem",
            left: "50%",
            height: "20rem",
            width: "700px",
            transform: "translateX(-50%)",
            borderRadius: "9999px",
            backgroundColor: "rgba(221, 214, 254, 0.3)",
            filter: "blur(120px)",
          }}
        />
        {/* Grid & Mask Fade Replacement */}
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            backgroundImage: "linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(90deg, #e2e8f0 1px, transparent 1px)",
            backgroundSize: "20px 20px",
            opacity: 0.3,
            maskImage: "linear-gradient(to bottom, black, transparent)",
            WebkitMaskImage: "linear-gradient(to bottom, black, transparent)",
          }}
        />
      </div>

      <div
        style={{
          position: "relative",
          margin: "0 auto",
          maxWidth: "80rem", // max-w-7xl
          paddingLeft: "1.5rem",
          paddingRight: "1.5rem",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              borderRadius: "9999px",
              border: "1px solid rgba(199, 210, 254, 0.8)",
              backgroundColor: "rgba(255, 255, 255, 0.8)",
              padding: "0.25rem 0.875rem",
              fontSize: "0.75rem",
              fontWeight: 600,
              color: "#4338ca", // indigo-700
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
          >
            <IconSparkles size={14} />
            About AI-Resume
          </span>

          <h1
            style={{
              marginTop: "1.25rem",
              maxWidth: "56rem", // max-w-4xl
              fontSize: "3.75rem", // lg:text-6xl equivalent
              fontWeight: 800,
              lineHeight: 1.08,
              letterSpacing: "-0.025em",
              color: "#020617", // slate-950
            }}
          >
            A better resume starts with a{" "}
            <span
              style={{
                background: "linear-gradient(to right, #4f46e5, #7c3aed, #c026d3)", // indigo-600 to violet-600 to fuchsia-600
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
                color: "transparent",
              }}
            >
              better process
            </span>
            .
          </h1>

          <p
            style={{
              marginTop: "1.25rem",
              maxWidth: "42rem", // max-w-2xl
              fontSize: "1rem",
              lineHeight: 1.625, // leading-relaxed
              color: "#475569", // slate-600
            }}
          >
            AI-Resume is designed around a simple idea: your resume should
            communicate your value clearly before it tries to impress anyone.
          </p>
        </motion.div>
      </div>
    </section>
  );
}