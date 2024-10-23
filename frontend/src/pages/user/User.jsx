import "./user.scss"
import Sidebar from '../../components/sidebar/Sidebar';
import Navbar from '../../components/navbar/Navbar';
import SingleUser from '../../components/singleUser/SingleUser';
import SingleTransaction from '../../components/singleTransaction/SingleTransaction';
import CustomBreadcrumbs from "../../components/breadcrumbs/Breadcrumbs";
 
const User = () => {
  return (
    <div className="user">
      {/* <img src="/blurred-bg.png" alt="Background" className="uuserr-bg" /> */}
      <Sidebar/>
      <div className="userContainer">
        <Navbar/> 
        <div className="userContent">
        <CustomBreadcrumbs/>
            <SingleUser/>
          <div className="bottom">
            <div className="userTitle">User Transactions</div>
            <SingleTransaction/>
          </div> 
        
        </div>
      </div>
    </div>
  )
} 

export default User 