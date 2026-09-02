const PRESET_TO_SOURCE_TYPE: Record<string, string> = {
  autocerto: 'AUTOCERTO',
  altimus: 'ALTIMUS',
  sisvag: 'SISVAG',
  bomcontrole: 'BOMCONTROLE',
  webmotors: 'WEBMOTORS',
  custom: 'GENERIC_XML',
};

const SOURCE_TYPE_TO_PRESET: Record<string, string> = {
  AUTOCERTO: 'autocerto',
  ALTIMUS: 'altimus',
  SISVAG: 'sisvag',
  BOMCONTROLE: 'bomcontrole',
  WEBMOTORS: 'webmotors',
  GENERIC_XML: 'custom',
  GENERIC_JSON: 'custom',
  CUSTOM_API: 'custom',
  BASE44: 'custom',
  SPICE_DIGITAL: 'custom',
};

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
