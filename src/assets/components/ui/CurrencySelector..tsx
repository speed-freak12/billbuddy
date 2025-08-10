import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '../lib/utils'
import { Button } from './ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover'
import { useState } from 'react'
import { useCurrency } from '../hooks/useCurrency'
import { CURRENCIES, Currency } from '../lib/currencies'

interface CurrencySelectorProps {
  className?: string
}

export function CurrencySelector({ className }: CurrencySelectorProps) {
  const [open, setOpen] = useState(false)
  const { currency, setCurrency } = useCurrency()

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-[200px] justify-between", className)}
        >
          <span className="flex items-center">
            <span className="mr-2 text-lg">{currency.symbol}</span>
            {currency.name}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search currency..." />
          <CommandList>
            <CommandEmpty>No currency found.</CommandEmpty>
            <CommandGroup>
              {CURRENCIES.map((curr) => (
                <CommandItem
                  key={curr.code}
                  value={curr.code}
                  onSelect={() => {
                    setCurrency(curr)
                    setOpen(false)
                  }}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      currency.code === curr.code ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="mr-2 text-lg">{curr.symbol}</span>
                  <span className="flex-1">{curr.name}</span>
                  <span className="text-sm text-muted-foreground">{curr.code}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}