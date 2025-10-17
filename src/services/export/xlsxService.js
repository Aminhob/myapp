import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import XLSX from 'xlsx';

export async function exportToXlsx(filename, rows) {
  // rows: array of objects
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Warbixin');
  const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
  const path = `${FileSystem.cacheDirectory}${filename.endsWith('.xlsx') ? filename : filename + '.xlsx'}`;
  await FileSystem.writeAsStringAsync(path, wbout, { encoding: FileSystem.EncodingType.Base64 });
  const can = await Sharing.isAvailableAsync();
  if (can) await Sharing.shareAsync(path, { mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  return path;
}
