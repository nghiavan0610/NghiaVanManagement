import {
  Button,
  FormControl,
  FormLabel,
  Input,
  useDisclosure,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverFooter,
  PopoverArrow,
  ButtonGroup,
  Tooltip,
  Box,
  Stack
} from '@chakra-ui/react';
import React, { useState, useRef, useLayoutEffect } from "react";
import { useForm } from 'react-hook-form';

import ErrorMessage from '../../utils/ErrorMessage';
import { memo } from 'react';



const ValueBox = memo((props) => {
  const { onOpen, onClose, isOpen } = useDisclosure();
  const initialRef = useRef();
  const finalRef = useRef();

  const {
    value: propValue,
    canEdit: propCanEdit,
    comment: propComment,
    needComment: propNeedComment,
    origValue,
    onValueChange,
    onValueAndCommentSubmit,
  } = props;

  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(propValue);
  const [canEdit, setCanEdit] = useState(propCanEdit);
  const [comment, setComment] = useState(propComment);
  const [needComment, setNeedComment] = useState(propNeedComment);

  const inputRef = useRef(null);

  useLayoutEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.style.width = `${inputRef.current.value.length + 3}ch`;
    }
  }, [editing, value]);

  const handleClick = () => {
    canEdit && setEditing(true);
  };

  const handleBlur = () => {
    setEditing(false);
    onValueChange(value);
  };

  const handleChange = (event) => {
    setValue(parseFloat(event.target.value) || null);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.target.blur();
    }
  };

  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    data.quantity = parseFloat(data.quantity) || null;
    setValue(data.quantity);
    setComment(data.comment);
    onValueAndCommentSubmit(data);
    onClose();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const renderError = (name, type = 'required') => {
    if (name in errors && errors[name].type === type) {
      return <ErrorMessage />;
    }
    return null;
  };

  if (editing && !needComment) {
    return (
      <input
        type="number"
        className="form-control"
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        autoFocus
        ref={inputRef}
      />
    );
  }

  if (!editing) {
    return (
      <Tooltip
        label={
          comment && (
            <Stack>
              <div>Ghi chú: {comment}</div>
              <div>Giá trị gốc: {origValue?.quantity ?? 0}</div>
            </Stack>
          )
        }
      >
        <div className={`p-2 text-center ${value && "cursor-pointer"}`} onClick={handleClick}>
          {value && Math.round(value * 100) / 100}
        </div>
      </Tooltip>
    );
  }

  return (
    <Popover isOpen={isOpen} onOpen={onOpen} onClose={handleClose}>
      <Tooltip label={comment} placement="top">
        {/* additional element */}
        <Box>
          <PopoverTrigger>
            <div className="p-2 text-center cursor-default" onClick={handleClick}>
              {value}
            </div>
          </PopoverTrigger>
        </Box>
      </Tooltip>

      <PopoverContent as="form" onSubmit={handleSubmit(onSubmit)}>
        <PopoverArrow />
        <PopoverBody>
          <FormControl className="text-[#4a5567]">
            <FormLabel>
              Giá trị <span className="text-red-500">*</span>
            </FormLabel>
            <Input
              ref={initialRef}
              defaultValue={value}
              placeholder="Giá trị"
              {...register("quantity", { required: true })}
            />
            {renderError("quantity")}
          </FormControl>
          <FormControl className="text-[#4a5567]">
            <FormLabel>
              Ghi chú <span className="text-red-500">*</span>
            </FormLabel>
            <Input
              ref={finalRef}
              defaultValue={comment}
              placeholder="Ghi chú"
              {...register("comment", { required: true })}
            />
            {renderError("comment")}
          </FormControl>
          <PopoverFooter display="flex" justifyContent="flex-end">
            <ButtonGroup size="sm">
              <Button onClick={handleClose} mr={3}>
                Hủy
              </Button>
              <Button background="primary" color="white" type="submit">
                OK
              </Button>
            </ButtonGroup>
          </PopoverFooter>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
});


export default ValueBox;
