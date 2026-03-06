# Instagram Performance Dashboard - Design Document

**Data:** 2026-03-06
**Status:** Aprovado

---

## Resumo

Dashboard web para monitoramento de performance do Instagram, com dados vindos de um webhook n8n que consulta planilha Google Sheets. O sistema possui cache inteligente com TTL de 24h para evitar rate limits do Google.

---

## Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js App                          │
├─────────────────────────────────────────────────────────┤
│  Frontend (React)                                       │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Dashboard                                        │   │
│  │  - Seletor de período (7/14/30 dias)            │   │
│  │  - 4 blocos de métricas                          │   │
│  │  - Lista de posts detalhada                      │   │
│  │  - Botão de refresh                              │   │
│  └─────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────┤
│  API Routes                                             │
│  ┌─────────────────────────────────────────────────┐   │
│  │  GET /api/data                                   │   │
│  │  - Verifica cache (data/cache.json)             │   │
│  │  - Se expirado ou vazio: busca do webhook       │   │
│  │  - Salva no cache com timestamp                 │   │
│  │  - Retorna dados                                 │   │
│  │                                                  │   │
│  │  POST /api/refresh                               │   │
│  │  - Limpa cache                                   │   │
│  │  - Força nova busca do webhook                  │   │
│  └─────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────┤
│  Cache (data/cache.json)                               │
│  - Armazena dados do webhook                           │
│  - TTL: 24 horas                                       │
└─────────────────────────────────────────────────────────┘
```

**Endpoint de dados:**
```
GET https://temp-n8n-n8n-start.ecfojw.easypanel.host/webhook/instagram/data
```

---

## Estrutura do Dashboard

### Cabeçalho
- Logo/título
- Seletor de período: dropdown (7, 14, 30 dias)
- Botão "Atualizar dados" (ícone de refresh)
- Indicador: "Atualizado há X horas"

### Bloco 1 — Visão Geral (cards horizontais)

| Métrica | Cálculo |
|---------|---------|
| Total de Posts | Contagem de posts no período |
| Média Views | `SUM(video_view_count) / posts` |
| Média Likes | `SUM(likes) / posts` |
| Média Comentários | `SUM(comments) / posts` |

### Bloco 2 — Por Formato

| Formato | Posts | Views Média | Likes Média | Comments Média |
|---------|-------|-------------|-------------|----------------|
| Reel | contagem | média | média | média |
| Carrossel | contagem | média | média | média |

### Bloco 3 — Top 3 Posts

Cards verticais com:
- Posição (#1, #2, #3)
- Views
- Tema (truncado)
- Hook score (extraído de `hook_analysis`)
- Link para o post no Instagram

**URL do post:** `https://instagram.com/p/{shortcode}`

### Bloco 4 — Análise de Conteúdo

**Temas mais frequentes:**
- Agrupa por `theme` e conta ocorrências
- Mostra top 5

**Hooks que funcionaram:**
- Extrai score de `hook_analysis` via regex: `SCORE TOTAL: (\d+\.?\d*)/10`
- Considera "funcionou" se score >= 7.0
- Mostra percentual e score médio

### Bloco 5 — Lista de Posts

Tabela com colunas:
- Data (`published_at` formatado)
- Formato
- Views
- Likes
- Comments
- Tema (truncado)
- Hook score

**Funcionalidade:** Linha clicável abre modal com:
- Caption completa
- Transcrição
- Hook analysis completo
- Link para o post

---

## Estrutura de Dados

### InstagramPost (tipo TypeScript)

```typescript
interface InstagramPost {
  row_number: number;
  shortcode: string;
  published_at: string; // ISO date
  format: 'reel' | 'carousel';
  caption: string;
  likes: number;
  comments: number;
  video_view_count: number;
  video_play_count: number;
  hook_analysis: string;
  theme: string;
  audio_url: string;
  transcription: string;
  scraped_at: string;
}
```

### CacheData (tipo TypeScript)

```typescript
interface CacheData {
  posts: InstagramPost[];
  cachedAt: string; // ISO timestamp
  ttl: number; // 86400000ms = 24h
}
```

---

## Stack Técnica

| Componente | Tecnologia |
|------------|------------|
| Framework | Next.js 14 (App Router) |
| Linguagem | TypeScript |
| Estilização | Tailwind CSS |
| Componentes UI | shadcn/ui |
| Ícones | Lucide React |
| Gráficos | Recharts (se necessário) |

---

## Estrutura de Pastas

```
instagram-data/
├── app/
│   ├── layout.tsx
│   ├── page.tsx              # Dashboard principal
│   └── api/
│       ├── data/route.ts     # GET - busca dados com cache
│       └── refresh/route.ts  # POST - força atualização
├── data/
│   └── cache.json            # Cache persistente
├── lib/
│   ├── cache.ts              # Lógica de cache (TTL 24h)
│   ├── instagram.ts          # Tipos e parse de dados
│   └── metrics.ts            # Cálculos (médias, top posts, etc)
└── components/
    ├── Header.tsx
    ├── PeriodSelector.tsx
    ├── OverviewCards.tsx
    ├── FormatComparison.tsx
    ├── TopPosts.tsx
    ├── ContentAnalysis.tsx
    └── PostsTable.tsx
```

---

## Lógica de Cache

### GET /api/data

```
1. Lê cache.json do disco
2. Se não existe → busca do webhook, salva, retorna
3. Se existe:
   - Verifica se cachedAt + 24h < agora
   - Se expirado → busca do webhook, salva, retorna
   - Se válido → retorna cache
```

### POST /api/refresh

```
1. Limpa cache.json
2. Busca dados do webhook
3. Salva novo cache
4. Retorna dados atualizados
```

### Funções de Cache (lib/cache.ts)

```typescript
// TTL: 24 horas em milissegundos
const CACHE_TTL = 24 * 60 * 60 * 1000;

function getCache(): CacheData | null;
function setCache(posts: InstagramPost[]): void;
function isExpired(cache: CacheData): boolean;
function clearCache(): void;
```

---

## Filtros de Período

O seletor de período filtra posts por `published_at`:

| Opção | Filtro |
|-------|--------|
| Últimos 7 dias | `published_at >= now - 7 days` |
| Últimos 14 dias | `published_at >= now - 14 days` |
| Últimos 30 dias | `published_at >= now - 30 days` |

---

## Métricas Calculadas

### Hook Score
Extraído via regex do campo `hook_analysis`:
```regex
SCORE TOTAL: (\d+\.?\d*)/10
```

### Replay Ratio (métrica futura)
```javascript
replayRatio = video_play_count / video_view_count
```
Mostra qualidade de retenção. Valores > 1 indicam replays.

---

## Deploy

**Plataforma:** Railway

**Variáveis de ambiente:**
```
WEBHOOK_URL=https://temp-n8n-n8n-start.ecfojw.easypanel.host/webhook/instagram/data
```

**Comando de build:**
```bash
npm run build
```

**Comando de start:**
```bash
npm start
```

---

## Próximos Passos

1. Inicializar projeto Next.js
2. Instalar dependências (Tailwind, shadcn/ui)
3. Implementar API routes com cache
4. Criar componentes do dashboard
5. Implementar filtros de período
6. Testar deploy no Railway