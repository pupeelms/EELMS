import { useState } from 'react';
import "./dashboard.scss";
import Sidebar from '../../components/sidebar/Sidebar';
import Navbar from '../../components/navbar/Navbar';
import Widget from "../../components/widget/Widget";
import BorrowReturnTable from "../../components/borrowReturnTable/BorrowReturnTable";
import LogChart from "../../components/logChart/LogChart";
import StockChart from "../../components/stockChart/StockChart";
import CustomBreadcrumbs from '../../components/breadcrumbs/Breadcrumbs';

const Dashboard = () => {
  return (
    <div className="dashboard"> 
      <Sidebar/>
      <div className="dashboardContainer">
        <Navbar/>
        <div className="dashboardContent">
          <CustomBreadcrumbs/> 
          {/* <img src="/blurred-bg.png" alt="Background" className="dashboard-bg" /> */}
          <div className="widgets">
            <Widget type="Total users" />
            <Widget type="Total items" />
            <Widget type="Low stock" />
            <Widget type="Out of stock" />
          </div>
          <div className="listContainer">
            <div className="listTitleBorrow">Borrow/Return Transactions</div>
            <BorrowReturnTable/>
          </div>
        </div> 
      </div>
    </div>
  );
};

export default Dashboard;
