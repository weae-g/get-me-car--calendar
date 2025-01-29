import React, {useState} from "react";
import { useTranslation } from "react-i18next";

interface RentalFormProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  onSubmit: (e: React.FormEvent) => void;
  availableServices: any[];
  haveChanges: boolean;
  errorMessage: string | null;
}

const RentalForm: React.FC<RentalFormProps> = ({
  formData,
  setFormData,
    haveChanges,
  onSubmit,
    availableServices,
    errorMessage,
}) => {
  const { t } = useTranslation();

  const [searchTerm, setSearchTerm] = useState("");
  const [dateError, setDateError] = useState<string | null>(null);

  const filteredServices = availableServices.filter((svc) =>
      svc.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleServiceToggle = (serviceId: number, checked: boolean) => {
    setFormData((prev: any) => {
      const newServices = checked
          ? [...prev.services, serviceId]
          : prev.services.filter((id: number) => id !== serviceId);

      return { ...prev, services: newServices };
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, checked, value } = e.target;
    const updatedFormData = {
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    };

    if (name === "pickupDate" || name === "returnDate") {
      if (new Date(updatedFormData.pickupDate) > new Date(updatedFormData.returnDate)) {
        setDateError(t("error_date"));
      } else {
        setDateError(null);
      }
    }

    setFormData(updatedFormData);
  };

  const handleServiceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      additionalServices: {
        ...prev.additionalServices,
        [name]: checked,
      },
    }));
  };

  return (
      <form onSubmit={onSubmit} className="rental-form">
        <div className="rental-form__row">
          <div className="rental-form__col">
            <label className="rental-form__label">{t("pickup_date")}</label>
            <input
                type="date"
                name="pickupDate"
                value={formData.pickupDate}
                onChange={handleChange}
                className="rental-form__input"
            />
          </div>
          <div className="rental-form__col">
            <label className="rental-form__label">{t("return_date")}</label>
            <input
                type="date"
                name="returnDate"
                value={formData.returnDate}
                onChange={handleChange}
                className="rental-form__input"
            />
          </div>
        </div>

        {dateError && <p className="rental-form__error">{dateError}</p>}

        <div className="rental-form__row">
          <div className="rental-form__col">
            <label className="rental-form__label">{t("pickup_time")}</label>
            <input
                type="time"
                name="pickupTime"
                value={formData.pickupTime}
                onChange={handleChange}
                className="rental-form__input"
            />
          </div>
          <div className="rental-form__col">
            <label className="rental-form__label">{t("return_time")}</label>
            <input
                type="time"
                name="returnTime"
                value={formData.returnTime}
                onChange={handleChange}
                className="rental-form__input"
            />
          </div>
        </div>

        <div className="rental-form__row">
          <div className="rental-form__col">
            <label className="rental-form__label">{t("location")}</label>
            <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="rental-form__input"
            />
          </div>
        </div>

        <div className="rental-form__row">
          <div className="rental-form__col">
            <label className="rental-form__label">{t("country")}</label>
            <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="rental-form__input"
            />
          </div>
          <div className="rental-form__col">
            <label className="rental-form__label">{t("city")}</label>
            <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="rental-form__input"
            />
          </div>
        </div>

        {errorMessage && <p className="rental-form__error">{errorMessage}</p>}

        <div className="rental-form__row">
          <div className="rental-form__col">
            <label className="rental-form__label">{t("client")}</label>
            <input
                type="text"
                name="clientName"
                value={formData.clientName}
                onChange={handleChange}
                className="rental-form__input"
            />
          </div>
        </div>

        <div className="rental-form__row">
          <div className="rental-form__col">
            <label className="rental-form__label">{t("email")}</label>
            <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="rental-form__input"
            />
          </div>
          <div className="rental-form__col">
            <label className="rental-form__label">{t("phone")}</label>
            <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="rental-form__input"
            />
          </div>
        </div>

        <div className="rental-form__row">
          <div className="rental-form__col">
            <label className="rental-form__label rental-form__label--checkbox">
              <input
                  type="checkbox"
                  name="telegram"
                  checked={formData.telegram}
                  onChange={handleChange}
                  className="rental-form__checkbox"
              />
              {t("telegram")}
            </label>
            <label className="rental-form__label rental-form__label--checkbox">
              <input
                  type="checkbox"
                  name="whatsapp"
                  checked={formData.whatsapp}
                  onChange={handleChange}
                  className="rental-form__checkbox"
              />
              {t("whatsapp")}
            </label>
            <label className="rental-form__label rental-form__label--checkbox">
              <input
                  type="checkbox"
                  name="viber"
                  checked={formData.viber}
                  onChange={handleChange}
                  className="rental-form__checkbox"
              />
              {t("viber")}
            </label>
          </div>
          <div className="rental-form__col">
            <input
                type="tel"
                name="additionalPhone"
                value={formData.additionalPhone}
                onChange={handleChange}
                className="rental-form__input"
                placeholder={t("additional_phone")}
            />
          </div>
        </div>

        <div className="rental-form__row">
          <label className="rental-form__label">{t("coefficient")}</label>
          <input
              type="text"
              name="coefficient"
              value={formData.coefficient}
              readOnly
              className="rental-form__input"
              disabled={true}
          />
        </div>

        <div className="rental-form__row">
          <label className="rental-form__label">{t("amount_due")}</label>
          <input
              type="text"
              name="amountDue"
              value={formData.amountDue + " " + formData.currency}
              onChange={(e) => {
                const val = e.target.value;
                const parts = val.trim().split(" ");
                const rawCurrency = parts.pop() || "";
                const rawAmount = parts.join(" ")
                setFormData((prev: any) => ({
                  ...prev,
                  amountDue: rawAmount,
                  currency: rawCurrency,
                }));
              }}
              className="rental-form__input rental-form__input--currency"
          />
        </div>

        <div className="rental-form__row">
          <div className="rental-form__col">
            <label className="rental-form__subtitle">
              {t("additional_services")}
            </label>
            <div className="rental-form__row">
              <input
                  type="text"
                  name="searchService"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="rental-form__input rental-form__input--search"
                  placeholder={t("search")}
              />
            </div>
          </div>
        </div>

        <div className="rental-form__row">
          <div className="rental-form__col">
            {filteredServices.map((svc) => {
              const isChecked = formData.services.includes(svc.id);
              return (
                  <label
                      className="rental-form__label rental-form__label--checkbox"
                      key={svc.id}
                  >
                    <input
                        type="checkbox"
                        className="rental-form__checkbox"
                        checked={isChecked}
                        onChange={(e) => handleServiceToggle(svc.id, e.target.checked)}
                    />
                    {svc.name}
                  </label>
              );
            })}
          </div>
        </div>


        <div className="rental-form__row">
          <button
              type="submit"
              className="btn rental-form__button rental-form__button--save"
              disabled={!haveChanges || !!dateError}
          >
            {t("save")}
          </button>
        </div>
      </form>
  );
};

export default RentalForm;
