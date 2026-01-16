import { useState, useCallback, useEffect } from 'react';
import type { IntegrationCardProps, Account, User } from '../types';
import { PLATFORM_CONFIGS, PLATFORM_PERMISSIONS, PLATFORM_COLORS } from '../types';
import { useIntegration } from '../hooks/useIntegration';
import { useIntegrationContext } from './IntegrationProvider';
import { PermissionSelector } from './PermissionSelector';
import { ApiKeyInput } from './ApiKeyInput';
import { AccountCard } from './AccountCard';
import { FeatureList } from './FeatureList';
import { isTokenExpired } from '../utils/cache';

/**
 * Full integration card - completely headless using preset components
 * All styling is delegated to the preset - no inline styles
 */
export const IntegrationCard = ({
  platform,
  preset,
  icons,
  onConnect,
  onDisconnect,
  onRefresh,
  showPermissions = true,
  showFeatures = true,
  permissionIds,
  className,
}: IntegrationCardProps) => {
  const config = PLATFORM_CONFIGS[platform];
  const platformPermissions = PLATFORM_PERMISSIONS[platform];
  const permissions =
    permissionIds && permissionIds.length > 0
      ? platformPermissions.filter((p) => p.required || permissionIds.includes(p.id))
      : platformPermissions;
  const colors = PLATFORM_COLORS[platform];
  const { services, authClient } = useIntegrationContext();
  const { accounts, loading, error, connect, disconnect, refresh } = useIntegration(platform);

  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(
    permissions.filter((p) => p.default || p.required).map((p) => p.id)
  );
  const [apiKeyError, setApiKeyError] = useState<string | undefined>();
  const [apiKeyLoading, setApiKeyLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [sessionUser, setSessionUser] = useState<User | undefined>();

  // Get session user
  useEffect(() => {
    authClient?.getSession().then((result) => {
      if (result?.data?.user) {
        setSessionUser(result.data.user);
      }
    });
  }, [authClient]);

  // If consumer changes the permission allowlist (or switches platform), reset defaults accordingly.
  useEffect(() => {
    setSelectedPermissions(permissions.filter((p) => p.default || p.required).map((p) => p.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [platform, permissionIds?.join('|')]);

  // Destructure preset components
  const { Card, Button, Flex, Text, Avatar, IconButton, Alert, Loader } = preset;

  const PlatformIcon = icons?.[
    platform === 'x' ? 'X' 
    : platform === 'reddit' ? 'Reddit' 
    : platform === 'google' ? 'Google'
    : 'DevTo'
  ];
  const RefreshIcon = icons?.RefreshCw;
  const AlertIcon = icons?.AlertCircle;

  const connected = accounts.length > 0;
  const hasExpiredTokens = accounts.some((acc) => isTokenExpired(acc));

  const handleConnect = useCallback(async () => {
    if (platform === 'devto') return;
    setActionLoading(true);
    try {
      await connect(selectedPermissions);
      onConnect?.(platform);
    } finally {
      setActionLoading(false);
    }
  }, [connect, platform, selectedPermissions, onConnect]);

  const handleDisconnect = useCallback(
    async (accountId: string) => {
      setActionLoading(true);
      try {
        await disconnect(accountId);
        onDisconnect?.(accountId);
      } finally {
        setActionLoading(false);
      }
    },
    [disconnect, onDisconnect]
  );

  const handleRefresh = useCallback(async () => {
    await refresh();
    onRefresh?.();
  }, [refresh, onRefresh]);

  const handleApiKeySubmit = useCallback(
    async (apiKey: string) => {
      setApiKeyError(undefined);
      setApiKeyLoading(true);
      try {
        await services.devto.connect(apiKey);
        await refresh();
        onConnect?.(platform);
      } catch (err) {
        setApiKeyError(err instanceof Error ? err.message : 'Failed to connect');
      } finally {
        setApiKeyLoading(false);
      }
    },
    [services.devto, refresh, onConnect, platform]
  );

  const requiredPermissions = permissions.filter((p) => p.required).map((p) => p.id);

  // Loading state
  if (loading) {
    return (
      <Card padding="lg" className={className}>
        <Flex direction="column" align="center" justify="center" gap="md">
          <Loader size="lg" color={colors.primary} />
          <Text variant="small" color="muted">
            Loading {config.name} accounts...
          </Text>
        </Flex>
      </Card>
    );
  }

  return (
    <Card padding="lg" className={className}>
      <Flex direction="column" gap="lg">
        {/* Header */}
        <Flex align="center" justify="between" gap="md">
          <Flex align="center" gap="md">
            <Avatar
              size="lg"
              fallback={PlatformIcon ? <PlatformIcon size={24} /> : null}
            />
            <Flex direction="column" gap="none">
              <Text variant="h4" weight="semibold">
                {config.name}
              </Text>
              <Text variant="small" color="muted">
                Connect your {config.name} account
              </Text>
            </Flex>
          </Flex>
          <IconButton
            onClick={handleRefresh}
            disabled={actionLoading}
            title="Refresh"
          >
            {RefreshIcon ? <RefreshIcon size={18} /> : '↻'}
          </IconButton>
        </Flex>

        {/* Error */}
        {error && (
          <Alert
            variant="error"
            icon={AlertIcon && <AlertIcon size={18} />}
          >
            {error.message}
          </Alert>
        )}

        {/* Not Connected State */}
        {!connected && (
          <Card variant="dashed" padding="lg">
            <Flex direction="column" align="center" gap="lg">
              {/* Large icon */}
              <Avatar
                size="xl"
                fallback={PlatformIcon ? <PlatformIcon size={48} /> : null}
              />

              <Flex direction="column" align="center" gap="xs">
                <Text variant="h4" weight="semibold">
                  No {config.name} Account Connected
                </Text>
                <Text variant="small" color="muted">
                  Connect your {config.name} account to{' '}
                  {platform === 'reddit'
                    ? 'manage posts and interact with communities'
                    : platform === 'x'
                    ? 'manage posts and interact with your audience'
                    : 'publish and manage your articles'}
                  .
                </Text>
              </Flex>

              {/* Permissions for OAuth platforms */}
              {showPermissions && config.authType === 'oauth' && permissions.length > 0 && (
                <PermissionSelector
                  platform={platform}
                  preset={preset}
                  permissions={permissions}
                  selected={selectedPermissions}
                  onChange={setSelectedPermissions}
                  required={requiredPermissions}
                />
              )}

              {/* API Key Input or Connect Button */}
              {platform === 'devto' ? (
                <ApiKeyInput
                  preset={preset}
                  icons={icons}
                  onSubmit={handleApiKeySubmit}
                  loading={apiKeyLoading}
                  error={apiKeyError}
                />
              ) : (
                <Button
                  onClick={handleConnect}
                  disabled={actionLoading}
                  loading={actionLoading}
                  size="lg"
                >
                  {PlatformIcon && <PlatformIcon size={16} />}
                  {sessionUser
                    ? `Link ${config.name} Account`
                    : `Connect with ${config.name}`}
                </Button>
              )}
            </Flex>
          </Card>
        )}

        {/* Connected State */}
        {connected && (
          <Flex direction="column" gap="md">
            {/* Expired Token Warning Banner */}
            {hasExpiredTokens && (
              <Alert
                variant="error"
                icon={AlertIcon && <AlertIcon size={20} />}
              >
                <Flex direction="column" gap="sm">
                  <Text variant="body" weight="semibold" color="error">
                    Session Expired
                  </Text>
                  <Text variant="small" color="error">
                    Your {config.name} session has expired. Please reconnect your account to continue
                    using {config.name} features.
                  </Text>
                  <Button
                    onClick={handleConnect}
                    disabled={actionLoading}
                    variant="danger"
                    size="sm"
                  >
                    Reconnect Account
                  </Button>
                </Flex>
              </Alert>
            )}

            {/* Accounts header */}
            <Flex align="center" justify="between">
              <Text variant="body" weight="semibold">
                Connected Accounts ({accounts.length})
              </Text>
              <Button
                onClick={handleConnect}
                disabled={actionLoading}
                variant="outline"
                size="sm"
              >
                Add Another Account
              </Button>
            </Flex>

            {/* Account cards */}
            {accounts.map((account: Account) => (
              <AccountCard
                key={account.id}
                account={account}
                platform={platform}
                preset={preset}
                icons={icons}
                sessionUser={sessionUser}
                onDisconnect={handleDisconnect}
                onReconnect={handleConnect}
                disabled={actionLoading}
                showExpiration={config.authType === 'oauth'}
              />
            ))}
          </Flex>
        )}

        {/* Features Section */}
        {showFeatures && <FeatureList platform={platform} preset={preset} icons={icons} />}
      </Flex>
    </Card>
  );
};
