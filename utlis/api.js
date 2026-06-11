const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
import AssetHistory from "@/components/dashboard/assets/AssetHistory";
import Cookies from "js-cookie";
import toast from "react-hot-toast";

function handleSessionExpired() {
  Cookies.remove("authToken");
  Cookies.remove("authUser");
  Cookies.remove("rememberMe");
  toast.error("Session expired. Please log in again.");
  window.location.replace("/login");
}

export const API = {
  //Role APIs Start
  getRoles: () => hitAPI("/roles", {}, "GET", "yes"),
  //Role APIs End

  //Auth APIs Start
  login: (data) => hitAPI("/login", data, "POST"),
  forgotPassword: (data) => hitAPI("/forgot-password", data, "POST"),
  resetPassword: (data) => hitAPI("/reset-password", data, "POST"),
  //Auth APIs End

  // Company APIs Start
  createCompany: (data) => hitAPI("/companies", data, "POST", "yes"),
  getCompanies: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return hitAPI(`/companies${query ? `?${query}` : ""}`, {}, "GET", "yes");
  },
  getSingleCompany: (id) => hitAPI(`/companies/${id}`, {}, "GET", "yes"),
  updateCompany: (id, data) => hitAPI(`/companies/${id}`, data, "PUT", "yes"),
  deleteCompany: (id) => hitAPI(`/companies/${id}`, {}, "DELETE", "yes"),
  // Company APIs End

  //Users APIs Start
  createUser: (data) => hitAPI("/users", data, "POST", "yes"),
  getUsers: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return hitAPI(`/users${query ? `?${query}` : ""}`, {}, "GET", "yes");
  },
  getSingleUser: (id) => hitAPI(`/users/${id}`, {}, "GET", "yes"),
  updateUser: (id, data) => hitAPI(`/users/${id}`, data, "PUT", "yes"),
  deleteUser: (id) => hitAPI(`/users/${id}`, {}, "DELETE", "yes"),
  //User APIs End

  // Assets Category APIs Start
  createAssetCategory: (data) =>
    hitAPI("/asset-categories", data, "POST", "yes"),
  getAssetCategories: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return hitAPI(
      `/asset-categories${query ? `?${query}` : ""}`,
      {},
      "GET",
      "yes",
    );
  },
  getSingleAssetCategory: (id) =>
    hitAPI(`/asset-categories/${id}`, {}, "GET", "yes"),
  updateAssetCategory: (id, data) =>
    hitAPI(`/asset-categories/${id}`, data, "PUT", "yes"),
  deleteAssetCategory: (id) =>
    hitAPI(`/asset-categories/${id}`, {}, "DELETE", "yes"),
  // Assets Category APIs End

  // Vendor APIs Start
  createVendor: (data) => hitAPI("/vendors", data, "POST", "yes"),
  getVendors: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return hitAPI(`/vendors${query ? `?${query}` : ""}`, {}, "GET", "yes");
  },
  getSingleVendor: (id) => hitAPI(`/vendors/${id}`, {}, "GET", "yes"),
  updateVendor: (id, data) => hitAPI(`/vendors/${id}`, data, "PUT", "yes"),
  deleteVendor: (id) => hitAPI(`/vendors/${id}`, {}, "DELETE", "yes"),
  // Vendor APIs End

  // Asset Api start
  createAsset: (data) => hitAPI("/assets", data, "POST", "yes"),
  getAssets: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return hitAPI(`/assets${query ? `?${query}` : ""}`, {}, "GET", "yes");
  },
  getSingleAsset: (id) => hitAPI(`/assets/${id}`, {}, "GET", "yes"),
  updateAsset: (id, data) => hitAPI(`/assets/${id}`, data, "PUT", "yes"),
  deleteAsset: (id) => hitAPI(`/assets/${id}`, {}, "DELETE", "yes"),
  assetHistory: (id) => hitAPI(`/asset-history/${id}`, {}, "GET", "yes"),
  assignAsset: (data) => hitAPI(`/assets/assign`, data, "POST", "yes"),

  // Asset Api end

  // profile API Start
  updateProfile: (data) => hitAPI("/profile", data, "PUT", "yes"),
  getProfile: () => hitAPI("/profile", {}, "GET", "yes"),
  // Profile API End

  // Issue APIs Start
  createIssue: (data) => hitAPI("/issue/create", data, "POST", "yes"),
  getIssues: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return hitAPI(`/issues${query ? `?${query}` : ""}`, {}, "GET", "yes");
  },
  updateIssueStatus: (id, data) =>
    hitAPI(`/issues/${id}`, data, "PATCH", "yes"),
  // Issue APIs End

  // return request API Start
  forceReturn: (id, data) =>
    hitAPI(`/asset-force-return/${id}`, data, "PATCH", "yes"),
  returnRequest: (data) =>
    hitAPI(`/assets/return-request`, data, "POST", "yes"),

  getReturnRequestList: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return hitAPI(
      `/return-requests${query ? `?${query}` : ""}`,
      {},
      "GET",
      "yes",
    );
  },
  updateReturnRequestStatus: (id, data) =>
    hitAPI(`/return-requests/${id}`, data, "PATCH", "yes"),

  // return request API End

  // notification api start
  getNotifications: () => hitAPI("/notifications", {}, "GET", "yes"),
  getWarrantyAlerts: () => hitAPI("/notifications/warranty-alerts", {}, "GET", "yes"),
  markNotificationAsRead: (id) => hitAPI(`/notifications/${id}/read`, {}, "PATCH", "yes"),
  markAllNotificationsAsRead: () => hitAPI("/notifications/read-all", {}, "PATCH", "yes"),
  deleteNotification: (id) => hitAPI(`/notifications/${id}`, {}, "DELETE", "yes"),
  // notification api end
};

async function hitAPI(endpoint, data, method, token = null) {
  if (token == "yes") {
    token = Cookies.get("authToken");
  }

  const isFormData = data instanceof FormData;
  const hasBody = method !== "GET" && method !== "HEAD";

  let res;
  try {
    res = await fetch(`${BASE_URL}${endpoint}`, {
      method: method,
      headers: {
        ...(!isFormData && hasBody && { "Content-Type": "application/json" }),
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      ...(hasBody && { body: isFormData ? data : JSON.stringify(data) }),
    });
  } catch (err) {
    // Network-level failure — includes CORS blocked requests and no internet
    const isCors =
      err instanceof TypeError &&
      (err.message === "Failed to fetch" || err.message === "Load failed");

    console.error("[hitAPI] Network/CORS error:", err);

    return {
      success: false,
      message: isCors
        ? "Unable to reach the server. This may be a CORS or network issue."
        : "A network error occurred. Please check your connection.",
    };
  }

  let result;
  try {
    result = await res.json();
  } catch {
    return { success: false, message: "Server returned an invalid response." };
  }

  if (!res.ok) {
    if (result.errors?.code === "SESSION_EXPIRED") {
      handleSessionExpired();
      return { success: false, message: result.message };
    }

    let finalMessage = "Something went wrong";

    if (result.errors) {
      const firstField = Object.values(result.errors)[0];
      finalMessage = firstField || finalMessage;
    } else if (result.message) {
      finalMessage = result.message;
    }

    return { success: false, message: finalMessage };
  }

  return { success: true, message: result };
}

export async function logOut() {
  const token = Cookies.get("authToken");

  const res = await fetch(`${BASE_URL}/logout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  const result = await res.json();

  if (!res.ok) {
    if (result.errors?.code === "SESSION_EXPIRED") {
      handleSessionExpired();
      return { success: false, message: result.message };
    }

    let finalMessage = "Something went wrong";

    if (result.errors) {
      const firstField = Object.keys(result.errors)[0];
      finalMessage = result.errors[firstField][0] || finalMessage;
    } else if (result.message) {
      finalMessage = result.message;
    }

    return { success: false, message: finalMessage };
  }

  return { success: true, message: result };
}
