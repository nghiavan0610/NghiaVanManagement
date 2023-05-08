import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import Cookies from 'universal-cookie';

const PrivateRoute = () => {
  const { auth } = useSelector((state) => state.user);

  if (!auth) {
    const cookies = new Cookies();

    cookies.remove('accessToken', { path: "/" });
    cookies.remove('refreshToken', { path: "/" });
    cookies.remove('user-slug', { path: "/" });
  }
  return auth ? <Outlet /> : <Navigate to='/' />;
};

export default PrivateRoute;
