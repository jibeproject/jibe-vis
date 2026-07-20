import { useEffect, useState } from 'react';
import outputs from '../../amplify_outputs.json';
import bundledStories from '../components/vis/stories/stories.json';
import bundledCities from '../components/vis/stories/cities.json';
import {
  StoriesConfigSchema,
  CitiesConfigSchema,
  StoriesConfig,
  CitiesConfig,
} from '../components/vis/stories/schema';

/**
 * Loads the data-story configuration at runtime from the shared data bucket
 * (via CloudFront, `config/stories.json` + `config/cities.json`), falling
 * back to the JSON bundled with the app if the remote copy is missing,
 * unreachable, or fails schema validation. `?config=draft` loads the draft
 * copies under `config/drafts/` instead (used to preview unpublished edits).
 *
 * The result is resolved once per page load and shared across components.
 */

export type ConfigSource = 'remote' | 'draft' | 'bundled';

export interface StoriesConfigResult {
  stories: StoriesConfig;
  cities: CitiesConfig;
  source: ConfigSource;
}

const FETCH_TIMEOUT_MS = 5000;

// The bundled copy is the trusted last resort: served as-is, not re-validated,
// so a schema bug can never take down the public site.
function bundledConfig(): StoriesConfigResult {
  return {
    stories: bundledStories as unknown as StoriesConfig,
    cities: bundledCities as unknown as CitiesConfig,
    source: 'bundled',
  };
}

async function fetchJson(url: string): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error(`HTTP ${response.status} fetching ${url}`);
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

async function loadConfig(variant: 'live' | 'draft'): Promise<StoriesConfigResult> {
  const cloudFrontDomain = (outputs as any)?.custom?.cloudFrontDomain;
  if (!cloudFrontDomain || typeof fetch !== 'function' || import.meta.env.MODE === 'test') {
    return bundledConfig();
  }
  const prefix = variant === 'draft' ? 'config/drafts' : 'config';
  try {
    const [storiesRaw, citiesRaw] = await Promise.all([
      fetchJson(`https://${cloudFrontDomain}/${prefix}/stories.json`),
      fetchJson(`https://${cloudFrontDomain}/${prefix}/cities.json`),
    ]);
    return {
      stories: StoriesConfigSchema.parse(storiesRaw),
      cities: CitiesConfigSchema.parse(citiesRaw),
      source: variant === 'draft' ? 'draft' : 'remote',
    };
  } catch (error) {
    console.warn(`[stories-config] using bundled config (${variant} fetch failed):`, error);
    return bundledConfig();
  }
}

let cached: Promise<StoriesConfigResult> | null = null;
let cachedVariant: 'live' | 'draft' | null = null;

export function useStoriesConfig(): StoriesConfigResult | null {
  const [result, setResult] = useState<StoriesConfigResult | null>(null);

  useEffect(() => {
    const variant =
      new URLSearchParams(window.location.search).get('config') === 'draft' ? 'draft' : 'live';
    if (!cached || cachedVariant !== variant) {
      cachedVariant = variant;
      cached = loadConfig(variant);
    }
    let cancelled = false;
    cached.then((resolved) => {
      if (!cancelled) setResult(resolved);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return result;
}
