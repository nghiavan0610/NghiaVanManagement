import { createStandaloneToast } from '@chakra-ui/react'

const { ToastContainer, toast } = createStandaloneToast()

export const showToast = (
  status,
  title,
  description,
  position = 'top-right',
  duration = 3000,
) => {
  toast({
    status,
    title,
    description,
    position,
    duration,
    isClosable: true,
  });
};
