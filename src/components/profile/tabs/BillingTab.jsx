import {
  IconSparkles,
  IconCheck,
  IconCircleCheck,
  IconReceipt,
} from "@tabler/icons-react";

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

export default function BillingTab({ onManageSubscription, setMessage }) {
  return (
    <div className="tab-body">
      <div className="plan-section">
        <div className="plan-top">
          <span className="plan-status">
            <IconCircleCheck size={14} />
            Active plan
          </span>
          <IconSparkles size={32} stroke={1.3} />
        </div>
        <h3>Professional ATS Suite</h3>
        <p>
          Unlimited exports, AI parsing and premium template access.
        </p>
        <div className="plan-features">
          <span>
            <IconCheck size={15} />
            Unlimited exports
          </span>
          <span>
            <IconCheck size={15} />
            Premium templates
          </span>
        </div>
      </div>
      <div className="subscription-row">
        <span>
          <span className="status-dot" />
          Subscription active
        </span>
        <Button
          variant="outline"
          onClick={() =>
            onManageSubscription
              ? onManageSubscription()
              : setMessage({
                  type: "info",
                  text: "Subscription management is not connected yet.",
                })
          }
        >
          <IconReceipt size={16} />
          Manage subscription
        </Button>
      </div>
      <div className="billing-summary">
        <InfoStat
          icon={IconSparkles}
          label="Premium access"
          value="Included"
          tone="primary"
        />
        <InfoStat
          icon={IconReceipt}
          label="Payment history"
          value="No invoices yet"
        />
      </div>
    </div>
  );
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