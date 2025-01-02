import "./feedback.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import FeedbackForm from "../../components/feedbackForm/FeedbackForm";
import CustomBreadcrumbs from "../../components/breadcrumbs/Breadcrumbs";
import FeedbackChart from "../../components/feedbackChart/FeedbackChart";

const Feedback = () => {
  return (
    <div className="feedback">
      <Sidebar />
      <div className="feedbackContainer">
        <Navbar />
        <div className="content">
          <CustomBreadcrumbs />
          <div className="feedbackContent">
            <div className="feedbackChartWrapper">
              <FeedbackChart />
            </div>
            <div className="feedbackFormWrapper">
              <FeedbackForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feedback;
