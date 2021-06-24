import { extendTheme, ThemeConfig, withDefaultProps } from "@chakra-ui/react";

const config: ThemeConfig = {
  initialColorMode: "dark",
  useSystemColorMode: false,
};

const theme = extendTheme({
  config,
  styles: {
    global: {
      body: {
        bg: '#141414',
      },
      html: {
        bg: '#141414',
      }
    }
  },
  colors: {
    brandOrange: {
      500: '#FF6240'
    },
    cardBackground: '#131111',
    cardBorder: '#261C1A',
    formBackground: '#292828',
  },
  components: {
    Button: {
      baseStyle: {
        rounded: "3xl",
      },
      defaultProps: {
        px: 10,
        py: 6,
      },
      variants: {
        solid: {
          bg: "brandOrange.500",
          px: 10,
          py: 6,
        }
      }
    }
  }
});
export default theme;
