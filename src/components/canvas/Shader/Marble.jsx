import { useState } from 'react'
import { a as a3, useSpring as useSpringThree } from '@react-spring/three'
import { Box, Plane, Sphere, useTexture } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { suspend } from 'suspend-react'
import * as THREE from 'three'

import createAudio from '@/helpers/createAudio'
import useStore from '@/helpers/store'

// HSL color values
const options = [
  [0, 100, 50],
  [60, 100, 50],
  [150, 100, 50],
  [240, 70, 60],
  [0, 0, 80],
]

function Marble({ step, setStep, url }) {
  const viewAudioViz = useStore((s) => s.viewAudioViz)

  const [hover, setHover] = useState(false)
  const [tap, setTap] = useState(false)
  const { scale } = useSpringThree({
    scale: tap && hover ? 0.95 : 1.5,
    config: {
      friction: 15,
      tension: 300,
    },
  })

  return (
    <group>
      <a3.group
        scale={scale}
        onPointerEnter={() => setHover(true)}
        onPointerOut={() => setHover(false)}
        // onClick={() => (setStep(step + 1), router.push('/'))}
      >
        <sphereGeometry scale={[1, 1, 1]}>
          <MagicMarbleMaterial step={step} roughness={0.1} url={url} />
        </sphereGeometry>
      </a3.group>
      {/* This big invisible box is just a pointer target so we can reliably track if the mouse button is up or down */}
      <Box
        args={[100, 100, 100]}
        onPointerDown={() => setTap(true)}
        onPointerUp={() => setTap(false)}
        // onClick={() =>
        //   // useStore.setState({
        //   //   viewAudioViz: !viewAudioViz,
        //   // })
        // }
      >
        <meshBasicMaterial side={THREE.BackSide} visible={false} />
      </Box>
    </group>
  )
}

function MagicMarbleMaterial({ url, step, ...props }) {
  const { update } = suspend(() => createAudio(url), [url])

  // Load the noise textures
  const heightMap = useTexture('/txt/noise.jpg')
  const displacementMap = useTexture('/txt/noise3D.jpg')
  heightMap.minFilter = displacementMap.minFilter = THREE.NearestFilter
  displacementMap.wrapS = displacementMap.wrapT = THREE.RepeatWrapping

  // Create persistent local uniforms object
  const [uniforms] = useState(() => ({
    time: { value: 0 },
    colorA: { value: new THREE.Color(0, 0, 0) },
    colorB: { value: new THREE.Color(1, 0, 0) },
    heightMap: { value: heightMap },
    displacementMap: { value: displacementMap },
    iterations: { value: 48 },
    depth: { value: 0.6 },
    smoothing: { value: 0.2 },
    displacement: { value: 0.1 },
  }))

  // This spring value allows us to "fast forward" the displacement in the marble
  const { timeOffset } = useSpringThree({
    hsl: options[step % options.length],
    timeOffset: step * 0.2,
    config: { tension: 50 },
    onChange: ({ value: { hsl } }) => {
      const [h, s, l] = hsl
      uniforms.colorB.value.setHSL(h / 360, s / 100, l / 100)
    },
  })

  // Update time uniform on each frame
  useFrame(({ clock }) => {
    const avg = update()
    uniforms.displacement.value = avg / 500
    uniforms.smoothing.value = avg / 200
    uniforms.depth.depth = avg / 300
    uniforms.time.value = timeOffset.get() + clock.elapsedTime * 0.05
  })

  // Add our custom bits to the MeshStandardMaterial
  const onBeforeCompile = (shader) => {
    // Wire up local uniform references
    shader.uniforms = { ...shader.uniforms, ...uniforms }

    // Add to top of vertex shader
    shader.vertexShader = /* glsl */ `
      varying vec3 v_pos;
      varying vec3 v_dir;
    ${shader.vertexShader}`

    // Assign values to varyings inside of main()
    shader.vertexShader = shader.vertexShader.replace(
      /void main\(\) {/,
      (match) =>
        `${
          match
          /* glsl */
        }
        v_dir = position - cameraPosition; // Points from camera to vertex
        v_pos = position;
        `
    )

    // Add to top of fragment shader
    shader.fragmentShader = /* glsl */ `
      #define FLIP vec2(1., -1.)
      
      uniform vec3 colorA;
      uniform vec3 colorB;
      uniform sampler2D heightMap;
      uniform sampler2D displacementMap;
      uniform int iterations;
      uniform float depth;
      uniform float smoothing;
      uniform float displacement;
      uniform float time;
      
      varying vec3 v_pos;
      varying vec3 v_dir;
    ${shader.fragmentShader}`

    // Add above fragment shader main() so we can access common.glsl.js
    shader.fragmentShader = shader.fragmentShader.replace(
      /void main\(\) {/,
      (match) => /* glsl */ `
       	/**
         * @param p - Point to displace
         * @param strength - How much the map can displace the point
         * @returns Point with scrolling displacement applied
         */
        vec3 displacePoint(vec3 p, float strength) {
        vec2 uv = equirectUv(normalize(p));
        vec2 scroll = vec2(time, 0.);
        vec3 displacementA = texture(displacementMap, uv + scroll).rgb; // Upright
        vec3 displacementB = texture(displacementMap, uv * FLIP - scroll).rgb; // Upside down
          
          // Center the range to [-0.5, 0.5], note the range of their sum is [-1, 1]
          displacementA -= 0.5;
          displacementB -= 0.5;
          
          return p + strength * (displacementA + displacementB);
        }
        
				/**
          * @param rayOrigin - Point on sphere
          * @param rayDir - Normalized ray direction
          * @returns Diffuse RGB color
          */
        vec3 marchMarble(vec3 rayOrigin, vec3 rayDir) {
          float perIteration = 1. / float(iterations);
          vec3 deltaRay = rayDir * perIteration * depth;
          // Start at point of intersection and accumulate volume
          vec3 p = rayOrigin;
          float totalVolume = 0.;
          for (int i=0; i<iterations; ++i) {
            // Read heightmap from spherical direction of displaced ray position
            vec3 displaced = displacePoint(p, displacement);
            vec2 uv = equirectUv(normalize(displaced));
            float heightMapVal = texture(heightMap, uv).r;
            // Take a slice of the heightmap
            float height = length(p); // 1 at surface, 0 at core, assuming radius = 1
            float cutoff = 1. - float(i) * perIteration;
            float slice = smoothstep(cutoff, cutoff + smoothing, heightMapVal);
            // Accumulate the volume and advance the ray forward one step
            totalVolume += slice * perIteration;
            p += deltaRay;
          }
          return mix(colorA, colorB, totalVolume);
        }
      ${match}`
    )

    shader.fragmentShader = shader.fragmentShader.replace(
      /vec4 diffuseColor.*;/,
      /* glsl */ `
      vec3 rayDir = normalize(v_dir);
      vec3 rayOrigin = v_pos;
      
      vec3 rgb = marchMarble(rayOrigin, rayDir);
      vec4 diffuseColor = vec4(rgb, 1.);      
      `
    )
  }

  return (
    <meshStandardMaterial
      {...props}
      onBeforeCompile={onBeforeCompile}
      // side={THREE.BackSide}
      // The following props allow React hot-reload to work with the onBeforeCompile argument
      onUpdate={(m) => (m.needsUpdate = true)}
      customProgramCacheKey={() => onBeforeCompile.toString()}
    />
  )
}

export default Marble
