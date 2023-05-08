import { useState } from 'react';
import Header from '../partials/Header';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className='flex h-screen overflow-hidden'>
      {/* Content area */}
      <div className='relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden'>
        {/*  Site header */}
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main>
          <div className='px-2 py-2 w-full max-w-9xl mx-auto'>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
