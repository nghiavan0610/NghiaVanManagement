import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
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
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import ErrorMessage from '../../utils/ErrorMessage';
import Select from 'react-tailwindcss-select';
import { useDispatch, useSelector } from 'react-redux';
import { getOneMaterialType } from '../../features/materialSlice';
import { FaPlus } from 'react-icons/fa';
import { axios_instance } from '../../utils/axios';
import { showToast } from '../../utils/toast';

/**
 *
 * @children Pass in the button
 */

const AddMaterial = ({ children, currentMatList, onAddedMaterial, matType }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { materials, isLoading } = useSelector((state) => state.material);
  const [matList, setMatList] = useState(materials[matType])

  const [newMatAdded, setNewMatAdded] = useState(false)
  const [newMat, setNewMat] = useState('')

  const dispatch = useDispatch();

  const initialRef = React.useRef();
  const finalRef = React.useRef();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
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
      const [matId, matStat] = mat.split('_');
      const matchingMat = matList.find((m) => m._id === matId);

      let name = matchingMat ? matchingMat.name : '';
      if (matStat === 'isRecalled') {
        name += ' (thu hồi)';
      } else if (matStat === 'isReassembled') {
        name += ' (lắp lại)';
      }

      return {
        value: mat,
        label: name
      };
    });
  });

  const [addedMatNormal, setAddedMatNormal] = useState(() => addedMat.filter((mat) => !mat.value.split('_')[1]))
  const [addedMatRecalled, setAddedMatRecalled] = useState(() => addedMat.filter((mat) => mat.value.split('_')[1] === 'isRecalled'))
  const [addedMatReassembled, setAddedMatReassembled] = useState(() => addedMat.filter((mat) => mat.value.split('_')[1] === 'isReassembled'))

  const handleChangeNormal = value => {
    setAddedMatNormal(value);
  };
  const handleChangeRecalled = value => {
    setAddedMatRecalled(value);
  };
  const handleChangeReassembled = value => {
    setAddedMatReassembled(value);
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
          <ModalHeader textAlign='center'>Chỉnh sửa danh sách vật tư</ModalHeader>
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

            <FormControl className='mt-2'>
              <FormLabel>
                Danh sách vật tư (lắp lại)
              </FormLabel>
              <Select
                primaryColor={"indigo"}
                value={addedMatReassembled}
                isSearchable
                onChange={(selectedOption) => {
                  handleChangeReassembled(selectedOption);
                }}
                options={matList?.map((mat) => {
                  return {
                    value: `${mat._id}_isReassembled`,
                    label: `${mat.name} (lắp lại)`
                  }
                }) || []}
                isMultiple={true}
              />
              {renderError('materialName_isReassembled')}
            </FormControl>
          </ModalBody>

          <Accordion allowToggle p={'4'}>
            <AccordionItem>
              <h2>
                <AccordionButton>
                  <Box as="span" flex='1' textAlign='left'>
                    Thêm vật tư
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4}>
                <div className='flex items-center gap-2'>
                  <FormControl isRequired>
                    <Input
                      placeholder={`Tên vật tư`}
                      value={newMat}
                      onChange={(event) => setNewMat(event.target.value)}
                    />
                  </FormControl>
                  <Button
                    leftIcon={<FaPlus />}
                    onClick={async () => {
                      if (newMat.trim() === '') {
                        showToast('error', "Tên vật tư không được để trống.")
                        return;
                      }
                      setNewMatAdded(true);
                      const _matType = matType.slice(0, -1).charAt(0).toUpperCase() + matType.slice(0, -1).substring(1);
                      await axios_instance
                        .post(`/materials/create-material`, {
                          materialType: _matType,
                          name: newMat
                        })
                        .then(function (response) {
                          setMatList([...matList, response.data.data[_matType]]);
                          showToast('success', "Đã thêm vật tư.")
                        })
                        .catch(function (error) {
                          console.log(error);
                          showToast('error', "Lỗi khi thêm vật tư.")
                        });
                    }}
                  >
                    Thêm
                  </Button>
                </div>
              </AccordionPanel>
            </AccordionItem>
          </Accordion>

          <ModalFooter>
            <Button onClick={onClose} mr={3}>
              Hủy
            </Button>
            <Button background='primary' color='white' type='submit' onClick={() => {
              let _addedMat = ([...addedMatNormal, ...addedMatRecalled, ...addedMatReassembled])
              if (_addedMat != null) {
                onAddedMaterial(_addedMat.map((m) => {
                  return m.value
                }));
              } else {
                onAddedMaterial([])
              }
              if (newMatAdded)
                dispatch(getOneMaterialType(matType));
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
