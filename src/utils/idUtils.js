/**
 * 生成唯一ID
 * 简易版UUID生成函数，用于创建各种项目的唯一标识符
 * 
 * @returns {string} 生成的唯一ID
 */
export const generateUniqueId = () => {
  // 创建一个基于时间戳的ID前缀
  const timestamp = new Date().getTime().toString(36);
  
  // 生成8位随机字符
  const randomPart = Math.random().toString(36).substring(2, 10);
  
  // 合并并返回唯一ID
  return `${timestamp}_${randomPart}`;
};

/**
 * 生成有序ID
 * 基于时间戳和计数器的有序ID，适用于需要按时间排序的项目
 * 
 * @param {string} prefix - ID前缀，用于标识不同类型的项目
 * @returns {string} 生成的有序ID
 */
export const generateOrderedId = (prefix) => {
  // 获取当前时间戳
  const timestamp = new Date().getTime();
  
  // 获取随机数作为后缀，避免同一毫秒内生成的ID冲突
  const randomSuffix = Math.floor(Math.random() * 1000);
  
  // 合并并返回有序ID
  return `${prefix}_${timestamp}_${randomSuffix}`;
};
