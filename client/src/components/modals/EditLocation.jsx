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
    Popover,
    PopoverTrigger,
    PopoverContent,
    PopoverHeader,
    PopoverBody,
    PopoverFooter,
    PopoverArrow,
    PopoverCloseButton,
    PopoverAnchor,
    Portal,
    ButtonGroup,
    useDisclosure,
    IconButton,
} from '@chakra-ui/react';
import { data } from 'autoprefixer';
import React from 'react';
import { useForm } from 'react-hook-form';
import { FaEdit } from 'react-icons/fa';
import ErrorMessage from '../../utils/ErrorMessage';

/**
 *
 * @children Pass in the button
 */

const EditLocation = ({ type, name, onChangedLocation, setDisableBottomButton, onDeletedLocation, children, onSubmit: parentOnSubmit, isOpen = false, onClose }) => {
    const { _, onOpen, __ } = useDisclosure();
    const initialRef = React.useRef();
    const finalRef = React.useRef();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const onSubmit = (data) => {
        onChangedLocation(data.locationName)
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

    let title = "";
    switch (type) {
        case "route":
            title = "tuyến"
            break;
        case "station":
            title = "trạm"
            break;
        case "pillar":
            title = "trụ"
            break;
    }

    return (
        <>
            {/* Button */}
            {childrenWithProps}

            <Popover placement="right"
                initialFocusRef={initialRef}
                finalFocusRef={finalRef}
                isOpen={isOpen}
                onClose={onClose}
            >
                <PopoverTrigger><div></div></PopoverTrigger>
                <Portal>
                    <PopoverContent as='form' onSubmit={handleSubmit(onSubmit)}
                        onMouseOver={() => type !== "pillar" && setDisableBottomButton(true)}
                        onMouseLeave={() => type !== "pillar" && setDisableBottomButton(false)}
                    >
                        <PopoverArrow />
                        <PopoverBody>
                            <FormControl>
                                <FormLabel>
                                    Tên {title} <span className='text-red-500'>*</span>
                                </FormLabel>
                                <Input
                                    ref={initialRef}
                                    defaultValue={name}
                                    placeholder={`Tên ${title}`}
                                    {...register('locationName', { required: true })}
                                />
                                {renderError('locationName')}
                            </FormControl>
                        </PopoverBody>
                        <PopoverFooter display='flex' justifyContent='flex-end'>
                            <ButtonGroup size='sm'>
                                <Button onClick={() => {
                                    onDeletedLocation()
                                    onClose()
                                }} mr={3} background='primary' color='white'>
                                    Xóa {title}
                                </Button>
                                <Button onClick={onClose} mr={3}>
                                    Hủy
                                </Button>
                                <Button background={"#0000FF"} color='white' type='submit'>
                                    Cập nhật
                                </Button>
                            </ButtonGroup>
                        </PopoverFooter>
                    </PopoverContent>
                </Portal>
            </Popover>
        </>
    );
};

export default EditLocation;
