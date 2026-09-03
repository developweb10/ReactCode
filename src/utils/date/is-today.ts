export const isToday = (day: number, month: number, year: number): boolean => {
  const date = new Date();
  return (
    day === date.getDate() &&
    month === date.getMonth() + 1 &&
    year === date.getFullYear()
  );
};
