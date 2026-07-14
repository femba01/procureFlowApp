const currencyFormatters = {
  standard: new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }),
  compact: new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    notation: "compact",
    maximumFractionDigits: 1,
  }),
};

export function money(value: number) {
  return currencyFormatters.standard.format(value || 0);
}

export function compactMoney(value: number) {
  return currencyFormatters.compact.format(value || 0);
}
