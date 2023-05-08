import { Tab, TabList, Tabs } from '@chakra-ui/react';
import React from 'react';
import Layout from '../components/Layout';
import ProfileTab from '../components/tabs/Profile';

function Profile() {
  return (
    <Layout>
      <div className='w-full bg-white shadow-lg p-4'>
        <h3 className='h3'>Thông tin tài khoản</h3>
        <hr className='mb-6' />
        <ProfileTab self />
      </div>
    </Layout>
  );
}

export default Profile;
