import React from 'react';
import { Award, TrendingUp, Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import Button from '../ui/Button';
import type { EvaluationResult } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface RankingDisplayProps {
  result: EvaluationResult;
  onDeclareWinner?: (bidId: number) => void;
  showDeclareButton?: boolean;
}

const RankingDisplay: React.FC<RankingDisplayProps> = ({
  result,
  onDeclareWinner,
  showDeclareButton = false
}) => {
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'L1': return 'Lowest Price (L1)';
      case 'T1': return 'Highest Technical (T1)';
      case 'QCBS': return 'Quality & Cost Based (QCBS)';
      default: return type;
    }
  };

  const getTypeDescription = (type: string) => {
    switch (type) {
      case 'L1': return 'Rankings based on lowest financial bid among qualified bidders';
      case 'T1': return 'Rankings based on highest technical score';
      case 'QCBS': return `Rankings based on combined score (Technical: ${result.weights?.technical ? (result.weights.technical * 100).toFixed(0) : 70}%, Financial: ${result.weights?.financial ? (result.weights.financial * 100).toFixed(0) : 30}%)`;
      default: return '';
    }
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'bg-yellow-100 border-yellow-400 text-yellow-800';
    if (rank === 2) return 'bg-gray-100 border-gray-400 text-gray-800';
    if (rank === 3) return 'bg-amber-100 border-amber-400 text-amber-800';
    return 'bg-white border-gray-200 text-gray-700';
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-600" />;
    if (rank === 2) return <Award className="w-6 h-6 text-gray-500" />;
    if (rank === 3) return <Award className="w-6 h-6 text-amber-600" />;
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            {getTypeLabel(result.evaluation_type)}
          </div>
          <div className="text-sm font-normal text-gray-500">
            {result.qualified_bids} of {result.total_bids} bids qualified
          </div>
        </CardTitle>
        <p className="text-sm text-gray-600 mt-1">{getTypeDescription(result.evaluation_type)}</p>
      </CardHeader>
      <CardContent>
        {result.rankings.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Award className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>No qualified bids to rank</p>
          </div>
        ) : (
          <div className="space-y-3">
            {result.rankings.map((ranking) => (
              <div
                key={ranking.bid_id}
                className={`flex items-center justify-between p-4 rounded-lg border-2 ${getRankColor(ranking.rank)}`}
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white border-2 border-current">
                    {getRankIcon(ranking.rank) || (
                      <span className="text-lg font-bold">{ranking.rank}</span>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">{ranking.bidder_name}</span>
                      <span className="text-xs bg-gray-200 px-2 py-0.5 rounded">{ranking.label}</span>
                    </div>
                    {ranking.status && (
                      <span className={`text-xs font-medium ${
                        ranking.status === 'Winner' || ranking.status === 'Recommended' || ranking.status === 'Highest Technical'
                          ? 'text-green-600'
                          : 'text-gray-600'
                      }`}>
                        {ranking.status}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-6 text-sm">
                  {ranking.technical_score !== undefined && (
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Technical</p>
                      <p className="font-semibold">{ranking.technical_score.toFixed(2)}</p>
                    </div>
                  )}
                  {ranking.financial_amount !== undefined && (
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Amount</p>
                      <p className="font-semibold">{formatCurrency(ranking.financial_amount)}</p>
                    </div>
                  )}
                  {ranking.financial_score !== undefined && (
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Fin. Score</p>
                      <p className="font-semibold">{ranking.financial_score.toFixed(2)}</p>
                    </div>
                  )}
                  {ranking.combined_score !== undefined && (
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Combined</p>
                      <p className="font-bold text-primary">{ranking.combined_score.toFixed(2)}</p>
                    </div>
                  )}
                  {showDeclareButton && ranking.rank === 1 && onDeclareWinner && (
                    <Button
                      size="sm"
                      onClick={() => onDeclareWinner(ranking.bid_id)}
                    >
                      Declare Winner
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        <div className="mt-6 grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{result.total_bids}</p>
            <p className="text-xs text-gray-500">Total Bids</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{result.qualified_bids}</p>
            <p className="text-xs text-gray-500">Qualified</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">{result.disqualified_bids}</p>
            <p className="text-xs text-gray-500">Disqualified</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RankingDisplay;
