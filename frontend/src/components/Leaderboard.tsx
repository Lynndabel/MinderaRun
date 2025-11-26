'use client';

import { useState, useEffect } from 'react';
import { Trophy, Medal, Award, Crown, Star, Users, Zap } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';

interface LeaderboardEntry {
  rank: number;
  player: string;
  walletAddress: string;
  score: number;
  stage: number;
  tokens: number;
  nfts: number;
  completionTime?: number;
  streakDays: number;
  totalGamesPlayed: number;
}

interface Tournament {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  prizePool: number;
  participants: number;
  status: 'upcoming' | 'active' | 'completed';
}

export function Leaderboard() {
  const showNotification = useGameStore(state => state.showNotification);
  const { player, walletAddress } = useGameStore();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'all'>('all');
  const [leaderboardType, setLeaderboardType] = useState<'score' | 'tokens' | 'speed'>('score');

  useEffect(() => {
    // Simulate fetching leaderboard data
    const mockData: LeaderboardEntry[] = [
      { rank: 1, player: 'CryptoRunner', walletAddress: '0.0.123456', score: 15420, stage: 5, tokens: 2500, nfts: 8, completionTime: 145, streakDays: 12, totalGamesPlayed: 45 },
      { rank: 2, player: 'BlockchainGamer', walletAddress: '0.0.123457', score: 14280, stage: 4, tokens: 2200, nfts: 6, completionTime: 178, streakDays: 8, totalGamesPlayed: 38 },
      { rank: 3, player: 'HederaHero', walletAddress: '0.0.123458', score: 13850, stage: 4, tokens: 2100, nfts: 5, completionTime: 189, streakDays: 15, totalGamesPlayed: 42 },
      { rank: 4, player: 'MindoraMaster', walletAddress: '0.0.123459', score: 12500, stage: 3, tokens: 1800, nfts: 4, completionTime: 205, streakDays: 5, totalGamesPlayed: 32 },
      { rank: 5, player: 'QuizChampion', walletAddress: '0.0.123460', score: 11800, stage: 3, tokens: 1600, nfts: 3, completionTime: 198, streakDays: 20, totalGamesPlayed: 55 },
      { rank: 6, player: 'TokenCollector', walletAddress: '0.0.123461', score: 11200, stage: 3, tokens: 1500, nfts: 3, completionTime: 234, streakDays: 3, totalGamesPlayed: 28 },
      { rank: 7, player: 'NFTHunter', walletAddress: '0.0.123462', score: 10800, stage: 2, tokens: 1400, nfts: 2, completionTime: 289, streakDays: 7, totalGamesPlayed: 25 },
      { rank: 8, player: 'GameFiGuru', walletAddress: '0.0.123463', score: 10200, stage: 2, tokens: 1300, nfts: 2, completionTime: 312, streakDays: 4, totalGamesPlayed: 30 },
      { rank: 9, player: 'EduGamer', walletAddress: '0.0.123464', score: 9800, stage: 2, tokens: 1200, nfts: 2, completionTime: 298, streakDays: 11, totalGamesPlayed: 35 },
      { rank: 10, player: 'LearningLegend', walletAddress: '0.0.123465', score: 9200, stage: 2, tokens: 1100, nfts: 1, completionTime: 356, streakDays: 1, totalGamesPlayed: 18 },
    ];

    const mockTournaments: Tournament[] = [
      {
        id: 'weekly-challenge',
        name: 'Weekly Blockchain Challenge',
        startTime: '2024-01-22T00:00:00Z',
        endTime: '2024-01-28T23:59:59Z',
        prizePool: 10000,
        participants: 234,
        status: 'active'
      },
      {
        id: 'speed-run',
        name: 'Hedera Speed Run',
        startTime: '2024-01-25T12:00:00Z',
        endTime: '2024-01-25T18:00:00Z',
        prizePool: 5000,
        participants: 89,
        status: 'upcoming'
      },
      {
        id: 'knowledge-master',
        name: 'Knowledge Master Tournament',
        startTime: '2024-01-15T00:00:00Z',
        endTime: '2024-01-21T23:59:59Z',
        prizePool: 8000,
        participants: 156,
        status: 'completed'
      }
    ];

    setTimeout(() => {
      setLeaderboard(mockData);
      setTournaments(mockTournaments);
      setLoading(false);
    }, 1000);
  }, [timeframe, leaderboardType]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <Trophy className="w-5 h-5 text-gray-400" />;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
      case 3:
        return 'bg-gradient-to-r from-amber-500 to-amber-700 text-white';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading leaderboard...</span>
      </div>
    );
  }

  const getSortedLeaderboard = () => {
    return [...leaderboard].sort((a, b) => {
      switch (leaderboardType) {
        case 'tokens':
          return b.tokens - a.tokens;
        case 'speed':
          return (a.completionTime || 999) - (b.completionTime || 999);
        default:
          return b.score - a.score;
      }
    }).map((entry, index) => ({ ...entry, rank: index + 1 }));
  };

  const getLeaderboardValue = (entry: LeaderboardEntry) => {
    switch (leaderboardType) {
      case 'tokens':
        return `${entry.tokens.toLocaleString()} tokens`;
      case 'speed':
        return entry.completionTime ? `${entry.completionTime}s` : '--';
      default:
        return `${entry.score.toLocaleString()} points`;
    }
  };

  const getPlayerRank = () => {
    if (!walletAddress) return null;
    const sortedBoard = getSortedLeaderboard();
    return sortedBoard.find(entry => entry.walletAddress === walletAddress);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Tournament Section */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center">
          <Trophy className="w-6 h-6 mr-2" />
          Active Tournaments
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tournaments.map((tournament) => (
            <div key={tournament.id} className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-sm">{tournament.name}</h3>
                <span className={`px-2 py-1 rounded text-xs font-bold ${
                  tournament.status === 'active' ? 'bg-green-500' :
                  tournament.status === 'upcoming' ? 'bg-yellow-500' :
                  'bg-gray-500'
                }`}>
                  {tournament.status}
                </span>
              </div>
              <div className="space-y-1 text-sm opacity-90">
                <div className="flex justify-between">
                  <span>Prize Pool:</span>
                  <span className="font-bold">{tournament.prizePool.toLocaleString()} QC</span>
                </div>
                <div className="flex justify-between">
                  <span>Participants:</span>
                  <span>{tournament.participants}</span>
                </div>
                <div className="flex justify-between">
                  <span>Ends:</span>
                  <span>{formatDate(tournament.endTime)}</span>
                </div>
              </div>
              <button
                className="w-full mt-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-bold py-2 px-4 rounded transition-colors"
                onClick={() => showNotification('info', 'Coming Soon', 'Tournament feature coming soon!')}
              >
                {tournament.status === 'upcoming' ? 'Register' : 'View Details'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Leaderboard Controls */}
      <div className="flex flex-wrap gap-4 justify-between items-center">
        {/* Timeframe Selector */}
        <div className="flex space-x-2">
          {(['daily', 'weekly', 'all'] as const).map((time) => (
            <button
              key={time}
              onClick={() => setTimeframe(time)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                timeframe === time
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {time.charAt(0).toUpperCase() + time.slice(1)}
            </button>
          ))}
        </div>

        {/* Leaderboard Type Selector */}
        <div className="flex space-x-2">
          <button
            onClick={() => setLeaderboardType('score')}
            className={`flex items-center space-x-1 px-3 py-2 rounded-lg font-medium transition-colors ${
              leaderboardType === 'score'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <Star className="w-4 h-4" />
            <span>Score</span>
          </button>
          <button
            onClick={() => setLeaderboardType('tokens')}
            className={`flex items-center space-x-1 px-3 py-2 rounded-lg font-medium transition-colors ${
              leaderboardType === 'tokens'
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Tokens</span>
          </button>
          <button
            onClick={() => setLeaderboardType('speed')}
            className={`flex items-center space-x-1 px-3 py-2 rounded-lg font-medium transition-colors ${
              leaderboardType === 'speed'
                ? 'bg-red-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Speed</span>
          </button>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="space-y-2">
        {getSortedLeaderboard().map((entry) => (
          <div
            key={entry.walletAddress}
            className={`flex items-center p-4 rounded-lg transition-all hover:scale-102 ${getRankColor(entry.rank)} ${
              entry.walletAddress === walletAddress ? 'ring-2 ring-blue-400' : ''
            }`}
          >
            <div className="flex items-center space-x-3 flex-1">
              <div className="flex items-center space-x-2">
                {getRankIcon(entry.rank)}
                <span className="font-bold text-lg">#{entry.rank}</span>
              </div>
              <div className="flex-1">
                <div className="font-semibold text-lg flex items-center space-x-2">
                  <span>{entry.player}</span>
                  {entry.streakDays > 7 && (
                    <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                      🔥 {entry.streakDays} day streak
                    </span>
                  )}
                </div>
                <div className="text-sm opacity-90">
                  Stage {entry.stage} • {entry.nfts} NFTs • {entry.totalGamesPlayed} games played
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-xl">{getLeaderboardValue(entry)}</div>
              <div className="text-sm opacity-90">
                {leaderboardType === 'score' && 'points'}
                {leaderboardType === 'tokens' && 'earned'}
                {leaderboardType === 'speed' && 'avg time'}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Your Rank */}
      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-blue-900 flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Your Rank
            </h3>
            <p className="text-sm text-blue-700">
              {walletAddress ? 'Your current position' : 'Connect your wallet to see your position'}
            </p>
          </div>
          <div className="text-right">
            {(() => {
              const playerRank = getPlayerRank();
              if (playerRank) {
                return (
                  <>
                    <div className="text-2xl font-bold text-blue-900">#{playerRank.rank}</div>
                    <div className="text-sm text-blue-700">{getLeaderboardValue(playerRank)}</div>
                  </>
                );
              }
              return (
                <>
                  <div className="text-2xl font-bold text-blue-900">--</div>
                  <div className="text-sm text-blue-700">Not ranked</div>
                </>
              );
            })()}
          </div>
        </div>
        {walletAddress && (
          <div className="mt-4 pt-4 border-t border-blue-200">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-blue-900">{player?.totalScore || 0}</div>
                <div className="text-xs text-blue-700">Total Score</div>
              </div>
              <div>
                <div className="text-lg font-bold text-blue-900">{player?.tokensEarned || 0}</div>
                <div className="text-xs text-blue-700">Tokens Earned</div>
              </div>
              <div>
                <div className="text-lg font-bold text-blue-900">{player?.currentStage || 1}</div>
                <div className="text-xs text-blue-700">Current Stage</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Leaderboard Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-600">{leaderboard.length}</div>
          <div className="text-sm text-green-800">Total Players</div>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-600">
            {Math.round(leaderboard.reduce((sum, p) => sum + p.score, 0) / leaderboard.length).toLocaleString()}
          </div>
          <div className="text-sm text-blue-800">Avg Score</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-purple-600">
            {leaderboard.reduce((sum, p) => sum + p.tokens, 0).toLocaleString()}
          </div>
          <div className="text-sm text-purple-800">Total Tokens</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {leaderboard.reduce((sum, p) => sum + p.nfts, 0)}
          </div>
          <div className="text-sm text-yellow-800">Total NFTs</div>
        </div>
      </div>
    </div>
  );
}
