import { z } from 'zod';

export const addressSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  company: z.string().optional().nullable(),
  address1: z.string().min(1, 'Address 1 is required'),
  address2: z.string().optional().nullable(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  country: z.string().min(1, 'Country is required'),
  phone: z.string().min(1, 'Phone number is required'),
  isDefaultBilling: z.boolean().default(false),
  isDefaultShipping: z.boolean().default(false),
});

export type AddressInput = z.infer<typeof addressSchema>;
