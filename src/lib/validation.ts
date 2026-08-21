/**
 * Shared Zod validation schemas for the application.
 * Used by both client forms and server API routes.
 */
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Bitte geben Sie eine gültige E-Mail-Adresse ein.'),
  password: z.string().min(1, 'Passwort ist erforderlich.'),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  fullName: z.string().min(2, 'Name muss mindestens 2 Zeichen lang sein.'),
  email: z.string().email('Bitte geben Sie eine gültige E-Mail-Adresse ein.'),
  password: z.string().min(6, 'Passwort muss mindestens 6 Zeichen lang sein.'),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().positive(),
        price: z.number().positive(),
      }),
    )
    .min(1, 'Der Warenkorb darf nicht leer sein.'),
  totalAmount: z.number().positive(),
  shippingAddress: z.string().min(5, 'Lieferadresse ist erforderlich.'),
  couponCode: z.string().optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
