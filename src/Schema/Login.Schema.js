import * as z from "zod";

export const LoginSchema = z
  .object({
    email: z
      .string()
      .nonempty("Email is required")
      .email("Please enter a valid email address"),
    password: z
      .string()
      .nonempty("Password is required")
      .min(8, "Password must be at least 8 characters long"),
    })