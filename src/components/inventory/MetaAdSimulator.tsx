import { useState } from 'react';
import { Card, CardHeader, CardContent } from '../ui/Card.js';
import { Badge } from '../ui/Badge.js';
import {
  Smartphone,
  Instagram,
  Facebook,
  Share2,
  Heart,
  MessageCircle,
  Bookmark,
  MoreHorizontal,
  ChevronRight,
  Sparkles,
  Shield,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

export interface VehicleAdData {
  id: string;
  make: string;
  model: string;
  version: string;
  price: number;
  promotionalPrice?: number;
  manufactureYear: number;
  modelYear: number;
  mileage: number;
  fuelType: string;
  transmission: string;
  heroImageUrl?: string;
  imageUrl?: string;
  licensePlate?: string;
  armored?: boolean;
  hasWarranty?: boolean;
  dealershipName?: string;
}

export interface MetaAdSimulatorProps {
  vehicle: VehicleAdData;
}

export function MetaAdSimulator({ vehicle }: MetaAdSimulatorProps) {
  const [adFormat, setAdFormat] = useState<'INSTAGRAM_FEED' | 'INSTAGRAM_STORY' | 'FACEBOOK_FEED'>('INSTAGRAM_FEED');

  // Cálculo das Custom Labels Dinâmicas
  const getCustomLabels = () => {
    let priceLabel = 'Abaixo de 50k';
    if (vehicle.price >= 300000) priceLabel = 'Acima de 300k';
    else if (vehicle.price >= 200000) priceLabel = '200k a 300k';
    else if (vehicle.price >= 100000) priceLabel = '100k a 200k';
    else if (vehicle.price >= 50000) priceLabel = '50k a 100k';

    let propulsion = 'Combustão';
    if (vehicle.fuelType.includes('Elétrico')) propulsion = '100% Elétrico';
    else if (vehicle.fuelType.includes('Híbrido')) propulsion = 'Eletrificado';

    let feature = 'Sem Blindagem';
    if (vehicle.armored) feature = 'Blindado';
    else if (vehicle.hasWarranty) feature = 'Com Garantia';
    else if (vehicle.mileage <= 100) feature = 'Zero KM';

    return {
      custom_label_0: priceLabel,
      custom_label_1: 'SUV / SEDAN',
      custom_label_2: propulsion,
      custom_label_3: feature,
    };
  };

  const labels = getCustomLabels();

  return (
    <Card className="flex flex-col h-full overflow-hidden border-slate-200">
      <CardHeader className="py-3.5 bg-surface-muted/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-brand-primary" />
          <h3 className="text-sm font-bold text-typography-heading">
            Simulador de Anúncios Meta Ads (DAA)
          </h3>
        </div>

        <Badge variant="available" size="sm" dot icon={<Sparkles className="w-3 h-3 text-brand-accent" />}>
          Live Dynamic Creative
        </Badge>
      </CardHeader>

      <CardContent className="p-4 flex-1 flex flex-col justify-between space-y-4">
        {/* Seletor de Formato do Anúncio */}
        <div className="flex items-center gap-1.5 p-1 bg-surface-muted rounded-lg border border-surface-border">
          <button
            onClick={() => setAdFormat('INSTAGRAM_FEED')}
            className={`flex-1 py-1.5 px-2 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              adFormat === 'INSTAGRAM_FEED'
                ? 'bg-white text-typography-heading shadow-sm border border-surface-border'
                : 'text-typography-muted hover:text-typography-heading'
            }`}
          >
            <Instagram className="w-3.5 h-3.5 text-pink-600" />
            <span>Instagram Feed</span>
          </button>

          <button
            onClick={() => setAdFormat('INSTAGRAM_STORY')}
            className={`flex-1 py-1.5 px-2 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              adFormat === 'INSTAGRAM_STORY'
                ? 'bg-white text-typography-heading shadow-sm border border-surface-border'
                : 'text-typography-muted hover:text-typography-heading'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-purple-600" />
            <span>Stories (9:16)</span>
          </button>

          <button
            onClick={() => setAdFormat('FACEBOOK_FEED')}
            className={`flex-1 py-1.5 px-2 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              adFormat === 'FACEBOOK_FEED'
                ? 'bg-white text-typography-heading shadow-sm border border-surface-border'
                : 'text-typography-muted hover:text-typography-heading'
            }`}
          >
            <Facebook className="w-3.5 h-3.5 text-blue-600" />
            <span>Facebook Feed</span>
          </button>
        </div>

        {/* Moldura de Smartphone com Preview Realista */}
        <div className="flex items-center justify-center py-2">
          {/* 1. MOLDURA INSTAGRAM FEED */}
          {adFormat === 'INSTAGRAM_FEED' && (
            <div className="w-full max-w-sm rounded-2xl border-4 border-slate-900 bg-white overflow-hidden shadow-xl text-typography-heading">
              {/* Header do Post */}
              <div className="px-3.5 py-2.5 flex items-center justify-between border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 via-pink-600 to-purple-600 p-[1.5px]">
                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center font-bold text-[10px] text-brand-primary">
                      AE
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold leading-none">Auto Elite Motors</p>
                    <p className="text-[10px] text-typography-muted leading-tight mt-0.5">Patrocinado</p>
                  </div>
                </div>
                <MoreHorizontal className="w-4 h-4 text-typography-muted" />
              </div>

              {/* Imagem do Carro (1:1) */}
              <div className="relative aspect-square bg-slate-100 overflow-hidden">
                <img
                  src={vehicle.heroImageUrl || vehicle.imageUrl}
                  alt={vehicle.model}
                  className="w-full h-full object-cover"
                />

                {/* Badge Flutuante de Preço em Destaque */}
                <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-200/80 shadow-md">
                  <p className="text-[10px] font-semibold text-typography-muted uppercase tracking-wider">Oferta Especial</p>
                  <p className="text-base font-extrabold text-brand-price tracking-tight">
                    {vehicle.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                </div>
              </div>

              {/* Botão de Ação CTA (Barra Azul Cobalto) */}
              <div className="bg-brand-primary text-white px-4 py-2.5 flex items-center justify-between text-xs font-bold cursor-pointer hover:bg-brand-primaryHover transition-colors">
                <span>Ver Estoque Completo</span>
                <ChevronRight className="w-4 h-4" />
              </div>

              {/* Interações & Legenda */}
              <div className="p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Heart className="w-5 h-5 text-typography-heading" />
                    <MessageCircle className="w-5 h-5 text-typography-heading" />
                    <Share2 className="w-5 h-5 text-typography-heading" />
                  </div>
                  <Bookmark className="w-5 h-5 text-typography-heading" />
                </div>

                <div className="text-xs">
                  <span className="font-bold mr-1.5">autoelitemotors</span>
                  <span className="text-typography-body">
                    {vehicle.make} {vehicle.model} • {vehicle.version}. Ano {vehicle.modelYear} com {vehicle.mileage.toLocaleString('pt-BR')} km rodados.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 2. MOLDURA INSTAGRAM STORIES (9:16) */}
          {adFormat === 'INSTAGRAM_STORY' && (
            <div className="w-full max-w-[280px] aspect-[9/16] rounded-2xl border-4 border-slate-900 bg-slate-950 overflow-hidden shadow-xl text-white relative flex flex-col justify-between p-3.5">
              {/* Imagem de Fundo Completa */}
              <img
                src={vehicle.heroImageUrl || vehicle.imageUrl}
                alt={vehicle.model}
                className="absolute inset-0 w-full h-full object-cover opacity-85"
              />

              {/* Gradiente de Legibilidade */}
              <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-transparent to-slate-950/90" />

              {/* Topo do Story */}
              <div className="relative z-10 space-y-2">
                <div className="w-full h-1 bg-white/30 rounded-full overflow-hidden">
                  <div className="w-2/3 h-full bg-white rounded-full" />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-brand-primary flex items-center justify-center font-bold text-[9px]">
                      AE
                    </div>
                    <div>
                      <p className="text-[11px] font-bold leading-none">Auto Elite Motors</p>
                      <p className="text-[9px] text-slate-300">Patrocinado</p>
                    </div>
                  </div>
                  <MoreHorizontal className="w-4 h-4 text-white" />
                </div>
              </div>

              {/* Centro / Card Flutuante de Oferta */}
              <div className="relative z-10 bg-slate-900/90 backdrop-blur-md p-3 rounded-xl border border-white/10 space-y-1.5">
                <div className="flex items-center gap-1.5">
                  {vehicle.armored && (
                    <span className="text-[9px] bg-red-600/80 font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                      <Shield className="w-2.5 h-2.5" /> Blindado
                    </span>
                  )}
                  {vehicle.hasWarranty && (
                    <span className="text-[9px] bg-green-600/80 font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                      <CheckCircle2 className="w-2.5 h-2.5" /> Garantia
                    </span>
                  )}
                </div>

                <p className="text-xs font-extrabold text-white leading-snug">
                  {vehicle.make} {vehicle.model}
                </p>

                <div className="flex items-baseline gap-2">
                  <span className="text-base font-black text-amber-400">
                    {vehicle.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>
              </div>

              {/* Swipe Up / CTA Bottom */}
              <div className="relative z-10 text-center space-y-1">
                <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto animate-bounce">
                  <ChevronRight className="w-4 h-4 -rotate-90 text-white" />
                </div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-white">
                  Saiba Mais
                </p>
              </div>
            </div>
          )}

          {/* 3. MOLDURA FACEBOOK FEED */}
          {adFormat === 'FACEBOOK_FEED' && (
            <div className="w-full max-w-sm rounded-xl border border-surface-border bg-white overflow-hidden shadow-md text-typography-heading text-xs">
              {/* Header do Facebook */}
              <div className="p-3 flex items-center gap-2.5 border-b border-surface-border">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                  f
                </div>
                <div>
                  <p className="font-bold leading-none">Auto Elite Motors</p>
                  <p className="text-[10px] text-typography-muted mt-0.5">Patrocinado • 🌐</p>
                </div>
              </div>

              {/* Texto do Post */}
              <div className="px-3 py-2 text-typography-body">
                Confira a oferta imperdível de {vehicle.make} {vehicle.model} {vehicle.modelYear}. Totalmente revisado com laudo cautelar aprovado!
              </div>

              {/* Foto do Carro */}
              <div className="aspect-[16/10] bg-slate-100 overflow-hidden">
                <img src={vehicle.heroImageUrl || vehicle.imageUrl} alt={vehicle.model} className="w-full h-full object-cover" />
              </div>

              {/* Box de Destino do Link */}
              <div className="p-3 bg-surface-muted/60 border-t border-surface-border flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wider text-typography-subtle font-mono truncate">drivesync.me</p>
                  <p className="font-bold text-typography-heading truncate">{vehicle.make} {vehicle.model} • {vehicle.version}</p>
                  <p className="font-bold text-brand-price mt-0.5">
                    {vehicle.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                </div>

                <button className="px-3 py-1.5 bg-surface-card border border-surface-border rounded font-bold text-xs hover:bg-surface-muted shrink-0 flex items-center gap-1">
                  <span>Ver Oferta</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Painel de Custom Labels do Meta Ads */}
        <div className="p-3 bg-surface-muted/60 rounded-lg border border-surface-border space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-typography-muted flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand-primary" />
              Custom Labels no Meta Ads Catalog
            </span>
            <Badge variant="primary" size="sm">DAA Ready</Badge>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
            <div className="p-1.5 rounded bg-white border border-surface-border">
              <span className="text-typography-subtle">label_0 (Preço):</span>
              <p className="font-bold text-typography-heading">{labels.custom_label_0}</p>
            </div>

            <div className="p-1.5 rounded bg-white border border-surface-border">
              <span className="text-typography-subtle">label_2 (Propulsão):</span>
              <p className="font-bold text-typography-heading">{labels.custom_label_2}</p>
            </div>

            <div className="p-1.5 rounded bg-white border border-surface-border">
              <span className="text-typography-subtle">label_3 (Destaque):</span>
              <p className="font-bold text-typography-heading">{labels.custom_label_3}</p>
            </div>

            <div className="p-1.5 rounded bg-white border border-surface-border">
              <span className="text-typography-subtle">label_4 (Status):</span>
              <p className="font-bold text-brand-accent">Disponível</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
