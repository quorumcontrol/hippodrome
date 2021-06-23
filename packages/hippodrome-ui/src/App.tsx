import * as React from "react";
import { ChakraProvider, theme } from "@chakra-ui/react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Layout from "./layouts/Layout";
import Home from "./pages/Home";
import { ChainProvider } from "./hooks/useChainContext";
import LockAndMint from "./pages/LockAndMint";

export const App = () => (
  <ChakraProvider theme={theme}>
    <ChainProvider>
      <Router>
        <Layout>
          <Switch>
            <Route path="/transaction/mint/:asset/:to/:nonce" exact>
              <LockAndMint />
            </Route>
            <Route path="/">
              <Home />
            </Route>
          </Switch>
        </Layout>
      </Router>
    </ChainProvider>
  </ChakraProvider>
);
