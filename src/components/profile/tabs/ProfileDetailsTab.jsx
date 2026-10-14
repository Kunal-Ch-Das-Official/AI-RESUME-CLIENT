import {
  IconUser,
  IconAt,
  IconMail,
  IconShieldCheck,
  IconCircleCheck,
  IconShield,
  IconSparkles,
  IconLock,
} from "@tabler/icons-react";

export default function ProfileDetailsTab({ user }) {
  return (
    <div className="profile-body">
      <div className="profile-section-title">
        <h3>Personal information</h3>
        <span>
          <IconLock size={13} /> Private to you
        </span>
      </div>
      <div className="profile-fields">
        <ProfileField
          label="Full name"
          value={user.fullName}
          icon={IconUser}
        />
        <ProfileField
          label="Username"
          value={user.userName}
          icon={IconAt}
        />
        <ProfileField
          label="Email address"
          value={user.userEmail}
          icon={IconMail}
          wide
          verified
        />
        <ProfileField
          label="Unique user ID"
          value={user.id}
          icon={IconShieldCheck}
          wide
          mono
        />
      </div>
      <div className="account-status-row">
        <InfoStat
          icon={IconCircleCheck}
          label="Account status"
          value="Active"
          tone="success"
        />
        <InfoStat
          icon={IconShield}
          label="Security"
          value="Protected"
        />
        <InfoStat
          icon={IconSparkles}
          label="Membership"
          value="Premium"
          tone="primary"
        />
      </div>
      <p className="profile-footer">
        <IconShieldCheck size={15} /> Your personal information is
        kept private and secure.
      </p>
    </div>
  );
}

function ProfileField({
  label,
  value,
  icon: Icon,
  wide = false,
  mono = false,
  verified = false,
}) {
  return (
    <div className={`profile-field ${wide ? "field-wide" : ""}`}>
      <div className="field-label">
        <span>{label}</span>
        {verified && (
          <span className="verified-label">
            <IconCircleCheck size={13} />
            Verified
          </span>
        )}
      </div>
      <div className="field-value">
        <Icon size={18} stroke={1.7} />
        <span className={mono ? "mono-value" : ""}>{value}</span>
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