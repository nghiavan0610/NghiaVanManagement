
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
import { reviewTimesheet, uploadTimesheet } from '../../features/project/projectSlice';
import { useDispatch } from "react-redux";

const AddCommentForTimesheet = ({ children, timesheetId, slug }) => {
    const dispatch = useDispatch();

    const [proof, setProof] = useState(null);

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
        const data = {
            ...formData,
            timesheetId: timesheetId,
            isApproved: false,
            proofId: ""
        }

        await dispatch(reviewTimesheet({ data, slug }));
        handleClose();
    };

    const handleClose = () => {
        reset();
        setProof(null)
        onClose();
    };

    return (
        <>
            {/* Button */}
            {childrenWithProps}
            <Modal isOpen={isOpen} onClose={handleClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Thêm ghi chú</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <FormControl isRequired>
                            <FormLabel htmlFor='proof'>Ghi chú</FormLabel>
                            <Input
                                id='comment'
                                name='comment'
                                onInput={(e) => setProof(e.target.files)}
                                placeholder={`Ghi chú`}
                                {...register('comment', { required: true })}
                            />
                            {renderError('comment')}
                        </FormControl>
                        <FormControl mt={4} isRequired>
                            <FormLabel>Ngày</FormLabel>
                            <Controller
                                name='workDate'
                                control={control}
                                defaultValue={new Date().setHours(0,0,0,0)}
                                rules={{
                                    required: true,
                                }}
                                render={({ field }) => (
                                    <Datepicker
                                        defaultDate={new Date().setHours(0,0,0,0)}
                                        value = {field.value}
                                        onChange={field.onChange}
                                    />
                                )}
                            />
                        </FormControl>
                    </ModalBody>
                    <ModalFooter>
                        <Button className='mr-2' onClick={handleClose}>
                            Hủy
                        </Button>
                        <Button colorScheme="red" onClick={handleSubmit(onSubmit)}>
                            Thêm
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

export default AddCommentForTimesheet;
