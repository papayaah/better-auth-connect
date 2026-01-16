import { IntegrationProvider, IntegrationCard, tailwindPreset, defaultIconSet } from '@reactkits.dev/better-auth-connect';
import { createAuthClient } from 'better-auth/react';

// Get Better Auth base URL from environment or use default
const BETTER_AUTH_URL = import.meta.env.VITE_BETTER_AUTH_URL || 'http://localhost:3000';

// Initialize Better Auth client
const authClient = createAuthClient({
  baseURL: BETTER_AUTH_URL,
});

export default function RealAuthDemo() {
  return (
    <IntegrationProvider authClient={authClient}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Info Banner */}
        <div className="bg-green-600 text-white px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center gap-3">
            <div>
              <strong>Real Auth Mode:</strong> Connected to Better Auth backend at{' '}
              <code className="bg-green-700 px-2 py-1 rounded">{BETTER_AUTH_URL}</code>
              {' '}
              Make sure your backend is running and has the required API routes configured.
            </div>
          </div>
        </div>

        <header className="bg-white dark:bg-gray-800 shadow">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Better Auth Connect - Real Auth Demo
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Testing with real Better Auth backend
            </p>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              All Integrations
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <IntegrationCard
                platform="reddit"
                preset={tailwindPreset}
                icons={defaultIconSet}
                showFeatures={true}
                showPermissions={false}
              />
              
              <IntegrationCard
                platform="x"
                preset={tailwindPreset}
                icons={defaultIconSet}
                showFeatures={true}
                showPermissions={false}
              />
              
              <IntegrationCard
                platform="devto"
                preset={tailwindPreset}
                icons={defaultIconSet}
                showFeatures={true}
                showPermissions={false}
              />
              
              <IntegrationCard
                platform="google"
                preset={tailwindPreset}
                icons={defaultIconSet}
                showFeatures={true}
                showPermissions={false}
              />
            </div>

            <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Backend Requirements
              </h3>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
                <li>Better Auth server running at {BETTER_AUTH_URL}</li>
                <li>API routes: <code>/api/auth/reddit/accounts</code>, <code>/api/auth/x/accounts</code>, etc.</li>
                <li>OAuth providers configured in Better Auth config</li>
                <li>CORS enabled for demo origin</li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    </IntegrationProvider>
  );
}
