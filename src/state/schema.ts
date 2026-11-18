import { z } from 'zod';
import { CONTAINER_IDS } from '../data/containers';
import { METHOD_IDS } from '../data/methods';
import { OVEN_IDS } from '../data/ovens';
import { PIZZA_IDS } from '../data/profiles';

/** Single source of truth for the wizard state (and, in Phase 3, for what gets persisted). */
export const SCHEMA_VERSION = 1;

const stepSchema = z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]);

export const wizardSchema = z.object({
  version: z.literal(SCHEMA_VERSION),
  // Wizard bookkeeping
  step: stepSchema,
  confirmed: z.tuple([z.boolean(), z.boolean(), z.boolean(), z.boolean()]),
  showResult: z.boolean(),
  // Step 1
  pizzaId: z.enum(PIZZA_IDS),
  method: z.enum(METHOD_IDS),
  container: z.enum(CONTAINER_IDS),
  ovenId: z.enum(OVEN_IDS),
  ovenModelId: z.string().nullable(),
  // Step 2. null = "use the recommended value".
  wMin: z.number(),
  wMax: z.number(),
  hydrationPct: z.number().nullable(),
  oilPct: z.number(),
  flourTempC: z.number(),
  // Step 3. null ball weight = profile default.
  quantityMode: z.enum(['balls', 'flour']),
  balls: z.number().int(),
  flourKg: z.number(),
  ballWeightG: z.number().nullable(),
  split: z.enum(['keep-weight', 'equal']),
  // Step 4: datetime-local strings, exactly as typed.
  startLocal: z.string(),
  bakeLocal: z.string(),
  route: z.enum(['fridge', 'no-fridge']),
  ambientTempC: z.number(),
  // Result screen
  doughTempC: z.number().nullable(),
  showDryYeast: z.boolean(),
});

export type WizardState = z.infer<typeof wizardSchema>;
export type Step = z.infer<typeof stepSchema>;
export const STEPS: readonly Step[] = [1, 2, 3, 4];
