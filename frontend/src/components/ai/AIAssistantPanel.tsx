import React from 'react';
import {
  Brain,
  Sparkles,
  CheckCircle2,
  FileSearch,
  BarChart3,
  AlertTriangle,
  FileText,
  X,
  ChevronRight
} from 'lucide-react';
import Button from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import AIEligibilityCheck from './AIEligibilityCheck';
import AITechnicalScore from './AITechnicalScore';
import AIComparativeAnalysis from './AIComparativeAnalysis';
import AIRiskAnalysis from './AIRiskAnalysis';
import aiService from '../../services/aiService';
import type {
  EligibilityResult,
  TechnicalScore,
  ComparativeAnalysis,
  RiskAnalysis
} from '../../services/aiService';

type AIFeature = 'eligibility' | 'technical' | 'comparative' | 'risk' | 'rfp';

interface AIAssistantPanelProps {
  mode: 'bid' | 'tender' | 'evaluation';
  bidData?: Record<string, any>;
  tenderData?: Record<string, any>;
  bidsData?: Array<Record<string, any>>;
  eligibilityCriteria?: Array<{ criteria_type: string; criteria_value: string }>;
  evaluationCriteria?: Array<{ criteria_name: string; max_score: number; weight?: number }>;
  onClose?: () => void;
}

const AIAssistantPanel: React.FC<AIAssistantPanelProps> = ({
  mode,
  bidData,
  tenderData,
  bidsData,
  eligibilityCriteria,
  evaluationCriteria,
  onClose
}) => {
  const [activeFeature, setActiveFeature] = React.useState<AIFeature | null>(null);
  const [loading, setLoading] = React.useState(false);

  // Results state
  const [eligibilityResult, setEligibilityResult] = React.useState<EligibilityResult | null>(null);
  const [technicalResult, setTechnicalResult] = React.useState<TechnicalScore | null>(null);
  const [comparativeResult, setComparativeResult] = React.useState<ComparativeAnalysis | null>(null);
  const [riskResult, setRiskResult] = React.useState<RiskAnalysis | null>(null);

  const features: {
    id: AIFeature;
    label: string;
    description: string;
    icon: React.ReactNode;
    available: boolean;
  }[] = [
    {
      id: 'eligibility',
      label: 'Eligibility Check',
      description: 'AI-powered eligibility verification',
      icon: <CheckCircle2 className="w-5 h-5" />,
      available: mode === 'bid' || mode === 'evaluation'
    },
    {
      id: 'technical',
      label: 'Technical Scoring',
      description: 'AI-assisted proposal scoring',
      icon: <FileSearch className="w-5 h-5" />,
      available: mode === 'bid' || mode === 'evaluation'
    },
    {
      id: 'comparative',
      label: 'Comparative Analysis',
      description: 'Compare all bids comprehensively',
      icon: <BarChart3 className="w-5 h-5" />,
      available: mode === 'evaluation' && (bidsData?.length ?? 0) > 0
    },
    {
      id: 'risk',
      label: 'Risk Analysis',
      description: 'Identify potential risks',
      icon: <AlertTriangle className="w-5 h-5" />,
      available: mode === 'bid' || mode === 'evaluation'
    },
    {
      id: 'rfp',
      label: 'Generate RFP Content',
      description: 'AI-powered RFP section generation',
      icon: <FileText className="w-5 h-5" />,
      available: mode === 'tender'
    }
  ];

  const runEligibilityCheck = async () => {
    if (!bidData || !eligibilityCriteria) return;
    setLoading(true);
    setActiveFeature('eligibility');
    try {
      const result = await aiService.evaluateEligibility(bidData, eligibilityCriteria);
      setEligibilityResult(result);
    } finally {
      setLoading(false);
    }
  };

  const runTechnicalScoring = async () => {
    if (!bidData || !evaluationCriteria) return;
    setLoading(true);
    setActiveFeature('technical');
    try {
      const proposalText = bidData.technical_proposal || JSON.stringify(bidData);
      const requirements = tenderData?.description || '';
      const result = await aiService.scoreTechnicalProposal(
        proposalText,
        evaluationCriteria,
        requirements
      );
      setTechnicalResult(result);
    } finally {
      setLoading(false);
    }
  };

  const runComparativeAnalysis = async () => {
    if (!bidsData || !tenderData) return;
    setLoading(true);
    setActiveFeature('comparative');
    try {
      const result = await aiService.generateComparativeAnalysis(
        bidsData,
        tenderData,
        tenderData.evaluation_type || 'L1'
      );
      setComparativeResult(result);
    } finally {
      setLoading(false);
    }
  };

  const runRiskAnalysis = async () => {
    if (!bidData || !tenderData) return;
    setLoading(true);
    setActiveFeature('risk');
    try {
      const result = await aiService.analyzeBidRisks(bidData, tenderData);
      setRiskResult(result);
    } finally {
      setLoading(false);
    }
  };

  const handleFeatureClick = (featureId: AIFeature) => {
    switch (featureId) {
      case 'eligibility':
        runEligibilityCheck();
        break;
      case 'technical':
        runTechnicalScoring();
        break;
      case 'comparative':
        runComparativeAnalysis();
        break;
      case 'risk':
        runRiskAnalysis();
        break;
      default:
        setActiveFeature(featureId);
    }
  };

  const renderResult = () => {
    switch (activeFeature) {
      case 'eligibility':
        return (
          <AIEligibilityCheck
            result={eligibilityResult}
            loading={loading}
            onRerun={runEligibilityCheck}
            bidderName={bidData?.bidder_name}
          />
        );
      case 'technical':
        return (
          <AITechnicalScore
            result={technicalResult}
            loading={loading}
            onRerun={runTechnicalScoring}
            bidderName={bidData?.bidder_name}
          />
        );
      case 'comparative':
        return (
          <AIComparativeAnalysis
            result={comparativeResult}
            loading={loading}
            onRerun={runComparativeAnalysis}
          />
        );
      case 'risk':
        return (
          <AIRiskAnalysis
            result={riskResult}
            loading={loading}
            onRerun={runRiskAnalysis}
            bidderName={bidData?.bidder_name}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-primary to-primary/80">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-white">
              <div className="p-3 bg-white/20 rounded-lg">
                <Brain className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  AI Assistant
                  <Sparkles className="w-5 h-5 text-yellow-300" />
                </h2>
                <p className="text-white/80 text-sm">
                  Powered by Mistral AI for intelligent tender evaluation
                </p>
              </div>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg text-white"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Feature Selection */}
      {!activeFeature && (
        <Card>
          <CardHeader>
            <CardTitle>AI-Powered Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {features
                .filter(f => f.available)
                .map(feature => (
                  <button
                    key={feature.id}
                    onClick={() => handleFeatureClick(feature.id)}
                    className="flex items-center gap-4 p-4 border rounded-lg hover:border-primary hover:bg-primary/5 transition-colors text-left"
                  >
                    <div className="p-3 bg-primary/10 rounded-lg text-primary">
                      {feature.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{feature.label}</h3>
                      <p className="text-sm text-gray-500">{feature.description}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </button>
                ))}
            </div>

            {features.filter(f => f.available).length === 0 && (
              <p className="text-center text-gray-500 py-8">
                No AI features available for this context
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Result Display */}
      {activeFeature && (
        <div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveFeature(null)}
            className="mb-4"
          >
            <ChevronRight className="w-4 h-4 mr-1 rotate-180" />
            Back to Features
          </Button>
          {renderResult()}
        </div>
      )}

      {/* AI Disclaimer */}
      <div className="text-center text-xs text-gray-500 py-4 border-t">
        <Brain className="w-4 h-4 inline mr-1" />
        AI-generated insights are for assistance only. Final decisions should be made by authorized personnel.
      </div>
    </div>
  );
};

export default AIAssistantPanel;
