import React, { useEffect, useState, useMemo } from "react";
import RentalForm from "./RentalForm";
import { useTranslation } from "react-i18next";
import { createOrUpdateRent } from "../api/rental";
import Cookies from "js-cookie";
import { fetchServicesByRentId } from "../api/services.ts";

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

interface RentalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
  rent: RentType;
  vehicle: {
    id: number;
    name: string;
    type: string;
    class: string;
    brand: string;
    model: string;
    engine_type: string;
    edit_url: string;
  } | null;
  updateLocalRent: (vehicleId: number, updatedRent: RentType) => void;
  addLocalRent: (vehicleId: number, newRent: RentType) => void;
}

const RentalModal: React.FC<RentalModalProps> = ({
                                                   isOpen,
                                                   onClose,
                                                   rent,
                                                   vehicle,
                                                   onUpdate,
                                                   updateLocalRent,
                                                   addLocalRent,
                                                 }) => {
  const { t } = useTranslation();

  const isEdit = Boolean(rent?.id);

  const [initialFormData] = useState(() => {
    const firstSocial: { Telegram?: boolean; Whatsapp?: boolean; Viber?: boolean } =
        rent.socials && rent.socials.length > 0 ? rent.socials[0] : { Telegram: false, Whatsapp: false, Viber: false };
    return {
      pickupDate: rent.start_date
          ? new Date(rent.start_date).toISOString().split("T")[0]
          : "",
      returnDate: rent.end_date
          ? new Date(rent.end_date).toISOString().split("T")[0]
          : "",
      pickupTime: rent.start_date
          ? new Date(rent.start_date).toISOString().split("T")[1].slice(0, 5)
          : "00:00",
      returnTime: rent.end_date
          ? new Date(rent.end_date).toISOString().split("T")[1].slice(0, 5)
          : "00:00",
      location: rent.city || "",
      country: rent.country || "",
      city: rent.city || "",
      clientName: rent.client_name || "",
      email: rent.email || "",
      phone: rent.tel || "",
      additionalPhone: rent.tel_2 || "",
      telegram: firstSocial.Telegram || false,
      whatsapp: firstSocial.Whatsapp || false,
      viber: firstSocial.Viber || false,
      coefficient:
          typeof rent.payment_koeff === "number"
              ? rent.payment_koeff.toFixed(2)
              : "0",
      amountDue:
          typeof rent.payable === "number" ? rent.payable.toFixed(2) : "0",
      currency: rent.currency || "",
      services: rent.services || [],
      additionalServices: {
        driver: false,
        transfer: false,
        childSeat: false,
        bluetoothHeadset: false,
      },
    };
  });

  const [formData, setFormData] = useState(initialFormData);
  const [availableServices, setAvailableServices] = useState<any[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && vehicle?.id) {
      loadServices(vehicle.id);
    }
  }, [isOpen, vehicle?.id]);

  const loadServices = async (vehicleID: number) => {
    try {
      const data = await fetchServicesByRentId(vehicleID);
      if (data?.services) {
        setAvailableServices(data.services);
      }
    } catch (err) {
      // console.error("Ошибка при загрузке сервисов:", err);
    }
  };

  const haveChanges = useMemo(() => {
    return JSON.stringify(initialFormData) !== JSON.stringify(formData);
  }, [initialFormData, formData]);

  const onModalClose = () => {
    if (!haveChanges) {
      onClose();
      return;
    }
    setShowConfirm(true);
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      if (!haveChanges) {
        onClose();
      } else {
        setShowConfirm(true);
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (!haveChanges) {
          onClose();
        } else {
          setShowConfirm(true);
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [haveChanges, onClose]);

  if (!isOpen && !showConfirm) return null;
  const handleSubmit = async () => {
    const payload = {
      vehical_id: Number(vehicle?.id),
      rent_id: isEdit ? Number(rent.id) : undefined,
      start_date: `${formData.pickupDate}T${formData.pickupTime}:00`,
      end_date: `${formData.returnDate}T${formData.returnTime}:00`,
      country: formData.country,
      city: formData.city,
      client_name: formData.clientName,
      email: formData.email,
      tel: formData.phone,
      tel_2: formData.additionalPhone,
      socials: [
        {
          Telegram: formData.telegram,
          Whatsapp: formData.whatsapp,
          Viber: formData.viber,
        },
      ],
      payment_koeff: parseFloat(formData.coefficient),
      payable: parseFloat(formData.amountDue),
      currency: formData.currency,
      services: formData.services,
    };

    try {
      const token = Cookies.get("authToken");
      const result = await createOrUpdateRent(payload, token);

      if (result) {
        setErrorMessage(null);

        const updatedRent = {
          ...rent,
          ...payload,
          id: result.id || rent.id, // Если сервер вернёт ID для новой аренды
        };

        if (isEdit) {
          updateLocalRent(Number(vehicle?.id), updatedRent);
        } else {
          addLocalRent(Number(vehicle?.id), updatedRent);
        }

        onClose();
      }
    } catch (error) {
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        if (errorMessage === "city not found") {
          setErrorMessage(t("error_city_not_found"));
        } else if (errorMessage === "country not found") {
          setErrorMessage(t("error_country_not_found"));
        } else if (errorMessage === "there is no country") {
          setErrorMessage(t("there_is_no_country"));
        } else if (errorMessage === "there is no city") {
          setErrorMessage(t("there_is_no_city"));
        }else {
          // console.error("Пропускаемая ошибка:", error.message);
          setErrorMessage(null);
        }
      } else {
        // console.error("Неизвестная ошибка:", error);
      }
    }
  };

  const handleConfirmClose = (action: "save" | "discard" | "cancel") => {
    if (action === "save") {
      handleSubmit();
    } else if (action === "discard") {
      onClose();
    } else if (action === "cancel") {
      setShowConfirm(false);
    }
  };

  if (!isOpen) return null;

  return (
      <div
          className={`modal-overlay ${isOpen ? "modal-overlay--open" : ""}`}
          onClick={handleOverlayClick}
      >
        <div className="modal">
          <div className="modal__header">
            <h2 className="modal__title">{t("rentalModal.title")}</h2>
            {vehicle ? (
                <h3 className="modal__subtitle">{vehicle.name}</h3>
            ) : (
                <h3 className="modal__subtitle">
                  {t("rentalModal.noVehicleInfo")}
                </h3>
            )}
            <button onClick={onModalClose} className="modal__close-button">
              &times;
            </button>
          </div>

          <RentalForm
              formData={formData}
              setFormData={setFormData}
              haveChanges={haveChanges}
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
              availableServices={availableServices}
              errorMessage={errorMessage}
          />
        </div>

        {showConfirm && (
            <div className="confirm-overlay">
              <div className="confirm-modal">
                <h3 className="confirm-modal__title">
                  {t("confirmModal.unsavedChangesTitle")}
                </h3>
                <p className="confirm-modal__text">
                  {t("confirmModal.unsavedChangesText")}
                </p>
                <button
                    className="btn confirm-modal__button confirm-modal__button--save"
                    onClick={() => handleConfirmClose("save")}
                >
                  {t("confirmModal.save")}
                </button>
                <button
                    className="btn confirm-modal__button confirm-modal__button--discard"
                    onClick={() => handleConfirmClose("discard")}
                >
                  {t("confirmModal.discard")}
                </button>
                <button
                    className="btn confirm-modal__button confirm-modal__button--cancel"
                    onClick={() => handleConfirmClose("cancel")}
                >
                  {t("confirmModal.cancel")}
                </button>
              </div>
            </div>
        )}
      </div>
  );
};

export default RentalModal;
