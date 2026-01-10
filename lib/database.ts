import { supabase } from './supabaseClient';
import { User, SystemConfig, ImageResource, RechargeRequest } from '../types';
import { hashPassword, isHashedPassword } from './password';

// ==================== 用户相关操作 ====================

/**
 * 获取所有用户
 */
export async function getAllUsers(): Promise<User[]> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('获取用户列表失败:', error);
    return [];
  }

  return data.map(user => ({
    id: user.id,
    phone: user.phone,
    password: user.password,
    quota: user.quota,
    role: user.role as 'USER' | 'ADMIN'
  }));
}

/**
 * 根据手机号查找用户
 */
export async function getUserByPhone(phone: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('phone', phone)
    .single();

  if (error || !data) {
    return null;
  }

  return {
    id: data.id,
    phone: data.phone,
    password: data.password,
    quota: data.quota,
    role: data.role as 'USER' | 'ADMIN'
  };
}

/**
 * 根据ID查找用户
 */
export async function getUserById(id: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return null;
  }

  return {
    id: data.id,
    phone: data.phone,
    password: data.password,
    quota: data.quota,
    role: data.role as 'USER' | 'ADMIN'
  };
}

/**
 * 创建新用户
 */
export async function createUser(user: Omit<User, 'id'>): Promise<User | null> {
  // 生成用户 ID
  const userId = 'user_' + Math.random().toString(36).substr(2, 9);

  // 对密码进行哈希加密（如果还没加密）
  const hashedPassword = await hashPassword(user.password);

  const newUser = {
    id: userId,
    phone: user.phone,
    password: hashedPassword,
    quota: user.quota,
    role: user.role
  };

  const { data, error } = await supabase
    .from('users')
    .insert(newUser)
    .select()
    .single();

  if (error) {
    console.error('创建用户失败:', error);
    return null;
  }

  return {
    id: data.id,
    phone: data.phone,
    password: data.password,
    quota: data.quota,
    role: data.role as 'USER' | 'ADMIN'
  };
}

/**
 * 更新用户配额
 */
export async function updateUserQuota(userId: string, newQuota: number): Promise<boolean> {
  const { error } = await supabase
    .from('users')
    .update({ quota: newQuota })
    .eq('id', userId);

  if (error) {
    console.error('更新用户配额失败:', error);
    return false;
  }

  return true;
}

/**
 * 更新用户信息
 */
export async function updateUser(userId: string, updates: Partial<User>): Promise<boolean> {
  // 如果要更新密码，先进行哈希
  const updateData = { ...updates };
  if (updates.password) {
    updateData.password = await hashPassword(updates.password);
  }

  const { error } = await supabase
    .from('users')
    .update(updateData)
    .eq('id', userId);

  if (error) {
    console.error('更新用户信息失败:', error);
    return false;
  }

  return true;
}

// ==================== 系统配置相关操作 ====================

/**
 * 获取系统配置
 */
export async function getSystemConfig(): Promise<SystemConfig | null> {
  const { data, error } = await supabase
    .from('system_config')
    .select('*');

  if (error || !data) {
    console.error('获取系统配置失败:', error);
    return null;
  }

  // 将键值对转换为配置对象
  const config: any = {};
  data.forEach((item: any) => {
    config[item.key] = item.value;
  });

  return config as SystemConfig;
}

/**
 * 更新系统配置
 */
export async function updateSystemConfig(key: string, value: any): Promise<boolean> {
  const { error } = await supabase
    .from('system_config')
    .upsert({ key, value });

  if (error) {
    console.error('更新系统配置失败:', error);
    return false;
  }

  return true;
}

// ==================== 图片资源相关操作 ====================

/**
 * 获取用户的所有图片
 */
export async function getUserImages(userId: string): Promise<ImageResource[]> {
  const { data, error } = await supabase
    .from('images')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('获取用户图片失败:', error);
    return [];
  }

  return data.map(img => ({
    id: img.id,
    url: img.url,
    type: img.type as 'UPLOAD' | 'GENERATE',
    category: img.category,
    season: img.season,
    date: new Date(img.created_at).toISOString().split('T')[0],
    tags: img.tags || [],
    thumbnail: img.thumbnail || undefined  // ✅ 返回缩略图字段
  }));
}

/**
 * 添加图片记录
 */
export async function addImage(userId: string, image: Omit<ImageResource, 'id' | 'date'>): Promise<ImageResource | null> {
  // 生成图片 ID
  const imageId = 'img_' + Math.random().toString(36).substr(2, 9);

  const newImage = {
    id: imageId,  // ✅ 添加 ID 字段
    user_id: userId,  // ✅ 使用传入的用户 ID
    type: image.type,
    url: image.url,
    category: image.category,
    season: image.season,
    tags: image.tags,
    thumbnail: image.thumbnail || null  // ✅ 添加缩略图字段
  };

  const { data, error } = await supabase
    .from('images')
    .insert(newImage)
    .select()
    .single();

  if (error) {
    console.error('添加图片记录失败:', error);
    return null;
  }

  return {
    id: data.id,
    url: data.url,
    type: data.type as 'UPLOAD' | 'GENERATE',
    category: data.category,
    season: data.season,
    date: new Date(data.created_at).toISOString().split('T')[0],
    tags: data.tags || [],
    thumbnail: data.thumbnail || undefined  // ✅ 返回缩略图字段
  };
}

/**
 * 删除图片记录
 */
export async function deleteImage(imageId: string): Promise<boolean> {
  const { error } = await supabase
    .from('images')
    .delete()
    .eq('id', imageId);

  if (error) {
    console.error('删除图片记录失败:', error);
    return false;
  }

  return true;
}

// ==================== 充值记录相关操作 ====================

/**
 * 获取所有充值记录
 */
export async function getAllRechargeRequests(): Promise<RechargeRequest[]> {
  const { data, error } = await supabase
    .from('recharge_requests')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('获取充值记录失败:', error);
    return [];
  }

  return data.map(req => ({
    id: req.id,
    userId: req.user_id,
    amount: parseFloat(req.amount),
    quota: req.quota,
    screenshot: req.screenshot,
    status: req.status as 'PENDING' | 'APPROVED' | 'REJECTED',
    date: new Date(req.created_at).toISOString().split('T')[0],
    remark: req.remark
  }));
}

/**
 * 获取用户的充值记录
 */
export async function getUserRechargeRequests(userId: string): Promise<RechargeRequest[]> {
  const { data, error } = await supabase
    .from('recharge_requests')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('获取用户充值记录失败:', error);
    return [];
  }

  return data.map(req => ({
    id: req.id,
    userId: req.user_id,
    amount: parseFloat(req.amount),
    quota: req.quota,
    screenshot: req.screenshot,
    status: req.status as 'PENDING' | 'APPROVED' | 'REJECTED',
    date: new Date(req.created_at).toISOString().split('T')[0],
    remark: req.remark
  }));
}

/**
 * 创建充值请求
 */
export async function createRechargeRequest(request: Omit<RechargeRequest, 'id' | 'date'>): Promise<RechargeRequest | null> {
  const newRequest = {
    user_id: request.userId,
    amount: request.amount,
    quota: request.quota,
    screenshot: request.screenshot,
    status: request.status
  };

  const { data, error } = await supabase
    .from('recharge_requests')
    .insert(newRequest)
    .select()
    .single();

  if (error) {
    console.error('创建充值请求失败:', error);
    return null;
  }

  return {
    id: data.id,
    userId: data.user_id,
    amount: parseFloat(data.amount),
    quota: data.quota,
    screenshot: data.screenshot,
    status: data.status as 'PENDING' | 'APPROVED' | 'REJECTED',
    date: new Date(data.created_at).toISOString().split('T')[0]
  };
}

/**
 * 更新充值请求状态
 */
export async function updateRechargeRequest(
  requestId: string,
  status: 'APPROVED' | 'REJECTED',
  remark?: string
): Promise<boolean> {
  const { error } = await supabase
    .from('recharge_requests')
    .update({ status, remark })
    .eq('id', requestId);

  if (error) {
    console.error('更新充值请求失败:', error);
    return false;
  }

  return true;
}
