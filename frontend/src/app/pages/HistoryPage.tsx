import { useEffect, useState } from 'react';
import { HistoryItem, Episode, Season, Series } from '../types';
import { watchedApi, episodesApi, seasonsApi, seriesApi } from '../api';
import { useActiveUser } from '../context/ActiveUserContext';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { History, Star } from 'lucide-react';
import { toast } from 'sonner';

export function HistoryPage() {
  const { activeUserId } = useActiveUser();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, [activeUserId]);

  async function loadHistory() {
    if (!activeUserId) {
      setHistory([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const watchedItems = await watchedApi.getUserHistory(activeUserId);

      const episodesMap = new Map<number, Episode>();
      const seasonsMap = new Map<number, Season>();
      const seriesMap = new Map<number, Series>();

      const items = await Promise.all(
        watchedItems.map(async (watched): Promise<HistoryItem | null> => {
          let episode = episodesMap.get(watched.episode_id);
          if (!episode) {
            episode = await episodesApi.getById(watched.episode_id);
            episodesMap.set(episode.id, episode);
          }

          let season = seasonsMap.get(episode.season_id);
          if (!season) {
            season = await seasonsApi.getById(episode.season_id);
            seasonsMap.set(season.id, season);
          }

          let series = seriesMap.get(season.series_id);
          if (!series) {
            series = await seriesApi.getById(season.series_id);
            seriesMap.set(series.id, series);
          }

          return {
            id: watched.id,
            series_title: series.title,
            season_number: season.season_number,
            episode_number: episode.episode_number,
            episode_title: episode.title,
            watched_at: watched.watched_at,
            rating: watched.rating,
          };
        }),
      );

      setHistory(items.filter((item): item is HistoryItem => item !== null));
    } catch (error) {
      toast.error('Erro ao carregar histórico');
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl text-gray-900">Histórico</h1>
        <p className="text-gray-600 mt-1">Episódios assistidos do utilizador ativo, ordenados por data</p>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">A carregar...</div>
        </div>
      ) : !activeUserId ? (
        <Card>
          <CardContent className="text-center py-12">
            <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg text-gray-900 mb-2">Sem utilizador ativo</h3>
            <p className="text-gray-600">
              Selecione um utilizador no topo para consultar o histórico.
            </p>
          </CardContent>
        </Card>
      ) : history.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg text-gray-900 mb-2">Nenhum histórico</h3>
            <p className="text-gray-600">
              Este utilizador ainda não assistiu nenhum episódio.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {history.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg text-gray-900">{item.series_title}</h3>
                      {item.rating && (
                        <Badge variant="default" className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-current" />
                          {item.rating}/10
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-600">
                      Temporada {item.season_number}, Episódio {item.episode_number}: {item.episode_title}
                    </p>
                    <p className="text-gray-500 text-sm">
                      Assistido em {new Date(item.watched_at).toLocaleDateString('pt-PT', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
