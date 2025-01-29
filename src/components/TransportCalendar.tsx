import React, { useState, useRef, useEffect } from "react";
import BookingCell from "./BookingCell";
import RentalModal from "./RentalModal";
import { generateDateRange } from "../utils/dateUtils";
import { ReactMouseSelect, TFinishSelectionCallback } from "react-mouse-select";
import { IoAddCircle } from "react-icons/io5";
import { Booking } from "../types";
import { useTranslation } from "react-i18next";
import { ClipLoader } from "react-spinners";

interface RentType {
    id: number;
    start_date: string;
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

interface VehicleType {
    id: number;
    name: string;
    type: string;
    class: string;
    brand: string;
    model: string;
    engine_type: string;
    edit_url: string;
    rents: RentType[];
}

interface TransportCalendarProps {
    vehicals: VehicleType[];
    refreshData: () => void;
    searchValue: string;
    isLoading: boolean;
    updateLocalRent: (vehicleId: number, updatedRent: RentType) => void;
    addLocalRent: (vehicleId: number, newRent: RentType) => void;
    dateRange: {
        startDate: Date;
        endDate: Date;
    };
}

const TransportCalendar: React.FC<TransportCalendarProps> = ({
                                                                 vehicals,
                                                                 refreshData,
                                                                 searchValue,
                                                                 isLoading,
                                                                 dateRange,
                                                                 updateLocalRent,
                                                                 addLocalRent,
                                                             }) => {
    const { t } = useTranslation();
    const [selectedRent, setSelectedRent] = useState<any | null>(null);
    const [vehicle, setVehicle] = useState<any | null>(null);
    const [highlightedHeaders, setHighlightedHeaders] = useState<number[]>([]);
    const [highlightedRows, setHighlightedRows] = useState<number[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);

    // Берём даты из пропсов
    const start = dateRange.startDate;
    const end = dateRange.endDate;

    // Вместо toISOString() — формируем локальные строки (YYYY-MM-DD)
    const formatYMD = (d: Date) => {
        const yy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        return `${yy}-${mm}-${dd}`;
    };

    const startStr = formatYMD(start);
    const endStr = formatYMD(end);

    // Генерируем массив дат (в формате YYYY-MM-DD) от startStr до endStr
    const dates: string[] = generateDateRange(startStr, endStr);

    // Следим за выделением мышью
    useEffect(() => {
        const observer = new MutationObserver(() => {
            const selectedItems = containerRef.current?.querySelectorAll(".selected");
            const selectedHeaders = new Set<number>();
            const selectedRows = new Set<number>();

            selectedItems?.forEach((item) => {
                const index = parseInt(item.getAttribute("data-id") || "");
                const rowId = parseInt(item.getAttribute("data-row") || "");
                if (!isNaN(index)) selectedHeaders.add(index);
                if (!isNaN(rowId)) selectedRows.add(rowId);
            });

            setHighlightedHeaders(Array.from(selectedHeaders));
            setHighlightedRows(Array.from(selectedRows));
        });

        const observeTarget = containerRef.current;
        if (observeTarget) {
            observer.observe(observeTarget, {
                attributes: true,
                subtree: true,
                attributeFilter: ["class"],
            });
        }
        return () => {
            observer.disconnect();
        };
    }, []);

    // Когда пользователь «дотянул» мышью и отпустил
    const handleFinishSelection: TFinishSelectionCallback = (items) => {
        // Собираем выделенные даты
        const selectedDates = items
            .map((item) => item.getAttribute("data-date") || "")
            .filter((date) => date !== "");

        // Собираем ID транспорта (строк)
        const selectedRows = Array.from(
            new Set(
                items.map((item) => {
                    const row = item.getAttribute("data-row");
                    return parseInt(row || "", 10);
                })
            )
        );

        const smallestRowId = selectedRows.length > 0 ? selectedRows[0] : null;

        if (smallestRowId !== null && selectedDates.length > 0) {
            const vehical = vehicals.find(
                (v) => v.id.toString() === smallestRowId.toString()
            );
            if (vehical) {
                const bookingsInRow = vehical.rents || [];
                // Начало диапазона
                const selectedStartStr = selectedDates[0];
                // Конец диапазона
                const selectedEndStr = selectedDates[selectedDates.length - 1];

                // Превращаем строки в Date (без UTC‐сдвига)
                const selectedStart = new Date(
                    parseInt(selectedStartStr.slice(0, 4)),      // год
                    parseInt(selectedStartStr.slice(5, 7)) - 1, // месяц
                    parseInt(selectedStartStr.slice(8, 10)),    // день
                    9, 0, 0
                );
                const selectedEnd = new Date(
                    parseInt(selectedEndStr.slice(0, 4)),
                    parseInt(selectedEndStr.slice(5, 7)) - 1,
                    parseInt(selectedEndStr.slice(8, 10)),
                    18, 0, 0
                );

                // Проверяем пересечение
                const overlappingBooking = bookingsInRow.find((rent) => {
                    const rentStart = new Date(rent.start_date);
                    const rentEnd = new Date(rent.end_date);
                    // Условие пересечения
                    return !(
                        rentEnd < selectedStart ||
                        rentStart > selectedEnd
                    );
                });

                if (overlappingBooking) {
                    // Если пересеклись с существующим бронированием
                    setSelectedRent(overlappingBooking);
                } else {
                    // Иначе создаём новую запись
                    const newRent = {
                        start_date: `${selectedStartStr}T09:00:00`,
                        end_date: `${selectedEndStr}T18:00:00`,
                        payment_koeff: 0,
                        payable: 0,
                    };
                    setSelectedRent(newRent);
                }
                setVehicle({
                    id: vehical.id,
                    name: vehical.name,
                    type: vehical.type,
                    class: vehical.class,
                    brand: vehical.brand,
                    model: vehical.model,
                    engine_type: vehical.engine_type,
                    edit_url: vehical.edit_url,
                });
            }
        }
    };

    // При клике на ячейку бронирования — открыть редактирование
    const handleVehicleInfo = (rent: any, vehicle: VehicleType) => {
        setSelectedRent(rent);
        setVehicle(vehicle);
    };

    // При клике на "+" — форма добавления бронирования
    const handleOpenRentalForm = (vehicle: VehicleType) => {
        const todayStr = formatYMD(new Date());
        const defaultRent = {
            start_date: `${todayStr}T09:00:00`,
            end_date: `${todayStr}T18:00:00`,
            payment_koeff: 0,
            payable: 0,
        };
        setSelectedRent(defaultRent);
        setVehicle(vehicle);
    };

    // Строим «матрицу» ячеек
    const createBookingMatrix = () => {
        const matrix: {
            transportName: string;
            transportId: number;
            transportEditUrl: string;
            cells: JSX.Element[];
        }[] = [];

        vehicals.forEach((vehical) => {
            const row: JSX.Element[] = [];
            const relevantBookings = [...vehical.rents].sort(
                (a, b) =>
                    new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
            );

            const occupiedColumns = new Array(dates.length).fill(false);
            let colIndex = 0;

            relevantBookings.forEach((rent, index) => {
                const rentStartOrig = new Date(rent.start_date);
                const rentEndOrig = new Date(rent.end_date);

                // «Зажимаем» в границах (start, end)
                const rentStart = rentStartOrig < start ? start : rentStartOrig;
                const rentEnd = rentEndOrig > end ? end : rentEndOrig;

                const startDate = formatYMD(rentStart);
                const endDate = formatYMD(rentEnd);

                let startCol = dates.indexOf(startDate);
                let endCol = dates.indexOf(endDate);

                if (startCol < 0 || endCol < 0) {
                    return;
                }
                if (endCol > dates.length - 1) {
                    endCol = dates.length - 1;
                }

                // Сдвигаем startCol, пока не найдём свободную ячейку
                while (startCol <= endCol && occupiedColumns[startCol]) {
                    startCol++;
                }

                let adjustedEndCol = endCol;
                for (let i = startCol; i <= endCol; i++) {
                    if (occupiedColumns[i]) {
                        adjustedEndCol = i - 1;
                        break;
                    }
                }

                const finalColSpan = adjustedEndCol - startCol + 1;
                if (finalColSpan <= 0) return;

                // Добавляем пустые ячейки до startCol
                while (colIndex < startCol) {
                    row.push(
                        <td
                            key={`empty-${vehical.id}-${colIndex}`}
                            className="cell"
                            data-id={colIndex.toString()}
                            data-row={vehical.id.toString()}
                            data-date={dates[colIndex]}
                        />
                    );
                    colIndex++;
                }

                // Добавляем ячейку с бронированием
                row.push(
                    <BookingCell
                        key={`booking-${vehical.id}-${startCol}`}
                        rent={rent}
                        index={index}
                        rowSpan={1}
                        colSpan={finalColSpan}
                        rowIndex={vehical.id}
                        onClick={() => handleVehicleInfo(rent, vehical)}
                    />
                );

                // Помечаем занятые колонки
                for (let i = startCol; i <= adjustedEndCol; i++) {
                    occupiedColumns[i] = true;
                }
                colIndex = adjustedEndCol + 1;
            });

            // Заполняем остаток справа пустыми ячейками
            while (colIndex < dates.length) {
                row.push(
                    <td
                        key={`empty-${vehical.id}-${colIndex}`}
                        className="cell"
                        data-id={colIndex.toString()}
                        data-row={vehical.id.toString()}
                        data-date={dates[colIndex]}
                    />
                );
                colIndex++;
            }

            matrix.push({
                transportName: vehical.name,
                transportId: vehical.id,
                transportEditUrl: vehical.edit_url,
                cells: row,
            });
        });

        return matrix;
    };

    // Горизонтальный скролл колёсиком
    const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
        if (containerRef.current) {
            containerRef.current.scrollLeft += event.deltaY;
        }
    };

    const bookingMatrix = createBookingMatrix();

    return (
        <>
            <main
                className="calendar-container container"
                ref={containerRef}
                onWheel={handleWheel}
            >
                <table className="transport-calendar">
                    <thead>
                    <tr>
                        <th>{t("transport")}</th>
                        {!isLoading &&
                            dates.length > 0 &&
                            dates.map((date, index) => (
                                <th
                                    key={index}
                                    className={
                                        highlightedHeaders.includes(index)
                                            ? "highlighted-header date-cell"
                                            : "date-cell"
                                    }
                                    data-date={date}
                                >
                                    {/* Покажем только ММ.ДД или ДД.ММ — как удобнее */}
                                    {new Date(date).toLocaleDateString("ru-RU").substring(0, 5)}
                                </th>
                            ))}
                    </tr>
                    </thead>

                    <tbody>
                    {isLoading ? (
                        <div style={{ textAlign: "center", margin: "20px" }}>
                            <ClipLoader color="#007bff" size={50} />
                        </div>
                    ) : vehicals.length === 0 ? (
                        <div className={"no-data-placeholder"}>
                            <p>{t("noVehiclesFound")}</p>
                        </div>
                    ) : (
                        bookingMatrix.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                                <td
                                    className={
                                        highlightedRows.includes(row.transportId)
                                            ? "highlighted-transport"
                                            : ""
                                    }
                                >
                                    {/* Кнопка "+" для добавления новой аренды */}
                                    <button
                                        className="btn transport-btn-icon"
                                        onClick={() =>
                                            handleOpenRentalForm({
                                                id: row.transportId,
                                                name: row.transportName,
                                                type: "",
                                                class: "",
                                                brand: "",
                                                model: "",
                                                engine_type: "",
                                                edit_url: row.transportEditUrl,
                                                rents: [],
                                            })
                                        }
                                    >
                                        <IoAddCircle size={32} />
                                    </button>
                                    {/* Ссылка на редактирование ТС */}
                                    <a className="link" href={row.transportEditUrl}>
                                        {row.transportName || ""}
                                    </a>
                                </td>
                                {row.cells}
                            </tr>
                        ))
                    )}
                    {/* Последняя строка для добавления нового ТС */}
                    <tr>
                        <td className="cell">
                            <button
                                className="btn cell-btn"
                                onClick={() =>
                                    window.open("https://getmecar.ru/add-listing/", "_blank")
                                }
                            >
                                {t("addVehicle")}
                            </button>
                            <button
                                className="btn cell-btn-icon"
                                onClick={() => alert(t("addVehicle"))}
                            >
                                <IoAddCircle size={32} />
                            </button>
                        </td>
                        {!isLoading &&
                            dates.length > 0 &&
                            Array(dates.length)
                                .fill(null)
                                .map((_, index) => (
                                    <td key={`empty-${index}`} className="cell--disabled" />
                                ))}
                    </tr>
                    </tbody>
                </table>
            </main>

            {!isLoading && (
                <ReactMouseSelect
                    containerRef={containerRef}
                    itemClassName="cell"
                    selectedItemClassName="selected"
                    frameClassName="mouse-select__frame"
                    openFrameClassName="open"
                    finishSelectionCallback={handleFinishSelection}
                    sensitivity={0}
                />
            )}

            {selectedRent && (
                <RentalModal
                    isOpen={!!selectedRent}
                    onClose={() => setSelectedRent(null)}
                    rent={selectedRent}
                    vehicle={vehicle}
                    updateLocalRent={updateLocalRent}
                    addLocalRent={addLocalRent}
                    onUpdate={() => {
                        refreshData();
                    }}
                />
            )}
        </>
    );
};

export default TransportCalendar;
