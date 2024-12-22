import * as XLSX from 'xlsx';
import dayjs from 'dayjs';
import type { QuotaDetail, DailyQuota } from '../types/types';

export const exportToExcel = (
  email: string,
  quotaDetails: QuotaDetail[],
  dailyQuota: DailyQuota[]
) => {
  const detailsData = quotaDetails.map(item => ({
    时间: dayjs(item.time).format('YYYY-MM-DD HH:mm:ss'),
    配额消耗: item.quota_cost,
    配额类型: item.quota_type,
    描述: item.description,
    邮箱: item.email
  }));

  const dailyData = dailyQuota.map(item => ({
    日期: dayjs(item.date).format('YYYY-MM-DD'),
    邮箱: item.email,
    每日使用量: item.daily_usage
  }));

  const detailsWorksheet = XLSX.utils.json_to_sheet(detailsData);
  const dailyWorksheet = XLSX.utils.json_to_sheet(dailyData);

  const detailsCols = [
    { wch: 20 },
    { wch: 12 },
    { wch: 15 },
    { wch: 50 },
    { wch: 30 },
  ];

  const dailyCols = [
    { wch: 15 },
    { wch: 30 },
    { wch: 12 },
  ];

  detailsWorksheet['!cols'] = detailsCols;
  dailyWorksheet['!cols'] = dailyCols;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, detailsWorksheet, "配额明细");
  XLSX.utils.book_append_sheet(workbook, dailyWorksheet, "每日统计");

  XLSX.writeFile(workbook, `配额查询结果_${email}_${dayjs().format('YYYY-MM-DD')}.xlsx`);
}; 