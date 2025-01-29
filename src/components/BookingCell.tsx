import React from "react";
import { oddRowColors, evenRowColors } from "../utils/colorUtils";

const getRentStyle = (rent: any, rowIndex: number, index: number): any => {
  const isEvenRow = rowIndex % 2 === 0;

  const bgColors = isEvenRow
    ? evenRowColors[rent.status] || evenRowColors["rent"]
    : oddRowColors[rent.status] || oddRowColors["rent"];

  const color = isEvenRow ? '#000' : '#fff';

  const shadeIndex = index % bgColors.length;
  const selectedColor = bgColors[shadeIndex];

  return {
    background: selectedColor,
    color: color,
  };
};

interface BookingCellProps {
  rent: any | null;
  colSpan: number;
  rowSpan: number;
  index: number;
  rowIndex: number;
  isStart?: boolean;
  isEnd?: boolean;
  isContinuous?: boolean;
  onClick: () => void;
}

const BookingCell: React.FC<BookingCellProps> = ({
  rent,
  colSpan,
  rowSpan,
  index,
  rowIndex,
  isStart,
  isEnd,
  isContinuous,
  onClick,
}) => {
  const style = rent ? getRentStyle(rent, rowIndex, index) : {};

  const rentRange = rent
    ? `${new Date(rent.start_date)
        .toLocaleDateString("ru-RU")
        .substring(0, 5)} - ${new Date(rent.end_date)
        .toLocaleDateString("ru-RU")
        .substring(0, 5)}`
    : "";

  return (
    <td
      onClick={onClick}
      className="booking-cell"
      style={style}
      colSpan={colSpan}
      rowSpan={rowSpan}
    >
      {isContinuous && (
        <div
          className="is-continuous"
          style={{ backgroundColor: style.background }}
        />
      )}
      <div className="content">{rentRange}</div>
    </td>
  );
};

export default BookingCell;
