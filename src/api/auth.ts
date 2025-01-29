export const getToken = async (username: string, password: string): Promise<string> => {
    const response = await fetch(
        `https://dev2.getmecar.ru/wp-json/jwt-auth/v1/token`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, password }),
        }
    );

    if (!response.ok) {
        throw new Error(`Failed to obtain token: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.data.token) {
        throw new Error("No token returned from the server");
    }

    return data.data.token;
};

export const validateToken = async (token: string): Promise<boolean> => {
    const response = await fetch(
        "https://dev2.getmecar.ru/wp-json/jwt-auth/v1/token/validate",
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    if (!response.ok) {
        return false;
    }

    const data = await response.json();
    return data.success || false;
};
