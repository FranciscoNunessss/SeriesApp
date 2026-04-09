import { useEffect, useState } from 'react';
import { HistoryItem, User } from '../types';
import { watchedApi, usersApi } from '../api';
import { useActiveUser } from '../context/ActiveUserContext';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Select } from '../components/ui/select';
import { History, Star } from 'lucide-react';
import { toast } from 'sonner';

export function HistoryPage() {
  const { activeUserId } = useActiveUser();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (activeUserId) {
      setSelectedUserId(activeUserId);
    }
  }, [activeUserId]);

  useEffect(() => {
    if (selectedUserId) {
      loadHistory(selectedUserId);
    }
  }, [selectedUserId]);

  async function loadUsers() {
    try {
      const data = await usersApi.getAll();
      setUsers(data);
    } catch (error) {
      toast.error('Failed to load users');
    }
  }

  async function loadHistory(userId: string) {
    try {
      setLoading(true);
      const data = await watchedApi.getUserHistory(userId);
      setHistory(data);
    } catch (error) {
      toast.error('Failed to load watch history');
    } finally {
      setLoading(false);
    }
  }

  const selectedUser = users.find((u) => u.id === selectedUserId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-gray-900">Watch History</h1>
          <p className="text-gray-600 mt-1">View watched episodes and ratings</p>
        </div>
        <div className="w-64">
          <Select
            label="Select User"
            value={selectedUserId || ''}
            onChange={(e) => setSelectedUserId(e.target.value)}
          >
            <option value="">Choose a user</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.username}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Content */}
      {!selectedUserId ? (
        <Card>
          <CardContent className="text-center py-12">
            <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg text-gray-900 mb-2">Select a user</h3>
            <p className="text-gray-600">Choose a user to view their watch history</p>
          </CardContent>
        </Card>
      ) : loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading history...</div>
        </div>
      ) : history.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg text-gray-900 mb-2">No watch history</h3>
            <p className="text-gray-600">
              {selectedUser?.username} hasn't watched any episodes yet
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {history.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg text-gray-900">{item.series_title}</h3>
                      {item.rating && (
                        <Badge variant="warning" className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-current" />
                          {item.rating}/10
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-600">
                      Season {item.season_number}, Episode {item.episode_number}: {item.episode_title}
                    </p>
                    <p className="text-gray-500 text-sm">
                      Watched on {new Date(item.watched_at).toLocaleDateString('en-US', {
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
