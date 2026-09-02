export type FeedDetectedFormat = 'xml' | 'json' | 'unknown';

const PRESET_TO_SOURCE_TYPE: Record<string, string> = {
  autocerto: 'AUTOCERTO',
  altimus: 'ALTIMUS',
  sisvag: 'SISVAG',
  bomcontrole: 'BOMCONTROLE',
  webmotors: 'WEBMOTORS',
  custom: 'GENERIC_XML',
  base44: 'BASE44',
  spice_digital: 'SPICE_DIGITAL',
  generic_json: 'GENERIC_JSON',
};

const SOURCE_TYPE_TO_PRESET: Record<string, string> = {
  AUTOCERTO: 'autocerto',
  ALTIMUS: 'altimus',
  SISVAG: 'sisvag',
  BOMCONTROLE: 'bomcontrole',
  WEBMOTORS: 'webmotors',
  GENERIC_XML: 'custom',
  GENERIC_JSON: 'generic_json',
  CUSTOM_API: 'generic_json',
  BASE44: 'base44',
  SPICE_DIGITAL: 'spice_digital',
};

export const XML_PRESET_IDS = [
  'autocerto',
  'altimus',
  'sisvag',
  'bomcontrole',
  'webmotors',
  'custom',
] as const;

export const JSON_PRESET_IDS = ['base44', 'spice_digital', 'generic_json'] as const;

export function presetIdToSourceType(presetId: string): string {
  return PRESET_TO_SOURCE_TYPE[presetId] ?? 'GENERIC_XML';
}

export function sourceTypeToPresetId(sourceType: string): string | null {
  const normalized = sourceType.trim().toUpperCase();
  return SOURCE_TYPE_TO_PRESET[normalized] ?? null;
}

export function resolvePresetIdFromSuggestion(suggestedPresetId?: string | null): string | null {
  if (!suggestedPresetId) return null;

  const normalized = suggestedPresetId.trim();
  if (PRESET_TO_SOURCE_TYPE[normalized]) {
    return normalized;
  }

  return sourceTypeToPresetId(normalized);
}

export function resolveSourceTypeForFeed(
  presetId: string,
  suggestedPresetId?: string | null,
): string {
  if (suggestedPresetId) {
    const fromSuggestion = sourceTypeToPresetId(suggestedPresetId);
    if (fromSuggestion) {
      return suggestedPresetId.trim().toUpperCase();
    }
  }

  return presetIdToSourceType(presetId);
}

export function getPresetIdsForFormat(format: FeedDetectedFormat | null | undefined): string[] {
  if (format === 'json') {
    return [...JSON_PRESET_IDS];
  }

  return [...XML_PRESET_IDS];
}

export function getFeedValidationSuccessMessage(options: {
  vehicleCount?: number | null;
  detectedFormat?: FeedDetectedFormat | null;
}): string {
  const { vehicleCount, detectedFormat } = options;
  const isJson = detectedFormat === 'json';
  const formatLabel = isJson ? 'JSON' : 'XML';

  if (vehicleCount != null) {
    const pluralSuffix = vehicleCount === 1 ? '' : 's';
    const availabilitySuffix = vehicleCount === 1 ? 'l' : 'is';
    return `Detectamos ${vehicleCount} veículo${pluralSuffix} disponíve${availabilitySuffix} no payload ${formatLabel}.`;
  }

  return isJson ? 'Feed JSON válido detectado.' : 'Feed XML válido detectado.';
}
