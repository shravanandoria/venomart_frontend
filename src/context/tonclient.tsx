import React, {useState, createContext, useRef, useEffect} from 'react'
import type {ReactNode} from 'react'
import {libWeb, libWebSetup} from "@eversdk/lib-web"
import {ClientConfig, TonClient} from "@eversdk/core"

const useMountEffectOnce = (fn: () => void) => {
    const wasExecutedRef = useRef(false)
    useEffect(() => {
        if (!wasExecutedRef.current) {
            fn()
        }
        wasExecutedRef.current = true
    }, [fn])
}
const initial: ITonClientContext = {}

export const TonClientContext = createContext(initial)

// tonClient.tsx

async function fetchWasmFile() {
    console.log("fetchWasmFile")
    try {
      const response = await fetch("https://alivegamers.com/assets/eversdk.wasm");
      if (response.ok) {
        const wasmData = await response.arrayBuffer();
        console.log(wasmData)
        // Now, you have the Wasm file in `wasmData`.
        // You can use it as needed in your app.
        return wasmData;
      } else {
        throw new Error("Failed to fetch the Wasm file.");
      }
    } catch (error) {
      console.error(error);
      return null;
    }
  }
  

export const TonClientContextProvider: React.FC<TonClientContextProviderProps> = ({children, config}) => {
    // fetchWasmFile()
    const [state, setState] = useState<ITonClientContext>(initial)

    useMountEffectOnce(() => {
        libWebSetup({
            disableSeparateWorker: true,
            binaryURL: "https://alivegamers.com/assets/eversdk.wasm", 
        })
        TonClient.useBinaryLibrary(libWeb as any)
        setState({client: new TonClient(config)})
    })

    return (
        <TonClientContext.Provider value={state}>
            {children}
        </TonClientContext.Provider>
    )
}

interface ITonClientContext {
    client?: TonClient
}

interface TonClientContextProviderProps {
    config: ClientConfig,
    children: ReactNode
}