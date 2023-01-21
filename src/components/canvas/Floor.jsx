import { useRef } from 'react'
import { Plane } from '@react-three/drei'

// import { useFrame } from '@react-three/fiber'
import { TruchetMaterial } from '@/components/canvas/Shader/TruchetMaterial'

const ProceduralBackground = ({ url, texture }) => {
  const boxRef = useRef()

  // useFrame(() => {
  //   if (!boxRef?.current) return
  //   // boxRef.current.rotation.x += 0.005
  // })

  return (
    <Plane rotation-x={Math.PI * 0.5} ref={boxRef} args={[50, 50, 50]}>
      <TruchetMaterial url={url} texture={texture} />
    </Plane>
  )
}

export default ProceduralBackground
