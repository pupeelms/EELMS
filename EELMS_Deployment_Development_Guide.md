
# 🚀 EELMS Deployment & Development Guide  

This guide explains how to **run the system in development mode** for testing before deployment and how to **deploy changes** to production.  

---

## **💻 1. Running the System in Development Mode**  

If you want to **test changes locally** before deploying, follow these steps.  

### **🔹 Step 1: Modify Backend Settings**  
1️⃣ **Go to** `/backend/app.js`  
2️⃣ **Update the following values:**  

✅ **Change `secure` to `false`**  
```js
secure: false,
```  
✅ **Change `sameSite` to `lax`**  
```js
sameSite: "lax",
```  

### **🔹 Step 2: Modify Frontend Axios Configuration**  
1️⃣ **Go to** `/frontend/src/config/axiosConfig.jsx`  
2️⃣ **Comment out production settings** *(Highlight & press `Ctrl + /`)*:  
```js
// import axios from "axios";

// // Set the base URL dynamically based on the environment
// axios.defaults.baseURL =
//   window.location.hostname === "localhost"
//     ? "https://eelms-api.onrender.com/" // Development (local)
//     : "https://eelms-api.onrender.com/"; // Production (use the same base URL)

// axios.defaults.withCredentials = true; // Ensure credentials (cookies, auth headers) are sent with each request if necessary

// export const imageBaseURL =
//   window.location.hostname === "localhost"
//     ? "https://eelms-api.onrender.com" // Development (local)
//     : "https://eelms-api.onrender.com"; // Production (same image base URL)

// export default axios;
```  

3️⃣ **Uncomment development settings** *(Highlight & press `Ctrl + /`)*:  
```js
import axios from "axios";

// Set the base URL dynamically based on the environment
axios.defaults.baseURL =
  window.location.hostname === "localhost"
    ? "http://localhost:4000/" // Development (local)
    : "http://localhost:4000/"; // Production (use the same base URL)

axios.defaults.withCredentials = true; // Ensure credentials (cookies, auth headers) are sent with each request if necessary

export const imageBaseURL =
  window.location.hostname === "localhost"
    ? "http://localhost:4000" // Development (local)
    : "http://localhost:4000"; // Production (same image base URL)

export default axios;
```  

### **🔹 Step 3: Run the Backend Locally**  
1️⃣ Open a new terminal in **VS Code**  
2️⃣ Navigate to the backend folder:  
```sh
cd backend
```  
3️⃣ Start the backend server:  
```sh
npm run dev
```  
✅ The backend will now run on **http://localhost:4000**.  

### **🔹 Step 4: Run the Frontend Locally**  
1️⃣ Open another **new terminal** in **VS Code**  
2️⃣ Navigate to the frontend folder:  
```sh
cd frontend
```  
3️⃣ Start the frontend server:  
```sh
npm run dev
```  
✅ The frontend will now run at **http://localhost:3000**. Open this in your browser.  

---

## **🌍 2. Redeploying the Website (Production Mode)**  

If you make changes and need to **redeploy the website**, follow these steps:  

### **🔹 Step 1: Track Changes in VS Code**  
1️⃣ Open **VS Code** and go to **Source Control** (left sidebar).  
2️⃣ It will display the modified files. Review the changes before committing.  

### **🔹 Step 2: Modify Backend Settings (if needed)**  
1️⃣ **Go to** `/backend/app.js`  
2️⃣ **Update the following values:**  

✅ **Change `secure` to `true`**  
```js
secure: true,
```  
✅ **Change `sameSite` to `none`**  
```js
sameSite: "none",
```  

### **🔹 Step 3: Modify Frontend Axios Configuration**  
1️⃣ **Go to** `/frontend/src/config/axiosConfig.jsx`  
2️⃣ **Uncomment the production settings** *(Highlight & press `Ctrl + /` to uncomment)*:  
```js
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
```  
### **🔹 Step 4: Build & Deploy Frontend (if applicable)**  
If you made **frontend changes**, run:  
```sh
cd frontend
npm run build
```  

### **🔹 Step 5: Commit & Sync Changes to GitHub**  
1️⃣ **Go to Source Control in VS Code**  
2️⃣ **Enter a short commit message** (e.g., `"Updated axios config for production"`).  
3️⃣ **Click `"Commit"` and then `"Sync Changes"`** to push updates to GitHub.  
   - **Render will automatically redeploy the latest changes.**  


Then, commit and sync the changes to trigger redeployment.  

✅ **Now, your website is updated and deployed!** 🚀  

---

## **🎯 Summary**  

### **For Local Development:**  
1️⃣ **Modify settings for development (`secure: false`, `sameSite: "lax"`)**  
2️⃣ **Ensure development axios settings are enabled**  
3️⃣ **Run `npm run dev` in the backend (`localhost:4000`)**  
4️⃣ **Run `npm run dev` in the frontend (`localhost:3000`)**  

### **For Production Deployment:**  
1️⃣ **Modify settings for production (`secure: true`, `sameSite: "none"`)**  
2️⃣ **Ensure production axios settings are enabled**  
3️⃣ **Commit & Sync Changes to GitHub**  
4️⃣ **Render will automatically redeploy**  
5️⃣ **Run `npm run build` if frontend is changed**  

Now you can **switch between development and production easily**! 🚀  
```
