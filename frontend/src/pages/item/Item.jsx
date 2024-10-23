import "./item.scss";
import Sidebar from '../../components/sidebar/Sidebar';
import Navbar from '../../components/navbar/Navbar';
import ItemTransaction from "../../components/itemTransaction/ItemTransaction";
import SingleItem from "../../components/singleItem/SingleItem";
import { useParams } from "react-router-dom";
import CustomBreadcrumbs from "../../components/breadcrumbs/Breadcrumbs";

const Item = () => {
  const { itemId } = useParams(); // Get the itemId from URL parameters

  return (  
    <div className="item">
      <Sidebar/>
      <div className="itemContainer">
        <Navbar/>
        <div className="Content">
        <CustomBreadcrumbs/>
          <SingleItem itemId={itemId} /> {/* Pass itemId to SingleItem */}
          <div className="bottom">
            <div className="itemTitlee">Item Transaction History</div>
            <ItemTransaction itemBarcode={itemId} /> {/* Pass itemBarcode to ItemTransaction */}
          </div> 
        </div>
        </div>
      </div>
  );
}

export default Item;
