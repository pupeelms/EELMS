import React from 'react';
import CustomBreadcrumbs from '../components/breadcrumbs/Breadcrumbs';

const Layout = ({ children }) => {
  return (
    <div>
      <CustomBreadcrumbs />
      <div>{children}</div>
    </div>
  );
};

export default Layout;
