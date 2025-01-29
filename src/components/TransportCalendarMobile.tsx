import React, { useState, useRef } from "react";
import BookingCard from "./BookingCard";
import RentalModal from "./RentalModal";
import { generateDateRange, getMinMaxDates, calculateColSpan } from "../utils/dateUtils";
import { ClipLoader } from "react-spinners";
import { useTranslation } from "react-i18next";

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

const TransportCalendarMobile: React.FC<TransportCalendarProps> = ({ vehicals, searchValue,refreshData, updateLocalRent, addLocalRent }) => {
  const { t } = useTranslation();
  const [selectedRent, setSelectedRent] = useState<any | null>(null);
  const [vehicle, setVehicle] = useState<any | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { minDate, maxDate } = getMinMaxDates(
      vehicals.flatMap((vehical) => vehical.rents)
  );

  const validDate = (date: Date): boolean => !isNaN(date.getTime());

  const minDateStr = validDate(minDate) ? minDate.toISOString().split("T")[0] : "";
  const maxDateStr = validDate(maxDate) ? maxDate.toISOString().split("T")[0] : "";
  const dates: string[] =
      validDate(minDate) && validDate(maxDate)
          ? generateDateRange(minDateStr, maxDateStr)
          : [];

  const groupedBookings = vehicals.reduce<Record<number, any[]>>(
      (acc, vehical) => {
        vehical.rents.forEach((rent) => {
          const numericId = vehical.id;
          if (!acc[numericId]) {
            acc[numericId] = [];
          }
          acc[numericId].push({
            ...rent,
            startDate: new Date(rent.start_date).toISOString().split("T")[0],
            endDate: new Date(rent.end_date).toISOString().split("T")[0],
            colSpan: calculateColSpan(
                new Date(rent.start_date).toISOString().split("T")[0],
                new Date(rent.end_date).toISOString().split("T")[0],
                dates
            ),
            isContinuous: false,
          });
        });
        return acc;
      },
      {}
  );

  const handleVehicleInfo = (
      rent: any,
      vehicle: {
        id: number;
        name: string;
        type: string;
        class: string;
        brand: string;
        model: string;
        engine_type: string;
        edit_url: string;
      }
  ) => {
    setSelectedRent(rent);
    setVehicle(vehicle);
  };

  const handleOpenRentalForm = (vehicle: {
    id: number;
    name: string;
    type: string;
    class: string;
    brand: string;
    model: string;
    engine_type: string;
    edit_url: string;
  }) => {
    const defaultRent = {
      start_date: new Date().toISOString().split("T")[0] + "T09:00:00",
      end_date: new Date().toISOString().split("T")[0] + "T18:00:00",
      payment_koeff: 0,
      payable: 0,
    };

    setSelectedRent(defaultRent);
    setVehicle(vehicle);
  };

  const isSearchActive = searchValue?.trim() !== "";
  const noSearchResults = isSearchActive && vehicals.length === 0;

  return (
      <>
        <main className="mobile-calendar-container" ref={containerRef}>
          {vehicals.length > 0 ? (
              vehicals.map((vehical) => (
                  <BookingCard
                      key={vehical.id}
                      vehicle={{
                        id: vehical.id,
                        name: vehical.name,
                        type: vehical.type,
                        class: vehical.class,
                        brand: vehical.brand,
                        model: vehical.model,
                        engine_type: vehical.engine_type,
                        edit_url: vehical.edit_url,
                      }}
                      bookings={groupedBookings[vehical.id] || []}
                      dates={dates}
                      onClick={(rent, vehicle) => handleVehicleInfo(rent, vehicle)}
                      onAddClick={(vehicle) => handleOpenRentalForm(vehicle)}
                  />
              ))
          ) : noSearchResults ? (
              <div className="no-data-placeholder">
                <p>{t("noVehiclesFound")}</p>
              </div>
          ) : (
              <div style={{ textAlign: "center", margin: "20px" }}>
                <ClipLoader color="#007bff" size={50} />
              </div>
          )}
        </main>
        {selectedRent && (
            <RentalModal
                isOpen={!!selectedRent}
                onClose={() => {
                  setSelectedRent(null);
                }}
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

export default TransportCalendarMobile;
