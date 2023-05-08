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
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverFooter,
  PopoverArrow,
  PopoverCloseButton,
  PopoverAnchor,
  ButtonGroup,
  Portal,
  IconButton,
  Textarea
} from '@chakra-ui/react';
import { data } from 'autoprefixer';
import React from 'react';
import { useForm } from 'react-hook-form';
import ErrorMessage from '../../utils/ErrorMessage';

import { FaPlus } from 'react-icons/fa';

/**
 *
 * @children Pass in the button
 */

const AddLocation = ({ type, onAddedLocation, children, setDisableBottomButton, parentIndex, index }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const initialRef = React.useRef();
  const finalRef = React.useRef();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    onAddedLocation(data.locationName, type, parentIndex, index);
    reset(); // Reset form values
    onClose();
  };

  // Call reset on modal close
  const handleClose = () => {
    reset(); // Reset form values
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
        onOpen={onOpen}
        onClose={handleClose}
      >
        <PopoverTrigger>
          <IconButton size='sm'
            onMouseOver={() => type !== "route" && setDisableBottomButton(true)}
            onMouseLeave={() => type !== "route" && setDisableBottomButton(false)}
            background="#dddddd33" color="white" icon={<FaPlus />} />
        </PopoverTrigger>
        <Portal>
          <PopoverContent
            onMouseOver={() => type !== "route" && setDisableBottomButton(true)}
            onMouseLeave={() => type !== "route" && setDisableBottomButton(false)}
            as='form' onSubmit={handleSubmit(onSubmit)}
          >
            <PopoverArrow />
            <PopoverBody>
              <FormControl className='text-[#4a5567]'>
                <FormLabel>
                  Tên {title} <span className='text-red-500'>*</span>
                </FormLabel>
                <Textarea 
                  ref={initialRef}
                  placeholder={`Tên ${title}`}
                  {...register('locationName', { required: true })}
                />
                {renderError('locationName')}
              </FormControl>
            </PopoverBody>
            <PopoverFooter display='flex' justifyContent='flex-end'>
              <ButtonGroup size='sm'>
                <Button onClick={onClose} mr={3}>
                  Hủy
                </Button>
                <Button background='primary' color='white' type='submit'>
                  Thêm
                </Button>
              </ButtonGroup>
            </PopoverFooter>
          </PopoverContent>
        </Portal>
      </Popover>
    </>
  );
};

export default AddLocation;
