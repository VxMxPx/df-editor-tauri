/// <reference types="vite/client" />

declare module "*.cfg?raw" {
  const value: string
  export default value
}
