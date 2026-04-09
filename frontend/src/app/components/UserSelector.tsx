import { useEffect, useState } from 'react';
import { User } from '../types';
import { usersApi } from '../api';
import { useActiveUser } from '../context/ActiveUserContext';
import { Select } from './ui/select';
import { UserCircle } from 'lucide-react';

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

  if (loading) {
    return <div className="text-sm text-gray-500">Loading users...</div>;
  }

  return (
    <div className="flex items-center gap-2">
      <UserCircle className="w-5 h-5 text-gray-600" />
      <Select
        value={activeUserId || ''}
        onChange={(e) => setActiveUserId(e.target.value)}
        className="w-48"
      >
        <option value="">Select User</option>
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.username}
          </option>
        ))}
      </Select>
    </div>
  );
}
