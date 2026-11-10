import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const normalized = status.toLowerCase();

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  switch (normalized) {
    case 'approved':
    case 'disetujui':
    case 'aman':
    case 'hadir':
    case 'completed':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 ${sizeClasses}`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          {status === 'approved' ? 'Disetujui' : status.toUpperCase()}
        </span>
      );

    case 'submitted':
    case 'menunggu':
    case 'waiting':
    case 'pending':
    case 'peringatan':
    case 'sakit':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full font-semibold bg-amber-50 text-amber-700 border border-amber-200 ${sizeClasses}`}
        >
          <Clock className="w-3.5 h-3.5" />
          {status === 'submitted' ? 'Menunggu Persetujuan' : status.toUpperCase()}
        </span>
      );

    case 'revision':
    case 'perlu revisi':
    case 'kritis':
    case 'alpa':
    case 'rejected':
    case 'ditolak':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full font-semibold bg-red-50 text-red-700 border border-red-200 ${sizeClasses}`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          {status === 'revision' ? 'Perlu Revisi' : status.toUpperCase()}
        </span>
      );

    case 'izin':
    case 'scheduled':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full font-semibold bg-blue-50 text-blue-700 border border-blue-200 ${sizeClasses}`}
        >
          <Clock className="w-3.5 h-3.5" />
          {status.toUpperCase()}
        </span>
      );

    case 'draft':
    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full font-semibold bg-slate-100 text-slate-700 border border-slate-200 ${sizeClasses}`}
        >
          <Clock className="w-3.5 h-3.5" />
          DRAFT
        </span>
      );
  }
};
