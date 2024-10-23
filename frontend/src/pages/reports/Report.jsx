import "./reports.scss";
import Sidebar from '../../components/sidebar/Sidebar';
import Navbar from '../../components/navbar/Navbar';
import React from 'react';
import CustomBreadcrumbs from "../../components/breadcrumbs/Breadcrumbs";
import PreventiveMaintenance from "../../components/preventiveMaintenance/PreventiveMaintenance";
import LogChart from "../../components/logChart/LogChart";
import StockChart from "../../components/stockChart/StockChart";
import TopBorrowedChart from "../../components/topBorrowedChart/TopBorrowedChart";
import ReportsList from "../../components/reportList/ReportList";

const Report = () => {
    return (
        <div className="report">
            <Sidebar/>
            <div className="reportContainer">
                <Navbar/>
                <div className="Content">
                    <CustomBreadcrumbs/>
                    <div className="charts-container"> {/* This is the container for your charts */}
                        <LogChart/>
                        <TopBorrowedChart/>
                        <StockChart/>
                    </div>
                    <div className="reportlist-container">
                        <ReportsList/>
                    </div>
                    <div className="pm-table-container">
                        <PreventiveMaintenance/>
                    </div>
                </div>
            </div> 
        </div>
    );
};

export default Report;
