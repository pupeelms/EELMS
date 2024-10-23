import "./newCategory.scss"
import Sidebar from '../../components/sidebar/Sidebar';
import Navbar from '../../components/navbar/Navbar';
import CategoryRegistration from "../../components/categoryRegistration/CategoryRegistration";
import CustomBreadcrumbs from "../../components/breadcrumbs/Breadcrumbs";

const NewCategory = () => {
  return (
    <div className="newCategory">
      <Sidebar/>
        <div className="newCategoryContainer">
          <Navbar/>
          <div className="Content">
           <CustomBreadcrumbs/>
                <CategoryRegistration/>
            </div>
        </div>
    </div>
  )
}

export default NewCategory