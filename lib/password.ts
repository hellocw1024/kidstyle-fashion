import bcrypt from 'bcryptjs';

/**
 * 加密难度（salt rounds）
 * 数字越大越安全，但计算时间越长
 * 10 是工业标准推荐值
 */
const SALT_ROUNDS = 10;

/**
 * 对密码进行哈希加密
 * @param plainPassword 明文密码
 * @returns 哈希后的密码
 */
export async function hashPassword(plainPassword: string): Promise<string> {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  const hashedPassword = await bcrypt.hash(plainPassword, salt);
  return hashedPassword;
}

/**
 * 验证明文密码是否匹配哈希密码
 * @param plainPassword 明文密码
 * @param hashedPassword 哈希密码（也可能是明文，用于兼容旧数据）
 * @returns 是否匹配
 */
export async function verifyPassword(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  // 检查是否为 bcrypt 哈希格式
  const isHashed = hashedPassword.startsWith('$2a$') || hashedPassword.startsWith('$2b$');

  if (isHashed) {
    // 使用 bcrypt 验证哈希密码
    const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
    return isMatch;
  } else {
    // 兼容明文密码（旧数据）
    return plainPassword === hashedPassword;
  }
}

/**
 * 检查密码是否为哈希格式（bcrypt 格式）
 * @param password 密码字符串
 * @returns 是否为哈希密码
 */
export function isHashedPassword(password: string): boolean {
  // bcrypt 哈希格式: $2a$ or $2b$ + cost + salt + hash
  return password.startsWith('$2a$') || password.startsWith('$2b$');
}
