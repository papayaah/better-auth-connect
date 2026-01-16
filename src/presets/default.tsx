import type { ComponentPreset } from '../types';

/**
 * Default unstyled preset - provides minimal structure without external dependencies
 * Use this as a base for creating custom presets or when you want full control over styling
 */
export const defaultPreset: ComponentPreset = {
  Card: ({ children, className, padding = 'md', variant = 'default' }) => {
    const paddingStyles: Record<string, string> = {
      none: '0',
      sm: '12px',
      md: '16px',
      lg: '24px',
    };

    const variantStyles: Record<string, React.CSSProperties> = {
      default: { border: '1px solid #e5e7eb', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' },
      outlined: { border: '1px solid #e5e7eb' },
      dashed: { border: '2px dashed #e5e7eb', backgroundColor: '#f9fafb' },
    };

    return (
      <div
        className={className}
        style={{
          borderRadius: '8px',
          padding: paddingStyles[padding],
          ...variantStyles[variant],
        }}
      >
        {children}
      </div>
    );
  },

  Button: ({ children, onClick, disabled, loading, variant = 'primary', size = 'md', className, type = 'button' }) => {
    const baseStyles: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      borderRadius: '6px',
      fontWeight: 500,
      cursor: disabled || loading ? 'not-allowed' : 'pointer',
      opacity: disabled || loading ? 0.5 : 1,
      border: 'none',
      transition: 'all 0.2s',
    };

    const sizeStyles: Record<string, React.CSSProperties> = {
      sm: { padding: '6px 12px', fontSize: '0.875rem' },
      md: { padding: '8px 16px', fontSize: '1rem' },
      lg: { padding: '12px 24px', fontSize: '1.125rem' },
    };

    const variantStyles: Record<string, React.CSSProperties> = {
      primary: { backgroundColor: '#3b82f6', color: 'white' },
      secondary: { backgroundColor: '#6b7280', color: 'white' },
      outline: { backgroundColor: 'transparent', color: '#374151', border: '1px solid #d1d5db' },
      danger: { backgroundColor: '#ef4444', color: 'white' },
      ghost: { backgroundColor: 'transparent', color: '#6b7280' },
    };

    return (
      <button
        type={type}
        onClick={onClick}
        disabled={disabled || loading}
        className={className}
        style={{ ...baseStyles, ...sizeStyles[size], ...variantStyles[variant] }}
      >
        {loading && <span style={{ animation: 'spin 1s linear infinite' }}>⟳</span>}
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
      className={className}
      style={{
        width: '100%',
        padding: '8px 12px',
        borderRadius: '6px',
        border: `1px solid ${error ? '#ef4444' : '#d1d5db'}`,
        fontSize: '1rem',
        outline: 'none',
      }}
    />
  ),

  Checkbox: ({ checked, onChange, label, disabled, className }) => (
    <label
      className={className}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        style={{ width: '16px', height: '16px' }}
      />
      {label && <span>{label}</span>}
    </label>
  ),

  Badge: ({ children, variant = 'default', className }) => {
    const variantStyles: Record<string, React.CSSProperties> = {
      default: { backgroundColor: '#e5e7eb', color: '#374151' },
      success: { backgroundColor: '#d1fae5', color: '#065f46' },
      warning: { backgroundColor: '#fef3c7', color: '#92400e' },
      error: { backgroundColor: '#fee2e2', color: '#991b1b' },
    };

    return (
      <span
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: '2px 8px',
          borderRadius: '9999px',
          fontSize: '0.75rem',
          fontWeight: 500,
          ...variantStyles[variant],
        }}
      >
        {children}
      </span>
    );
  },

  Modal: ({ open, onClose, title, children, className }) => {
    if (!open) return null;

    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
        }}
        onClick={onClose}
      >
        <div
          className={className}
          style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '24px',
            maxWidth: '500px',
            width: '100%',
            margin: '16px',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {title && (
            <div style={{ fontWeight: 600, fontSize: '1.25rem', marginBottom: '16px' }}>{title}</div>
          )}
          {children}
        </div>
      </div>
    );
  },

  Loader: ({ size = 'md', className, color }) => {
    const sizes: Record<string, string> = {
      sm: '16px',
      md: '24px',
      lg: '32px',
    };

    return (
      <div
        className={className}
        style={{
          width: sizes[size],
          height: sizes[size],
          border: '2px solid #e5e7eb',
          borderTopColor: color || '#3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }}
      />
    );
  },

  Alert: ({ children, variant = 'info', className, icon }) => {
    const variantStyles: Record<string, React.CSSProperties> = {
      info: { backgroundColor: '#eff6ff', color: '#1e40af', borderColor: '#bfdbfe' },
      success: { backgroundColor: '#f0fdf4', color: '#166534', borderColor: '#bbf7d0' },
      warning: { backgroundColor: '#fffbeb', color: '#92400e', borderColor: '#fde68a' },
      error: { backgroundColor: '#fef2f2', color: '#991b1b', borderColor: '#fecaca' },
    };

    return (
      <div
        className={className}
        style={{
          padding: '12px 16px',
          borderRadius: '6px',
          border: '1px solid',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
          ...variantStyles[variant],
        }}
      >
        {icon && <span style={{ flexShrink: 0 }}>{icon}</span>}
        <div style={{ flex: 1 }}>{children}</div>
      </div>
    );
  },

  // Layout primitives
  Flex: ({ children, direction = 'row', align = 'stretch', justify = 'start', gap = 'md', wrap = false, className, onClick }) => {
    const gapSizes: Record<string, string> = {
      none: '0',
      xs: '4px',
      sm: '8px',
      md: '16px',
      lg: '24px',
      xl: '32px',
    };

    const alignMap: Record<string, string> = {
      start: 'flex-start',
      center: 'center',
      end: 'flex-end',
      stretch: 'stretch',
    };

    const justifyMap: Record<string, string> = {
      start: 'flex-start',
      center: 'center',
      end: 'flex-end',
      between: 'space-between',
      around: 'space-around',
    };

    return (
      <div
        className={className}
        onClick={onClick}
        style={{
          display: 'flex',
          flexDirection: direction,
          alignItems: alignMap[align],
          justifyContent: justifyMap[justify],
          gap: gapSizes[gap],
          flexWrap: wrap ? 'wrap' : 'nowrap',
        }}
      >
        {children}
      </div>
    );
  },

  Grid: ({ children, cols = 2, gap = 'md', className }) => {
    const gapSizes: Record<string, string> = {
      none: '0',
      sm: '8px',
      md: '16px',
      lg: '24px',
    };

    const colsValue = cols === 'auto' ? 'repeat(auto-fit, minmax(280px, 1fr))' : `repeat(${cols}, 1fr)`;

    return (
      <div
        className={className}
        style={{
          display: 'grid',
          gridTemplateColumns: colsValue,
          gap: gapSizes[gap],
        }}
      >
        {children}
      </div>
    );
  },

  Text: ({ children, variant = 'body', color = 'primary', weight = 'normal', className, as }) => {
    const variantStyles: Record<string, React.CSSProperties> = {
      h1: { fontSize: '2rem' },
      h2: { fontSize: '1.5rem' },
      h3: { fontSize: '1.25rem' },
      h4: { fontSize: '1.125rem' },
      body: { fontSize: '1rem' },
      small: { fontSize: '0.875rem' },
      caption: { fontSize: '0.75rem' },
    };

    const colorStyles: Record<string, string> = {
      primary: '#111827',
      secondary: '#4b5563',
      muted: '#9ca3af',
      success: '#059669',
      warning: '#d97706',
      error: '#dc2626',
    };

    const weightStyles: Record<string, number> = {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    };

    const Component = as || (variant.startsWith('h') ? variant as 'h1' | 'h2' | 'h3' | 'h4' : 'p');

    return (
      <Component
        className={className}
        style={{
          margin: 0,
          color: colorStyles[color],
          fontWeight: weightStyles[weight],
          ...variantStyles[variant],
        }}
      >
        {children}
      </Component>
    );
  },

  Avatar: ({ src, alt, fallback, size = 'md', className }) => {
    const sizes: Record<string, string> = {
      sm: '32px',
      md: '40px',
      lg: '48px',
      xl: '80px',
    };

    const baseStyles: React.CSSProperties = {
      width: sizes[size],
      height: sizes[size],
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f3f4f6',
      color: '#9ca3af',
      overflow: 'hidden',
    };

    if (src) {
      return (
        <img
          src={src}
          alt={alt || ''}
          className={className}
          style={{ ...baseStyles, objectFit: 'cover' }}
        />
      );
    }

    return (
      <div className={className} style={baseStyles}>
        {fallback}
      </div>
    );
  },

  IconButton: ({ children, onClick, disabled, variant = 'default', size = 'md', title, className }) => {
    const sizes: Record<string, string> = {
      sm: '28px',
      md: '36px',
      lg: '44px',
    };

    const variantStyles: Record<string, React.CSSProperties> = {
      default: { backgroundColor: 'transparent', color: '#6b7280' },
      ghost: { backgroundColor: 'transparent', color: '#9ca3af' },
      danger: { backgroundColor: 'transparent', color: '#9ca3af' },
    };

    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        title={title}
        className={className}
        style={{
          width: sizes[size],
          height: sizes[size],
          border: '1px solid #e5e7eb',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
          transition: 'all 0.15s',
          ...variantStyles[variant],
        }}
      >
        {children}
      </button>
    );
  },

  Code: ({ children, color, className }) => (
    <code
      className={className}
      style={{
        padding: '2px 6px',
        borderRadius: '4px',
        fontSize: '0.75rem',
        fontFamily: 'monospace',
        backgroundColor: '#f3f4f6',
        border: '1px solid #e5e7eb',
        color: color || '#374151',
      }}
    >
      {children}
    </code>
  ),

  Divider: ({ className }) => (
    <hr
      className={className}
      style={{
        border: 'none',
        borderTop: '1px solid #e5e7eb',
        margin: '0',
      }}
    />
  ),
};
