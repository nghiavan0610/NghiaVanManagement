
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
    Select
} from '@chakra-ui/react';
import Datepicker from '../../partials/actions/Datepicker';
import ErrorMessage from '../../utils/ErrorMessage';
import { Controller, useForm } from 'react-hook-form';
import { useDispatch } from "react-redux";
import { addMaterial, editMaterial, removeMaterial } from '../../features/materialSlice';

const MaterialView = ({ children, matId, matType, matName, matTypes, isAdd = false, isAdmin }) => {
    const dispatch = useDispatch();

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
            return React.cloneElement(child, {
                onClick: () => {
                    if (isAdmin) onOpen()
                    setValue('name', matName);
                    setValue('materialType', matType);
                }
            });
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
        await dispatch(isAdd ? addMaterial(formData) : editMaterial({ matId, formData }));
        handleClose();
    };

    const removeMat = async (formData) => {
        await dispatch(removeMaterial({ matId, formData }));
        handleClose();
    };

    const handleClose = () => {
        isAdd && reset({
            name: ""
        });
        onClose();
    };

    return (
        <>
            {/* Button */}
            {childrenWithProps}
            <Modal isOpen={isOpen} onClose={handleClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>{`${isAdd ? "Thêm" : "Chỉnh sửa"} vật tư`}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <FormControl isRequired>
                            <FormLabel>Tên vật tư</FormLabel>
                            <Input
                                id='name'
                                name='name'
                                // defaultValue={matName}
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
                                // defaultValue={matType}
                                rules={{
                                    required: true,
                                }}
                                render={({ field }) => (
                                    <Select {...field} isDisabled={!isAdd}>
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
                        {!isAdd &&
                            <Button className='mr-2' onClick={handleSubmit(removeMat)}>
                                Xóa
                            </Button>
                        }
                        <Button className='mr-2' onClick={handleClose}>
                            Hủy
                        </Button>
                        <Button colorScheme="red" onClick={handleSubmit(onSubmit)}>
                            {isAdd ? "Thêm" : "Chỉnh sửa"}
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

export default MaterialView;
