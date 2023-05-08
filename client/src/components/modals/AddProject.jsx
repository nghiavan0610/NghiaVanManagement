import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Textarea,
  useDisclosure,
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useQueryClient } from 'react-query';
import { useDispatch, useSelector } from 'react-redux';
import { addProject, updateProject } from '../../features/project/projectSlice';
import Datepicker from '../../partials/actions/Datepicker';
import ErrorMessage from '../../utils/ErrorMessage';
/**
 *
 * @children Pass in the button
 */

const AddProject = ({ children, project }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [loading, setLoading] = useState(false);
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
      const { name, location, startedAt, description, code } = project;

      reset({
        code,
        name,
        location,
        startedAt,
        description,
      });
    }
  }, [project]);

  const queryClient = useQueryClient();

  const onSubmit = async (formData) => {
    setLoading(true);

    if (project) {
      await dispatch(updateProject({ slug: project.slug, oldData: project, formData }));
      queryClient.invalidateQueries(['projects']);
    } else {
      await dispatch(addProject({ ...formData, updatedBy: _id }));
      reset();
    }

    setLoading(false);
    onClose();
  };

  const onSubmitDone = async (formData) => {
    setLoading(true);

    if (project) {
      await dispatch(updateProject({ slug: project.slug, oldData: project, formData: { ...project, isDone: true } }));
      queryClient.invalidateQueries(['projects']);
    }

    setLoading(false);
    onClose();
  };

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
        onClose={onClose}
      >
        <ModalOverlay />
        <ModalContent as='form' onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader textAlign='center'>Thông tin dự án</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl>
              <FormLabel>
                Mã dự án <span className='text-red-500'>*</span>
              </FormLabel>
              <Input
                ref={initialRef}
                placeholder='Mã dự án'
                {...register('code', { required: true })}
              />
              {renderError('code')}
            </FormControl>

            <FormControl mt={4}>
              <FormLabel>
                Tên dự án <span className='text-red-500'>*</span>
              </FormLabel>
              <Input
                ref={initialRef}
                placeholder='Tên dự án'
                {...register('name', { required: true })}
              />
              {renderError('name')}
            </FormControl>

            <FormControl mt={4}>
              <FormLabel>
                Địa điểm <span className='text-red-500'>*</span>
              </FormLabel>
              <Input
                ref={initialRef}
                placeholder='Địa điểm'
                {...register('location', { required: true })}
              />
              {renderError('location')}
            </FormControl>

            <FormControl mt={4}>
              <FormLabel>
                Thời điểm khởi công <span className='text-red-500'>*</span>
              </FormLabel>

              <Controller
                name='startedAt'
                control={control}
                defaultValue={project?.startedAt || new Date()}
                rules={{
                  required: true,
                }}
                render={({ field }) => (
                  <Datepicker
                    defaultDate={project?.startedAt || new Date()}
                    value={field.value}
                    onChange={field.onChange}
                    limitDate={false}
                  />
                )}
              />
            </FormControl>

            <FormControl mt={4}>
              <FormLabel>
                Mô tả
              </FormLabel>
              <Textarea
                placeholder='Nhập mô tả'
                {...register('description')}
              />
              {renderError('description')}
            </FormControl>
          </ModalBody>

          <ModalFooter>
            {project && <Button
              className='mx-auto ml-0'
              colorScheme='green'
              disabled={loading}
              onClick={handleSubmit(onSubmitDone)}
            >
              Hoàn thành dự án
            </Button>}
            <Button onClick={onClose} mr={3}>
              Hủy
            </Button>
            <Button
              background='primary'
              color='white'
              type='submit'
              disabled={loading}
            >
              {project ? 'Lưu' : 'Tạo'} dự án
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal >
    </>
  );
};

export default AddProject;
