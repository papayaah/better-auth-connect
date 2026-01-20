import type { ReactNode } from 'react';

// ============================================================================
// Platform Types
// ============================================================================

export type Platform = 'reddit' | 'x' | 'devto' | 'google';

export type AuthType = 'oauth' | 'apikey';

export interface PlatformConfig {
  id: Platform;
  name: string;
  authType: AuthType;
  defaultScopes?: string[];
  callbackPath: string;
}

export const PLATFORM_CONFIGS: Record<Platform, PlatformConfig> = {
  reddit: {
    id: 'reddit',
    name: 'Reddit',
    authType: 'oauth',
    defaultScopes: ['identity', 'read', 'submit', 'mysubreddits'],
    callbackPath: '/app/integrations/reddit',
  },
  x: {
    id: 'x',
    name: 'X (Twitter)',
    authType: 'oauth',
    defaultScopes: ['tweet.read', 'tweet.write', 'users.read', 'offline.access'],
    callbackPath: '/app/integrations/x',
  },
  devto: {
    id: 'devto',
    name: 'Dev.to',
    authType: 'apikey',
    callbackPath: '/app/integrations/devto',
  },
  google: {
    id: 'google',
    name: 'Google',
    authType: 'oauth',
    defaultScopes: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ],
    callbackPath: '/app/integrations/google',
  },
};

// ============================================================================
// Account Types
// ============================================================================

export interface BaseAccount {
  id: string;
  userId: string;
  providerId: string;
  accountId: string;
  accessToken?: string;
  refreshToken?: string | null;
  accessTokenExpiresAt?: Date | string | null;
  scope?: string;
  isExpired?: boolean;
}

export interface RedditAccount extends BaseAccount {
  providerId: 'reddit';
  username?: string;
}

export interface XAccount extends BaseAccount {
  providerId: 'x' | 'twitter';
  username?: string;
}

export interface DevToAccount extends BaseAccount {
  providerId: 'devto';
  apiKey?: string;
  username: string;
  profileImageUrl?: string;
}

export interface GoogleAccount extends BaseAccount {
  providerId: 'google';
  email?: string;
  name?: string;
  picture?: string;
  services?: string[]; // ['youtube', 'blogger', 'drive', 'gmail', 'photos']
}

export type Account = RedditAccount | XAccount | DevToAccount | GoogleAccount;

// ============================================================================
// Permission Types
// ============================================================================

export interface Permission {
  id: string;
  label: string;
  description: string;
  required?: boolean;
  default?: boolean;
}

export const REDDIT_PERMISSIONS: Permission[] = [
  { id: 'identity', label: 'Access identity', description: 'Access my Reddit username and signup date (Required)', required: true, default: true },
  { id: 'read', label: 'Read content', description: 'Access posts and comments through my account (Required)', required: true, default: true },
  { id: 'history', label: 'History', description: 'Access my voting history and hidden posts (Required)', required: true, default: true },
  { id: 'mysubreddits', label: 'My Subreddits', description: 'Access the list of subreddits I moderate, contribute to, and subscribe to', default: true },
  { id: 'submit', label: 'Submit content', description: 'Submit links and comments from my account', default: true },
  { id: 'edit', label: 'Edit content', description: 'Edit and delete my comments and submissions', default: false },
  { id: 'vote', label: 'Vote', description: 'Submit and change my votes on comments and submissions', default: false },
  { id: 'flair', label: 'Manage flair', description: 'Access and manage post flairs', default: true },
];

export const X_PERMISSIONS: Permission[] = [
  { id: 'tweet.read', label: 'Read Tweets', description: 'Read Tweets and replies (Required)', required: true, default: true },
  { id: 'users.read', label: 'Read Profile', description: 'Read profile information (Required)', required: true, default: true },
  { id: 'tweet.write', label: 'Write Tweets', description: 'Post and delete Tweets', default: true },
  { id: 'offline.access', label: 'Stay Connected', description: 'Maintain access without re-login', default: true },
];

export const DEVTO_PERMISSIONS: Permission[] = [];

export const GOOGLE_PERMISSIONS: Permission[] = [
  {
    id: 'https://www.googleapis.com/auth/userinfo.profile',
    label: 'Profile Information',
    description: 'Access your name and profile picture (Required)',
    required: true,
    default: true,
  },
  {
    id: 'https://www.googleapis.com/auth/userinfo.email',
    label: 'Email Address',
    description: 'Access your email address (Required)',
    required: true,
    default: true,
  },
  {
    id: 'https://www.googleapis.com/auth/youtube.readonly',
    label: 'YouTube (Read)',
    description: 'Read YouTube channel and video data',
    default: false,
  },
  {
    id: 'https://www.googleapis.com/auth/youtube',
    label: 'YouTube (Full Access)',
    description: 'Upload videos and manage YouTube channel',
    default: false,
  },
  {
    id: 'https://www.googleapis.com/auth/blogger',
    label: 'Blogger',
    description: 'Publish and manage blog posts',
    default: false,
  },
  {
    id: 'https://www.googleapis.com/auth/drive.readonly',
    label: 'Google Drive (Read)',
    description: 'Read files in Google Drive',
    default: false,
  },
  {
    id: 'https://www.googleapis.com/auth/gmail.compose',
    label: 'Gmail (Send)',
    description: 'Send emails via Gmail',
    default: false,
  },
  {
    id: 'https://www.googleapis.com/auth/photoslibrary.readonly',
    label: 'Google Photos (Read)',
    description: 'View photos and albums',
    default: false,
  },
];

export const PLATFORM_PERMISSIONS: Record<Platform, Permission[]> = {
  reddit: REDDIT_PERMISSIONS,
  x: X_PERMISSIONS,
  devto: DEVTO_PERMISSIONS,
  google: GOOGLE_PERMISSIONS,
};

// ============================================================================
// Platform Features
// ============================================================================

export interface PlatformFeature {
  text: string;
}

export const PLATFORM_FEATURES: Record<Platform, PlatformFeature[]> = {
  reddit: [
    { text: 'OAuth2 authentication' },
    { text: 'Secure token storage in SQLite (Server) & IndexedDB (Client)' },
    { text: 'Automatic token refresh' },
    { text: 'Multi-account support' },
    { text: 'Read, submit, and manage posts' },
  ],
  x: [
    { text: 'OAuth2 authentication' },
    { text: 'Secure token storage' },
    { text: 'Automatic token refresh' },
    { text: 'Multi-account support' },
    { text: 'Read and post Tweets' },
  ],
  devto: [
    { text: 'API key authentication' },
    { text: 'Secure key storage' },
    { text: 'Publish articles' },
    { text: 'Cross-post content' },
  ],
  google: [
    { text: 'OAuth2 authentication' },
    { text: 'Secure token storage' },
    { text: 'Automatic token refresh' },
    { text: 'Access multiple Google services' },
    { text: 'YouTube, Blogger, Drive, Gmail, Photos' },
  ],
};

// Platform colors for theming
export const PLATFORM_COLORS: Record<Platform, { primary: string; bg: string; hover: string }> = {
  reddit: { primary: '#ff4500', bg: 'rgba(255, 69, 0, 0.1)', hover: '#ff5722' },
  x: { primary: '#000000', bg: 'rgba(0, 0, 0, 0.1)', hover: '#1a1a1a' },
  devto: { primary: '#0a0a0a', bg: 'rgba(10, 10, 10, 0.1)', hover: '#1a1a1a' },
  google: { primary: '#4285f4', bg: 'rgba(66, 133, 244, 0.1)', hover: '#357ae8' },
};

// ============================================================================
// Session Types
// ============================================================================

export interface User {
  id: string;
  name?: string;
  email?: string;
  image?: string;
}

export interface Session {
  user: User;
  expiresAt?: Date;
}

// ============================================================================
// Component Preset Types
// ============================================================================

export interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outlined' | 'dashed';
}

export interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  type?: 'button' | 'submit';
}

export interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  type?: 'text' | 'password';
  className?: string;
  error?: string;
}

export interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error';
  className?: string;
}

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}

export interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  color?: string;
}

export interface AlertProps {
  children: ReactNode;
  variant?: 'info' | 'success' | 'warning' | 'error';
  className?: string;
  icon?: ReactNode;
}

// Layout primitives
export interface FlexProps {
  children: ReactNode;
  direction?: 'row' | 'column';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  wrap?: boolean;
  className?: string;
  onClick?: () => void;
}

export interface GridProps {
  children: ReactNode;
  cols?: 1 | 2 | 3 | 4 | 'auto';
  gap?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
}

export interface TextProps {
  children: ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'small' | 'caption';
  color?: 'primary' | 'secondary' | 'muted' | 'success' | 'warning' | 'error';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div';
}

export interface AvatarProps {
  src?: string;
  alt?: string;
  fallback?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export interface IconButtonProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'default' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  title?: string;
  className?: string;
}

export interface CodeProps {
  children: ReactNode;
  color?: string;
  className?: string;
}

export interface DividerProps {
  className?: string;
}

export interface ComponentPreset {
  // Core components
  Card: (props: CardProps) => ReactNode;
  Button: (props: ButtonProps) => ReactNode;
  TextInput: (props: TextInputProps) => ReactNode;
  Checkbox: (props: CheckboxProps) => ReactNode;
  Badge: (props: BadgeProps) => ReactNode;
  Modal: (props: ModalProps) => ReactNode;
  Loader: (props: LoaderProps) => ReactNode;
  Alert: (props: AlertProps) => ReactNode;
  // Layout primitives
  Flex: (props: FlexProps) => ReactNode;
  Grid: (props: GridProps) => ReactNode;
  Text: (props: TextProps) => ReactNode;
  Avatar: (props: AvatarProps) => ReactNode;
  IconButton: (props: IconButtonProps) => ReactNode;
  Code: (props: CodeProps) => ReactNode;
  Divider: (props: DividerProps) => ReactNode;
}

// ============================================================================
// Icon Types
// ============================================================================

export interface IconProps {
  size?: number;
  className?: string;
}

export interface IconSet {
  Reddit?: (props: IconProps) => ReactNode;
  X?: (props: IconProps) => ReactNode;
  DevTo?: (props: IconProps) => ReactNode;
  Google?: (props: IconProps) => ReactNode;
  Check?: (props: IconProps) => ReactNode;
  Close?: (props: IconProps) => ReactNode;
  AlertCircle?: (props: IconProps) => ReactNode;
  RefreshCw?: (props: IconProps) => ReactNode;
  Link?: (props: IconProps) => ReactNode;
  Unlink?: (props: IconProps) => ReactNode;
  ChevronDown?: (props: IconProps) => ReactNode;
  ChevronUp?: (props: IconProps) => ReactNode;
  Settings?: (props: IconProps) => ReactNode;
  ExternalLink?: (props: IconProps) => ReactNode;
  Key?: (props: IconProps) => ReactNode;
  User?: (props: IconProps) => ReactNode;
  Clock?: (props: IconProps) => ReactNode;
  Shield?: (props: IconProps) => ReactNode;
  Trash2?: (props: IconProps) => ReactNode;
}

// ============================================================================
// Provider Types
// ============================================================================

export interface AuthClient {
  getSession: () => Promise<{ data: Session | null } | null>;
  signIn: {
    social: (options: { provider: string; callbackURL: string; scopes?: string[] }) => Promise<void>;
  };
  linkSocial: (options: { provider: string; callbackURL: string; scopes?: string[] }) => Promise<void>;
  signOut: () => Promise<void>;
}

export interface CacheConfig {
  ttl?: number;
  enabled?: boolean;
}

export interface IntegrationProviderConfig {
  authClient: AuthClient;
  cacheConfig?: CacheConfig;
  onError?: (error: Error) => void;
  apiBasePath?: string;
}

// ============================================================================
// Integration Card Types
// ============================================================================

export interface IntegrationCardProps {
  platform: Platform;
  preset: ComponentPreset;
  icons?: IconSet;
  onConnect?: (platform: Platform) => void;
  onDisconnect?: (accountId: string) => void;
  onRefresh?: () => void;
  showPermissions?: boolean;
  showFeatures?: boolean;
  /**
   * Optional allowlist of permission IDs (scopes) to show for OAuth platforms.
   *
   * If provided, the permission selector UI will only show these permissions
   * (plus any permissions marked `required` for the platform).
   *
   * This is useful when you want a "basic" connection flow and don't want users
   * to grant broader scopes.
   */
  permissionIds?: string[];
  className?: string;
}

export interface AccountListProps {
  platform: Platform;
  preset: ComponentPreset;
  icons?: IconSet;
  accounts: Account[];
  onDisconnect: (accountId: string) => void;
  onReconnect: () => void;
  showExpiration?: boolean;
  sessionUser?: User;
  disabled?: boolean;
}

export interface AccountCardProps {
  account: Account;
  platform: Platform;
  preset: ComponentPreset;
  icons?: IconSet;
  sessionUser?: User;
  onDisconnect: (accountId: string) => void;
  onReconnect?: () => void;
  disabled?: boolean;
  showExpiration?: boolean;
  expandable?: boolean;
}

export interface ConnectButtonProps {
  platform: Platform;
  preset: ComponentPreset;
  icons?: IconSet;
  loading?: boolean;
  disabled?: boolean;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
}

export interface PermissionSelectorProps {
  platform: Platform;
  preset: ComponentPreset;
  permissions: Permission[];
  selected: string[];
  onChange: (permissions: string[]) => void;
  required?: string[];
}

export interface ApiKeyInputProps {
  preset: ComponentPreset;
  icons?: IconSet;
  onSubmit: (apiKey: string) => Promise<void>;
  loading?: boolean;
  error?: string;
}

// ============================================================================
// Hook Return Types
// ============================================================================

export interface UseIntegrationReturn {
  accounts: Account[];
  loading: boolean;
  error: Error | null;
  connected: boolean;
  connect: (scopes?: string[]) => Promise<void>;
  disconnect: (accountId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export interface UseAccountsReturn {
  accounts: Account[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  isExpired: (account: Account) => boolean;
}

export interface UseAuthSessionReturn {
  session: Session | null;
  loading: boolean;
  error: Error | null;
}
