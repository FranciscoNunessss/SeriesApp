import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { Series, Season } from '../types';
import { seriesApi, seasonsApi } from '../api';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { ArrowLeft, Edit, Trash2, Plus, Eye, Calendar } from 'lucide-react';
import { toast } from 'sonner';

export function SeriesDetailPage() {
  const { seriesId } = useParams();
  const navigate = useNavigate();

  const [series, setSeries] = useState<Series | null>(null);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [showCreateSeason, setShowCreateSeason] = useState(false);
  const [deletingSeason, setDeletingSeason] = useState<Season | null>(null);

  useEffect(() => {
    if (seriesId) {
      loadData();
    }
  }, [seriesId]);

  async function loadData() {
    try {
      setLoading(true);
      const [seriesData, seasonsData] = await Promise.all([
        seriesApi.getById(seriesId!),
        seasonsApi.getBySeries(seriesId!),
      ]);
      setSeries(seriesData);
      setSeasons(seasonsData.sort((a, b) => a.season_number - b.season_number));
    } catch (error) {
      toast.error('Erro ao carregar detalhes da série');
      navigate('/series');
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteSeries() {
    try {
      await seriesApi.delete(seriesId!);
      toast.success('Série eliminada com sucesso');
      navigate('/series');
    } catch (error) {
      toast.error('Erro ao eliminar série');
    }
  }

  async function handleDeleteSeason(seasonId: number) {
    try {
      await seasonsApi.delete(seasonId);
      toast.success('Temporada eliminada com sucesso');
      setDeletingSeason(null);
      loadData();
    } catch (error) {
      toast.error('Erro ao eliminar temporada');
    }
  }

  async function handleCreateSeason(data: { season_number: number; release_year: number }) {
    try {
      await seasonsApi.create(seriesId!, data);
      toast.success('Temporada criada com sucesso');
      setShowCreateSeason(false);
      loadData();
    } catch (error) {
      toast.error('Erro ao criar temporada');
    }
  }

  if (loading || !series) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">A carregar...</div>
      </div>
    );
  }

  const getStatusVariant = (status: string | null) => {
    switch (status) {
      case 'completed':
        return 'secondary';
      case 'ongoing':
        return 'default';
      case 'cancelled':
        return 'destructive';
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
          Voltar
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl text-gray-900">{series.title}</h1>
              <Badge variant={getStatusVariant(series.status)}>{series.status ?? 'sem estado'}</Badge>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <span>{series.genre ?? 'Sem género'}</span>
              <span>•</span>
              <span>{series.release_year ?? 'Ano N/D'}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Link to={`/series/${seriesId}/edit`}>
              <Button variant="secondary">
                <Edit className="w-4 h-4" />
                Editar
              </Button>
            </Link>
            <Button variant="danger" onClick={() => setDeleteConfirm(true)}>
              <Trash2 className="w-4 h-4" />
              Eliminar
            </Button>
          </div>
        </div>
      </div>

      {/* Description */}
      <Card>
        <CardContent className="p-6">
          <p className="text-gray-600">{series.description ?? 'Sem descrição'}</p>
        </CardContent>
      </Card>

      {/* Seasons */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl text-gray-900">Temporadas</h2>
          <Button onClick={() => setShowCreateSeason(true)}>
            <Plus className="w-5 h-5" />
            Adicionar Temporada
          </Button>
        </div>

        {seasons.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg text-gray-900 mb-2">Nenhuma temporada</h3>
              <p className="text-gray-600 mb-4">Adicione temporadas para organizar os episódios</p>
              <Button onClick={() => setShowCreateSeason(true)}>
                <Plus className="w-5 h-5" />
                Adicionar Temporada
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {seasons.map((season) => (
              <Card key={season.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <h3 className="text-lg text-gray-900">Temporada {season.season_number}</h3>
                      <Badge>{season.release_year ?? 'N/D'}</Badge>
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <Link to={`/seasons/${season.id}`} className="flex-1">
                        <Button variant="secondary" size="sm" className="w-full">
                          <Eye className="w-4 h-4" />
                          Ver
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
        title="Eliminar Série"
        message={`Tem certeza que deseja eliminar "${series.title}"? Isto também eliminará todas as temporadas e episódios.`}
        confirmText="Eliminar"
        variant="danger"
      />

      {/* Delete Season Confirmation */}
      {deletingSeason && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setDeletingSeason(null)}
          onConfirm={() => handleDeleteSeason(deletingSeason.id)}
          title="Eliminar Temporada"
          message={`Tem certeza que deseja eliminar a Temporada ${deletingSeason.season_number}? Isto também eliminará todos os episódios.`}
          confirmText="Eliminar"
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
    <Modal isOpen={isOpen} onClose={onClose} title="Adicionar Temporada">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Número da Temporada"
          type="number"
          min="1"
          required
          value={seasonNumber}
          onChange={(e) => setSeasonNumber(parseInt(e.target.value))}
        />
        <Input
          label="Ano de Lançamento"
          type="number"
          min="1900"
          max={new Date().getFullYear() + 5}
          required
          value={releaseYear}
          onChange={(e) => setReleaseYear(parseInt(e.target.value))}
        />
        <div className="flex gap-3 justify-end pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">Criar Temporada</Button>
        </div>
      </form>
    </Modal>
  );
}
