import { createContext, useState, useEffect, ReactNode } from 'react'
import { Currency, CURRENCIES } from '../lib/currencies'

interface CurrencyContextType {
  currency: Currency
  setCurrency: (currency: Currency) => void
  formatAmount: (amount: number) => string
}

export const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

interface CurrencyProviderProps {
  children: ReactNode
}

export function CurrencyProvider({ children }: CurrencyProviderProps) {
  const [currency, setCurrencyState] = useState<Currency>(CURRENCIES[0]) // Default to USD

  // Load saved currency from localStorage
  useEffect(() => {
    const savedCurrency = localStorage.getItem('billbuddy-currency')
    if (savedCurrency) {
      try {
        const parsed = JSON.parse(savedCurrency)
        const found = CURRENCIES.find(c => c.code === parsed.code)
        if (found) {
          setCurrencyState(found)
        }
      } catch (error) {
        console.error('Failed to parse saved currency:', error)
      }
    }
  }, [])

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency)
    localStorage.setItem('billbuddy-currency', JSON.stringify(newCurrency))
  }

  const formatAmount = (amount: number): string => {
    return `${currency.symbol}${amount.toFixed(2)}`
  }

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatAmount }}>
      {children}
    </CurrencyContext.Provider>
  )
}

