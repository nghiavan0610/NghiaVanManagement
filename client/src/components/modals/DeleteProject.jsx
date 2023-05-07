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
import { deleteUser, restoreUser } from '../../features/user/userSlice';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { showToast } from '../../utils/toast';
import { deleteProject } from '../../features/project/projectSlice';


const DeleteProject = ({ slug, origCode, children }) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [code, setCode] = useState("");

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const delProject= async () => {
        if(code === origCode) {
            await dispatch(deleteProject(slug));
            handleClose();
            navigate('/du-an');
        } else {
            showToast('error', 'Mã dự án sai!');
            handleClose();
        }

    };

    function handleClose() {
        setCode("")
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
                    <ModalHeader>Xóa dự án</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                        <FormControl>
                            <FormLabel>Vui lòng mã dự án để xóa dự án</FormLabel>
                            <Input placeholder='' value={code} onChange={(event) => { setCode(event.target.value); }} />
                        </FormControl>
                    </ModalBody>

                    <ModalFooter>
                        <Button onClick={onClose}>Hủy</Button>
                        <Button colorScheme='red' ml={3} onClick={delProject}>
                            Xóa
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

export default DeleteProject;