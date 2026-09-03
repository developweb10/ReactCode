export const convertMinutesToHoursMinutes = (m: number) => {
  const hours = m / 60;
  const rhours = Math.floor(hours);
  const minutes = (hours - rhours) * 60;
  const rminutes = Math.round(minutes);
  return { hours: rhours, minutes: rminutes };
};
