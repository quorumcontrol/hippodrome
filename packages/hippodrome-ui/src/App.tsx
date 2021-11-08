import * as React from "react";
import { ChakraProvider } from "@chakra-ui/react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  RouteProps,
} from "react-router-dom";
import Layout from "./layouts/Layout";
import Swap from "./pages/Swap";
import Stake from "./pages/Stake";
import { ChainProvider } from "./hooks/useChainContext";
import LockAndMint from "./pages/LockAndMint";
import theme from "./theme";
import Debug from "./pages/Debug";

interface RouteWithLayoutParams extends RouteProps {}

const RouteWithLayout: React.FC<RouteWithLayoutParams> = (userProps) => {
  const { children, ...props } = userProps;
  return (
    <Route {...props}>
      <Layout>{children}</Layout>
    </Route>
  );
};

export const App: React.FC = () => (
  <ChakraProvider theme={theme}>
    <ChainProvider>
      <Router>
        <Switch>
          <RouteWithLayout path="/transaction/mint/:asset/:to/:nonce" exact>
            <LockAndMint />
          </RouteWithLayout>
          <RouteWithLayout path="/debug/:asset/:to/:nonce" exact>
            <Debug />
          </RouteWithLayout>
          <RouteWithLayout path="/stake">
            <Stake />
          </RouteWithLayout>
          <RouteWithLayout path="/" exact>
            <Swap />
          </RouteWithLayout>
          <RouteWithLayout path="/ptg/:to">
            <Swap />
          </RouteWithLayout>
          <RouteWithLayout path="/ptg">
            <Swap />
          </RouteWithLayout>
        </Switch>
      </Router>
    </ChainProvider>
  </ChakraProvider>
);
