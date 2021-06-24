import React from 'react'
import {
  Box,
  VStack,
  Grid,
} from "@chakra-ui/react"
import Swap from "../components/swap/Swap"
import Card from '../components/Card'

const SwapPage:React.FC = () => {
  return (
    <Card>
      <Swap />
    </Card>
  )
}

export default SwapPage
