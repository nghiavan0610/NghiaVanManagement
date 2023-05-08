import { Box, Flex, Image } from '@chakra-ui/react';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Route, Routes, useLocation } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import './css/style.scss';
import { getMe } from './features/user/userSlice';
import Login from './pages/Login';
import Profile from './pages/Profile';
import ProjectDetail from './pages/ProjectDetail';
import bg from './images/bg.png';
import logo from './images/company-logo.svg';
// Import pages
import Projects from './pages/Projects';
import UserDetail from './pages/UserDetail';
import Users from './pages/Users';
import Materials from './pages/Materials';

// import { BrowserView, MobileView, isBrowser, isMobile } from 'react-device-detect';
import { MobileDevice, DesktopAndTabletDevice } from 'react-detect';

function App() {
  const location = useLocation();
  const dispatch = useDispatch();
  const { auth, isLoading } = useSelector((state) => state.user);

  useEffect(() => {
    document.querySelector('html').style.scrollBehavior = 'auto';
    window.scroll({ top: 0 });
    document.querySelector('html').style.scrollBehavior = '';
  }, [location.pathname]); // triggered on route change

  useEffect(() => {
    dispatch(getMe());
  }, []);

  if (isLoading) {
    return (
      <Flex h='100vh' w='100vw' justifyContent='center' alignItems='center' />
    );
  }
  return (
    <>
      <DesktopAndTabletDevice>
        <Routes>
          <Route exact path='/' element={<Login />} />
          <Route exact path='/' element={<PrivateRoute />}>
            <Route exact path='/du-an' element={<Projects />} />
            <Route path='/du-an/:slug' element={<ProjectDetail />} />
            <Route exact path='/nguoi-dung' element={<Users />} />
            <Route exact path='/nguoi-dung/:id' element={<UserDetail />} />
            <Route exact path='/vat-tu' element={<Materials />} />
            <Route exact path='/thong-tin' element={<Profile />} />
            <Route exact path='*' />
          </Route>
        </Routes>
      </DesktopAndTabletDevice>
      <MobileDevice>
        <Box className='h-screen flex bg-red-500 text-center' backgroundImage={bg} bgRepeat='no-repeat' bgSize='cover'>
          <div className=' w-full mx-5 rounded-2xl my-auto backdrop-blur-sm bg-white/50 py-5 text-black text-lg px-3'>
            <Image className='mx-auto scale-75' src={logo}></Image>
            Vui lòng sử dụng trên máy tính để được trải nghiệm tốt nhất nhé!
          </div>
        </Box>
      </MobileDevice>
    </>
  );
}

export default App;
