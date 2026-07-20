import { z } from 'zod';

/**
 * Schema for the data-story configuration consumed by the map and pathways
 * gallery (stories.json / cities.json).
 *
 * This is the contract for story configuration whether it is bundled with the
 * app or fetched at runtime from the shared data bucket (config/stories.json).
 * It is deliberately structural rather than exhaustive: it guarantees the
 * shape the app relies on (titles, pages, sources, layers arrays, etc.) while
 * passing through additional keys so existing content and future extensions
 * validate without a schema release. Tighten incrementally as the online
 * story editor takes over authoring.
 */

export const CityConfigSchema = z
  .object({
    lat: z.number(),
    lng: z.number(),
    zoom: z.number(),
    bounds: z.tuple([
      z.tuple([z.number(), z.number()]),
      z.tuple([z.number(), z.number()]),
    ]),
  })
  .passthrough();

export const CitiesConfigSchema = z.record(CityConfigSchema);

export const StorySourceSchema = z
  .object({
    type: z.string(),
    url: z.string(),
    attribution: z.string().optional(),
    promoteId: z.string().optional(),
  })
  .passthrough();

export const StoryLayerSchema = z
  .object({
    id: z.string(),
    source: z.string(),
    'source-layer': z.string().optional(),
    style: z.string().optional(),
    index: z.record(z.string()).optional(),
    dictionary: z.record(z.string()).optional(),
    focus: z.record(z.unknown()).optional(),
    legend: z.array(z.record(z.unknown())).optional(),
    popup: z.string().optional(),
    transformations: z.record(z.unknown()).optional(),
  })
  .passthrough();

export const StoryParamsSchema = z
  .object({
    city: z.string().optional(),
    directions: z.string().optional(),
    help: z.string().optional(),
    legend_layer: z.number().optional(),
    sources: z.record(StorySourceSchema).optional(),
    layers: z.array(StoryLayerSchema).optional(),
    overlays: z.record(z.unknown()).optional(),
    linkage: z.record(z.unknown()).optional(),
    steps: z.array(z.unknown()).optional(),
    hints: z.array(z.unknown()).optional(),
  })
  .passthrough();

export const StorySchema = z
  .object({
    title: z.string(),
    page: z.string(),
    // Map stories are fully config-driven; dashboard stories reference a
    // registered dashboard component via the pathway query param.
    type: z.enum(['map', 'dashboard']),
    img: z.string().optional(),
    authors: z.record(z.string()).optional(),
    cols: z.number().optional(),
    featured: z.boolean().optional(),
    story: z.string().optional(),
    params: StoryParamsSchema.optional(),
  })
  .passthrough();

export const StoriesConfigSchema = z.array(StorySchema).min(1);

export type CityConfig = z.infer<typeof CityConfigSchema>;
export type CitiesConfig = z.infer<typeof CitiesConfigSchema>;
export type StorySource = z.infer<typeof StorySourceSchema>;
export type StoryLayer = z.infer<typeof StoryLayerSchema>;
export type StoryParams = z.infer<typeof StoryParamsSchema>;
export type Story = z.infer<typeof StorySchema>;
export type StoriesConfig = z.infer<typeof StoriesConfigSchema>;
