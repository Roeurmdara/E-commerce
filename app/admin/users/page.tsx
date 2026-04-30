'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
}

export default function AdminUsers() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (session?.user && (session.user as any).role !== 'ADMIN') {
      router.push('/');
    }
  }, [status, session, router]);

  useEffect(() => {
    if (session?.user?.email) {
      fetchUsers();
    }
  }, [session]);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBlockUser = async (userId: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'block' }),
      });

      if (res.ok) {
        fetchUsers();
      }
    } catch (error) {
      console.error('Failed to block user:', error);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div>Loading users...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl">
        <h1 className="text-4xl font-bold text-black mb-2">User Management</h1>
        <p className="text-gray-600 mb-8">Manage all platform users</p>

        {users.length > 0 ? (
          <div className="border border-black bg-white overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#f5f5f5] border-b border-black">
                <tr>
                  <th className="text-left px-6 py-4 font-bold">Email</th>
                  <th className="text-left px-6 py-4 font-bold">Name</th>
                  <th className="text-left px-6 py-4 font-bold">Role</th>
                  <th className="text-left px-6 py-4 font-bold">Joined</th>
                  <th className="text-left px-6 py-4 font-bold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-gray-200 hover:bg-[#f5f5f5]">
                    <td className="px-6 py-4 font-medium">{user.email}</td>
                    <td className="px-6 py-4">{user.name || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 border text-sm font-medium ${
                        user.role === 'ADMIN'
                          ? 'border-black text-black bg-gray-100'
                          : user.role === 'SELLER'
                          ? 'border-black text-black'
                          : 'border-gray-300 text-gray-600'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-sm">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleBlockUser(user.id)}
                        className="px-4 py-2 border border-red-600 text-red-600 hover:bg-red-600 hover:text-white transition text-sm"
                      >
                        Block
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="border-2 border-dashed border-black bg-white p-12 text-center">
            <h3 className="text-xl font-bold mb-2">No users found</h3>
          </div>
        )}
    </div>
  );
}
