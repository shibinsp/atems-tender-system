import React from 'react';
import {
  Brain,
  Loader2,
  RefreshCw,
  AlertTriangle,
  Shield,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';
import Button from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import type { RiskAnalysis } from '../../services/aiService';

interface AIRiskAnalysisProps {
  result: RiskAnalysis | null;
  loading: boolean;
  onRerun?: () => void;
  bidderName?: string;
}

const getRiskLevelColor = (level: string): { bg: string; text: string; icon: React.ReactNode } => {
  switch (level) {
    case 'Low':
      return {
        bg: 'bg-green-100 border-green-200',
        text: 'text-green-700',
        icon: <Shield className="w-8 h-8 text-green-600" />
      };
    case 'Medium':
      return {
        bg: 'bg-yellow-100 border-yellow-200',
        text: 'text-yellow-700',
        icon: <AlertTriangle className="w-8 h-8 text-yellow-600" />
      };
    case 'High':
      return {
        bg: 'bg-red-100 border-red-200',
        text: 'text-red-700',
        icon: <XCircle className="w-8 h-8 text-red-600" />
      };
    default:
      return {
        bg: 'bg-gray-100 border-gray-200',
        text: 'text-gray-700',
        icon: <AlertCircle className="w-8 h-8 text-gray-600" />
      };
  }
};

const getSeverityColor = (severity: string): string => {
  switch (severity) {
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

const AIRiskAnalysis: React.FC<AIRiskAnalysisProps> = ({
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
              AI is analyzing risks...
            </p>
            <p className="text-sm text-gray-500">
              Evaluating potential risk factors
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
  const riskColors = getRiskLevelColor(result.overall_risk_level);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            AI Risk Analysis
            {bidderName && (
              <span className="text-sm font-normal text-gray-500">
                - {bidderName}
              </span>
            )}
          </CardTitle>
          {onRerun && (
            <Button variant="outline" size="sm" onClick={onRerun}>
              <RefreshCw className="w-4 h-4 mr-1" />
              Re-analyze
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Risk Level */}
        <div className={`p-4 rounded-lg border-2 ${riskColors.bg}`}>
          <div className="flex items-center gap-4">
            {riskColors.icon}
            <div className="flex-1">
              <h3 className={`text-lg font-semibold ${riskColors.text}`}>
                {result.overall_risk_level} Risk
              </h3>
              <p className={`text-sm ${riskColors.text}`}>
                Risk Score: {result.risk_score}/100
              </p>
            </div>
            <div className="text-right">
              <div className="relative w-16 h-16">
                <svg className="w-16 h-16 transform -rotate-90">
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="6"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    fill="none"
                    stroke={
                      result.risk_score < 30 ? '#22c55e' :
                      result.risk_score < 60 ? '#eab308' : '#ef4444'
                    }
                    strokeWidth="6"
                    strokeDasharray={`${result.risk_score * 1.76} 176`}
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">
                  {result.risk_score}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Risk Summary */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-700">{result.summary}</p>
        </div>

        {/* Red Flags */}
        {result.red_flags.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-medium text-red-800 flex items-center gap-2 mb-3">
              <XCircle className="w-5 h-5" />
              Red Flags
            </h4>
            <ul className="space-y-2">
              {result.red_flags.map((flag, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-sm text-red-700"
                >
                  <AlertTriangle className="w-4 h-4 mt-0.5" />
                  {flag}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Positive Indicators */}
        {result.positive_indicators.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-800 flex items-center gap-2 mb-3">
              <CheckCircle className="w-5 h-5" />
              Positive Indicators
            </h4>
            <ul className="space-y-2">
              {result.positive_indicators.map((indicator, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-sm text-green-700"
                >
                  <CheckCircle className="w-4 h-4 mt-0.5" />
                  {indicator}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Detailed Risks */}
        {result.risks.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Risk Details</h4>
            <div className="space-y-3">
              {result.risks.map((risk, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {risk.category}
                      </span>
                      <h5 className="font-medium text-gray-900 mt-1">{risk.risk}</h5>
                    </div>
                    <div className="flex gap-2">
                      <span className={`text-xs px-2 py-1 rounded ${getSeverityColor(risk.severity)}`}>
                        Severity: {risk.severity}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${getSeverityColor(risk.likelihood)}`}>
                        Likelihood: {risk.likelihood}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2 mt-3">
                    <p className="text-sm text-gray-600">
                      <strong>Impact:</strong> {risk.impact}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Mitigation:</strong> {risk.mitigation}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Due Diligence Recommendations */}
        {result.due_diligence_recommendations.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Due Diligence Recommendations</h4>
            <ul className="space-y-2">
              {result.due_diligence_recommendations.map((rec, index) => (
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
          AI-generated risk analysis. Conduct thorough due diligence before final decision.
        </div>
      </CardContent>
    </Card>
  );
};

export default AIRiskAnalysis;
