import "./category.scss"
import Sidebar from '../../components/sidebar/Sidebar';
import Navbar from '../../components/navbar/Navbar';
import CategoryItems from "../../components/categoryItems/CategoryItems";
import CustomBreadcrumbs from "../../components/breadcrumbs/Breadcrumbs";

const Category = () => {
  return (
    <div className="category">
      <Sidebar/>
        <div className="categoryContainer">
          <Navbar/> 
          <div className="Content">
            <CustomBreadcrumbs/>
                <div className="categoryItemContainer">
                  <div className="categoryTitle">List of Items found in this Category</div>
                    <CategoryItems/>
                </div>
            </div>
        </div>
    </div>
  )
}

export default Category