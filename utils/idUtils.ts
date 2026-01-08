
export const generateId = () => {
  try {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
  } catch (e) {}
  // 回退方案：適用於非 HTTPS 或舊版環境
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
};
