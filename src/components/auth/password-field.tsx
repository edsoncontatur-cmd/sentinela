import { useId, useState } from "react";
import { PasswordEyeIcon } from "./password-eye-icon";

type PasswordFieldProps = {
  id?: string;
  name?: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
  minLength?: number;
  required?: boolean;
  placeholder?: string;
  showToggleLabel?: { show: string; hide: string };
};

export function PasswordField({
  id,
  name,
  label,
  value,
  onChange,
  autoComplete = "current-password",
  minLength,
  required = true,
  placeholder = "Digite sua senha",
  showToggleLabel = { show: "Mostrar senha digitada", hide: "Ocultar senha digitada" },
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const autoId = useId();
  const inputId = id ?? autoId;

  return (
    <div className="auth-login-password-block">
      <label className="auth-login-field-label" htmlFor={inputId}>
        {label}
      </label>
      <div className="password-input-wrap auth-login-password-wrap">
        <input
          id={inputId}
          name={name}
          className="auth-login-field-input"
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          minLength={minLength}
          required={required}
          placeholder={placeholder}
        />
        <button
          type="button"
          className="password-toggle-btn auth-login-password-toggle"
          onClick={() => setVisible((prev) => !prev)}
          aria-label={visible ? showToggleLabel.hide : showToggleLabel.show}
          aria-pressed={visible}
        >
          <PasswordEyeIcon visible={visible} />
        </button>
      </div>
    </div>
  );
}
