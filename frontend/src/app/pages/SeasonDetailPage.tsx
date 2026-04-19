import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Season, Episode, Series } from '../types';
import { seasonsApi, episodesApi, seriesApi, watchedApi } from '../api';
import { useActiveUser } from '../context/ActiveUserContext';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { ArrowLeft, Plus, Edit, Trash2, Check, Play } from 'lucide-react';
import { toast } from 'sonner';

export function SeasonDetailPage() {
  const { seasonId } = useParams();
  const navigate = useNavigate();
  const { activeUserId } = useActiveUser();

  const [season, setSeason] = useState<Season | null>(null);
  const [series, setSeries] = useState<Series | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [watchedEpisodes, setWatchedEpisodes] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [showCreateEpisode, setShowCreateEpisode] = useState(false);
  const [editingEpisode, setEditingEpisode] = useState<Episode | null>(null);
  const [deletingEpisode, setDeletingEpisode] = useState<Episode | null>(null);

  useEffect(() => {
    if (seasonId) {
      loadData();
    }
  }, [seasonId, activeUserId]);

  async function loadData() {
    try {
      setLoading(true);
      const seasonData = await seasonsApi.getById(seasonId!);
      const seriesData = await seriesApi.getById(seasonData.series_id);
      const episodesData = await episodesApi.getBySeason(seasonId!);

      setSeason(seasonData);
      setSeries(seriesData);
      setEpisodes(episodesData.sort((a, b) => a.episode_number - b.episode_number));

      if (activeUserId) {
        const watchedHistory = await watchedApi.getUserHistory(activeUserId);
        setWatchedEpisodes(new Set(watchedHistory.map((item) => item.episode_id)));
      } else {
        setWatchedEpisodes(new Set());
      }
    } catch (error) {
      toast.error('Erro ao carregar temporada');
      navigate('/series');
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleWatched(episodeId: number) {
    if (!activeUserId) {
      toast.error('Selecione um utilizador ativo para marcar episódios');
      return;
    }

    try {
      if (watchedEpisodes.has(episodeId)) {
        // Não há API para desmarcar, então apenas mostramos mensagem
        toast.info('Episódio já marcado como assistido');
      } else {
        await watchedApi.markAsWatched({
          user_id: activeUserId,
          episode_id: episodeId,
        });
        setWatchedEpisodes(prev => new Set(prev).add(episodeId));
        toast.success('Episódio marcado como assistido');
      }
    } catch (error) {
      toast.error('Erro ao marcar episódio');
    }
  }

  async function handleCreateEpisode(data: {
    episode_number: number;
    title: string;
    duration_minutes: number;
    synopsis: string;
  }) {
    try {
      await episodesApi.create(seasonId!, data);
      toast.success('Episódio criado com sucesso');
      setShowCreateEpisode(false);
      loadData();
    } catch (error) {
      toast.error('Erro ao criar episódio');
    }
  }

  async function handleUpdateEpisode(
    episodeId: number,
    data: {
      episode_number: number;
      title: string;
      duration_minutes: number;
      synopsis: string;
    }
  ) {
    try {
      await episodesApi.update(episodeId, data);
      toast.success('Episódio atualizado com sucesso');
      setEditingEpisode(null);
      loadData();
    } catch (error) {
      toast.error('Erro ao atualizar episódio');
    }
  }

  async function handleDeleteEpisode(episodeId: number) {
    try {
      await episodesApi.delete(episodeId);
      toast.success('Episódio eliminado com sucesso');
      setDeletingEpisode(null);
      loadData();
    } catch (error) {
      toast.error('Erro ao eliminar episódio');
    }
  }

  if (loading || !season || !series) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">A carregar...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/series/${series.id}`)}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl text-gray-900">
              {series.title} - Temporada {season.season_number}
            </h1>
            <p className="text-gray-600 mt-1">
              {season.release_year} • {episodes.length} {episodes.length === 1 ? 'episódio' : 'episódios'}
            </p>
            {!activeUserId && (
              <p className="text-amber-700 mt-2 text-sm">
                Selecione um utilizador ativo para marcar episódios como assistidos.
              </p>
            )}
          </div>
          <Button onClick={() => setShowCreateEpisode(true)}>
            <Plus className="w-5 h-5" />
            Adicionar Episódio
          </Button>
        </div>
      </div>

      {/* Episodes List */}
      {episodes.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Play className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg text-gray-900 mb-2">Nenhum episódio</h3>
            <p className="text-gray-600 mb-4">Adicione episódios a esta temporada</p>
            <Button onClick={() => setShowCreateEpisode(true)}>
              <Plus className="w-5 h-5" />
              Adicionar Episódio
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {episodes.map((episode) => {
            const isWatched = watchedEpisodes.has(episode.id);

            return (
              <Card
                key={episode.id}
                className={`hover:shadow-md transition-shadow ${isWatched ? 'bg-green-50' : ''}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Checkbox */}
                    <div className="flex-shrink-0 pt-1">
                      <button
                        onClick={() => handleToggleWatched(episode.id)}
                        className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                          isWatched
                            ? 'bg-green-600 border-green-600'
                            : 'border-gray-300 hover:border-green-600'
                        }`}
                      >
                        {isWatched && <Check className="w-4 h-4 text-white" />}
                      </button>
                    </div>

                    {/* Episode Content */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <Badge variant="default">Ep. {episode.episode_number}</Badge>
                        <h3 className={`text-lg ${isWatched ? 'text-gray-600' : 'text-gray-900'}`}>
                          {episode.title}
                        </h3>
                        <span className="text-sm text-gray-500">
                          {episode.duration_minutes ? `${episode.duration_minutes} min` : 'Duração não definida'}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm">{episode.synopsis ?? 'Sem sinopse'}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingEpisode(episode)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeletingEpisode(episode)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Episode Modal */}
      <EpisodeFormModal
        isOpen={showCreateEpisode}
        onClose={() => setShowCreateEpisode(false)}
        onSubmit={handleCreateEpisode}
        title="Adicionar Episódio"
      />

      {/* Edit Episode Modal */}
      {editingEpisode && (
        <EpisodeFormModal
          isOpen={true}
          onClose={() => setEditingEpisode(null)}
          onSubmit={(data) => handleUpdateEpisode(editingEpisode.id, data)}
          title="Editar Episódio"
          initialData={editingEpisode}
        />
      )}

      {/* Delete Episode Confirmation */}
      {deletingEpisode && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setDeletingEpisode(null)}
          onConfirm={() => handleDeleteEpisode(deletingEpisode.id)}
          title="Eliminar Episódio"
          message={`Tem certeza que deseja eliminar "${deletingEpisode.title}"?`}
          confirmText="Eliminar"
          variant="danger"
        />
      )}
    </div>
  );
}

interface EpisodeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    episode_number: number;
    title: string;
    duration_minutes: number;
    synopsis: string;
  }) => void;
  title: string;
  initialData?: Episode;
}

function EpisodeFormModal({ isOpen, onClose, onSubmit, title, initialData }: EpisodeFormModalProps) {
  const [formData, setFormData] = useState({
    episode_number: initialData?.episode_number || 1,
    title: initialData?.title || '',
    duration_minutes: initialData?.duration_minutes ?? 45,
    synopsis: initialData?.synopsis ?? '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        episode_number: initialData.episode_number,
        title: initialData.title,
        duration_minutes: initialData.duration_minutes ?? 45,
        synopsis: initialData.synopsis ?? '',
      });
    }
  }, [initialData]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(formData);
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Número do Episódio"
          type="number"
          min="1"
          required
          value={formData.episode_number}
          onChange={(e) =>
            setFormData({ ...formData, episode_number: parseInt(e.target.value) })
          }
        />
        <Input
          label="Título"
          required
          placeholder="Digite o título do episódio"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />
        <Input
          label="Duração (minutos)"
          type="number"
          min="1"
          required
          value={formData.duration_minutes}
          onChange={(e) =>
            setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })
          }
        />
        <Textarea
          label="Sinopse"
          required
          placeholder="Digite a sinopse do episódio"
          rows={4}
          value={formData.synopsis}
          onChange={(e) => setFormData({ ...formData, synopsis: e.target.value })}
        />
        <div className="flex gap-3 justify-end pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">{initialData ? 'Atualizar' : 'Criar'}</Button>
        </div>
      </form>
    </Modal>
  );
}
