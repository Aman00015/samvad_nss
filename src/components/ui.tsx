'use client';

import { clsx } from 'clsx';
import type { ReactNode } from 'react';

// ==================== STAT CARD ====================
interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: { value: number; label: string };
  color?: 'blue' | 'green' | 'red' | 'amber' | 'purple' | 'gray';
}

const COLOR_MAP = {
  blue: { bg: 'bg-blue-50', text: 'text-blue-700', icon: 'bg-blue-100 text-blue-600' },
  green: { bg: 'bg-green-50', text: 'text-green-700', icon: 'bg-green-100 text-green-600' },
  red: { bg: 'bg-red-50', text: 'text-red-700', icon: 'bg-red-100 text-red-600' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-700', icon: 'bg-amber-100 text-amber-600' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-700', icon: 'bg-purple-100 text-purple-600' },
  gray: { bg: 'bg-gray-50', text: 'text-gray-700', icon: 'bg-gray-100 text-gray-600' },
};

export function StatCard({ title, value, subtitle, icon, trend, color = 'blue' }: StatCardProps) {
  const colors = COLOR_MAP[color];

  return (
    <div className={clsx('rounded-xl p-4 border', colors.bg, 'border-opacity-50')}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{title}</p>
          <p className={clsx('text-2xl font-bold mt-1', colors.text)}>{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
          {trend && (
            <p className={clsx('text-xs mt-1', trend.value >= 0 ? 'text-green-600' : 'text-red-600')}>
              {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
            </p>
          )}
        </div>
        {icon && (
          <div className={clsx('p-2 rounded-lg', colors.icon)}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== STATUS BADGE ====================
interface StatusBadgeProps {
  status: string;
  color: string;
  bgColor: string;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, color, bgColor, size = 'sm' }: StatusBadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-full font-medium',
        size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1'
      )}
      style={{ backgroundColor: bgColor, color }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
      {status}
    </span>
  );
}

// ==================== BUTTON ====================
interface ButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  icon,
  onClick,
  type = 'button',
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-sm',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm',
    ghost: 'text-gray-600 hover:bg-gray-100 active:bg-gray-200',
  };

  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5',
    md: 'text-sm px-4 py-2',
    lg: 'text-base px-6 py-3',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={clsx(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full'
      )}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : icon ? (
        icon
      ) : null}
      {children}
    </button>
  );
}

// ==================== INPUT ====================
interface InputProps {
  label?: string;
  placeholder?: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  error?: string;
  helpText?: string;
  icon?: ReactNode;
}

export function Input({ label, placeholder, type = 'text', value, onChange, required, error, helpText, icon }: InputProps) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className={clsx(
            'w-full rounded-lg border text-sm transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500',
            icon ? 'pl-10 pr-4 py-2.5' : 'px-4 py-2.5',
            error ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
          )}
        />
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      {helpText && !error && <p className="text-xs text-gray-500">{helpText}</p>}
    </div>
  );
}

// ==================== SELECT ====================
interface SelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  required?: boolean;
}

export function Select({ label, value, onChange, options, placeholder, required }: SelectProps) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full rounded-lg border border-gray-300 bg-white text-sm px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

// ==================== TEXTAREA ====================
interface TextareaProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  rows?: number;
}

export function Textarea({ label, placeholder, value, onChange, required, rows = 4 }: TextareaProps) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        rows={rows}
        className="w-full rounded-lg border border-gray-300 bg-white text-sm px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors resize-none"
      />
    </div>
  );
}

// ==================== EMPTY STATE ====================
interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {icon && <div className="text-gray-300 mb-4">{icon}</div>}
      <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
      {description && <p className="text-sm text-gray-500 mb-4 max-w-sm">{description}</p>}
      {action}
    </div>
  );
}

// ==================== PAGE HEADER ====================
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  breadcrumb?: string;
}

export function PageHeader({ title, subtitle, action, breadcrumb }: PageHeaderProps) {
  return (
    <div className="mb-6">
      {breadcrumb && (
        <p className="text-xs text-gray-500 mb-1">{breadcrumb}</p>
      )}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        {action}
      </div>
    </div>
  );
}

// ==================== LOADING SPINNER ====================
export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <div className="flex items-center justify-center py-8">
      <div className={clsx('border-2 border-blue-600 border-t-transparent rounded-full animate-spin', sizeClasses[size])} />
    </div>
  );
}
