import { useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { suspend } from 'suspend-react'
import * as THREE from 'three'

import createAudio from '@/helpers/createAudio'
// import useStore from '@/helpers/store'

export function TruchetMaterial({ url }) {
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
        float hash21(vec2 p) {
          p = fract(p * vec2(234.34, 435.345));
          p += dot(p,p +34.23);
          return fract(p.x*p.y);
        }

      ${shader.fragmentShader}`

    shader.fragmentShader = shader.fragmentShader.replace(
      /void main\(\) {/,
      (match) =>
        `${
          match
          /* glsl */
        }
        vec3 color = vec3(0.);
        vec2 newUv = vUv*10.;//*(avg/20.);
        newUv.x+=time*.5;
        newUv.y+=time*.5;

        vec2 gv = fract(newUv) - .5;
        vec2 id = floor(newUv);
        float n = hash21(id); // random val between 0 & 1;

        gv.x*=-1.;
        float width=(.02*avg);
        if(n<.2)gv.x*=-1.;
        //if(n>.5)gv.x*=s;
        float a=atan(gv.x,gv.y);
        float line=abs(abs(gv.x+gv.y)-.5);
        float mask=smoothstep(.01,-.01,line-width);
        //mask+=smoothstep(.01,-.01,line-width*2.5);
        //vGv=rotate2D(gv,a);

        //float line2=abs(abs(gv.x+gv.y)-.5);
        //float mask2=smoothstep(.01,-.01,line-width);
    

      `
    )
    shader.fragmentShader = shader.fragmentShader.replace(
      /vec4 diffuseColor.*;/,
      /* glsl */ `
      color+=vec3(mask);//,.01,mask);
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
