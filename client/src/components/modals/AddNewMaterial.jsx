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
  useDisclosure,
  Select,
} from '@chakra-ui/react';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import ErrorMessage from '../../utils/ErrorMessage';
import { IoAdd } from 'react-icons/io5';
import MaterialView from './MaterialView';
import Materials from '../../pages/Materials';
import { useDispatch } from 'react-redux';
import { addMaterial } from '../../features/materialSlice';

const matTypes = [
  {
    id: "DayDan",
    text: "Dây dẫn"
  },
  {
    id: "Tru",
    text: "Trụ"
  },
  {
    id: "Mong",
    text: "Móng"
  },
  {
    id: "Da",
    text: "Đà"
  },
  {
    id: "XaSu",
    text: "Xà sứ"
  },
  {
    id: "BoChang",
    text: "Bộ chằng"
  },
  {
    id: "TiepDia",
    text: "Tiếp địa"
  },
  {
    id: "PhuKien",
    text: "Phụ kiện"
  },
  {
    id: "ThietBi",
    text: "Thiết bị"
  }
]

const AddNewMaterial = ({ children, matType = undefined }) => {
  const dispatch = useDispatch();

  // matType = matType.charAt(0).toUpperCase() + matType.substring(1,matType.length-1);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    handleSubmit,
    register,
    setValue,
    control,
    reset,
    formState: { errors },
  } = useForm();

  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { onClick: () => {
        onOpen();
        setValue('materialType', matType);
      } });
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
    await dispatch(addMaterial(formData));
    handleClose();
  };

  const handleClose = () => {
    reset({ name: "" })
    onClose();
  };

  return (
    <>
      {/* Button */}
      {childrenWithProps}

      <Modal
        isOpen={isOpen}
        onClose={handleClose}
      >
        <ModalOverlay />
        <ModalContent as='form'>
          <ModalHeader textAlign='center'>Quản lí vật tư</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl isRequired>
              <FormLabel>Tên vật tư mới</FormLabel>
              <Input
                id='name'
                name='name'
                placeholder={`Tên vật tư`}
                {...register('name', { required: true })}
              />
              {renderError('name')}
            </FormControl>
            <FormControl mt={4} isRequired>
              <FormLabel>
                Loại vật tư
              </FormLabel>
              <Controller
                name='materialType'
                control={control}
                rules={{
                  required: true,
                }}
                render={({ field }) => (
                  <Select {...field} placeholder='Chọn loại vật tư'>
                    {
                      matTypes.map((materialType) => {
                        return <option value={materialType.id}>{materialType.text}</option>
                      })
                    }
                  </Select>
                )}
              />
              {renderError('materialType')}
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button className='mr-2' onClick={handleClose}>
              Hủy
            </Button>
            <Button colorScheme="red" onClick={handleSubmit(onSubmit)}>Thêm</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default AddNewMaterial;
