export const formatINR = (value: number | string | null | undefined) => {
  const numericValue = typeof value === 'number' ? value : Number(value ?? 0);
  return `₹ ${numericValue.toLocaleString('en-IN')}`;
};
