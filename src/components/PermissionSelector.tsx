import type { PermissionSelectorProps, Platform, ComponentPreset, Permission } from '../types';
import { PLATFORM_COLORS } from '../types';

export interface PermissionItemProps {
  permission: Permission;
  checked: boolean;
  disabled?: boolean;
  onChange?: () => void;
  platform: Platform;
  preset: ComponentPreset;
}

/**
 * Individual permission item with checkbox, label, and description
 * Renders as a card-like element in the permission grid
 */
export const PermissionItem = ({
  permission,
  checked,
  disabled = false,
  onChange,
  platform,
  preset,
}: PermissionItemProps) => {
  const colors = PLATFORM_COLORS[platform];

  return (
    <label
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        padding: '12px',
        backgroundColor: 'var(--bac-bg-secondary, #f9fafb)',
        border: '1px solid var(--bac-border, #e5e7eb)',
        borderRadius: '8px',
        cursor: disabled ? 'default' : 'pointer',
        transition: 'all 0.15s ease',
        opacity: disabled ? 0.7 : 1,
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.borderColor = colors.primary;
          e.currentTarget.style.backgroundColor = colors.bg;
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--bac-border, #e5e7eb)';
        e.currentTarget.style.backgroundColor = 'var(--bac-bg-secondary, #f9fafb)';
      }}
    >
      {preset.Checkbox({
        checked,
        onChange: (val: boolean) => {
          void val;
          if (!disabled && onChange) onChange();
        },
        disabled,
      })}
      <div style={{ flex: 1 }}>
        <strong
          style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: 600,
            color: 'var(--bac-text-primary, #111827)',
            marginBottom: '4px',
          }}
        >
          {permission.label}
        </strong>
        <small
          style={{
            display: 'block',
            fontSize: '0.75rem',
            color: 'var(--bac-text-secondary, #6b7280)',
            lineHeight: 1.4,
          }}
        >
          {permission.description}
        </small>
      </div>
    </label>
  );
};

/**
 * Grid-based permission selector matching v2 design
 * Displays permissions in a 2-column grid with toggles for each
 */
export const PermissionSelector = ({
  platform,
  preset,
  permissions,
  selected,
  onChange,
  required = [],
}: PermissionSelectorProps) => {
  const handleToggle = (permissionId: string) => {
    // Check both the explicit required array and the permission's required flag
    const permission = permissions.find((p) => p.id === permissionId);
    if (required.includes(permissionId) || permission?.required) {
      return; // Can't toggle required permissions
    }

    if (selected.includes(permissionId)) {
      onChange(selected.filter((id) => id !== permissionId));
    } else {
      onChange([...selected, permissionId]);
    }
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--bac-bg-primary, #ffffff)',
        border: '1px solid var(--bac-border, #e5e7eb)',
        borderRadius: '12px',
        padding: '24px',
        textAlign: 'left',
      }}
    >
      <h5
        style={{
          fontSize: '1rem',
          fontWeight: 600,
          color: 'var(--bac-text-primary, #111827)',
          marginBottom: '8px',
          margin: 0,
        }}
      >
        {platform === 'reddit' ? 'Reddit' : platform === 'x' ? 'X' : platform === 'google' ? 'Google' : 'Dev.to'} Permissions
      </h5>
      <p
        style={{
          fontSize: '0.875rem',
          color: 'var(--bac-text-secondary, #6b7280)',
          marginBottom: '20px',
          margin: '8px 0 20px 0',
        }}
      >
        Choose which permissions to grant to the app. Recommended: All permissions for full functionality.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px',
        }}
      >
        {permissions.map((permission) => {
          const isRequired = required.includes(permission.id) || permission.required;
          const isChecked = selected.includes(permission.id);

          return (
            <PermissionItem
              key={permission.id}
              permission={permission}
              checked={isChecked}
              disabled={isRequired}
              onChange={() => handleToggle(permission.id)}
              platform={platform}
              preset={preset}
            />
          );
        })}
      </div>

      {(platform === 'reddit' || platform === 'x') && (
        <div
          style={{
            marginTop: '16px',
            padding: '12px',
            backgroundColor: 'rgba(234, 179, 8, 0.1)',
            border: '1px solid rgba(234, 179, 8, 0.3)',
            borderRadius: '8px',
            fontSize: '0.875rem',
            color: '#92400e',
          }}
        >
          <strong>⚠️ Important:</strong> When connecting, make sure to grant all permissions including "
          {platform === 'reddit' ? 'submit' : 'Write Tweets'}" to enable{' '}
          {platform === 'reddit' ? 'replying to posts and comments' : 'posting content'}.
        </div>
      )}
    </div>
  );
};
