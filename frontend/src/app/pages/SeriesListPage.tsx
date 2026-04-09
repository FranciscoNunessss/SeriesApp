import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Series } from '../types';
import { seriesApi } from '../api';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
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
          s.genre.toLowerCase().includes(searchQuery.toLowerCase())
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
      toast.error('Failed to load series');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(seriesId: string) {
    try {
      await seriesApi.delete(seriesId);
      toast.success('Series deleted successfully');
      setDeleteConfirm(null);
      loadSeries();
    } catch (error) {
      toast.error('Failed to delete series');
    }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading series...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-gray-900">Series</h1>
          <p className="text-gray-600 mt-1">Browse and manage your series collection</p>
        </div>
        <Link to="/series/new">
          <Button>
            <Plus className="w-5 h-5" />
            Add Series
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          type="text"
          placeholder="Search series by title or genre..."
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
              {searchQuery ? 'No series found' : 'No series yet'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchQuery
                ? 'Try adjusting your search query'
                : 'Get started by adding your first series'}
            </p>
            {!searchQuery && (
              <Link to="/series/new">
                <Button>
                  <Plus className="w-5 h-5" />
                  Add Series
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
                  <div className="flex items-start justify-between">
                    <h3 className="text-lg text-gray-900 line-clamp-1">{item.title}</h3>
                    <Badge variant={getStatusVariant(item.status)}>
                      {item.status}
                    </Badge>
                  </div>
                  <p className="text-gray-600 text-sm line-clamp-2">{item.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{item.genre}</span>
                    <span>•</span>
                    <span>{item.release_year}</span>
                    <span>•</span>
                    <span>{item.total_seasons} seasons</span>
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <Link to={`/series/${item.id}`} className="flex-1">
                      <Button variant="secondary" size="sm" className="w-full">
                        <Eye className="w-4 h-4" />
                        View Details
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
          title="Delete Series"
          message={`Are you sure you want to delete "${deleteConfirm.title}"? This action cannot be undone.`}
          confirmText="Delete"
          variant="danger"
        />
      )}
    </div>
  );
}
