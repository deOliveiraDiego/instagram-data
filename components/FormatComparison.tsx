import { DashboardMetrics } from '@/lib/types';
import { formatNumber } from '@/lib/metrics';

interface FormatComparisonProps {
  metrics: DashboardMetrics;
}

export default function FormatComparison({ metrics }: FormatComparisonProps) {
  const formats = [
    { name: 'Reels', data: metrics.byFormat.reel },
    { name: 'Carrosséis', data: metrics.byFormat.carousel },
  ];

  return (
    <div className="bg-white rounded-lg border p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Performance por Formato
      </h2>
      <p className="text-xs text-gray-400 mb-4">
        Comparação por engajamento (likes + comentários) — views não são contabilizadas em Carrosséis
      </p>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4 font-medium text-gray-600">
                Formato
              </th>
              <th className="text-right py-3 px-4 font-medium text-gray-600">
                Posts
              </th>
              <th className="text-right py-3 px-4 font-medium text-gray-600">
                Likes Média
              </th>
              <th className="text-right py-3 px-4 font-medium text-gray-600">
                Comentários Média
              </th>
              <th className="text-right py-3 px-4 font-medium text-gray-600">
                Engajamento Médio
              </th>
            </tr>
          </thead>
          <tbody>
            {formats.map((format) => (
              <tr key={format.name} className="border-b last:border-b-0">
                <td className="py-3 px-4 font-medium">{format.name}</td>
                <td className="text-right py-3 px-4">{format.data.count}</td>
                <td className="text-right py-3 px-4">
                  {formatNumber(format.data.avgLikes)}
                </td>
                <td className="text-right py-3 px-4">
                  {formatNumber(format.data.avgComments)}
                </td>
                <td className="text-right py-3 px-4 font-semibold">
                  {formatNumber(format.data.avgLikes + format.data.avgComments)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}