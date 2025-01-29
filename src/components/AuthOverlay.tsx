import React, { useState } from "react";
import { getToken } from "../api/auth";
import Cookies from "js-cookie";
import LanguageSwitcher from "./LanguageSwitcher.tsx";
import { useTranslation } from "react-i18next";

interface AuthOverlayProps {
    onLogin: (token: string) => void;
}

const AuthOverlay: React.FC<AuthOverlayProps> = ({ onLogin }) => {
    const { t } = useTranslation();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async () => {
        try {
            const token = await getToken(username, password);
            onLogin(token);
            Cookies.set("authToken", token, { expires: 1 / 24 });
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="auth-overlay">
            <div className="auth-modal">
                <div className="auth-header">
                    <h2>{t("login")}</h2>
                    <LanguageSwitcher />
                </div>
                {error && <p className="error">Ошибка авторизации</p>}
                <input
                    type="text"
                    className="auth-input"
                    placeholder={t("username")}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <div className="password-container">
                    <input
                        type="password"
                        className="auth-input"
                        placeholder={t("password")}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <p className="auth-forgot-password">
                        <a href="https://getmecar.ru/registration/">{t("forgot_password")}</a>
                    </p>
                </div>
                <button className="auth-button" onClick={handleLogin}>
                    {t("login_button")}
                </button>
                <p className="auth-redirect">
                    <a href="https://getmecar.ru/">{t("redirect_text")}</a>
                </p>
            </div>
        </div>
    );
};

export default AuthOverlay;
