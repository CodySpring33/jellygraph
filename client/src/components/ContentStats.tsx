import React, { useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatNumber, formatRuntime, useContentStats } from '../hooks/useAnalytics';

const ContentStats: React.FC = () => {
  const { data: contentStats, isLoading, error } = useContentStats();
  const [viewMode, setViewMode] = useState<'bar' | 'pie'>('bar');
  const [sortBy, setSortBy] = useState<'playCount' | 'totalRuntime' | 'uniqueUsers'>('playCount');

  if (isLoading) {
    return (
      <div className='chart-container'>
        <h3 className='chart-title'>Content Statistics</h3>
        <div className='h-64 flex items-center justify-center'>
          <div className='loading-spinner w-8 h-8'></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='chart-container'>
        <h3 className='chart-title'>Content Statistics</h3>
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
          <p className='text-gray-400'>Failed to load content statistics</p>
          {error.message && <p className='text-xs text-gray-500 mt-2'>{error.message}</p>}
        </div>
      </div>
    );
  }

  if (!contentStats?.mostWatchedContent.length) {
    return (
      <div className='chart-container'>
        <h3 className='chart-title'>Content Statistics</h3>
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
              d='M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 110 2h-1v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6H3a1 1 0 110-2h4zM6 6v12h12V6H6zm3 3a1 1 0 112 0v6a1 1 0 11-2 0V9zm4 0a1 1 0 112 0v6a1 1 0 11-2 0V9z'
            />
          </svg>
          <p>No content data available</p>
        </div>
      </div>
    );
  }

  // Sort content based on selected criteria
  const sortedContent = [...contentStats.mostWatchedContent].sort((a, b) => {
    switch (sortBy) {
      case 'totalRuntime':
        return b.totalRuntime - a.totalRuntime;
      case 'uniqueUsers':
        return b.uniqueUsers - a.uniqueUsers;
      default:
        return b.playCount - a.playCount;
    }
  });

  // Prepare data for charts
  const chartData = sortedContent.slice(0, 10).map(content => ({
    name: content.name.length > 20 ? content.name.substring(0, 20) + '...' : content.name,
    fullName: content.name,
    playCount: content.playCount,
    totalHours: Math.round((content.totalRuntime / 3600) * 10) / 10,
    uniqueUsers: content.uniqueUsers,
    type: content.type,
  }));

  // Chart colors
  const COLORS = [
    '#aa5cc8',
    '#00a4dc',
    '#10b981',
    '#f59e0b',
    '#ef4444',
    '#8b5cf6',
    '#06b6d4',
    '#84cc16',
    '#f97316',
    '#ec4899',
  ];

  // Content type distribution for pie chart
  const typeDistribution = contentStats.mostWatchedContent.reduce(
    (acc, content) => {
      const existing = acc.find(item => item.name === content.type);
      if (existing) {
        existing.value += content.playCount;
      } else {
        acc.push({ name: content.type, value: content.playCount });
      }
      return acc;
    },
    [] as { name: string; value: number }[],
  );

  // Custom tooltip for the bar chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className='bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg'>
          <p className='text-white font-medium'>{data.fullName}</p>
          <p className='text-gray-400 text-sm mb-2'>{data.type}</p>
          <p className='text-jellyfin-purple'>
            <span className='font-medium'>{data.playCount}</span> plays
          </p>
          <p className='text-jellyfin-blue'>
            <span className='font-medium'>{data.totalHours}h</span> runtime
          </p>
          <p className='text-green-400'>
            <span className='font-medium'>{data.uniqueUsers}</span> users
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className='chart-container'>
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-3 sm:space-y-0'>
        <h3 className='chart-title'>Most Watched Content</h3>

        <div className='flex flex-wrap items-center space-x-2 space-y-2 sm:space-y-0'>
          {/* Sort Options */}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className='bg-gray-700 border border-gray-600 rounded px-3 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-jellyfin-purple'
          >
            <option value='playCount'>Sort by Plays</option>
            <option value='totalRuntime'>Sort by Runtime</option>
            <option value='uniqueUsers'>Sort by Users</option>
          </select>

          {/* View Mode Toggle */}
          <div className='flex bg-gray-700 rounded-lg p-1'>
            <button
              onClick={() => setViewMode('bar')}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                viewMode === 'bar'
                  ? 'bg-jellyfin-purple text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Bar Chart
            </button>
            <button
              onClick={() => setViewMode('pie')}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                viewMode === 'pie'
                  ? 'bg-jellyfin-purple text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Type Distribution
            </button>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className='mb-6'>
        {viewMode === 'bar' ? (
          <ResponsiveContainer width='100%' height={300}>
            <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray='3 3' stroke='#374151' />
              <XAxis
                dataKey='name'
                stroke='#9ca3af'
                angle={-45}
                textAnchor='end'
                height={80}
                fontSize={12}
              />
              <YAxis stroke='#9ca3af' />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey={sortBy === 'totalRuntime' ? 'totalHours' : sortBy}
                fill='#00a4dc'
                radius={[4, 4, 0, 0]}
                name={
                  sortBy === 'playCount'
                    ? 'Play Count'
                    : sortBy === 'totalRuntime'
                      ? 'Total Hours'
                      : 'Unique Users'
                }
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width='100%' height={300}>
            <PieChart>
              <Pie
                data={typeDistribution}
                dataKey='value'
                nameKey='name'
                cx='50%'
                cy='50%'
                outerRadius={80}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {typeDistribution.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Detailed List */}
      <div className='space-y-3 max-h-64 overflow-y-auto'>
        <div className='text-sm font-medium text-gray-400 px-2'>
          Top {Math.min(sortedContent.length, 20)} Content Items
        </div>
        {sortedContent.slice(0, 20).map((content, index) => (
          <div
            key={content.id}
            className='flex items-center justify-between p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors'
          >
            <div className='flex items-center space-x-3 min-w-0 flex-1'>
              <div className='w-10 h-10 rounded-full bg-gradient-to-br from-jellyfin-blue to-jellyfin-purple flex items-center justify-center text-white font-semibold'>
                {index + 1}
              </div>
              <div className='min-w-0 flex-1'>
                <p className='text-white font-medium truncate'>{content.name}</p>
                <div className='flex items-center space-x-2 text-sm text-gray-400'>
                  <span
                    className={`px-2 py-0.5 rounded text-xs ${
                      content.type === 'Movie'
                        ? 'bg-blue-900/50 text-blue-300'
                        : content.type === 'Episode'
                          ? 'bg-green-900/50 text-green-300'
                          : content.type === 'Audio'
                            ? 'bg-purple-900/50 text-purple-300'
                            : 'bg-gray-700 text-gray-300'
                    }`}
                  >
                    {content.type}
                  </span>
                  <span>{formatRuntime(content.totalRuntime)}</span>
                </div>
              </div>
            </div>

            <div className='text-right'>
              <div className='flex items-center space-x-4'>
                <div className='text-center'>
                  <div className='text-white font-semibold'>{content.playCount}</div>
                  <div className='text-gray-400 text-xs'>plays</div>
                </div>
                <div className='text-center'>
                  <div className='text-white font-semibold'>{content.uniqueUsers}</div>
                  <div className='text-gray-400 text-xs'>users</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className='mt-6 pt-4 border-t border-gray-700'>
        <div className='grid grid-cols-3 gap-4'>
          <div className='text-center'>
            <div className='text-2xl font-bold text-jellyfin-blue'>
              {formatNumber(
                contentStats.mostWatchedContent.reduce(
                  (sum, content) => sum + content.playCount,
                  0,
                ),
              )}
            </div>
            <div className='text-sm text-gray-400'>Total Plays</div>
          </div>
          <div className='text-center'>
            <div className='text-2xl font-bold text-jellyfin-purple'>
              {formatNumber(
                Math.round(
                  contentStats.mostWatchedContent.reduce(
                    (sum, content) => sum + content.totalRuntime,
                    0,
                  ) / 3600,
                ),
              )}
              h
            </div>
            <div className='text-sm text-gray-400'>Total Runtime</div>
          </div>
          <div className='text-center'>
            <div className='text-2xl font-bold text-green-400'>{typeDistribution.length}</div>
            <div className='text-sm text-gray-400'>Content Types</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentStats;
