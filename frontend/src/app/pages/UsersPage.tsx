import { useEffect, useState } from 'react';
import { User } from '../types';
import { usersApi } from '../api';
import { useActiveUser } from '../context/ActiveUserContext';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { UserCircle, Edit, Plus, Check } from 'lucide-react';
import { toast } from 'sonner';

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const { activeUserId, setActiveUserId } = useActiveUser();

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      setLoading(true);
      const data = await usersApi.getAll();
      setUsers(data);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateUser(data: { username: string; email: string }) {
    try {
      await usersApi.create(data);
      toast.success('User created successfully');
      setShowCreateModal(false);
      loadUsers();
    } catch (error) {
      toast.error('Failed to create user');
    }
  }

  async function handleUpdateUser(userId: number, data: { username: string; email: string }) {
    try {
      await usersApi.update(userId, data);
      toast.success('User updated successfully');
      setEditingUser(null);
      loadUsers();
    } catch (error) {
      toast.error('Failed to update user');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Usuários' }]} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-gray-900">Usuários</h1>
          <p className="text-gray-600 mt-1">Gerencie usuários e selecione o usuário ativo</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-5 h-5" />
          Adicionar Usuário
        </Button>
      </div>

      {/* Users List */}
      {users.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <UserCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg text-gray-900 mb-2">No users yet</h3>
            <p className="text-gray-600 mb-4">Get started by creating your first user</p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="w-5 h-5" />
              Create User
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {users.map((user) => (
            <Card key={user.id}>
              <CardContent className="flex items-center justify-between py-4">
                <div className="flex items-center gap-4">
                  <UserCircle className="w-10 h-10 text-gray-400" />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg text-gray-900">{user.username}</h3>
                      {activeUserId === user.id && (
                        <Badge variant="info">
                          <Check className="w-3 h-3 mr-1" />
                          Active
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-600">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {activeUserId !== user.id && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setActiveUserId(user.id)}
                    >
                      Set as Active
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingUser(user)}
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create User Modal */}
      <UserFormModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateUser}
        title="Create User"
      />

      {/* Edit User Modal */}
      {editingUser && (
        <UserFormModal
          isOpen={true}
          onClose={() => setEditingUser(null)}
          onSubmit={(data) => handleUpdateUser(editingUser.id, data)}
          title="Edit User"
          initialData={editingUser}
        />
      )}
    </div>
  );
}

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { username: string; email: string }) => void;
  title: string;
  initialData?: User;
}

function UserFormModal({ isOpen, onClose, onSubmit, title, initialData }: UserFormModalProps) {
  const [username, setUsername] = useState(initialData?.username || '');
  const [email, setEmail] = useState(initialData?.email || '');

  useEffect(() => {
    if (initialData) {
      setUsername(initialData.username);
      setEmail(initialData.email);
    } else {
      setUsername('');
      setEmail('');
    }
  }, [initialData]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({ username, email });
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          placeholder="Enter username"
        />
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="Enter email"
        />
        <div className="flex gap-3 justify-end pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            {initialData ? 'Update' : 'Create'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
