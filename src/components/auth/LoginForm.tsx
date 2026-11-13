import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { login } from "../../services/authService";
import { ApiError } from "../../services/http";
import Field from "./Field";

type FormValues = {
  email: string;
  password: string;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const INITIAL_VALUES: FormValues = {
  email: "",
  password: "",
};

// Pure function: receives the values, returns the errors.
// On login we only check that the fields are filled: the server decides if they are correct
function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};

  if (!EMAIL_REGEX.test(values.email)) {
    errors.email = "Ingresa un correo válido.";
  }
  if (values.password.length === 0) {
    errors.password = "Ingresa tu contraseña.";
  }

  return errors;
}

export default function LoginForm() {
  const [values, setValues] = useState<FormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  // One handler for every input: it reads `name` to know which field changed
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
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
      await login({ email: values.email.trim(), password: values.password });
      // TODO: when the API sets the session cookie, redirect to the account page
      setLoggedIn(true);
    } catch (error) {
      if (error instanceof ApiError) {
        // Show the API message as it comes: it is intentionally generic
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

  if (loggedIn) {
    return (
      <div role="status" className="border border-[#EADFC9] bg-white p-6">
        <p className="font-display text-2xl">¡Bienvenida!</p>
        <p className="mt-2 text-muted">
          Esto es una demo: todavía no se guarda la sesión. Pronto estará conectado al servidor.
        </p>
        <a href="/" className="mt-4 inline-block text-sm underline">
          Ir al inicio
        </a>
      </div>
    );
  }

  return (
    // noValidate: we show our own messages instead of the browser's default ones
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      {serverError && (
        <p role="alert" className="border border-red-600 bg-white p-3 text-sm text-red-600">
          {serverError}
        </p>
      )}

      <Field
        id="email"
        label="Correo electrónico"
        type="email"
        value={values.email}
        error={errors.email}
        autoComplete="email"
        onChange={handleChange}
      />
      <Field
        id="password"
        label="Contraseña"
        type={showPassword ? "text" : "password"}
        value={values.password}
        error={errors.password}
        autoComplete="current-password"
        onChange={handleChange}
      />

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={showPassword}
          onChange={(event) => setShowPassword(event.target.checked)}
        />
        Mostrar contraseña
      </label>

      <button
        type="submit"
        disabled={submitting}
        aria-busy={submitting}
        className="rounded-full bg-sun px-11 py-4 text-xs font-medium uppercase tracking-[0.22em] text-ink transition-colors hover:bg-[#ffd74a] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Iniciando sesión..." : "Iniciar sesión"}
      </button>
    </form>
  );
}