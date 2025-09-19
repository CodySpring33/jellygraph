import React, { useState } from 'react';
import {
  formatSettingValue,
  getCategoryDisplayName,
  getInputType,
  getSettingDisplayName,
  useAllSettings,
  useTestJellyfinConnection,
  useUpdateSetting,
  type Setting,
} from '../hooks/useSettings';

const Settings: React.FC = () => {
  const { data: settingsData, isLoading, error } = useAllSettings();
  const updateSettingMutation = useUpdateSetting();
  const testJellyfinMutation = useTestJellyfinConnection();

  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    jellyfin: true, // Jellyfin category expanded by default
  });

  // Initialize form values when settings data loads
  React.useEffect(() => {
    if (settingsData) {
      const initialValues: Record<string, string> = {};
      settingsData.forEach(category => {
        category.settings.forEach(setting => {
          initialValues[setting.key] = formatSettingValue(setting);
        });
      });
      setFormValues(initialValues);
    }
  }, [settingsData]);

  const handleInputChange = (key: string, value: string) => {
    setFormValues(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSaveSetting = async (setting: Setting) => {
    const value = formValues[setting.key];
    if (value === undefined) return;

    try {
      await updateSettingMutation.mutateAsync({ key: setting.key, value });
    } catch (error) {
      console.error('Failed to save setting:', error);
    }
  };

  const handleTestJellyfin = async () => {
    const url = formValues['jellyfin.url'];
    const apiKey = formValues['jellyfin.apiKey'];

    if (!url || !apiKey) {
      alert('Please enter both URL and API key before testing');
      return;
    }

    try {
      const result = await testJellyfinMutation.mutateAsync({ url, apiKey });

      if (result.success) {
        alert(`Connection ${result.connected ? 'successful' : 'failed'}: ${result.message}`);
      } else {
        alert(`Connection failed: ${result.message}`);
      }
    } catch (error) {
      alert('Failed to test connection. Please check your settings.');
    }
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  if (isLoading) {
    return (
      <div className='p-6'>
        <h2 className='text-2xl font-bold text-white mb-6'>Settings</h2>
        <div className='space-y-4'>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className='card card-padding animate-pulse'>
              <div className='shimmer h-6 rounded mb-4'></div>
              <div className='space-y-3'>
                <div className='shimmer h-4 rounded'></div>
                <div className='shimmer h-10 rounded'></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='p-6'>
        <h2 className='text-2xl font-bold text-white mb-6'>Settings</h2>
        <div className='card card-padding'>
          <div className='error-state'>
            <svg
              className='w-12 h-12 mx-auto mb-4 text-gray-500'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
              />
            </svg>
            <p className='text-gray-400'>Failed to load settings</p>
            <p className='text-xs text-gray-500 mt-2'>{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!settingsData?.length) {
    return (
      <div className='p-6'>
        <h2 className='text-2xl font-bold text-white mb-6'>Settings</h2>
        <div className='card card-padding'>
          <div className='error-state'>
            <svg
              className='w-12 h-12 mx-auto mb-4 text-gray-500'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z'
              />
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
              />
            </svg>
            <p>No settings available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='p-6 max-w-4xl mx-auto'>
      <div className='flex justify-between items-center mb-6'>
        <h2 className='text-2xl font-bold text-white'>Settings</h2>
        <div className='text-sm text-gray-400'>Configure your Jellyfin analytics dashboard</div>
      </div>

      <div className='space-y-6'>
        {settingsData.map(categoryData => (
          <div key={categoryData.category} className='card card-padding'>
            <button
              onClick={() => toggleCategory(categoryData.category)}
              className='w-full flex items-center justify-between mb-4 text-left focus:outline-none'
            >
              <h3 className='text-xl font-semibold text-white'>
                {getCategoryDisplayName(categoryData.category)}
              </h3>
              <svg
                className={`w-5 h-5 text-gray-400 transform transition-transform ${
                  expandedCategories[categoryData.category] ? 'rotate-180' : ''
                }`}
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='m19 9-7 7-7-7'
                />
              </svg>
            </button>

            {expandedCategories[categoryData.category] && (
              <div className='space-y-6'>
                {categoryData.settings.map(setting => (
                  <div
                    key={setting.key}
                    className='border-b border-gray-700 pb-4 last:border-b-0 last:pb-0'
                  >
                    <div className='flex flex-col space-y-3'>
                      <div className='flex items-center justify-between'>
                        <label htmlFor={setting.key} className='text-white font-medium'>
                          {getSettingDisplayName(setting.key)}
                          {setting.required && <span className='text-red-400 ml-1'>*</span>}
                        </label>
                        <div className='flex items-center space-x-2'>
                          {categoryData.category === 'jellyfin' &&
                            setting.key === 'jellyfin.apiKey' && (
                              <button
                                onClick={handleTestJellyfin}
                                disabled={testJellyfinMutation.isPending}
                                className='btn-secondary btn-sm flex items-center space-x-1'
                              >
                                {testJellyfinMutation.isPending ? (
                                  <div className='loading-spinner w-3 h-3'></div>
                                ) : (
                                  <svg
                                    className='w-3 h-3'
                                    fill='none'
                                    stroke='currentColor'
                                    viewBox='0 0 24 24'
                                  >
                                    <path
                                      strokeLinecap='round'
                                      strokeLinejoin='round'
                                      strokeWidth={2}
                                      d='M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1'
                                    />
                                  </svg>
                                )}
                                <span>Test</span>
                              </button>
                            )}
                          <button
                            onClick={() => handleSaveSetting(setting)}
                            disabled={
                              updateSettingMutation.isPending ||
                              formValues[setting.key] === formatSettingValue(setting)
                            }
                            className='btn-primary btn-sm'
                          >
                            {updateSettingMutation.isPending ? 'Saving...' : 'Save'}
                          </button>
                        </div>
                      </div>

                      <p className='text-sm text-gray-400'>{setting.description}</p>

                      <input
                        id={setting.key}
                        type={getInputType(setting)}
                        value={formValues[setting.key] || ''}
                        onChange={e => handleInputChange(setting.key, e.target.value)}
                        placeholder={setting.required ? 'Required' : 'Optional'}
                        className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
                          setting.required && !formValues[setting.key]
                            ? 'border-red-500 focus:ring-red-500'
                            : 'border-gray-600 focus:ring-jellyfin-purple'
                        }`}
                      />

                      {setting.type === 'number' && (
                        <p className='text-xs text-gray-500'>Enter a number value</p>
                      )}

                      {setting.type === 'url' && (
                        <p className='text-xs text-gray-500'>Include http:// or https://</p>
                      )}
                    </div>
                  </div>
                ))}

                {categoryData.category === 'jellyfin' && (
                  <div className='mt-4 p-4 bg-blue-900/20 border border-blue-700/50 rounded-lg'>
                    <h4 className='text-white font-medium mb-2'>
                      📋 How to get your Jellyfin API Key:
                    </h4>
                    <ol className='text-sm text-gray-300 space-y-1 list-decimal list-inside'>
                      <li>Log into your Jellyfin server as an administrator</li>
                      <li>Go to Dashboard → Advanced → API Keys</li>
                      <li>Click "New API Key"</li>
                      <li>Enter a name (e.g., "Analytics Dashboard")</li>
                      <li>Copy the generated API key and paste it above</li>
                    </ol>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Status Messages */}
      {updateSettingMutation.isSuccess && (
        <div className='fixed bottom-4 right-4 bg-green-900/90 border border-green-700 text-green-300 px-4 py-2 rounded-lg shadow-lg'>
          Setting saved successfully!
        </div>
      )}

      {updateSettingMutation.isError && (
        <div className='fixed bottom-4 right-4 bg-red-900/90 border border-red-700 text-red-300 px-4 py-2 rounded-lg shadow-lg'>
          Failed to save setting: {updateSettingMutation.error?.message}
        </div>
      )}
    </div>
  );
};

export default Settings;
