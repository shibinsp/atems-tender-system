import React from 'react';
import {
  Brain,
  Loader2,
  RefreshCw,
  Trophy,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  IndianRupee,
  BarChart3,
  Award
} from 'lucide-react';
import Button from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import type { ComparativeAnalysis } from '../../services/aiService';

interface AIComparativeAnalysisProps {
  result: ComparativeAnalysis | null;
  loading: boolean;
  onRerun?: () => void;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

const getRiskColor = (level: string): string => {
  switch (level) {
    case 'Low':
      return 'bg-green-100 text-green-700';
    case 'Medium':
      return 'bg-yellow-100 text-yellow-700';
    case 'High':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

const AIComparativeAnalysis: React.FC<AIComparativeAnalysisProps> = ({
  result,
  loading,
  onRerun
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
              AI is generating comparative analysis...
            </p>
            <p className="text-sm text-gray-500">
              Analyzing all bids comprehensively
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
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              AI Comparative Analysis
            </CardTitle>
            {onRerun && (
              <Button variant="outline" size="sm" onClick={onRerun}>
                <RefreshCw className="w-4 h-4 mr-1" />
                Re-analyze
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600">Total Bids</p>
              <p className="text-3xl font-bold text-primary">{result.total_bids}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600">Evaluation Type</p>
              <p className="text-2xl font-bold text-primary">{result.evaluation_type}</p>
              <p className="text-xs text-gray-500">
                {result.evaluation_type === 'L1' && 'Lowest Price'}
                {result.evaluation_type === 'T1' && 'Highest Technical'}
                {result.evaluation_type === 'QCBS' && 'Quality + Cost Based'}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600">Potential Savings</p>
              <p className="text-2xl font-bold text-green-600">
                {result.price_analysis.savings_percentage !== null
                  ? `${result.price_analysis.savings_percentage}%`
                  : 'N/A'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommended Winner */}
      {result.recommended_winner && (
        <Card className="border-2 border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-green-100 rounded-full">
                <Trophy className="w-8 h-8 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-green-600 font-medium">AI Recommended Winner</p>
                <h3 className="text-xl font-bold text-green-800">
                  {result.recommended_winner.bidder_name}
                </h3>
                <p className="text-sm text-green-700 mt-2">
                  {result.recommended_winner.justification}
                </p>
              </div>
              <Award className="w-12 h-12 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ranking Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Bid Ranking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="py-3 px-4 text-left text-sm font-semibold">Rank</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold">Bidder</th>
                  <th className="py-3 px-4 text-right text-sm font-semibold">Technical Score</th>
                  <th className="py-3 px-4 text-right text-sm font-semibold">Financial Amount</th>
                  {result.evaluation_type === 'QCBS' && (
                    <th className="py-3 px-4 text-right text-sm font-semibold">Combined Score</th>
                  )}
                  <th className="py-3 px-4 text-left text-sm font-semibold">Assessment</th>
                </tr>
              </thead>
              <tbody>
                {result.ranking.map((bid) => (
                  <tr key={bid.bid_id} className={`border-b ${bid.rank === 1 ? 'bg-green-50' : ''}`}>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                        bid.rank === 1
                          ? 'bg-green-500 text-white'
                          : bid.rank === 2
                            ? 'bg-blue-500 text-white'
                            : bid.rank === 3
                              ? 'bg-yellow-500 text-white'
                              : 'bg-gray-300 text-gray-700'
                      }`}>
                        {bid.rank}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-gray-900">{bid.bidder_name}</p>
                      <p className="text-xs text-gray-500">{bid.bid_id}</p>
                    </td>
                    <td className="py-3 px-4 text-right font-medium">
                      {bid.technical_score !== null ? bid.technical_score : '-'}
                    </td>
                    <td className="py-3 px-4 text-right font-medium">
                      {formatCurrency(bid.financial_amount)}
                    </td>
                    {result.evaluation_type === 'QCBS' && (
                      <td className="py-3 px-4 text-right font-medium">
                        {bid.combined_score !== null ? bid.combined_score.toFixed(2) : '-'}
                      </td>
                    )}
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        {bid.key_strengths.slice(0, 2).map((s, i) => (
                          <p key={i} className="text-xs text-green-600 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            {s}
                          </p>
                        ))}
                        {bid.key_concerns.slice(0, 2).map((c, i) => (
                          <p key={i} className="text-xs text-red-600 flex items-center gap-1">
                            <TrendingDown className="w-3 h-3" />
                            {c}
                          </p>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Price Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IndianRupee className="w-5 h-5" />
            Price Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600">Lowest Price (L1)</p>
              <p className="text-lg font-bold text-green-600">
                {formatCurrency(result.price_analysis.lowest_price)}
              </p>
            </div>
            <div className="bg-red-50 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600">Highest Price</p>
              <p className="text-lg font-bold text-red-600">
                {formatCurrency(result.price_analysis.highest_price)}
              </p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600">Average Price</p>
              <p className="text-lg font-bold text-blue-600">
                {formatCurrency(result.price_analysis.average_price)}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600">Estimated Value</p>
              <p className="text-lg font-bold text-gray-600">
                {result.price_analysis.estimated_value
                  ? formatCurrency(result.price_analysis.estimated_value)
                  : 'N/A'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Assessment */}
      {result.risk_assessment.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Risk Assessment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {result.risk_assessment.map((risk, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{risk.bidder_name}</h4>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRiskColor(risk.risk_level)}`}>
                      {risk.risk_level} Risk
                    </span>
                  </div>
                  <ul className="space-y-1">
                    {risk.risk_factors.map((factor, i) => (
                      <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-1.5" />
                        {factor}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary & Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Summary & Recommendations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">Executive Summary</h4>
            <p className="text-sm text-blue-700">{result.summary}</p>
          </div>

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
        </CardContent>
      </Card>

      {/* Error Display */}
      {hasError && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <p className="text-sm text-yellow-800">
              <AlertTriangle className="w-4 h-4 inline mr-1" />
              Analysis Note: {result.error}
            </p>
          </CardContent>
        </Card>
      )}

      {/* AI Notice */}
      <div className="text-xs text-gray-500 flex items-center gap-2 justify-center">
        <Brain className="w-4 h-4" />
        AI-generated analysis. Final decision should be made by the evaluation committee.
      </div>
    </div>
  );
};

export default AIComparativeAnalysis;
