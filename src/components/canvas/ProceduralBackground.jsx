import { useRef } from 'react'
import { Box } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'

import { TruchetMaterial } from '@/components/canvas/Shader/TruchetMaterial'

import { VoronoiMaterial } from './Shader/VoronoiMaterial'

const ProceduralBackground = ({ url, texture, type = 'voronoi' }) => {
  const boxRef = useRef()

  useFrame(() => {
    if (!boxRef?.current) return
    boxRef.current.rotation.x += 0.005
  })

  return (
    <Box ref={boxRef} args={[50, 50, 50]}>
      {type === 'truchet' && <TruchetMaterial url={url} texture={texture} />}
      {type === 'voronoi' && <VoronoiMaterial url={url} texture={texture} />}
    </Box>
  )
}

export default ProceduralBackground
