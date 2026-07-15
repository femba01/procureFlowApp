export const DateTimeFormat = (date: string | number | Date, options?: Intl.DateTimeFormatOptions, formatType?: "Date" | "DateTime") => {
  const dateObj = new Date(date);
  
  if (formatType === "Date") {
    return dateObj.toLocaleDateString(undefined, options);
  }
  if (formatType === "DateTime") {
    return dateObj.toLocaleString(undefined, options);
  }
  return dateObj.toLocaleString(undefined, options);
};


