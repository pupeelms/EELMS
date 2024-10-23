import "./archives.scss"
import Sidebar from '../../components/sidebar/Sidebar';
import Navbar from '../../components/navbar/Navbar';
import ArchiveBorrowReturn from "../../components/archiveBorrowReturn/ArchiveBorrowReturn";
import CustomBreadcrumbs from "../../components/breadcrumbs/Breadcrumbs";

const Archives = () => {
    return (
        <div className="archive">
        <Sidebar/>
        <div className="archiveContainer">
            <Navbar/> 
            <div className="Content">
                <CustomBreadcrumbs/>
                <div className="archiveListContainer">
                    <div className="archiveListTitle">Archives</div>
                    <ArchiveBorrowReturn/>
                </div>
            </div>
        </div>
    </div>
    )
}

export default Archives