
export const calculateWorkdays = (start: string, end: string): { days: number; weeks: number } => {
  const d1 = new Date(start);
  const d2 = new Date(end);
  
  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return { days: 0, weeks: 0 };
  
  let count = 0;
  const curDate = new Date(d1.getTime());
  
  while (curDate <= d2) {
    const dayOfWeek = curDate.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // 0 = Sunday, 6 = Saturday
      count++;
    }
    curDate.setDate(curDate.getDate() + 1);
  }
  
  const totalDays = Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const weeks = parseFloat((totalDays / 7).toFixed(1));
  
  return { days: count, weeks };
};
