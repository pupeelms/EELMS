import "./feedback.scss"
import Sidebar from '../../components/sidebar/Sidebar';
import Navbar from '../../components/navbar/Navbar';
import FeedbackForm from "../../components/feedbackForm/FeedbackForm";
import CustomBreadcrumbs from "../../components/breadcrumbs/Breadcrumbs";

const Feedback = () => {
  return (
    <div className="feedback">
      <Sidebar/>
        <div className="feedbackContainer">
          <Navbar/>
          <div className="Content">
            <CustomBreadcrumbs/>
                <FeedbackForm/> 
            </div>
        </div>
    </div>
  )
}

export default Feedback