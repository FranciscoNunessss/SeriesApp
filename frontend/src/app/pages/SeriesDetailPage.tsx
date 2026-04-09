import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { Series, Season, UserProgress } from '../types';
import { seriesApi, seasonsApi, watchedApi } from '../api';
import { useActiveUser } from '../context/ActiveUserContext';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { ProgressBar } from '../components/ui/ProgressBar';
import { ArrowLeft, Edit, Trash2, Plus, Eye, Calendar } from 'lucide-react';
import { toast } from 'sonner';

export function SeriesDetailPage() {
  const { seriesId } = useParams();
  const navigate = useNavigate();
  const { activeUserId } = useActiveUser();

  const [series, setSeries] = useState<Series | null>(null);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [showCreateSeason, setShowCreateSeason] = useState(false);
  const [deletingSeason, setDeletingSeason] = useState<Season | null>(null);

  useEffect(() => {
    if (seriesId) {
      loadData();
    }
  }, [seriesId, activeUserId]);

  async function loadData() {
    try {
      setLoading(true);
      const [seriesData, seasonsData] = await Promise.all([
        seriesApi.getById(seriesId!),
        seasonsApi.getBySeries(seriesId!),
      ]);
      setSeries(seriesData);
      setSeasons(seasonsData.sort((a, b) => a.season_number - b.season_number));

      if (activeUserId) {
        const progressData = await watchedApi.getUserProgress(activeUserId, seriesId!);
        setProgress(progressData);
      }
    } catch (error) {
      toast.error('Failed to load series details');
      navigate('/series');
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteSeries() {
    try {
      await seriesApi.delete(seriesId!);
      toast.success('Series deleted successfully');
      navigate('/series');
    } catch (error) {
      toast.error('Failed to delete series');
    }
  }

  async function handleDeleteSeason(seasonId: string) {
    try {
      await seasonsApi.delete(seasonId);
      toast.success('Season deleted successfully');
      setDeletingSeason(null);
      loadData();
    } catch (error) {
      toast.error('Failed to delete season');
    }
  }

  async function handleCreateSeason(data: { season_number: number; release_year: number }) {
    try {
      await seasonsApi.create(seriesId!, data);
      toast.success('Season created successfully');
      setShowCreateSeason(false);
      loadData();
    } catch (error) {
      toast.error('Failed to create season');
    }
  }

  if (loading || !series) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'ongoing':
        return 'info';
      case 'cancelled':
        return 'danger';
      default:
        return 'default';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/series')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Series
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl text-gray-900">{series.title}</h1>
              <Badge variant={getStatusVariant(series.status)}>{series.status}</Badge>
            </div>
            <div className="flex items-center gap-4 text-gray-600">
              <span>{series.genre}</span>
              <span>•</span>
              <span>{series.release_year}</span>
              <span>•</span>
              <span>{series.total_seasons} seasons</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Link to={`/series/${seriesId}/edit`}>
              <Button variant="secondary">
                <Edit className="w-4 h-4" />
                Edit
              </Button>
            </Link>
            <Button variant="danger" onClick={() => setDeleteConfirm(true)}>
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Description */}
      <Card>
        <CardHeader>
          <h2 className="text-xl text-gray-900">Description</h2>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">{series.description}</p>
        </CardContent>
      </Card>

      {/* User Progress */}
      {activeUserId && progress && (
        <Card>
          <CardHeader>
            <h2 className="text-xl text-gray-900">Your Progress</h2>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Episodes Watched</span>
              <span className="text-gray-900">
                {progress.watched_episodes} / {progress.total_episodes}
              </span>
            </div>
            <ProgressBar value={progress.percentage} showLabel />
          </CardContent>
        </Card>
      )}

      {/* Seasons */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl text-gray-900">Seasons</h2>
          <Button onClick={() => setShowCreateSeason(true)}>
            <Plus className="w-5 h-5" />
            Add Season
          </Button>
        </div>

        {seasons.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg text-gray-900 mb-2">No seasons yet</h3>
              <p className="text-gray-600 mb-4">Add seasons to organize episodes</p>
              <Button onClick={() => setShowCreateSeason(true)}>
                <Plus className="w-5 h-5" />
                Add Season
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {seasons.map((season) => (
              <Card key={season.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <h3 className="text-lg text-gray-900">Season {season.season_number}</h3>
                      <Badge>{season.release_year}</Badge>
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <Link to={`/seasons/${season.id}`} className="flex-1">
                        <Button variant="secondary" size="sm" className="w-full">
                          <Eye className="w-4 h-4" />
                          View Episodes
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeletingSeason(season)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delete Series Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirm}
        onClose={() => setDeleteConfirm(false)}
        onConfirm={handleDeleteSeries}
        title="Delete Series"
        message={`Are you sure you want to delete "${series.title}"? This will also delete all seasons and episodes.`}
        confirmText="Delete"
        variant="danger"
      />

      {/* Delete Season Confirmation */}
      {deletingSeason && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setDeletingSeason(null)}
          onConfirm={() => handleDeleteSeason(deletingSeason.id)}
          title="Delete Season"
          message={`Are you sure you want to delete Season ${deletingSeason.season_number}? This will also delete all episodes.`}
          confirmText="Delete"
          variant="danger"
        />
      )}

      {/* Create Season Modal */}
      <SeasonFormModal
        isOpen={showCreateSeason}
        onClose={() => setShowCreateSeason(false)}
        onSubmit={handleCreateSeason}
      />
    </div>
  );
}

interface SeasonFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { season_number: number; release_year: number }) => void;
}

function SeasonFormModal({ isOpen, onClose, onSubmit }: SeasonFormModalProps) {
  const [seasonNumber, setSeasonNumber] = useState(1);
  const [releaseYear, setReleaseYear] = useState(new Date().getFullYear());

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({ season_number: seasonNumber, release_year: releaseYear });
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Season">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Season Number"
          type="number"
          min="1"
          required
          value={seasonNumber}
          onChange={(e) => setSeasonNumber(parseInt(e.target.value))}
        />
        <Input
          label="Release Year"
          type="number"
          min="1900"
          max={new Date().getFullYear()}
          required
          value={releaseYear}
          onChange={(e) => setReleaseYear(parseInt(e.target.value))}
        />
        <div className="flex gap-3 justify-end pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Create Season</Button>
        </div>
      </form>
    </Modal>
  );
}
