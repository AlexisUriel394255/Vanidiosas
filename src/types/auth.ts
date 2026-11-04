// These types mirror the DTOs of the Spring Boot API.
// If a DTO changes in Java, change it here too.

export type RegisterRequest = {
  name: string;
  email: string;
  password: string;
};

export type RegisterResponse = {
  id: number;
  name: string;
  email: string;
};

// Shape of the error body the API will return (validation or business errors)
export type ApiErrorBody = {
  message: string;
  fieldErrors?: Record<string, string>;
};