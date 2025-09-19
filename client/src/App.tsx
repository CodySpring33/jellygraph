import { useState } from 'react';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';
import { useHealthCheck, useSyncData } from './hooks/useAnalytics';

function App() {
  const { data: healthData, isError: healthError } = useHealthCheck();
  const syncMutation = useSyncData();
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'settings'>('dashboard');

  const handleSync = () => {
    syncMutation.mutate();
  };

  if (healthError) {
    return (
      <div className='min-h-screen bg-gray-900 flex items-center justify-center p-4'>
        <div className='card card-padding max-w-md w-full text-center'>
          <div className='text-red-500 text-6xl mb-4'>🔌</div>
          <h1 className='text-2xl font-bold text-white mb-4'>Connection Error</h1>
          <p className='text-gray-400 mb-6'>
            Unable to connect to the Jellyfin analytics server. Please check your connection and try
            again.
          </p>
          <button onClick={() => window.location.reload()} className='btn-primary'>
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-900'>
      {/* Header */}
      <header className='border-b border-gray-700 bg-gray-800/50 backdrop-blur-sm sticky top-0 z-50'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center h-16'>
            <div className='flex items-center space-x-3'>
              <div className='gradient-bg w-10 h-10 rounded-lg flex items-center justify-center'>
                <span className='text-white font-bold text-lg'>J</span>
              </div>
              <div>
                <h1 className='text-xl font-bold text-white'>Jellyfin Analytics</h1>
                <p className='text-xs text-gray-400'>Media Server Dashboard</p>
              </div>
            </div>

            <div className='flex items-center space-x-4'>
              {/* Navigation */}
              <nav className='flex items-center space-x-1'>
                <button
                  onClick={() => setCurrentPage('dashboard')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === 'dashboard'
                      ? 'bg-jellyfin-purple text-white'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setCurrentPage('settings')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === 'settings'
                      ? 'bg-jellyfin-purple text-white'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  Settings
                </button>
              </nav>

              {/* Sync Button - Only show on dashboard */}
              {currentPage === 'dashboard' && (
                <button
                  onClick={handleSync}
                  disabled={syncMutation.isPending}
                  className='btn-secondary btn-sm flex items-center space-x-2'
                  title='Sync data from Jellyfin'
                >
                  <svg
                    className={`w-4 h-4 ${syncMutation.isPending ? 'animate-spin' : ''}`}
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
                    />
                  </svg>
                  <span>{syncMutation.isPending ? 'Syncing...' : 'Sync'}</span>
                </button>
              )}

              {/* Status Indicator */}
              <div className='flex items-center space-x-2'>
                <div
                  className={`w-2 h-2 rounded-full ${healthData ? 'bg-green-500' : 'bg-red-500'}`}
                />
                <span className='text-sm text-gray-400'>
                  {healthData ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Success/Error Messages */}
      {syncMutation.isSuccess && (
        <div className='bg-green-900/50 border-l-4 border-green-500 p-4 mx-4 mt-4 rounded'>
          <div className='flex'>
            <svg className='w-5 h-5 text-green-400' fill='currentColor' viewBox='0 0 20 20'>
              <path
                fillRule='evenodd'
                d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                clipRule='evenodd'
              />
            </svg>
            <span className='ml-3 text-green-300'>Data synced successfully!</span>
          </div>
        </div>
      )}

      {syncMutation.isError && (
        <div className='bg-red-900/50 border-l-4 border-red-500 p-4 mx-4 mt-4 rounded'>
          <div className='flex'>
            <svg className='w-5 h-5 text-red-400' fill='currentColor' viewBox='0 0 20 20'>
              <path
                fillRule='evenodd'
                d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                clipRule='evenodd'
              />
            </svg>
            <span className='ml-3 text-red-300'>
              Failed to sync data: {syncMutation.error?.message || 'Unknown error'}
            </span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {currentPage === 'dashboard' ? <Dashboard /> : <Settings />}
      </main>

      {/* Footer */}
      <footer className='border-t border-gray-700 bg-gray-800/30 mt-16'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
          <div className='flex justify-between items-center text-sm text-gray-400'>
            <div>
              <p>Jellyfin Analytics Dashboard</p>
              <p className='text-xs'>
                Server: {healthData?.environment || 'Unknown'} | Uptime:{' '}
                {healthData?.uptime ? Math.floor(healthData.uptime / 60) : 0}m
              </p>
            </div>
            <div className='text-right'>
              <p>Last updated: {new Date().toLocaleTimeString()}</p>
              <p className='text-xs'>Auto-refresh: 5 minutes</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
