import React from 'react';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Brain,
  Loader2,
  RefreshCw
} from 'lucide-react';
import Button from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import type { EligibilityResult } from '../../services/aiService';

interface AIEligibilityCheckProps {
  result: EligibilityResult | null;
  loading: boolean;
  onRerun?: () => void;
  bidderName?: string;
}

const AIEligibilityCheck: React.FC<AIEligibilityCheckProps> = ({
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
              AI is analyzing eligibility...
            </p>
            <p className="text-sm text-gray-500">
              Checking bid against all criteria
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!result) {
    return null;
  }

  const isEligible = result.overall_eligible;
  const hasError = !!result.error;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            AI Eligibility Assessment
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
        {/* Overall Status */}
        <div className={`p-4 rounded-lg border-2 ${
          hasError
            ? 'bg-yellow-50 border-yellow-200'
            : isEligible
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center gap-3">
            {hasError ? (
              <AlertTriangle className="w-8 h-8 text-yellow-600" />
            ) : isEligible ? (
              <CheckCircle className="w-8 h-8 text-green-600" />
            ) : (
              <XCircle className="w-8 h-8 text-red-600" />
            )}
            <div>
              <h3 className={`text-lg font-semibold ${
                hasError
                  ? 'text-yellow-800'
                  : isEligible
                    ? 'text-green-800'
                    : 'text-red-800'
              }`}>
                {hasError
                  ? 'Analysis Incomplete'
                  : isEligible
                    ? 'Eligible'
                    : 'Not Eligible'}
              </h3>
              <p className={`text-sm ${
                hasError
                  ? 'text-yellow-700'
                  : isEligible
                    ? 'text-green-700'
                    : 'text-red-700'
              }`}>
                {result.summary}
              </p>
            </div>
          </div>
        </div>

        {/* Criteria Results */}
        {result.criteria_results.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Criteria Assessment</h4>
            <div className="space-y-3">
              {result.criteria_results.map((criterion, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${
                    criterion.met
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {criterion.met ? (
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {criterion.criterion}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        <strong>Evidence:</strong> {criterion.evidence}
                      </p>
                      {criterion.remarks && (
                        <p className="text-sm text-gray-500 mt-1">
                          <strong>Remarks:</strong> {criterion.remarks}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Risk Factors */}
        {result.risk_factors.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
              Risk Factors
            </h4>
            <ul className="space-y-2">
              {result.risk_factors.map((risk, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-sm text-gray-700"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-1.5" />
                  {risk}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* AI Notice */}
        <div className="text-xs text-gray-500 border-t pt-4 flex items-center gap-2">
          <Brain className="w-4 h-4" />
          AI-generated assessment. Please verify with manual review.
        </div>
      </CardContent>
    </Card>
  );
};

export default AIEligibilityCheck;
