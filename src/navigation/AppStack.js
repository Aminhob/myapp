import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainTabs from './tabs/MainTabs';
import ProductFormScreen from '../screens/inventory/ProductFormScreen';
import CustomerFormScreen from '../screens/customers/CustomerFormScreen';
import SaleFormScreen from '../screens/transactions/SaleFormScreen';
import ExpenseFormScreen from '../screens/transactions/ExpenseFormScreen';
import InvoiceListScreen from '../screens/invoices/InvoiceListScreen';
import InvoiceDetailScreen from '../screens/invoices/InvoiceDetailScreen';
import TransactionDetailScreen from '../screens/transactions/TransactionDetailScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import SettingsProfileScreen from '../screens/settings/SettingsProfileScreen';
import SettingsBusinessScreen from '../screens/settings/SettingsBusinessScreen';
import SettingsPreferencesScreen from '../screens/settings/SettingsPreferencesScreen';
import SettingsNotificationsScreen from '../screens/settings/SettingsNotificationsScreen';
import SettingsSecurityScreen from '../screens/settings/SettingsSecurityScreen';
import SettingsAboutScreen from '../screens/settings/SettingsAboutScreen';

const Stack = createNativeStackNavigator();

export default function AppStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Tabs" component={MainTabs} options={{ headerShown: false }} />
      <Stack.Screen name="ProductForm" component={ProductFormScreen} options={{ title: 'Alaab' }} />
      <Stack.Screen name="CustomerForm" component={CustomerFormScreen} options={{ title: 'Macmiil' }} />
      <Stack.Screen name="SaleForm" component={SaleFormScreen} options={{ title: 'Ku dar iib' }} />
      <Stack.Screen name="ExpenseForm" component={ExpenseFormScreen} options={{ title: 'Ku dar kharash' }} />
      <Stack.Screen name="InvoiceList" component={InvoiceListScreen} options={{ title: 'Faatuurro' }} />
      <Stack.Screen name="InvoiceDetail" component={InvoiceDetailScreen} options={{ title: 'Faahfaahin Fatuur' }} />
      <Stack.Screen name="TransactionDetail" component={TransactionDetailScreen} options={{ title: 'Xawaalad' }} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Ogeysiisyada' }} />
      <Stack.Screen name="SettingsProfile" component={SettingsProfileScreen} options={{ headerShown: false }} />
      <Stack.Screen name="SettingsBusiness" component={SettingsBusinessScreen} options={{ headerShown: false }} />
      <Stack.Screen name="SettingsPreferences" component={SettingsPreferencesScreen} options={{ headerShown: false }} />
      <Stack.Screen name="SettingsNotifications" component={SettingsNotificationsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="SettingsSecurity" component={SettingsSecurityScreen} options={{ headerShown: false }} />
      <Stack.Screen name="SettingsAbout" component={SettingsAboutScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}
