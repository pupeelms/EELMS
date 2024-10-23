import "./registrationSuccess.scss"
import Sidebar from '../../components/sidebar/Sidebar';
import Navbar from '../../components/navbar/Navbar';
import RegiSuccess from "../../components/regiSuccess/RegiSuccess";
import CustomBreadcrumbs from "../../components/breadcrumbs/Breadcrumbs";

const RegistrationSuccess = () => {
  return (
    <div className="success">
      <Sidebar/>
      <div className="successContainer">
        <Navbar/>
        <div className="Content">
        <CustomBreadcrumbs/>
            <RegiSuccess/>
        </div>
      </div>
    </div>
  )
}
 
export default RegistrationSuccess