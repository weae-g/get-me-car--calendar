import React, { useState } from "react";
import { IoAddCircle } from "react-icons/io5";
import BookingCell from "./BookingCell";

interface BookingCardProps {
  vehicle: {
    id: number;
    name: string;
    type: string;
    class: string;
    brand: string;
    model: string;
    engine_type: string;
    edit_url: string;
  };
  bookings: any[];
  onClick: (rent: any, vehicle: any) => void;
  onAddClick: (vehicle: any) => void;
  dates: string[];
}

const BookingCard: React.FC<BookingCardProps> = ({
  vehicle,
  bookings,
  onClick,
  onAddClick,
  dates,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCardClick = () => {
    setIsExpanded(!isExpanded);
  };

  const handleBookingCellClick = (
    rent: any,
    e: React.MouseEvent<HTMLTableRowElement, MouseEvent>
  ) => {
    e.stopPropagation(); 
    onClick(rent, vehicle); 
  };

  return (
    <div
      className={`booking-card ${isExpanded ? "expanded" : ""}`}
      onClick={handleCardClick}
    >
      <div className="booking-card__header">
        <a className="link" href={vehicle.edit_url} onClick={(e) => e.stopPropagation()}>
          {vehicle.name}
        </a>
        <button
          className="btn transport-btn-icon"
          onClick={(e) => {
            e.stopPropagation();
            onAddClick(vehicle);
          }}
        >
          <IoAddCircle size={32} />
        </button>
      </div>
      <div className="booking-card__body">
        <table className="booking-card__table">
          <tbody>
            {bookings.map((rent, index) => (
              <tr
                key={index}
                onClick={(e) => handleBookingCellClick(rent, e)}
              >
                <BookingCell
                  rent={rent}
                  colSpan={1}
                  rowSpan={1}
                  index={index}
                  rowIndex={index}
                  isContinuous={false}
                  onClick={() => onClick(rent, vehicle)}
                />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BookingCard;
