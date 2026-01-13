
import React, { useState, useRef, useEffect } from 'react';
import { User, ImageResource, RechargeRequest } from '../types.ts';
// Fixed: Changed ShieldLock to ShieldCheck as ShieldLock is not a valid export from lucide-react. Also removed unused Share2.
import { Heart, Package, Search, Filter, Trash2, Download, Plus, ArrowUpCircle, Upload, X, Check, Maximize2, Settings, ShieldCheck, Lock, Eye, EyeOff, Loader2, FolderOpen, Sparkles } from 'lucide-react';
import { RECHARGE_OPTIONS } from '../constants.tsx';
import { uploadImage } from '../lib/storage.ts';
import * as db from '../lib/database';
import { verifyPassword } from '../lib/password';
import * as idbStorage from '../lib/indexedDBStorage';

interface Props {
  user: User;
  onLogout: () => void;
  onUpdateUser: (u: User) => void;
  resources: ImageResource[];
  rechargeRequests: RechargeRequest[];
  onAddRechargeRequest: (req: RechargeRequest) => void;
  onRemoveResource: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onRemake: (resource: ImageResource) => void; // 🔥 新增 Remake 回调
  initialTab?: 'RESOURCES' | 'RECHARGE' | 'HISTORY' | 'SETTINGS';  // 初始标签页
}

const UserCenter: React.FC<Props> = ({ user, onLogout, onUpdateUser, resources, rechargeRequests, onAddRechargeRequest, onRemoveResource, onToggleFavorite, onRemake, initialTab = 'RESOURCES' }) => {
  const [activeTab, setActiveTab] = useState<'RESOURCES' | 'RECHARGE' | 'HISTORY' | 'SETTINGS'>(initialTab);
  const [subTab, setSubTab] = useState<'CLOTHES' | 'IMAGES' | 'FAVS'>('IMAGES');
  const [showRecharge, setShowRecharge] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<typeof RECHARGE_OPTIONS[0] | null>(null);
  const [rechargeScreenshot, setRechargeScreenshot] = useState<string | null>(null);
  const [previewImg, setPreviewImg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 筛选和搜索状态
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    quality: '',
    dateFrom: '',
    dateTo: ''
  });

  // 批量选择状态
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // ✅ 懒加载状态
  const [displayCount, setDisplayCount] = useState(20); // 初始显示 20 张
  const [isLoadingMore, setIsLoadingMore] = useState(false);



  // ✅ 导出状态
  const [isExporting, setIsExporting] = useState(false);

  // Password change state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [passError, setPassError] = useState('');

  // Handle ESC key to close preview
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPreviewImg(null);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  // 搜索和筛选逻辑
  const filteredAndSearchedResources = resources.filter(res => {
    // 子标签页筛选
    if (subTab === 'CLOTHES' && res.type !== 'UPLOAD') return false;
    if (subTab === 'IMAGES' && res.type !== 'GENERATE') return false;
    if (subTab === 'FAVS' && !user.favorites?.includes(res.id)) return false;

    // 搜索关键词筛选
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchTags = res.tags.some(t => t.toLowerCase().includes(query));
      const matchDate = res.date.includes(query);
      if (!matchTags && !matchDate) return false;
    }

    // 高级筛选
    if (filters.quality && !res.tags.includes(filters.quality)) return false;
    if (filters.dateFrom && res.date < filters.dateFrom) return false;
    if (filters.dateTo && res.date > filters.dateTo) return false;

    return true;
  });

  // 调试日志
  console.log('📊 个人中心数据状态:');
  console.log('  - 总资源数:', resources.length);
  console.log('  - 当前标签:', subTab);
  console.log('  - 筛选后数量:', filteredAndSearchedResources.length);
  console.log('  - 资源列表:', resources.map(r => ({ type: r.type, id: r.id })));

  // 批量选择功能
  const toggleSelection = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredAndSearchedResources.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredAndSearchedResources.map(r => r.id));
    }
  };

  // ✅ 懒加载更多函数
  const loadMore = () => {
    if (isLoadingMore) return;
    const hasMore = displayCount < filteredAndSearchedResources.length;
    if (!hasMore) return;

    setIsLoadingMore(true);
    // 模拟加载延迟
    setTimeout(() => {
      setDisplayCount(prev => Math.min(prev + 10, filteredAndSearchedResources.length));
      setIsLoadingMore(false);
    }, 300);
  };

  // 批量下载
  const handleBatchDownload = () => {
    selectedIds.forEach(id => {
      const resource = resources.find(r => r.id === id);
      if (resource) {
        setTimeout(() => {
          handleDownload(resource.url, `小红衣_${resource.date}.png`);
        }, selectedIds.indexOf(id) * 500); // 间隔下载避免浏览器阻止
      }
    });
    setSelectedIds([]);
    setSelectionMode(false);
  };

  // 批量删除
  const handleBatchDelete = () => {
    if (confirm(`确定要删除选中的 ${selectedIds.length} 张图片吗？删除后无法恢复！`)) {
      selectedIds.forEach(id => onRemoveResource(id));
      setSelectedIds([]);
      setSelectionMode(false);
    }
  };

  // ✅ 导出到本地文件夹
  const handleExportToFolder = async () => {
    try {
      setIsExporting(true);

      // 检查浏览器是否支持 File System Access API
      if (!('showDirectoryPicker' in window)) {
        alert('您的浏览器不支持文件夹选择功能。\n请使用 Chrome、Edge 等现代浏览器。');
        return;
      }

      // 请求用户选择文件夹
      const directoryHandle = await (window as any).showDirectoryPicker({
        mode: 'readwrite',
        startIn: 'documents'
      });

      // 导出所有图片
      let exportedCount = 0;
      for (const resource of resources) {
        try {
          // 将 Base64 转换为 Blob
          const response = await fetch(resource.url);
          const blob = await response.blob();

          // 创建文件名
          const filename = `小红衣_${resource.date}_${resource.id}.png`;

          // 在文件夹中创建文件
          const fileHandle = await directoryHandle.getFileHandle(filename, { create: true });
          const writable = await fileHandle.createWritable();

          // 写入文件内容
          await writable.write(blob);
          await writable.close();

          exportedCount++;
        } catch (error) {
          console.error('导出图片失败:', resource.id, error);
        }
      }

      alert(`✅ 导出成功！\n已将 ${exportedCount} 张图片导出到您选择的文件夹。`);
      console.log('✅ 导出完成，共', exportedCount, '张');
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('用户取消了文件夹选择');
      } else {
        console.error('导出失败:', error);
        alert('导出失败，请重试。');
      }
    } finally {
      setIsExporting(false);
    }
  };

  // 重置筛选
  const resetFilters = () => {
    setFilters({
      quality: '',
      dateFrom: '',
      dateTo: ''
    });
    setSearchQuery('');
  };

  // 下载功能
  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
  };

  // 删除功能
  const handleDelete = (id: string) => {
    if (confirm('确定要删除这张图片吗？删除后无法恢复！')) {
      onRemoveResource(id);
    }
  };

  // 收藏功能
  const isFavorited = (id: string) => {
    return user.favorites?.includes(id) || false;
  };

  const handleScreenshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 显示本地预览
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const tempBase64 = ev.target?.result as string;
        setRechargeScreenshot(tempBase64);

        // 上传到 Supabase Storage
        const publicUrl = await uploadImage(file, user.id, 'screenshots');
        if (publicUrl) {
          setRechargeScreenshot(publicUrl);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const submitRecharge = async () => {
    if (!selectedAmount || !rechargeScreenshot) {
      alert("请选择金额并上传支付凭证截图");
      return;
    }

    const newReq: Omit<RechargeRequest, 'id' | 'date'> = {
      userId: user.id,
      amount: selectedAmount.amount,
      quota: selectedAmount.quota,
      screenshot: rechargeScreenshot,
      status: 'PENDING'
    };

    // 保存到数据库
    const savedReq = await db.createRechargeRequest(newReq);

    if (savedReq) {
      // 更新本地状态
      onAddRechargeRequest(savedReq);
      setShowRecharge(false);
      setRechargeScreenshot(null);
      setSelectedAmount(null);
      alert("充值申请已提交，请等待管理员审核。");
    } else {
      alert("提交失败，请重试");
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');

    // 使用 bcrypt 验证旧密码
    const isOldPasswordValid = await verifyPassword(oldPassword, user.password);
    if (!isOldPasswordValid) {
      setPassError('当前密码输入不正确');
      return;
    }

    if (newPassword.length < 6) {
      setPassError('新密码长度不能少于6位');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassError('两次输入的新密码不一致');
      return;
    }

    const updatedUser = { ...user, password: newPassword };
    onUpdateUser(updatedUser);
    alert('密码修改成功！请重新登录。');
    onLogout();
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Fullscreen Preview Modal */}
      {previewImg && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-in fade-in duration-200 cursor-zoom-out"
          onClick={() => setPreviewImg(null)}
        >
          <button
            className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-10"
            onClick={() => setPreviewImg(null)}
          >
            <X size={28} />
          </button>
          <img
            src={previewImg}
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-300"
            alt="Enlarged Preview"
          />
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-8">

        {/* Left Sidebar: Profile Summary */}
        <aside className="w-full md:w-72 space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border text-center">
            <div className="w-24 h-24 mx-auto mb-4 bg-rose-100 rounded-full flex items-center justify-center border-4 border-rose-50">
              <span className="text-3xl font-black text-rose-400">{user.phone?.charAt(0) || 'U'}</span>
            </div>
            <h2 className="text-xl font-bold text-gray-800 break-all">{user.phone}</h2>
            <p className="text-xs text-gray-400 font-bold tracking-widest uppercase mt-1">普通会员</p>

            <div className="mt-6 p-4 bg-rose-50 rounded-2xl text-left border border-rose-100">
              <p className="text-xs text-rose-400 font-bold mb-1 uppercase">当前配额</p>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-black text-rose-500">{user.quota}</span>
                <button
                  onClick={() => setShowRecharge(true)}
                  className="text-xs bg-rose-500 text-white px-3 py-1.5 rounded-full font-bold shadow-lg shadow-rose-200"
                >
                  去充值
                </button>
              </div>
            </div>
          </div>

          <nav className="space-y-2">
            {[
              { id: 'RESOURCES', label: '我的资源', icon: <Package size={18} /> },
              { id: 'HISTORY', label: '配额明细', icon: <ArrowUpCircle size={18} /> },
              { id: 'RECHARGE', label: '充值记录', icon: <Plus size={18} /> },
              { id: 'SETTINGS', label: '账号设置', icon: <Settings size={18} /> },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === item.id ? 'bg-gray-800 text-white' : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <button onClick={onLogout} className="w-full py-3 text-sm font-bold text-rose-500 hover:bg-rose-50 rounded-xl transition-all border border-transparent hover:border-rose-100">退出登录</button>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 bg-white rounded-3xl shadow-sm border p-8">
          {activeTab === 'RESOURCES' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex bg-gray-100 p-1 rounded-xl">
                  <button
                    onClick={() => setSubTab('IMAGES')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${subTab === 'IMAGES' ? 'bg-white shadow-sm' : 'text-gray-400'}`}
                  >
                    生成图片
                  </button>
                  <button
                    onClick={() => setSubTab('CLOTHES')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${subTab === 'CLOTHES' ? 'bg-white shadow-sm' : 'text-gray-400'}`}
                  >
                    上传服装
                  </button>
                  <button
                    onClick={() => setSubTab('FAVS')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${subTab === 'FAVS' ? 'bg-white shadow-sm' : 'text-gray-400'}`}
                  >
                    收藏夹
                  </button>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text"
                      placeholder="搜索品类/标签/日期..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="pl-9 pr-4 py-2 bg-gray-50 border rounded-xl text-sm outline-none w-48 focus:w-64 transition-all"
                    />
                  </div>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`p-2 border rounded-xl transition-all ${showFilters || Object.values(filters).some(v => v) ? 'bg-rose-50 border-rose-400 text-rose-500' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                  >
                    <Filter size={18} />
                  </button>
                  <button
                    onClick={() => setSelectionMode(!selectionMode)}
                    className={`p-2 border rounded-xl transition-all ${selectionMode ? 'bg-blue-50 border-blue-400 text-blue-500' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                    title="批量选择"
                  >
                    <Check size={18} />
                  </button>
                  <button
                    onClick={handleExportToFolder}
                    disabled={isExporting || resources.length === 0}
                    className={`flex items-center space-x-2 px-4 py-2 border rounded-xl transition-all ${isExporting ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-green-50 border-green-400 text-green-600 hover:bg-green-100'}`}
                    title="导出到本地文件夹"
                  >
                    <FolderOpen size={18} />
                    <span className="text-sm font-bold">{isExporting ? '导出中...' : '导出到文件夹'}</span>
                  </button>
                </div>
              </div>

              {/* 高级筛选器 */}
              {showFilters && (
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-bold text-gray-700">高级筛选</h4>
                    <button
                      onClick={resetFilters}
                      className="text-xs text-rose-500 hover:text-rose-600 font-bold"
                    >
                      重置筛选
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <select
                      value={filters.quality}
                      onChange={e => setFilters({ ...filters, quality: e.target.value })}
                      className="px-3 py-2 bg-white border rounded-lg text-sm outline-none focus:border-rose-400"
                    >
                      <option value="">所有质量</option>
                      <option value="1K">1K</option>
                      <option value="2K">2K</option>
                      <option value="4K">4K</option>
                    </select>
                    <input
                      type="date"
                      value={filters.dateFrom}
                      onChange={e => setFilters({ ...filters, dateFrom: e.target.value })}
                      className="px-3 py-2 bg-white border rounded-lg text-sm outline-none focus:border-rose-400"
                      placeholder="开始日期"
                    />
                    <input
                      type="date"
                      value={filters.dateTo}
                      onChange={e => setFilters({ ...filters, dateTo: e.target.value })}
                      className="px-3 py-2 bg-white border rounded-lg text-sm outline-none focus:border-rose-400"
                      placeholder="结束日期"
                    />
                  </div>
                </div>
              )}

              {/* 批量操作工具栏 */}
              {selectionMode && selectedIds.length > 0 && (
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-2xl border border-blue-200 animate-in slide-in-from-top-2">
                  <span className="font-bold text-blue-700">已选择 <span className="text-xl">{selectedIds.length}</span> 张图片</span>
                  <div className="flex space-x-2">
                    <button
                      onClick={toggleSelectAll}
                      className="px-3 py-1.5 bg-white border border-blue-300 text-blue-600 rounded-lg text-sm font-bold hover:bg-blue-50"
                    >
                      {selectedIds.length === filteredAndSearchedResources.length ? '取消全选' : '全选'}
                    </button>
                    <button
                      onClick={handleBatchDownload}
                      className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-sm font-bold hover:bg-blue-600 flex items-center space-x-1"
                    >
                      <Download size={14} />
                      <span>批量下载</span>
                    </button>
                    <button
                      onClick={handleBatchDelete}
                      className="px-3 py-1.5 bg-rose-500 text-white rounded-lg text-sm font-bold hover:bg-rose-600 flex items-center space-x-1"
                    >
                      <Trash2 size={14} />
                      <span>批量删除</span>
                    </button>
                    <button
                      onClick={() => { setSelectedIds([]); setSelectionMode(false); }}
                      className="px-3 py-1.5 bg-gray-200 text-gray-600 rounded-lg text-sm font-bold hover:bg-gray-300"
                    >
                      取消
                    </button>
                  </div>
                </div>
              )}

              {filteredAndSearchedResources.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed">
                  <Package className="mx-auto text-gray-300 mb-4" size={48} />
                  <p className="text-gray-400">暂无资源，去 AI 生成试试吧</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAndSearchedResources.slice(0, displayCount).map(res => (
                      <div key={res.id} className={`group relative bg-gray-50 rounded-2xl overflow-hidden transition-all ${selectionMode ? 'border-2' : 'border border-gray-100'} ${selectionMode && selectedIds.includes(res.id) ? 'border-blue-500 shadow-lg' : ''}`}>
                        {/* 批量选择复选框 */}
                        {selectionMode && (
                          <div className="absolute top-3 left-3 z-10">
                            <button
                              onClick={(e) => { e.stopPropagation(); toggleSelection(res.id); }}
                              className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${selectedIds.includes(res.id)
                                ? 'bg-blue-500 border-blue-500'
                                : 'bg-white/90 backdrop-blur border-gray-300 hover:border-blue-400'
                                }`}
                            >
                              {selectedIds.includes(res.id) && <Check size={16} className="text-white mx-auto" />}
                            </button>
                          </div>
                        )}

                        <div
                          className="aspect-[3/4] overflow-hidden cursor-zoom-in"
                          onClick={() => setPreviewImg(res.url)}  // ✅ 点击查看原图
                        >
                          {/* ✅ 优先使用缩略图，回退到原图 */}
                          <img
                            src={res.thumbnail || res.url}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            alt="Resource"
                            loading="lazy"  // ✅ 原生懒加载
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 flex items-center justify-center transition-all">
                            <Maximize2 className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={24} />
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] text-gray-400 font-medium">{res.date}</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {res.tags.map(t => <span key={t} className="text-[10px] bg-white border border-gray-100 px-1.5 py-0.5 rounded text-gray-500">{t}</span>)}
                          </div>
                        </div>
                        <div className="absolute top-2 right-2 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => onToggleFavorite(res.id)}
                            className={`p-2 bg-white/90 backdrop-blur rounded-full shadow-lg hover:bg-rose-500 hover:text-white transition-all ${isFavorited(res.id) ? 'text-rose-500' : 'text-gray-400'}`}
                          >
                            <Heart size={16} fill={isFavorited(res.id) ? 'currentColor' : 'none'} />
                          </button>
                          <button
                            onClick={() => handleDownload(res.url, `小红衣_${res.date}.png`)}
                            className="p-2 bg-white/90 backdrop-blur rounded-full text-blue-500 shadow-lg hover:bg-blue-500 hover:text-white transition-all"
                          >
                            <Download size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(res.id)}
                            className="p-2 bg-white/90 backdrop-blur rounded-full text-gray-700 shadow-lg hover:bg-rose-600 hover:text-white transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                          {/* 🔥 Make Similar Button */}
                          {res.type === 'GENERATE' && (
                            <button
                              onClick={(e) => { e.stopPropagation(); onRemake(res); }}
                              className="p-2 bg-white/90 backdrop-blur rounded-full text-purple-500 shadow-lg hover:bg-purple-500 hover:text-white transition-all group/btn"
                              title="生成同款 (Remake)"
                            >
                              <Sparkles size={16} fill="currentColor" className="opacity-0 group-hover/btn:opacity-100 transition-opacity absolute inset-0 m-auto pointer-events-none" />
                              <Sparkles size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* ✅ 懒加载：加载更多按钮 */}
                  {displayCount < filteredAndSearchedResources.length && (
                    <div className="text-center mt-8">
                      <button
                        onClick={loadMore}
                        disabled={isLoadingMore}
                        className="px-8 py-3 bg-white border-2 border-rose-500 text-rose-500 rounded-2xl font-bold hover:bg-rose-500 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoadingMore ? (
                          <span className="flex items-center space-x-2">
                            <Loader2 size={16} className="animate-spin" />
                            <span>加载中...</span>
                          </span>
                        ) : (
                          `加载更多 (${filteredAndSearchedResources.length - displayCount} 张)`
                        )}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {activeTab === 'HISTORY' && (
            <div className="space-y-8 animate-fade-in-up">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-gray-800">配额消耗中心</h3>
                <div className="flex items-center space-x-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <div className="w-2 h-2 bg-rose-400 rounded-full"></div>
                  <span>最近 7 天生成频次</span>
                </div>
              </div>

              {/* CSS-based Consumption Chart */}
              <div className="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100">
                <div className="flex items-end justify-between h-40 gap-4 px-2">
                  {(() => {
                    const last7Days = [...Array(7)].map((_, i) => {
                      const d = new Date();
                      d.setDate(d.getDate() - (6 - i));
                      return d.toISOString().split('T')[0];
                    });

                    const stats = last7Days.map(date => ({
                      date: date.split('-').slice(1).join('/'),
                      count: resources.filter(r => r.type === 'GENERATE' && r.date === date).length
                    }));

                    const maxCount = Math.max(...stats.map(s => s.count), 1);

                    return stats.map((stat, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center group">
                        <div className="w-full relative flex flex-col items-center justify-end h-32">
                          <div
                            className="w-full max-w-[40px] bg-rose-400 rounded-t-xl hover:bg-rose-500 transition-all cursor-pointer relative group-hover:shadow-[0_0_20px_rgba(244,63,94,0.3)]"
                            style={{ height: `${(stat.count / maxCount) * 100}%`, minHeight: stat.count > 0 ? '4px' : '0' }}
                          >
                            {stat.count > 0 && (
                              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                消耗 {stat.count} 次
                              </div>
                            )}
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-gray-400 mt-4 group-hover:text-gray-600 transition-colors uppercase tracking-tighter">{stat.date}</span>
                      </div>
                    ));
                  })()}
                </div>
              </div>

              <div className="space-y-6 pt-4">
                <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest ml-1">详细消耗清单</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b bg-gray-50/50">
                      <tr>
                        <th className="px-6 py-4 font-black text-gray-400 uppercase tracking-widest text-[10px]">时间</th>
                        <th className="px-6 py-4 font-black text-gray-400 uppercase tracking-widest text-[10px]">内容</th>
                        <th className="px-6 py-4 font-black text-gray-400 uppercase tracking-widest text-[10px]">配额</th>
                        <th className="px-6 py-4 font-black text-gray-400 uppercase tracking-widest text-[10px]">状态</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {resources.filter(r => r.type === 'GENERATE').map(res => (
                        <tr key={res.id} className="hover:bg-gray-50/50">
                          <td className="px-4 py-4 text-gray-500">{res.date}</td>
                          <td className="px-4 py-4 font-medium text-gray-700">AI摄影生成 ({res.tags.includes('4K') ? '4K' : res.tags.includes('2K') ? '2K' : '1K'})</td>
                          <td className="px-4 py-4 font-bold text-rose-500">- {res.tags.includes('4K') ? 5 : res.tags.includes('2K') ? 2 : 1}</td>
                          <td className="px-4 py-4"><span className="px-2 py-0.5 bg-green-50 text-green-600 text-xs rounded-full font-bold">已扣除</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* 空状态提示 */}
                  {resources.filter(r => r.type === 'GENERATE').length === 0 && (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-4xl">📊</span>
                      </div>
                      <p className="text-gray-400 font-bold mb-2">暂无配额消耗记录</p>
                      <p className="text-gray-300 text-sm">
                        {resources.length === 0
                          ? '您还没有生成过任何图片，去生成页面创建您的第一张作品吧！'
                          : '您没有通过AI生成过图片，只有上传的图片。'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'RECHARGE' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">充值记录</h3>
                <button onClick={() => setShowRecharge(true)} className="px-4 py-2 bg-rose-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-rose-200">立即充值</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 font-bold text-gray-600">日期</th>
                      <th className="px-4 py-3 font-bold text-gray-600">金额</th>
                      <th className="px-4 py-3 font-bold text-gray-600">配额</th>
                      <th className="px-4 py-3 font-bold text-gray-600">审核状态</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {rechargeRequests.map(req => (
                      <tr key={req.id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-4 text-gray-500">{req.date}</td>
                        <td className="px-4 py-4 font-bold text-gray-800">¥{req.amount.toFixed(2)}</td>
                        <td className="px-4 py-4 font-bold text-rose-500">+{req.quota}</td>
                        <td className="px-4 py-4">
                          <span className={`px-2 py-0.5 text-xs rounded-full font-bold ${req.status === 'APPROVED' ? 'bg-green-50 text-green-600' :
                            req.status === 'PENDING' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                            }`}>
                            {req.status === 'APPROVED' ? '已通过' : req.status === 'PENDING' ? '审核中' : '已拒绝'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'SETTINGS' && (
            <div className="max-w-md mx-auto py-6">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-rose-50 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                  {/* Fixed: Used ShieldCheck instead of ShieldLock */}
                  <ShieldCheck className="text-rose-500" size={32} />
                </div>
                <h3 className="text-2xl font-black text-gray-800">账号安全设置</h3>
                <p className="text-sm text-gray-400 mt-2">定期更改密码可以保障您的账户与配额安全</p>
              </div>

              <form onSubmit={handlePasswordChange} className="space-y-6">
                {passError && (
                  <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-500 text-xs font-bold animate-in fade-in slide-in-from-top-1">
                    {passError}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1">当前密码</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type={showOldPass ? "text" : "password"}
                      placeholder="输入旧密码"
                      className="w-full pl-12 pr-12 py-4 bg-gray-50 border-2 border-transparent focus:border-rose-400 rounded-2xl outline-none transition-all font-medium"
                      value={oldPassword}
                      onChange={e => setOldPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPass(!showOldPass)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showOldPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1">新密码</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type={showNewPass ? "text" : "password"}
                      placeholder="设置新密码 (不少于6位)"
                      className="w-full pl-12 pr-12 py-4 bg-gray-50 border-2 border-transparent focus:border-rose-400 rounded-2xl outline-none transition-all font-medium"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1">确认新密码</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="password"
                      placeholder="再次输入新密码"
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-rose-400 rounded-2xl outline-none transition-all font-medium"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-rose-500 text-white rounded-2xl font-black text-lg shadow-xl shadow-rose-200 hover:scale-[1.02] transition-transform active:scale-95 flex items-center justify-center space-x-2"
                >
                  <span>确认修改密码</span>
                  <Check size={20} />
                </button>
              </form>
            </div>
          )}
        </main>
      </div>

      {/* Recharge Modal */}
      {showRecharge && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowRecharge(false)}></div>
          <div className="relative bg-white rounded-[2.5rem] w-full max-w-xl p-8 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black text-gray-800">充值中心</h3>
              <button onClick={() => setShowRecharge(false)} className="p-2 hover:bg-gray-100 rounded-full"><X size={24} /></button>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-8">
              {RECHARGE_OPTIONS.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedAmount(opt)}
                  className={`p-4 rounded-2xl border-2 transition-all text-center relative ${selectedAmount === opt ? 'border-rose-500 bg-rose-50' : 'border-gray-100 hover:border-rose-200'
                    }`}
                >
                  <p className="text-lg font-black text-gray-800">¥{opt.amount}</p>
                  <p className="text-xs font-bold text-rose-400">{opt.quota} 点</p>
                  {opt.bonus && <span className="absolute -top-2 -right-1 bg-amber-400 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full">{opt.bonus}</span>}
                </button>
              ))}
            </div>

            <div className="bg-gray-50 p-6 rounded-3xl border border-dashed border-gray-200 mb-8 flex flex-col items-center">
              <p className="text-xs font-black text-gray-400 uppercase mb-4 tracking-widest">扫码支付后上传截图</p>
              <div className="w-32 h-32 bg-white p-1 rounded-2xl mb-4 shadow-sm border">
                <img src="https://picsum.photos/200/200?random=pay" alt="Pay QR" className="w-full h-full object-cover rounded-xl" />
              </div>
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`w-full py-4 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${rechargeScreenshot ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-rose-400'
                  }`}
              >
                {rechargeScreenshot ? (
                  <div className="flex items-center space-x-2 text-green-600 font-bold">
                    <Check size={20} />
                    <span>已选择截图 (点击更换)</span>
                  </div>
                ) : (
                  <>
                    <Upload size={24} className="text-gray-300 mb-1" />
                    <span className="text-xs font-bold text-gray-400">上传支付凭证截图</span>
                  </>
                )}
              </div>
              <input type="file" ref={fileInputRef} onChange={handleScreenshotUpload} className="hidden" accept="image/*" />
            </div>

            <button
              onClick={submitRecharge}
              className="w-full py-5 bg-rose-500 text-white rounded-2xl font-black text-lg shadow-xl shadow-rose-200 hover:scale-[1.02] transition-transform active:scale-95"
            >
              提交充值申请
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserCenter;
