import { X } from 'lucide-react';
import { useEffect } from 'react';

// Status badge
export function StatusBadge({ status }) {
  const map = {
    TODO:    { cls: 'bg-ink-800 text-ink-400 border border-ink-700', dot: 'bg-ink-500', label: 'To Do' },
    WIP:     { cls: 'bg-blue-500/10 text-blue-400 border border-blue-500/20', dot: 'bg-blue-400', label: 'In Progress' },
    DONE:    { cls: 'bg-volt-500/10 text-volt-400 border border-volt-500/20', dot: 'bg-volt-500', label: 'Done' },
    OVERDUE: { cls: 'bg-coral-500/10 text-coral-400 border border-coral-500/20', dot: 'bg-coral-400', label: 'Overdue' },
  };
  const s = map[status] || map.TODO;
  return (
    <span className={`status-badge ${s.cls}`}>
      <span className={`priority-dot ${s.dot}`} />
      {s.label}
    </span>
  );
}

// Priority badge
export function PriorityBadge({ priority }) {
  const map = {
    high:   { cls: 'text-coral-400', dot: 'bg-coral-400', label: 'High' },
    medium: { cls: 'text-amber-400', dot: 'bg-amber-400', label: 'Medium' },
    low:    { cls: 'text-ink-400', dot: 'bg-ink-500', label: 'Low' },
  };
  const p = map[priority] || map.low;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-mono font-medium ${p.cls}`}>
      <span className={`priority-dot ${p.dot}`} />
      {p.label}
    </span>
  );
}

// Spinner
export function Spinner({ size = 'md' }) {
  const sz = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' }[size];
  return (
    <svg className={`${sz} animate-spin text-volt-500`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  );
}

// Modal
export function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink-950/80 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative glass-card w-full ${sizes[size]} animate-slide-up shadow-2xl shadow-ink-950`}>
        <div className="flex items-center justify-between p-6 border-b border-ink-800">
          <h2 className="text-lg font-bold text-ink-50">{title}</h2>
          <button onClick={onClose} className="btn-ghost p-1.5 rounded-lg">
            <X size={18} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// Empty state
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-ink-800/60 flex items-center justify-center mb-4">
        <Icon size={28} className="text-ink-500" />
      </div>
      <h3 className="text-base font-semibold text-ink-300 mb-1">{title}</h3>
      <p className="text-sm text-ink-500 mb-6 max-w-xs">{description}</p>
      {action}
    </div>
  );
}

// Confirm dialog
export function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, danger = false }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className="text-ink-400 text-sm mb-6">{message}</p>
      <div className="flex gap-3 justify-end">
        <button onClick={onClose} className="btn-secondary">Cancel</button>
        <button
          onClick={() => { onConfirm(); onClose(); }}
          className={danger ? 'btn-danger px-5 py-2.5 font-semibold' : 'btn-primary'}
        >
          Confirm
        </button>
      </div>
    </Modal>
  );
}

// Select dropdown
export function Select({ label, value, onChange, options, className = '' }) {
  return (
    <div className={className}>
      {label && <label className="label">{label}</label>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input-field appearance-none cursor-pointer"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}
