import { useState } from 'react';
import type { ApiKeyInputProps } from '../types';

export const ApiKeyInput = ({
  preset,
  icons,
  onSubmit,
  loading = false,
  error,
}: ApiKeyInputProps) => {
  const [apiKey, setApiKey] = useState('');
  const KeyIcon = icons?.Key;

  const handleSubmit = async () => {
    if (!apiKey.trim()) return;
    await onSubmit(apiKey.trim());
    setApiKey('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {KeyIcon && <KeyIcon size={16} />}
        <span style={{ fontWeight: 500 }}>API Key</span>
      </div>
      {preset.TextInput({
        value: apiKey,
        onChange: setApiKey,
        placeholder: 'Enter your API key',
        type: 'password',
        disabled: loading,
        error,
      })}
      {error &&
        preset.Alert({
          variant: 'error',
          children: error,
        })}
      {preset.Button({
        onClick: handleSubmit,
        disabled: !apiKey.trim() || loading,
        loading,
        variant: 'primary',
        children: 'Connect',
      })}
      <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
        You can find your API key in your Dev.to settings under{' '}
        <a
          href="https://dev.to/settings/extensions"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#3b82f6', textDecoration: 'underline' }}
        >
          Extensions
        </a>
      </div>
    </div>
  );
};
