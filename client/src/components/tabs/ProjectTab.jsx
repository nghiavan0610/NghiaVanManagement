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

import { MdFilterAlt, MdFilterAltOff, MdKeyboardArrowDown, MdKeyboardArrowUp } from 'react-icons/md';
import { AiOutlineSearch } from 'react-icons/ai';
import { IoAdd } from 'react-icons/io5';
import { useState } from 'react';
import AddProject from '../modals/AddProject';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { showToast } from '../../utils/toast';
import { useEffect } from 'react';
import Spinner from '../Spinner';

function ProjectTab({ _projects, isAll = false, role }) {

  const defaultStatus = ['done', 'notDone', 'deleted']
  const [filteredStatus, setFilteredStatus] = useState(defaultStatus)

  const [projects, setProjects] = useState(_projects)

  const [order, setOrder] = useState('dsc')
  const [sortedBy, setSortedBy] = useState('code')

  const [search, setSearch] = useState("")

  const navigate = useNavigate();

  useEffect(() => {
    const sorted = [..._projects].sort((a, b) => {
      return a.code.localeCompare(b.code);
    })
    setProjects(sorted)
  }, [_projects])

  const sortArr = (col) => {
    setSortedBy(col)
    if (order === 'asc') {
      const sorted = [...projects].sort((a, b) => {
        if (col === 'manager') {
          if (isAll)
            return a.manager[0].name.localeCompare(b.manager[0].name);
          return a.manager.name.localeCompare(b.manager.name);
        }

        if (col === 'startedAt')
          return new Date(a.startedAt) - new Date(b.startedAt)

        return a[col].localeCompare(b[col]);
      })
      setProjects(sorted)
      setOrder('dsc');
    } else {
      const sorted = [...projects].sort((b, a) => {
        if (col === 'manager') {
          if (isAll)
            return a.manager[0].name.localeCompare(b.manager[0].name);
          return a.manager.name.localeCompare(b.manager.name);
        }

        if (col === 'startedAt')
          return new Date(a.startedAt) - new Date(b.startedAt)

        return a[col].localeCompare(b[col]);
      })
      setProjects(sorted)
      setOrder('asc');
    }
  }

  return (
    <div className='w-full bg-white' style={{ height: '88vh' }}>
      <div className='mb-4 -mt-14 flex justify-end gap-2'>
        <InputGroup className='w-72'>
          <InputLeftElement
            pointerEvents='none'
            children={<AiOutlineSearch color='gray.300' />}
            fontSize='xl'
          />
          <Input value={search} placeholder='Nhập từ khóa' onChange={(event) => {
            setSearch(event.target.value);
          }} />
        </InputGroup>
        {(role === 'admin' || role === 'manager') &&
          <div className='flex gap-5'>
            <AddProject>
              <Button
                className='ml-auto'
                leftIcon={<IoAdd color='#fff' />}
                background='primary'
                color='white'
              >
                Tạo dự án
              </Button>
            </AddProject>
          </div>
        }
      </div>

      {(
        <div className='overflow-auto' style={{ height: "80vh" }}>
          <table class="table-auto w-full dataTable">
            <thead className='sticky top-0'>
              <tr>
                <th className='w-1/12 border-none' onClick={() => sortArr('code')}>
                  <div className='flex'>
                    <div className='flex items-center mx-auto'>Mã dự án{sortedBy === 'code' && (order === 'dsc' ? <MdKeyboardArrowUp /> : <MdKeyboardArrowDown />)}</div>
                  </div>
                </th>
                <th className='w-5/12 border-none' onClick={() => sortArr('name')}>
                  <div className='flex'>
                    <div className='flex items-center mx-auto'>Tên dự án{sortedBy === 'name' && (order === 'dsc' ? <MdKeyboardArrowUp /> : <MdKeyboardArrowDown />)}</div>
                  </div>
                </th>
                <th className='w-2/12 border-none' onClick={() => sortArr('startedAt')}>
                  <div className='flex'>
                    <div className='flex items-center mx-auto'>Thời gian khởi công{sortedBy === 'startedAt' && (order === 'dsc' ? <MdKeyboardArrowUp /> : <MdKeyboardArrowDown />)}</div>
                  </div>
                </th>
                <th className='w-2/12 border-none' onClick={() => sortArr('manager')}>
                  <div className='flex'>
                    <div className='flex items-center mx-auto'>Quản lý dự án{sortedBy === 'manager' && (order === 'dsc' ? <MdKeyboardArrowUp /> : <MdKeyboardArrowDown />)}</div>
                  </div>
                </th>
                <th className='w-2/12 border-none'>
                  <div className='flex items-center ml-[68px] mx-auto'>Trạng thái
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
                                <Checkbox value='done'>
                                  <Badge className='rounded-md' colorScheme={'green'}>
                                    Đã hoàn thành
                                  </Badge>
                                </Checkbox>
                                <Checkbox value='notDone'>
                                  <Badge className='rounded-md' colorScheme={'orange'}>
                                    Đang thi công
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
                </th>
              </tr>
            </thead>
            <tbody>
              {projects.map(({ slug, code, name, startedAt, updatedBy, isDone, deleted, deletedBy, manager }) => {
                if (filteredStatus.includes(deleted ? 'deleted' : isDone ? 'done' : 'notDone'))
                  if (code.toLowerCase().includes(search.toLowerCase()) || name.toLowerCase().includes(search.toLowerCase()) || slug.toLowerCase().includes(search.toLowerCase().replace(/ /gm, '-')))
                    return (
                      <tr
                        onClick={() => {
                          if (!deleted) navigate(`/du-an/${slug}`);
                          else showToast('error', `Dự án đã bị xóa bởi ${deletedBy.name}.`)
                        }}
                        className='cursor-pointer'
                      >
                        <td className='text-center'>{code}</td>
                        <td className='text-center'>{name}</td>
                        <td className='text-center'>{format(new Date(startedAt), 'dd/MM/yyyy')}</td>
                        <td className='text-center'> {isAll ? manager[0].name : manager.name}</td>
                        <td className='text-center'>
                          <Badge className='rounded-md'
                            colorScheme={deleted ? 'red' : isDone ? 'green' : 'orange'}
                          >
                            {deleted ? "Đã xóa" : isDone ? "Đã hoàn thành" : "Đang thi công"}
                          </Badge>
                        </td>
                      </tr>
                    )
              })}
            </tbody>
          </table>
        </div>

      )}
      {search === "" && <small className='mt-4 inline-block'>
        Tổng cộng có {projects.length} dự án.
      </small>}
    </div>);
}

export default ProjectTab