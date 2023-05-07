import {
  Button,
  FormControl,
  FormLabel,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from '@chakra-ui/react';

import Select from 'react-tailwindcss-select'

import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { addMember } from '../../features/project/projectSlice';

const EmployeeModal = ({ children, userId, role, edit, preUpdateData, managerId, leadersId, membersId }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const addedUsersId = [preUpdateData.managerId, ...preUpdateData.leadersId, ...preUpdateData.membersId]

  const initialRef = React.useRef();
  const finalRef = React.useRef();

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
    getValues,
    setValue,
  } = useForm();

  const dispatch = useDispatch();
  const { systemUsers } = useSelector((state) => state.user);

  const notAddedUsers = systemUsers.filter((user) => !addedUsersId.includes(user._id))

  const [loading, setLoading] = useState(false);

  const formOnSubmit = async (formData) => {
    setLoading(true);
    await dispatch(addMember({ preUpdateData, formData }));

    reset();
    setLoading(false);
    onClose();
  };

  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { onClick: onOpen });
    }
    return child;
  });

  useEffect(() => {
    if (userId && role) {
      reset({ userId, role });
    }

    return () => {
      reset();
    };
  }, [isOpen]);

  return (
    <>
      {/* Button */}
      {childrenWithProps}

      <Modal
        initialFocusRef={initialRef}
        finalFocusRef={finalRef}
        isOpen={isOpen}
        onClose={onClose}
      >
        <ModalOverlay />
        <ModalContent as='form' onSubmit={handleSubmit(formOnSubmit)}>
          <ModalHeader textAlign='center'>
            {edit ? 'Sửa' : 'Thêm'} thành viên
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {!edit && (
              <FormControl>
                <FormLabel>
                  Tài khoản người dùng
                  <span className='text-red-500'> *</span>
                </FormLabel>
                <Controller
                  name='userId'
                  control={control}
                  rules={{
                    required: true,
                  }}
                  render={({ field }) => (
                    <Select
                      isSearchable
                      {...field}
                      options={notAddedUsers.map(({ _id, name, job }) => ({
                        value: _id,
                        label: `[${job.name}] ${name}`,
                      }))}
                      placeholder="Chọn tài khoản người dùng"
                    />
                  )}
                />
                {errors.userId && (
                  <p className='text-red-500 mt-1 text-xs'>
                    Vui lòng chọn tài khoản
                  </p>
                )}
              </FormControl>
            )}
            <FormControl mt={4}>
              <FormLabel>
                Quyền hạn <span className='text-red-500'>*</span>
              </FormLabel>
              <Controller
                name='role'
                control={control}
                defaultValue={{ value: "members", label: "Nhân viên" }}
                rules={{
                  required: true,
                }}
                render={({ field }) => (
                  <Select
                    {...field}
                    options={[
                      { value: "leaders", label: "Trưởng dự án" },
                      { value: "members", label: "Nhân viên" },
                    ]}
                    placeholder="Chọn quyền hạn"
                  />
                )}
              />
            </FormControl>
          </ModalBody>


          <ModalFooter>
            <Button onClick={onClose} mr={3}>
              Hủy
            </Button>
            <Button
              background='primary'
              color='white'
              type='submit'
              disabled={loading}
            >
              Lưu
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default EmployeeModal;
