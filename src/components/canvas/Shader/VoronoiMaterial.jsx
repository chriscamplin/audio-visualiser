import { useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { suspend } from 'suspend-react'
import * as THREE from 'three'

import createAudio from '@/helpers/createAudio'
// import useStore from '@/helpers/store'

export function VoronoiMaterial({ url }) {
  const { update } = suspend(() => createAudio(url), [url])

  // Load the noise textures
  const [uniforms] = useState(() => ({
    time: { value: 0 },
    avg: { value: 10 },
  }))

  useFrame(({ clock }) => {
    const avg = update() * 0.065
    // console.log(avg)
    uniforms.time.value = clock.elapsedTime
    uniforms.avg.value = avg
  })

  const onBeforeCompile = (shader) => {
    // Wire up local uniform references
    shader.uniforms = { ...shader.uniforms, ...uniforms }
    console.log(shader.vertexShader)
    // Add to top of vertex shader
    shader.vertexShader = /* glsl */ `
      varying vec2 vUv;
      varying vec2 vUv2;
      varying float nHash;
      uniform float time;
      uniform float avg;
    ${shader.vertexShader}`
    // Assign values to varyings inside of main()
    shader.vertexShader = shader.vertexShader.replace(
      /void main\(\) {/,
      (match) =>
        `${
          match
          /* glsl */
        }
          vUv = uv;
          vUv2 = uv;
        `
    )

    // Add to top of fragment shader
    shader.fragmentShader = /* glsl */ `
        uniform float time;
        uniform float avg;
        varying vec2 vUv;

        varying vec2 vUv2;
        varying float nHash;
        // i. quillez
        vec2 N22(vec2 p) {
            vec3 a = fract(p.xyx*vec3(123.34, 234.34, 345.56));
            a += dot(a, a+34.45);
            return fract(vec2(a.x*a.y, a.y*a.z));
        }


      ${shader.fragmentShader}`

    shader.fragmentShader = shader.fragmentShader.replace(
      /void main\(\) {/,
      (match) =>
        `${
          match
          /* glsl */
        }
        float m=0.;
        float t=time*.25;
        float minDist = 100.;

        for(float i=0.;i<50.;i++) {
            vec2 n=N22(vec2(i));
            vec2 p=sin(n*t);
            float d = length(vUv-p);
            //m+=smoothstep(.02, .0175, d);
            if(d<minDist){
                minDist=d;
            }
        }
    

      `
    )
    shader.fragmentShader = shader.fragmentShader.replace(
      /vec4 diffuseColor.*;/,
      /* glsl */ `
      vec3 color = vec3(0.0); //init color variable to black

      color+=vec3(minDist);//,.01,mask);
      vec4 diffuseColor = vec4(color, 1.);      
      `
    )
  }

  return (
    <meshPhysicalMaterial
      onBeforeCompile={onBeforeCompile}
      onUpdate={(m) => (m.needsUpdate = true)}
      customProgramCacheKey={() => onBeforeCompile.toString()}
      side={THREE.BackSide}
      lights={true}
      receiveShadow={true}
      // map={texture}
    />
  )
}
