import type { ReactNode } from 'react';
import type { IconSet, IconProps } from './types';

type IconComponent = React.ComponentType<IconProps>;

/**
 * Lucide icon set adapter
 * Use this with lucide-react icons
 */
export const createLucideIconSet = (icons: {
  Check?: IconComponent;
  X?: IconComponent;
  AlertCircle?: IconComponent;
  RefreshCw?: IconComponent;
  Link?: IconComponent;
  Unlink?: IconComponent;
  ChevronDown?: IconComponent;
  ChevronUp?: IconComponent;
  Settings?: IconComponent;
  ExternalLink?: IconComponent;
  Key?: IconComponent;
  User?: IconComponent;
  Clock?: IconComponent;
  Shield?: IconComponent;
}): IconSet => {
  const result: IconSet = {};

  if (icons.Check) {
    const CheckIcon = icons.Check;
    result.Check = (props: IconProps): ReactNode => <CheckIcon {...props} />;
  }
  if (icons.X) {
    const CloseIcon = icons.X;
    result.Close = (props: IconProps): ReactNode => <CloseIcon {...props} />;
  }
  if (icons.AlertCircle) {
    const AlertIcon = icons.AlertCircle;
    result.AlertCircle = (props: IconProps): ReactNode => <AlertIcon {...props} />;
  }
  if (icons.RefreshCw) {
    const RefreshIcon = icons.RefreshCw;
    result.RefreshCw = (props: IconProps): ReactNode => <RefreshIcon {...props} />;
  }
  if (icons.Link) {
    const LinkIcon = icons.Link;
    result.Link = (props: IconProps): ReactNode => <LinkIcon {...props} />;
  }
  if (icons.Unlink) {
    const UnlinkIcon = icons.Unlink;
    result.Unlink = (props: IconProps): ReactNode => <UnlinkIcon {...props} />;
  }
  if (icons.ChevronDown) {
    const ChevronDownIcon = icons.ChevronDown;
    result.ChevronDown = (props: IconProps): ReactNode => <ChevronDownIcon {...props} />;
  }
  if (icons.ChevronUp) {
    const ChevronUpIcon = icons.ChevronUp;
    result.ChevronUp = (props: IconProps): ReactNode => <ChevronUpIcon {...props} />;
  }
  if (icons.Settings) {
    const SettingsIcon = icons.Settings;
    result.Settings = (props: IconProps): ReactNode => <SettingsIcon {...props} />;
  }
  if (icons.ExternalLink) {
    const ExternalLinkIcon = icons.ExternalLink;
    result.ExternalLink = (props: IconProps): ReactNode => <ExternalLinkIcon {...props} />;
  }
  if (icons.Key) {
    const KeyIcon = icons.Key;
    result.Key = (props: IconProps): ReactNode => <KeyIcon {...props} />;
  }
  if (icons.User) {
    const UserIcon = icons.User;
    result.User = (props: IconProps): ReactNode => <UserIcon {...props} />;
  }
  if (icons.Clock) {
    const ClockIcon = icons.Clock;
    result.Clock = (props: IconProps): ReactNode => <ClockIcon {...props} />;
  }
  if (icons.Shield) {
    const ShieldIcon = icons.Shield;
    result.Shield = (props: IconProps): ReactNode => <ShieldIcon {...props} />;
  }

  return result;
};

/**
 * Platform-specific icons (SVG)
 */
export const RedditIcon = ({ size = 24, className }: IconProps) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
  </svg>
);

export const XIcon = ({ size = 24, className }: IconProps) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export const DevToIcon = ({ size = 24, className }: IconProps) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M7.42 10.05c-.18-.16-.46-.23-.84-.23H6v4.36h.58c.37 0 .65-.08.84-.23.18-.16.28-.4.28-.73v-2.45c0-.32-.1-.56-.28-.72zm8.48 2.64c-.11.12-.3.18-.54.18h-.84v-2.4h.84c.24 0 .43.06.54.18s.17.32.17.59v.86c0 .27-.06.47-.17.59zM22.94.94H1.06C.47.94 0 1.41 0 2v20c0 .59.47 1.06 1.06 1.06h21.88c.59 0 1.06-.47 1.06-1.06V2c0-.59-.47-1.06-1.06-1.06zM8.65 14.18c0 1.16-.61 2.24-2.08 2.24H4.5V7.58h2.07c1.47 0 2.08 1.08 2.08 2.24v4.36zm4.46-4.25h-2.42v1.73h1.47v1.38h-1.47v1.76h2.42v1.38h-2.95c-.55 0-1-.45-1-1V8.97c0-.55.45-1 1-1h2.95v1.38zm6.37 5.61c-.35.57-.93.85-1.73.85-.67 0-1.2-.25-1.55-.77-.22-.33-.33-.77-.33-1.3v-3.08c0-.53.11-.97.33-1.3.35-.52.88-.77 1.55-.77.8 0 1.38.28 1.73.85.23.35.35.79.35 1.32v2.97c0 .53-.12.97-.35 1.32z" />
  </svg>
);

export const GoogleIcon = ({ size = 24, className }: IconProps) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

/**
 * Default icon set with platform icons
 */
export const defaultIconSet: IconSet = {
  Reddit: RedditIcon,
  X: XIcon,
  DevTo: DevToIcon,
  Google: GoogleIcon,
};

/**
 * Helper to create a complete icon set with lucide icons + platform icons
 */
export const createIconSet = (lucideIcons?: Parameters<typeof createLucideIconSet>[0]): IconSet => ({
  ...defaultIconSet,
  ...(lucideIcons ? createLucideIconSet(lucideIcons) : {}),
});
