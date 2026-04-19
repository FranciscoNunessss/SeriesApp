import { useEffect, useState } from 'react';
import { User } from '../types';
import { usersApi } from '../api';
import { useActiveUser } from '../context/ActiveUserContext';
import { UserCircle, CheckCircle2 } from 'lucide-react';

export function UserSelector() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { activeUserId, setActiveUserId } = useActiveUser();

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      const data = await usersApi.getAll();
      setUsers(data);
      if (data.length > 0 && !activeUserId) {
        setActiveUserId(data[0].id);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  }

  const activeUser = users.find(u => u.id === activeUserId);

  if (loading) {
    return <div className="text-sm text-gray-500">Loading...</div>;
  }

  return (
    <div className="flex items-center gap-3 bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
      <div className="flex items-center gap-2">
        <UserCircle className="w-5 h-5 text-blue-600" />
        <span className="text-sm font-medium text-gray-700">Active User:</span>
      </div>
      <select
        value={activeUserId || ''}
        onChange={(e) => setActiveUserId(e.target.value ? Number(e.target.value) : null)}
        className="border border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 rounded-md h-9 px-3 text-sm bg-white"
      >
        <option value="">Select User</option>
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.username}
          </option>
        ))}
      </select>
      {activeUser && (
        <div className="flex items-center gap-1 text-green-600">
          <CheckCircle2 className="w-4 h-4" />
          <span className="text-xs font-medium">Active</span>
        </div>
      )}
    </div>
  );
}
