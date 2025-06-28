/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GMX_NETWORK: string
  readonly VITE_GMX_CHAIN_ID: string
  readonly VITE_GMX_RPC_URL: string
  readonly VITE_GMX_ORACLE_URL: string
  readonly VITE_GMX_SUBSQUID_URL: string
  readonly VITE_GMX_WALLET_ADDRESS: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}