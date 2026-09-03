import { z } from 'zod';

export const webhookSchema = z.object({
  name: z.string().min(1, 'Webhook name is required'),
  url: z.string().url('Invalid webhook URL'),
  isActive: z.boolean().default(true),
  events: z.array(z.string().min(1)).min(1, 'At least one event is required'),
});

export const apiKeySchema = z.object({
  name: z.string().min(1, 'API key name is required'),
  scopes: z.array(z.string()).min(1, 'At least one scope is required'),
  isActive: z.boolean().default(true),
  expiresAt: z.coerce.date().optional().nullable(),
});

export type WebhookInput = z.infer<typeof webhookSchema>;
export type ApiKeyInput = z.infer<typeof apiKeySchema>;
