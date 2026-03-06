'use client';

import { InstagramPost, HookAnalysisData } from '@/lib/types';
import { formatNumber, formatDate, extractHookScore, parseHookAnalysis } from '@/lib/metrics';
import { useState } from 'react';

interface PostsTableProps {
  posts: InstagramPost[];
}

export default function PostsTable({ posts }: PostsTableProps) {
  const [selectedPost, setSelectedPost] = useState<InstagramPost | null>(null);

  if (posts.length === 0) {
    return (
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Todos os Posts
        </h2>
        <p className="text-gray-500">Nenhum post encontrado no período.</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Todos os Posts ({posts.length})
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-2 font-medium text-gray-600 text-sm">
                  Data
                </th>
                <th className="text-left py-3 px-2 font-medium text-gray-600 text-sm">
                  Formato
                </th>
                <th className="text-right py-3 px-2 font-medium text-gray-600 text-sm">
                  Views
                </th>
                <th className="text-right py-3 px-2 font-medium text-gray-600 text-sm">
                  Likes
                </th>
                <th className="text-right py-3 px-2 font-medium text-gray-600 text-sm">
                  Comments
                </th>
                <th className="text-left py-3 px-2 font-medium text-gray-600 text-sm">
                  Tema
                </th>
                <th className="text-right py-3 px-2 font-medium text-gray-600 text-sm">
                  Hook
                </th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => {
                const hookScore = extractHookScore(post.hook_analysis);

                return (
                  <tr
                    key={post.shortcode}
                    onClick={() => setSelectedPost(post)}
                    className="border-b last:border-b-0 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-2 text-sm">
                      {formatDate(post.published_at)}
                    </td>
                    <td className="py-3 px-2">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          post.format === 'reel'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {post.format === 'reel' ? 'Reel' : 'Carrossel'}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-sm text-right font-medium">
                      {formatNumber(post.video_view_count || 0)}
                    </td>
                    <td className="py-3 px-2 text-sm text-right">
                      {formatNumber(post.likes)}
                    </td>
                    <td className="py-3 px-2 text-sm text-right">
                      {formatNumber(post.comments)}
                    </td>
                    <td className="py-3 px-2 text-sm text-gray-600 line-clamp-1 max-w-[200px]">
                      {post.theme || '—'}
                    </td>
                    <td className="py-3 px-2 text-sm text-right">
                      {hookScore !== null ? (
                        <span
                          className={`font-semibold ${
                            hookScore >= 8
                              ? 'text-green-600'
                              : hookScore >= 7
                              ? 'text-yellow-600'
                              : 'text-red-600'
                          }`}
                        >
                          {hookScore}/10
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {selectedPost && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedPost(null)}
        >
          <div
            className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Detalhes do Post</h3>
                  <p className="text-sm text-gray-500">
                    {formatDate(selectedPost.published_at)}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedPost(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {/* Metrics */}
                <div className="grid grid-cols-4 gap-4 py-4 border-y">
                  <div>
                    <p className="text-sm text-gray-500">Views</p>
                    <p className="text-xl font-bold">
                      {formatNumber(selectedPost.video_view_count || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Likes</p>
                    <p className="text-xl font-bold">
                      {formatNumber(selectedPost.likes)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Comments</p>
                    <p className="text-xl font-bold">
                      {formatNumber(selectedPost.comments)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Hook Score</p>
                    <p className="text-xl font-bold">
                      {extractHookScore(selectedPost.hook_analysis)?.toFixed(1) || '—'}/10
                    </p>
                  </div>
                </div>

                {/* Theme */}
                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-1">Tema</h4>
                  <p className="text-gray-900">{selectedPost.theme || 'Sem tema'}</p>
                </div>

                {/* Caption */}
                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-1">Legenda</h4>
                  <p className="text-gray-900 text-sm whitespace-pre-wrap">
                    {selectedPost.caption}
                  </p>
                </div>

                {/* Transcription */}
                {selectedPost.transcription && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-600 mb-1">Transcrição</h4>
                    <p className="text-gray-900 text-sm whitespace-pre-wrap">
                      {selectedPost.transcription}
                    </p>
                  </div>
                )}

                {/* Hook Analysis */}
                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-2">Análise do Hook</h4>
                  {(() => {
                    const hookData = parseHookAnalysis(selectedPost.hook_analysis);
                    if (hookData) {
                      return (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold">{hookData.score_total}</span>
                            <span className="text-gray-500">/10</span>
                            <span className="ml-2 px-2 py-1 text-xs rounded bg-gray-100">
                              {hookData.score_total >= 8 ? 'Excelente' : hookData.score_total >= 7 ? 'Bom' : 'Precisa melhorar'}
                            </span>
                          </div>

                          <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="p-2 bg-blue-50 rounded">
                              <p className="text-xs text-gray-500">Hook</p>
                              <p className="font-bold text-blue-700">{hookData.hook.score}/10</p>
                            </div>
                            <div className="p-2 bg-purple-50 rounded">
                              <p className="text-xs text-gray-500">Desenv.</p>
                              <p className="font-bold text-purple-700">{hookData.desenvolvimento.score}/10</p>
                            </div>
                            <div className="p-2 bg-green-50 rounded">
                              <p className="text-xs text-gray-500">CTA</p>
                              <p className="font-bold text-green-700">{hookData.cta.score}/10</p>
                            </div>
                          </div>

                          <div className="text-sm">
                            <p className="font-medium text-gray-700">Diagnóstico:</p>
                            <p className="text-gray-600">{hookData.diagnostico}</p>
                          </div>
                        </div>
                      );
                    }
                    // Fallback for old format
                    return (
                      <p className="text-gray-900 text-sm whitespace-pre-wrap">
                        {typeof selectedPost.hook_analysis === 'string'
                          ? selectedPost.hook_analysis
                          : JSON.stringify(selectedPost.hook_analysis, null, 2)}
                      </p>
                    );
                  })()}
                </div>

                {/* Link */}
                <div className="pt-4 border-t">
                  <a
                    href={`https://instagram.com/p/${selectedPost.shortcode}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Ver post no Instagram →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}