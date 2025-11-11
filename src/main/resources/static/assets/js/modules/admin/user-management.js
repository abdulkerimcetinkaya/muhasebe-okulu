/**
 * User Management Module for Admin Panel
 *
 * Provides CRUD operations for user management including loading users,
 * editing user roles, and deleting users.
 *
 * Dependencies: Logger, StorageUtil, Formatters, UIHelpers
 *
 * @module user-management
 */

const UserManagement = {
    /**
     * Load all users from API with pagination
     * Displays users in a table with role badges and action buttons
     * @returns {Promise<void>}
     */
    loadUsers: async () => {
        try {
            const token = StorageUtil.get('token');
            const response = await fetch('http://localhost:8080/api/admin/users?page=0&size=50', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Kullanıcılar alınamadı');
            }

            const data = await response.json();
            UserManagement.renderUsers(data.content || []);

            lucide.createIcons();
        } catch (err) {
            Logger.error('Kullanıcı yükleme hatası:', err);
            const tbody = document.getElementById('usersTbody');
            if (tbody) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="5" class="px-6 py-8 text-center text-red-500">
                            <i data-lucide="alert-circle" class="w-8 h-8 mx-auto mb-2"></i>
                            <div>Kullanıcılar yüklenirken hata oluştu</div>
                        </td>
                    </tr>
                `;
                lucide.createIcons();
            }
        }
    },

    /**
     * Render users in the table
     * @param {Array} users - Array of user objects
     */
    renderUsers: (users) => {
        const tbody = document.getElementById('usersTbody');

        if (!tbody) {
            Logger.error('usersTbody element not found');
            return;
        }

        if (!users || users.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="px-6 py-8 text-center text-slate-500">
                        <i data-lucide="users" class="w-8 h-8 mx-auto mb-2 text-slate-400"></i>
                        <div>Henüz kullanıcı bulunmuyor</div>
                    </td>
                </tr>
            `;
            lucide.createIcons();
            return;
        }

        tbody.innerHTML = users.map(user => `
            <tr>
                <td class="px-6 py-3 text-sm">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 bg-slate-800 text-white rounded-full flex items-center justify-center text-sm font-medium">
                            ${user.firstName ? user.firstName.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div class="font-medium text-slate-900">${user.firstName ? `${user.firstName} ${user.lastName}` : user.username}</div>
                            <div class="text-slate-500 text-xs">${user.email || 'E-posta yok'}</div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-3 text-sm text-slate-600">${user.email || 'E-posta yok'}</td>
                <td class="px-6 py-3">
                    <span class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md ${Formatters.getRoleColor(user.role)}">
                        ${Formatters.getRoleText(user.role)}
                    </span>
                </td>
                <td class="px-6 py-3 text-sm text-slate-600">${Formatters.formatDate(user.createdAt)}</td>
                <td class="px-6 py-3 text-right">
                    <div class="flex items-center gap-2">
                        <button onclick="UserManagement.editUser('${user.id}')" class="text-slate-400 hover:text-slate-600">
                            <i data-lucide="edit" class="w-4 h-4"></i>
                        </button>
                        <button onclick="UserManagement.deleteUser('${user.id}')" class="text-slate-400 hover:text-red-600">
                            <i data-lucide="trash-2" class="w-4 h-4"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        lucide.createIcons();
        Logger.log(`Rendered ${users.length} users`);
    },

    /**
     * Edit user - opens prompt to change user role
     * @param {string} userId - User ID to edit
     * @returns {Promise<void>}
     */
    editUser: async (userId) => {
        try {
            const token = StorageUtil.get('token');
            const response = await fetch(`http://localhost:8080/api/admin/users/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Kullanıcı bilgileri alınamadı');
            }

            const user = await response.json();

            // Kullanıcı düzenleme modalını aç
            const newRole = prompt(`Kullanıcı rolünü değiştir (${user.username}):`, user.role);
            if (newRole && newRole !== user.role) {
                await UserManagement.updateUserRole(userId, newRole);
            }
        } catch (err) {
            Logger.error('Kullanıcı düzenleme hatası:', err);
            alert('Kullanıcı düzenlenirken hata oluştu');
        }
    },

    /**
     * Update user role
     * @param {string} userId - User ID
     * @param {string} newRole - New role (ADMIN, USER)
     * @returns {Promise<void>}
     */
    updateUserRole: async (userId, newRole) => {
        try {
            const token = StorageUtil.get('token');
            const response = await fetch(`http://localhost:8080/api/admin/users/${userId}/role?role=${newRole}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Kullanıcı rolü güncellenemedi');
            }

            alert('Kullanıcı rolü başarıyla güncellendi');
            UserManagement.loadUsers(); // Listeyi yenile
            Logger.log(`User role updated: ${userId} -> ${newRole}`);
        } catch (err) {
            Logger.error('Rol güncelleme hatası:', err);
            alert('Rol güncellenirken hata oluştu');
        }
    },

    /**
     * Delete user with confirmation
     * @param {string} userId - User ID to delete
     * @returns {Promise<void>}
     */
    deleteUser: async (userId) => {
        UIHelpers.showConfirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?', async () => {
            try {
                const token = StorageUtil.get('token');
                const response = await fetch(`http://localhost:8080/api/admin/users/${userId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error('Kullanıcı silinemedi');
                }

                UIHelpers.showSuccess('Kullanıcı başarıyla silindi');
                UserManagement.loadUsers(); // Listeyi yenile
                Logger.log(`User deleted: ${userId}`);
            } catch (err) {
                Logger.error('Kullanıcı silme hatası:', err);
                UIHelpers.showError('Kullanıcı silinirken hata oluştu');
            }
        });
    },

    /**
     * Initialize user management module
     * Sets up event listeners and loads initial data
     */
    initialize: () => {
        Logger.log('User Management module initialized');
        // Load users when users section is shown
        const usersSection = document.getElementById('all-users');
        if (usersSection && !usersSection.classList.contains('hidden')) {
            UserManagement.loadUsers();
        }
    }
};

// Export for ES6 modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UserManagement;
}
