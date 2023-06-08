
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
} from '@chakra-ui/react';
import Datepicker from '../../partials/actions/Datepicker';
import ErrorMessage from '../../utils/ErrorMessage';
import { Controller, useForm } from 'react-hook-form';
import { uploadExcel, uploadTimesheet } from '../../features/project/projectSlice';
import { useDispatch } from "react-redux";
import { showToast } from '../../utils/toast';

const ExcelFileUpload = ({ children, slug, isOriginal = false }) => {
    const dispatch = useDispatch();

    const [file, setFile] = useState(null);
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

    const onSubmit = async () => {
        setDisabled(true)
        let data = new FormData();
        data.append("excel", file[0]);
        data.append('isOriginal', isOriginal ? "true" : "false");

        await dispatch(uploadExcel({ data, slug }));
        handleClose();
    };

    const handleClose = () => {
        reset();
        setFile(null)
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
                            <FormLabel htmlFor='file'>Tệp đính kèm</FormLabel>
                            <label htmlFor='file'>
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
                                            file?.length && `${file.length} tệp được chọn`
                                        }
                                    </text>
                                </Flex>
                            </label>
                            <Input
                                id='file'
                                type='file'
                                accept='.xls, .xlsx'
                                display='none'
                                name='file'
                                onInput={(e) => {
                                    setFile(e.target.files)
                                }}
                                {...register('file', {
                                    required: true
                                })}
                            />
                            {renderError('file')}
                        </FormControl>
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

export default ExcelFileUpload;
