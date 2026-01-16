import type { AccountListProps } from '../types';
import { AccountCard } from './AccountCard';

export const AccountList = ({
  platform,
  preset,
  icons,
  accounts,
  onDisconnect,
  onReconnect,
  showExpiration = true,
}: AccountListProps) => {
  const RefreshIcon = icons?.RefreshCw;

  if (accounts.length === 0) {
    return preset.Alert({
      variant: 'info',
      children: 'No accounts connected',
    });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontWeight: 500 }}>
          {accounts.length} account{accounts.length !== 1 ? 's' : ''} connected
        </span>
        {preset.Button({
          variant: 'outline',
          size: 'sm',
          onClick: onReconnect,
          children: (
            <>
              {RefreshIcon && <RefreshIcon size={14} />}
              <span>Refresh</span>
            </>
          ),
        })}
      </div>
      {accounts.map((account) => (
        <AccountCard
          key={account.id}
          account={account}
          platform={platform}
          preset={preset}
          icons={icons}
          onDisconnect={onDisconnect}
          showExpiration={showExpiration}
        />
      ))}
    </div>
  );
};
