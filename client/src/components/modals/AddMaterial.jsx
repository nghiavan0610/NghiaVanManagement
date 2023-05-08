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
} from '@chakra-ui/react';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import ErrorMessage from '../../utils/ErrorMessage';
import Select from 'react-tailwindcss-select';

/**
 *
 * @children Pass in the button
 */

const AddMaterial = ({ children, matList, currentMatList, onAddedMaterial, onSubmit: parentOnSubmit }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const initialRef = React.useRef();
  const finalRef = React.useRef();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    parentOnSubmit(data);
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

  const [addedMat, setAddedMat] = useState(() => {
    return currentMatList.map((mat) => {
      let name = "";
      for (let i = 0; i < matList?.length; i++) {
        if (matList[i]._id === mat.split('_')[0]) {
          if (mat.split('_')[1])
            name = `${matList[i].name} (thu hồi)`;
          else
            name = matList[i].name;
          break;
        }
      }
      return {
        value: mat,
        label: name
      }
    })
  });

  const [addedMatNormal, setAddedMatNormal] = useState(() => addedMat.filter((mat) => !mat.value.split('_')[1]))
  const [addedMatRecalled, setAddedMatRecalled] = useState(() => addedMat.filter((mat) => mat.value.split('_')[1]))

  const handleChangeNormal = value => {
    setAddedMatNormal(value);
  };
  const handleChangeRecalled = value => {
    setAddedMatRecalled(value);
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
          <ModalHeader textAlign='center'>Thêm danh sách vật tư</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl>
              <FormLabel>
                Danh sách vật tư
              </FormLabel>
              <Select
                primaryColor={"indigo"}
                value={addedMatNormal}
                isSearchable
                onChange={(selectedOption) => {
                  handleChangeNormal(selectedOption);
                }}
                options={matList?.map((mat) => {
                  return {
                    value: mat._id,
                    label: mat.name
                  }
                }) || []}
                isMultiple={true}
              />
              {renderError('materialName')}
            </FormControl>

            <FormControl className='mt-2'>
              <FormLabel>
                Danh sách vật tư (thu hồi)
              </FormLabel>
              <Select
                primaryColor={"indigo"}
                value={addedMatRecalled}
                isSearchable
                onChange={(selectedOption) => {
                  handleChangeRecalled(selectedOption);
                }}
                options={matList?.map((mat) => {
                  return {
                    value: `${mat._id}_isRecalled`,
                    label: `${mat.name} (thu hồi)`
                  }
                }) || []}
                isMultiple={true}
              />
              {renderError('materialName_isRecalled')}
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button onClick={onClose} mr={3}>
              Hủy
            </Button>
            <Button background='primary' color='white' type='submit' onClick={() => {
              let _addedMat = ([...addedMatNormal, ...addedMatRecalled])
              if (_addedMat != null) {
                onAddedMaterial(_addedMat.map((m) => {
                  return m.value
                }));
              } else {
                onAddedMaterial([])
              }
              onClose();
            }}>
              Cập nhật
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default AddMaterial;
