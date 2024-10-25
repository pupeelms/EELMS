import axios from "axios";

// Set the base URL dynamically based on the environment
axios.defaults.baseURL =
  window.location.hostname === "localhost"
    ? "https://eelms-api.onrender.com/" // Development (local)
    : "https://eelms-api.onrender.com/"; // Production (use the same base URL)

axios.defaults.withCredentials = true; // Ensure credentials (cookies, auth headers) are sent with each request if necessary

export const imageBaseURL =
  window.location.hostname === "localhost"
    ? "https://eelms-api.onrender.com" // Development (local)
    : "https://eelms-api.onrender.com"; // Production (same image base URL)

export default axios;

// import axios from "axios";

// // Set the base URL dynamically based on the environment
// axios.defaults.baseURL =
//   window.location.hostname === "localhost"
//     ? "http://localhost:4000/" // Development (local)
//     : "http://localhost:4000/"; // Production (use the same base URL)

// axios.defaults.withCredentials = true; // Ensure credentials (cookies, auth headers) are sent with each request if necessary

// export const imageBaseURL =
//   window.location.hostname === "localhost"
//     ? "http://localhost:4000" // Development (local)
//     : "http://localhost:4000"; // Production (same image base URL)

// export default axios;


// import axios from "axios";

// // Set the base URL dynamically based on the environment
// axios.defaults.baseURL =
//   window.location.hostname === "localhost"
//     ? "https://api.pupeelms.com/" // Development (local)
//     : "https://api.pupeelms.com/"; // Production (use the same base URL)

// axios.defaults.withCredentials = true; // Ensure credentials (cookies, auth headers) are sent with each request if necessary

// export const imageBaseURL =
//   window.location.hostname === "localhost"
//     ? "https://api.pupeelms.com" // Development (local)
//     : "https://api.pupeelms.com"; // Production (same image base URL)

// export default axios;
