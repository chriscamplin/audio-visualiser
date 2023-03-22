import * as React from 'react'
import { a, useSpring } from '@react-spring/three'
import { useGLTF, useTexture } from '@react-three/drei'
// import { DepthOfField, EffectComposer } from '@react-three/postprocessing'
import { useControls } from 'leva'
// import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Matrix4 } from 'three'

import useStore from '../../helpers/store'
import { updateInstancedMeshMatrices } from '../../helpers/updateInstancedMeshMatrices'
import { useAnimatedLayout } from '../../hooks/useAnimatedLayout'
import { usePointColors } from '../../hooks/usePointColors'

const InstancedPoints = ({ data, layout }) => {
  const meshRef = React.useRef()
  const [angle, setAngle] = React.useState(true)
  const { offset } = useControls({
    offset: {
      value: [0.002, 0.002],
      // step: 0.001.
    },
  })

  React.useLayoutEffect(() => {
    // THREE.Matrix4 defaults to an identity matrix
    const transform = new Matrix4()

    // Apply the transform to the instance at index 0
    meshRef.current.setMatrixAt(0, transform)
  }, [])
  const numPoints = data.length
  // const { scene, gl } = useThree()
  // run the layout, animating on change
  useAnimatedLayout({
    data,
    layout,
    onFrame: () => {
      updateInstancedMeshMatrices({ mesh: meshRef.current, data })
    },
  })
  const [springs, api] = useSpring(() => ({
    rotation: [0, 0, 0],
    position: [0, 0, 0],
    config: { mass: 5, tension: 120, friction: 120, precision: 0.0001 },
  }))

  // const { spring } = useSpring({
  //   spring: layout,
  //   config: { mass: 5, tension: 400, friction: 50, precision: 0.0001 },
  // })
  // const rotation = spring.to([0, 1], [0, Math.PI])
  // update instance matrices only when needed
  React.useEffect(() => {
    //   meshRef.current.rotation.z += rotation
    console.log('API START', springs, api)
    api.start({
      rotation: [0, angle ? -Math.PI : 0, angle ? Math.PI : 0],
      position: [0, 0, angle ? 30 : 0],
    })
  }, [layout, api, angle])
  React.useEffect(() => {
    setAngle(!angle)
    console.log(angle)
  }, [layout])

  React.useEffect(() => {
    updateInstancedMeshMatrices({ mesh: meshRef.current, data })
  }, [data, layout])

  // The CubeTextureLoader load method takes an array of urls representing all 6 sides of the cube.
  // The cubeRenderTarget is used to generate a texture for the reflective sphere.
  // It must be updated on each frame in order to track camera movement and other changes.
  // const cubeRenderTarget = new WebGLCubeRenderTarget(256, {
  //   format: RGBFormat,
  //   generateMipmaps: true,
  //   minFilter: LinearMipmapLinearFilter,
  // })
  // const cubeCamera = new CubeCamera(1, 1000, cubeRenderTarget)
  // cubeCamera.position.set(0, 100, 0)
  // scene.add(cubeCamera)
  // Update the cubeCamera with current renderer and scene.
  // useFrame(() => cubeCamera.update(gl, scene))

  // useFrame(() => {
  //   meshRef.current.rotation.x += 0.00005
  //   meshRef.current.rotation.y += 0.00005
  // })
  const model = useGLTF('/models/plug.glb', '/draco-gltf')
  model.nodes['30Mm'].scale.set(0.01, 0.01, 0.01)
  console.log(model.nodes['30Mm'])
  // const [meshColour, setMeshColour] = React.useState('#ff0099')
  const selectedPoint = useStore((state) => state.selectedPoint)
  const setTexture = useStore((state) => state?.texture)
  const matCap = useTexture('/matCaps/326666_66CBC9_C0B8AE_52B3B4.png')
  const normalMap = useTexture('/normalMaps/152_norm.JPG')
  const { colorAttrib, colorArray } = usePointColors({ data, selectedPoint })
  // TRY ROTATING TOWARD MOUSE VECTOR ON HOVER
  // use instanced mesh for performance, using one matrix rather than individual geometries.
  const handleClick = (evt) => {
    const { instanceId } = evt
    const index = instanceId
    const point = data[index]
    if (point === selectedPoint) {
      useStore.setState({
        selectedPoint: null,
      })
    } else {
      useStore.setState({
        selectedPoint: point,
      })
    }
  }

  return (
    <>
      {/* <EffectComposer>
        <DepthOfField
          focusDistance={0}
          focalLength={0.02}
          bokehScale={2}
          height={480}
        />
      </EffectComposer> */}

      <a.instancedMesh
        // onContextMenu={(e) => console.log('context menu')}
        // onDoubleClick={(e) => console.log('double click')}
        // onWheel={(e) => console.log('wheel spins')}
        // onPointerOver={(e) => console.log('over')}
        // onPointerOut={(e) => console.log('out')}
        // onPointerEnter={(e) => console.log('enter')} // see note 1
        // onPointerLeave={(e) => console.log('leave')} // see note 1
        // onPointerMove={(e) => console.log('move')}
        // onPointerMissed={() => console.log('missed')}
        // onUpdate={(self) => console.log('props have been updated')}
        onPointerUp={handleClick}
        onPointerDown={handleClick}
        ref={meshRef}
        args={[null, null, numPoints]}
        frustumCulled={false}
        lights={true}
        castShadow
        receiveShadow
        rotation={springs.rotation.to((x, y, z) => [x, y, z])}
        position={springs.position.to((x, y, z) => [0, 0, z])}
        // geometry={model.nodes['30Mm'].geometry}
        // scale={[0.0125, 0.0125, 0.0125]}
      >
        <sphereGeometry attach='geometry' args={[0.333, 32, 16]}>
          <instancedBufferAttribute
            ref={colorAttrib}
            attachObject={['attributes', 'color']}
            args={[colorArray, 3]}
          />
        </sphereGeometry>
        {/* <meshStandardMaterial vertexColors={THREE.vertexColors} /> */}
        <meshMatcapMaterial
          normalMap={normalMap}
          matcap={matCap}
          vertexColors={THREE.vertexColors}
        />
        {/* <meshPhysicalMaterial
          emmisive={new THREE.Color(1, 0, 0)}
          reflectivity={1}
          iridescence={1}
          metalness={0.5}
          roughness={0}
          thickness={1}
          shininess={1}
          clearcoat={1}
          transmission={1}
          thinFilmThickness={'167mm'}
          thinFilmIor={1.1}
        /> */}
      </a.instancedMesh>
      {selectedPoint && (
        <a.group position={[selectedPoint.x, selectedPoint.y, selectedPoint.z]}>
          <pointLight
            distance={9}
            position={[0, 0, 0.3]}
            intensity={2.2}
            decay={30}
            color='#f0f'
          />
          <pointLight
            position={[0, 0, 0]}
            decay={1}
            distance={5}
            intensity={1.5}
            color='#f0f'
          />
        </a.group>
      )}
    </>
  )
}

export default InstancedPoints
