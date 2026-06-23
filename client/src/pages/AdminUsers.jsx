import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import API from '../utils/axios';
import { useAuth } from '../context/AuthContext';

const AdminUsers = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await API.get('/admin/users');
      setUsers(res.data.data.users);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    setActionLoading(userId);
    try {
      await API.put(`/admin/users/${userId}/role`, { role: newRole });
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
      );
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update role');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (userId) => {
    setActionLoading(userId);
    try {
      await API.delete(`/admin/users/${userId}`);
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      setDeleteConfirm(null);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete user');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <>
      <Helmet>
        <title>Admin — Users — BlogWeb</title>
      </Helmet>

      <div className="admin-page">
        <div className="container">
          <div className="admin-header">
            <div>
              <h1 className="admin-title">👥 User Management</h1>
              <p className="admin-subtitle">Manage user accounts and roles</p>
            </div>
          </div>

          {loading ? (
            <div className="table-skeleton">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="skeleton-row">
                  <div className="skeleton-line" style={{ width: '30%' }} />
                  <div className="skeleton-line skeleton-line-sm" style={{ width: '25%' }} />
                  <div className="skeleton-line skeleton-line-sm" style={{ width: '15%' }} />
                  <div className="skeleton-line skeleton-line-sm" style={{ width: '20%' }} />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="error-state"><p>⚠ {error}</p></div>
          ) : (
            <div className="posts-table">
              <div className="table-header">
                <span className="table-col table-col-title">Name</span>
                <span className="table-col table-col-author">Email</span>
                <span className="table-col table-col-status">Role</span>
                <span className="table-col table-col-date">Joined</span>
                <span className="table-col table-col-actions">Actions</span>
              </div>

              {users.map((user) => (
                <div key={user._id} className="table-row">
                  <div className="table-col table-col-title">
                    <span className="user-row-name">
                      <span className="author-avatar-sm">{user.name?.charAt(0).toUpperCase()}</span>
                      {user.name}
                      {user._id === currentUser?._id && (
                        <span className="tag-tiny" style={{ marginLeft: '0.5rem' }}>You</span>
                      )}
                    </span>
                  </div>
                  <span className="table-col table-col-author">{user.email}</span>
                  <span className="table-col table-col-status">
                    <span className={`status-badge ${user.role === 'admin' ? 'status-admin' : 'status-user'}`}>
                      {user.role}
                    </span>
                  </span>
                  <span className="table-col table-col-date">
                    {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <div className="table-col table-col-actions">
                    {user._id !== currentUser?._id ? (
                      <>
                        <button
                          onClick={() => handleRoleChange(user._id, user.role === 'admin' ? 'user' : 'admin')}
                          disabled={actionLoading === user._id}
                          className="btn btn-sm btn-outline"
                          title={user.role === 'admin' ? 'Demote to user' : 'Promote to admin'}
                        >
                          {actionLoading === user._id ? '...' : user.role === 'admin' ? '⬇ Demote' : '⬆ Promote'}
                        </button>
                        {deleteConfirm === user._id ? (
                          <div className="delete-confirm">
                            <button onClick={() => handleDelete(user._id)} className="action-btn action-delete-confirm">Yes</button>
                            <button onClick={() => setDeleteConfirm(null)} className="action-btn action-cancel">No</button>
                          </div>
                        ) : (
                          <button onClick={() => setDeleteConfirm(user._id)} className="action-btn action-delete" title="Delete user">🗑️</button>
                        )}
                      </>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminUsers;
