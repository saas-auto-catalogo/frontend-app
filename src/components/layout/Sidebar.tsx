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
  Radio,
} from 'lucide-react';

export interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  pendingIssuesCount?: number;
  totalVehicles?: number;
  eligibleForMetaAds?: number;
  healthScore?: number;
  workspaceName?: string;
  isLoading?: boolean;
}

function getWorkspaceInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'WS';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function getMetaStatusLabel(healthScore?: number, isLoading?: boolean): string {
  if (isLoading || healthScore === undefined) return '—';
  if (healthScore >= 95) return 'Online';
  if (healthScore >= 80) return 'Atenção';
  return 'Crítico';
}

function getMetaStatusClasses(healthScore?: number, isLoading?: boolean): string {
  if (isLoading || healthScore === undefined) {
    return 'bg-white/10 text-blue-200 border-white/20';
  }
  if (healthScore >= 95) {
    return 'bg-green-500/20 text-green-300 border-green-400/30';
  }
  if (healthScore >= 80) {
    return 'bg-amber-500/20 text-amber-200 border-amber-400/30';
  }
  return 'bg-red-500/20 text-red-300 border-red-400/30';
}

export function Sidebar({
  activeTab,
  onTabChange,
  pendingIssuesCount = 0,
  totalVehicles,
  eligibleForMetaAds,
  healthScore,
  workspaceName,
  isLoading = false,
}: SidebarProps) {
  const displayWorkspaceName = workspaceName ?? 'Minha Revenda';
  const workspaceInitials = getWorkspaceInitials(displayWorkspaceName);
  const inventoryBadge =
    isLoading || totalVehicles === undefined ? '—' : String(totalVehicles);
  const showInventoryBadge = isLoading || (totalVehicles !== undefined && totalVehicles > 0);
  const metaHealthDisplay =
    isLoading || healthScore === undefined ? '—' : `${healthScore}%`;
  const metaHealthWidth =
    isLoading || healthScore === undefined ? 0 : Math.min(100, Math.max(0, healthScore));
  const eligibleLabel =
    isLoading || eligibleForMetaAds === undefined
      ? '— veículos elegíveis'
      : `${eligibleForMetaAds} veículos elegíveis`;

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
      badge: showInventoryBadge ? inventoryBadge : undefined,
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
      alertCount: pendingIssuesCount > 0 ? pendingIssuesCount : undefined,
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
    <aside className="w-64 bg-gradient-to-b from-[#0037B0] via-[#002F99] to-[#002270] text-white flex flex-col shrink-0 border-r border-blue-900 select-none min-h-screen shadow-xl">
      <div className="h-16 px-5 flex items-center gap-3 border-b border-white/10 bg-black/10">
        <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center text-[#0037B0] shadow-md font-bold">
          <Car className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-base text-white tracking-tight">DriveSync</span>
          </div>
          <p className="text-[10px] text-blue-200 font-mono">SaaS Enterprise v1.0</p>
        </div>
      </div>

      <div className="p-3 mx-3 my-3 bg-white/10 rounded-lg border border-white/15 flex items-center gap-2.5 backdrop-blur-sm">
        <div className="w-7 h-7 rounded-md bg-white/20 text-white flex items-center justify-center font-bold text-xs">
          {workspaceInitials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-white truncate">{displayWorkspaceName}</p>
        </div>
        <Radio className="w-3.5 h-3.5 text-green-300 animate-pulse shrink-0" />
      </div>

      <div className="flex-1 px-3 py-2 space-y-1">
        <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-blue-200">
          Menu Principal
        </div>

        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-150 group ${
                isActive
                  ? 'bg-white text-[#0037B0] font-bold shadow-md translate-x-0.5'
                  : 'text-blue-100 hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className={isActive ? 'text-[#0037B0]' : 'text-blue-200 group-hover:text-white'}>
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
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded ${
                      isActive ? 'bg-blue-100 text-[#0037B0]' : 'bg-white/15 text-blue-100'
                    }`}
                  >
                    {item.badge}
                  </span>
                ) : null}

                {isActive && <ChevronRight className="w-3.5 h-3.5 text-[#0037B0]" />}
              </div>
            </button>
          );
        })}
      </div>

      <div className="p-4 m-3 bg-black/20 border border-white/15 rounded-xl space-y-2 backdrop-blur-sm">
        <div className="flex items-center justify-between text-xs">
          <span className="text-blue-100 flex items-center gap-1.5 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-green-300" />
            Meta Commerce
          </span>
          <span
            className={`text-[10px] font-bold border px-1.5 py-0.2 rounded-full ${getMetaStatusClasses(healthScore, isLoading)}`}
          >
            {getMetaStatusLabel(healthScore, isLoading)}
          </span>
        </div>
        <div className="w-full bg-black/30 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-green-400 h-full transition-all duration-500"
            style={{ width: `${metaHealthWidth}%` }}
          />
        </div>
        <p className="text-[11px] text-blue-200">
          {metaHealthDisplay === '—'
            ? '— veículos elegíveis'
            : `${metaHealthDisplay} saudável · ${eligibleLabel}`}
        </p>
      </div>
    </aside>
  );
}
