"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  IconSparkles,
  IconCheck,
  IconCircleCheck,
  IconReceipt,
  IconRefresh,
  IconAlertCircle,
  IconClock,
  IconCreditCard,
} from "@tabler/icons-react";
import './billing-history.css'

function Button({
  variant = "default",
  size = "default",
  className = "",
  ...props
}) {
  return (
    <button
      className={`dashboard-button dashboard-button--${variant} dashboard-button--${size} ${className}`}
      {...props}
    />
  );
}

function unwrapPaymentList(payload) {
  const candidates = [
    payload,
    payload?.data,
    payload?.payments,
    payload?.paymentRecords,
    payload?.data?.payments,
    payload?.data?.paymentRecords,
    payload?.data?.data,
    payload?.result,
    payload?.result?.data,
    payload?.result?.payments,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;
    if (candidate && typeof candidate === "object" && candidate._id) {
      return [candidate];
    }
  }

  return [];
}

function formatAmount(amount, currency = "INR") {
  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount)) return "Amount unavailable";

  // Assumes INR amounts are stored in paise (e.g. 9900 = ₹99.00).
  const majorAmount =
    String(currency).toUpperCase() === "INR"
      ? numericAmount / 100
      : numericAmount;

  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency || "INR",
      maximumFractionDigits: 2,
    }).format(majorAmount);
  } catch {
    return `${majorAmount.toFixed(2)} ${currency || ""}`.trim();
  }
}

function formatDate(value) {
  if (!value) return "Date unavailable";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function statusLabel(status) {
  const normalized = String(status || "unknown").toLowerCase();
  if (["paid", "success", "succeeded"].includes(normalized)) return "Paid";
  if (["created", "pending", "processing"].includes(normalized)) return "Pending";
  if (["failed", "failure"].includes(normalized)) return "Failed";
  if (normalized === "refunded") return "Refunded";
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function statusClass(status) {
  const normalized = String(status || "unknown").toLowerCase();
  if (["paid", "success", "succeeded"].includes(normalized)) return "is-paid";
  if (["created", "pending", "processing"].includes(normalized)) return "is-pending";
  if (["failed", "failure"].includes(normalized)) return "is-failed";
  if (normalized === "refunded") return "is-refunded";
  return "is-unknown";
}

function getRecordId(record) {
  return record?._id || record?.id || record?.orderId || record?.paymentId;
}

function InfoStat({ icon: Icon, label, value, tone = "neutral" }) {
  return (
    <div className={`info-stat ${tone}`}>
      <span className="stat-icon">
        <Icon size={19} stroke={1.7} />
      </span>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

export default function BillingTab({ onManageSubscription, setMessage }) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchPayments = useCallback(async ({ quiet = false } = {}) => {
    if (!quiet) setLoading(true);
    else setRefreshing(true);
    setError("");

    const endpoint = process.env.NEXT_PUBLIC_MY_FETCH_ALL_PAYMENT_RECORD_URL;
    if (!endpoint) {
      setPayments([]);
      setError(
        "Payment history API is not configured. Set NEXT_PUBLIC_MY_FETCH_ALL_PAYMENT_RECORD_URL."
      );
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      // Backend authentication identifies ctx.user and returns every payment
      // whose userId matches that authenticated user. No client-supplied ID needed.
      const response = await fetch(endpoint, {
        method: "GET",
        credentials: "include",
        headers: { Accept: "application/json" },
        cache: "no-store",
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(
          payload?.message || payload?.error || "Could not load your payment history."
        );
      }

      const fetched = unwrapPaymentList(payload).filter(
        (record) => record && typeof record === "object"
      );

      fetched.sort((a, b) => {
        const dateA = new Date(a?.createdAt || a?.updatedAt || 0).getTime();
        const dateB = new Date(b?.createdAt || b?.updatedAt || 0).getTime();
        return dateB - dateA;
      });

      setPayments(fetched);
    } catch (fetchError) {
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "Could not load your payment history."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const successfulPayments = useMemo(
    () =>
      payments.filter((payment) =>
        ["paid", "success", "succeeded"].includes(
          String(payment.status || "").toLowerCase()
        )
      ),
    [payments]
  );

  const paidTotal = useMemo(
    () =>
      successfulPayments.reduce(
        (sum, payment) => sum + (Number(payment.amount) || 0),
        0
      ),
    [successfulPayments]
  );

  const currency =
    payments.find((payment) => payment.currency)?.currency || "INR";

  return (
    <div className="tab-body billing-tab">
      <div className="plan-section">
        <div className="plan-top">
          <span className="plan-status">
            <IconCircleCheck size={14} />
            Billing overview
          </span>
          <IconSparkles size={32} stroke={1.3} />
        </div>
        <h3>Plans &amp; payments</h3>
        <p>
          Review your payment records, transaction status, and order details.
        </p>
        <div className="plan-features">
          <span>
            <IconCheck size={15} />
            Secure payment records
          </span>
          <span>
            <IconCheck size={15} />
            Latest history from your account
          </span>
        </div>
      </div>

      <div className="subscription-row">
        <span>
          <span className="status-dot" />
          Payment records
        </span>
        <div className="billing-actions">
          <Button
            type="button"
            variant="outline"
            onClick={() => fetchPayments({ quiet: true })}
            disabled={loading || refreshing}
          >
            <IconRefresh
              size={16}
              className={refreshing ? "billing-spin" : ""}
            />
            Refresh
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              onManageSubscription
                ? onManageSubscription()
                : setMessage?.({
                    type: "info",
                    text: "Subscription management is not connected yet.",
                  })
            }
          >
            <IconReceipt size={16} />
            Manage subscription
          </Button>
        </div>
      </div>

      <div className="billing-summary">
        <InfoStat
          icon={IconCreditCard}
          label="Total records"
          value={String(payments.length)}
          tone="primary"
        />
        <InfoStat
          icon={IconReceipt}
          label="Successful payments"
          value={String(successfulPayments.length)}
          tone="success"
        />
        <InfoStat
          icon={IconSparkles}
          label="Total paid"
          value={formatAmount(paidTotal, currency)}
        />
      </div>

      <section className="billing-history" aria-labelledby="billing-history-title">
        <div className="billing-history__heading">
          <div>
            <h3 id="billing-history-title">Payment history</h3>
            <p>Your newest transactions appear first.</p>
          </div>
        </div>

        {error && (
          <div className="billing-message billing-message--error" role="alert">
            <IconAlertCircle size={17} />
            <span>{error}</span>
            <button
              type="button"
              onClick={() => setError("")}
              aria-label="Dismiss error"
            >
              ×
            </button>
          </div>
        )}

        {loading ? (
          <div className="billing-state" role="status">
            <span className="billing-loader" />
            <h3>Loading payment history…</h3>
            <p>Fetching your latest transactions.</p>
          </div>
        ) : payments.length === 0 ? (
          <div className="billing-state">
            <span className="billing-empty-icon">
              <IconReceipt size={30} />
            </span>
            <h3>No payment records found</h3>
            <p>
              {error
                ? "We couldn't retrieve your payment history. Please try refreshing."
                : "Your transactions will appear here when payment records are available."}
            </p>
            <Button type="button" variant="outline" onClick={() => fetchPayments()}>
              <IconRefresh size={16} /> Try again
            </Button>
          </div>
        ) : (
          <div className="billing-history__list">
            {payments.map((payment, index) => {
              const id = getRecordId(payment) || `${payment.createdAt || "payment"}-${index}`;
              const status = String(payment.status || "unknown").toLowerCase();

              return (
                <article className="billing-payment" key={String(id)}>
                  <div className="billing-payment__icon">
                    {["paid", "success", "succeeded"].includes(status) ? (
                      <IconCircleCheck size={21} />
                    ) : (
                      <IconClock size={21} />
                    )}
                  </div>

                  <div className="billing-payment__main">
                    <div className="billing-payment__top">
                      <div className="billing-payment__title">
                        <h4>{payment.planId || "Payment"}</h4>
                        <p>{formatDate(payment.createdAt || payment.updatedAt)}</p>
                      </div>
                      <div className="billing-payment__amount">
                        <strong>
                          {formatAmount(payment.amount, payment.currency || "INR")}
                        </strong>
                        <span className={`billing-status ${statusClass(status)}`}>
                          {statusLabel(status)}
                        </span>
                      </div>
                    </div>

                    <div className="billing-payment__details">
                      {payment.orderId && (
                        <span>
                          <small>Order ID</small>
                          <code>{payment.orderId}</code>
                        </span>
                      )}
                      {payment.paymentId && (
                        <span>
                          <small>Payment ID</small>
                          <code>{payment.paymentId}</code>
                        </span>
                      )}
                      {payment.creditsGranted !== undefined &&
                        payment.creditsGranted !== null && (
                          <span>
                            <small>Credits</small>
                            <strong>{payment.creditsGranted}</strong>
                          </span>
                        )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
