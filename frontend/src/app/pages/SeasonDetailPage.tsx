import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Season, Episode, Series } from '../types';
import { seasonsApi, episodesApi, seriesApi, watchedApi } from '../api';
import { useActiveUser } from '../context/ActiveUserContext';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
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
  const [watchedEpisodeIds, setWatchedEpisodeIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [showCreateEpisode, setShowCreateEpisode] = useState(false);
  const [editingEpisode, setEditingEpisode] = useState<Episode | null>(null);
  const [deletingEpisode, setDeletingEpisode] = useState<Episode | null>(null);
  const [markingWatched, setMarkingWatched] = useState<Episode | null>(null);

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
      const watchedIds = activeUserId ? await watchedApi.getWatchedEpisodeIds(activeUserId) : new Set<string>();
      
      setSeason(seasonData);
      setSeries(seriesData);
      setEpisodes(episodesData.sort((a, b) => a.episode_number - b.episode_number));
      setWatchedEpisodeIds(watchedIds);
    } catch (error) {
      toast.error('Failed to load season details');
      navigate('/series');
    } finally {
      setLoading(false);
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
      toast.success('Episode created successfully');
      setShowCreateEpisode(false);
      loadData();
    } catch (error) {
      toast.error('Failed to create episode');
    }
  }

  async function handleUpdateEpisode(
    episodeId: string,
    data: {
      episode_number: number;
      title: string;
      duration_minutes: number;
      synopsis: string;
    }
  ) {
    try {
      await episodesApi.update(episodeId, data);
      toast.success('Episode updated successfully');
      setEditingEpisode(null);
      loadData();
    } catch (error) {
      toast.error('Failed to update episode');
    }
  }

  async function handleDeleteEpisode(episodeId: string) {
    try {
      await episodesApi.delete(episodeId);
      toast.success('Episode deleted successfully');
      setDeletingEpisode(null);
      loadData();
    } catch (error) {
      toast.error('Failed to delete episode');
    }
  }

  async function handleMarkWatched(episodeId: string, rating?: number) {
    if (!activeUserId) {
      toast.error('Please select an active user first');
      return;
    }

    try {
      await watchedApi.markAsWatched({
        user_id: activeUserId,
        episode_id: episodeId,
        rating,
      });
      toast.success('Episode marked as watched');
      setMarkingWatched(null);
      loadData();
    } catch (error) {
      toast.error('Episode already marked as watched');
    }
  }

  if (loading || !season || !series) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
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
          Back to {series.title}
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl text-gray-900">Season {season.season_number}</h1>
            <p className="text-gray-600 mt-1">
              {series.title} • {season.release_year}
            </p>
          </div>
          <Button onClick={() => setShowCreateEpisode(true)}>
            <Plus className="w-5 h-5" />
            Add Episode
          </Button>
        </div>
      </div>

      {/* Episodes List */}
      {episodes.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Play className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg text-gray-900 mb-2">No episodes yet</h3>
            <p className="text-gray-600 mb-4">Add episodes to this season</p>
            <Button onClick={() => setShowCreateEpisode(true)}>
              <Plus className="w-5 h-5" />
              Add Episode
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {episodes.map((episode) => {
            const isWatched = watchedEpisodeIds.has(episode.id);

            return (
              <Card key={episode.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <Badge variant="default">Ep. {episode.episode_number}</Badge>
                        <h3 className="text-lg text-gray-900">{episode.title}</h3>
                        {isWatched && (
                          <Badge variant="success">
                            <Check className="w-3 h-3 mr-1" />
                            Watched
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm">{episode.synopsis}</p>
                      <p className="text-gray-500 text-sm">{episode.duration_minutes} minutes</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {!isWatched && activeUserId && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setMarkingWatched(episode)}
                        >
                          <Check className="w-4 h-4" />
                          Mark Watched
                        </Button>
                      )}
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
        title="Add Episode"
      />

      {/* Edit Episode Modal */}
      {editingEpisode && (
        <EpisodeFormModal
          isOpen={true}
          onClose={() => setEditingEpisode(null)}
          onSubmit={(data) => handleUpdateEpisode(editingEpisode.id, data)}
          title="Edit Episode"
          initialData={editingEpisode}
        />
      )}

      {/* Delete Episode Confirmation */}
      {deletingEpisode && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setDeletingEpisode(null)}
          onConfirm={() => handleDeleteEpisode(deletingEpisode.id)}
          title="Delete Episode"
          message={`Are you sure you want to delete "${deletingEpisode.title}"?`}
          confirmText="Delete"
          variant="danger"
        />
      )}

      {/* Mark as Watched Modal */}
      {markingWatched && (
        <MarkWatchedModal
          isOpen={true}
          onClose={() => setMarkingWatched(null)}
          onSubmit={(rating) => handleMarkWatched(markingWatched.id, rating)}
          episode={markingWatched}
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
    duration_minutes: initialData?.duration_minutes || 45,
    synopsis: initialData?.synopsis || '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        episode_number: initialData.episode_number,
        title: initialData.title,
        duration_minutes: initialData.duration_minutes,
        synopsis: initialData.synopsis,
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
          label="Episode Number"
          type="number"
          min="1"
          required
          value={formData.episode_number}
          onChange={(e) =>
            setFormData({ ...formData, episode_number: parseInt(e.target.value) })
          }
        />
        <Input
          label="Title"
          required
          placeholder="Enter episode title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />
        <Input
          label="Duration (minutes)"
          type="number"
          min="1"
          required
          value={formData.duration_minutes}
          onChange={(e) =>
            setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })
          }
        />
        <Textarea
          label="Synopsis"
          required
          placeholder="Enter episode synopsis"
          rows={4}
          value={formData.synopsis}
          onChange={(e) => setFormData({ ...formData, synopsis: e.target.value })}
        />
        <div className="flex gap-3 justify-end pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">{initialData ? 'Update' : 'Create'}</Button>
        </div>
      </form>
    </Modal>
  );
}

interface MarkWatchedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating?: number) => void;
  episode: Episode;
}

function MarkWatchedModal({ isOpen, onClose, onSubmit, episode }: MarkWatchedModalProps) {
  const [rating, setRating] = useState<number | undefined>(undefined);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(rating);
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Mark as Watched">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <h3 className="text-lg text-gray-900 mb-1">{episode.title}</h3>
          <p className="text-gray-600 text-sm">Episode {episode.episode_number}</p>
        </div>
        <Input
          label="Rating (Optional)"
          type="number"
          min="1"
          max="10"
          placeholder="Rate from 1 to 10"
          value={rating || ''}
          onChange={(e) => setRating(e.target.value ? parseInt(e.target.value) : undefined)}
        />
        <div className="flex gap-3 justify-end pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Mark as Watched</Button>
        </div>
      </form>
    </Modal>
  );
}
