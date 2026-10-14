import { useState } from "react";
import {
  IconLock,
  IconKey,
  IconShield,
  IconCheck,
  IconEye,
  IconEyeOff,
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

export default function ChangePasswordTab({
  passwordForm,
  setPasswordForm,
  handlePasswordUpdate,
  isUpdating,
}) {
  return (
    <div className="tab-body security-layout">
      <form onSubmit={handlePasswordUpdate}>
        <PasswordField
          label="Current password"
          id="current-password"
          autoComplete="current-password"
          value={passwordForm.currentPassword}
          onChange={(value) =>
            setPasswordForm((form) => ({
              ...form,
              currentPassword: value,
            }))
          }
        />
        <PasswordField
          label="New password"
          id="new-password"
          autoComplete="new-password"
          value={passwordForm.newPassword}
          onChange={(value) =>
            setPasswordForm((form) => ({
              ...form,
              newPassword: value,
            }))
          }
        />
        <PasswordField
          label="Confirm new password"
          id="confirm-password"
          autoComplete="new-password"
          value={passwordForm.confirmPassword}
          onChange={(value) =>
            setPasswordForm((form) => ({
              ...form,
              confirmPassword: value,
            }))
          }
        />
        <Button type="submit" disabled={isUpdating}>
          <IconKey size={17} />
          {isUpdating ? "Updating…" : "Update password"}
        </Button>
      </form>
      <aside className="password-advice">
        <IconShield size={27} stroke={1.5} />
        <h3>Keep your account secure</h3>
        <p>
          Use a unique password with a mix of letters, numbers and symbols.
        </p>
        <ul>
          {[
            "Use at least 8 characters",
            "Avoid common passwords",
            "Never share your password",
          ].map((tip) => (
            <li key={tip}>
              <IconCheck size={14} />
              {tip}
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}

function PasswordField({ label, id, value, onChange, autoComplete }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="password-field">
      <label htmlFor={id}>{label}</label>
      <div className="password-input">
        <IconLock size={17} />
        <input
          id={id}
          type={visible ? "text" : "password"}
          required
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          placeholder="Enter password"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={
            visible
              ? `Hide ${label.toLowerCase()}`
              : `Show ${label.toLowerCase()}`
          }
          aria-pressed={visible}
          onClick={() => setVisible(!visible)}
        >
          {visible ? <IconEyeOff size={17} /> : <IconEye size={17} />}
        </Button>
      </div>
    </div>
  );
}