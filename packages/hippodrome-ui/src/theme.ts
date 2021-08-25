import { extendTheme, ThemeConfig } from "@chakra-ui/react"

const config: ThemeConfig = {
  initialColorMode: "dark",
  useSystemColorMode: false,
}

const theme = extendTheme({
  config,
  styles: {
    global: {
      body: {
        bg: "#0d1117",
      },
      html: {
        bg: "#0d1117",
      },
    },
  },
  fonts: {
    "zed-dots": "Zen Dots",
  },
  colors: {
    brandOrange: {
      500: "#FF6240",
    },
    cardBackground: "#131111",
    cardBorder: "#261C1A",
    formBackground: "#292828",
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
        },
      },
    },
  },
})
export default theme
