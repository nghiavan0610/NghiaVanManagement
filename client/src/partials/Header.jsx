import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import logo from '../images/company-logo.svg';
import UserMenu from './header/UserMenu';
import { useSelector } from 'react-redux';

import { FaUserFriends, FaUser, FaTools, FaHammer } from 'react-icons/fa';
import { AiFillProject, AiFillTool } from 'react-icons/ai';
import { Flex } from '@chakra-ui/react';
import { TbTool } from 'react-icons/tb';

function Header() {
  const { role } = useSelector((state) => state.user.auth);

  const location = useLocation();
  const { pathname } = location;

  const PageButton = ({ path, icon, title }) => {
    return <div className={`px-3 py-2 rounded-sm mb-0.5 last:mb-0 ${pathname.includes(path) && 'border-b-2'}`}    >
      <NavLink
        end
        to={path}
        className={`block text-slate-200 hover:text-white truncate transition duration-150 ${pathname.includes(path) && 'text-white'}`}
      >
        <div className='flex items-center'>
          {icon}
          <span className='text-sm font-medium ml-3 duration-200'>
            {title}
          </span>
        </div>
      </NavLink>
    </div>
  }

  return (
    <header className='sticky top-0 z-30 bg-gradient-to-r from-slate-700 from-10% to-slate-700 to-100% '>
      <div>
        <div className='flex items-center h-12'>
          {/* Header: Left side */}
          <div className='h-full my-auto w-40 bg-white px-5 rounded-r-full'>
            {/* Logo */}
            <NavLink end to='/' className='block mt-1.5'>
              <img src={logo} alt='' className='h-9' />
            </NavLink>
          </div>

          <Flex className='flex justify-between px-3 w-full items-center'>
            <div className='flex gap-2'>
              <PageButton path='/du-an' icon={<AiFillProject />} title='Dự án' />
              <PageButton path='/nguoi-dung' icon={<FaUserFriends />} title='Người dùng' />
              <PageButton path='/vat-tu' icon={<FaHammer />} title='Vật tư' />
              <PageButton path='/thong-tin' icon={<FaUser />} title='Thông tin tài khoản' />
              <div></div>
            </div>

            {/* Header: Right side */}
            <div className='flex items-center'>
              <UserMenu />
            </div>
          </Flex>
        </div>
      </div>
    </header>
  );
}

export default Header;
