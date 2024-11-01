import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './layouts/Layout';
import Dashboard from './pages/dashboard/Dashboard';
import Login from './pages/login/Login';
import UserList from './pages/userList/UserList';
import User from './pages/user/User';
import NewUser from './pages/newUser/NewUser';
import ItemList from './pages/itemList/ItemList';
import Item from './pages/item/Item';
import NewItem from './pages/newItem/NewItem';
import CategoryList from './pages/categoryList/CategoryList';
import Category from './pages/category/Category';
import NewCategory from './pages/newCategory/NewCategory';
import Notification from './pages/notification/Notification';
import Feedback from './pages/feedback/Feedback';
import SelectAdmin from './pages/selectAdmin/SelectAdmin';
import './config/axiosConfig';
import UserSelection from './pages/userPanel/userSelection/UserSelection';
import NewUserInstruction from './pages/userPanel/newUserInstruction/newUserInstruction';
import BorrowReturnSelection from './pages/userPanel/borrowReturnSelection/BorrowReturnSelection';
import QRIDScan from './pages/userPanel/QRIDScan/QRIDScan';
import BorrowingProcess from './pages/userPanel/borrowingProcess/BorrowingProcess';
import ItemScan from './components/itemScan/ItemScan';
import BorrowSuccess from './components/borrowSuccess/BorrowSuccess';
import ReturningProcess from './pages/userPanel/returningProcess/returningProcess';
import ItemReturnScan from './components/itemReturnScan/ItemReturnScan';
import ReturnSuccess from './components/returnSuccess/ReturnSuccess';
import ReturnPartial from './components/returnPartial/ReturnPartial';
import ReportForm from './components/reportForm/ReportForm';
import NewUserRegistrationForm from './pages/userPanel/newUserRegistrationForm/NewUserRegistrationForm';
import Report from './pages/reports/Report';
import Archives from './pages/archives/Archives';
import About from './pages/about/About';
import Stocks from './pages/stocks/Stocks';
import UserWelcome from './pages/userWelcome/UserWelcome';
import AdminWelcome from './pages/adminWelcome/AdminWelcome';
import ProtectedRoute from './components/ProtectedRoute'; // Importing ProtectedRoute
import AboutUs from './pages/aboutUs/AboutUs';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<UserWelcome />} />
          <Route path="/lab/admin" element={<AdminWelcome />} />
          <Route path="/aboutUs" element={<AboutUs />} />
          <Route path="/report" element={<ReportForm />} />
          <Route path="/login" element={<Login />} />
          <Route path="/select-profile" element={<SelectAdmin />} />

          {/* User Routes */}
          <Route path="/user-selection" element={<UserSelection />} />
          <Route path="/registration" element={<NewUserInstruction />} />
          <Route path="/new-user-registration" element={<NewUserRegistrationForm />} />
          <Route path="/scan-qr-id" element={<QRIDScan />} />
          <Route path="/borrow-return-selection" element={<BorrowReturnSelection />} />
          <Route path="/borrowing" element={<BorrowingProcess />} />
          <Route path="/item-scan" element={<ItemScan />} />
          <Route path="/borrow-success" element={<BorrowSuccess />} />
          <Route path="/returning" element={<ReturningProcess />} />
          <Route path="/item-return-scan/:transactionId" element={<ItemReturnScan />} />
          <Route path="/return-success" element={<ReturnSuccess />} />
          <Route path="/return-partial" element={<ReturnPartial />} />

          {/* Protected Admin Routes */}
          <Route
            path="/EELMS"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <UserList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users/:userId"
            element={
              <ProtectedRoute>
                <User />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users/newUser"
            element={
              <ProtectedRoute>
                <NewUser />
              </ProtectedRoute>
            }
          />
          <Route
            path="/items"
            element={
              <ProtectedRoute>
                <ItemList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/items/:itemId"
            element={
              <ProtectedRoute>
                <Item />
              </ProtectedRoute>
            }
          />
          <Route
            path="/items/newItem"
            element={
              <ProtectedRoute>
                <NewItem />
              </ProtectedRoute>
            }
          />
          <Route
            path="/items/stocks"
            element={
              <ProtectedRoute>
                <Stocks />
              </ProtectedRoute>
            }
          />
          <Route
            path="/categories"
            element={
              <ProtectedRoute>
                <CategoryList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/categories/:categoryId"
            element={
              <ProtectedRoute>
                <Category />
              </ProtectedRoute>
            }
          />
          <Route
            path="/categories/newCategory"
            element={
              <ProtectedRoute>
                <NewCategory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Notification />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <Report />
              </ProtectedRoute>
            }
          />
          <Route
            path="/archives"
            element={
              <ProtectedRoute>
                <Archives />
              </ProtectedRoute>
            }
          />
          <Route
            path="/feedback"
            element={
              <ProtectedRoute>
                <Feedback />
              </ProtectedRoute>
            }
          />
          <Route
            path="/about"
            element={
              <ProtectedRoute>
                <About />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
