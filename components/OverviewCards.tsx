import { DashboardMetrics } from '@/lib/types';
import { formatNumber } from '@/lib/metrics';

interface OverviewCardsProps {
  metrics: DashboardMetrics;
}

export default function OverviewCards({ metrics }: OverviewCardsProps) {
  const cards = [
    {
      label: 'Total de Posts',
      value: metrics.totalPosts,
      color: 'bg-blue-50 text-blue-700',
    },
    {
      label: 'Média de Views',
      value: formatNumber(metrics.avgViews),
      color: 'bg-green-50 text-green-700',
    },
    {
      label: 'Média de Likes',
      value: formatNumber(metrics.avgLikes),
      color: 'bg-purple-50 text-purple-700',
    },
    {
      label: 'Média de Comentários',
      value: formatNumber(metrics.avgComments),
      color: 'bg-orange-50 text-orange-700',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`${card.color} rounded-lg p-6 border`}
        >
          <p className="text-sm font-medium opacity-80">{card.label}</p>
          <p className="text-3xl font-bold mt-1">{card.value}</p>
        </div>
      ))}
    </div>
  );
}