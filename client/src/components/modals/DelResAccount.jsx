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
import { deleteUser, forceDeleteUser, restoreUser } from '../../features/user/userSlice';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';


const DelResAccount = ({ slug, deleted = false, deletedBy = null, restore = false, children }) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [password, setPassword] = useState("");

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const delresAccount = async () => {
        await dispatch(restore ? restoreUser({ slug, password }) : !deleted ? deleteUser({ slug, password }) : forceDeleteUser({ slug, password }));
        handleClose();
        navigate('/nguoi-dung');
    };

    function handleClose() {
        setPassword("")
        onClose()
    }

    const childrenWithProps = React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
            return React.cloneElement(child, { onClick: onOpen });
        }
        return child;
    });

    return (
        <>
            {/* Button */}
            {childrenWithProps}
            <Modal
                isOpen={isOpen}
                onClose={onClose}
            >
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>{!deleted ? "Xóa" : restore ? "Khôi phục" : "Xóa vĩnh viễn"} tài khoản</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                        <FormControl>
                            <FormLabel>Vui lòng nhập mật khẩu để {!deleted ? "xóa" : restore ? "khôi phục" : "xóa vĩnh viễn"} tài khoản</FormLabel>
                            <Input type={"password"} placeholder='' value={password} onChange={(event) => { setPassword(event.target.value); }} />
                        </FormControl>
                    </ModalBody>

                    <ModalFooter>
                        <Button onClick={onClose}>Hủy</Button>
                        <Button colorScheme='red' ml={3} onClick={delresAccount}>
                            {restore ? "Khôi phục" : "Xoá"}
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

export default DelResAccount;