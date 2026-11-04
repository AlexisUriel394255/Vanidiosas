import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { register } from "../../services/authService";
import { ApiError } from "../../services/http";

type FormValues = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
};

// Partial<...>: each field may or may not have an error message
type FormErrors = Partial<Record<keyof FormValues, string>>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const INITIAL_VALUES: FormValues = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  acceptTerms: false,
};

// Pure function: receives the values, returns the errors. No side effects.
// The API validates again; this one only improves the user experience.
function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};

  if (values.name.trim().length < 2) {
    errors.name = "Ingresa tu nombre.";
  }
  if (!EMAIL_REGEX.test(values.email)) {
    errors.email = "Ingresa un correo válido.";
  }
  if (values.password.length < 8) {
    errors.password = "Usa al menos 8 caracteres.";
  }
  if (values.confirmPassword !== values.password) {
    errors.confirmPassword = "Las contraseñas no coinciden.";
  }
  if (!values.acceptTerms) {
    errors.acceptTerms = "Debes aceptar los términos y condiciones.";
  }

  return errors;
}

type FieldProps = {
  id: keyof FormValues;
  label: string;
  type?: string;
  value: string;
  error?: string;
  autoComplete?: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

// Reusable field: label + input + error message
function Field({ id, label, type = "text", value, error, autoComplete, onChange }: FieldProps) {
  const errorId = `${id}-error`;

  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-xs uppercase tracking-[0.2em]">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={error ? errorId : undefined}
        className={`w-full border bg-white px-4 py-3 text-base outline-none transition-colors focus:border-ink ${
          error ? "border-red-600" : "border-[#EADFC9]"
        }`}
      />
      {error && (
        <p id={errorId} className="mt-1.5 text-[13px] text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

export default function RegisterForm() {
  const [values, setValues] = useState<FormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [created, setCreated] = useState(false);

  // One handler for every input: it reads `name` to know which field changed
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value, type, checked } = event.target;
    setValues((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    // Stop the browser from reloading the page
    event.preventDefault();
    setServerError("");

    const validationErrors = validate(values);
    setErrors(validationErrors);

    // If there is at least one error, do not call the API
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    try {
      // Send only what the API needs: never confirmPassword or acceptTerms
      await register({
        name: values.name.trim(),
        email: values.email.trim(),
        password: values.password,
      });
      setCreated(true);
    } catch (error) {
      if (error instanceof ApiError) {
        // Show the API's per-field messages (e.g. "email already registered")
        setErrors((prev) => ({ ...prev, ...error.fieldErrors }));
        setServerError(error.message);
      } else {
        // fetch() throws a plain error when the server is unreachable
        setServerError("No pudimos conectar con el servidor. Intenta de nuevo.");
      }
    } finally {
      // Runs on success and on failure: always re-enable the button
      setSubmitting(false);
    }
  }

  if (created) {
    return (
      <div role="status" className="border border-[#EADFC9] bg-white p-6">
        <p className="font-display text-2xl">¡Cuenta creada!</p>
        <p className="mt-2 text-muted">Ya puedes iniciar sesión con tu correo.</p>
      </div>
    );
  }

  const passwordType = showPassword ? "text" : "password";

  return (
    // noValidate: we show our own messages instead of the browser's default ones
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      {serverError && (
        <p role="alert" className="border border-red-600 bg-white p-3 text-sm text-red-600">
          {serverError}
        </p>
      )}

      <Field id="name" label="Nombre" value={values.name} error={errors.name} autoComplete="name" onChange={handleChange} />
      <Field id="email" label="Correo electrónico" type="email" value={values.email} error={errors.email} autoComplete="email" onChange={handleChange} />
      <Field id="password" label="Contraseña" type={passwordType} value={values.password} error={errors.password} autoComplete="new-password" onChange={handleChange} />
      <Field id="confirmPassword" label="Confirmar contraseña" type={passwordType} value={values.confirmPassword} error={errors.confirmPassword} autoComplete="new-password" onChange={handleChange} />

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={showPassword} onChange={(e) => setShowPassword(e.target.checked)} />
        Mostrar contraseña
      </label>

      <div>
        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            name="acceptTerms"
            checked={values.acceptTerms}
            onChange={handleChange}
            aria-invalid={errors.acceptTerms ? "true" : "false"}
            className="mt-1"
          />
          <span>
            Acepto los <a href="/terminos" className="underline">términos y condiciones</a> y la{" "}
            <a href="/privacidad" className="underline">política de privacidad</a>.
          </span>
        </label>
        {errors.acceptTerms && (
          <p className="mt-1.5 text-[13px] text-red-600">{errors.acceptTerms}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={submitting}
        aria-busy={submitting}
        className="rounded-full bg-sun px-11 py-4 text-xs font-medium uppercase tracking-[0.22em] text-ink transition-colors hover:bg-[#ffd74a] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Creando cuenta..." : "Crear cuenta"}
      </button>
    </form>
  );
}