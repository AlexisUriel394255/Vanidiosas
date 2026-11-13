import { ApiError, isApiConfigured, request } from "./http";
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from "../types/auth";

export async function register(data: RegisterRequest): Promise<RegisterResponse> {
  // No API configured yet: use the mock so the UI can be developed and tested
  if (!isApiConfigured) return mockRegister(data);

  return request<RegisterResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function login(data: LoginRequest): Promise<LoginResponse> {
  if (!isApiConfigured) {
    // The mock only runs in development. It must never run in production
    if (import.meta.env.DEV) return mockLogin(data);
    throw new ApiError(503, "El servicio no está disponible por ahora.");
  }

  return request<LoginResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// TEMPORARY: delete this function when the Spring Boot API is ready
async function mockRegister(data: RegisterRequest): Promise<RegisterResponse> {
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 600));

  // Simulate "email already registered" so the error path can be tested
  if (data.email.toLowerCase() === "test@test.com") {
    throw new ApiError(409, "Este correo ya está registrado.", {
      email: "Este correo ya está registrado.",
    });
  }

  // The password is never stored or returned, not even in a mock
  return { id: 1, name: data.name, email: data.email };
}

// TEMPORARY: demo credentials for development only. Delete with the API ready
async function mockLogin(data: LoginRequest): Promise<LoginResponse> {
  await new Promise((resolve) => setTimeout(resolve, 600));

  if (data.email.toLowerCase() === "demo@test.com" && data.password === "12345678") {
    return { id: 1, name: "Demo", email: data.email };
  }

  // Same message for a wrong email and a wrong password: never reveal which one failed
  throw new ApiError(401, "Correo o contraseña incorrectos.");
}