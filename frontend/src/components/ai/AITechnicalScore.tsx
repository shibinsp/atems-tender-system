import React from 'react';
import {
  Brain,
  Loader2,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  AlertCircle,
  Star
} from 'lucide-react';
import Button from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import type { TechnicalScore } from '../../services/aiService';

interface AITechnicalScoreProps {
  result: TechnicalScore | null;
  loading: boolean;
  onRerun?: () => void;
  bidderName?: string;
}

const getRankColor = (rank: string): string => {
  switch (rank) {
    case 'Excellent':
      return 'text-green-600 bg-green-100';
    case 'Good':
      return 'text-blue-600 bg-blue-100';
    case 'Average':
      return 'text-yellow-600 bg-yellow-100';
    case 'Below Average':
      return 'text-orange-600 bg-orange-100';
    case 'Poor':
      return 'text-red-600 bg-red-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

const getScoreColor = (percentage: number): string => {
  if (percentage >= 80) return 'text-green-600';
  if (percentage >= 60) return 'text-blue-600';
  if (percentage >= 40) return 'text-yellow-600';
  return 'text-red-600';
};

const AITechnicalScore: React.FC<AITechnicalScoreProps> = ({
  result,
  loading,
  onRerun,
  bidderName
}) => {
  if (loading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="relative">
              <Brain className="w-12 h-12 text-primary animate-pulse" />
              <Loader2 className="w-6 h-6 text-primary absolute -bottom-1 -right-1 animate-spin" />
            </div>
            <p className="mt-4 text-lg font-medium text-gray-900">
              AI is scoring technical proposal...
            </p>
            <p className="text-sm text-gray-500">
              Evaluating against all criteria
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!result) {
    return null;
  }

  const hasError = !!result.error;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            AI Technical Evaluation
            {bidderName && (
              <span className="text-sm font-normal text-gray-500">
                - {bidderName}
              </span>
            )}
          </CardTitle>
          {onRerun && (
            <Button variant="outline" size="sm" onClick={onRerun}>
              <RefreshCw className="w-4 h-4 mr-1" />
              Re-evaluate
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Score Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600">Total Score</p>
            <p className={`text-3xl font-bold ${getScoreColor(result.percentage)}`}>
              {result.total_score}
              <span className="text-lg text-gray-400">/{result.max_possible_score}</span>
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600">Percentage</p>
            <p className={`text-3xl font-bold ${getScoreColor(result.percentage)}`}>
              {result.percentage}%
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600">Technical Rank</p>
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getRankColor(result.technical_rank)}`}>
              <Star className="w-4 h-4" />
              {result.technical_rank}
            </span>
          </div>
        </div>

        {/* Score Breakdown */}
        {result.criteria_scores.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Score Breakdown</h4>
            <div className="space-y-4">
              {result.criteria_scores.map((score, index) => {
                const scorePercentage = (score.awarded_score / score.max_score) * 100;
                return (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-gray-900">{score.criterion}</h5>
                      <span className={`font-bold ${getScoreColor(scorePercentage)}`}>
                        {score.awarded_score}/{score.max_score}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                      <div
                        className={`h-2 rounded-full ${
                          scorePercentage >= 80 ? 'bg-green-500' :
                          scorePercentage >= 60 ? 'bg-blue-500' :
                          scorePercentage >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${scorePercentage}%` }}
                      />
                    </div>

                    <p className="text-sm text-gray-600 mb-3">
                      {score.justification}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Strengths */}
                      {score.strengths.length > 0 && (
                        <div className="bg-green-50 rounded-lg p-3">
                          <p className="text-sm font-medium text-green-800 flex items-center gap-1 mb-2">
                            <TrendingUp className="w-4 h-4" />
                            Strengths
                          </p>
                          <ul className="space-y-1">
                            {score.strengths.map((s, i) => (
                              <li key={i} className="text-sm text-green-700 flex items-start gap-1">
                                <CheckCircle className="w-3 h-3 mt-1" />
                                {s}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Weaknesses */}
                      {score.weaknesses.length > 0 && (
                        <div className="bg-red-50 rounded-lg p-3">
                          <p className="text-sm font-medium text-red-800 flex items-center gap-1 mb-2">
                            <TrendingDown className="w-4 h-4" />
                            Weaknesses
                          </p>
                          <ul className="space-y-1">
                            {score.weaknesses.map((w, i) => (
                              <li key={i} className="text-sm text-red-700 flex items-start gap-1">
                                <AlertCircle className="w-3 h-3 mt-1" />
                                {w}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Overall Assessment */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-2">Overall Assessment</h4>
          <p className="text-sm text-blue-700">{result.overall_assessment}</p>
        </div>

        {/* Recommendations */}
        {result.recommendations.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Recommendations</h4>
            <ul className="space-y-2">
              {result.recommendations.map((rec, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-sm text-gray-700 bg-gray-50 p-2 rounded"
                >
                  <span className="text-primary font-bold">{index + 1}.</span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Error Display */}
        {hasError && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <AlertCircle className="w-4 h-4 inline mr-1" />
              Note: {result.error}
            </p>
          </div>
        )}

        {/* AI Notice */}
        <div className="text-xs text-gray-500 border-t pt-4 flex items-center gap-2">
          <Brain className="w-4 h-4" />
          AI-generated scores. Final evaluation should be verified by evaluation committee.
        </div>
      </CardContent>
    </Card>
  );
};

export default AITechnicalScore;
