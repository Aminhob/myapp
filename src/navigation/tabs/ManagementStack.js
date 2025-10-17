import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ManagementScreen from '../../screens/management/ManagementScreen';
import CustomersScreen from '../../screens/CustomersScreen';
import InventoryScreen from '../../screens/InventoryScreen';
import InvoiceListScreen from '../../screens/invoices/InvoiceListScreen';
import DebtsScreen from '../../screens/management/debts/DebtsScreen';

const Stack = createNativeStackNavigator();

export default function ManagementStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ManagementHome" component={ManagementScreen} />
      <Stack.Screen name="ManageCustomers" component={CustomersScreen} />
      <Stack.Screen name="ManageInventory" component={InventoryScreen} />
      <Stack.Screen name="ManageInvoices" children={() => <InvoiceListScreen embedded={false} />} />
      <Stack.Screen name="ManageDebts" component={DebtsScreen} />
    </Stack.Navigator>
  );
}
