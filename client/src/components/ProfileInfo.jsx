import { Box, Button, FormLabel, Input, Select, Spinner } from '@chakra-ui/react';
import React, { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { updateUser } from '../features/user/userSlice';
import ErrorMessage from '../utils/ErrorMessage';
import { useJobs } from '../hooks/useJobs';
import Datepicker from '../partials/actions/Datepicker';

const ProfileInfo = ({ data }) => {
  const { data: jobs, isLoading } = useJobs();
  const cantEdit = !data.cantEdit;
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const dispatch = useDispatch();

  const { role } = useSelector((state) => state.user.auth);

  const onSubmitProfile = (formData) => {
    dispatch(updateUser(formData));
  };

  useEffect(() => {
    if (data.phoneNumber === undefined) data.phoneNumber = ""
    if (data.email === undefined) data.email = ""
    reset(data);
  }, [data]);

  if (cantEdit)
    return <>
      {isLoading ? <Spinner fontSize='1rem' mr='8px' /> :
        <Box as='form' onSubmit={handleSubmit(onSubmitProfile)}>
          <h4 className='h4 mt-6'>Thông tin cá nhân</h4>
          <hr className='mb-6' />
          <div className='columns-2'>
            <div className='grid grid-cols-12'>
              <div className='col col-span-5'>
                <FormLabel htmlFor='username'>Tên tài khoản:</FormLabel>
              </div>
              <div className='col col-span-6'>
                {data.username}
              </div>
            </div>
            <div className='grid grid-cols-12 mt-4'>
              <div className='col col-span-5'>
                <FormLabel htmlFor='name'>Họ và tên:</FormLabel>
              </div>
              <div className='col col-span-6'>
                {data.name}
              </div>
            </div>
            <div className='grid grid-cols-12 mt-4'>
              <div className='col col-span-5'>
                <FormLabel htmlFor='gender'>Giới tính:</FormLabel>
              </div>
              <div className='col col-span-6'>
                {data.gender === "none" ? "" : data.gender === 'male' ? "Nam" : "Nữ"}
              </div>
            </div>
            <div className='grid grid-cols-12 mt-4'>
              <div className='col col-span-5'>
                <FormLabel htmlFor='gender'>Ngày sinh:</FormLabel>
              </div>
              <div className='col col-span-6'>
                {data.DOB ? new Date(data.DOB).toLocaleDateString("vi-VN") : ""}
              </div>
            </div>
            <div className='grid grid-cols-12 mt-4'>
              <div className='col col-span-5'>
                <FormLabel htmlFor='address'>Địa chỉ:</FormLabel>
              </div>
              <div className='col col-span-6'>
                {data.address}
              </div>
            </div>
            <div className='grid grid-cols-12 mt-12'>
              <div className='col col-span-5'>
                <FormLabel htmlFor='phoneNumber'>Số điện thoại:</FormLabel>
              </div>
              <div className='col col-span-6'>
                {data.phoneNumber}
              </div>
            </div>
            <div className='grid grid-cols-12 mt-4'>
              <div className='col col-span-5'>
                <FormLabel htmlFor='email'>Email:</FormLabel>
              </div>
              <div className='col col-span-6'>
                {data.email}
              </div>
            </div>
            <div className='grid grid-cols-12 mt-4'>
              <div className='col col-span-5'>
                <FormLabel htmlFor='jobTitle'>Chức vụ:</FormLabel>
              </div>
              <div className='col col-span-6'>
                {data.jobName}
              </div>
            </div>
            <div className='grid grid-cols-12 mt-4'>
              <div className='col col-span-5 '>
                <FormLabel htmlFor='role'>Quyền hạn tài khoản:</FormLabel>
              </div>
              <div className='col col-span-6'>
                {data.role === 'admin' ? "Quản trị viên" : data.role === 'manager' ? "Quản lý" : "Nhân viên"}
              </div>
            </div>
          </div>
        </Box>}
    </>
  else
    return (
      <>
        {/* Thông tin cá nhân */}
        {isLoading ? <Spinner fontSize='1rem' mr='8px' /> :
          <Box as='form' onSubmit={handleSubmit(onSubmitProfile)}>
            <h4 className='h4 mt-6'>Thông tin cá nhân</h4>
            <hr className='mb-6' />
            <div className='columns-2'>
              <div className='grid grid-cols-12'>
                <div className='col col-span-5 mt-2'>
                  <FormLabel htmlFor='username'>Tên tài khoản:</FormLabel>
                </div>
                <div className='col col-span-6'>
                  <Input
                    id='username'
                    name='username'
                    type='text'
                    placeholder='Họ và tên'
                    {...register('username', { required: true })}
                  />
                  {errors?.username && <ErrorMessage />}
                </div>
              </div>
              <div className='grid grid-cols-12 mt-4'>
                <div className='col col-span-5 mt-2'>
                  <FormLabel htmlFor='name'>Họ và tên:</FormLabel>
                </div>
                <div className='col col-span-6'>
                  <Input
                    id='name'
                    name='name'
                    type='text'
                    placeholder='Họ và tên'
                    {...register('name', { required: true })}
                  />
                  {errors?.name && <ErrorMessage />}
                </div>
              </div>
              <div className='grid grid-cols-12 mt-4'>
                <div className='col col-span-5 mt-2'>
                  <FormLabel htmlFor='gender'>Giới tính:</FormLabel>
                </div>
                <div className='col col-span-6'>
                  <Controller
                    name='gender'
                    control={control}
                    rules={{
                      required: true,
                    }}
                    render={({ field }) => (
                      <Select {...field} isRequired placeholder='Chọn giới tính'>
                        <option value={"male"}>Nam</option>
                        <option value={"female"}>Nữ</option>
                      </Select>
                    )}
                  />
                  {errors?.gender && <ErrorMessage />}
                </div>
              </div>
              <div className='grid grid-cols-12 mt-4'>
                <div className='col col-span-5 mt-2'>
                  <FormLabel htmlFor='gender'>Ngày sinh:</FormLabel>
                </div>
                <div className='col col-span-6'>
                  {!cantEdit ? <Controller
                    name='DOB'
                    control={control}
                    rules={{
                      required: true,
                    }}
                    render={({ field }) => (
                      <Datepicker
                        value={data.DOB ?? new Date(0, 0, 1)}
                        onChange={(value) => {
                          data.DOB = value;
                          field.onChange(value);
                        }}
                      />
                    )}
                  /> :
                    <div className='mt-2'>
                      {data.DOB ? new Date(data.DOB).toLocaleDateString("vi-VN") : "chưa có thông tin"}
                    </div>
                  }
                  {errors?.DOB && <ErrorMessage />}
                </div>
              </div>
              <div className='grid grid-cols-12 mt-4'>
                <div className='col col-span-5 mt-2'>
                  <FormLabel htmlFor='address'>Địa chỉ:</FormLabel>
                </div>
                <div className='col col-span-6'>
                  <Input
                    id='address'
                    {...register('address')}
                    placeholder='Địa chỉ'
                  />
                  {errors?.address && <ErrorMessage />}
                </div>
              </div>
              <div className='grid grid-cols-12 mt-12'>
                <div className='col col-span-5 mt-2'>
                  <FormLabel htmlFor='phoneNumber'>Số điện thoại:</FormLabel>
                </div>
                <div className='col col-span-6'>
                  <Input
                    placeholder='Số điện thoại'
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
                </div>
              </div>
              <div className='grid grid-cols-12 mt-4'>
                <div className='col col-span-5 mt-2'>
                  <FormLabel htmlFor='email'>Email:</FormLabel>
                </div>
                <div className='col col-span-6'>
                  <Input
                    id='email'
                    type='email'
                    placeholder='Email'
                    {...register('email')}
                  />
                  {errors?.email && <ErrorMessage />}
                </div>
              </div>
              <div className='grid grid-cols-12 mt-4'>
                <div className='col col-span-5 mt-2'>
                  <FormLabel htmlFor='jobTitle'>Chức vụ:</FormLabel>
                </div>
                <div className='col col-span-6'>
                  <Controller
                    name='jobId'
                    control={control}
                    rules={{
                      required: true,
                    }}
                    render={({ field }) => (
                      <Select {...field} disabled={role === 'admin' ? false : true}>
                        <option value selected hidden>
                          Chọn chức vụ
                        </option>
                        {jobs.map(({ _id, name }) => (
                          <option value={_id}>{name}</option>
                        ))}
                      </Select>
                    )}
                  />
                  {errors?.jobTitle && <ErrorMessage />}
                </div>
              </div>
              <div className='grid grid-cols-12 mt-4'>
                <div className='col col-span-5 mt-2'>
                  <FormLabel htmlFor='role'>Quyền hạn tài khoản:</FormLabel>
                </div>
                <div className='col col-span-6'>
                  <Controller
                    name='role'
                    control={control}
                    defaultValue={"user"}
                    rules={{
                      required: true,
                    }}
                    render={({ field }) => (
                      <Select {...field} disabled={role === 'admin' ? false : true}>
                        <option value={"admin"}>Quản trị viên</option>
                        <option value={"manager"}>Quản lý</option>
                        <option value={"user"}>Nhân viên</option>
                      </Select>
                    )}
                  />
                  {errors?.role && <ErrorMessage />}
                </div>
              </div>

              <div className='flex justify-end items-center mt-10'>
                <Button variant='primary' type='submit'>
                  Cập nhật
                </Button>
              </div>
            </div>
          </Box>}
      </>
    );
};

export default ProfileInfo;
