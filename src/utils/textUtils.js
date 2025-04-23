/**
 * 截断文本，超过指定长度时添加省略号
 * 
 * @param {String} text - 原始文本
 * @param {Number} maxLength - 最大长度
 * @returns {String} 处理后的文本
 */
export const truncateText = (text, maxLength) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  
  return text.slice(0, maxLength) + '...';
};

/**
 * 从长文本中提取摘要
 * 
 * @param {String} text - 原始文本
 * @param {Number} maxLength - 最大长度
 * @returns {String} 提取的摘要
 */
export const extractSummary = (text, maxLength = 100) => {
  if (!text) return '';
  
  // 移除多余空格
  const cleanText = text.replace(/\s+/g, ' ').trim();
  
  // 如果文本长度小于最大长度，直接返回
  if (cleanText.length <= maxLength) return cleanText;
  
  // 尝试在句子结束处截断
  const sentences = cleanText.match(/[^.!?]+[.!?]+/g) || [];
  let summary = '';
  
  for (let sentence of sentences) {
    if ((summary + sentence).length <= maxLength) {
      summary += sentence;
    } else {
      break;
    }
  }
  
  // 如果没有找到完整句子或摘要为空，则按最大长度截断
  if (summary === '') {
    summary = truncateText(cleanText, maxLength);
  }
  
  return summary;
};

/**
 * 格式化数字为易读形式
 * 
 * @param {Number} number - 数字
 * @param {Number} decimals - 小数位数
 * @returns {String} 格式化后的数字
 */
export const formatNumber = (number, decimals = 0) => {
  return number.toLocaleString('zh-CN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

/**
 * 将长数字缩短为K、M、B形式
 * 
 * @param {Number} number - 数字
 * @returns {String} 缩短后的数字表示
 */
export const shortenNumber = (number) => {
  if (number < 1000) return String(number);
  if (number < 1000000) return (number / 1000).toFixed(1) + 'K';
  if (number < 1000000000) return (number / 1000000).toFixed(1) + 'M';
  return (number / 1000000000).toFixed(1) + 'B';
};

/**
 * 验证文本是否为空
 * 
 * @param {String} text - 待验证文本
 * @returns {Boolean} 是否为空
 */
export const isEmptyText = (text) => {
  return !text || text.trim() === '';
};

/**
 * 解析CSV文本为对象数组
 * 
 * @param {String} csvText - CSV格式文本
 * @returns {Array} 解析后的对象数组
 */
export const parseCSV = (csvText) => {
  if (!csvText) return [];
  
  // 分割行
  const lines = csvText.split('\n');
  if (lines.length === 0) return [];
  
  // 提取标题行
  const headers = lines[0].split(',').map(header => header.trim());
  
  // 解析数据行
  const result = [];
  for (let i = 1; i < lines.length; i++) {
    if (isEmptyText(lines[i])) continue;
    
    const data = lines[i].split(',');
    const obj = {};
    
    headers.forEach((header, index) => {
      obj[header] = data[index] ? data[index].trim() : '';
    });
    
    result.push(obj);
  }
  
  return result;
};

/**
 * 从文本中提取标签
 * 
 * @param {String} text - 文本内容
 * @param {String} separator - 标签分隔符
 * @returns {Array} 标签数组
 */
export const extractTags = (text, separator = ',') => {
  if (!text) return [];
  
  return text
    .split(separator)
    .map(tag => tag.trim())
    .filter(tag => tag !== '');
};

/**
 * 将文本转换为URL安全的slug
 * 
 * @param {String} text - 原始文本
 * @returns {String} URL安全的slug
 */
export const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')       // 将空格替换为-
    .replace(/[^\w\-]+/g, '')   // 删除非单词字符
    .replace(/\-\-+/g, '-')     // 替换多个-为单个-
    .replace(/^-+/, '')         // 修剪开头的-
    .replace(/-+$/, '');        // 修剪结尾的-
};
