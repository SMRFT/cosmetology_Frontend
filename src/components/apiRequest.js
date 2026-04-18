import axios from "axios";
import { toast } from "react-toastify";

/**
 * Reusable API request helper with token authentication
 * @param {string} url - The API endpoint URL
 * @param {string} method - HTTP method (GET, POST, PUT, PATCH, DELETE)
 * @param {Object|null} data - Request body data for POST/PUT/PATCH/DELETE
 * @param {Object} headers - Additional headers to merge with defaults
 * @param {Object} config - Additional axios configuration (like params)
 * @returns {Promise<Object>} - Returns { success: boolean, data?: any, error?: string, status?: number }
 */
const apiRequest = async (url, method = "GET", data = null, headers = {}, customConfig = {}) => {
  try {
    const token = localStorage.getItem("access_token");
    const branch = localStorage.getItem("selected_branch");

    const defaultHeaders = {
      "Content-Type": "application/json",
      Authorization: token, // Use 'Bearer' if backend expects it
      "Branch-Code": branch,
    };

    const baseUrl = process.env.REACT_APP_BACKEND_COSMETOLOGY_BASE_URL;
    const finalUrl = url.startsWith("http") ? url : `${baseUrl}${url.startsWith("/") ? url.slice(1) : url}`;

    const config = {
      method,
      url: finalUrl,
      headers: { ...defaultHeaders, ...headers },
      validateStatus: () => true, // Don't throw errors for any status code
      ...customConfig,
    };

    if (data && ["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
      config.data = data;
    }

    const response = await axios(config);

    // Success status codes (2xx range)
    if (response.status >= 200 && response.status < 300) {
      return {
        success: true,
        data: response.data,
        status: response.status,
      };
    }
    // Client errors (4xx range)
    else if (response.status >= 400 && response.status < 500) {
      // Extract error message from backend response
      const backendError = response.data?.error || response.data?.message;
      return {
        success: false,
        error: backendError || `Client error (${response.status})`,
        status: response.status,
        data: response.data,
      };
    }
    // Server errors (5xx range)
    else if (response.status >= 500) {
      const backendError = response.data?.error || response.data?.message;
      return {
        success: false,
        error: backendError || "Server error occurred.",
        status: response.status,
        data: response.data,
      };
    }
    // Other unexpected status codes
    else {
      return {
        success: false,
        error: "Unexpected response from server.",
        status: response.status,
        data: response.data,
      };
    }
  } catch (error) {
    console.error("Network or unexpected error:", error);
    return {
      success: false,
      error: "Network error or unexpected issue occurred.",
      networkError: true,
    };
  }
};

export default apiRequest;
