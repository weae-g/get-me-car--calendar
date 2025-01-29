// CustomDateRangePicker.tsx
import React, { useState } from "react";
import { DateRangePicker, StaticRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { ru } from "date-fns/locale";

interface CustomDateRangePickerProps {
  onDateRangeChange: (range: { startDate: Date; endDate: Date }) => void;
}

const CustomDateRangePicker: React.FC<CustomDateRangePickerProps> = ({ onDateRangeChange }) => {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
    key: "selection",
  });

  const handleDateRangeChange = (ranges: any) => {
    setDateRange(ranges.selection);
    onDateRangeChange(ranges.selection);
  };

  // Define custom static ranges
  const customStaticRanges: StaticRange[] = [
    {
      label: "Сегодня",
      range: () => ({
        startDate: new Date(),
        endDate: new Date(),
      }),
      isSelected: (range) => isSameDay(range.startDate, new Date()) && isSameDay(range.endDate, new Date()),
    },
    {
      label: "Вчера",
      range: () => {
        const today = new Date();
        const yesterday = new Date(today.setDate(today.getDate() - 1));
        return {
          startDate: yesterday,
          endDate: yesterday,
        };
      },
      isSelected: (range) => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return isSameDay(range.startDate, yesterday) && isSameDay(range.endDate, yesterday);
      },
    },
    {
      label: "Эта неделя",
      range: () => {
        const today = new Date();
        const firstDay = today.getDate() - today.getDay();
        const lastDay = firstDay + 6;
        const start = new Date(today.setDate(firstDay));
        const end = new Date(today.setDate(lastDay));
        return {
          startDate: start,
          endDate: end,
        };
      },
      isSelected: (range) => {
        const today = new Date();
        const firstDay = today.getDate() - today.getDay();
        const lastDay = firstDay + 6;
        const start = new Date(today.setDate(firstDay));
        const end = new Date(today.setDate(lastDay));
        return isSameDay(range.startDate, start) && isSameDay(range.endDate, end);
      },
    },
    {
      label: "Прошлая неделя",
      range: () => {
        const today = new Date();
        const firstDay = today.getDate() - today.getDay() - 7;
        const lastDay = firstDay + 6;
        const start = new Date(today.setDate(firstDay));
        const end = new Date(today.setDate(lastDay));
        return {
          startDate: start,
          endDate: end,
        };
      },
      isSelected: (range) => {
        const today = new Date();
        const firstDay = today.getDate() - today.getDay() - 7;
        const lastDay = firstDay + 6;
        const start = new Date(today.setDate(firstDay));
        const end = new Date(today.setDate(lastDay));
        return isSameDay(range.startDate, start) && isSameDay(range.endDate, end);
      },
    },
    {
      label: "Этот месяц",
      range: () => {
        const today = new Date();
        const start = new Date(today.getFullYear(), today.getMonth(), 1);
        const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        return {
          startDate: start,
          endDate: end,
        };
      },
      isSelected: (range) => {
        const today = new Date();
        const start = new Date(today.getFullYear(), today.getMonth(), 1);
        const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        return isSameDay(range.startDate, start) && isSameDay(range.endDate, end);
      },
    },
    {
      label: "Прошлый месяц",
      range: () => {
        const today = new Date();
        const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const end = new Date(today.getFullYear(), today.getMonth(), 0);
        return {
          startDate: start,
          endDate: end,
        };
      },
      isSelected: (range) => {
        const today = new Date();
        const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const end = new Date(today.getFullYear(), today.getMonth(), 0);
        return isSameDay(range.startDate, start) && isSameDay(range.endDate, end);
      },
    },
  ];

  const isSameDay = (date1?: Date, date2?: Date) => {
    if (!date1 || !date2) return false;
    return date1.toDateString() === date2.toDateString();
  };

  return (
    <DateRangePicker
      locale={ru}
      ranges={[dateRange]}
      onChange={handleDateRangeChange}
      moveRangeOnFirstSelection={false}
      staticRanges={customStaticRanges}
    />
  );
};

export default CustomDateRangePicker;
