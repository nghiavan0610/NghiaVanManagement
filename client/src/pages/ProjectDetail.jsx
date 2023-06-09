import { Tab, TabIndicator, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import Spinner from '../components/Spinner';
import InfoPanel from '../components/tabs/InfoPanel';
import TimesheetPanel from '../components/tabs/TimesheetPanel';
import TotalsPanel from '../components/tabs/TotalsPanel';
import { getProject, getTimesheet } from '../features/project/projectSlice';
import { getUsers } from '../features/user/userSlice';
import solution from "../images/solution.svg";

const ProjectDetail = () => {
  const dispatch = useDispatch();
  const { detail, timesheet } = useSelector((state) => state.project);
  const { role, _id } = useSelector((state) => state.user.auth);
  const { slug } = useParams();
  const getData = async () => {
    await dispatch(getProject(slug));
    await dispatch(getTimesheet(slug));
    await dispatch(getUsers());
  };

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    dispatch(getTimesheet(slug));
  }, [detail]);

  // const isManager = false, isLeader = false, isMember = false;
  const isManager = (detail?.manager._id === _id)
  const isLeader = (() => (detail?.leaders.filter((user) => user._id === _id).length > 0 ? true : false))();
  const isMember = (() => (detail?.members.filter((user) => user._id === _id).length > 0 ? true : false))();
  const isAdmin = role === 'admin'

  const participated = (isManager || isLeader || isMember);

  const tabs = ((participated || role === 'admin') ? ['Thông tin', 'Tổng kê', 'Chấm công'] : ['Thông tin'])

  return (
    <Layout>
      <div className='w-full bg-white shadow-lg p-2'>
        {
          detail?.slug === slug ?
            <Tabs variant="unstyled">
              <TabList>
                {tabs.map((tab, i) => (
                  <Tab
                    _focus={{ boxShadow: '0 0 0 0 transparent' }}
                    _selected={{ borderColor: 'red.500' }}
                    key={i}
                  >
                    <h1 className='text-lg font-semibold text-gray-700 whitespace-nowrap'>
                      {tab}
                    </h1>
                  </Tab>
                ))}
              </TabList>
              <TabIndicator
                mt="-1.5px"
                height="2px"
                bg="red.500"
                borderRadius="1px"
              />
              <TabPanels>
                {/* Thông tin */}
                <TabPanel>
                  {detail ? <InfoPanel {...{ detail }} /> : <Spinner />}
                </TabPanel>

                {/* Tổng kê */}
                <TabPanel>
                  {detail ? <TotalsPanel {...{ detail, isManager, isLeader, isMember, isAdmin }} /> : <Spinner />}
                </TabPanel>

                {/* Biên bản */}
                <TabPanel>
                  {timesheet ?
                    <TimesheetPanel {...{ timesheet, slug, role, isManager, isLeader, isMember, isAdmin }} /> :
                    <div className="py-8 flex flex-col justify-center items-center">
                      <img src={solution} alt="solution" className="w-5/12 h-56" />
                      <p className="mt-10 text-xl font-semibold">Chưa có dữ liệu</p>
                      <p className="font-sm">Vui lòng thêm thành viên để tiếp tục.</p>
                    </div>}
                </TabPanel>
              </TabPanels>

            </Tabs>
            : <Spinner />
        }
      </div>
    </Layout>
  );
}

export default ProjectDetail;
