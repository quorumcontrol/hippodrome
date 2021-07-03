import * as React from "react"
import { ChakraProvider } from "@chakra-ui/react"
import { BrowserRouter as Router, Switch, Route } from "react-router-dom"
import Layout from "./layouts/Layout"
import Swap from "./pages/Swap"
import Stake from "./pages/Stake"
import { ChainProvider } from "./hooks/useChainContext"
import LockAndMint from "./pages/LockAndMint"
import theme from "./theme"

export const App = () => (
  <ChakraProvider theme={theme}>
    <ChainProvider>
      <Router>
        <Layout>
          <Switch>
            <Route
              path="/transaction/mint/:asset/:to/:nonce/:outputToken"
              exact
            >
              <LockAndMint />
            </Route>
            <Route path="/stake">
              <Stake />
            </Route>
            <Route path="/">
              <Swap />
            </Route>
          </Switch>
        </Layout>
      </Router>
    </ChainProvider>
  </ChakraProvider>
)
