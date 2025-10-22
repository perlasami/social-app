import z from "zod"

export const SignupSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const LoginSchema = z.object({
  email: z.email(),
  password: z.string().min(4),
});

export const confirmemailSchema = z.object({
  email: z.email(),
  otp: z.string().length(6),
});

export const resendOtp = z.object({
  email: z.email(),
  
});

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(4),
  
});

export const forgetPasswordSchema = z.object({
  email: z.email(),
  
  
});


export const confirmLoginSchema = z.object({
    email: z.email(),
    otp: z.string().min(4).max(6), 
  });

