import { useEffect } from 'react';
import * as Network from 'expo-network';
import { syncQueue } from '../services/sync/syncService';

export function useOnlineStatus() {
  useEffect(() => {
    let timer;
    const check = async () => {
      try {
        const state = await Network.getNetworkStateAsync();
        if (state.isConnected && state.isInternetReachable) {
          await syncQueue();
        }
      } catch {}
    };
    check();
    timer = setInterval(check, 5000);
    return () => clearInterval(timer);
  }, []);
}
