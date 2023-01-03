import { useRef, useState } from 'react'
import { Box } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { suspend } from 'suspend-react'
import * as THREE from 'three'

import createAudio from '@/helpers/createAudio'

const ProceduralBackground = ({ url }) => {
  const boxRef = useRef()
  const [uniforms] = useState(() => ({
    time: { value: 0 },
    avg: { value: 10 },
  }))
  const { update } = suspend(() => createAudio(url), [url])

  useFrame(({ clock }) => {
    const avg = update() * 0.065
    uniforms.time.value = clock.elapsedTime
    uniforms.avg.value = avg
    if (!boxRef?.current) return
    boxRef.current.rotation.x += 0.005
  })

  const onBeforeCompile = (shader) => {
    // Wire up local uniform references
    shader.uniforms = { ...shader.uniforms, ...uniforms }

    // Add to top of vertex shader
    shader.vertexShader = /* glsl */ `
      varying vec2 vUv;
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
        `
    )

    // Add to top of fragment shader
    shader.fragmentShader = /* glsl */ `
        uniform float time;
      uniform float avg;

        varying vec2 vUv;
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
    <Box ref={boxRef} args={[50, 50, 50]}>
      <meshPhysicalMaterial
        onBeforeCompile={onBeforeCompile}
        onUpdate={(m) => (m.needsUpdate = true)}
        customProgramCacheKey={() => onBeforeCompile.toString()}
        side={THREE.BackSide}
        lights={true}
        receiveShadow={true}
      />
    </Box>
  )
}

export default ProceduralBackground
