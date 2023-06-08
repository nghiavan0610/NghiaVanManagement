
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
    Stack,
    Radio,
    RadioGroup,
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
        const timezoneOffset = new Date().getTimezoneOffset() * 60000;
        const workDate = new Date(new Date(formData.workDate).getTime() - timezoneOffset)
        const data = {
            ...formData,
            workDate: workDate.toISOString(),
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
                        <Flex className='gap-4'>
                            <FormControl mt={4} isRequired className='w-4/6'>
                                <FormLabel>Ngày</FormLabel>
                                <Controller
                                    name='workDate'
                                    control={control}
                                    defaultValue={new Date().setHours(0, 0, 0, 0)}
                                    rules={{
                                        required: true,
                                    }}
                                    render={({ field }) => (
                                        <Datepicker
                                            defaultDate={new Date().setHours(0, 0, 0, 0)}
                                            value={field.value}
                                            onChange={field.onChange}
                                        />
                                    )}
                                />
                            </FormControl>
                            <FormControl mt={4} isRequired className='w-2/6'>
                                <FormLabel>Ca</FormLabel>
                                <Controller
                                    name='shift'
                                    control={control}
                                    rules={{
                                        required: true,
                                    }}
                                    render={({ field }) => (
                                        <RadioGroup value={field.value} onChange={field.onChange}>
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
                        </Flex>

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
