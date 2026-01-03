import React from 'react';
import { X, Save, CheckCircle } from 'lucide-react';
import Button from '../ui/Button';
import type { Bid, EvaluationCriteria, Evaluation } from '../../types';
import evaluationService from '../../services/evaluationService';
import { useUIStore } from '../../store/uiStore';

interface ScoringModalProps {
  bid: Bid;
  bidderName: string;
  criteria: EvaluationCriteria[];
  existingEvaluations: Evaluation[];
  onClose: () => void;
  onSaved: () => void;
}

interface ScoreEntry {
  criteria_id: number;
  score: number;
  remarks: string;
}

const ScoringModal: React.FC<ScoringModalProps> = ({
  bid,
  bidderName,
  criteria,
  existingEvaluations,
  onClose,
  onSaved
}) => {
  const { addToast } = useUIStore();
  const [scores, setScores] = React.useState<ScoreEntry[]>(() => {
    return criteria.map(c => {
      const existing = existingEvaluations.find(e => e.criteria_id === c.id);
      return {
        criteria_id: c.id,
        score: existing?.score || 0,
        remarks: existing?.remarks || ''
      };
    });
  });
  const [saving, setSaving] = React.useState(false);
  const [currentIndex, setCurrentIndex] = React.useState(0);

  const currentCriterion = criteria[currentIndex];
  const currentScore = scores.find(s => s.criteria_id === currentCriterion?.id);

  const updateScore = (criteriaId: number, field: 'score' | 'remarks', value: number | string) => {
    setScores(prev => prev.map(s =>
      s.criteria_id === criteriaId
        ? { ...s, [field]: value }
        : s
    ));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save all scores
      for (const score of scores) {
        if (score.score > 0) {
          await evaluationService.evaluateBid(bid.id, {
            criteria_id: score.criteria_id,
            score: score.score,
            remarks: score.remarks || undefined
          });
        }
      }
      addToast({
        type: 'success',
        title: 'Saved',
        message: 'Evaluation scores saved successfully'
      });
      onSaved();
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.response?.data?.detail || 'Failed to save scores'
      });
    } finally {
      setSaving(false);
    }
  };

  const totalScore = scores.reduce((sum, s) => {
    const criterion = criteria.find(c => c.id === s.criteria_id);
    if (criterion) {
      return sum + s.score * (criterion.weight / 100);
    }
    return sum;
  }, 0);

  const maxScore = criteria.reduce((sum, c) => sum + c.max_score * (c.weight / 100), 0);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Score Bid</h2>
            <p className="text-sm text-gray-500">{bidderName} - {bid.bid_number}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-md">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex h-[60vh]">
          {/* Criteria List */}
          <div className="w-64 border-r overflow-y-auto bg-gray-50">
            {criteria.map((c, index) => {
              const score = scores.find(s => s.criteria_id === c.id);
              const isScored = score && score.score > 0;
              return (
                <button
                  key={c.id}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-full p-3 text-left border-b hover:bg-gray-100 ${
                    currentIndex === index ? 'bg-white border-l-4 border-l-primary' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-medium ${
                      currentIndex === index ? 'text-primary' : 'text-gray-700'
                    }`}>
                      {c.criteria_name}
                    </span>
                    {isScored && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-500">
                      Max: {c.max_score} | Weight: {c.weight}%
                    </span>
                    {isScored && (
                      <span className="text-xs font-medium text-green-600">
                        {score.score}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Scoring Area */}
          <div className="flex-1 p-6 overflow-y-auto">
            {currentCriterion && currentScore && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {currentCriterion.criteria_name}
                  </h3>
                  {currentCriterion.description && (
                    <p className="text-sm text-gray-600 mt-1">
                      {currentCriterion.description}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-xs text-gray-500">Maximum Score</p>
                    <p className="text-lg font-semibold">{currentCriterion.max_score}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Weight</p>
                    <p className="text-lg font-semibold">{currentCriterion.weight}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Weighted Score</p>
                    <p className="text-lg font-semibold">
                      {(currentScore.score * (currentCriterion.weight / 100)).toFixed(2)}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Score (0 - {currentCriterion.max_score})
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="0"
                      max={currentCriterion.max_score}
                      step="1"
                      value={currentScore.score}
                      onChange={(e) => updateScore(currentCriterion.id, 'score', parseInt(e.target.value))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <input
                      type="number"
                      min="0"
                      max={currentCriterion.max_score}
                      value={currentScore.score}
                      onChange={(e) => updateScore(currentCriterion.id, 'score', Math.min(currentCriterion.max_score, Math.max(0, parseInt(e.target.value) || 0)))}
                      className="w-20 px-3 py-2 border border-gray-300 rounded-md text-center font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Remarks (Optional)
                  </label>
                  <textarea
                    value={currentScore.remarks}
                    onChange={(e) => updateScore(currentCriterion.id, 'remarks', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                    rows={3}
                    placeholder="Enter evaluation remarks..."
                  />
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <Button
                    variant="outline"
                    disabled={currentIndex === 0}
                    onClick={() => setCurrentIndex(prev => prev - 1)}
                  >
                    Previous
                  </Button>
                  {currentIndex < criteria.length - 1 ? (
                    <Button onClick={() => setCurrentIndex(prev => prev + 1)}>
                      Next Criterion
                    </Button>
                  ) : (
                    <span className="text-sm text-gray-500">Last criterion</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t bg-gray-50">
          <div className="text-sm">
            <span className="text-gray-600">Total Score: </span>
            <span className="font-semibold text-lg">{totalScore.toFixed(2)}</span>
            <span className="text-gray-500">/{maxScore.toFixed(0)}</span>
            <span className="ml-4 text-gray-600">
              ({((totalScore / maxScore) * 100).toFixed(1)}%)
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              loading={saving}
              icon={<Save className="w-4 h-4" />}
            >
              Save All Scores
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScoringModal;
