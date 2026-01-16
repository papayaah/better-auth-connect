import type { ConnectButtonProps } from '../types';
import { PLATFORM_CONFIGS } from '../types';

export const ConnectButton = ({
  platform,
  preset,
  icons,
  loading = false,
  disabled = false,
  onClick,
  variant = 'primary',
}: ConnectButtonProps) => {
  const config = PLATFORM_CONFIGS[platform];
  const Icon = icons?.[platform === 'x' ? 'X' : platform === 'reddit' ? 'Reddit' : 'DevTo'];

  return preset.Button({
    onClick,
    disabled: disabled || loading,
    loading,
    variant,
    children: (
      <>
        {Icon && <Icon size={16} />}
        <span>Connect {config.name}</span>
      </>
    ),
  });
};
