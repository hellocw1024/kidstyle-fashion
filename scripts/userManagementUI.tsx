// 用户管理UI片段 - 添加到AdminPage.tsx中AUDIT标签页之后

{
    currentTab === AppView.USERS && (
        <div className="space-y-6">
            <div className="bg-white rounded-3xl border p-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-xl font-black">用户管理</h3>
                        <p className="text-sm text-gray-400 mt-1">查看和编辑所有用户信息、配额及权限</p>
                    </div>
                </div>

                {/* 搜索和筛选 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="relative md:col-span-2">
                        <Search size={16} className="absolute left-3 top-3 text-gray-400" />
                        <input
                            type="text"
                            placeholder="搜索手机号..."
                            value={userSearch}
                            onChange={e => setUserSearch(e.target.value)}
                            className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border-2 border-transparent focus:border-rose-400 rounded-xl outline-none text-sm"
                        />
                    </div>
                    <select
                        value={userRoleFilter}
                        onChange={e => setUserRoleFilter(e.target.value as any)}
                        className="px-3 py-2.5 bg-gray-50 border-2 border-transparent focus:border-rose-400 rounded-xl outline-none text-sm"
                    >
                        <option value="ALL">所有角色</option>
                        <option value="USER">普通用户</option>
                        <option value="ADMIN">管理员</option>
                    </select>
                </div>

                {/* 用户表格 */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b-2">
                                <th className="text-left py-4 px-4 text-xs font-black text-gray-400 uppercase tracking-widest">手机号</th>
                                <th className="text-left py-4 px-4 text-xs font-black text-gray-400 uppercase tracking-widest">角色</th>
                                <th className="text-left py-4 px-4 text-xs font-black text-gray-400 uppercase tracking-widest">配额</th>
                                <th className="text-left py-4 px-4 text-xs font-black text-gray-400 uppercase tracking-widest">注册时间</th>
                                <th className="text-right py-4 px-4 text-xs font-black text-gray-400 uppercase tracking-widest">操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allUsers
                                .filter(u => {
                                    const matchSearch = u.phone.includes(userSearch);
                                    const matchRole = userRoleFilter === 'ALL' || u.role === userRoleFilter;
                                    return matchSearch && matchRole;
                                })
                                .map(user => (
                                    <tr key={user.id} className="border-b hover:bg-gray-50 transition-colors">
                                        <td className="py-4 px-4">
                                            <span className="font-bold text-gray-800">{user.phone}</span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'
                                                }`}>
                                                {user.role === 'ADMIN' ? '管理员' : '用户'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className="font-bold text-gray-800">{user.quota}</span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className="text-sm text-gray-500">-</span>
                                        </td>
                                        <td className="py-4 px-4 text-right">
                                            <button
                                                onClick={() => {
                                                    setEditingUserId(user.id);
                                                    setEditUserData({ quota: user.quota, role: user.role });
                                                }}
                                                className="px-3 py-1.5 bg-rose-500 text-white rounded-lg text-sm font-bold hover:bg-rose-600 transition-colors"
                                            >
                                                编辑
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>

                {allUsers.filter(u => {
                    const matchSearch = u.phone.includes(userSearch);
                    const matchRole = userRoleFilter === 'ALL' || u.role === userRoleFilter;
                    return matchSearch && matchRole;
                }).length === 0 && (
                        <div className="text-center py-12">
                            <Users size={48} className="text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-400 font-bold">未找到匹配的用户</p>
                        </div>
                    )}
            </div>
        </div>
    )
}

{/* 用户编辑模态框 */ }
{
    editingUserId && editUserData && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditingUserId(null)}></div>
            <div className="relative bg-white rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95">
                <h3 className="text-2xl font-black mb-6">编辑用户信息</h3>

                <div className="space-y-6">
                    <div>
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">
                            手机号
                        </label>
                        <div className="text-lg font-bold text-gray-800">
                            {allUsers.find(u => u.id === editingUserId)?.phone}
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">
                            配额
                        </label>
                        <input
                            type="number"
                            value={editUserData.quota}
                            onChange={e => setEditUserData({ ...editUserData, quota: parseInt(e.target.value) || 0 })}
                            className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-rose-400 rounded-xl outline-none text-lg font-bold"
                        />
                    </div>

                    <div>
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">
                            角色
                        </label>
                        <select
                            value={editUserData.role}
                            onChange={e => setEditUserData({ ...editUserData, role: e.target.value as 'USER' | 'ADMIN' })}
                            className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-rose-400 rounded-xl outline-none text-lg font-bold"
                        >
                            <option value="USER">普通用户</option>
                            <option value="ADMIN">管理员</option>
                        </select>
                    </div>

                    <div className="flex space-x-3 pt-4">
                        <button
                            onClick={async () => {
                                // 保存更改到数据库
                                const { updateUser } = await import('../lib/database.ts');
                                const success = await updateUser(editingUserId, {
                                    quota: editUserData.quota,
                                    role: editUserData.role
                                });

                                if (success) {
                                    alert('用户信息已更新！');
                                    setEditingUserId(null);
                                    // 这里应该刷新用户列表，但由于没有回调，我们只能提示用户刷新页面
                                    window.location.reload();
                                } else {
                                    alert('更新失败，请重试');
                                }
                            }}
                            className="flex-1 py-4 bg-rose-500 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-rose-600 transition-colors"
                        >
                            保存
                        </button>
                        <button
                            onClick={() => setEditingUserId(null)}
                            className="flex-1 py-4 bg-gray-200 text-gray-700 rounded-2xl font-black uppercase tracking-widest hover:bg-gray-300 transition-colors"
                        >
                            取消
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
