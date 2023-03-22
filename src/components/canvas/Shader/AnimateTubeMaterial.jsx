import { useEffect, useMemo, useState } from 'react'
import { useTexture } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
// import { useControls } from 'leva'
// import { suspend } from 'suspend-react'
import * as THREE from 'three'
// import createAudio from '@/helpers/createAudio'
// import useStore from '@/helpers/store'

export function AnimateTubeMaterial() {
  const normalMap = useTexture('/normalmaps/167_norm.jpg')
  const matCap = useTexture('/matCaps/ED4630_791A0E_A42716_501009-512px.png')

  // Load the noise textures
  const [uniforms] = useState(() => ({
    time: { value: 0 },
    // map: { value: '' },
    resolution: { value: new THREE.Vector2() },
  }))

  useFrame((state) => {
    uniforms.time.value = state.clock.elapsedTime
  })

  useEffect(() => {
    // uniforms.map.value = texture
    uniforms.resolution.value = new THREE.Vector2(
      window.innerWidth,
      window.innerHeight
    )
  }, [uniforms.resolution])

  const onBeforeCompile = useMemo(
    () => (shader) => {
      // Wire up local uniform references
      shader.uniforms = { ...shader.uniforms, ...uniforms }
      // Add to top of vertex shader
      shader.vertexShader = /* glsl */ `
            #define PI 3.141592653589793
            varying vec3 vLight;
            varying vec3 vXyz;
            varying vec3 vNorm;
            varying vec3 vPos;
            attribute vec3 newPosition;
            attribute vec3 newNormal;
            attribute vec2 newUv;
            uniform float time;

            float animationDuration = 5.;
            #define PI 3.141592653589793
            float quadraticOut(float t) {
              return -t * (t - 2.0);
            }


            float exponentialInOut(float t) {
                return t == 0.0 || t == 1.0
                  ? t
                  : t < 0.5
                    ? +0.5 * pow(2.0, (20.0 * t) - 10.0)
                    : -0.5 * pow(2.0, 10.0 - (t * 20.0)) + 1.0;
            }
            float bounceOut(float t) {
              const float a = 4.0 / 11.0;
              const float b = 8.0 / 11.0;
              const float c = 9.0 / 10.0;

              const float ca = 4356.0 / 361.0;
              const float cb = 35442.0 / 1805.0;
              const float cc = 16061.0 / 1805.0;

              float t2 = t * t;

              return t < a
                ? 7.5625 * t2
                : t < b
                  ? 9.075 * t2 - 9.9 * t + 3.4
                  : t < c
                    ? ca * t2 - cb * t + cc
                    : 10.8 * t * t - 20.52 * t + 10.72;
            }
            float bounceInOut(float t) {
              return t < 0.5
                ? 0.5 * (1.0 - bounceOut(1.0 - t * 2.0))
                : 0.5 * bounceOut(t * 2.0 - 1.0) + 0.5;
            }
            float sineInOut(float t) {
              return -0.5 * (cos(PI * t) - 1.0);
            }




           
    ${shader.vertexShader}`
      // Assign values to varyings inside of main()
      shader.vertexShader = shader.vertexShader.replace(
        /void main\(\) {/,
        (match) =>
          `${
            match
            /* glsl */
          }


          float sineLoop = sin(PI * (time - 0.75) / animationDuration) / 2.0 + 0.5;
          float angle = exponentialInOut(sineLoop) * (PI*.25);  // Rotation angle

          mat3 rotation = mat3(
            vec3(cos(angle), 0.0, sin(angle)),
            vec3(0.0, 1.0, 0.0),
            vec3(-sin(angle), 0.0, cos(angle))
          );
          vec4 pos = vec4(position*rotation, 1.);
          vec4 newPos = vec4(newPosition*-rotation, 1.);

          vec3 mixedNormal = mix(normal, newNormal, exponentialInOut(sineLoop));
          vec4 finalPos = mix(pos*4., newPos, exponentialInOut(sineLoop));
          vNorm = mixedNormal;
        `
      )
      shader.vertexShader = shader.vertexShader.replace(
        /#include <begin_vertex>/,
        () => `vec3 transformed = vec3( finalPos );`
      )

      shader.vertexShader = shader.vertexShader.replace(
        /#include <fog_vertex>/,
        () => `gl_Position=projectionMatrix*modelViewMatrix*finalPos;`
      )
      // Add to top of fragment shader
      shader.fragmentShader = /* glsl */ `
        varying vec3 vPos;
        varying vec3 vNorm;
      ${shader.fragmentShader}`

      shader.fragmentShader = shader.fragmentShader.replace(
        /#include <normal_fragment_maps>/,
        (match) =>
          `${match}
        geometryNormal = vNorm;
        normal = vNorm;
      `
      )
      shader.fragmentShader = shader.fragmentShader.replace(
        /#include <dithering_fragment>/,
        /* glsl */ `
        //gl_FragColor = vec4( finalColor.rgb, diffuseColor.a );
      `
      )
    },
    [uniforms]
  )

  return (
    // <meshPhongMaterial
    //   onBeforeCompile={onBeforeCompile}
    //   onUpdate={(m) => (m.needsUpdate = true)}
    //   customProgramCacheKey={() => onBeforeCompile.toString()}
    //   side={THREE.DoubleSide}
    //   reflectivity={1}
    //   lights={true}
    //   receiveShadow={true}
    //   castShadow={true}
    //   // map={texture}
    // />
    <meshMatcapMaterial
      onBeforeCompile={onBeforeCompile}
      onUpdate={(m) => (m.needsUpdate = true)}
      customProgramCacheKey={() => onBeforeCompile.toString()}
      matcap={matCap}
      normalMap={normalMap}
      side={THREE.DoubleSide}
    />

    // <meshPhysicalMaterial
    //   emmisive={new THREE.Color(1, 0, 0)}
    //   onBeforeCompile={onBeforeCompile}
    //   onUpdate={(m) => (m.needsUpdate = true)}
    //   reflectivity={1}
    //   iridescence={1}
    //   metalness={0.5}
    //   roughness={0}
    //   thickness={1}
    //   shininess={1}
    //   clearcoat={1}
    //   transmission={1}
    //   thinFilmThickness={'167mm'}
    //   thinFilmIor={1.1}
    // />
  )
}
