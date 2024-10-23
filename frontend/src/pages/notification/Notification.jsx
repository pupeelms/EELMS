import "./notification.scss"
import Sidebar from '../../components/sidebar/Sidebar';
import Navbar from '../../components/navbar/Navbar';
import NotificationList from "../../components/notifacationList/NotificationList";
import CustomBreadcrumbs from "../../components/breadcrumbs/Breadcrumbs";

const Notification = () => {
  return (
    <div className="notification">
      <Sidebar/>
      <div className="notificationContainer">
            <Navbar/>
            <div className="Content">
            <CustomBreadcrumbs/>
                <div className="notifList">
                  <div className="notifTitle">
                    Notifications
                  </div>
                  <NotificationList/>
                </div>
            </div>
        </div>
    </div>
  )
}

export default Notification