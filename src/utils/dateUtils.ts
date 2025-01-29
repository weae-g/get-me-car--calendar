export const generateDateRange = (start: string, end: string): string[] => {
  const dates: string[] = [];
  const currentDate = new Date(start);
  const endDate = new Date(end);

  while (currentDate <= endDate) {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const day = String(currentDate.getDate()).padStart(2, "0");

    dates.push(`${year}-${month}-${day}`);

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
};

export const getMinMaxDates = (
  bookings: { start_date: string; end_date: string }[]
): { minDate: Date; maxDate: Date } => {
  const allDates = bookings.flatMap((booking) => [
    new Date(booking.start_date).getTime(),
    new Date(booking.end_date).getTime(),
  ]);

  const minDate = new Date(Math.min(...allDates));
  const maxDate = new Date(Math.max(...allDates));

  return { minDate, maxDate };
};

export const calculateColSpan = (
  startDate: string,
  endDate: string,
  dates: string[]
): number => {
  const startIndex = dates.indexOf(startDate);
  const endIndex = dates.indexOf(endDate);
  return endIndex - startIndex + 1;
};

export const calculateRowSpan = (
  startDate: string,
  endDate: string,
  dates: string[]
): number => {
  const startIndex = dates.indexOf(startDate);
  const endIndex = dates.indexOf(endDate);
  return endIndex - startIndex + 1;
};

export const isDateInRange = (
  date: string,
  start: string,
  end: string
): boolean => {
  const checkDate = new Date(date);
  return checkDate >= new Date(start) && checkDate <= new Date(end);
};
