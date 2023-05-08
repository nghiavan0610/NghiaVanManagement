import { Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import Spinner from '../components/Spinner';
import ProfileTab from '../components/tabs/Profile';
import { getUser } from '../features/user/userSlice';

function UserDetail() {
  const tabs = ['Thông tin'];
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { detail, isLoading } = useSelector((state) => state.user);
  const { role } = useSelector((state) => state.user.auth);
  const { id } = useParams();

  const getData = async () => {
    await dispatch(getUser(id));
  };

  useEffect(() => {
    getData();
  }, []);

  if(isLoading) return <Spinner />

  return (
    <Layout>
      <div className='w-full bg-white shadow-lg p-4'>
        <h3 className='h3'>Thông tin người dùng</h3>
        <hr className='mb-2' />
        {detail?.deleted && <div className='mb-2 text-sm'>Tài khoản đã bị xóa bởi {detail?.deletedBy.name}.</div>}
        {detail ? <ProfileTab /> : <Spinner />}
      </div>
    </Layout>
  );
}

export default UserDetail;
