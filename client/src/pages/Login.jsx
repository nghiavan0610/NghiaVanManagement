import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import Cookies from 'universal-cookie';
import { getMe, login } from '../features/user/userSlice';
import bg from '../images/bg.png';
import logo from '../images/company-logo.svg';
import ErrorMessage from '../utils/ErrorMessage';

const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const dispatch = useDispatch();
  const cookies = new Cookies();
  const { isLoading, auth } = useSelector((state) => state.user);
  const [formLoading, setFormLoading] = useState(false);
  const onSubmit = async (formData) => {
    setFormLoading(true);

    const resultAction = await dispatch(login(formData));

    if (login.fulfilled.match(resultAction)) {
      const data = resultAction.payload.data;
      cookies.set('accessToken', data.accessToken, { path: '/' });
      cookies.set('refreshToken', data.refreshToken, { path: '/' });
      cookies.set('user-slug', data.user.slug, { path: '/' })
    }
    setFormLoading(false);
  };

  const renderError = (name, type = 'required') => {
    if (name in errors && errors[name].type === type) {
      return <ErrorMessage />;
    }
    return null;
  };

  useEffect(() => {
    dispatch(getMe());
  }, [auth]);

  if (isLoading) {
    return (
      <Flex h='100vh' w='100vw' justifyContent='center' alignItems='center' />
    );
  }
  if (auth) {
    return <Navigate to='/du-an' />;
  }

  return (
    <Flex h='100vh' overflow='hidden'>
      <Flex
        w='40%'
        flexDir='column'
        px={{ base: '3rem', xl: '4rem' }}
        justifyContent='center'
      >
        <Box as='img' src={logo} alt='logo' height='100px' mb='5rem' />
        <Box as='form' onSubmit={handleSubmit(onSubmit)}>
          <FormControl>
            <FormLabel>
              Tên người dùng <span className='text-red-500'>*</span>
            </FormLabel>
            <Input
              placeholder='Nhập tên người dùng'
              {...register('username', { required: true })}
            />
            {renderError('username')}
          </FormControl>

          <FormControl mt={4}>
            <FormLabel>
              Mật khẩu <span className='text-red-500'>*</span>
            </FormLabel>
            <Input
              placeholder='Nhập mật khẩu'
              type='password'
              {...register('password', { required: true })}
            />
            {renderError('password')}
          </FormControl>
          <FormControl mt={8}>
            <Button
              variant='primary'
              display='block'
              isFullWidth
              type='submit'
              disabled={formLoading}
            >
              ĐĂNG NHẬP
            </Button>
          </FormControl>

          <FormControl mt={8}>
            <FormLabel>
                Account: <span className="text-red-500">admin - 123456789</span>
            </FormLabel>
          </FormControl>
        </Box>
      </Flex>
      <Box w='60%' backgroundImage={bg} bgRepeat='no-repeat' bgSize='cover' />
    </Flex>
  );
};

export default Login;
