import { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { tailwindPreset } from '@reactkits.dev/better-auth-connect/presets/tailwind';
import { defaultPreset } from '@reactkits.dev/better-auth-connect/presets/default';
import { defaultIconSet } from '@reactkits.dev/better-auth-connect/icons';
import type { ComponentPreset, Platform, RedditAccount, XAccount, DevToAccount, GoogleAccount } from '@reactkits.dev/better-auth-connect';
import RealAuthDemo from './RealAuthDemo';
import {
  Check,
  X,
  AlertCircle,
  RefreshCw,
  Link as LinkIcon,
  Unlink,
  ChevronDown,
  ChevronUp,
  Settings,
  ExternalLink,
  Key,
  User,
  Clock,
  Shield,
  Info,
} from 'lucide-react';

// Create icon set with lucide icons
const lucideIconSet = {
  ...defaultIconSet,
  Check: (props: { size?: number; className?: string }) => <Check {...props} />,
  Close: (props: { size?: number; className?: string }) => <X {...props} />,
  AlertCircle: (props: { size?: number; className?: string }) => <AlertCircle {...props} />,
  RefreshCw: (props: { size?: number; className?: string }) => <RefreshCw {...props} />,
  Link: (props: { size?: number; className?: string }) => <LinkIcon {...props} />,
  Unlink: (props: { size?: number; className?: string }) => <Unlink {...props} />,
  ChevronDown: (props: { size?: number; className?: string }) => <ChevronDown {...props} />,
  ChevronUp: (props: { size?: number; className?: string }) => <ChevronUp {...props} />,
  Settings: (props: { size?: number; className?: string }) => <Settings {...props} />,
  ExternalLink: (props: { size?: number; className?: string }) => <ExternalLink {...props} />,
  Key: (props: { size?: number; className?: string }) => <Key {...props} />,
  User: (props: { size?: number; className?: string }) => <User {...props} />,
  Clock: (props: { size?: number; className?: string }) => <Clock {...props} />,
  Shield: (props: { size?: number; className?: string }) => <Shield {...props} />,
};

// Mock accounts for demo
const mockRedditAccount: RedditAccount = {
  id: 'reddit-1',
  userId: 'user1',
  providerId: 'reddit',
  accountId: 'reddit_user_123',
  username: 'demo_redditor',
  accessToken: 'mock_token',
  accessTokenExpiresAt: new Date(Date.now() + 1000 * 60 * 60 * 2), // 2 hours
};

const mockXAccount: XAccount = {
  id: 'x-1',
  userId: 'user1',
  providerId: 'x',
  accountId: 'x_user_456',
  username: 'demo_tweeter',
  accessToken: 'mock_token',
  accessTokenExpiresAt: new Date(Date.now() + 1000 * 60 * 30), // 30 min
};

const mockDevToAccount: DevToAccount = {
  id: 'devto-1',
  userId: 'user1',
  providerId: 'devto',
  accountId: 'devto_789',
  username: 'demo_developer',
  profileImageUrl: 'https://dev-to-uploads.s3.amazonaws.com/uploads/user/profile_image/1/default.png',
};

const mockGoogleAccount: GoogleAccount = {
  id: 'google-1',
  userId: 'user1',
  providerId: 'google',
  accountId: 'google_user_101',
  email: 'demo.user@gmail.com',
  name: 'Demo User',
  picture: 'https://lh3.googleusercontent.com/a/default-user',
  accessToken: 'mock_token',
  accessTokenExpiresAt: new Date(Date.now() + 1000 * 60 * 60), // 1 hour
  services: ['youtube', 'blogger'],
};

// Demo Integration Card - uses mock data instead of real API calls
function DemoIntegrationCard({
  platform,
  preset,
  icons,
  showFeatures = false,
  initialConnected = false,
}: {
  platform: Platform;
  preset: ComponentPreset;
  icons?: typeof lucideIconSet;
  showFeatures?: boolean;
  initialConnected?: boolean;
}) {
  const [connected, setConnected] = useState(initialConnected);
  const [loading, setLoading] = useState(false);

  const platformConfig = {
    reddit: { name: 'Reddit', authType: 'oauth' as const, account: mockRedditAccount },
    x: { name: 'X (Twitter)', authType: 'oauth' as const, account: mockXAccount },
    devto: { name: 'Dev.to', authType: 'apikey' as const, account: mockDevToAccount },
    google: { name: 'Google', authType: 'oauth' as const, account: mockGoogleAccount },
  };

  const config = platformConfig[platform];
  const PlatformIcon = icons?.[
    platform === 'x' ? 'X' 
    : platform === 'reddit' ? 'Reddit' 
    : platform === 'google' ? 'Google'
    : 'DevTo'
  ];

  const handleConnect = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setConnected(true);
    setLoading(false);
  };

  const handleDisconnect = async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setConnected(false);
    setLoading(false);
  };

  const features = {
    reddit: ['Post to your favorite subreddits', 'Schedule posts for optimal engagement', 'Track post performance'],
    x: ['Tweet directly from the app', 'Schedule tweets', 'Manage multiple accounts'],
    devto: ['Publish articles to Dev.to', 'Cross-post your content', 'Track article statistics'],
    google: ['Access YouTube, Blogger, Drive, Gmail, Photos', 'Manage multiple Google services', 'Secure OAuth2 authentication'],
  };

  return preset.Card({
    padding: 'lg',
    children: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {PlatformIcon && <PlatformIcon size={24} />}
          <div>
            <div style={{ fontWeight: 600, fontSize: '1.125rem' }}>{config.name}</div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              {config.authType === 'oauth' ? 'OAuth Authentication' : 'API Key Authentication'}
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && preset.Loader({ size: 'md' })}

        {/* Connected State */}
        {!loading && connected && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 500 }}>1 account connected</span>
              {preset.Button({
                variant: 'outline',
                size: 'sm',
                onClick: () => {},
                children: (
                  <>
                    <RefreshCw size={14} />
                    <span>Refresh</span>
                  </>
                ),
              })}
            </div>
            {preset.Card({
              padding: 'md',
              children: (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <User size={20} />
                    <div>
                      <div style={{ fontWeight: 500 }}>{config.account.username}</div>
                      {config.authType === 'oauth' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.875rem', color: '#6b7280' }}>
                          <Clock size={14} />
                          <span>Expires in 2h</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {preset.Button({
                    variant: 'danger',
                    size: 'sm',
                    onClick: handleDisconnect,
                    children: (
                      <>
                        <Unlink size={14} />
                        <span>Disconnect</span>
                      </>
                    ),
                  })}
                </div>
              ),
            })}
          </div>
        )}

        {/* Not Connected State */}
        {!loading && !connected && (
          <>
            {platform === 'devto' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Key size={16} />
                  <span style={{ fontWeight: 500 }}>API Key</span>
                </div>
                <input
                  type="password"
                  placeholder="Enter your API key"
                  className="w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                />
                {preset.Button({
                  onClick: handleConnect,
                  variant: 'primary',
                  children: 'Connect',
                })}
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  You can find your API key in your Dev.to settings under{' '}
                  <a href="https://dev.to/settings/extensions" target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', textDecoration: 'underline' }}>
                    Extensions
                  </a>
                </div>
              </div>
            ) : (
              preset.Button({
                onClick: handleConnect,
                loading,
                variant: 'primary',
                children: (
                  <>
                    {PlatformIcon && <PlatformIcon size={16} />}
                    <span>Connect {config.name}</span>
                  </>
                ),
              })
            )}
          </>
        )}

        {/* Features */}
        {showFeatures && (
          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              {features[platform].map((feature, i) => (
                <li key={i}>{feature}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    ),
  });
}

function DemoLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'All Integrations' },
    { path: '/reddit', label: 'Reddit' },
    { path: '/x', label: 'X (Twitter)' },
    { path: '/devto', label: 'Dev.to' },
    { path: '/google', label: 'Google' },
    { path: '/presets', label: 'Presets Demo' },
    { path: '/real-auth', label: 'Real Auth Test' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Demo Banner */}
      <div className="bg-blue-600 text-white px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <Info size={20} />
          <div>
            <strong>Demo Mode:</strong> This is a UI demo with mock data. To use real OAuth, integrate this package with your Better Auth backend.
            See the <a href="https://github.com/papayaah/better-auth-connect" className="underline font-medium">README</a> for setup instructions.
          </div>
        </div>
      </div>

      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Better Auth Connect Demo
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Headless React library for OAuth integrations
          </p>
        </div>
      </header>

      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-4 overflow-x-auto">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-4 text-sm font-medium whitespace-nowrap ${
                  location.pathname === item.path
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}

function AllIntegrationsPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
        All Integrations
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DemoIntegrationCard
          platform="reddit"
          preset={tailwindPreset}
          icons={lucideIconSet}
          showFeatures
        />
        <DemoIntegrationCard
          platform="x"
          preset={tailwindPreset}
          icons={lucideIconSet}
          showFeatures
        />
        <DemoIntegrationCard
          platform="devto"
          preset={tailwindPreset}
          icons={lucideIconSet}
          showFeatures
        />
        <DemoIntegrationCard
          platform="google"
          preset={tailwindPreset}
          icons={lucideIconSet}
          showFeatures
        />
      </div>
    </div>
  );
}

function RedditPage() {
  return (
    <div className="max-w-md space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
        Reddit Integration
      </h2>
      <DemoIntegrationCard
        platform="reddit"
        preset={tailwindPreset}
        icons={lucideIconSet}
        showFeatures
      />
    </div>
  );
}

function XPage() {
  return (
    <div className="max-w-md space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
        X (Twitter) Integration
      </h2>
      <DemoIntegrationCard
        platform="x"
        preset={tailwindPreset}
        icons={lucideIconSet}
        showFeatures
      />
    </div>
  );
}

function DevToPage() {
  return (
    <div className="max-w-md space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
        Dev.to Integration
      </h2>
      <DemoIntegrationCard
        platform="devto"
        preset={tailwindPreset}
        icons={lucideIconSet}
        showFeatures
      />
    </div>
  );
}

function GooglePage() {
  return (
    <div className="max-w-md space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
        Google Integration
      </h2>
      <DemoIntegrationCard
        platform="google"
        preset={tailwindPreset}
        icons={lucideIconSet}
        showFeatures
      />
    </div>
  );
}

function PresetsPage() {
  const [activePreset, setActivePreset] = useState<'tailwind' | 'default'>('tailwind');

  const presets: Record<string, ComponentPreset> = {
    tailwind: tailwindPreset,
    default: defaultPreset,
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
        Presets Demo
      </h2>
      <p className="text-gray-600 dark:text-gray-300">
        The library is headless - you provide styling via presets. Compare the different
        preset options below.
      </p>

      <div className="flex space-x-4">
        <button
          onClick={() => setActivePreset('tailwind')}
          className={`px-4 py-2 rounded-md ${
            activePreset === 'tailwind'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
          }`}
        >
          Tailwind Preset
        </button>
        <button
          onClick={() => setActivePreset('default')}
          className={`px-4 py-2 rounded-md ${
            activePreset === 'default'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
          }`}
        >
          Default Preset
        </button>
      </div>

      <div className="max-w-md">
        <DemoIntegrationCard
          platform="reddit"
          preset={presets[activePreset]}
          icons={lucideIconSet}
          showFeatures
        />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <DemoLayout>
      <Routes>
        <Route path="/" element={<AllIntegrationsPage />} />
        <Route path="/reddit" element={<RedditPage />} />
        <Route path="/x" element={<XPage />} />
        <Route path="/devto" element={<DevToPage />} />
        <Route path="/google" element={<GooglePage />} />
        <Route path="/presets" element={<PresetsPage />} />
        <Route path="/real-auth" element={<RealAuthDemo />} />
      </Routes>
    </DemoLayout>
  );
}
