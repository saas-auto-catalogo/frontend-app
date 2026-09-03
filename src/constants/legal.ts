import { env } from '../config/env.js';

export interface LegalAcceptanceDocument {
  slug: string;
  version: string;
  contentHash: string;
  prefix: string;
  anchor: string;
  suffix: string;
}

export const LEGAL_ACCEPTANCE_DOCUMENTS: LegalAcceptanceDocument[] = [
  {
    slug: 'termos-de-uso',
    version: '2026-09-02',
    contentHash: 'sha256:79ce8991aed8438985c8ca198ad3c885092ced7ca0f61ac97fa3792b49bcad9c',
    prefix: 'Li e aceito os ',
    anchor: 'Termos de Uso',
    suffix: '.',
  },
  {
    slug: 'politica-de-privacidade',
    version: '2026-09-02',
    contentHash: 'sha256:5f451b0c2dd2006274ef84fbd73c7ba1c917db459e9796c6591685fd7f09214a',
    prefix: 'Li e aceito a ',
    anchor: 'Política de Privacidade',
    suffix: '.',
  },
];

export const SUBSCRIBE_LEGAL_DOCUMENT: LegalAcceptanceDocument = {
  slug: 'contrato-saas',
  version: '2026-09-02',
  contentHash: 'sha256:4eb7821b4807f014475bcb0ddf1994a1bedccccc27cccdaf22b5ad1cb8c7a57c',
  prefix: 'Li e aceito o ',
  anchor: 'Contrato SaaS',
  suffix: '.',
};

export const REGISTER_LEGAL_REQUIRED_ERROR =
  'Para criar a conta, aceite os Termos de Uso e a Política de Privacidade.';

export const SUBSCRIBE_LEGAL_REQUIRED_ERROR =
  'Para continuar com a contratação, aceite o Contrato SaaS.';

export function legalDocumentUrl(slug: string): string {
  return `${env.marketingUrl}/legal/${slug}`;
}
