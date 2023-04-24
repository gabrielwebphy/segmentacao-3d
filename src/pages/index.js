import ThreeScene from '../components/scene'
import { Inter } from 'next/font/google'
import { useState } from 'react'
const inter = Inter({ subsets: ['latin'] })
//  const [cameraStatus, setCamera] = useState({ x: -25, y: 0.05, z: -47, target: { x: -26.5, y: 0.05, z: -46 } })

export default function Home() {
  const [cameraStatus, setCamera] = useState({ x: 0, y: 0, z:0, target: { x: -0.5, y: 0, z: 0 } })

  return (
    <>
      <ThreeScene cameraStatus={cameraStatus} setCamera={setCamera} />
    </>
  )
}
