import { renderToString } from 'react-dom/server'
import App from './App.jsx'

// Used at build time only: renders the page to HTML so search engines and
// AI crawlers that don't run JavaScript still see the full menu and details.
export const render = () => renderToString(<App />)
