import * as Notifications from 'expo-notifications';

export async function notifyLowStock({ name, stock }) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Kaydka oo hooseeya',
        body: `${name}: hadhay ${stock}`,
      },
      trigger: null,
    });
  } catch {}
}

export async function schedulePaymentReminder({ invoiceId, when, amount }) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Bixinta ayaa ku dhow',
        body: `Fatuur #${String(invoiceId).slice(0,6)} - ${amount} ayaa ku dhacaysa`,
      },
      trigger: when instanceof Date ? when : null,
    });
  } catch {}
}
