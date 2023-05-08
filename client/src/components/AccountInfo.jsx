import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaTrash } from 'react-icons/fa';
import { MdOutlineSettingsBackupRestore } from 'react-icons/md'
import { useDispatch, useSelector } from 'react-redux';
import { Form, useNavigate, useParams } from 'react-router-dom';
import { deleteUser, updateUser, updateUserSecurity } from '../features/user/userSlice';
import ErrorMessage from '../utils/ErrorMessage';
import DelResAccount from './modals/DelResAccount';

const AccountInfo = ({ self = false, data, status }) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();

  const dispatch = useDispatch();

  useEffect(() => {
    setValue('username', data.username, { shouldValidate: true });
  }, [data]);

  const onSubmitPassword = (formData) => {
    const slug = data.slug
    dispatch(updateUserSecurity({ self, slug, formData }));
  };

  return (
    <>
      {/* Thông tin tài khoản */}
      <Box as='form' onSubmit={handleSubmit(onSubmitPassword)}>


        <Flex justifyContent='space-between'>
          <h4 className='h4 mt-2'>Thông tin bảo mật</h4>
          <div className='flex gap-2'>
            {data.deleted && <DelResAccount slug={data.slug} deleted restore>
              <Button
                variant='ghost'
                onClick={onOpen}
              >
                <MdOutlineSettingsBackupRestore />
              </Button>
            </DelResAccount>
            }
            {!self &&
              <DelResAccount slug={data.slug} deleted={data.deleted}>
                <Button
                  variant='ghost'
                  onClick={onOpen}
                >
                  <FaTrash />
                </Button>
              </DelResAccount>
            }
          </div>
        </Flex>
        <hr className='mb-6' />
        <div>
          {self && (
            <div className='grid grid-cols-12 mt-4'>
              <>
                <div className='col col-span-3'>
                  <FormLabel htmlFor='oldPassword'>Mật khẩu cũ:</FormLabel>
                </div>
                <div className='col col-span-3'>
                  <InputGroup size='md'>
                    <Input
                      id='oldPassword'
                      {...register('oldPassword', { required: true })}
                      placeholder='Nhập mật khẩu hiện tại'
                      type='password'
                    />
                  </InputGroup>
                  {errors?.oldPassword && <ErrorMessage />}
                </div>
              </>
            </div>
          )}

          <div className='grid grid-cols-12 mt-4'>
            <div className='col col-span-3'>
              <FormLabel htmlFor='newPassword'>Mật khẩu mới:</FormLabel>
            </div>
            <div className='col col-span-3'>
              <InputGroup size='md'>
                <Input
                  id='newPassword'
                  type='password'
                  placeholder='Mật khẩu mới'
                  {...register('newPassword', {
                    required: {
                      value: true,
                      message: 'Vui lòng điền trường này!',
                    },
                    minLength: {
                      value: 8,
                      message: 'Mật khẩu dài 8-255 ký tự',
                    },
                    maxLength: {
                      value: 255,
                      message: 'Mật khẩu dài 8-255 ký tự',
                    },
                  })}
                />
              </InputGroup>
              {errors?.newPassword && (
                <ErrorMessage msg={errors.newPassword.message} />
              )}
            </div>
          </div>
          <div className='grid grid-cols-12 mt-4'>
            <div className='col col-span-3'>
              <FormLabel htmlFor='confirmPassword'>
                Nhập lại mật khẩu:
              </FormLabel>
            </div>
            <div className='col col-span-3'>
              <InputGroup size='md'>
                <Input
                  id='confirmPassword'
                  type='password'
                  placeholder='Mật khẩu mới'
                  {...register('confirmPassword', {
                    required: {
                      value: true,
                      message: 'Vui lòng điền trường này!',
                    },
                    minLength: {
                      value: 8,
                      message: 'Mật khẩu dài 8-255 ký tự',
                    },
                    maxLength: {
                      value: 255,
                      message: 'Mật khẩu dài 8-255 ký tự',
                    },
                    validate: (val) => {
                      if (watch('newPassword') !== val) {
                        return 'Mật khẩu không trùng khớp';
                      }

                      return null;
                    },
                  })}
                />
              </InputGroup>
              {errors?.confirmPassword && (
                <ErrorMessage msg={errors.confirmPassword.message} />
              )}
            </div>
          </div>
          <div className='flex justify-end items-center'>
            <Button variant='primary' type='submit'>
              Đổi mật khẩu
            </Button>
          </div>
        </div>
      </Box>
    </>
  );
};

export default AccountInfo;
