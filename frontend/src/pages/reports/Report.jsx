import React, { useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import "./reports.scss";
import Sidebar from '../../components/sidebar/Sidebar';
import Navbar from '../../components/navbar/Navbar';
import CustomBreadcrumbs from "../../components/breadcrumbs/Breadcrumbs";
import PreventiveMaintenance from "../../components/preventiveMaintenance/PreventiveMaintenance";
import LogChart from "../../components/logChart/LogChart";
import StockChart from "../../components/stockChart/StockChart";
import TopBorrowedChart from "../../components/topBorrowedChart/TopBorrowedChart";
import ReportsList from "../../components/reportList/ReportList";
import ItemConditionChart from "../../components/itemConditionChart/ItemConditionChart";

const Report = () => {
    const [expandedChart, setExpandedChart] = useState(null);

    const handleExpandChart = (chart) => {
        setExpandedChart(chart);
    };

    const closeModal = () => {
        setExpandedChart(null);
    };

    const exportChartToImage = () => {
        // Select only the part of the modal that contains the chart (without buttons)
        const chartElement = document.querySelector(".modal-content-chart");
    
        if (chartElement) {
            html2canvas(chartElement, { scale: 6, useCORS: true }) // Increase scale for better resolution
                .then((canvas) => {
                    const imgData = canvas.toDataURL("image/png"); // Capture as PNG
                    const link = document.createElement("a"); // Create a temporary link element
                    link.href = imgData; // Set the image data as the link's href
                    link.download = `${expandedChart}-chart.png`; // Set the download filename
                    link.click(); // Trigger the download
                })
                .catch((error) => {
                    console.error("Error capturing chart:", error);
                });
        }
    };

    return (
        <div className="report">
            <Sidebar />
            <div className="reportContainer">
                <Navbar />
                <div className="Content">
                    <CustomBreadcrumbs />
                    <div className="charts-container">
                        <div onClick={() => handleExpandChart("LogChart")}>
                            <LogChart />
                        </div>
                        <div onClick={() => handleExpandChart("TopBorrowedChart")}>
                            <TopBorrowedChart />
                        </div>
                        <div onClick={() => handleExpandChart("StockChart")}>
                            <StockChart />
                        </div>
                        {/* <div onClick={() => handleExpandChart("FeedbackChart")}>
                            <FeedbackChart />
                        </div> */}
                        <div onClick={() => handleExpandChart("ItemConditionChart")}>
                            <ItemConditionChart />
                        </div>
                    </div>
                    <div className="reportlist-container">
                        <ReportsList />
                    </div>
                    <div className="pm-table-container">
                        <PreventiveMaintenance />
                    </div>
                </div>
            </div>

            {/* Modal for Expanded Chart */}
            {expandedChart && (
                <div className="modal-chart">
                    <div className="modal-mainContent-chart">
                        <div className="modal-buttons-chart">
                            
                            <button className="close-button-chart" onClick={closeModal}>✕</button>
                            <button className="export-button-chart" onClick={exportChartToImage}>Export to Image</button>
                        </div>
                        <div className="modal-content-chart">
                            {/* Render the selected chart */}
                            {expandedChart === "LogChart" && <LogChart />}
                            {expandedChart === "TopBorrowedChart" && <TopBorrowedChart />}
                            {expandedChart === "StockChart" && <StockChart />}
                            {/* {expandedChart === "FeedbackChart" && <FeedbackChart />} */}
                            {expandedChart === "ItemConditionChart" && <ItemConditionChart />}
                        </div>   
                    </div>
                </div>
            )}
        </div>
    );
};

export default Report;
