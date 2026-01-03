import React from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  BarChart3,
  FileText,
  Download,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Trophy,
  IndianRupee
} from 'lucide-react';
import Button from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Loading from '../../components/ui/Loading';
import Breadcrumb from '../../components/layout/Breadcrumb';
import { useUIStore } from '../../store/uiStore';
import evaluationService from '../../services/evaluationService';
import tenderService from '../../services/tenderService';
import { formatCurrency } from '../../utils/formatters';
import { colors, shadows } from '../../styles/constants';
import type { ComparativeStatement as ComparativeStatementType, Tender, EvaluationCriteria } from '../../types';

const ComparativeStatement: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { addToast } = useUIStore();

  const [tender, setTender] = React.useState<Tender | null>(null);
  const [statement, setStatement] = React.useState<ComparativeStatementType | null>(null);
  const [criteria, setCriteria] = React.useState<EvaluationCriteria[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      try {
        const [tenderData, criteriaData, statementData] = await Promise.all([
          tenderService.getTender(parseInt(id)),
          tenderService.getEvaluationCriteria(parseInt(id)),
          evaluationService.getComparativeStatement(parseInt(id))
        ]);

        setTender(tenderData);
        setCriteria(criteriaData);
        setStatement(statementData);
      } catch (error: any) {
        addToast({
          type: 'error',
          title: 'Error',
          message: error.response?.data?.detail || 'Failed to load comparative statement'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, addToast]);

  const handleExport = () => {
    addToast({
      type: 'info',
      title: 'Export',
      message: 'Export functionality will be available soon'
    });
  };

  if (loading) {
    return <Loading text="Loading comparative statement..." />;
  }

  if (!tender || !statement) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
          <p className="text-gray-500">Comparative statement data is not available.</p>
        </CardContent>
      </Card>
    );
  }

  const sortedBids = [...statement.bids].sort((a, b) => {
    if (a.rank && b.rank) return a.rank - b.rank;
    if (a.rank) return -1;
    if (b.rank) return 1;
    return 0;
  });

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: 'Tenders', path: '/tenders' },
          { label: tender.tender_id, path: `/tenders/${tender.id}` },
          { label: 'Evaluation', path: `/evaluation/${tender.id}` },
          { label: 'Comparative Statement' }
        ]}
      />

      {/* Header */}
      <div className="bg-white rounded-lg p-6" style={{ boxShadow: shadows.govt }}>
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 className="w-6 h-6" style={{ color: colors.primary }} />
              <h1 className="text-2xl font-bold text-gray-900">Comparative Statement</h1>
            </div>
            <p className="text-gray-600">{tender.title}</p>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <span>Tender ID: {tender.tender_id}</span>
              <span>Type: {statement.evaluation_type}</span>
              <span>Generated: {new Date(statement.generated_at).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link to={`/evaluation/${tender.id}`}>
              <Button variant="outline" icon={<ArrowLeft className="w-4 h-4" />}>
                Back to Evaluation
              </Button>
            </Link>
            <Button onClick={handleExport} icon={<Download className="w-4 h-4" />}>
              Export PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-gray-900">{statement.total_bids}</p>
            <p className="text-sm text-gray-500">Total Bids</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-green-600">{statement.qualified_bids}</p>
            <p className="text-sm text-gray-500">Qualified Bids</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-red-600">{statement.total_bids - statement.qualified_bids}</p>
            <p className="text-sm text-gray-500">Disqualified</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold" style={{ color: colors.primary }}>
              {statement.estimated_value ? formatCurrency(statement.estimated_value) : '-'}
            </p>
            <p className="text-sm text-gray-500">Estimated Value</p>
          </CardContent>
        </Card>
      </div>

      {/* Recommendation */}
      {statement.recommendation && (
        <Card className="border-2 border-green-500 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center text-green-700">
              <Trophy className="w-5 h-5 mr-2" />
              Recommendation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-600">Recommended Bidder</p>
                <p className="text-lg font-bold text-gray-900">{statement.recommendation.recommended_bidder}</p>
              </div>
              {statement.recommendation.bid_amount && (
                <div>
                  <p className="text-sm text-gray-600">Bid Amount</p>
                  <p className="text-lg font-bold text-gray-900">
                    {formatCurrency(statement.recommendation.bid_amount)}
                  </p>
                </div>
              )}
              {statement.recommendation.technical_score !== undefined && (
                <div>
                  <p className="text-sm text-gray-600">Technical Score</p>
                  <p className="text-lg font-bold text-gray-900">
                    {statement.recommendation.technical_score.toFixed(2)}
                  </p>
                </div>
              )}
            </div>
            <div className="mt-4 pt-4 border-t border-green-200">
              <p className="text-sm text-gray-600">Rationale</p>
              <p className="text-gray-800">{statement.recommendation.rationale}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comparative Table */}
      <Card>
        <CardHeader>
          <CardTitle>Bid Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="py-3 px-4 text-left font-semibold text-gray-700">Rank</th>
                  <th className="py-3 px-4 text-left font-semibold text-gray-700">Bidder</th>
                  <th className="py-3 px-4 text-left font-semibold text-gray-700">Company</th>
                  <th className="py-3 px-4 text-center font-semibold text-gray-700">Status</th>
                  <th className="py-3 px-4 text-right font-semibold text-gray-700">Technical Score</th>
                  <th className="py-3 px-4 text-right font-semibold text-gray-700">Financial Amount</th>
                  {statement.evaluation_type === 'QCBS' && (
                    <>
                      <th className="py-3 px-4 text-right font-semibold text-gray-700">Fin. Score</th>
                      <th className="py-3 px-4 text-right font-semibold text-gray-700">Combined</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {sortedBids.map((bid, index) => (
                  <tr
                    key={bid.bid_id}
                    className={`border-b ${
                      bid.rank === 1 ? 'bg-yellow-50' : index % 2 === 0 ? 'bg-gray-50' : ''
                    }`}
                  >
                    <td className="py-3 px-4">
                      {bid.rank ? (
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                          bid.rank === 1 ? 'bg-yellow-400 text-yellow-900' :
                          bid.rank === 2 ? 'bg-gray-300 text-gray-700' :
                          bid.rank === 3 ? 'bg-amber-300 text-amber-800' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {bid.rank}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{bid.bidder_name}</div>
                      <div className="text-xs text-gray-500 font-mono">{bid.bid_number}</div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{bid.company_name}</td>
                    <td className="py-3 px-4 text-center">
                      {bid.is_qualified ? (
                        <span className="inline-flex items-center text-green-600">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Qualified
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-red-600">
                          <XCircle className="w-4 h-4 mr-1" />
                          Disqualified
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-medium">
                      {bid.technical_score?.toFixed(2) || '-'}
                    </td>
                    <td className="py-3 px-4 text-right font-medium">
                      {bid.financial_amount ? formatCurrency(bid.financial_amount) : '-'}
                    </td>
                    {statement.evaluation_type === 'QCBS' && (
                      <>
                        <td className="py-3 px-4 text-right">
                          {bid.financial_score?.toFixed(2) || '-'}
                        </td>
                        <td className="py-3 px-4 text-right font-bold" style={{ color: colors.primary }}>
                          {bid.combined_score?.toFixed(2) || '-'}
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Criteria-wise Breakdown */}
      {criteria.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Criteria-wise Score Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Bidder</th>
                    {criteria.map(c => (
                      <th key={c.id} className="py-3 px-4 text-center font-semibold text-gray-700">
                        <div>{c.criteria_name}</div>
                        <div className="text-xs font-normal text-gray-500">
                          Max: {c.max_score} | {c.weight}%
                        </div>
                      </th>
                    ))}
                    <th className="py-3 px-4 text-right font-semibold text-gray-700">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedBids.filter(b => b.is_qualified).map((bid, index) => (
                    <tr
                      key={bid.bid_id}
                      className={`border-b ${index % 2 === 0 ? 'bg-gray-50' : ''}`}
                    >
                      <td className="py-3 px-4 font-medium text-gray-900">{bid.bidder_name}</td>
                      {criteria.map(c => (
                        <td key={c.id} className="py-3 px-4 text-center">
                          {bid.criteria_scores?.[c.criteria_name] !== undefined
                            ? bid.criteria_scores[c.criteria_name]
                            : '-'}
                        </td>
                      ))}
                      <td className="py-3 px-4 text-right font-bold">
                        {bid.technical_score?.toFixed(2) || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Financial Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <IndianRupee className="w-5 h-5 mr-2" />
            Financial Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sortedBids
              .filter(b => b.is_qualified && b.financial_amount)
              .map((bid) => {
                const lowestAmount = Math.min(
                  ...sortedBids
                    .filter(b => b.is_qualified && b.financial_amount)
                    .map(b => b.financial_amount!)
                );
                const percentage = lowestAmount > 0 && bid.financial_amount
                  ? (bid.financial_amount / lowestAmount) * 100
                  : 100;

                return (
                  <div key={bid.bid_id} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{bid.bidder_name}</span>
                      <span className="font-semibold">
                        {formatCurrency(bid.financial_amount!)}
                        {bid.rank === 1 && (
                          <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                            L1
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="h-3 rounded-full transition-all"
                        style={{
                          width: `${Math.min(100, (100 / percentage) * 100)}%`,
                          backgroundColor: bid.rank === 1 ? '#22c55e' : colors.primary
                        }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 text-right">
                      {percentage > 100 ? `+${(percentage - 100).toFixed(1)}% vs L1` : 'Lowest'}
                    </div>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComparativeStatement;
