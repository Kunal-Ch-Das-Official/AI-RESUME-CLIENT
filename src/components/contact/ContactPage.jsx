"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconArrowRight,
  IconCheck,
  IconMail,
  IconMessageCircle,
  IconMessageDots,
  IconWorld,
  IconX,
  IconAlertCircle,
} from "@tabler/icons-react";
import SquareAdBanner from "../adsense/ad-slots/SquareAdBanner";
import PageLoader from "../utils/page-loader/PageLoader";

// Result Modal Component using pure CSS & automatic 5s dismissal
function StatusModal({ status, title, message, onClose }) {
  const [timeLeft, setTimeLeft] = useState(5);
  const isSuccess = status === "success";

  useEffect(() => {
    setTimeLeft(5);

    const intervalId = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalId);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Auto-close after 5 seconds cleanly without calling parent setState inside updater
    const timeoutId = setTimeout(() => {
      onClose();
    }, 5000);

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, [onClose]);

  return (
    <>
      <style>{`
        @keyframes progressCountdown {
          from { width: 100%; }
          to { width: 0%; }
        }
        .status-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          background-color: rgba(15, 23, 42, 0.55);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
        }
        .status-modal-container {
          position: relative;
          width: 100%;
          max-width: 440px;
          box-sizing: border-box;
          background-color: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          padding: clamp(20px, 5vw, 32px);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          overflow: hidden;
        }
        .status-modal-close-btn {
          position: absolute;
          top: 14px;
          right: 14px;
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 6px;
          border-radius: 8px;
          color: #94a3b8;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.15s ease, color 0.15s ease;
        }
        .status-modal-close-btn:hover {
          background-color: #f1f5f9;
          color: #475569;
        }
        .status-modal-icon-badge {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto;
        }
        .status-modal-btn {
          width: 100%;
          border: none;
          outline: none;
          cursor: pointer;
          border-radius: 12px;
          padding: 13px 20px;
          font-size: 14px;
          font-weight: 600;
          color: #ffffff;
          transition: transform 0.1s ease, filter 0.2s ease;
        }
        .status-modal-btn:hover {
          filter: brightness(1.05);
        }
        .status-modal-btn:active {
          transform: scale(0.98);
        }
        .status-modal-timer-bar {
          position: absolute;
          bottom: 0;
          left: 0;
          height: 3px;
          animation: progressCountdown 5s linear forwards;
        }
      `}</style>

      <motion.div
        key="status-modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="status-modal-backdrop"
        onClick={onClose}
      >
        <motion.div
          key="status-modal-card"
          initial={{ opacity: 0, scale: 0.92, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 12 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="status-modal-container"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={onClose}
            className="status-modal-close-btn"
            aria-label="Close modal"
          >
            <IconX size={20} />
          </button>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            <div
              className="status-modal-icon-badge"
              style={{
                backgroundColor: isSuccess ? "#ecfdf5" : "#fff1f2",
                border: `1px solid ${isSuccess ? "#a7f3d0" : "#fecdd3"}`,
                color: isSuccess ? "#059669" : "#e11d48",
              }}
            >
              {isSuccess ? (
                <IconCheck size={30} />
              ) : (
                <IconAlertCircle size={30} />
              )}
            </div>

            <h3
              style={{
                marginTop: "16px",
                marginBottom: "0px",
                fontSize: "clamp(18px, 4vw, 22px)",
                fontWeight: 700,
                color: "#0f172a",
                lineHeight: 1.25,
              }}
            >
              {title}
            </h3>

            <p
              style={{
                marginTop: "8px",
                marginBottom: "0px",
                fontSize: "14px",
                lineHeight: "1.6",
                color: "#475569",
                wordBreak: "break-word",
              }}
            >
              {message}
            </p>

            <span
              style={{
                marginTop: "10px",
                fontSize: "12px",
                color: "#94a3b8",
                fontWeight: 500,
              }}
            >
              Closing automatically in {timeLeft}s...
            </span>

            <button
              type="button"
              onClick={onClose}
              className="status-modal-btn"
              style={{
                marginTop: "18px",
                backgroundColor: isSuccess ? "#059669" : "#e11d48",
                boxShadow: isSuccess
                  ? "0 4px 14px 0 rgba(5, 150, 105, 0.3)"
                  : "0 4px 14px 0 rgba(225, 29, 72, 0.3)",
              }}
            >
              {isSuccess ? "Done" : "Try Again"}
            </button>
          </div>

          <div
            className="status-modal-timer-bar"
            style={{
              backgroundColor: isSuccess ? "#10b981" : "#f43f5e",
            }}
          />
        </motion.div>
      </motion.div>
    </>
  );
}

export default function ContactPage({
  slotNo = process.env.NEXT_PUBLIC_CONTACT_PAGE_SLOT_NO,
}) {
  const [formData, setFormData] = useState({
    fullName: "",
    emailId: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [modalState, setModalState] = useState({
    isOpen: false,
    status: "success",
    title: "",
    message: "",
  });

  const handleCloseModal = useCallback(() => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = process.env.NEXT_PUBLIC_CONTACT_US_URL;
      if (!endpoint) {
        throw new Error("Contact API endpoint URL is not configured.");
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result?.message ||
            "Failed to submit enquiry. Please try again later.",
        );
      }

      setFormData({
        fullName: "",
        emailId: "",
        subject: "",
        message: "",
      });

      setModalState({
        isOpen: true,
        status: "success",
        title: "Message Sent!",
        message:
          result?.message ||
          "Your message was received successfully. We will get back to you shortly.",
      });
    } catch (err) {
      setModalState({
        isOpen: true,
        status: "error",
        title: "Submission Failed",
        message:
          err.message ||
          "An unexpected error occurred while sending your message.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white">
      {/* 1. Global Page Loader */}
      {loading && <PageLoader />}

      {/* 2. Feedback Modal with AnimatePresence */}
      <AnimatePresence>
        {modalState.isOpen && (
          <StatusModal
            status={modalState.status}
            title={modalState.title}
            message={modalState.message}
            onClose={handleCloseModal}
          />
        )}
      </AnimatePresence>

      <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-b from-indigo-50/50 via-white to-white pt-12 pb-12 lg:pt-16 lg:pb-16">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-20 left-1/2 h-80 w-[700px] -translate-x-1/2 rounded-full bg-violet-200/30 blur-[120px]" />
          <div className="absolute inset-0 bg-grid mask-fade" />
        </div>

        <div
          className="relative mx-auto flex max-w-7xl flex-col items-center justify-between gap-10 px-4 sm:px-6 lg:flex-row lg:items-center lg:gap-12 lg:px-8"
          style={{ paddingBottom: "4rem" }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full lg:w-1/2"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200/80 bg-white/80 px-3.5 py-1 text-xs font-semibold text-indigo-700 backdrop-blur">
              <IconMessageCircle size={14} />
              Contact
            </span>

            <h1 className="mt-5 text-4xl font-extrabold leading-[1.08] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Questions, feedback, or an{" "}
              <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                idea
              </span>
              ?
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
              Send a message and we&apos;ll have a clear place to start the
              conversation.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex w-full items-center justify-center lg:w-1/2"
          >
            <div className="w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white/70 p-4 shadow-sm backdrop-blur-sm">
              <SquareAdBanner
                slotNo={slotNo}
                dataAdFormat="auto"
                dataFullWidthResponsive={true}
              />
            </div>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            onSubmit={handleSubmit}
            className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm sm:p-10 lg:col-span-8"
          >
            <div className="mb-7">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                Send a message
              </span>
              <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                Tell us what you need.
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600">
                Fill out the form below and our team will get back to you
                shortly.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Full name
                </span>
                <input
                  required
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Aarav Sharma"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Email
                </span>
                <input
                  required
                  type="email"
                  name="emailId"
                  value={formData.emailId}
                  onChange={handleChange}
                  placeholder="aarav@example.com"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                />
              </label>
            </div>

            <label className="mt-4 block">
              <span className="mb-1.5 block text-xs font-semibold text-slate-700">
                Subject
              </span>
              <input
                required
                minLength={8}
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="I have a question about… (min 8 characters)"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
              />
            </label>

            <label className="mt-4 block">
              <span className="mb-1.5 block text-xs font-semibold text-slate-700">
                Message
              </span>
              <textarea
                required
                rows={6}
                minLength={12}
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Write your message here… (min 12 characters)"
                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all hover:scale-[1.02] hover:shadow-indigo-500/50 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60"
            >
              Send message
              <IconArrowRight size={16} />
            </button>
          </motion.form>

          <motion.aside
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col gap-5 lg:col-span-4"
          >
            <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-indigo-50 to-white p-7 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-indigo-100 bg-white text-indigo-600">
                <IconMail size={22} />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-slate-900">
                Email us
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">
                For product questions, feedback, and integration discussions.
              </p>
              <a
                href="mailto:team@airesume.download"
                className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-800"
              >
                team@airesume.download
                <IconArrowRight size={14} />
              </a>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-600">
                <IconMessageDots size={22} />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-slate-900">
                Live chat
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">
                Available soon — jump into real-time conversations with our
                team.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-violet-100 bg-violet-50 text-violet-600">
                <IconWorld size={22} />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-slate-900">
                Headquarters
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">
                Remote-first. Serving candidates worldwide, 24/7.
              </p>
            </div>
          </motion.aside>
        </div>
      </section>
    </main>
  );
}
