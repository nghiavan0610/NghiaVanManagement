import {
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  Checkbox,
  Badge,
  Popover,
  PopoverTrigger,
  IconButton,
  Portal,
  PopoverContent,
  PopoverArrow,
  PopoverBody,
  CheckboxGroup,
  Flex,
  TableContainer,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  TabList,
  Tabs,
  Tab,
  TabPanels,
  TabPanel
} from '@chakra-ui/react';
import { format } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { AiOutlineSearch } from 'react-icons/ai';
import { IoAdd } from 'react-icons/io5';
import { useDispatch, useSelector } from 'react-redux';
import Layout from '../components/Layout';
import AddProject from '../components/modals/AddProject';
import Spinner from '../components/Spinner';
import { useProjects } from '../hooks/useProjects';
import { useNavigate } from 'react-router-dom';
import { getAllProjects, getProjects } from '../features/project/projectSlice';
import { MdFilterAlt, MdFilterAltOff } from 'react-icons/md';
import { showToast } from '../utils/toast';
import ProjectTab from '../components/tabs/ProjectTab';

function Projects() {
  const { role, username } = useSelector((state) => state.user.auth);
  const { projects, allProjects, isLoading } = useSelector((state) => state.project);

  const tabs = ['Dự án của tôi', 'Tất cả dự án']
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getProjects());
    dispatch(getAllProjects());
  }, []);

  useEffect(() => {
    dispatch(getProjects());
    dispatch(getAllProjects());
  }, [username]);

  return (
    <Layout>
      {
        <div className='w-full bg-white shadow-lg p-2'>
          <Tabs>
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

            <TabPanels>
              {/* Dự án của tôi */}
              <TabPanel>
                {isLoading ? <Spinner /> : <ProjectTab role={role} _projects={projects} />}
              </TabPanel>

              {/* Tất cả dự án */}
              <TabPanel>
                {isLoading ? <Spinner /> : <ProjectTab role={role} _projects={allProjects} isAll />}
              </TabPanel>
            </TabPanels>
          </Tabs>
        </div>}
    </Layout >
  );
}

export default Projects;
