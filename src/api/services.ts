import Cookies from "js-cookie";
import { validateToken } from "./auth";

export async function fetchServicesByRentId(rentId: number | string) {
    const url = `https://dev2.getmecar.ru/wp-json/listing-api/v1/data?type=services&id=${rentId}`;

    const token = Cookies.get("authToken");

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

    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${token || ""}`,
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch services for rentId=${rentId}. Status: ${response.status}`);
    }

    const data = await response.json();
    return data;
}
