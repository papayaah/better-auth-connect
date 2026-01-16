// ============================================================================
// @reactkits.dev/better-auth-connect
// Headless React library for connecting OAuth and API key accounts with better-auth
// ============================================================================

// Types
export type {
  // Platform types
  Platform,
  AuthType,
  PlatformConfig,
  // Account types
  BaseAccount,
  RedditAccount,
  XAccount,
  DevToAccount,
  GoogleAccount,
  Account,
  // Permission types
  Permission,
  // Session types
  User,
  Session,
  // Component preset types
  CardProps,
  ButtonProps,
  TextInputProps,
  CheckboxProps,
  BadgeProps,
  ModalProps,
  LoaderProps,
  AlertProps,
  FlexProps,
  GridProps,
  TextProps,
  AvatarProps,
  IconButtonProps,
  CodeProps,
  DividerProps,
  ComponentPreset,
  // Icon types
  IconProps,
  IconSet,
  // Provider types
  AuthClient,
  CacheConfig,
  IntegrationProviderConfig,
  // Component prop types
  IntegrationCardProps,
  AccountListProps,
  AccountCardProps,
  ConnectButtonProps,
  PermissionSelectorProps,
  ApiKeyInputProps,
  // Feature types
  PlatformFeature,
  // Hook return types
  UseIntegrationReturn,
  UseAccountsReturn,
  UseAuthSessionReturn,
} from './types';

// Constants
export {
  PLATFORM_CONFIGS,
  REDDIT_PERMISSIONS,
  X_PERMISSIONS,
  DEVTO_PERMISSIONS,
  GOOGLE_PERMISSIONS,
  PLATFORM_PERMISSIONS,
  PLATFORM_FEATURES,
  PLATFORM_COLORS,
} from './types';

// Components
export {
  IntegrationProvider,
  useIntegrationContext,
  type IntegrationProviderProps,
} from './components/IntegrationProvider';
export { IntegrationCard } from './components/IntegrationCard';
export { ConnectButton } from './components/ConnectButton';
export { AccountCard } from './components/AccountCard';
export { AccountList } from './components/AccountList';
export { PermissionSelector, PermissionItem, type PermissionItemProps } from './components/PermissionSelector';
export { ApiKeyInput } from './components/ApiKeyInput';
export { FeatureList, type FeatureListProps } from './components/FeatureList';

// Hooks
export { useIntegration } from './hooks/useIntegration';
export { useAccounts } from './hooks/useAccounts';
export { useAuthSession } from './hooks/useAuthSession';

// Services
export {
  createRedditAuthService,
  initRedditAuthService,
  getRedditAuthService,
  type RedditAuthServiceConfig,
} from './services/reddit/auth';
export type { RedditUser, RedditSubreddit, RedditPost, RedditFlair } from './services/reddit/types';

export {
  createXAuthService,
  initXAuthService,
  getXAuthService,
  type XAuthServiceConfig,
} from './services/x/auth';
export type { XUser, XTweet, XMedia } from './services/x/types';

export {
  createDevToAuthService,
  initDevToAuthService,
  getDevToAuthService,
  type DevToAuthServiceConfig,
} from './services/devto/auth';
export type { DevToUser, DevToArticle, DevToCreateArticle, DevToComment } from './services/devto/types';

export {
  createGoogleAuthService,
  initGoogleAuthService,
  getGoogleAuthService,
  type GoogleAuthServiceConfig,
} from './services/google/auth';
export type { GoogleUser, GoogleService, GOOGLE_SERVICES } from './services/google/types';

// Utilities
export {
  getCachedAccounts,
  cacheAccounts,
  clearAccountCache,
  clearAllAccountCache,
  isCacheValid,
  isTokenExpired,
  isTokenExpiringSoon,
  ACCOUNT_CACHE_TTL,
} from './utils/cache';
export {
  AuthConnectError,
  ConnectionError,
  SessionError,
  ApiKeyError,
  NetworkError,
  isAuthConnectError,
  getErrorMessage,
} from './utils/errors';

// Icons
export {
  createLucideIconSet,
  RedditIcon,
  XIcon,
  DevToIcon,
  GoogleIcon,
  defaultIconSet,
  createIconSet,
} from './icons';

// Presets (re-export for convenience)
export { defaultPreset } from './presets/default';
export { tailwindPreset } from './presets/tailwind';
export { mantinePreset } from './presets/mantine';
