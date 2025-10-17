import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export async function exportToCsv(filename, rows) {
  const header = Object.keys(rows[0] || {}).join(',');
  const body = rows.map(r => Object.values(r).map(v => JSON.stringify(v ?? '')).join(',')).join('\n');
  const csv = `${header}\n${body}`;
  const path = `${FileSystem.cacheDirectory}${filename.endsWith('.csv') ? filename : filename + '.csv'}`;
  await FileSystem.writeAsStringAsync(path, csv, { encoding: FileSystem.EncodingType.UTF8 });
  const canShare = await Sharing.isAvailableAsync();
  if (canShare) await Sharing.shareAsync(path, { mimeType: 'text/csv' });
  return path;
}
