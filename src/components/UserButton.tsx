"use client";

import { useState } from 'react';
import type { UserButtonProps, Session } from '../types';
import { useIntegrationContext } from './IntegrationProvider';

const DEFAULT_SCOPES = [
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email',
];

/**
 * Compact signed-in account chip with a sign-out control, or a compact
 * sign-in button when signed out. Built from the ComponentPreset so it matches
 * the rest of the app's auth UI.
 */
export const UserButton = ({
  provider = 'google',
  preset,
  icons,
  collapsed = false,
  scopes = DEFAULT_SCOPES,
  callbackURL,
  signInLabel,
  onSignedOut,
  onError,
  className,
}: UserButtonProps) => {
  const { authClient, services } = useIntegrationContext();
  const sessionState = authClient.useSession?.() ?? { data: null, isPending: false };
  const session = (sessionState.data as Session | null) ?? null;
  const sessionLoading = sessionState.isPending ?? false;
  const [busy, setBusy] = useState(false);

  const ProviderIcon = icons?.Google;

  const handleSignIn = async () => {
    setBusy(true);
    try {
      await authClient.signIn.social({ provider, callbackURL: callbackURL ?? '/', scopes });
    } catch (err) {
      onError?.(err instanceof Error ? err : new Error('Sign-in failed'));
    } finally {
      setBusy(false);
    }
  };

  const handleSignOut = async () => {
    setBusy(true);
    try {
      if (services?.[provider]) {
        await services[provider].signOut();
      } else {
        await authClient.signOut();
      }
      onSignedOut?.();
    } catch (err) {
      onError?.(err instanceof Error ? err : new Error('Sign-out failed'));
    } finally {
      setBusy(false);
    }
  };

  if (sessionLoading) {
    return preset.Flex({ align: 'center', justify: collapsed ? 'center' : 'start', className, children: preset.Loader({ size: 'sm' }) });
  }

  // Signed out
  if (!session?.user) {
    const label = signInLabel ?? 'Sign in with Google';
    return preset.Button({
      variant: 'primary',
      size: collapsed ? 'sm' : 'md',
      onClick: handleSignIn,
      loading: busy,
      className: collapsed ? className : `w-full ${className || ''}`,
      children: (
        <>
          {ProviderIcon && <ProviderIcon size={16} />}
          {!collapsed && <span>{label}</span>}
        </>
      ),
    });
  }

  const initials = (session.user.name || session.user.email || '?').trim().charAt(0).toUpperCase();

  // Signed in, collapsed: avatar acts as a sign-out control
  if (collapsed) {
    return preset.IconButton({
      variant: 'default',
      size: 'sm',
      title: `Sign out (${session.user.name || session.user.email})`,
      onClick: handleSignOut,
      disabled: busy,
      className,
      children: preset.Avatar({ src: session.user.image, alt: session.user.name, fallback: initials, size: 'sm' }),
    });
  }

  // Signed in, expanded
  return preset.Flex({
    align: 'center',
    justify: 'between',
    gap: 'sm',
    className,
    children: (
      <>
        {preset.Flex({
          align: 'center',
          gap: 'sm',
          className: 'min-w-0',
          children: (
            <>
              {preset.Avatar({ src: session.user.image, alt: session.user.name, fallback: initials, size: 'sm' })}
              {preset.Flex({
                direction: 'column',
                gap: 'none',
                className: 'min-w-0',
                children: (
                  <>
                    {preset.Text({ variant: 'small', weight: 'semibold', className: 'truncate', children: session.user.name })}
                    {preset.Text({ variant: 'caption', color: 'muted', className: 'truncate', children: session.user.email })}
                  </>
                ),
              })}
            </>
          ),
        })}
        {preset.IconButton({
          variant: 'danger',
          size: 'sm',
          title: 'Sign out',
          onClick: handleSignOut,
          disabled: busy,
          children: <SignOutGlyph />,
        })}
      </>
    ),
  });
};

/** Minimal inline sign-out glyph so the package needs no icon dependency. */
const SignOutGlyph = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);
