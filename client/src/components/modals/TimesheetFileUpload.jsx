
import React, { useState } from 'react';
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
  useDisclosure,
  Flex,
  Box,
  RadioGroup,
  Stack,
  Radio,
} from '@chakra-ui/react';
import Datepicker from '../../partials/actions/Datepicker';
import ErrorMessage from '../../utils/ErrorMessage';
import { Controller, useForm } from 'react-hook-form';
import { uploadTimesheet } from '../../features/project/projectSlice';
import { useDispatch } from "react-redux";
import { showToast } from '../../utils/toast';

const TimesheetFileUpload = ({ children, slug, _workDate = undefined, _shift = undefined }) => {
  const dispatch = useDispatch();

  const [proof, setProof] = useState(null);
  const [isDisabled, setDisabled] = useState(false)

  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    handleSubmit,
    register,
    control,
    reset,
    formState: { errors },
  } = useForm();

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

  const onSubmit = async (formData) => {
    setDisabled(true)
    let data = new FormData();
    for (let i = 0; i < proof.length; i++) {
      data.append("proof", proof[i]);
    }

    const timezoneOffset = new Date().getTimezoneOffset() * 60000;
    const workDate = new Date(new Date(formData.workDate).getTime() - timezoneOffset)

    data.append('workDate', _workDate ?? workDate.toISOString());
    data.append('shift', _shift ?? formData.shift);

    await dispatch(uploadTimesheet({ data, slug }));
    handleClose();
  };

  const handleClose = () => {
    reset();
    setProof(null)
    setDisabled(false)
    onClose();
  };

  return (
    <>
      {/* Button */}
      {childrenWithProps}
      <Modal isOpen={isOpen} onClose={handleClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Tải lên Tệp</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl isRequired>
              <FormLabel htmlFor='proof'>Tệp đính kèm</FormLabel>
              <label htmlFor='proof'>
                <Flex
                  alignItems='center'
                  bg='#fff'
                  p='6px 15px'
                  borderRadius='md'
                  border='1px solid'
                // borderColor={error ? 'red.500' : '#CBD5E0'}
                >
                  <Box
                    mr='0.5rem'
                    fontSize='sm'
                    p='2px 5px'
                    bg='#E9EAEC'
                    borderRadius='md'
                    minW='max-content'
                  >
                    Tải tệp lên
                  </Box>
                  <text wordBreak='break-all' fontSize='sm'>
                    {
                      proof?.length && `${proof.length} tệp được chọn`
                    }
                  </text>
                </Flex>
              </label>
              <Input
                id='proof'
                type='file'
                accept='.pdf, .jpg, .jpeg, .png'
                multiple
                display='none'
                name='proof'
                onInput={(e) => {
                  if (e.target.files.length > 10) {
                    showToast('error', "Vui lòng chọn nhiều nhất 10 tệp.")
                    return;
                  }
                  setProof(e.target.files)
                }}
                {...register('proof', {
                  required: true
                })}
              />
              {renderError('proof')}
            </FormControl>
            {!_workDate && <Flex className='gap-4'>
              <FormControl mt={4} isRequired className={'w-4/6'}>
                <FormLabel>Ngày</FormLabel>
                <Controller
                  name='workDate'
                  control={control}
                  defaultValue={_workDate ?? new Date().setHours(0, 0, 0, 0)}
                  rules={{
                    required: true,
                  }}
                  render={({ field }) => (
                    !_workDate && <Datepicker
                      defaultDate={new Date().setHours(0, 0, 0, 0)}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </FormControl>
              <FormControl mt={4} isRequired className={'w-2/6'}>
                <FormLabel>Ca</FormLabel>
                <Controller
                  name='shift'
                  control={control}
                  defaultValue={_workDate}
                  rules={{
                    required: true,
                  }}
                  render={({ field }) => (
                    !_workDate && <RadioGroup value={field.value} onChange={field.onChange}>
                      <Stack direction='column' spacing='0px'>
                        <Radio value='morning'>Sáng</Radio>
                        <Radio value='evening'>Chiều</Radio>
                      </Stack>
                    </RadioGroup>
                  )}
                  {...register('shift', {
                    required: true
                  })}
                />
                {renderError('shift')}
              </FormControl>
            </Flex>}
          </ModalBody>
          <ModalFooter>
            <Button className='mr-2' onClick={handleClose} isDisabled={isDisabled}>
              Hủy
            </Button>
            <Button colorScheme="red" onClick={handleSubmit(onSubmit)} isDisabled={isDisabled}>
              Tải lên
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default TimesheetFileUpload;
