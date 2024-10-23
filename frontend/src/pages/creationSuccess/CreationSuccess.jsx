import "./creationSuccess.scss"
import Sidebar from '../../components/sidebar/Sidebar';
import Navbar from '../../components/navbar/Navbar';
import PageTitle from '../../components/pageTitle/PageTitle';
import CreateSuccess from "../../components/createSuccess/CreateSuccess";
import CustomBreadcrumbs from "../../components/breadcrumbs/Breadcrumbs";

const CreationSuccess = () => {
  return (
    <div className="success">
      <Sidebar/>
      <div className="successContainer">
        <Navbar/>
          <CustomBreadcrumbs/>
            <CreateSuccess/>
      </div>
    </div>
  )
}
 
export default CreationSuccess