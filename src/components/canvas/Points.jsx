import { Suspense, useEffect } from 'react'
import { Environment } from '@react-three/drei'
import { useThree } from '@react-three/fiber'

// import { useControls } from 'leva'
// import { shallow } from 'zustand/shallow'
import InstancedPoints from '@/components/canvas/InstancedPoints'

import useStore from '@/helpers/store'

// import { a, useSpring } from '@react-spring/three'

const fakeData = new Array(6000).fill(0).map((d, idx) => ({
  idx,
}))

const Points = () => {
  // const router = useStore((s) => s.router)
  // const { color } = useSpring({
  //   color: router.route !== '/box' ? 'black' : '#272727',
  // })
  const camera = useThree((state) => state.camera)
  useEffect(() => {
    camera.position.set(0, 0, 100)
  }, [camera])

  const layout = useStore((state) => state.layout)

  // const {
  //   dLightColor,
  //   dLightIntensity,
  //   dLightPos,
  //   spLightIntensity,
  //   spLightAngle,
  //   spPenumbra,
  // } = lightProps

  return (
    <Suspense fallback={null}>
      <ambientLight intensity={0.75} />
      <hemisphereLight
        intensity={0.5}
        color='#ffffff'
        skyColor='#ff9900'
        groundColor='#994466'
      />
      <spotLight
        intensity={1}
        angle={0}
        position={[500, 500, 500]}
        castShadow
        shadow-mapSize={[512, 512]}
      />
      <directionalLight
        intensity={1}
        position={[-500, -500, -500]}
        color={'#ff9999'}
      />

      <InstancedPoints data={fakeData} layout={layout} />

      {/* <Environment
        files='/hdr/winter_evening_4k.hdr'
        background={false} // can be true, false or "only" (which only sets the background) (default: false)
        preset={null}
      /> */}
    </Suspense>
  )
}
export default Points
