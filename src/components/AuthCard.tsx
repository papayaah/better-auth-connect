"use client";

import { useState } from 'react';
import type { AuthCardProps, Session } from '../types';
import { useIntegrationContext } from './IntegrationProvider';

const DEFAULT_SCOPES = [
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email',
];

const PROVIDER_LABEL: Record<string, string> = { google: 'Google' };

/**
 * App front-door sign-in card built entirely from a ComponentPreset, so every
 * consuming app renders the same auth UI by passing the same preset/icons.
 */
export const AuthCard = ({
  provider = 'google',
  preset,
  icons,
  title = 'Welcome back',
  description = 'Sign in to sync your data across devices.',
  buttonLabel,
  callbackURL,
  scopes = DEFAULT_SCOPES,
  showSignedIn = true,
  onContinue,
  continueLabel = 'Continue',
  onSignedOut,
  footer,
  onError,
  className,
}: AuthCardProps) => {
  const { authClient, services } = useIntegrationContext();
  const sessionState = authClient.useSession?.() ?? { data: null, isPending: false };
  const session = (sessionState.data as Session | null) ?? null;
  const sessionLoading = sessionState.isPending ?? false;
  const [busy, setBusy] = useState(false);

  const ProviderIcon = icons?.Google;
  const label = buttonLabel ?? `Continue with ${PROVIDER_LABEL[provider] ?? provider}`;

  const handleSignIn = async () => {
    setBusy(true);
    try {
      // Use the injected authClient directly so an explicit callbackURL (needed
      // for return-URL restore) is honored; the per-provider service bakes its
      // callbackURL at construction and cannot override it per call.
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

  const initials = (session?.user?.name || session?.user?.email || '?')
    .trim()
    .charAt(0)
    .toUpperCase();

  return preset.Card({
    padding: 'lg',
    className,
    children: (
      <>
        {sessionLoading ? (
          preset.Flex({ justify: 'center', align: 'center', className: 'py-6', children: preset.Loader({}) })
        ) : session?.user && showSignedIn ? (
          preset.Flex({
            direction: 'column',
            gap: 'md',
            align: 'stretch',
            children: (
              <>
                {preset.Flex({
                  align: 'center',
                  gap: 'sm',
                  children: (
                    <>
                      {preset.Avatar({ src: session.user.image, alt: session.user.name, fallback: initials, size: 'md' })}
                      {preset.Flex({
                        direction: 'column',
                        gap: 'none',
                        className: 'min-w-0',
                        children: (
                          <>
                            {preset.Text({ variant: 'body', weight: 'semibold', className: 'truncate', children: session.user.name || 'Signed in' })}
                            {preset.Text({ variant: 'small', color: 'muted', className: 'truncate', children: session.user.email })}
                          </>
                        ),
                      })}
                    </>
                  ),
                })}
                {onContinue &&
                  preset.Button({ variant: 'primary', size: 'md', onClick: onContinue, disabled: busy, children: continueLabel })}
                {preset.Button({ variant: 'ghost', size: 'md', onClick: handleSignOut, loading: busy, children: 'Sign out' })}
              </>
            ),
          })
        ) : (
          preset.Flex({
            direction: 'column',
            gap: 'md',
            align: 'stretch',
            children: (
              <>
                {preset.Flex({
                  direction: 'column',
                  gap: 'xs',
                  align: 'center',
                  className: 'text-center',
                  children: (
                    <>
                      {preset.Text({ variant: 'h3', weight: 'bold', children: title })}
                      {description && preset.Text({ variant: 'small', color: 'muted', children: description })}
                    </>
                  ),
                })}
                {preset.Button({
                  variant: 'outline',
                  size: 'lg',
                  onClick: handleSignIn,
                  loading: busy,
                  className: 'w-full',
                  children: (
                    <>
                      {ProviderIcon && <ProviderIcon size={18} />}
                      <span>{label}</span>
                    </>
                  ),
                })}
                {footer}
              </>
            ),
          })
        )}
      </>
    ),
  });
};
