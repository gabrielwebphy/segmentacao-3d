import ThreeScene from '../../components/scene'
import { Inter } from 'next/font/google'
import { useState } from 'react'
const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  const [cameraStatus, setCamera] = useState({ x: 1.5, y: 1, z: 0, target: { x: 0, y: 1, z: 0 } })
  return (
    <>
      <ThreeScene cameraStatus={cameraStatus} setCamera={setCamera}/>
    </>
  )
}
