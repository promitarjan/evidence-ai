import React from 'react';
import type { SupportLevel } from '../types';
import { CheckCircle2, AlertTriangle, XCircle, HelpCircle } from 'lucide-react';

interface StatusBadgeProps {
  level: SupportLevel;
  className?: string;
  isAccepted?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ level, className = '', isAccepted = false }) => {
  if (isAccepted) {
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300 ${className}`}>
        <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
        Resolved Citation
      </span>
    );
  }

  switch (level) {
    case 'Strong':
      return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300 ${className}`}>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          Strong Support
        </span>
      );
    case 'Partial':
      return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300 ${className}`}>
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          Needs Review / Partial
        </span>
      );
    case 'Contradictory':
      return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-900 border border-rose-300 ${className}`}>
          <XCircle className="w-3.5 h-3.5 text-rose-600" />
          Contradictory
        </span>
      );
    case 'Unsupported':
    default:
      return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200 ${className}`}>
          <HelpCircle className="w-3.5 h-3.5 text-rose-500" />
          Unsupported
        </span>
      );
  }
};
