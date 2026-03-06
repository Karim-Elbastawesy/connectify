import * as z from "zod";

export const registerSchema = z
  .object({
    name: z
      .string()
      .nonempty("Username is required")
      .min(3, "Username must be at least 3 characters long")
      .max(20, "Username cannot exceed 20 characters"),
    email: z
      .string()
      .nonempty("Email is required")
      .email("Please enter a valid email address"),
    password: z
      .string()
      .nonempty("Password is required")
      .min(8, "Password must be at least 8 characters long"),
    rePassword: z
      .string()
      .nonempty("Please confirm your password")
      .min(8, "Password must be at least 8 characters long"),
    dateOfBirth: z
      .string()
      .nonempty("Please select your date of birth")
      .refine((date) => {
        const today = new Date();
        const birthDate = new Date(date);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        return age >= 13;
      }, "You must be at least 13 years old to register"),
    gender: z.enum(["male", "female"], {
      required_error: "Please select your gender",
    }),
  })
  .refine((data) => data.password === data.rePassword, {
    message: "Passwords do not match",
    path: ["rePassword"],
  });