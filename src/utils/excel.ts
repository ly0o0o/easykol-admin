import * as XLSX from 'xlsx';
import dayjs from 'dayjs';

// 类型定义
export interface QuotaDetail {
  time: string;
  quota_cost: number;
  quota_type: string;
  description: string;
  email: string;
  userId: string;
}

export interface DailyQuota {
  date: string;
  userId: string;
  email: string;
  daily_usage: number;
}

// Excel列宽配置
const detailsCols = [
  { wch: 20 },  // 时间
  { wch: 12 },  // 配额消耗
  { wch: 15 },  // 配额类型
  { wch: 50 },  // 描述
  { wch: 30 },  // 邮箱
];

const dailyCols = [
  { wch: 15 },  // 日期
  { wch: 30 },  // 邮箱
  { wch: 12 },  // 每日使用量
];

// 导出Excel功能
export const exportQuotaToExcel = (email: string, quotaDetails: QuotaDetail[], dailyQuota: DailyQuota[]) => {
  // 处理配额明细数据
  const detailsData = quotaDetails.map(item => ({
    时间: dayjs(item.time).format('YYYY-MM-DD HH:mm:ss'),
    次数消耗: item.quota_cost/10,
    配额类型: item.quota_type,
    描述: item.description,
    邮箱: item.email
  }));

  // 处理每日统计数据
  const dailyData = dailyQuota.map(item => ({
    日期: dayjs(item.date).format('YYYY-MM-DD'),
    邮箱: item.email,
    每日使用量: item.daily_usage/10
  }));
  
  // 创建工作表并设置列宽
  const detailsWorksheet = XLSX.utils.json_to_sheet(detailsData);
  const dailyWorksheet = XLSX.utils.json_to_sheet(dailyData);
  
  // 设置列宽
  detailsWorksheet['!cols'] = detailsCols;
  dailyWorksheet['!cols'] = dailyCols;
  
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, detailsWorksheet, "配额明细");
  XLSX.utils.book_append_sheet(workbook, dailyWorksheet, "每日统计");
  
  XLSX.writeFile(workbook, `配额查询结果_${email}_${dayjs().format('YYYY-MM-DD')}.xlsx`);
}; 