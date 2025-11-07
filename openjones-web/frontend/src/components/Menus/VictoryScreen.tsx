import React from 'react';
import type { VictoryScreenProps } from './types';

export const VictoryScreen: React.FC<VictoryScreenProps> = ({
  stats,
  onPlayAgain,
  onMainMenu,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <div className="bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-lg shadow-2xl p-8 max-w-2xl w-full mx-4">
        {/* Victory Header */}
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold text-white mb-2 animate-bounce">
            🎉 VICTORY! 🎉
          </h1>
          <p className="text-2xl text-yellow-900">
            Congratulations! You've made it in the fast lane!
          </p>
        </div>

        {/* Statistics */}
        <div className="bg-white rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Final Statistics
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <StatItem label="Wealth" value={`$${stats.finalWealth.toLocaleString()}`} />
            <StatItem label="Weeks Played" value={stats.weeksPlayed.toString()} />
            <StatItem label="Health" value={`${stats.finalHealth}%`} />
            <StatItem label="Happiness" value={`${stats.finalHappiness}%`} />
            <StatItem label="Education" value={`Level ${stats.finalEducation}`} />
            <StatItem label="Career" value={`Level ${stats.finalCareer}`} />
          </div>

          {/* Goals Achieved */}
          {stats.goalsAchieved.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-green-700 mb-2">
                ✅ Goals Achieved:
              </h3>
              <ul className="list-disc list-inside text-gray-700">
                {stats.goalsAchieved.map((goal, index) => (
                  <li key={index}>{goal}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={onPlayAgain}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            aria-label="Play the game again"
          >
            Play Again
          </button>
          <button
            onClick={onMainMenu}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            aria-label="Return to main menu"
          >
            Main Menu
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper component for stat items
const StatItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
    <span className="font-medium text-gray-700">{label}:</span>
    <span className="font-bold text-gray-900">{value}</span>
  </div>
);
