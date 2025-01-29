import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { IoLanguage } from 'react-icons/io5';
import Cookies from 'js-cookie';

const LanguageSwitcher = () => {
    const { i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const savedLanguage = Cookies.get('language');
        if (savedLanguage) {
            i18n.changeLanguage(savedLanguage);
        }
    }, [i18n]);

    const currentLanguage = i18n.language.split("-")[0]; // Берём только "en" или "ru"

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng).then(() => {
            Cookies.set('language', lng, { expires: 365 });
            setIsOpen(false);
        });
    };

    return (
        <div className="language-switcher">
            <button
                className="language-button"
                onClick={() => setIsOpen(!isOpen)}
            >
                <IoLanguage size={24} />
            </button>
            {isOpen && (
                <div className="language-dropdown">
                    <button
                        className={currentLanguage === "en" ? "dropdown-item active" : "dropdown-item"}
                        onClick={() => changeLanguage("en")}
                    >
                        En
                    </button>
                    <button
                        className={currentLanguage === "ru" ? "dropdown-item active" : "dropdown-item"}
                        onClick={() => changeLanguage("ru")}
                    >
                        Ru
                    </button>
                </div>
            )}
        </div>
    );
};

export default LanguageSwitcher;
