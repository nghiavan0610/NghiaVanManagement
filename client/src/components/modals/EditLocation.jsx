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
import React from 'react';
import { useForm } from 'react-hook-form';
import { IoMdSettings } from 'react-icons/io';
import ErrorMessage from '../../utils/ErrorMessage';

/**
 *
 * @children Pass in the button
 */

const EditLocation = ({ name, onChangedLocation, onDeletedLocation, routeId = undefined, stationId = undefined, pillarId = undefined }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    onChangedLocation(data.locationName, routeId, stationId, pillarId)
    reset(); // Reset form values
    onClose();
  };

  // Call reset on modal close
  const handleClose = () => {
    reset(); // Reset form values
    onClose();
  };

  const renderError = (name, type = 'required') => {
    if (name in errors && errors[name].type === type) {
      return <ErrorMessage />;
    }
    return null;
  };

  let title = "";
  if (!routeId && !stationId) {                                        // Add routes
    title = 'tuyến'
  } else if (routeId && !stationId) {                                 // Add stations
    title = 'nhánh'
  } else if (routeId && stationId) {                                  // Add pillars
    title = 'trụ'
  }

  return (
    <>
      <Popover placement="right"
        isOpen={isOpen}
        onOpen={onOpen}
        onClose={handleClose}
      >
        <PopoverTrigger>
          <IconButton className='m-1.5' size='sm'
            background="#dddddd33" color={(routeId && !stationId) && "white"} icon={<IoMdSettings />} />
        </PopoverTrigger>
        <Portal>
          <PopoverContent as='form' onSubmit={handleSubmit(onSubmit)}
          >
            <PopoverArrow />
            <PopoverBody>
              <FormControl>
                <FormLabel>
                  Tên {title} <span className='text-red-500'>*</span>
                </FormLabel>
                <Input
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
                  onDeletedLocation(routeId, stationId, pillarId);
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
