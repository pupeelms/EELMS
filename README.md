

# Electrical Engineering Laboratory Management System (EELMS)

The Electrical Engineering Laboratory Management System (EELMS) streamlines inventory and material management for the electrical engineering lab at the Polytechnic University of the Philippines. Using barcode technology, it enables accurate tracking and efficient check-in/check-out of materials, reducing reliance on manual processes. EELMS enhances accessibility for students and staff, ensuring resources are available when needed.


## Features

- Borrow and Return System
- Admin Dashboard
- User Management
- Item Management
- Archive Management
- Automated Notifications
- Reports and Analytics
- Feedback System



## Build With

This project was built with the following technologies:

- **MongoDB**
- **Express**
- **React**
- **Node.js**

## Getting Started

Follow these steps to set up and run the Electrical Engineering Laboratory Management System (EELMS) on your local machine for development and testing.

### Prerequisites

Before you begin, make sure you have the following installed:

**Node.js** (v14 or higher) and **npm**  
   - Download from [https://nodejs.org](https://nodejs.org)

**MongoDB Atlas** (for the database)  
   - If you don’t have an account, create a free one at [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas).  
   - Set up a new cluster and get your connection string (URI) for use in the project.

**Cloudinary** (for image uploads)  
   - If you don’t have an account, create a free one at [Cloudinary](https://cloudinary.com/) and get your API key, API secret, and cloud name for integration.

**Barcode Scanner** (optional but recommended)  
   - A barcode scanner to facilitate the inventory check-in/check-out process.

## Installation

Please follow the following steps for successful installation:

1. **Clone the Repository:** Get started by cloning the repository to your local machine. Note that the default branch is **master**.

```bash
git clone https://github.com/ectolitol/EELMS-PROTECTED
```
2. **Install Backend Packages:** Navigate to the **/backend** directory and install the required npm packages by executing the following command in your terminal:
```bash
npm install
```
3. **Install Frontend Packages:** Similarly, navigate to the **/frontend** directory and install the required npm packages by executing the following command in your terminal:
```bash
npm install
```
4. **Configure Environment Variables:**
Create a .env file in the root directory in the **/backend** and add the following environment variables:
```bash
MONGO_URI=<Your MongoDB Atlas Connection URI>
PORT=4000

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=<Your Email SMTP Username>
EMAIL_PASS=<Your Email SMTP Password>
RESEARCHER_EMAIL=<Creators Email>
ADMIN_EMAIL=<Admin Email for notification only>

SESSION_SECRET=<Your Session Secret>
GSMClientIP=<For SMS feature improvement>

CLOUDINARY_SECRET_KEY=<Your Cloudinary Secret Key>
CLOUDINARY_API_KEY=<Your Cloudinary API Key>
CLOUDINARY_CLOUD_NAME=<Your Cloudinary Cloud Name>
```
Customize other variables as needed

5. **Run the Backend:** Navigate to **/backend** directory and type the following command in your terminal to run your backend server:
```bash
npm run dev
```

6. **Run the Frontend:** Finally, navigate to **/frontend** directory and type the following command in your terminal to run your frontend server:
```bash
npm run dev
```
The application should now be running at **http://localhost:3000**   
## Usage

Once you have set up the **Electrical Engineering Laboratory Management System (EELMS)** and started the server, you can interact with the system through the following steps:

### Accessing the Application

1. Open your web browser.
2. Navigate to **`http://localhost:3000`**

### User Workflow Example

#### For Students (Registered Users)

1. **Log In:**
   - Scan your unique QR ID on the welcome screen.

2. **Borrowing an Item:**
   - Enter required user infromation.
   - Scan the items you wish to borrow using the barcode scanner.
   - Confirm the transaction.
   - You will receive an email confirmation of the borrowed items.

3. **Returning an Item:**
   - Scan your QR code to access your borrowed items.
   - Rescan the items you are returning and confirm the return.
   - Complete the transaction.
   - Provide emoticon feedback and scan the survey via qr code.

#### For Admins

1. **Log In:**
   - Access the admin dashboard at **`http://localhost:3000/lab/admin`**.
   - Enter your admin credentials.

- **Admin Dashboard**: A central hub for monitoring inventory statistics, current transactions, and system notifications.

- **User Management**: Manage user accounts by adding new users, approving registrations, updating details, and deactivating accounts.

- **Item Management**: Efficiently manage laboratory inventory by adding, updating, or removing items, each tagged with a unique barcode.

- **Archive Management**: Maintain an archive of past transactions and items for easy retrieval of historical data.

- **Automated Notifications**: Receive alerts about low stock levels, overdue items, and new user approvals to stay informed.

- **Reports and Analytics**: Generate detailed reports on inventory usage and transaction history, tailored for specific time periods.

- **Feedback System**: Admins can send feedback regarding their experience with the system and can also report errors or issues directly to the system creators, ensuring prompt attention and continuous improvement based on user input.


## Contact

If you have any questions or suggestions, we’d love to hear from you! You can reach out to us in the following ways:

- **Raise an issue** on our [GitHub Repository](https://github.com/ectolitol/EELMS-PROTECTED/tree/master) for any bugs or feature requests.
- **Connect with us via email** at [pupeelms@gmail.com](mailto:pupeelms@gmail.com).
