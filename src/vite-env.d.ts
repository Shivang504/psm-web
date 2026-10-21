interface ImportMetaEnv {
  readonly VITE_APP_BASE_URL?: string
  readonly VITE_APP_BASE_URL_USER?: string
  readonly VITE_APP_BASE_URL_CMS?: string
  readonly VITE_GRAPHQL_API_URL?: string
  readonly VITE_API_BASE_URL?: string
  readonly REACT_APP_BASE_URL?: string
  readonly REACT_APP_BASE_URL_USER?: string
  readonly REACT_APP_BASE_URL_CMS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
