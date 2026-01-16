import type { ComponentPreset } from '../types';

/**
 * Mantine preset - uses Mantine-style CSS variables for styling
 * Requires @mantine/core CSS variables to be available, or falls back to sensible defaults
 */
export const mantinePreset: ComponentPreset = {
  Card: ({ children, className, padding = 'md', variant = 'default' }) => {
    const paddingMap: Record<string, string> = {
      none: '0',
      sm: '12px',
      md: '16px',
      lg: '24px',
    };

    const variantStyles: Record<string, React.CSSProperties> = {
      default: {
        border: '1px solid var(--mantine-color-default-border, #e5e7eb)',
        boxShadow: 'var(--mantine-shadow-sm, 0 1px 2px rgba(0,0,0,0.05))',
      },
      outlined: {
        border: '1px solid var(--mantine-color-default-border, #e5e7eb)',
      },
      dashed: {
        border: '2px dashed var(--mantine-color-default-border, #e5e7eb)',
        backgroundColor: 'var(--mantine-color-gray-0, #f9fafb)',
      },
    };

    return (
      <div
        className={className}
        style={{
          backgroundColor: 'var(--mantine-color-body, white)',
          borderRadius: 'var(--mantine-radius-md, 8px)',
          padding: paddingMap[padding],
          ...variantStyles[variant],
        }}
      >
        {children}
      </div>
    );
  },

  Button: ({ children, onClick, disabled, loading, variant = 'primary', size = 'md', className, type = 'button' }) => {
    const sizeStyles: Record<string, React.CSSProperties> = {
      sm: { padding: '6px 12px', fontSize: '0.875rem' },
      md: { padding: '8px 16px', fontSize: '1rem' },
      lg: { padding: '12px 24px', fontSize: '1.125rem' },
    };

    const variantStyles: Record<string, React.CSSProperties> = {
      primary: {
        backgroundColor: 'var(--mantine-color-blue-6, #2563eb)',
        color: 'white',
        border: 'none',
      },
      secondary: {
        backgroundColor: 'var(--mantine-color-gray-1, #f3f4f6)',
        color: 'var(--mantine-color-dark-7, #374151)',
        border: 'none',
      },
      outline: {
        backgroundColor: 'transparent',
        color: 'var(--mantine-color-dark-7, #374151)',
        border: '1px solid var(--mantine-color-default-border, #d1d5db)',
      },
      danger: {
        backgroundColor: 'var(--mantine-color-red-6, #dc2626)',
        color: 'white',
        border: 'none',
      },
      ghost: {
        backgroundColor: 'transparent',
        color: 'var(--mantine-color-gray-6, #6b7280)',
        border: 'none',
      },
    };

    return (
      <button
        type={type}
        onClick={onClick}
        disabled={disabled || loading}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          fontWeight: 500,
          borderRadius: 'var(--mantine-radius-md, 6px)',
          cursor: disabled || loading ? 'not-allowed' : 'pointer',
          opacity: disabled || loading ? 0.5 : 1,
          transition: 'background-color 0.15s ease',
          ...sizeStyles[size],
          ...variantStyles[variant],
        }}
      >
        {loading && (
          <span
            style={{
              width: '16px',
              height: '16px',
              border: '2px solid currentColor',
              borderTopColor: 'transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}
          />
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
      className={className}
      style={{
        width: '100%',
        padding: '8px 12px',
        fontSize: '1rem',
        borderRadius: 'var(--mantine-radius-md, 6px)',
        border: `1px solid ${error ? 'var(--mantine-color-red-6, #dc2626)' : 'var(--mantine-color-default-border, #d1d5db)'}`,
        backgroundColor: 'var(--mantine-color-body, white)',
        color: 'var(--mantine-color-text, #111827)',
        outline: 'none',
      }}
    />
  ),

  Checkbox: ({ checked, onChange, label, disabled, className }) => (
    <label
      className={className}
      style={{
        display: 'inline-flex',
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
        style={{
          width: '18px',
          height: '18px',
          borderRadius: 'var(--mantine-radius-sm, 4px)',
          accentColor: 'var(--mantine-color-blue-6, #2563eb)',
        }}
      />
      {label && <span style={{ color: 'var(--mantine-color-text, #374151)' }}>{label}</span>}
    </label>
  ),

  Badge: ({ children, variant = 'default', className }) => {
    const colorMap: Record<string, { bg: string; color: string }> = {
      default: { bg: 'var(--mantine-color-gray-1, #f3f4f6)', color: 'var(--mantine-color-gray-7, #374151)' },
      success: { bg: 'var(--mantine-color-green-1, #d1fae5)', color: 'var(--mantine-color-green-7, #065f46)' },
      warning: { bg: 'var(--mantine-color-yellow-1, #fef3c7)', color: 'var(--mantine-color-yellow-7, #92400e)' },
      error: { bg: 'var(--mantine-color-red-1, #fee2e2)', color: 'var(--mantine-color-red-7, #991b1b)' },
    };

    const colors = colorMap[variant];

    return (
      <span
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: '2px 10px',
          borderRadius: '9999px',
          fontSize: '0.75rem',
          fontWeight: 500,
          backgroundColor: colors.bg,
          color: colors.color,
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
          zIndex: 200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}
          onClick={onClose}
        />
        <div
          className={className}
          style={{
            position: 'relative',
            backgroundColor: 'var(--mantine-color-body, white)',
            borderRadius: 'var(--mantine-radius-md, 8px)',
            boxShadow: 'var(--mantine-shadow-xl, 0 25px 50px -12px rgb(0 0 0 / 0.25))',
            maxWidth: '500px',
            width: '100%',
            margin: '16px',
            padding: '24px',
          }}
        >
          {title && (
            <h2
              style={{
                fontSize: '1.25rem',
                fontWeight: 600,
                marginBottom: '16px',
                margin: 0,
                color: 'var(--mantine-color-text, #111827)',
              }}
            >
              {title}
            </h2>
          )}
          {children}
        </div>
      </div>
    );
  },

  Loader: ({ size = 'md', className, color }) => {
    const sizeMap: Record<string, string> = {
      sm: '18px',
      md: '26px',
      lg: '36px',
    };

    return (
      <div
        className={className}
        style={{
          width: sizeMap[size],
          height: sizeMap[size],
          border: '3px solid var(--mantine-color-gray-3, #e5e7eb)',
          borderTopColor: color || 'var(--mantine-color-blue-6, #2563eb)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }}
      />
    );
  },

  Alert: ({ children, variant = 'info', className, icon }) => {
    const colorMap: Record<string, { bg: string; color: string; border: string }> = {
      info: {
        bg: 'var(--mantine-color-blue-0, #eff6ff)',
        color: 'var(--mantine-color-blue-7, #1e40af)',
        border: 'var(--mantine-color-blue-3, #93c5fd)',
      },
      success: {
        bg: 'var(--mantine-color-green-0, #f0fdf4)',
        color: 'var(--mantine-color-green-7, #166534)',
        border: 'var(--mantine-color-green-3, #86efac)',
      },
      warning: {
        bg: 'var(--mantine-color-yellow-0, #fffbeb)',
        color: 'var(--mantine-color-yellow-7, #a16207)',
        border: 'var(--mantine-color-yellow-3, #fde047)',
      },
      error: {
        bg: 'var(--mantine-color-red-0, #fef2f2)',
        color: 'var(--mantine-color-red-7, #b91c1c)',
        border: 'var(--mantine-color-red-3, #fca5a5)',
      },
    };

    const colors = colorMap[variant];

    return (
      <div
        className={className}
        style={{
          padding: '12px 16px',
          borderRadius: 'var(--mantine-radius-md, 6px)',
          border: `1px solid ${colors.border}`,
          backgroundColor: colors.bg,
          color: colors.color,
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
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
      xs: 'var(--mantine-spacing-xs, 4px)',
      sm: 'var(--mantine-spacing-sm, 8px)',
      md: 'var(--mantine-spacing-md, 16px)',
      lg: 'var(--mantine-spacing-lg, 24px)',
      xl: 'var(--mantine-spacing-xl, 32px)',
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
      sm: 'var(--mantine-spacing-sm, 8px)',
      md: 'var(--mantine-spacing-md, 16px)',
      lg: 'var(--mantine-spacing-lg, 24px)',
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
      h1: { fontSize: 'var(--mantine-font-size-xxxl, 2rem)' },
      h2: { fontSize: 'var(--mantine-font-size-xxl, 1.5rem)' },
      h3: { fontSize: 'var(--mantine-font-size-xl, 1.25rem)' },
      h4: { fontSize: 'var(--mantine-font-size-lg, 1.125rem)' },
      body: { fontSize: 'var(--mantine-font-size-md, 1rem)' },
      small: { fontSize: 'var(--mantine-font-size-sm, 0.875rem)' },
      caption: { fontSize: 'var(--mantine-font-size-xs, 0.75rem)' },
    };

    const colorStyles: Record<string, string> = {
      primary: 'var(--mantine-color-text, #111827)',
      secondary: 'var(--mantine-color-dimmed, #4b5563)',
      muted: 'var(--mantine-color-gray-5, #9ca3af)',
      success: 'var(--mantine-color-green-6, #059669)',
      warning: 'var(--mantine-color-yellow-6, #d97706)',
      error: 'var(--mantine-color-red-6, #dc2626)',
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
      backgroundColor: 'var(--mantine-color-gray-1, #f3f4f6)',
      color: 'var(--mantine-color-gray-5, #9ca3af)',
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
      default: {
        backgroundColor: 'transparent',
        color: 'var(--mantine-color-gray-6, #6b7280)',
        border: '1px solid var(--mantine-color-default-border, #e5e7eb)',
      },
      ghost: {
        backgroundColor: 'transparent',
        color: 'var(--mantine-color-gray-5, #9ca3af)',
        border: 'none',
      },
      danger: {
        backgroundColor: 'transparent',
        color: 'var(--mantine-color-gray-5, #9ca3af)',
        border: 'none',
      },
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
          borderRadius: 'var(--mantine-radius-md, 6px)',
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
        borderRadius: 'var(--mantine-radius-sm, 4px)',
        fontSize: 'var(--mantine-font-size-xs, 0.75rem)',
        fontFamily: 'var(--mantine-font-family-monospace, monospace)',
        backgroundColor: 'var(--mantine-color-gray-0, #f3f4f6)',
        border: '1px solid var(--mantine-color-default-border, #e5e7eb)',
        color: color || 'var(--mantine-color-text, #374151)',
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
        borderTop: '1px solid var(--mantine-color-default-border, #e5e7eb)',
        margin: '0',
      }}
    />
  ),
};
