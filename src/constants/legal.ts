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
    contentHash: 'sha256:5af171e0a51e9ed7e078d80b5a68c9c3cd57d1d65965d6916dda5643ba4ebb1c',
    prefix: 'Li e aceito os ',
    anchor: 'Termos de Uso',
    suffix: '.',
  },
  {
    slug: 'politica-de-privacidade',
    version: '2026-09-02',
    contentHash: 'sha256:21e1247beb7ab7032a14c21632b39e8b6e2ae9e687d749fa4f4a02b62ffce31c',
    prefix: 'Li e aceito a ',
    anchor: 'Política de Privacidade',
    suffix: '.',
  },
];

export const SUBSCRIBE_LEGAL_DOCUMENT: LegalAcceptanceDocument = {
  slug: 'contrato-saas',
  version: '2026-09-02',
  contentHash: 'sha256:bbacb45dcc3d4a083065b03c54410dd10a2870da08f334c082a4a6c3393a65d9',
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
