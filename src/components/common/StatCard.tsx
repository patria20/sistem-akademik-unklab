import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
    text?: string;
  };
  badge?: string;
  badgeColor?: string;
  footer?: React.ReactNode;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = 'text-blue-600',
  iconBg = 'bg-blue-50',
  trend,
  badge,
  badgeColor = 'bg-blue-100 text-blue-700',
  footer,
}) => {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className={`w-11 h-11 rounded-xl ${iconBg} ${iconColor} flex items-center justify-center shrink-0`}>
            <Icon className="w-5 h-5" />
          </div>
          {badge && (
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${badgeColor}`}>
              {badge}
            </span>
          )}
        </div>

        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{title}</p>
        <p className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-1">{value}</p>

        {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}

        {trend && (
          <div className="flex items-center gap-1.5 mt-2 text-xs">
            <span
              className={`font-semibold ${
                trend.isPositive ? 'text-emerald-600' : 'text-amber-600'
              }`}
            >
              {trend.value}
            </span>
            {trend.text && <span className="text-slate-400">{trend.text}</span>}
          </div>
        )}
      </div>

      {footer && <div className="mt-4 pt-3 border-t border-slate-100">{footer}</div>}
    </div>
  );
};
