/* eslint-disable react/no-unstable-nested-components */
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Box,
  Button,
  Flex,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Badge,
} from '@chakra-ui/react';
import { format } from 'date-fns';
import React, { useState } from 'react';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { FaTrash } from 'react-icons/fa';
import { IoAdd } from 'react-icons/io5';
import { MdModeEdit } from 'react-icons/md';
import { TbArrowsUp, TbArrowsDown, TbArrowUp, TbArrowDown } from 'react-icons/tb'
import { useQueryClient } from 'react-query';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import {
  changeMemberRole,
  deleteMember,
  deleteProject,
} from '../../features/project/projectSlice';
import { showToast } from '../../utils/toast';
import AddProject from '../modals/AddProject';
import EmployeeModal from '../modals/Employee';
import DeleteProject from '../modals/DeleteProject';

function InfoPanel({ detail }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { role, _id } = useSelector((state) => state.user.auth);

  const { location, startedAt, description, name, code, leaders, manager, members, slug, isDone, progress } = detail;

  const delProject = async () => {
    await dispatch(deleteProject(slug));
    queryClient.invalidateQueries(['projects']);

    showToast('success', 'Đã xóa dự án');
    onClose();
    navigate('/du-an');
  };

  const preUpdateData = {
    "code": code,
    "name": name,
    "location": location,
    "description": description,
    "startedAt": startedAt,
    "isDone": isDone,
    "managerId": manager?._id,
    "leadersId": leaders.map((leader) => leader._id),
    "membersId": members.map((member) => member._id),
    "slug": slug
  }

  const MembersTr = ({ member, role: roleName, roleId }) => {
    return <Tr key={member._id}>
      <Td>{member.name}</Td>
      <Td>{member.job.name}</Td>
      <Td>{roleName}</Td>
      <Td>
        {
          member.deleted ?
            <Badge className='rounded-md' colorScheme={'red'}>
              Đã xóa
            </Badge> :
            <Badge className='rounded-md' colorScheme={'green'}>
              Đang hoạt động
            </Badge>
        }
      </Td>
      <Td>
        {((manager?._id === _id || role === "admin") && (roleId != 'manager')) &&
          <Menu>
            <MenuButton>
              <BsThreeDotsVertical />
            </MenuButton>
            <MenuList>

              { /* { currently leader */
                (roleId === 'members' || roleId === 'leaders') && <MenuItem
                  icon={roleId === 'members' ? <TbArrowsUp /> : <TbArrowUp />}
                  onClick={async () => {
                    await dispatch(changeMemberRole({ preUpdateData, member, roleId, toRoleId: 'manager' }))
                  }}
                >
                  Thăng chức lên quản lý dự án
                </MenuItem>
              }

              { /* { currently member */
                (roleId === 'members') && <MenuItem
                  icon={<TbArrowUp />}
                  onClick={async () => {
                    await dispatch(changeMemberRole({ preUpdateData, member, roleId, toRoleId: 'leaders' }))
                  }}
                >
                  Thăng chức lên trưởng dự án
                </MenuItem>
              }

              { /* { currently manager */
                (roleId === 'manager') && <MenuItem
                  icon={<TbArrowDown />}
                  onClick={async () => {
                    await dispatch(changeMemberRole({ preUpdateData, member, roleId, toRoleId: 'leaders' }))
                  }}
                >
                  Giáng chức xuống trưởng dự án
                </MenuItem>
              }

              { /* { currently leader */
                (roleId === 'manager' || roleId === 'leaders') && <MenuItem
                  icon={roleId === 'manager' ? <TbArrowsDown /> : <TbArrowDown />}
                  onClick={async () => {
                    await dispatch(changeMemberRole({ preUpdateData, member, roleId, toRoleId: 'members' }))
                  }}
                >
                  Giáng chức xuống nhân viên
                </MenuItem>
              }

              <MenuItem
                icon={<FaTrash />}
                color='red.500'
                onClick={async () => {
                  await dispatch(deleteMember({ preUpdateData, member, roleId }))
                }}
              >
                Xóa thành viên
              </MenuItem>
            </MenuList>
          </Menu>
        }

      </Td>
    </Tr>
  }

  const renderEmployeesTable = () => {
    return (
      <>
        <TableContainer marginTop={6}>
          <Table size='sm' variant='striped'>
            <Thead>
              <Tr>
                <Th className='w-3/12 border-none'>Họ tên</Th>
                <Th className='w-3/12 border-none'>Chức vụ</Th>
                <Th className='w-2/12 border-none'>Quyền hạn</Th>
                <Th className='w-2/12 border-none'>Trạng thái</Th>
                <Th className='w-1/12 border-none' />
              </Tr>
            </Thead>
            <Tbody>
              <MembersTr member={manager} role={"Quản lý dự án"} roleId={"manager"}></MembersTr>
              {
                leaders.map((leader) => <MembersTr member={leader} role={"Trưởng dự án"} roleId={"leaders"}></MembersTr>)
              }
              {
                members.map((member) => <MembersTr member={member} role={"Nhân viên"} roleId={"members"}></MembersTr>)
              }
            </Tbody>
          </Table>
        </TableContainer>
      </>
    );
  };

  return (
    <>
      <div className='flex justify-between items-start'>
        <Box>
          <p className='mb-3'>
            <strong>Mã dự án: </strong>
            {code}
          </p>
          <p className='mb-3'>
            <strong>Tên dự án: </strong>
            {name}
          </p>

          <p className='mb-3'>
            <strong>Địa điểm: </strong> {location}
          </p>
          <p className='mb-3'>
            <strong>Thời gian khởi công: </strong>
            {format(new Date(startedAt), 'dd-MM-yyyy')}
          </p>
          <p className='mb-3'>
            <strong>Mô tả: </strong>{' '}
            {description}
          </p>
          <p className='mb-3 flex items-center gap-2'>
            <strong>Trạng thái: </strong>{' '}
            {
              isDone ?
                <Badge className='rounded-md' colorScheme='green'>{"Đã hoàn thành"}</Badge>
                :
                <>
                  <div className={`relative w-[100px] h-[10px] bg-black/20 rounded-xl `}>
                    <div className={`absolute w-[${parseInt(progress)}px] h-[10px] bg-teal-500 rounded-xl `}></div>
                  </div>
                  {progress}%
                </>
            }
          </p>
        </Box>

        {(manager?._id === _id || role === "admin") && <Menu>
          <MenuButton>
            <BsThreeDotsVertical />
          </MenuButton>
          <MenuList>
            <AddProject project={detail}>
              <MenuItem icon={<MdModeEdit />}>Sửa thông tin dự án</MenuItem>
            </AddProject>
            <DeleteProject slug={slug} origCode={code}>
              <MenuItem
                icon={<FaTrash />}
                color='red.500'
              >
                Xóa dự án
              </MenuItem>
            </DeleteProject>
          </MenuList>
        </Menu>}
      </div>

      <div className='flex justify-between items-center'>
        <h3 className='h3'>Thành viên tham gia</h3>
        <EmployeeModal preUpdateData={preUpdateData} managerId={manager} leadersId={leaders} membersId={members}>
          {
            (manager?._id === _id || role === "admin") ? (
              <Button
                className='mt-2'
                leftIcon={<IoAdd color='#fff' />}
                background='primary'
                color='white'
                variant='solid'
                size='md'
              >
                Thêm thành viên
              </Button>
            ) : (
              <></>
            )
          }
        </EmployeeModal>
      </div>
      <hr />

      {renderEmployeesTable()}
    </>
  );
}

export default InfoPanel;
