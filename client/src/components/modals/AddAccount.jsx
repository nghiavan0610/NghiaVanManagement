import {
  Button,
  FormControl,
  FormLabel,
  Grid,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  useDisclosure,
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { createUser, getUsers } from '../../features/user/userSlice';
import Datepicker from '../../partials/actions/Datepicker';
import ErrorMessage from '../../utils/ErrorMessage';
import { useJobs } from '../../hooks/useJobs';
/**
 *
 * @children Pass in the button
 */

const MutateUser = ({ children, project }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [loading, setLoading] = useState(false);
  const { data: jobs, isLoading } = useJobs();
  const initialRef = React.useRef();
  const finalRef = React.useRef();

  const { _id } = useSelector((state) => state.user.auth);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm();

  const dispatch = useDispatch();

  useEffect(() => {
    if (project) {
      const { name, location, startedAt, comment, code } = project;

      reset({
        code,
        name,
        location,
        startedAt,
        comment,
      });
    }
  }, [project]);

  const onSubmit = async (formData) => {
    setLoading(true);

    try {
      await dispatch(createUser({ ...formData }));
      await dispatch(getUsers());
      handleClose();
    } catch (e) {
      console.log(e);
    }

    setLoading(false);
  };

  function handleClose() {
    reset()
    onClose()
  }

  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { onClick: onOpen });
    }
    return child;
  });

  const renderError = (name, type = 'required') => {
    if (name in errors && errors[name].type === type) {
      return <ErrorMessage />;
    }
    return null;
  };

  return (
    <>
      {/* Button */}
      {childrenWithProps}

      <Modal
        initialFocusRef={initialRef}
        finalFocusRef={finalRef}
        isOpen={isOpen}
        onClose={handleClose}
        size='xl'
      >
        <ModalOverlay />
        <ModalContent as='form' onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader textAlign='center'>Tài khoản mới</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl>
              <FormLabel>
                Tên người dùng <span className='text-red-500'>*</span>
              </FormLabel>
              <Input
                ref={initialRef}
                placeholder='Tên người dùng'
                {...register('username', { required: true })}
              />
              {renderError('username')}
            </FormControl>

            <FormControl mt={4}>
              <FormLabel>
                Họ và tên <span className='text-red-500'>*</span>
              </FormLabel>
              <Input
                ref={initialRef}
                placeholder='Họ và tên'
                {...register('name', { required: true })}
              />
              {renderError('name')}
            </FormControl>


            <Grid
              gridTemplateColumns={{
                base: 'repeat(1,1fr)',
                md: 'repeat(2,1fr)',
              }}
              gridColumnGap='2rem'
            >
              <FormControl mt={4}>
                <FormLabel>
                  Ngày sinh <span className='text-red-500'>*</span>
                </FormLabel>

                <Controller
                  name='birthdate'
                  control={control}
                  defaultValue={new Date()}
                  rules={{
                    required: true,
                  }}
                  render={({ field }) => (
                    <Datepicker
                      defaultDate={new Date()}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </FormControl>

              <FormControl mt={4}>
                <FormLabel>
                  Giới tính <span className='text-red-500'>*</span>
                </FormLabel>
                <Controller
                  name='gender'
                  control={control}
                  rules={{
                    required: true,
                  }}
                  render={({ field }) => (
                    <Select {...field}>
                      <option value selected hidden>
                        Chọn giới tính
                      </option>
                      <option value={"male"}>Nam</option>
                      <option value={"female"}>Nữ</option>
                    </Select>
                  )}
                />
                {renderError('gender')}
              </FormControl>
            </Grid>

            <Grid
              gridTemplateColumns={{
                base: 'repeat(1,1fr)',
                md: 'repeat(2,1fr)',
              }}
              gridColumnGap='2rem'
            >
              <FormControl mt={4}>
                <FormLabel>
                  Quyền hạn <span className='text-red-500'>*</span>
                </FormLabel>
                <Controller
                  name='role'
                  control={control}
                  defaultValue={"user"}
                  rules={{
                    required: true,
                  }}
                  render={({ field }) => (
                    <Select {...field}>
                      <option value={"admin"}>Quản trị viên</option>
                      <option value={"manager"}>Quản lý</option>
                      <option value={"user"}>Nhân viên</option>
                    </Select>
                  )}
                />
                {renderError('role')}
              </FormControl>

              <FormControl mt={4}>
                <FormLabel>
                  Chức vụ <span className='text-red-500'>*</span>
                </FormLabel>
                <Controller
                  name='jobId'
                  control={control}
                  rules={{
                    required: true,
                  }}
                  render={({ field }) => (
                    <Select {...field}>
                      <option value selected hidden>
                        Chọn chức vụ
                      </option>
                      {jobs.map(({ _id, name }) => (
                        <option value={_id}>{name}</option>
                      ))}
                    </Select>
                  )}
                />
                {renderError('jobId')}
              </FormControl>
            </Grid>

            <FormControl mt={4}>
              <FormLabel>
                Địa chỉ
              </FormLabel>
              <Input
                ref={initialRef}
                placeholder='Địa chỉ'
                {...register('address')}
              />
            </FormControl>

            <Grid
              gridTemplateColumns={{
                base: 'repeat(1,1fr)',
                md: 'repeat(2,1fr)',
              }}
              gridColumnGap='2rem'
            >
              <FormControl mt={4}>
                <FormLabel>
                  Email
                </FormLabel>
                <Input
                  ref={initialRef}
                  type='email'
                  placeholder='Email'
                  {...register('email')}
                />
              </FormControl>

              <FormControl mt={4}>
                <FormLabel>
                  Số điện thoại
                </FormLabel>
                <Input
                  ref={initialRef}
                  placeholder='Số điện thoại'
                  type='tel'
                  {...register('phoneNumber', {
                    required: {
                      value: false,
                      message: 'Vui lòng điện trường này',
                    },
                    validate: (val) => {
                      if (val.match(/\D/g)) {
                        return 'Số điện thoại không hợp lệ';
                      }
                      return true;
                    },
                    minLength: {
                      value: 9,
                      message: 'Số điện thoại không hợp lệ',
                    },
                    maxLength: {
                      value: 11,
                      message: 'Số điện thoại không hợp lệ',
                    },
                  })}
                />
                {errors?.phoneNumber?.message && (
                  <ErrorMessage msg={errors.phoneNumber.message} />
                )}
              </FormControl>
            </Grid>
          </ModalBody>

          <ModalFooter>
            <Button onClick={handleClose} mr={3}>
              Hủy
            </Button>
            <Button
              background='primary'
              color='white'
              type='submit'
              disabled={loading}
            >
              {project ? 'Lưu' : 'Tạo'} tài khoản
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default MutateUser;
