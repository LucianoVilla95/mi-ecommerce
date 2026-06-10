import { z } from 'zod';

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, { message: "El nombre debe tener al menos 3 caracteres" })
    .max(50, { message: "El nombre no puede superar los 50 caracteres" }),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .email({ message: "El formato del correo electrónico no es válido" }),
    
  password: z
    .string()
    .trim()
    .min(8, { message: "La contraseña debe tener al menos 8 caracteres" })
    .max(20, { message: "La contraseña no puede superar los 20 caracteres"})
    .regex(/[A-Za-z]/, { message: "Debe contener al menos una letra" })
    .regex(/[0-9]/, { message: "Debe contener al menos un número" })
    .regex(/[A-Z]/, { message: "Debe contener al menos una letra mayúscula" })
    .regex(/[^A-Za-z0-9]/, { message: "Debe contener al menos un carácter especial (ej: @, $, !, %, *, ?, &)" }),
    
  phone: z
    .string()
    .trim()
    .min(6, { message: "El teléfono es demasiado corto" })
    .max(20, { message: "El teléfono no puede superar los 20 caracteres"})
    .regex(/^\+?[0-9\s\-]+$/, { message: "El formato de teléfono no es válido" }),
    
  country: z
    .string()
    .trim()
    .min(2, { message: "Por favor, agrega el nombre de tu país" }),
    
  address: z
    .string()
    .trim()
    .min(5, { message: "La dirección debe ser más específica" }),
    
  city: z
    .string()
    .trim()
    .min(5, { message: "La ciudad debe tener al menos 2 caracteres" }),
})

type UserInput = z.infer<typeof registerSchema>;

export type FormState = {
  success: boolean;
  error?: string;
  errors?: z.ZodFlattenedError<UserInput>['fieldErrors'];
  fields?: Partial<UserInput>
} | null;