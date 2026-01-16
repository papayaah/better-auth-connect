import type { ComponentPreset } from '../types';

/**
 * Tailwind CSS preset - uses Tailwind utility classes for styling
 * Requires Tailwind CSS to be configured in your project
 */
export const tailwindPreset: ComponentPreset = {
  Card: ({ children, className, padding = 'md', variant = 'default' }) => {
    const paddingClasses: Record<string, string> = {
      none: '',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
    };

    const variantClasses: Record<string, string> = {
      default: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm',
      outlined: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg',
      dashed: 'bg-gray-50 dark:bg-gray-900 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg',
    };

    return (
      <div className={`${variantClasses[variant]} ${paddingClasses[padding]} ${className || ''}`}>
        {children}
      </div>
    );
  },

  Button: ({ children, onClick, disabled, loading, variant = 'primary', size = 'md', className, type = 'button' }) => {
    const baseClasses =
      'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const sizeClasses: Record<string, string> = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
    };

    const variantClasses: Record<string, string> = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
      secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
      outline:
        'border border-gray-300 dark:border-gray-600 bg-transparent text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:ring-gray-500',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
      ghost: 'bg-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:ring-gray-500',
    };

    return (
      <button
        type={type}
        onClick={onClick}
        disabled={disabled || loading}
        className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className || ''}`}
      >
        {loading && (
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  },

  TextInput: ({ value, onChange, placeholder, disabled, type = 'text', className, error }) => (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className={`w-full px-3 py-2 rounded-md border ${
        error
          ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
          : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'
      } bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed ${className || ''}`}
    />
  ),

  Checkbox: ({ checked, onChange, label, disabled, className }) => (
    <label
      className={`inline-flex items-center gap-2 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className || ''}`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2 disabled:opacity-50"
      />
      {label && <span className="text-gray-700 dark:text-gray-200">{label}</span>}
    </label>
  ),

  Badge: ({ children, variant = 'default', className }) => {
    const variantClasses: Record<string, string> = {
      default: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200',
      success: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
      warning: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
      error: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
    };

    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant]} ${className || ''}`}
      >
        {children}
      </span>
    );
  },

  Modal: ({ open, onClose, title, children, className }) => {
    if (!open) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="fixed inset-0 bg-black/50" onClick={onClose} />
        <div
          className={`relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full mx-4 p-6 ${className || ''}`}
        >
          {title && (
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{title}</h2>
          )}
          {children}
        </div>
      </div>
    );
  },

  Loader: ({ size = 'md', className, color }) => {
    const sizeClasses: Record<string, string> = {
      sm: 'w-4 h-4',
      md: 'w-6 h-6',
      lg: 'w-8 h-8',
    };

    return (
      <div
        className={`${sizeClasses[size]} border-2 border-gray-200 rounded-full animate-spin ${className || ''}`}
        style={{ borderTopColor: color || '#2563eb' }}
      />
    );
  },

  Alert: ({ children, variant = 'info', className, icon }) => {
    const variantClasses: Record<string, string> = {
      info: 'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800',
      success: 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800',
      warning: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800',
      error: 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800',
    };

    return (
      <div className={`px-4 py-3 rounded-md border flex items-start gap-3 ${variantClasses[variant]} ${className || ''}`}>
        {icon && <span className="flex-shrink-0">{icon}</span>}
        <div className="flex-1">{children}</div>
      </div>
    );
  },

  // Layout primitives
  Flex: ({ children, direction = 'row', align = 'stretch', justify = 'start', gap = 'md', wrap = false, className, onClick }) => {
    const directionClasses: Record<string, string> = {
      row: 'flex-row',
      column: 'flex-col',
    };

    const alignClasses: Record<string, string> = {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch',
    };

    const justifyClasses: Record<string, string> = {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
      around: 'justify-around',
    };

    const gapClasses: Record<string, string> = {
      none: 'gap-0',
      xs: 'gap-1',
      sm: 'gap-2',
      md: 'gap-4',
      lg: 'gap-6',
      xl: 'gap-8',
    };

    return (
      <div
        className={`flex ${directionClasses[direction]} ${alignClasses[align]} ${justifyClasses[justify]} ${gapClasses[gap]} ${wrap ? 'flex-wrap' : ''} ${className || ''}`}
        onClick={onClick}
      >
        {children}
      </div>
    );
  },

  Grid: ({ children, cols = 2, gap = 'md', className }) => {
    const colClasses: Record<string | number, string> = {
      1: 'grid-cols-1',
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
      auto: 'grid-cols-[repeat(auto-fit,minmax(280px,1fr))]',
    };

    const gapClasses: Record<string, string> = {
      none: 'gap-0',
      sm: 'gap-2',
      md: 'gap-4',
      lg: 'gap-6',
    };

    return (
      <div className={`grid ${colClasses[cols]} ${gapClasses[gap]} ${className || ''}`}>
        {children}
      </div>
    );
  },

  Text: ({ children, variant = 'body', color = 'primary', weight = 'normal', className, as }) => {
    const variantClasses: Record<string, string> = {
      h1: 'text-3xl',
      h2: 'text-2xl',
      h3: 'text-xl',
      h4: 'text-lg',
      body: 'text-base',
      small: 'text-sm',
      caption: 'text-xs',
    };

    const colorClasses: Record<string, string> = {
      primary: 'text-gray-900 dark:text-white',
      secondary: 'text-gray-700 dark:text-gray-300',
      muted: 'text-gray-500 dark:text-gray-400',
      success: 'text-green-600 dark:text-green-400',
      warning: 'text-yellow-600 dark:text-yellow-400',
      error: 'text-red-600 dark:text-red-400',
    };

    const weightClasses: Record<string, string> = {
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold',
    };

    const Component = as || (variant.startsWith('h') ? variant as 'h1' | 'h2' | 'h3' | 'h4' : 'p');

    return (
      <Component className={`${variantClasses[variant]} ${colorClasses[color]} ${weightClasses[weight]} ${className || ''}`}>
        {children}
      </Component>
    );
  },

  Avatar: ({ src, alt, fallback, size = 'md', className }) => {
    const sizeClasses: Record<string, string> = {
      sm: 'w-8 h-8',
      md: 'w-10 h-10',
      lg: 'w-12 h-12',
      xl: 'w-20 h-20',
    };

    if (src) {
      return (
        <img
          src={src}
          alt={alt || ''}
          className={`${sizeClasses[size]} rounded-full object-cover bg-gray-100 dark:bg-gray-700 ${className || ''}`}
        />
      );
    }

    return (
      <div
        className={`${sizeClasses[size]} rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 ${className || ''}`}
      >
        {fallback}
      </div>
    );
  },

  IconButton: ({ children, onClick, disabled, variant = 'default', size = 'md', title, className }) => {
    const sizeClasses: Record<string, string> = {
      sm: 'p-1.5',
      md: 'p-2',
      lg: 'p-3',
    };

    const variantClasses: Record<string, string> = {
      default: 'bg-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-200',
      ghost: 'bg-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300',
      danger: 'bg-transparent text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20',
    };

    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        title={title}
        className={`rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center ${sizeClasses[size]} ${variantClasses[variant]} ${className || ''}`}
      >
        {children}
      </button>
    );
  },

  Code: ({ children, color, className }) => (
    <code
      className={`px-1.5 py-0.5 rounded text-xs font-mono bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 ${className || ''}`}
      style={color ? { color } : undefined}
    >
      {children}
    </code>
  ),

  Divider: ({ className }) => (
    <hr className={`border-gray-200 dark:border-gray-700 ${className || ''}`} />
  ),
};
