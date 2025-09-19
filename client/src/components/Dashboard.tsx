import React, { useState } from 'react';
import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  formatNumber,
  formatRuntime,
  useActiveSessions,
  useActivityTimeline,
  useDashboardOverview,
} from '../hooks/useAnalytics';
import ContentStats from './ContentStats';
import UserStats from './UserStats';

const Dashboard: React.FC = () => {
  const [timelineDays, setTimelineDays] = useState(7);

  const {
    data: overview,
    isLoading: overviewLoading,
    error: overviewError,
  } = useDashboardOverview();

  const { data: timeline, isLoading: timelineLoading } = useActivityTimeline(timelineDays);

  const { data: sessions, isLoading: sessionsLoading } = useActiveSessions();

  // Loading component
  const LoadingCard = () => (
    <div className='card card-padding animate-pulse'>
      <div className='shimmer h-4 rounded mb-4'></div>
      <div className='shimmer h-8 rounded'></div>
    </div>
  );

  // Error component
  const ErrorCard = ({ error }: { error?: any }) => (
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
        <p className='text-gray-400'>Failed to load data</p>
        {error?.message && <p className='text-xs text-gray-500 mt-2'>{error.message}</p>}
      </div>
    </div>
  );

  // Chart colors
  const COLORS = ['#aa5cc8', '#00a4dc', '#10b981', '#f59e0b', '#ef4444'];

  // Prepare timeline data for chart
  const timelineData =
    timeline?.map(point => ({
      date: new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      activities: point.count,
      watchTime: Math.round((point.totalRuntime / 3600) * 10) / 10, // Convert to hours with 1 decimal
    })) || [];

  // Prepare active sessions data for pie chart
  const sessionData =
    sessions?.reduce(
      (acc, session) => {
        if (session.NowPlayingItem) {
          const type = session.NowPlayingItem.Type;
          const existing = acc.find(item => item.name === type);
          if (existing) {
            existing.value++;
          } else {
            acc.push({ name: type, value: 1 });
          }
        }
        return acc;
      },
      [] as { name: string; value: number }[],
    ) || [];

  return (
    <div className='space-y-8 animate-fade-in'>
      {/* Overview Stats */}
      <section>
        <h2 className='text-2xl font-bold text-white mb-6'>Dashboard Overview</h2>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
          {overviewLoading ? (
            Array.from({ length: 4 }).map((_, i) => <LoadingCard key={i} />)
          ) : overviewError ? (
            <ErrorCard error={overviewError} />
          ) : (
            <>
              <div className='stat-card'>
                <div className='stat-value text-jellyfin-purple'>
                  {formatNumber(overview?.totalUsers || 0)}
                </div>
                <div className='stat-label'>Total Users</div>
              </div>

              <div className='stat-card'>
                <div className='stat-value text-jellyfin-blue'>
                  {formatNumber(overview?.totalContent || 0)}
                </div>
                <div className='stat-label'>Content Items</div>
              </div>

              <div className='stat-card'>
                <div className='stat-value text-green-400'>{overview?.activeSessions || 0}</div>
                <div className='stat-label'>Active Sessions</div>
              </div>

              <div className='stat-card'>
                <div className='stat-value text-yellow-400'>{overview?.totalWatchTime || 0}h</div>
                <div className='stat-label'>Total Watch Time</div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Activity Timeline */}
      <section>
        <div className='chart-container'>
          <div className='flex justify-between items-center mb-6'>
            <h3 className='chart-title'>Activity Timeline</h3>
            <select
              value={timelineDays}
              onChange={e => setTimelineDays(Number(e.target.value))}
              className='bg-gray-700 border border-gray-600 rounded px-3 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-jellyfin-purple'
            >
              <option value={7}>Last 7 days</option>
              <option value={14}>Last 14 days</option>
              <option value={30}>Last 30 days</option>
            </select>
          </div>

          {timelineLoading ? (
            <div className='h-64 flex items-center justify-center'>
              <div className='loading-spinner w-8 h-8'></div>
            </div>
          ) : (
            <ResponsiveContainer width='100%' height={300}>
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray='3 3' stroke='#374151' />
                <XAxis dataKey='date' stroke='#9ca3af' />
                <YAxis stroke='#9ca3af' />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                  }}
                />
                <Line
                  type='monotone'
                  dataKey='activities'
                  stroke='#aa5cc8'
                  strokeWidth={2}
                  dot={{ fill: '#aa5cc8', strokeWidth: 2 }}
                  name='Activities'
                />
                <Line
                  type='monotone'
                  dataKey='watchTime'
                  stroke='#00a4dc'
                  strokeWidth={2}
                  dot={{ fill: '#00a4dc', strokeWidth: 2 }}
                  name='Watch Time (hours)'
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      {/* Current Sessions and Top Content/Users */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
        {/* Active Sessions */}
        <section>
          <div className='chart-container'>
            <h3 className='chart-title'>Current Active Sessions</h3>

            {sessionsLoading ? (
              <div className='h-64 flex items-center justify-center'>
                <div className='loading-spinner w-8 h-8'></div>
              </div>
            ) : !sessions?.length ? (
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
                    d='M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-6m-10 0h6m0 0v-5'
                  />
                </svg>
                <p>No active sessions</p>
              </div>
            ) : (
              <div className='space-y-4'>
                {sessionData.length > 0 && (
                  <div className='h-48 mb-4'>
                    <ResponsiveContainer width='100%' height='100%'>
                      <PieChart>
                        <Pie
                          data={sessionData}
                          dataKey='value'
                          nameKey='name'
                          cx='50%'
                          cy='50%'
                          outerRadius={60}
                          fill='#8884d8'
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          {sessionData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}

                <div className='space-y-3 max-h-32 overflow-y-auto'>
                  {sessions
                    .filter(s => s.NowPlayingItem)
                    .map(session => (
                      <div
                        key={session.Id}
                        className='flex items-center justify-between p-3 bg-gray-700/50 rounded-lg'
                      >
                        <div className='flex-1 min-w-0'>
                          <p className='text-white font-medium truncate'>
                            {session.NowPlayingItem?.Name}
                          </p>
                          <p className='text-gray-400 text-sm'>
                            {session.UserName} • {session.DeviceName}
                          </p>
                        </div>
                        <div className='flex items-center space-x-2'>
                          <span
                            className={`status-badge ${
                              session.PlayState?.IsPaused
                                ? 'bg-yellow-900/50 text-yellow-300'
                                : 'status-active'
                            }`}
                          >
                            {session.PlayState?.IsPaused ? 'Paused' : 'Playing'}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Quick Overview Cards */}
        <section>
          <div className='space-y-6'>
            {/* Top Users Mini Chart */}
            <div className='chart-container'>
              <h3 className='chart-title'>Top Users</h3>
              <div className='space-y-3'>
                {overview?.topUsers.slice(0, 5).map((user, index) => (
                  <div key={user.id} className='flex items-center justify-between'>
                    <div className='flex items-center space-x-3'>
                      <div className='w-8 h-8 rounded-full bg-jellyfin-purple/20 flex items-center justify-center text-jellyfin-purple font-semibold text-sm'>
                        {index + 1}
                      </div>
                      <span className='text-white'>{user.name}</span>
                    </div>
                    <div className='text-right'>
                      <div className='text-white font-medium'>{user.playCount} plays</div>
                      <div className='text-gray-400 text-sm'>
                        {formatRuntime(user.totalRuntime)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Content Mini Chart */}
            <div className='chart-container'>
              <h3 className='chart-title'>Top Content</h3>
              <div className='space-y-3'>
                {overview?.topContent.slice(0, 5).map((content, index) => (
                  <div key={content.id} className='flex items-center justify-between'>
                    <div className='flex items-center space-x-3'>
                      <div className='w-8 h-8 rounded-full bg-jellyfin-blue/20 flex items-center justify-center text-jellyfin-blue font-semibold text-sm'>
                        {index + 1}
                      </div>
                      <div className='min-w-0 flex-1'>
                        <span className='text-white truncate block'>{content.name}</span>
                        <span className='text-gray-400 text-sm'>{content.type}</span>
                      </div>
                    </div>
                    <div className='text-white font-medium'>{content.playCount} plays</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Detailed User and Content Stats */}
      <div className='grid grid-cols-1 xl:grid-cols-2 gap-8'>
        <UserStats />
        <ContentStats />
      </div>
    </div>
  );
};

export default Dashboard;
