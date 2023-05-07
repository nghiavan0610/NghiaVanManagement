import { createStandaloneToast } from '@chakra-ui/toast';

const toast = createStandaloneToast();

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
