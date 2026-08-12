import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import Header from './components/Header.tsx'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <div className='h-screen w-screen flex flex-col overflow-x-hidden'>
      <Header />
      <div className='flex-1 w-full min-h-0 overflow-hidden'>
        <App />
      </div>
    </div>
  </StrictMode>,
)
