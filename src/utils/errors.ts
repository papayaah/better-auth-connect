import type { Platform } from '../types';

// ============================================================================
// Error Classes
// ============================================================================

export class AuthConnectError extends Error {
  constructor(
    message: string,
    public code: string,
    public platform?: Platform
  ) {
    super(message);
    this.name = 'AuthConnectError';
  }
}

export class ConnectionError extends AuthConnectError {
  constructor(platform: Platform, message?: string) {
    super(
      message || `Failed to connect to ${platform}`,
      'CONNECTION_ERROR',
      platform
    );
    this.name = 'ConnectionError';
  }
}

export class SessionError extends AuthConnectError {
  constructor(message?: string) {
    super(message || 'Session error', 'SESSION_ERROR');
    this.name = 'SessionError';
  }
}

export class ApiKeyError extends AuthConnectError {
  constructor(platform: Platform, message?: string) {
    super(
      message || `Invalid API key for ${platform}`,
      'API_KEY_ERROR',
      platform
    );
    this.name = 'ApiKeyError';
  }
}

export class NetworkError extends AuthConnectError {
  constructor(message?: string) {
    super(message || 'Network error', 'NETWORK_ERROR');
    this.name = 'NetworkError';
  }
}

// ============================================================================
// Error Utilities
// ============================================================================

export const isAuthConnectError = (error: unknown): error is AuthConnectError => {
  return error instanceof AuthConnectError;
};

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unknown error occurred';
};
