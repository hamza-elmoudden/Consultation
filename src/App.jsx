import { useState,useEffect } from 'react'
import './App.css'
import SkincareAI from './Page/SkincareAI'
import CustomAlert from './Page/CustomAlert'


function App() {
  const [showAlert, setShowAlert] = useState(false)

  useEffect(() => {
    setShowAlert(true)
    window.scrollTo(0, 0)
  }, [])

  const handleCloseAlert = () => {
    setShowAlert(false)
  }


  return (
    <>
      <CustomAlert isOpen={showAlert} onClose={handleCloseAlert} />
      <SkincareAI />
    </>
  )
}

export default App
