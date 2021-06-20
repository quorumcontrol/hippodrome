import React, { useContext, useState, useEffect, useCallback, createContext } from "react"
import chainInstance, { Chain } from "../models/chain"

interface ChainContextData {
  connected:boolean
  connect:()=>void
  connecting:boolean
  address?:string
  chain: Chain
}

const defaultContextData = {
  connected:false,
  chain: chainInstance,
  connect: chainInstance.connect,
  connecting: false,
}

export const useChainContext = () => {
  return useContext(ChainContext)
}

export const ChainContext = createContext<ChainContextData>(
  defaultContextData
)

export const ChainProvider: React.FC = ({ children }) => {
  const [connected, setConnected] = useState(chainInstance.connected)
  const [connecting, setConnecting] = useState(false)

  const connect = useCallback(() => {
    setConnecting(true)
    return chainInstance.connect()
  }, [])

  useEffect(() => {
    const onConnect = async () => {
      setConnected(true)
      setConnecting(false)
    }
    chainInstance.on('connected', onConnect)
    return () => {
      chainInstance.off('connected', onConnect)
    }
  }, [])

  return (
    <ChainContext.Provider
      value={{
        chain: chainInstance,
        connect,
        connected,
        connecting,
        address: chainInstance.address,
      }}
    >
      {children}
    </ChainContext.Provider>
  )
}