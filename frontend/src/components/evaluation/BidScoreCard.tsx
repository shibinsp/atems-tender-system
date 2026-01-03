import React from 'react';
import { FileText, IndianRupee, Award, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import Button from '../ui/Button';
import type { Bid, EvaluationCriteria, Evaluation } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface BidScoreCardProps {
  bid: Bid;
  bidderName: string;
  criteria: EvaluationCriteria[];
  evaluations: Evaluation[];
  onScore: (bidId: number) => void;
  isScoring?: boolean;
}

const BidScoreCard: React.FC<BidScoreCardProps> = ({
  bid,
  bidderName,
  criteria,
  evaluations,
  onScore,
  isScoring = false
}) => {
  const totalMaxScore = criteria.reduce((sum, c) => sum + c.max_score * (c.weight / 100), 0);
  const currentScore = evaluations.reduce((sum, e) => {
    const criterion = criteria.find(c => c.id === e.criteria_id);
    if (criterion) {
      return sum + e.score * (criterion.weight / 100);
    }
    return sum;
  }, 0);

  const scoredCount = evaluations.length;
  const totalCriteria = criteria.length;
  const isComplete = scoredCount === totalCriteria;
  const scorePercentage = totalMaxScore > 0 ? (currentScore / totalMaxScore) * 100 : 0;

  return (
    <Card className={`${isScoring ? 'ring-2 ring-primary' : ''}`}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold text-gray-900">{bidderName}</h3>
            <p className="text-sm text-gray-500 font-mono">{bid.bid_number}</p>
          </div>
          <div className="flex items-center gap-2">
            {bid.is_qualified !== undefined && (
              bid.is_qualified ? (
                <span className="flex items-center text-sm text-green-600">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Qualified
                </span>
              ) : (
                <span className="flex items-center text-sm text-red-600">
                  <XCircle className="w-4 h-4 mr-1" />
                  Disqualified
                </span>
              )
            )}
            {bid.rank && (
              <span className="flex items-center justify-center w-8 h-8 bg-primary text-white rounded-full text-sm font-bold">
                {bid.rank}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center text-gray-600 mb-1">
              <FileText className="w-4 h-4 mr-1" />
              <span className="text-xs">Technical Score</span>
            </div>
            <p className="text-lg font-semibold">
              {bid.technical_score?.toFixed(2) || currentScore.toFixed(2)}
              <span className="text-sm font-normal text-gray-500">/{totalMaxScore.toFixed(0)}</span>
            </p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center text-gray-600 mb-1">
              <IndianRupee className="w-4 h-4 mr-1" />
              <span className="text-xs">Financial Bid</span>
            </div>
            <p className="text-lg font-semibold">
              {bid.financial_amount ? formatCurrency(bid.financial_amount) : '-'}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-gray-600">Evaluation Progress</span>
            <span className="font-medium">{scoredCount}/{totalCriteria} criteria</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                isComplete ? 'bg-green-500' : 'bg-primary'
              }`}
              style={{ width: `${(scoredCount / totalCriteria) * 100}%` }}
            />
          </div>
        </div>

        {/* Score percentage */}
        {isComplete && (
          <div className={`p-3 rounded-lg mb-4 ${
            scorePercentage >= 60 ? 'bg-green-50' : 'bg-red-50'
          }`}>
            <div className="flex items-center justify-between">
              <span className={`text-sm font-medium ${
                scorePercentage >= 60 ? 'text-green-700' : 'text-red-700'
              }`}>
                Overall Score: {scorePercentage.toFixed(1)}%
              </span>
              {scorePercentage >= 60 ? (
                <Award className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
            </div>
            <p className={`text-xs mt-1 ${
              scorePercentage >= 60 ? 'text-green-600' : 'text-red-600'
            }`}>
              {scorePercentage >= 60 ? 'Meets minimum qualifying score' : 'Below minimum qualifying score (60%)'}
            </p>
          </div>
        )}

        <Button
          className="w-full"
          variant={isComplete ? 'outline' : 'primary'}
          onClick={() => onScore(bid.id)}
        >
          {isComplete ? 'Review Scores' : 'Score This Bid'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default BidScoreCard;
