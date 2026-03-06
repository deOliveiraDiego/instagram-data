import { DashboardMetrics } from '@/lib/types';
import { formatNumber } from '@/lib/metrics';

interface ContentAnalysisProps {
  metrics: DashboardMetrics;
}

export default function ContentAnalysis({ metrics }: ContentAnalysisProps) {
  const { performanceSignals } = metrics;

  return (
    <div className="bg-white rounded-lg border p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Sinais de Performance
      </h2>

      <div className="space-y-4">
        {/* Hook Impact */}
        {performanceSignals?.hookImpact ? (
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🎣</span>
              <span className="font-medium text-gray-900">Hook Alto = Mais Engajamento?</span>
            </div>
            <p className="text-sm text-gray-700">
              Posts com hook <span className="font-semibold text-green-700">≥8</span> têm{' '}
              <span className={`font-bold ${performanceSignals.hookImpact.percentageDifference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {performanceSignals.hookImpact.percentageDifference >= 0 ? '+' : ''}
                {performanceSignals.hookImpact.percentageDifference}%
              </span>{' '}
              mais engajamento que posts com hook <span className="font-semibold text-red-700">&lt;7</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {formatNumber(performanceSignals.hookImpact.highHookAvgEngagement)} vs {formatNumber(performanceSignals.hookImpact.lowHookAvgEngagement)} engajamento médio (likes + comentários)
            </p>
          </div>
        ) : (
          <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-500">
            🎣 Dados insuficientes para análise de hooks
          </div>
        )}

        {/* Best Day */}
        {performanceSignals?.bestDay ? (
          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">📅</span>
              <span className="font-medium text-gray-900">Melhor Dia da Semana</span>
            </div>
            <p className="text-sm text-gray-700">
              <span className="font-semibold text-purple-700">{performanceSignals.bestDay.day}</span> é o melhor dia para postar Reels, com{' '}
              <span className={`font-bold ${performanceSignals.bestDay.percentageAboveAvg >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {performanceSignals.bestDay.percentageAboveAvg >= 0 ? '+' : ''}
                {performanceSignals.bestDay.percentageAboveAvg}%
              </span>{' '}
              acima da média
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {formatNumber(performanceSignals.bestDay.avgEngagement)} engajamento médio (likes + comentários)
            </p>
          </div>
        ) : (
          <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-500">
            📅 Dados insuficientes para análise de dias
          </div>
        )}

        {/* Format Winner */}
        {performanceSignals?.formatWinner ? (
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🏆</span>
              <span className="font-medium text-gray-900">Formato Vencedor</span>
            </div>
            <p className="text-sm text-gray-700">
              <span className="font-semibold text-green-700">
                {performanceSignals.formatWinner.winner === 'reel' ? 'Reels' : 'Carrosséis'}
              </span>{' '}
              têm{' '}
              <span className={`font-bold ${performanceSignals.formatWinner.percentageDifference > 0 ? 'text-green-600' : 'text-gray-600'}`}>
                {performanceSignals.formatWinner.percentageDifference > 0 ? '+' : ''}
                {performanceSignals.formatWinner.percentageDifference}%
              </span>{' '}
              mais engajamento que{' '}
              {performanceSignals.formatWinner.winner === 'reel' ? 'Carrosséis' : 'Reels'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {formatNumber(performanceSignals.formatWinner.winnerAvgEngagement)} vs {formatNumber(performanceSignals.formatWinner.loserAvgEngagement)} engajamento médio (likes + comentários)
            </p>
          </div>
        ) : (
          <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-500">
            🏆 Dados insuficientes para comparar formatos
          </div>
        )}
      </div>
    </div>
  );
}