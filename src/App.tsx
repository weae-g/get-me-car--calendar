import React, { useState, useEffect } from "react";
import CalendarOptions from "./components/CalendarOptions";
import TransportCalendar from "./components/TransportCalendar";
import TransportCalendarMobile from "./components/TransportCalendarMobile";
import { getToken, validateToken } from "./api/auth";
import { fetchVehicles } from "./api/vehicles";
import AuthOverlay from "./components/AuthOverlay";
import Cookies from "js-cookie";
import { useTranslation } from "react-i18next";

interface Rent {
  id: number;
  start_date: string;  // "YYYY-MM-DDTHH:mm:ss" (локальное время, без 'Z')
  end_date: string;
  country: string;
  city: string;
  client_name: string;
  email: string;
  tel: string;
  tel_2: string;
  socials: { Telegram: boolean; Whatsapp: boolean; Viber: boolean }[];
  payment_koeff: number;
  payable: number;
  currency: string;
  services: number[];
}

interface Vehicle {
  id: number;
  name: string;
  type: string;
  class: string;
  brand: string;
  model: string;
  engine_type: string;
  edit_url: string;
  rents: Rent[];
}

/**
 * Утилита для "локального" форматирования дат:
 * если startOfDay=true => HH:mm:ss = 00:00:00
 * иначе => HH:mm:ss = 23:59:59.
 *
 * ВАЖНО: не используем toISOString(), чтобы не было UTC-сдвига
 */
function formatLocalDate(date: Date, startOfDay = true): string {
  const pad = (num: number) => String(num).padStart(2, "0");

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = startOfDay ? "00" : "23";
  const minutes = startOfDay ? "00" : "59";
  const seconds = startOfDay ? "00" : "59";

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

function App() {
  // Пример: сегодня и неделя назад по умолчанию
  const today = new Date();
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(today.getDate() - 7);

  const [token, setToken] = useState<string | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [sortBy, setSortBy] = useState<string>("");
  const [filterBy, setFilterBy] = useState<string>("");
  const [searchValue, setSearchValue] = useState<string>("");

  // Дата-пикер (startDate, endDate)
  const [dateRange, setDateRange] = useState<{ startDate: Date; endDate: Date }>(
      {
        startDate: oneWeekAgo,
        endDate: today
      }
  );

  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [idSortOrder, setIdSortOrder] = useState<string>("");
  const [nearestBookingSort, setNearestBookingSort] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  const { i18n } = useTranslation();

  // Сохраняем выбранный язык в куки
  useEffect(() => {
    const savedLanguage = Cookies.get("language");
    if (savedLanguage) {
      i18n.changeLanguage(savedLanguage);
    } else {
      const defaultLanguage = "en";
      i18n.changeLanguage(defaultLanguage);
      Cookies.set("language", defaultLanguage, { expires: 365 });
    }
  }, [i18n]);

  // Отслеживаем, действителен ли токен
  useEffect(() => {
    const interval = setInterval(() => {
      const storedToken = Cookies.get("authToken");
      if (!storedToken) {
        setToken(null);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const storedToken = Cookies.get("authToken");
        if (storedToken && (await validateToken(storedToken))) {
          setToken(storedToken);
        }
      } catch (error) {
        console.error("Ошибка авторизации:", error);
      }
    };
    fetchToken();

    // Определяем мобильный
    const mediaQuery = window.matchMedia("(max-width: 768px)");
    setIsMobile(mediaQuery.matches);
    const handleResize = () => setIsMobile(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleResize);

    return () => mediaQuery.removeEventListener("change", handleResize);
  }, []);

  // Если токен есть, автоматически разлогиниваем через час
  useEffect(() => {
    if (token) {
      const timer = setTimeout(() => {
        setToken(null);
        Cookies.remove("authToken");
      }, 3600 * 1000);
      return () => clearTimeout(timer);
    }
  }, [token]);

  /**
   * Загрузка списка транспорта за указанный диапазон дат
   */
  const fetchVehiclesData = async (refreshAll = true) => {
    if (refreshAll) {
      setVehicles([]);
      setIsLoading(true);
    }

    try {
      if (!token) return;

      // Формируем локальные строки начала/конца
      const startDate = formatLocalDate(dateRange.startDate, true);
      const endDate = formatLocalDate(dateRange.endDate, false);

      const data = await fetchVehicles(token, startDate, endDate);
      // Предполагаем, что data.vehicals — список машин
      if (data.vehicals && data.vehicals.length > 0) {
        setVehicles(
            data.vehicals.map((v: any) => ({
              ...v,
              // Если rents внутри массива массивов, сделаем flat()
              rents: v.rents?.flat?.() || []
            }))
        );
      } else {
        setVehicles([]);
      }
    } catch (error) {
      console.error("Ошибка загрузки транспорта:", error);
    } finally {
      if (refreshAll) setIsLoading(false);
    }
  };

  // Загружаем транспорт при изменении token или dateRange
  useEffect(() => {
    fetchVehiclesData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, dateRange]);

  // Обработчики для фильтра и сортировки
  const handleClassChange = (value: string | null) => {
    setSelectedClass(value || "");
  };
  const handleTypeChange = (value: string | null) => {
    setSelectedType(value || "");
  };
  const handleFilterChange = (val: string) => {
    setFilterBy(val || "");
  };
  const handleIdSortChange = (sortOrder: string) => {
    setIdSortOrder(sortOrder);
  };
  const handleSearchChange = (val: string) => {
    setSearchValue(val);
  };
  const handleDateRangeChange = (range: { startDate: Date; endDate: Date }) => {
    setDateRange(range);
  };
  const handleNearestBookingChange = (sortOrder: string) => {
    setNearestBookingSort(sortOrder);
  };

  const updateLocalRent = async (vehicleId: number, updatedRent: Rent) => {
    setIsUpdating(true);
    try {
      const storedToken = Cookies.get("authToken");
      if (!storedToken) return;
      // ... запрашиваем обновление на бэке, по окончании снова тянем данные:
      await fetchVehiclesData(false);
    } catch (error) {
      console.error("Ошибка обновления аренды:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const addLocalRent = async (vehicleId: number, newRent: Rent) => {
    setIsUpdating(true);
    try {
      const storedToken = Cookies.get("authToken");
      if (!storedToken) return;
      // ... создаём новую запись на бэке, по окончании снова тянем данные:
      await fetchVehiclesData(false);
    } catch (error) {
      console.error("Ошибка добавления аренды:", error);
    } finally {
      setIsUpdating(false);
    }
  };


  const filteredVehicles = vehicles.filter((vehicle) => {
    const matchClass = selectedClass ? vehicle.class === selectedClass : true;
    const matchType = selectedType ? vehicle.type === selectedType : true;
    const matchSearch =
        !searchValue ||
        vehicle.name?.toLowerCase().includes(searchValue.toLowerCase());

    return matchClass && matchType && matchSearch;
  });


  const filteredByStatus = filteredVehicles.filter((vehicle) => {
    if (filterBy === "all") return true;

    // Пример условности — "booked" значит есть аренда, пересекающаяся с сегодняшним днём
    // "available" значит нет пересечений с сегодняшним днём
    const today = new Date();
    if (filterBy === "available") {
      return vehicle.rents.every((rent) => {
        const rs = new Date(rent.start_date);
        const re = new Date(rent.end_date);
        return today < rs || today > re;
      });
    } else if (filterBy === "booked") {
      return vehicle.rents.some((rent) => {
        const rs = new Date(rent.start_date);
        const re = new Date(rent.end_date);
        return today >= rs && today <= re;
      });
    }
    return true;
  });

  const finalVehicles = [...filteredByStatus];
  if (idSortOrder === "idAsc") {
    finalVehicles.sort((a, b) => a.id - b.id);
  } else if (idSortOrder === "idDesc") {
    finalVehicles.sort((a, b) => b.id - a.id);
  }

  function getEarliestRentDate(vehicle: Vehicle): Date {
    if (!vehicle.rents.length) {
      return new Date("2999-01-01"); // заглушка
    }
    return vehicle.rents.reduce((earliest, r) => {
      const s = new Date(r.start_date);
      return s < earliest ? s : earliest;
    }, new Date("2999-01-01"));
  }

  if (nearestBookingSort === "nearestAsc") {
    finalVehicles.sort((a, b) => {
      return getEarliestRentDate(a).getTime() - getEarliestRentDate(b).getTime();
    });
  } else if (nearestBookingSort === "nearestDesc") {
    finalVehicles.sort((a, b) => {
      return getEarliestRentDate(b).getTime() - getEarliestRentDate(a).getTime();
    });
  }

  // Для выбора в фильтрах
  const uniqueClasses = [
    ...new Set(finalVehicles.map((v) => v.class).filter(Boolean))
  ].map((cls) => ({ value: cls, label: cls }));
  const uniqueTypes = [
    ...new Set(finalVehicles.map((v) => v.type).filter(Boolean))
  ].map((t) => ({ value: t, label: t }));

  return (
      <div className="calendar-wrapper">
        {!token && <AuthOverlay onLogin={setToken} />}
        {token && (
            <>
              <CalendarOptions
                  onClassChange={handleClassChange}
                  onTypeChange={handleTypeChange}
                  onFilterChange={handleFilterChange}
                  onSearchChange={handleSearchChange}
                  onIdSortChange={handleIdSortChange}
                  onDateRangeChange={handleDateRangeChange}
                  onNearestBookingChange={handleNearestBookingChange}
                  defaultDateRange={{ startDate: oneWeekAgo, endDate: today }}
                  uniqueClasses={uniqueClasses}
                  uniqueTypes={uniqueTypes}
              />

              {isMobile ? (
                  <TransportCalendarMobile
                      vehicals={finalVehicles}
                      refreshData={fetchVehiclesData}
                      searchValue={searchValue}
                      updateLocalRent={updateLocalRent}
                      addLocalRent={addLocalRent}
                      isLoading={isLoading}
                      dateRange={dateRange}
                  />
              ) : (
                  <TransportCalendar
                      vehicals={finalVehicles}
                      refreshData={fetchVehiclesData}
                      searchValue={searchValue}
                      updateLocalRent={updateLocalRent}
                      addLocalRent={addLocalRent}
                      isLoading={isLoading}
                      dateRange={dateRange}
                  />
              )}
            </>
        )}
      </div>
  );
}

export default App;
