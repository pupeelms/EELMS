import "./stocks.scss"
import Sidebar from '../../components/sidebar/Sidebar';
import Navbar from '../../components/navbar/Navbar';
import ErrorBoundary from '../../components/errorBoundary/ErrorBoundary';
import { ItemTable } from "../../components/itemTable/ItemTable";
import {Link} from "react-router-dom"
import CustomBreadcrumbs from "../../components/breadcrumbs/Breadcrumbs";
import Stocklist from "../../components/stockList/Stocklist";

const Stocks = () => {
  return (
        <div className="stockList">
        <Sidebar/>
        <div className="stockListContainer">
            <Navbar/>
            <div className="stockContent">
                <CustomBreadcrumbs/>
                <div className="stockListTable">
                    <ErrorBoundary>
                        <Stocklist/>
                    </ErrorBoundary>
                </div>   
            </div>
        </div>
    </div>
  )
}

export default Stocks