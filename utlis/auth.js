import Cookies from "js-cookie";

// Set token and user (optionally with expiration)
export const setAuthData = ({ token, user, rememberMe }) => {
    const options = { path: '/' };

    if (rememberMe) {
        options.expires = 30; // 30 day
    } else {
        options.expires = 1; // 1 day
    }

    Cookies.set("authToken", token, options);
    Cookies.set("authUser", JSON.stringify(user), options);
    Cookies.set("rememberMe", rememberMe, options);
};

// Get token
export const getToken = () => {
    return Cookies.get("authToken") || null;
};

// Get user
export const getUser = () => {
    const user = Cookies.get("authUser");
    return user ? JSON.parse(user) : null;
};

// Clear all on logout
export const clearAuthData = () => {
    Cookies.remove("authToken", { path: '/' });
    Cookies.remove("authUser", { path: '/' });
    Cookies.remove("rememberMe", { path: '/' });
};