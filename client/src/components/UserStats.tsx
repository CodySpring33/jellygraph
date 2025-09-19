import React from 'react';
import { useUserStats } from '../hooks/useAnalytics';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatRuntime, formatNumber, getRelativeTime } from '../hooks/useAnalytics';

const UserStats: React.FC = () => {
  const { data: userStats, isLoading, error } = useUserStats();

  if (isLoading) {
    return (
      <div className="chart-container">
        <h3 className="chart-title">User Statistics</h3>
        <div className="h-64 flex items-center justify-center">
          <div className="loading-spinner w-8 h-8"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chart-container">
        <h3 className="chart-title">User Statistics</h3>
        <div className="error-state">
          <svg className="w-12 h-12 mx-auto mb-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-400">Failed to load user statistics</p>
          {error.message && (
            <p className="text-xs text-gray-500 mt-2">{error.message}</p>
          )}
        </div>
      </div>
    );
  }

  if (!userStats?.mostActiveUsers.length) {
    return (
      <div className="chart-container">
        <h3 className="chart-title">User Statistics</h3>
        <div className="error-state">
          <svg className="w-12 h-12 mx-auto mb-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p>No user data available</p>
        </div>
      </div>
    );
  }

  // Prepare data for bar chart (top 10 users)
  const chartData = userStats.mostActiveUsers.slice(0, 10).map(user => ({
    name: user.name.length > 15 ? user.name.substring(0, 15) + '...' : user.name,
    fullName: user.name,
    playCount: user.playCount,
    totalHours: Math.round(user.totalRuntime / 3600 * 10) / 10,
    lastActivity: user.lastActivity,
  }));

  // Custom tooltip for the bar chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium">{data.fullName}</p>
          <p className="text-jellyfin-purple">
            <span className="font-medium">{data.playCount}</span> plays
          </p>
          <p className="text-jellyfin-blue">
            <span className="font-medium">{data.totalHours}h</span> watched
          </p>
          {data.lastActivity && (
            <p className="text-gray-400 text-sm">
              Last active: {getRelativeTime(data.lastActivity)}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="chart-container">
      <div className="flex justify-between items-center mb-6">
        <h3 className="chart-title">Most Active Users</h3>
        <div className="text-sm text-gray-400">
          Top {Math.min(userStats.mostActiveUsers.length, 10)} users
        </div>
      </div>

      {/* Bar Chart */}
      <div className="mb-6">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="name" 
              stroke="#9ca3af" 
              angle={-45}
              textAnchor="end"
              height={80}
              fontSize={12}
            />
            <YAxis stroke="#9ca3af" />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="playCount" 
              fill="#aa5cc8" 
              radius={[4, 4, 0, 0]}
              name="Play Count"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Detailed List */}
      <div className="space-y-3 max-h-64 overflow-y-auto">
        <div className="text-sm font-medium text-gray-400 px-2">
          Detailed Statistics
        </div>
        {userStats.mostActiveUsers.map((user, index) => (
          <div
            key={user.id}
            className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-jellyfin-purple to-jellyfin-blue flex items-center justify-center text-white font-semibold">
                {index + 1}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-white font-medium truncate">{user.name}</p>
                <p className="text-gray-400 text-sm">
                  Last seen: {getRelativeTime(user.lastActivity)}
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <div className="text-white font-semibold">{user.playCount}</div>
                  <div className="text-gray-400 text-xs">plays</div>
                </div>
                <div className="text-center">
                  <div className="text-white font-semibold">
                    {formatRuntime(user.totalRuntime)}
                  </div>
                  <div className="text-gray-400 text-xs">watched</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 pt-4 border-t border-gray-700">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-jellyfin-purple">
              {formatNumber(userStats.mostActiveUsers.reduce((sum, user) => sum + user.playCount, 0))}
            </div>
            <div className="text-sm text-gray-400">Total Plays</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-jellyfin-blue">
              {formatNumber(
                Math.round(userStats.mostActiveUsers.reduce((sum, user) => sum + user.totalRuntime, 0) / 3600)
              )}h
            </div>
            <div className="text-sm text-gray-400">Total Hours</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              {Math.round(
                userStats.mostActiveUsers.reduce((sum, user) => sum + user.totalRuntime, 0) / 
                3600 / userStats.mostActiveUsers.length * 10
              ) / 10}h
            </div>
            <div className="text-sm text-gray-400">Avg per User</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserStats;
