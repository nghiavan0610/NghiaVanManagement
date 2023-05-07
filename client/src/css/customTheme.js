import { extendTheme, theme } from '@chakra-ui/react';

const customTheme = extendTheme({
  semanticTokens: {
    colors: {
      error: 'red.500',
      success: 'green.500',
      primary: {
        default: '#de3b33',
        _dark: 'red.400',
      },
      secondary: {
        default: 'red.800',
        _dark: 'red.700',
      },
    },
  },
  components: {
    Button: {
      variants: {
        ...theme.components.Button.variants,
        base: {},
        primary: {
          bg: '#de3b33',
          color: '#fff',
          _hover: {
            color: '#fff',
            bg: '#b8261f',
          },
        },
        gray: {
          bg: '#4a5567',
          color: '#fff',
          _hover: {
            bg: '#343c49',
          },
        },
      },
      defaultProps: {
        // Then here we set the base variant as the default
        // variant: "primary",
      },
    },
    Input: {
      baseStyle: {
        fontSize: 'sm',
      },
    },
    Textarea: {
      baseStyle: {
        fontSize: 'sm',
      },
    },
    FormLabel: {
      baseStyle: {
        fontSize: 'sm',
      },
    },
  },
});

export default customTheme;
