
import React, { useState, useEffect } from 'react';
import { AppView, User, RechargeRequest, ImageResource, SystemConfig } from './types.ts';
import { MODEL_LIBRARY, ModelEntry, INITIAL_CONFIG } from './constants.tsx';

import UserCenter from './pages/UserCenter.tsx';
import AdminPage from './pages/AdminPage.tsx';
import AuthPage from './pages/AuthPage.tsx';
import HelpCenter from './pages/HelpCenter.tsx';
import Header from './components/Header.tsx';
import { MainLayout } from './components/layout/MainLayout.tsx';
import { HomePage } from './pages/HomePage.tsx';
import * as db from './lib/database';
import * as idbStorage from './lib/indexedDBStorage';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.HOME);
  const [initialMode, setInitialMode] = useState<string | undefined>(undefined);
  const [user, setUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [rechargeRequests, setRechargeRequests] = useState<RechargeRequest[]>([]);
  const [resources, setResources] = useState<ImageResource[]>([]);
  const [models, setModels] = useState<ModelEntry[]>([]);
  const [referenceImages, setReferenceImages] = useState<any[]>([]);  // 参考图库
  const [systemConfig, setSystemConfig] = useState<SystemConfig>(INITIAL_CONFIG);
  const [userCenterTab, setUserCenterTab] = useState<'RESOURCES' | 'RECHARGE'>('RESOURCES');  // 控制用户中心标签页
  const [remakeData, setRemakeData] = useState<import('./types').RemakeData | null>(null); // 🔥 "做同款"数据
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('🔄 开始加载数据...');

        // 从 Supabase 加载数据 (改为分步加载，避免一个失败导致全部失败)

        // 1. 加载用户
        let usersData: any[] = [];
        try {
          usersData = await db.getAllUsers();
        } catch (e) {
          console.error('❌ 加载用户失败:', e);
        }

        // 2. 加载配置
        let configData: any = null;
        try {
          configData = await db.getSystemConfig();
        } catch (e) {
          console.error('❌ 加载配置失败:', e);
        }

        // 3. 加载充值记录
        let requestsData: any[] = [];
        try {
          requestsData = await db.getAllRechargeRequests();
        } catch (e) {
          console.error('❌ 加载充值记录失败:', e);
        }

        // 4. 加载模特
        let modelsData: any[] = [];
        try {
          modelsData = await db.getAllModels();
        } catch (e) {
          console.error('❌ 加载模特失败:', e);
        }

        // 5. 加载参考图
        let referenceImagesData: any[] = [];
        try {
          // 🚨 紧急修复：绕过 db.getAllReferenceImages()，直接在 App.tsx 中查询
          // 这里的逻辑经过 Test Fetch 验证是有效的
          const { supabase } = await import('./lib/supabaseClient');
          console.log('🖼️ App.tsx: 正在直接查询 reference_images...');

          const { data, error } = await supabase
            .from('reference_images')
            .select('*');

          if (error) {
            console.error('❌ App.tsx 直接查询失败:', error);
          } else if (data) {
            console.log('✅ App.tsx 直接查询成功，数量:', data.length);
            // 手动映射数据结构
            referenceImagesData = data.map(r => ({
              id: r.id,
              url: r.url,
              type: r.type,
              tags: r.tags || [],
              name: r.name || undefined,
              uploadedBy: r.uploaded_by,
              uploadedAt: r.uploaded_at,
              status: r.status as 'ACTIVE' | 'INACTIVE'
            }));
            // 按照上传时间倒序排序 (新图在前)
            referenceImagesData.sort((a, b) => {
              const dateA = new Date(a.uploadedAt || 0).getTime();
              const dateB = new Date(b.uploadedAt || 0).getTime();
              return dateB - dateA;
            });
          }
        } catch (e) {
          console.error('❌ 加载参考图失败 (Inline):', e);
        }

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
          if (savedAccounts && savedAccounts !== 'undefined') {
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
            'compositions', 'poses', 'emotions', 'scenes', 'productForms', 'productFocus',
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
          } else {
            // 🔥 深度合并：先展开数据库配置，再用默认配置填充缺失字段
            // 这样可以确保数据库中的undefined不会覆盖默认值
            mergedConfig.promptTemplates = {
              ...mergedConfig.promptTemplates,
              ...INITIAL_CONFIG.promptTemplates,
              // 再次展开数据库配置，保留数据库中已有的非undefined值
              ...(Object.fromEntries(
                Object.entries(mergedConfig.promptTemplates).filter(([_, v]) => v !== undefined)
              ))
            };
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
        } else {
          console.log('ℹ️ 数据库中无模特数据，请在后台管理中导入');
          setModels([]);
        }

        // 设置参考图库
        console.log('🖼️ 设置参考图库...');
        if (referenceImagesData.length > 0) {
          console.log('✅ 从数据库加载参考图:', referenceImagesData.length, '张');
          setReferenceImages(referenceImagesData);
        } else {
          console.log('ℹ️ 数据库中无参考图数据');
          setReferenceImages([]);
        }

        // 从 localStorage 恢复用户登录状态
        console.log('👤 检查登录状态...');
        const savedUser = localStorage.getItem('kidstyle_user');
        const savedModels = localStorage.getItem('kidstyle_models');

        console.log('🔍 savedUser:', savedUser ? '存在' : '不存在');

        if (savedUser && savedUser !== 'undefined') {
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
        if (savedModels && savedModels !== 'undefined') setModels(JSON.parse(savedModels));

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



  // Inside App component...

  return (
    <div className="min-h-screen flex flex-col">
      {/* Remove Header */}
      {/* {user && ( ... )} */}

      {/* Main Content */}
      <div className="flex-1 h-full bg-[#fafafa]">
        {isLoading ? (
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400 font-bold">正在加载...</p>
            </div>
          </div>
        ) : !user ? (
          <AuthPage allUsers={allUsers} onLogin={u => { setUser(u); setView(u.role === 'ADMIN' ? AppView.STATS : AppView.INSPIRATION); }} onRegister={async u => {
            // ... existing register logic ...
            const newUser = await db.createUser(u);
            if (newUser) {
              const updatedUsers = [...allUsers, newUser];
              setAllUsers(updatedUsers);
              localStorage.setItem('kidstyle_accounts', JSON.stringify(updatedUsers));
            } else {
              alert('注册失败，请重试');
            }
          }} />
        ) : (
          <MainLayout
            activeView={view}
            setView={setView}
            user={user}
            onLogout={() => { setUser(null); setView(AppView.AUTH); localStorage.removeItem('kidstyle_user'); }}
          >
            {(() => {
              switch (view) {
                case AppView.HOME:
                case AppView.INSPIRATION:
                  return <HomePage
                    models={MODEL_LIBRARY}
                    user={user}
                    config={systemConfig}
                    setView={setView}
                    onOpenRecharge={() => {
                      setUserCenterTab('RECHARGE');
                      setView(AppView.USER_CENTER);
                    }}
                    remakeData={remakeData}
                    onClearRemakeData={() => setRemakeData(null)}
                    onQuotaUpdate={updateQuota}
                    initialMode={initialMode}
                    resources={resources}
                    onAddResource={async r => {
                      // ... existing save logic ...
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
                        setResources(p => [r, ...p]);
                      } else {
                        alert('图片保存失败，请重试');
                      }
                    }}
                    onNavigate={(view, mode) => {
                      setView(view);
                      if (mode) {
                        setInitialMode(mode);
                      }
                    }}
                  />;
                case AppView.GENERATION:
                  // 将生成页请求重定向到首页（统一工作台）
                  return <HomePage
                    models={MODEL_LIBRARY}
                    user={user}
                    config={systemConfig}
                    setView={setView}
                    onOpenRecharge={() => {
                      setUserCenterTab('RECHARGE');
                      setView(AppView.USER_CENTER);
                    }}
                    remakeData={remakeData}
                    onClearRemakeData={() => setRemakeData(null)}
                    onQuotaUpdate={updateQuota}
                    initialMode={initialMode}
                    resources={resources}
                    onAddResource={async r => {
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
                        setResources(p => [r, ...p]);
                      } else {
                        alert('图片保存失败，请重试');
                      }
                    }}
                  />;
                case AppView.USER_CENTER: return <UserCenter
                  user={user}
                  initialTab={userCenterTab}
                  onLogout={() => {
                    setUser(null);
                    setView(AppView.AUTH);
                    setUserCenterTab('RESOURCES');
                  }}
                  onUpdateUser={async u => {
                    await db.updateUser(u.id, { password: u.password });
                    setUser(u);
                    setAllUsers(p => p.map(x => x.id === u.id ? u : x));
                  }}
                  resources={resources}
                  rechargeRequests={rechargeRequests}
                  onAddRechargeRequest={r => setRechargeRequests(p => [r, ...p])}
                  onRemoveResource={handleRemoveResource}
                  onToggleFavorite={handleToggleFavorite}
                  onRemake={(res) => {
                    setRemakeData({
                      referenceImage: res,
                      newClothing: null,
                      options: { complete: true, scene: false, pose: false }
                    });
                    setView(AppView.HOME); // Or Inspiration if we want
                  }}
                />;
                case AppView.HELP: return <HelpCenter />;
                default: return <AdminPage
                  activeTab={view}
                  setView={setView}
                  allUsers={allUsers}
                  onUserUpdate={setAllUsers}
                  models={models}
                  onModelsUpdate={setModels}
                  referenceImages={referenceImages}
                  onReferenceImagesUpdate={setReferenceImages}
                  config={systemConfig}
                  onConfigUpdate={handleConfigUpdate}
                  rechargeRequests={rechargeRequests}
                  onAuditAction={handleAuditAction}
                />;
              }
            })()}

            {/* Floating Quota Widget inside MainLayout content area or overlaid */}
            {user?.role === 'USER' && (
              <div className="absolute bottom-6 right-6 z-40">
                <div className="glass-morphism px-6 py-3 rounded-full shadow-2xl flex items-center space-x-3 border-rose-100 bg-white/80">
                  <span className="text-sm font-bold text-gray-500">配额:</span>
                  <span className="text-xl font-black text-rose-500">{user.quota}</span>
                </div>
              </div>
            )}
          </MainLayout>
        )}
      </div>
    </div>
  );
};

export default App;
