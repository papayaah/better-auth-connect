import { useState, useEffect } from 'react';
import type { AccountCardProps } from '../types';
import { PLATFORM_CONFIGS } from '../types';
import { isTokenExpired, isTokenExpiringSoon } from '../utils/cache';

/**
 * Format a date for display
 */
const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Calculate and format time remaining until token expiration
 */
const getTimeRemaining = (expiresAt: Date | string | null | undefined): string => {
  if (!expiresAt) return '';

  const expiry = new Date(expiresAt);
  const now = new Date();
  const remaining = expiry.getTime() - now.getTime();

  if (remaining <= 0) return 'Expired';

  const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

/**
 * Expandable account card - completely headless using preset components
 * Shows avatar, username, connection status, time remaining
 * Expands to show token details and refresh token status
 */
export const AccountCard = ({
  account,
  platform,
  preset,
  icons,
  sessionUser,
  onDisconnect,
  onReconnect,
  disabled = false,
  showExpiration = true,
  expandable = true,
}: AccountCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(() =>
    getTimeRemaining(account.accessTokenExpiresAt)
  );

  const isExpired = isTokenExpired(account);
  const isExpiringSoon = isTokenExpiringSoon(account);
  const config = PLATFORM_CONFIGS[platform];

  // Destructure preset components
  const { Card, Button, Flex, Text, Avatar, IconButton, Alert, Badge, Code } = preset;

  // Get icons
  const PlatformIcon = icons?.[platform === 'x' ? 'X' : platform === 'reddit' ? 'Reddit' : 'DevTo'];
  const CheckIcon = icons?.Check;
  const AlertIcon = icons?.AlertCircle;
  const TrashIcon = icons?.Trash2;

  // Update time remaining every minute
  useEffect(() => {
    const updateTimeRemaining = () => {
      setTimeRemaining(getTimeRemaining(account.accessTokenExpiresAt));
    };

    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 60000);
    return () => clearInterval(interval);
  }, [account.accessTokenExpiresAt]);

  const getDisplayName = () => {
    if ('username' in account && account.username) {
      return account.username;
    }
    if (sessionUser?.name) {
      return sessionUser.name;
    }
    return `${config.name} User`;
  };

  const getAvatarUrl = () => {
    if ('profileImageUrl' in account && account.profileImageUrl) {
      return account.profileImageUrl;
    }
    return sessionUser?.image;
  };

  const avatarUrl = getAvatarUrl();

  const getStatusBadge = () => {
    if (isExpired || timeRemaining === 'Expired') {
      return (
        <Badge variant="error">
          <Flex align="center" gap="xs">
            {AlertIcon && <AlertIcon size={12} />}
            Session Expired
          </Flex>
        </Badge>
      );
    }
    if (isExpiringSoon) {
      return (
        <Badge variant="warning">
          <Flex align="center" gap="xs">
            {AlertIcon && <AlertIcon size={12} />}
            Expires in {timeRemaining}
          </Flex>
        </Badge>
      );
    }
    return (
      <Badge variant="success">
        <Flex align="center" gap="xs">
          {CheckIcon && <CheckIcon size={12} />}
          Connected
          {timeRemaining && <Text variant="caption" color="muted" as="span">({timeRemaining})</Text>}
        </Flex>
      </Badge>
    );
  };

  return (
    <Card variant="outlined" padding="none">
      {/* Main row - always visible */}
      <Flex
        align="center"
        justify="between"
        gap="md"
        className={expandable ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 p-4' : 'p-4'}
        onClick={() => expandable && setExpanded(!expanded)}
      >
        <Flex align="center" gap="md">
          {/* Avatar */}
          <Avatar
            src={avatarUrl}
            alt={getDisplayName()}
            size="md"
            fallback={PlatformIcon ? <PlatformIcon size={20} /> : null}
          />

          {/* Name and status */}
          <Flex direction="column" gap="none">
            <Text variant="body" weight="medium">
              {getDisplayName()}
            </Text>
            <Flex align="center" gap="sm">
              <Code>
                ID: {account.accountId?.slice(0, 8)}...
              </Code>
              {showExpiration && getStatusBadge()}
            </Flex>
          </Flex>
        </Flex>

        {/* Actions */}
        <Flex align="center" gap="sm">
          {(isExpired || timeRemaining === 'Expired') && onReconnect && (
            <Button
              onClick={() => onReconnect()}
              disabled={disabled}
              size="sm"
            >
              Reconnect
            </Button>
          )}
          <IconButton
            onClick={() => onDisconnect(account.id)}
            disabled={disabled}
            variant="danger"
            title="Disconnect account"
          >
            {TrashIcon ? <TrashIcon size={16} /> : '×'}
          </IconButton>
        </Flex>
      </Flex>

      {/* Expanded details */}
      {expandable && expanded && (
        <Flex direction="column" gap="md" className="p-4 pt-0">
          {/* Token Expiration Info */}
          {account.accessTokenExpiresAt && (
            <Alert
              variant={
                timeRemaining === 'Expired'
                  ? 'error'
                  : isExpiringSoon
                  ? 'warning'
                  : 'info'
              }
              icon={AlertIcon && <AlertIcon size={16} />}
            >
              <Flex direction="column" gap="xs">
                <Text variant="small" weight="semibold">
                  Access Token Expiration
                </Text>
                {timeRemaining === 'Expired' ? (
                  <>
                    <Text variant="small" weight="medium">
                      Token has expired
                    </Text>
                    <Text variant="caption" color="muted">
                      Reconnect your account to continue using {config.name} features.
                    </Text>
                  </>
                ) : (
                  <>
                    <Text variant="small" weight="medium">
                      Expires in: {timeRemaining}
                    </Text>
                    <Text variant="caption" color="muted">
                      Expires on: {formatDate(account.accessTokenExpiresAt)}
                    </Text>
                    {account.refreshToken && (
                      <Flex align="center" gap="xs">
                        {CheckIcon && <CheckIcon size={12} />}
                        <Text variant="caption" color="success">
                          Auto-refresh enabled (refresh token valid)
                        </Text>
                      </Flex>
                    )}
                  </>
                )}
              </Flex>
            </Alert>
          )}

          {/* Additional Info */}
          <Text variant="caption" color="muted">
            {account.accessToken === 'hidden'
              ? 'Session is active. Token details are managed securely.'
              : account.refreshToken
              ? `${config.name} access tokens are automatically refreshed. Automatic token refresh is enabled.`
              : `${config.name} access token will expire. Reconnect with "Stay connected" enabled to get a refresh token for automatic renewal.`}
          </Text>
        </Flex>
      )}
    </Card>
  );
};

// Re-export the old interface for backwards compatibility
export type { AccountCardProps };
