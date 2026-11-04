import { ApiError, isApiConfigured, request } from "./http";
import type { RegisterRequest, RegisterResponse } from "../types/auth";

export async function register(data: RegisterRequest): Promise<RegisterResponse> {
  // No API configured yet: use the mock so the UI can be developed and tested
  if (!isApiConfigured) return mockRegister(data);

  return request<RegisterResponse>("/api/auth/register", {
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