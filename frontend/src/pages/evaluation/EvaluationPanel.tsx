import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Play,
  Users,
  FileText,
  Calculator,
  Award,
  CheckCircle,
  BarChart3,
  RefreshCw,
  Brain,
  Sparkles
} from 'lucide-react';
import Button from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import Loading from '../../components/ui/Loading';
import Breadcrumb from '../../components/layout/Breadcrumb';
import BidScoreCard from '../../components/evaluation/BidScoreCard';
import ScoringModal from '../../components/evaluation/ScoringModal';
import RankingDisplay from '../../components/evaluation/RankingDisplay';
import { AIAssistantPanel } from '../../components/ai';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import evaluationService from '../../services/evaluationService';
import tenderService from '../../services/tenderService';
import bidService from '../../services/bidService';
import { colors, shadows } from '../../styles/constants';
import type { Tender, Bid, EvaluationCriteria, Evaluation, EvaluationResult, EvaluationType } from '../../types';

// Tab button with inline styles
const EvalTabButton: React.FC<{
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  gradient?: boolean;
}> = ({ active, onClick, icon, label, gradient }) => (
  <button
    onClick={onClick}
    className="px-4 py-2 text-sm font-medium rounded-md"
    style={{
      background: active
        ? gradient
          ? 'linear-gradient(to right, #9333ea, #1e3a5f)'
          : colors.primary
        : '#f3f4f6',
      color: active ? 'white' : '#374151',
    }}
  >
    {icon}
    {label}
  </button>
);

// Select with focus styles
const EvalSelect: React.FC<{
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children: React.ReactNode;
  className?: string;
}> = ({ value, onChange, children, className = '' }) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <select
      value={value}
      onChange={onChange}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      className={`px-3 py-2 border border-gray-300 rounded-md ${className}`}
      style={isFocused ? {
        outline: 'none',
        boxShadow: `0 0 0 2px ${colors.primary}`,
        borderColor: colors.primary,
      } : {}}
    >
      {children}
    </select>
  );
};

type ViewMode = 'scoring' | 'ranking' | 'results' | 'ai';

const EvaluationPanel: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addToast } = useUIStore();

  const [tender, setTender] = React.useState<Tender | null>(null);
  const [bids, setBids] = React.useState<Bid[]>([]);
  const [criteria, setCriteria] = React.useState<EvaluationCriteria[]>([]);
  const [evaluations, setEvaluations] = React.useState<Record<number, Evaluation[]>>({});
  const [loading, setLoading] = React.useState(true);
  const [viewMode, setViewMode] = React.useState<ViewMode>('scoring');
  const [scoringBid, setScoringBid] = React.useState<Bid | null>(null);
  const [rankingResult, setRankingResult] = React.useState<EvaluationResult | null>(null);
  const [calculatingRank, setCalculatingRank] = React.useState(false);
  const [selectedEvalType, setSelectedEvalType] = React.useState<EvaluationType>('QCBS');
  const [techWeight, setTechWeight] = React.useState(70);
  const [selectedBidForAI, setSelectedBidForAI] = React.useState<Bid | null>(null);

  const canManage = user?.role === 'Admin' || user?.role === 'Tender Officer';

  const fetchData = React.useCallback(async () => {
    if (!id) return;

    try {
      const [tenderData, criteriaData, bidsData] = await Promise.all([
        tenderService.getTender(parseInt(id)),
        tenderService.getEvaluationCriteria(parseInt(id)),
        bidService.getBidsForTender(parseInt(id)).catch(() => [])
      ]);

      setTender(tenderData);
      setCriteria(criteriaData);
      setBids(bidsData.filter(b => b.status === 'Submitted' || b.status === 'Under Review' || b.status === 'Qualified'));

      // Fetch evaluations for each bid
      const evalPromises = bidsData.map(async (bid) => {
        try {
          const bidEvals = await evaluationService.getBidScores(bid.id);
          return { bidId: bid.id, evaluations: bidEvals };
        } catch {
          return { bidId: bid.id, evaluations: [] };
        }
      });

      const evalResults = await Promise.all(evalPromises);
      const evalMap: Record<number, Evaluation[]> = {};
      evalResults.forEach(r => {
        evalMap[r.bidId] = r.evaluations;
      });
      setEvaluations(evalMap);

    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.response?.data?.detail || 'Failed to load evaluation data'
      });
    } finally {
      setLoading(false);
    }
  }, [id, addToast]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleStartEvaluation = async () => {
    if (!tender) return;
    try {
      await evaluationService.startEvaluation(tender.id);
      addToast({
        type: 'success',
        title: 'Started',
        message: 'Evaluation process has been started'
      });
      fetchData();
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.response?.data?.detail || 'Failed to start evaluation'
      });
    }
  };

  const handleCalculateRanking = async () => {
    if (!tender) return;
    setCalculatingRank(true);
    try {
      const result = await evaluationService.calculateRanking(
        tender.id,
        selectedEvalType,
        techWeight / 100,
        (100 - techWeight) / 100
      );
      setRankingResult(result);
      setViewMode('ranking');
      addToast({
        type: 'success',
        title: 'Calculated',
        message: 'Rankings have been calculated'
      });
      fetchData();
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.response?.data?.detail || 'Failed to calculate rankings'
      });
    } finally {
      setCalculatingRank(false);
    }
  };

  const handleDeclareWinner = async (bidId: number) => {
    if (!tender) return;
    if (!confirm('Are you sure you want to declare this bidder as the winner? This action cannot be undone.')) {
      return;
    }

    try {
      const result = await evaluationService.declareWinner(tender.id, bidId);
      addToast({
        type: 'success',
        title: 'Winner Declared',
        message: `${result.winner} has been declared as the winner`
      });
      navigate(`/tenders/${tender.id}`);
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.response?.data?.detail || 'Failed to declare winner'
      });
    }
  };

  const getBidderName = (bid: Bid): string => {
    return `Bidder #${bid.bidder_id}`;
  };

  if (loading) {
    return <Loading text="Loading evaluation panel..." />;
  }

  if (!tender) {
    return null;
  }

  const allBidsScored = bids.every(bid => {
    const bidEvals = evaluations[bid.id] || [];
    return bidEvals.length === criteria.length;
  });

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: 'Tenders', path: '/tenders' },
          { label: tender.tender_id, path: `/tenders/${tender.id}` },
          { label: 'Evaluation' }
        ]}
      />

      {/* Header */}
      <div className="bg-white rounded-lg p-6" style={{ boxShadow: shadows.govt }}>
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Evaluation Panel</h1>
            <p className="mt-1 text-gray-600">{tender.title}</p>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <span className="flex items-center">
                <FileText className="w-4 h-4 mr-1" />
                {bids.length} Bids
              </span>
              <span className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
                {criteria.length} Criteria
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {tender.status === 'Published' && canManage && (
              <Button
                onClick={handleStartEvaluation}
                icon={<Play className="w-4 h-4" />}
              >
                Start Evaluation
              </Button>
            )}
            {tender.status === 'Under Evaluation' && (
              <>
                <Button
                  variant="outline"
                  onClick={fetchData}
                  icon={<RefreshCw className="w-4 h-4" />}
                >
                  Refresh
                </Button>
                <Link to={`/evaluation/${tender.id}/comparative`}>
                  <Button
                    variant="outline"
                    icon={<BarChart3 className="w-4 h-4" />}
                  >
                    Comparative Statement
                  </Button>
                </Link>
                <button
                  onClick={() => setViewMode('ai')}
                  className="flex items-center gap-2 px-4 py-2 rounded-md text-white font-medium"
                  style={{ background: 'linear-gradient(to right, #9333ea, #1e3a5f)' }}
                >
                  <Brain className="w-4 h-4" />
                  <Sparkles className="w-3 h-3" />
                  AI Assistant
                </button>
              </>
            )}
            {(tender.status === 'Evaluated' || tender.status === 'Awarded') && (
              <>
                <Link to={`/evaluation/${tender.id}/comparative`}>
                  <Button
                    variant="outline"
                    icon={<BarChart3 className="w-4 h-4" />}
                  >
                    Comparative Statement
                  </Button>
                </Link>
                <button
                  onClick={() => setViewMode('ai')}
                  className="flex items-center gap-2 px-4 py-2 rounded-md text-white font-medium"
                  style={{ background: 'linear-gradient(to right, #9333ea, #1e3a5f)' }}
                >
                  <Brain className="w-4 h-4" />
                  AI Assistant
                </button>
              </>
            )}
          </div>
        </div>

        {/* View Mode Tabs */}
        {(tender.status === 'Under Evaluation' || tender.status === 'Evaluated' || tender.status === 'Awarded') && (
          <div className="flex items-center gap-2 mt-6 border-t pt-4">
            <EvalTabButton
              active={viewMode === 'scoring'}
              onClick={() => setViewMode('scoring')}
              icon={<FileText className="w-4 h-4 inline mr-2" />}
              label="View Bids"
            />
            <EvalTabButton
              active={viewMode === 'ranking'}
              onClick={() => setViewMode('ranking')}
              icon={<Award className="w-4 h-4 inline mr-2" />}
              label="Rankings"
            />
            <EvalTabButton
              active={viewMode === 'ai'}
              onClick={() => setViewMode('ai')}
              icon={<Brain className="w-4 h-4 inline mr-2" />}
              label="AI Assistant"
              gradient
            />
          </div>
        )}
      </div>

      {/* Not Under Evaluation Warning */}
      {tender.status !== 'Under Evaluation' && tender.status !== 'Evaluated' && tender.status !== 'Awarded' && (
        <Card>
          <CardContent className="py-12 text-center">
            <Play className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Evaluation Not Started
            </h3>
            <p className="text-gray-500 mb-4">
              {tender.status === 'Published'
                ? 'Start the evaluation process to begin scoring bids.'
                : 'This tender is not ready for evaluation.'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Show evaluation content for Under Evaluation, Evaluated, and Awarded tenders */}
      {(tender.status === 'Under Evaluation' || tender.status === 'Evaluated' || tender.status === 'Awarded') && (
        <>
          {/* Scoring View */}
          {viewMode === 'scoring' && (
            <div className="space-y-6">
              {/* Progress Summary */}
              <Card>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-full ${allBidsScored ? 'bg-green-100' : 'bg-yellow-100'}`}>
                        {allBidsScored ? (
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        ) : (
                          <FileText className="w-6 h-6 text-yellow-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {tender.status === 'Awarded' ? 'Tender Awarded' : tender.status === 'Evaluated' ? 'Evaluation Complete' : allBidsScored ? 'All Bids Evaluated' : 'Evaluation In Progress'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {bids.filter(b => (evaluations[b.id] || []).length === criteria.length).length} of {bids.length} bids fully scored
                        </p>
                      </div>
                    </div>
                    {allBidsScored && canManage && tender.status === 'Under Evaluation' && (
                      <div className="flex items-center gap-4 flex-wrap">
                        <select
                          value={selectedEvalType}
                          onChange={(e) => setSelectedEvalType(e.target.value as EvaluationType)}
                          className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                        >
                          <option value="L1">L1 - Lowest Price</option>
                          <option value="T1">T1 - Highest Technical</option>
                          <option value="QCBS">QCBS - Combined</option>
                        </select>
                        {selectedEvalType === 'QCBS' && (
                          <div className="flex items-center gap-2 text-sm">
                            <span>Tech:</span>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={techWeight}
                              onChange={(e) => setTechWeight(parseInt(e.target.value) || 70)}
                              className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                            />
                            <span>%</span>
                          </div>
                        )}
                        <Button
                          onClick={handleCalculateRanking}
                          loading={calculatingRank}
                          icon={<Calculator className="w-4 h-4" />}
                        >
                          Calculate Rankings
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Bids Grid */}
              {bids.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Bids to Evaluate</h3>
                    <p className="text-gray-500">There are no submitted bids for this tender.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {bids.map((bid) => (
                    <BidScoreCard
                      key={bid.id}
                      bid={bid}
                      bidderName={getBidderName(bid)}
                      criteria={criteria}
                      evaluations={evaluations[bid.id] || []}
                      onScore={(bidId) => setScoringBid(bids.find(b => b.id === bidId) || null)}
                      isScoring={scoringBid?.id === bid.id}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Ranking View */}
          {viewMode === 'ranking' && (
            <div className="space-y-6">
              {rankingResult ? (
                <RankingDisplay
                  result={rankingResult}
                  onDeclareWinner={canManage && tender.status === 'Under Evaluation' ? handleDeclareWinner : undefined}
                  showDeclareButton={canManage && tender.status === 'Under Evaluation'}
                />
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Calculator className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Rankings Yet</h3>
                    <p className="text-gray-500 mb-4">
                      Complete bid evaluation and calculate rankings to see results.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => setViewMode('scoring')}
                    >
                      Go to Scoring
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* AI Assistant View */}
          {viewMode === 'ai' && (
            <div className="space-y-6">
              {/* Bid Selection for AI Analysis */}
              {bids.length > 0 && (
                <Card>
                  <CardContent className="p-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Bid for Individual Analysis
                    </label>
                    <EvalSelect
                      value={selectedBidForAI?.id?.toString() || ''}
                      onChange={(e) => {
                        const bid = bids.find(b => b.id === parseInt(e.target.value));
                        setSelectedBidForAI(bid || null);
                      }}
                      className="w-full"
                    >
                      <option value="">Select a bid for detailed AI analysis</option>
                      {bids.map((bid) => (
                        <option key={bid.id} value={bid.id}>
                          {getBidderName(bid)} - {bid.bid_number}
                        </option>
                      ))}
                    </EvalSelect>
                  </CardContent>
                </Card>
              )}

              {/* AI Assistant Panel */}
              <AIAssistantPanel
                mode="evaluation"
                bidData={selectedBidForAI ? {
                  id: selectedBidForAI.id,
                  bid_number: selectedBidForAI.bid_number,
                  bidder_id: selectedBidForAI.bidder_id,
                  bidder_name: getBidderName(selectedBidForAI),
                  technical_score: selectedBidForAI.technical_score,
                  financial_amount: selectedBidForAI.financial_amount,
                  status: selectedBidForAI.status,
                  technical_proposal: 'Technical proposal content would be extracted from documents'
                } : undefined}
                tenderData={{
                  id: tender.id,
                  tender_id: tender.tender_id,
                  title: tender.title,
                  description: tender.description,
                  estimated_value: tender.estimated_value,
                  evaluation_type: selectedEvalType
                }}
                bidsData={bids.map(b => ({
                  id: b.id,
                  bid_number: b.bid_number,
                  bidder_name: getBidderName(b),
                  technical_score: b.technical_score,
                  financial_amount: b.financial_amount,
                  status: b.status
                }))}
                eligibilityCriteria={[
                  { criteria_type: 'Annual Turnover', criteria_value: 'Minimum Rs. 25 Crore' },
                  { criteria_type: 'Experience', criteria_value: 'Minimum 5 years in similar projects' },
                  { criteria_type: 'Certifications', criteria_value: 'ISO 9001:2015 required' }
                ]}
                evaluationCriteria={criteria.map(c => ({
                  criteria_name: c.criteria_name,
                  max_score: c.max_score,
                  weight: c.weight
                }))}
                onClose={() => setViewMode('scoring')}
              />
            </div>
          )}
        </>
      )}

      {/* Scoring Modal */}
      {scoringBid && (
        <ScoringModal
          bid={scoringBid}
          bidderName={getBidderName(scoringBid)}
          criteria={criteria}
          existingEvaluations={evaluations[scoringBid.id] || []}
          onClose={() => setScoringBid(null)}
          onSaved={() => {
            setScoringBid(null);
            fetchData();
          }}
        />
      )}
    </div>
  );
};

export default EvaluationPanel;
