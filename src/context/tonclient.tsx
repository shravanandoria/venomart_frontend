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

export const TonClientContextProvider: React.FC<TonClientContextProviderProps> = ({children, config}) => {
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