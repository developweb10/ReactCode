export const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const getWeekDay = (i: number) => weekDays[i % weekDays.length];
