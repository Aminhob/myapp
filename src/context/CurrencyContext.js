import React, { createContext, useContext, useMemo } from 'react';

const CurrencyContext = createContext({
  currency: null,
  setCurrency: () => {},
  format: (value) => `${Number(value || 0).toFixed(2)}`,
  convert: (value) => Number(value || 0),
});

const formatAmount = (amount) => {
  const value = Number(amount || 0);
  if (!Number.isFinite(value)) return '0';
  const formatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
  return `${formatter.format(value)}`;
};

export const CurrencyProvider = ({ children }) => {
  const value = useMemo(() => ({
    currency: null,
    setCurrency: () => {},
    format: (amount) => formatAmount(amount),
    convert: (amount) => Number(amount || 0),
    base: null,
    symbols: {},
  }), []);

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
};

export const useCurrency = () => useContext(CurrencyContext);
