import {
  Badge,
  Button,
  Checkbox,
  CheckboxGroup,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Popover,
  PopoverAnchor,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Portal,
  Radio,
  RadioGroup,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useBoolean,
  useDisclosure,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { AiOutlineSearch } from 'react-icons/ai';
import { IoAdd } from 'react-icons/io5';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import AddAcount from '../components/modals/AddAccount';
import Spinner from '../components/Spinner';
import { getUsers } from '../features/user/userSlice';
import { useJobs } from '../hooks/useJobs';
import DelResAccount from '../components/modals/DelResAccount';
import Layout from '../components/Layout';
import { MdFilterAlt, MdFilterAltOff, MdKeyboardArrowDown, MdKeyboardArrowUp } from 'react-icons/md';


const Users = () => {
  const navigate = useNavigate();
  const { systemUsers: _users, isLoading } = useSelector((state) => state.user);
  const { role } = useSelector((state) => state.user.auth);

  const [users, setUsers] = useState([])

  const dispatch = useDispatch();

  const [search, setSearch] = useState("")

  const defaultRoles = ['admin', 'manager', 'user']
  const { data: defaultJobs } = useJobs();
  const defaultStatus = ['deleted', 'nondeleted']

  const [filteredRole, setFilteredRole] = useState(defaultRoles)
  const [filteredJobs, setFilteredJobs] = useState([])
  const [filteredStatus, setFilteredStatus] = useState(defaultStatus)

  const [order, setOrder] = useState('dsc')
  const [sortedBy, setSortedBy] = useState('name')

  useEffect(() => {
    dispatch(getUsers());
  }, []);

  useEffect(() => {
    if (!isLoading) {
      const sorted = [..._users].sort((a, b) => {
        return a.name.localeCompare(b.name);
      })
      setUsers(sorted)
    }
  }, [_users]);

  useEffect(() => {
    if (defaultJobs)
      setFilteredJobs(defaultJobs.map((job) => job._id))
  }, [defaultJobs]);

  const sortArr = (col) => {
    setSortedBy(col)
    if (order === 'asc') {
      const sorted = [...users].sort((a, b) => {
        if (col === 'job')
          return a.job.name.localeCompare(b.job.name);

        return a[col].localeCompare(b[col]);
      })
      setUsers(sorted)
      setOrder('dsc');
    } else {
      const sorted = [...users].sort((b, a) => {
        if (col === 'job')
          return a.job.name.localeCompare(b.job.name);

        return a[col].localeCompare(b[col]);
      })
      setUsers(sorted)
      setOrder('asc');
    }
  }

  return (
    <Layout>
      <div className='w-full bg-white shadow-lg p-4' style={{ height: '87vh' }}>
        <h3 className='h3'>Người dùng</h3>
        <div className='flex justify-end mb-4 gap-2 -mt-9'>
          <InputGroup className='w-72'>
            <InputLeftElement
              pointerEvents='none'
              children={<AiOutlineSearch color='gray.300' />}
              fontSize='xl'
            />
            <Input value={search} placeholder='Tìm kiếm' onChange={(event) => {
              setSearch(event.target.value);
            }} />
          </InputGroup>
          {role === 'admin' &&
            <AddAcount>
              <Button
                leftIcon={<IoAdd color='#fff' />}
                background='primary'
                color='white'
              >
                Thêm tài khoản
              </Button>
            </AddAcount>
          }
        </div>

        {isLoading || filteredJobs.length === 0 ? (
          <Spinner />
        ) : (
          <>
            <TableContainer height='100vh'>
              <Table size='sm' variant='striped'>
                <Thead>
                  <Tr textTransform='lowercase'>
                    <Th className='w-3/12 border-none' onClick={() => sortArr('name')}>
                      <div className='flex'>
                        <div className='flex items-center mx-auto'>Họ tên{sortedBy === 'name' && (order === 'dsc' ? <MdKeyboardArrowUp /> : <MdKeyboardArrowDown />)}</div>
                      </div>
                    </Th>
                    <Th className='w-4/12 border-none'>
                      <div className='w-[70px] mx-auto flex items-center'>
                        <div className='flex' onClick={() => sortArr('job')}>
                          <div className='flex items-center mx-auto'>Chức vụ{sortedBy === 'job' && (order === 'dsc' ? <MdKeyboardArrowUp /> : <MdKeyboardArrowDown />)}</div>
                        </div>
                        <Popover>
                          <PopoverTrigger>
                            <IconButton variant='outline' border={false} _hover={{}} className='ml-2 -mt-0.5 text-white' icon={filteredJobs.sort().toString() === defaultJobs.map((job) => job._id).sort().toString() ? <MdFilterAltOff /> : <MdFilterAlt />}></IconButton>
                          </PopoverTrigger>
                          <Portal>
                            <PopoverContent className='w-auto'>
                              <PopoverArrow />
                              <PopoverBody className='text-black mx-auto'>
                                <CheckboxGroup value={filteredJobs} onChange={setFilteredJobs}>
                                  <Flex className='flex flex-col'>
                                    {
                                      defaultJobs.map((job) => <Checkbox value={job._id}>{job.name}</Checkbox>)
                                    }
                                  </Flex>
                                </CheckboxGroup>
                                <div className='flex gap-1 mt-1'>
                                  <Button h='6' onClick={() => setFilteredJobs(defaultJobs.map((job) => job._id))}>Chọn tất cả</Button>
                                  <Button h='6' onClick={() => setFilteredJobs([])}>Bỏ chọn tất cả</Button>
                                </div>
                              </PopoverBody>
                            </PopoverContent>
                          </Portal>
                        </Popover>
                      </div>
                    </Th>
                    <Th className='w-3/12 border-none'>
                      <div className='w-[90px] mx-auto flex items-center'>
                        <div className='flex' onClick={() => sortArr('role')}>
                          <div className='flex items-center mx-auto'>Quyền hạn{sortedBy === 'role' && (order === 'dsc' ? <MdKeyboardArrowUp /> : <MdKeyboardArrowDown />)}</div>
                        </div>
                        <Popover>
                          <PopoverTrigger>
                            <IconButton variant='outline' border={false} _hover={{}} className='ml-2 -mt-0.5 text-white' icon={filteredRole.sort().toString() === defaultRoles.sort().toString() ? <MdFilterAltOff /> : <MdFilterAlt />}></IconButton>
                          </PopoverTrigger>
                          <Portal>
                            <PopoverContent className='w-auto'>
                              <PopoverArrow />
                              <PopoverBody className='text-black mx-auto'>
                                <CheckboxGroup value={filteredRole} onChange={setFilteredRole}>
                                  <Flex className='flex flex-col'>
                                    <Checkbox value='admin'>Quản trị viên</Checkbox>
                                    <Checkbox value='manager'>Quản Lý</Checkbox>
                                    <Checkbox value='user'>Nhân viên</Checkbox>
                                  </Flex>
                                </CheckboxGroup>
                                <div className='flex flex-col gap-1 mt-1'>
                                  <Button h='6' onClick={() => setFilteredRole(defaultRoles)}>Chọn tất cả</Button>
                                  <Button h='6' onClick={() => setFilteredRole([])}>Bỏ chọn tất cả</Button>
                                </div>
                              </PopoverBody>
                            </PopoverContent>
                          </Portal>
                        </Popover>
                      </div>
                    </Th>
                    <Th className='w-3/12 border-none'>
                      <div className='w-[84px] mx-auto'>Trạng thái
                        <Popover>
                          <PopoverTrigger>
                            <IconButton variant='outline' border={false} _hover={{}} className='ml-2 -mt-0.5 text-white' icon={filteredStatus.sort().toString() === defaultStatus.sort().toString() ? <MdFilterAltOff /> : <MdFilterAlt />}></IconButton>
                          </PopoverTrigger>
                          <Portal>
                            <PopoverContent className='w-auto'>
                              <PopoverArrow />
                              <PopoverBody className='text-black mx-auto'>
                                <CheckboxGroup value={filteredStatus} onChange={setFilteredStatus}>
                                  <Flex className='flex flex-col'>
                                    <Checkbox value='nondeleted'>
                                      <Badge className='rounded-md' colorScheme={'green'}>
                                        Đang hoạt động
                                      </Badge>
                                    </Checkbox>
                                    <Checkbox value='deleted'>
                                      <Badge className='rounded-md' colorScheme={'red'}>
                                        Đã xóa
                                      </Badge>
                                    </Checkbox>
                                  </Flex>
                                </CheckboxGroup>
                                <div className='flex flex-col gap-1 mt-1'>
                                  <Button h='6' onClick={() => setFilteredStatus(defaultStatus)}>Chọn tất cả</Button>
                                  <Button h='6' onClick={() => setFilteredStatus([])}>Bỏ chọn tất cả</Button>
                                </div>
                              </PopoverBody>
                            </PopoverContent>
                          </Portal>
                        </Popover>
                      </div>
                    </Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {users.map(
                    ({ slug, name, phoneNumber, email, job, deleted, role, deletedBy }) => {
                      if (filteredRole.includes(role) && filteredJobs.includes(job._id) && filteredStatus.includes(deleted ? 'deleted' : 'nondeleted'))
                        if (slug.toLowerCase().includes(search.toLowerCase().replace(/ /gm, '-')) || name.toLowerCase().includes(search.toLowerCase()))
                          return (
                            <Tr
                              onClick={(e) => {
                                navigate(`/nguoi-dung/${slug}`);
                              }}
                              className='cursor-pointer'
                            >
                              <Td>{name}</Td>
                              <Td>{job.name}</Td>
                              <Td>{(role === 'admin') ? 'Quản trị viên' : (role === 'manager') ? 'Quản lý' : 'Nhân viên'}</Td>
                              <Td>
                                <Badge className='rounded-md'
                                  colorScheme={deleted ? 'red' : 'green'}
                                >
                                  {deleted ? "Đã xóa" : "Đang hoạt động"}
                                </Badge>
                              </Td>
                            </Tr>
                          )
                    },
                  )}
                </Tbody>
              </Table>
            </TableContainer>

            {search === "" && <small className='mt-4 inline-block'>
              Tổng cộng có {users.length} người dùng.
            </small>}
          </>
        )}

      </div>
    </Layout >
  );
};

export default Users;
