import {
  LayoutDashboard,
  Car,
  Layers,
  RefreshCw,
  AlertTriangle,
  Sliders,
  Settings,
  ChevronRight,
  ShieldCheck,
  Radio
} from 'lucide-react';
import { Badge } from '../ui/Badge.js';

export interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  pendingIssuesCount?: number;
}

export function Sidebar({
  activeTab,
  onTabChange,
  pendingIssuesCount = 4,
}: SidebarProps) {
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Visão Geral',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'inventory',
      label: 'Estoque de Veículos',
      icon: <Car className="w-4 h-4" />,
      badge: '142',
    },
    {
      id: 'meta-feed',
      label: 'Feed Meta DAA',
      icon: <Layers className="w-4 h-4" />,
      highlight: true,
    },
    {
      id: 'xml-mapper',
      label: 'Mapeador XML De/Para',
      icon: <Sliders className="w-4 h-4 text-brand-primary" />,
    },
    {
      id: 'issues',
      label: 'Pendências & Alertas',
      icon: <AlertTriangle className="w-4 h-4" />,
      alertCount: pendingIssuesCount,
    },
    {
      id: 'sync-dms',
      label: 'Conexões DMS',
      icon: <RefreshCw className="w-4 h-4" />,
    },
    {
      id: 'reports',
      label: 'Relatórios & Diffs',
      icon: <Sliders className="w-4 h-4" />,
    },
    {
      id: 'settings',
      label: 'Configurações',
      icon: <Settings className="w-4 h-4" />,
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800 select-none min-h-screen">
      {/* Brand Logo & SaaS Name */}
      <div className="h-16 px-5 flex items-center gap-3 border-b border-slate-800 bg-slate-950/40">
        <div className="w-9 h-9 rounded-lg bg-brand-primary flex items-center justify-center text-white shadow-md">
          <Car className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-base text-white tracking-tight">Auto Catálogo</span>
          </div>
          <p className="text-[10px] text-slate-400 font-mono">SaaS Enterprise v1.0</p>
        </div>
      </div>

      {/* Loja / Tenant Ativo */}
      <div className="p-3 mx-3 my-3 bg-slate-800/60 rounded-lg border border-slate-700/50 flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-md bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-xs">
          AE
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-white truncate">Auto Elite Motors</p>
          <p className="text-[10px] text-slate-400 truncate">Matriz Jardins • SP</p>
        </div>
        <Radio className="w-3.5 h-3.5 text-brand-accent animate-pulse shrink-0" />
      </div>

      {/* Menu Navigation */}
      <div className="flex-1 px-3 py-2 space-y-1">
        <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Menu Principal
        </div>

        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-xs font-medium transition-all duration-150 group ${
                isActive
                  ? 'bg-brand-primary text-white font-semibold shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>

              <div className="flex items-center gap-1.5">
                {item.alertCount ? (
                  <span className="bg-brand-price text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {item.alertCount}
                  </span>
                ) : null}

                {item.badge ? (
                  <span className="bg-slate-800 text-slate-300 text-[10px] px-1.5 py-0.5 rounded">
                    {item.badge}
                  </span>
                ) : null}

                {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/70" />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Meta Commerce Status Mini-Widget */}
      <div className="p-4 m-3 bg-gradient-to-br from-slate-800/80 to-slate-900 border border-slate-700/60 rounded-xl space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-accent" />
            Meta Commerce
          </span>
          <Badge variant="available" size="sm">Online</Badge>
        </div>
        <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
          <div className="bg-brand-accent h-full w-[97.2%]" />
        </div>
        <p className="text-[11px] text-slate-400">97.2% veículos elegíveis</p>
      </div>
    </aside>
  );
}
