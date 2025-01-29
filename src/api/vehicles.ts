import Cookies from "js-cookie";
import { validateToken } from "./auth"; // Убедитесь, что путь к validateToken указан правильно

export const fetchVehicles = async (
    token: string,
    startDate?: string,
    endDate?: string
): Promise<any> => {
    // Проверка токена
    if (token) {
        const isTokenValid = await validateToken(token);
        if (!isTokenValid) {
            console.warn("Token is invalid. Removing from cookies.");
            Cookies.remove("authToken");
            throw new Error("Token is invalid. Please log in again.");
        }
    } else {
        throw new Error("No token provided. Please log in.");
    }

    const url = new URL("https://dev2.getmecar.ru/wp-json/listing-api/v1/data");
    url.searchParams.append("type", "listings");

    if (startDate) url.searchParams.append("start", startDate);
    if (endDate) url.searchParams.append("end", endDate);

    const response = await fetch(url.toString(), {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch vehicles: ${response.statusText}`);
    }

    return response.json();
};
