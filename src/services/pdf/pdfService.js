import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export async function generateInvoicePdf(invoice) {
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>body{font-family: Arial;padding:16px}h1{color:#fe3200}table{width:100%;border-collapse:collapse}td,th{border:1px solid #ddd;padding:8px}tfoot td{font-weight:bold}</style></head><body>
  <h1>eMaamul - Fatuur</h1>
  <p>Macmiil: ${invoice.customer?.name || ''}</p>
  <table><thead><tr><th>Alaabta</th><th>Qiimaha</th><th>Tirada</th><th>Wadarta</th></tr></thead><tbody>
  ${(invoice.items||[]).map(it=>`<tr><td>${it.name}</td><td>${it.price}</td><td>${it.qty}</td><td>${(it.price*it.qty).toFixed(2)}</td></tr>`).join('')}
  </tbody><tfoot><tr><td colspan="3">Wadarta</td><td>${Number(invoice.total||0).toFixed(2)}</td></tr></tfoot></table>
  <p>Mahadsanid!</p></body></html>`;
  const { uri } = await Print.printToFileAsync({ html });
  return uri;
}

export async function generateReportPdf(report) {
  const html = `<!doctype html><html><head><meta charset='utf-8'><style>body{font-family:Arial;padding:16px}h1{color:#fe3200}li{margin:8px 0}</style></head><body>
    <h1>${report.title || 'Warbixin'}</h1>
    <ul>${(report.items||[]).map(i=>`<li>${i.name}: ${i.value}</li>`).join('')}</ul>
  </body></html>`;
  const { uri } = await Print.printToFileAsync({ html });
  return uri;
}

export async function generateTransactionPdf(transaction) {
  const html = `<!doctype html><html><head><meta charset='utf-8'><style>
    body{font-family:Arial;padding:24px;background:#f4f6fb;color:#0b1739}
    h1{color:#fe3200;margin-bottom:4px}
    h2{margin-top:24px;color:#0b1739}
    table{width:100%;border-collapse:collapse;margin-top:12px}
    td,th{border:1px solid #d6d9e6;padding:8px;text-align:left}
    .tag{display:inline-block;padding:6px 12px;border-radius:16px;font-size:12px;background:#01002a;color:#fff;margin-top:8px}
  </style></head><body>
    <h1>eMaamul - Xawaalad</h1>
    <span class='tag'>${transaction.type === 'sale' ? 'Iib' : 'Kharash'}</span>
    <p><strong>Taariikh:</strong> ${new Date(transaction.created_at).toLocaleString()}</p>
    <table>
      <tbody>
        <tr><th>ID</th><td>${transaction.id}</td></tr>
        <tr><th>Nooca</th><td>${transaction.type === 'sale' ? 'Iib' : 'Kharash'}</td></tr>
        <tr><th>Qiimaha</th><td>${Number(transaction.amount || 0).toFixed(2)} ${transaction.currency || ''}</td></tr>
        <tr><th>Tirada</th><td>${Number(transaction.qty || 1)}</td></tr>
        <tr><th>Macmiil</th><td>${transaction.customer?.name || '—'}</td></tr>
        <tr><th>Alaab</th><td>${transaction.product?.name || '—'}</td></tr>
      </tbody>
    </table>
    <h2>Faahfaahin</h2>
    <p>${transaction.notes || 'Xog dheeraad ah lama gelin.'}</p>
  </body></html>`;
  const { uri } = await Print.printToFileAsync({ html });
  return uri;
}

export async function sharePdf(uri) {
  const can = await Sharing.isAvailableAsync();
  if (can) await Sharing.shareAsync(uri);
  return uri;
}
