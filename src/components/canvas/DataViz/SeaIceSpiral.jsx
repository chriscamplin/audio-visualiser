import { Suspense, useEffect, useState } from 'react'
import { a, useSpring } from '@react-spring/three'
import { shaderMaterial, Text } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { Leva, useControls } from 'leva'
import * as THREE from 'three'

import Axis from '@/components/canvas/DataViz/Axis'
import Months from '@/components/canvas/DataViz/Months'
import YearCounter from '@/components/canvas/DataViz/YearCounter'
import fragment from '@/components/canvas/Shader/glsl/heat.frag'
import vertex from '@/components/canvas/Shader/glsl/heat.vert'
import useFetchCSV from '@/hooks/useFetchCSV'
import useYearCounter from '@/hooks/useYearCounter'

import createCurvesFromData from '@/helpers/createCurvesFromData'
// @TODO: update to use data from CSV]
// const { geometry } = createCurvesFromData(data)

// drawcalls
// const drawCount = 100 // draw the first 10 points, only
// geometry.setDrawRange(0, drawCount)
// geometry.attributes.position.needsUpdate = true // required after the first render

const HeatScaleMaterial = shaderMaterial(
  {
    fraction: 0,
    time: 0,
    color: new THREE.Color(0.05, 0.0, 0.025),
  },
  vertex,
  fragment
)

// extend({ HeatScaleMaterial })
const material = new HeatScaleMaterial({ side: THREE.DoubleSide })

export default function ClimateSpiral(props) {
  const { rows } = useFetchCSV(['/data/sea-ice-index/', 'extent_v3.0.csv', 12])
  const { textScale } = useControls({
    textScale: {
      value: 0.5,
      min: 0.1,
      max: 5,
      step: 0.1,
    },
  })
  // const { counter } = useYearCounter()
  // useEffect(() => {
  //   // console.log({ counter })
  //   const fractionValue = 0.5 * (1.666 + Math.cos(counter * 0.0525))

  //   material.uniforms.fraction.value = fractionValue
  // }, [counter])

  // console.log({ rows, data })
  const { geometry, months } = createCurvesFromData(rows)
  // console.log({ geometry })
  // const normalMap = useTexture('/txt/normalMap.jpg')
  // const matCap = useTexture('/matCaps/GrayGlossy.png')
  const [step1Complete, setStep1Complete] = useState(false)
  // const matRef = useRef()
  useFrame((props) => {
    // console.log({ delta, props })
    const t = props.clock.elapsedTime
    if (t > 50 && !step1Complete) {
      setStep1Complete(true)
      material.uniforms.fraction.value = 0
      fractionValue = 0
    }
    let fractionValue = 0.5 * (1.666 + Math.cos(t * 0.0525))
    if (material && fractionValue * 1000 > 450 && !step1Complete) {
      material.uniforms.fraction.value = fractionValue
    }
    // console.log(material)
  })
  const [springs, api] = useSpring(() => ({
    rotation: [0, 0, 0],
    position: [0, 0, 0],
    config: { mass: 5, tension: 120, friction: 120, precision: 0.0001 },
  }))
  useEffect(() => {
    //   meshRef.current.rotation.z += rotation
    // console.log('API START', springs, api)
    api.start({
      rotation: [
        step1Complete ? -Math.PI * 0.5 - Math.PI * 0.025 : 0,
        0,
        step1Complete ? -Math.PI * 2 : 0,
      ],
      position: [0, step1Complete ? 10 : 0, 0],
    })
  }, [step1Complete, api])
  const [hovered, setHovered] = useState(false)

  useEffect(() => {
    document.body.style.cursor = hovered ? 'pointer' : 'auto'
  }, [hovered])

  return (
    <Suspense fallback={<Text>LOADING</Text>}>
      <Leva
        collapsed // default = false, when true the GUI is collpased
        hidden // default = false, when true the GUI is hidden
      />
      {/* <ambientLight intensity={0.25} />
      <spotLight
        intensity={1}
        angle={0.2}
        penumbra={1}
        position={[30, 30, 30]}
        castShadow
        shadow-mapSize={[512, 512]}
      />
      <directionalLight
        intensity={5}
        position={[-10, -10, -10]}
        color='white'
      />
      <a.group
        rotation={springs.rotation.to((x, y, z) => [x, y, z])}
        position={springs.position.to((x, y, z) => [x, y, z])}
      >
        <YearCounter textScale={textScale} />
        <Axis textScale={textScale} step1Complete={step1Complete} />
        {months && <Months textScale={textScale} months={months} />}
        <mesh
          {...props}
          geometry={geometry}
          material={material}
          rotation={[Math.PI, 0, -Math.PI * 0.666]}
          scale={[1.25, 1.25, 1.25]}
          visible={true}
        >
          {/* <boxGeometry args={[1, 1, 1]} /> */}
      {/* <meshMatcapMaterial normalMap={normalMap} matcap={matCap} color='red' /> */}
      {/* <heatScaleMaterial ref={matRef} side={THREE.DoubleSide} /> */}
      {/* <meshBasicMaterial color='red' /> */}
      {/* <meshStandardMaterial color='red' /> */}
      {/* </mesh> */}
      {/* <Text
          rotation={[Math.PI * 0.5, 0, 0]}
          position={[20, -25, -20]}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          onPointerDown={() => setStep1Complete(false)}
        >
          RESET
        </Text> */}
      {/* </a.group> */}
    </Suspense>
  )
}