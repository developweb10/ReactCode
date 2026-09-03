export const getFullDate = (
  day: number,
  month: number,
  year: number
): string => {
  const dayWithZero = day < 10 ? `0${day}` : day;
  const monthWithZero = month < 10 ? `0${month}` : month;

  return `${dayWithZero}-${monthWithZero}-${year}`;
};
