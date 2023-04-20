import ThreeScene from '../components/scene'
import { Inter } from 'next/font/google'
import { useState } from 'react'
const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  const [cameraStatus, setCamera] = useState({ x: -25, y: 1, z: -47, target: { x: -26.5, y: 1, z: -46 } })

  return (
    <>
      <ThreeScene cameraStatus={cameraStatus} setCamera={setCamera} />
    </>
  )
}
