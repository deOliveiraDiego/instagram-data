import { InstagramPost } from '@/lib/types';
import { formatNumber, extractHookScore } from '@/lib/metrics';

interface TopPostsProps {
  posts: InstagramPost[];
}

export default function TopPosts({ posts }: TopPostsProps) {
  if (posts.length === 0) {
    return (
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Top 3 Posts
        </h2>
        <p className="text-gray-500">Nenhum post encontrado no período.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Top 3 Posts (por Views)
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {posts.map((post, index) => {
          const hookScore = extractHookScore(post.hook_analysis);
          const position = index + 1;
          const positionColors = ['text-yellow-500', 'text-gray-400', 'text-amber-600'];

          return (
            <div
              key={post.shortcode}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-2xl font-bold ${positionColors[index]}`}>
                  #{position}
                </span>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    post.format === 'reel'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-green-100 text-green-700'
                  }`}
                >
                  {post.format === 'reel' ? 'Reel' : 'Carrossel'}
                </span>
              </div>

              <div className="space-y-2">
                <div>
                  <span className="text-2xl font-bold text-gray-900">
                    {formatNumber(post.video_view_count || 0)}
                  </span>
                  <span className="text-sm text-gray-500 ml-1">views</span>
                </div>

                <p className="text-sm text-gray-600 line-clamp-2">
                  {post.theme || 'Sem tema'}
                </p>

                {hookScore !== null && (
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-gray-500">Hook:</span>
                    <span
                      className={`text-sm font-semibold ${
                        hookScore >= 8
                          ? 'text-green-600'
                          : hookScore >= 7
                          ? 'text-yellow-600'
                          : 'text-red-600'
                      }`}
                    >
                      {hookScore}/10
                    </span>
                  </div>
                )}

                <a
                  href={`https://instagram.com/p/${post.shortcode}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-sm text-blue-600 hover:text-blue-800"
                >
                  Ver post →
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}