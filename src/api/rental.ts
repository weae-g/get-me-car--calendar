import {validateToken} from "./auth.ts";
import Cookies from "js-cookie";

interface RentPayload {
    vehical_id?: number;
    rent_id?: number;
    start_date: string;
    end_date: string;
    country: string;
    city: string;
    client_name: string;
    email: string;
    tel: string;
    tel_2?: string;
    socials: Array<{ Telegram: boolean; Whatsapp: boolean; Viber: boolean }>;
    payment_koeff: number;
    payable: number;
    currency: string;
    services: any[];
}

export const createOrUpdateRent = async (payload: RentPayload, token: string | undefined) => {
    try {
        if (token) {
            const isTokenValid = await validateToken(token);
            if (!isTokenValid) {
                console.warn("Токен недействителен. Удаляем из cookies.");
                Cookies.remove("authToken");
                throw new Error("Токен недействителен. Пожалуйста, войдите снова.");
            }
        } else {
            throw new Error("Токен не предоставлен. Пожалуйста, войдите.");
        }

        const method = payload.rent_id ? "PUT" : "POST";
        const response = await fetch("https://dev2.getmecar.ru/wp-json/listing-api/v1/data", {
            method,
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ new_rent: payload }),
        });

        if (response.ok) {
            const contentType = response.headers.get("Content-Type");
            if (contentType && contentType.includes("application/json")) {
                try {
                    const data = await response.json();
                    return data;
                } catch (error) {
                    return { success: true };
                }
            } else {
                return { success: true };
            }
        } else {
            const contentType = response.headers.get("Content-Type");
            if (contentType && contentType.includes("application/json")) {
                const errorDetails = await response.json();
                // console.error("Ошибка сервера (JSON):", errorDetails);
                throw new Error(errorDetails.message || `Ошибка: ${response.status}`);
            } else {
                const errorText = await response.text();
                // console.error("Ошибка сервера (текст):", errorText);
                throw new Error(`Ошибка: ${response.status} - ${errorText}`);
            }
        }
    } catch (error) {
        // console.error("Ошибка при выполнении запроса:", error);
        throw error;
    }
};

