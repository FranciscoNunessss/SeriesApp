import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Series } from '../types';
import { seriesApi } from '../api';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Plus, Search, Edit, Trash2, Eye, Tv } from 'lucide-react';
import { toast } from 'sonner';

export function SeriesListPage() {
  const [series, setSeries] = useState<Series[]>([]);
  const [filteredSeries, setFilteredSeries] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<Series | null>(null);

  useEffect(() => {
    loadSeries();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = series.filter(
        (s) =>
          s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (s.genre ?? '').toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredSeries(filtered);
    } else {
      setFilteredSeries(series);
    }
  }, [searchQuery, series]);

  async function loadSeries() {
    try {
      setLoading(true);
      const data = await seriesApi.getAll();
      setSeries(data);
      setFilteredSeries(data);
    } catch (error) {
      toast.error('Erro ao carregar séries');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(seriesId: number) {
    try {
      await seriesApi.delete(seriesId);
      toast.success('Série eliminada com sucesso');
      setDeleteConfirm(null);
      loadSeries();
    } catch (error) {
      toast.error('Erro ao eliminar série');
    }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">A carregar...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-gray-900">Minhas Séries</h1>
          <p className="text-gray-600 mt-1">Gerencie sua coleção de séries</p>
        </div>
        <Link to="/series/new">
          <Button>
            <Plus className="w-5 h-5" />
            Adicionar Série
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          type="text"
          placeholder="Pesquisar por título ou gênero..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Series Grid */}
      {filteredSeries.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Tv className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg text-gray-900 mb-2">
              {searchQuery ? 'Nenhuma série encontrada' : 'Nenhuma série adicionada'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchQuery
                ? 'Tente ajustar sua pesquisa'
                : 'Adicione sua primeira série para começar'}
            </p>
            {!searchQuery && (
              <Link to="/series/new">
                <Button>
                  <Plus className="w-5 h-5" />
                  Adicionar Série
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredSeries.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-lg text-gray-900 line-clamp-1">{item.title}</h3>
                    <Badge variant={getStatusVariant(item.status)}>
                      {item.status ?? 'sem estado'}
                    </Badge>
                  </div>
                  <p className="text-gray-600 text-sm line-clamp-2">{item.description ?? 'Sem descrição'}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>{item.genre ?? 'Sem género'}</span>
                    <span>•</span>
                    <span>{item.release_year ?? 'Ano N/D'}</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {item.total_seasons ?? 0} {(item.total_seasons ?? 0) === 1 ? 'temporada' : 'temporadas'}
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                    <Link to={`/series/${item.id}`} className="flex-1">
                      <Button variant="secondary" size="sm" className="w-full">
                        <Eye className="w-4 h-4" />
                        Ver
                      </Button>
                    </Link>
                    <Link to={`/series/${item.id}/edit`}>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteConfirm(item)}
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

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setDeleteConfirm(null)}
          onConfirm={() => handleDelete(deleteConfirm.id)}
          title="Eliminar Série"
          message={`Tem certeza que deseja eliminar "${deleteConfirm.title}"? Esta ação não pode ser desfeita.`}
          confirmText="Eliminar"
          variant="danger"
        />
      )}
    </div>
  );
}
