
import React, { useState, useEffect } from 'react';
import { AppView, User, RechargeRequest, ImageResource, SystemConfig } from './types.ts';
import { MODEL_LIBRARY, ModelEntry, INITIAL_CONFIG } from './constants.tsx';
import GenerationPage from './pages/GenerationPage.tsx';
import UserCenter from './pages/UserCenter.tsx';
import AdminPage from './pages/AdminPage.tsx';
import AuthPage from './pages/AuthPage.tsx';
import HelpCenter from './pages/HelpCenter.tsx';
import Header from './components/Header.tsx';
import * as db from './lib/database';
import * as idbStorage from './lib/indexedDBStorage';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.AUTH);
  const [user, setUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [rechargeRequests, setRechargeRequests] = useState<RechargeRequest[]>([]);
  const [resources, setResources] = useState<ImageResource[]>([]);
  const [models, setModels] = useState<ModelEntry[]>(MODEL_LIBRARY);
  const [systemConfig, setSystemConfig] = useState<SystemConfig>(INITIAL_CONFIG);
  const [userCenterTab, setUserCenterTab] = useState<'RESOURCES' | 'RECHARGE' | 'HISTORY' | 'SETTINGS'>('RESOURCES');  // 控制用户中心标签页
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('🔄 开始加载数据...');

        // 从 Supabase 加载数据
        const [usersData, configData, requestsData, modelsData] = await Promise.all([
          db.getAllUsers(),
          db.getSystemConfig(),
          db.getAllRechargeRequests(),
          db.getAllModels()
        ]);

        console.log('✅ 数据库查询完成');

        // 设置用户列表
        if (usersData.length > 0) {
          console.log('✅ 从数据库加载用户数据:', usersData.length, '个用户');
          console.log('📊 用户配额情况:', usersData.map(u => ({ phone: u.phone, quota: u.quota })));
          setAllUsers(usersData);
          // ✅ 数据库有数据，更新 localStorage 缓存
          localStorage.setItem('kidstyle_accounts', JSON.stringify(usersData));
        } else {
          console.warn('⚠️ 数据库为空，尝试从 localStorage 恢复');
          // 如果数据库为空，从 localStorage 恢复
          const savedAccounts = localStorage.getItem('kidstyle_accounts');
          if (savedAccounts) {
            const accounts = JSON.parse(savedAccounts);
            console.log('📂 从 localStorage 恢复用户:', accounts.length, '个');
            // 确保至少有管理员账号
            if (!accounts.some((u: User) => u.role === 'ADMIN')) {
              accounts.push({
                id: 'admin_root',
                phone: '13336831110',
                password: 'admin',
                quota: 999999,
                role: 'ADMIN'
              });
            }
            setAllUsers(accounts);
          }
        }

        // 设置系统配置
        console.log('📝 检查系统配置...');
        if (configData && Object.keys(configData).length > 0) {
          console.log('✅ 使用数据库配置');
          // 🔧 关键修复：确保配置包含所有必需字段，并验证数组类型，防止崩溃
          const mergedConfig: any = {
            ...INITIAL_CONFIG,
            ...configData,
          };

          // 强制验证所有应该是数组的字段
          const arrayFields: (keyof SystemConfig)[] = [
            'styles', 'ageGroups', 'genders', 'ethnicities',
            'compositions', 'poses', 'scenes', 'productForms', 'productFocus',
            'productBackgrounds'
          ];

          arrayFields.forEach(field => {
            if (!Array.isArray(mergedConfig[field])) {
              console.warn(`⚠️ 配置项 ${field} 不是数组，已重置为默认值。当前值:`, mergedConfig[field]);
              // 如果是对象且不是 null，尝试提取值
              if (mergedConfig[field] && typeof mergedConfig[field] === 'object') {
                try {
                  const values = Object.values(mergedConfig[field]);
                  // 简单检查转换后的结果是否为平面字符串数组
                  mergedConfig[field] = Array.isArray(values[0]) ? values.flat() : values;
                } catch (e) {
                  mergedConfig[field] = INITIAL_CONFIG[field];
                }
              } else {
                mergedConfig[field] = INITIAL_CONFIG[field];
              }
            }
          });

          // 检查并补充缺失的 promptTemplates
          if (!mergedConfig.promptTemplates || typeof mergedConfig.promptTemplates !== 'object') {
            mergedConfig.promptTemplates = INITIAL_CONFIG.promptTemplates;
          }

          setSystemConfig(mergedConfig as SystemConfig);
        } else {
          // 如果数据库没有配置，初始化默认配置
          console.log('⚙️ 初始化默认系统配置到数据库...');
          for (const [key, value] of Object.entries(INITIAL_CONFIG)) {
            console.log(`  - 写入配置: ${key}`);
            await db.updateSystemConfig(key, value);
          }
          console.log('✅ 配置初始化完成');
          setSystemConfig(INITIAL_CONFIG);
        }

        // 设置充值记录
        console.log('💰 设置充值记录...');
        if (requestsData.length > 0) {
          setRechargeRequests(requestsData);
        }
        console.log('✅ 充值记录设置完成');

        // 设置模特库
        console.log('👗 设置模特库...');
        if (modelsData.length > 0) {
          console.log('✅ 从数据库加载模特:', modelsData.length, '个');
          setModels(modelsData);
        }

        // 从 localStorage 恢复用户登录状态
        console.log('👤 检查登录状态...');
        const savedUser = localStorage.getItem('kidstyle_user');
        const savedModels = localStorage.getItem('kidstyle_models');

        console.log('🔍 savedUser:', savedUser ? '存在' : '不存在');

        if (savedUser) {
          console.log('✅ 发现登录用户，验证中...');
          const parsedUser = JSON.parse(savedUser) as User;
          console.log('📝 解析用户:', parsedUser);

          // ✅ 关键修复：先从数据库验证用户是否还存在
          const freshUser = await db.getUserById(parsedUser.id);
          console.log('🔍 freshUser:', freshUser ? '找到' : '未找到');

          if (freshUser) {
            console.log('✅ 用户验证成功，加载用户资源...');
            setUser(freshUser);
            setView(freshUser.role === 'ADMIN' ? AppView.STATS : AppView.GENERATION);

            // ✅ 从 IndexedDB 加载用户的图片资源（本地存储）
            console.log('🖼️ 开始从 IndexedDB 加载用户图片...');
            const userImages = await idbStorage.getAllImages();

            // 转换为 ImageResource 格式
            const imageResources: ImageResource[] = userImages.map(img => ({
              id: img.id,
              url: img.url,
              type: img.type,
              date: img.date,
              tags: img.tags,
              thumbnail: img.thumbnail
            }));

            console.log('✅ 用户资源加载完成:', imageResources.length, '张');
            console.log('📋 用户资源详情:', imageResources);
            setResources(imageResources);
          } else {
            // ⚠️ 用户已从数据库删除，清除缓存
            console.warn('⚠️ 用户已从数据库删除，清除登录缓存');
            localStorage.removeItem('kidstyle_user');
          }
        } else {
          console.log('ℹ️ 未登录用户');
        }

        console.log('📦 恢复模型数据...');
        if (savedModels) setModels(JSON.parse(savedModels));

        console.log('✅ 所有数据加载完成，设置 isLoading = false');
        setIsLoading(false);

      } catch (e) {
        console.error("❌ 数据加载失败:", e);
        console.error('即使失败，也设置 isLoading = false，允许用户继续使用');
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (user) localStorage.setItem('kidstyle_user', JSON.stringify(user));
    // ❌ 不再保存 resources 到 localStorage，图片太大会导致配额超限
    // localStorage.setItem('kidstyle_resources', JSON.stringify(resources));
    localStorage.setItem('kidstyle_recharges', JSON.stringify(rechargeRequests));
    localStorage.setItem('kidstyle_models', JSON.stringify(models));
    localStorage.setItem('kidstyle_accounts', JSON.stringify(allUsers));
    localStorage.setItem('kidstyle_sys_config', JSON.stringify(systemConfig));
  }, [user, rechargeRequests, models, allUsers, systemConfig]);

  const updateQuota = async (newQuota: number) => {
    if (user) {
      // ✅ 同步更新数据库
      const success = await db.updateUserQuota(user.id, newQuota);

      if (success) {
        // 数据库更新成功，同步更新本地 state
        const updated = { ...user, quota: newQuota };
        setUser(updated);
        setAllUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
        console.log('✅ 配额已保存到数据库:', newQuota);
      } else {
        console.error('❌ 配额保存到数据库失败');
        alert('配额更新失败，请重试');
      }
    }
  };

  const handleRemoveResource = async (resourceId: string) => {
    // ✅ 同时从 IndexedDB 删除
    await idbStorage.deleteImage(resourceId);
    setResources(prev => prev.filter(r => r.id !== resourceId));
  };

  const handleToggleFavorite = (resourceId: string) => {
    if (!user) return;

    const isFav = user.favorites?.includes(resourceId);
    let updatedFavorites: string[];

    if (isFav) {
      updatedFavorites = (user.favorites || []).filter(id => id !== resourceId);
    } else {
      updatedFavorites = [...(user.favorites || []), resourceId];
    }

    const updated = { ...user, favorites: updatedFavorites };
    setUser(updated);
    setAllUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
  };

  const handleAuditAction = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    // 先在数据库中更新充值记录状态
    const success = await db.updateRechargeRequest(id, status);

    if (!success) {
      alert('更新失败，请重试');
      return;
    }

    // 更新本地状态
    setRechargeRequests(prev => prev.map(req => {
      if (req.id === id && status === 'APPROVED' && req.status === 'PENDING') {
        const target = allUsers.find(u => u.id === req.userId);
        if (target) {
          const updated = { ...target, quota: target.quota + req.quota };

          // 更新数据库中的用户配额
          db.updateUserQuota(target.id, updated.quota);

          setAllUsers(prevUsers => prevUsers.map(pu => pu.id === target.id ? updated : pu));
          if (user?.id === target.id) setUser(updated);
        }
      }
      return req.id === id ? { ...req, status } : req;
    }));
  };

  const handleConfigUpdate = async (newConfig: SystemConfig) => {
    // 更新本地状态
    setSystemConfig(newConfig);

    // 同步到数据库
    try {
      // 找出哪些配置项被修改了
      const updates: Array<{ key: string; value: any }> = [];

      for (const [key, value] of Object.entries(newConfig)) {
        // 只有当值发生变化时才更新
        if (JSON.stringify(value) !== JSON.stringify(systemConfig[key as keyof SystemConfig])) {
          updates.push({ key, value });
        }
      }

      // 批量更新数据库
      await Promise.all(
        updates.map(({ key, value }) => db.updateSystemConfig(key, value))
      );

      console.log(`✅ 已同步 ${updates.length} 项配置到数据库`);
    } catch (error) {
      console.error('❌ 同步配置到数据库失败:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {user && (
        <Header activeView={view} setView={setView} user={user} onLogout={() => { setUser(null); setView(AppView.AUTH); localStorage.removeItem('kidstyle_user'); }} />
      )}
      <main className="flex-1 overflow-auto bg-[#fafafa]">
        {isLoading ? (
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400 font-bold">正在加载...</p>
            </div>
          </div>
        ) : !user ? (
          <AuthPage allUsers={allUsers} onLogin={u => { setUser(u); setView(u.role === 'ADMIN' ? AppView.STATS : AppView.GENERATION); }} onRegister={async u => {
            // 使用数据库创建用户
            const newUser = await db.createUser(u);
            if (newUser) {
              const updatedUsers = [...allUsers, newUser];
              setAllUsers(updatedUsers);
              // 同时保存到 localStorage 作为缓存
              localStorage.setItem('kidstyle_accounts', JSON.stringify(updatedUsers));
            } else {
              alert('注册失败，请重试');
            }
          }} />
        ) : (
          (() => {
            switch (view) {
              case AppView.GENERATION: return <GenerationPage
                user={user}
                models={models}
                config={systemConfig}
                setView={setView}  // 🔑 传递页面跳转函数
                onOpenRecharge={() => {
                  setUserCenterTab('RECHARGE');  // 设置为充值标签页
                  setView(AppView.USER_CENTER);  // 跳转到用户中心
                }}
                onQuotaUpdate={updateQuota}
                onAddResource={async r => {
                  // ✅ 保存到 IndexedDB（本地存储）
                  const success = await idbStorage.saveImage({
                    id: r.id,
                    url: r.url,
                    thumbnail: r.thumbnail || '',
                    type: r.type,
                    date: r.date,
                    tags: r.tags,
                    createdAt: Date.now(),
                    modelName: r.modelName
                  });

                  if (success) {
                    // IndexedDB 保存成功，更新本地状态
                    setResources(p => [r, ...p]);
                    console.log('✅ 图片保存到本地成功');
                  } else {
                    // IndexedDB 保存失败，提示用户
                    console.error('❌ 图片保存到本地失败');
                    alert('图片保存失败，请重试');
                  }
                }} />;
              case AppView.USER_CENTER: return <UserCenter
                user={user}
                initialTab={userCenterTab}  // 🔑 传递初始标签页
                onLogout={() => {
                  setUser(null);
                  setView(AppView.AUTH);
                  setUserCenterTab('RESOURCES');  // 重置标签页
                }}
                onUpdateUser={async u => {
                  // 更新数据库
                  await db.updateUser(u.id, { password: u.password });
                  // 更新本地状态
                  setUser(u);
                  setAllUsers(p => p.map(x => x.id === u.id ? u : x));
                }} resources={resources} rechargeRequests={rechargeRequests} onAddRechargeRequest={r => setRechargeRequests(p => [r, ...p])} onRemoveResource={handleRemoveResource} onToggleFavorite={handleToggleFavorite} />;
              case AppView.HELP: return <HelpCenter />;
              default: return <AdminPage
                activeTab={view}
                setView={setView}
                allUsers={allUsers}
                onUserUpdate={setAllUsers}  // ✅ 添加用户更新回调
                models={models}
                onModelsUpdate={setModels}
                config={systemConfig}
                onConfigUpdate={handleConfigUpdate}
                rechargeRequests={rechargeRequests}
                onAuditAction={handleAuditAction}
              />;
            }
          })()
        )}
      </main>
      {user?.role === 'USER' && (
        <div className="fixed bottom-6 right-6 z-40">
          <div className="glass-morphism px-6 py-3 rounded-full shadow-2xl flex items-center space-x-3 border-rose-100">
            <span className="text-sm font-bold text-gray-500">配额:</span>
            <span className="text-xl font-black text-rose-500">{user.quota}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
