import "./newItem.scss"
import Sidebar from '../../components/sidebar/Sidebar';
import Navbar from '../../components/navbar/Navbar';
import PageTitle from '../../components/pageTitle/PageTitle';
import ItemRegistration from "../../components/itemRegistration/ItemRegistration";
import CustomBreadcrumbs from "../../components/breadcrumbs/Breadcrumbs";

const NewItem = () => {
  return (
    <div className="newItem">
      <Sidebar/>
      <div className="newItemContainer">
        <Navbar/>
        <div className="Content">
        <CustomBreadcrumbs/>
            <ItemRegistration/>
        </div>
      
      </div>
    </div>
  )
} 

export default NewItem 