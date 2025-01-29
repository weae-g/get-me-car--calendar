import React, { useState, useRef, useEffect } from "react";
import Select, { StylesConfig } from "react-select";
import {IoOptions, IoSearch, IoCalendar, IoLogOutOutline} from "react-icons/io5";
import { DateRangePicker, StaticRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { ru, enUS } from "date-fns/locale";
import LanguageSwitcher from "./LanguageSwitcher";
import { useTranslation } from "react-i18next";
import Cookies from 'js-cookie'

interface SortOption {
  value: string;
  label: string;
}

interface CalendarOptionsProps {
  onFilterChange: (filterBy: string) => void;
  onSearchChange: (searchTerm: string) => void;
  onDateRangeChange: (range: { startDate: Date; endDate: Date }) => void;
  defaultDateRange: { startDate: Date; endDate: Date };
  onClassChange: (sortBy: string) => void;
  onTypeChange: (sortBy: string) => void;
  onIdSortChange: (sortOrder: string) => void;
  onNearestBookingChange: (sortOrder: string) => void;
  uniqueClasses: SortOption[];
  uniqueTypes: SortOption[];
}

const customStaticRanges: StaticRange[] = [
  {
    label: "thisWeek",
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
    label: "lastWeek",
    range: () => {
      const today = new Date();
      const dayOfWeek = today.getDay();
      const firstDayOfCurrentWeek = new Date(
        today.setDate(today.getDate() - dayOfWeek)
      );
      const startOfLastWeek = new Date(
        firstDayOfCurrentWeek.setDate(firstDayOfCurrentWeek.getDate() - 7)
      );
      const endOfLastWeek = new Date(
        firstDayOfCurrentWeek.setDate(firstDayOfCurrentWeek.getDate() + 6)
      );

      return {
        startDate: startOfLastWeek,
        endDate: endOfLastWeek,
      };
    },
    isSelected: (range) => {
      const today = new Date();
      const dayOfWeek = today.getDay();
      const firstDayOfCurrentWeek = new Date(
        today.setDate(today.getDate() - dayOfWeek)
      );
      const startOfLastWeek = new Date(
        firstDayOfCurrentWeek.setDate(firstDayOfCurrentWeek.getDate() - 7)
      );
      const endOfLastWeek = new Date(
        firstDayOfCurrentWeek.setDate(firstDayOfCurrentWeek.getDate() + 6)
      );

      return (
        isSameDay(range.startDate, startOfLastWeek) &&
        isSameDay(range.endDate, endOfLastWeek)
      );
    },
  },
  {
    label: "thisMonth",
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
    label: "lastMonth",
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

const CalendarOptions: React.FC<CalendarOptionsProps> = ({
    onFilterChange,
    onSearchChange,
    onDateRangeChange,
    defaultDateRange,
    uniqueClasses,
    uniqueTypes,
    onTypeChange,
    onClassChange,
    onIdSortChange,
    onNearestBookingChange
}) => {
  const { t, i18n } = useTranslation();

  const locale = i18n.language === "ru" ? ru : enUS;

  const [selectedClassSort, setSelectedClassSort] = useState<SortOption | null>(null);
  const [selectedTypeSort, setSelectedTypeSort] = useState<SortOption | null>(null);
  const [selectedIdSort, setSelectedIdSort] = useState<SortOption | null>(null);
  const [selectedNearestBooking, setSelectedNearestBooking] = useState<SortOption | null>(null);

  const [selectedNearestBookingSort, setSelectedNearestBookingSort] =
    useState<SortOption | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<SortOption | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const [selectedClass, setSelectedClass] = useState<SortOption | null>(null);
  const [selectedType, setSelectedType] = useState<SortOption | null>(null);

  const calendarRef = useRef<HTMLDivElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const dropdownIconRef = useRef<HTMLDivElement | any>(null);
  const calendarIconRef = useRef<HTMLDivElement | any>(null);

  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const [dateRange, setDateRange] = useState({
    startDate: defaultDateRange.startDate || startOfMonth,
    endDate: defaultDateRange.endDate || endOfMonth,
    key: "selection",
  });


  const idSortOptions: SortOption[] = [
    { value: "idAsc", label: t("idAsc") },   // "ID ascending"
    { value: "idDesc", label: t("idDesc") }, // "ID descending"
  ];

  const nearestBookingOptions: SortOption[] = [
    { value: "nearestAsc", label: t("nearestAsc") },   // от ближайшего к дальнему
    { value: "nearestDesc", label: t("nearestDesc") }, // от дальнего к ближайшему
  ];

  const filterOptions: SortOption[] = [
    { value: "all", label: t("all") },
    { value: "available", label: t("available") },
    { value: "booked", label: t("booked") },
  ];


  const handleFilterChange = (selectedOption: SortOption | null) => {
    setSelectedFilter(selectedOption);
    onFilterChange(selectedOption?.value || "");
  };

  const handleClassChange = (selectedOption: SortOption | null) => {
    setSelectedClass(selectedOption);
    onClassChange(selectedOption?.value || "");
  };

  const handleTypeChange = (selectedOption: SortOption | null) => {
    setSelectedType(selectedOption);
    onTypeChange(selectedOption?.value || "");
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  };

  const handleIdSortChange = (selectedOption: SortOption | null) => {
    setSelectedIdSort(selectedOption);
    // передаём значение наверх, в App
    onIdSortChange(selectedOption?.value || "");
  };

  const handleNearestBookingChange = (selectedOption: SortOption | null) => {
    setSelectedNearestBooking(selectedOption);
    onNearestBookingChange(selectedOption?.value || "");
  };


  const handleDateRangeChange = (ranges: any) => {
    const { startDate, endDate } = ranges.selection;
    if (startDate && endDate) {
      const newRange = { startDate: new Date(startDate), endDate: new Date(endDate), key: "selection" };
      setDateRange(newRange);
      onDateRangeChange(newRange);
    }
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      calendarRef.current &&
      !calendarRef.current.contains(event.target as Node) &&
      !event.composedPath().includes(calendarIconRef.current)
    ) {
      setIsCalendarOpen(false);
    }

    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node) &&
      !event.composedPath().includes(dropdownIconRef.current)
    ) {
      setIsDropdownOpen(false);
    }
  };

  const handleLogout = () => {
    Cookies.remove("authToken");
    window.location.reload();
  }

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleCalendarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleDropdownClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const customStyles: StylesConfig<SortOption, false> = {
    control: (baseStyles, state) => ({
      ...baseStyles,
      borderRadius: 8,
      borderColor: state.isFocused ? "#429cf3" : "#e6e9f1",
      boxShadow: state.isFocused ? "0 0 0 1px #429cf3" : "none",
      "&:hover": {
        borderColor: "#429cf3",
      },
    }),
    menu: (baseStyles) => ({
      ...baseStyles,
      borderRadius: 8,
    }),
    menuList: (baseStyles) => ({
      ...baseStyles,
      padding: 4,
    }),
    option: (baseStyles) => ({
      ...baseStyles,
      borderRadius: 8,
    }),
  };

  return (
    <div className="container">
      <div className="calendar-options">
        <div className="calendar-options__item">
          <div
            className="calendar-icon"
            ref={calendarRef}
            onMouseDown={handleCalendarClick}>
            <IoCalendar
              size={24}
              className="calendar-icon"
              onClick={() => setIsCalendarOpen(!isCalendarOpen)}
            />
            {isCalendarOpen && (
              <div className="calendar-dropdown">
                <DateRangePicker
                  locale={locale}
                  ranges={[dateRange]}
                  inputRanges={[]}
                  weekdayDisplayFormat={"EEEEEE"}
                  staticRanges={customStaticRanges.map((range: any) => ({
                    ...range,
                    label: t(range.label),
                  }))}
                  onChange={handleDateRangeChange}
                  moveRangeOnFirstSelection={false}
                  className="date-range-picker"
                />
              </div>
            )}
            <div
              className="date-range-container"
              onClick={() => setIsCalendarOpen((prev) => !prev)}>
              <p className="date-range">
                {dateRange.startDate.toLocaleDateString("ru-RU")}
              </p>
              <p className="date-range">
                {dateRange.endDate.toLocaleDateString("ru-RU")}
              </p>
            </div>
          </div>
        </div>
        <div className="calendar-options__item">
          <div className="search-bar">
            <input
              type="text"
              placeholder={t("search")}
              onChange={handleSearchChange}
            />
            <button className="search-button">
              <IoSearch size={24} />
            </button>
          </div>

          <div className="icon-dropdown" ref={dropdownIconRef}>
            <IoOptions
              size={26}
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className="options-icon"
            />
          </div>

          <LanguageSwitcher />

          <IoLogOutOutline
              size={35}
              onClick={handleLogout}
              className="options-icon"
          />

          {isDropdownOpen && (
            <div
              className="dropdown-menu"
              ref={dropdownRef}
              onMouseDown={handleDropdownClick}>
              <div className="dropdown-menu-list">
                {/*<Select*/}
                {/*  styles={customStyles}*/}
                {/*  value={selectedFilter}*/}
                {/*  onChange={handleFilterChange}*/}
                {/*  options={filterOptions}*/}
                {/*  placeholder={t("status")}*/}
                {/*  isClearable*/}
                {/*/>*/}
                <Select
                  styles={customStyles}
                  value={selectedClass}
                  onChange={handleClassChange}
                  options={uniqueClasses.filter((option) => option.value !== "")}
                  placeholder={t("class")}
                  isClearable
                />
                <Select
                  styles={customStyles}
                  value={selectedType}
                  onChange={handleTypeChange}
                  options={uniqueTypes}
                  placeholder={t("type")}
                  isClearable
                />
                <Select
                    styles={customStyles}
                    value={selectedIdSort}
                    onChange={handleIdSortChange}
                    options={idSortOptions}
                    placeholder={t("id")}
                    isClearable
                />
                <Select
                    styles={customStyles}
                    value={selectedNearestBooking}
                    onChange={handleNearestBookingChange}
                    options={nearestBookingOptions}
                    placeholder={t("nearestBooking")}
                    isClearable
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarOptions;
