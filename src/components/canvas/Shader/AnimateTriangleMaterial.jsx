import { useEffect, useMemo, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { useControls } from 'leva'
import { suspend } from 'suspend-react'
import * as THREE from 'three'

import createAudio from '@/helpers/createAudio'
// import useStore from '@/helpers/store'

export function AnimateTriangleMaterial({ url }) {
  const { update } = suspend(() => createAudio(url), [url])
  const {
    amplitude,
    baseVal,
    frequency,
    speed,
    lightZ,
    numRot,
    dxOff,
    dyOff,
    dzOff,
  } = useControls('displacement', {
    amplitude: { value: 1.3, min: 0.1, max: 2.5, step: 0.01 },
    frequency: { value: 0.4, min: 0, max: 2, step: 0.01 },
    speed: { value: 0.01, min: 0.01, max: 2, step: 0.01 },
    numRot: { value: 32, min: 1, max: 200, step: 1 },
    baseVal: { value: 10, min: 1, max: 100, step: 0.25 },
    dxOff: { value: 1.4, min: 0.01, max: 10, step: 0.01 },
    dyOff: { value: 0.75, min: 0.01, max: 10, step: 0.01 },
    dzOff: { value: 0.5, min: 0.01, max: 10, step: 0.01 },
    lightZ: { value: -4, min: -10, max: 10, step: 0.1 },
  })

  // Load the noise textures
  const [uniforms] = useState(() => ({
    time: { value: 0 },
    audio: { value: 0 },
    // map: { value: '' },
    resolution: { value: new THREE.Vector2() },
    color: { value: new THREE.Color(1, 1, 1) },
    amplitude: { value: amplitude },
    frequency: { value: frequency },
    speed: { value: speed },
    numRot: { value: numRot },
    baseVal: { value: baseVal },
    dxOff: { value: dxOff },
    dyOff: { value: dyOff },
    dzOff: { value: dzOff },
    lightZ: { value: lightZ },
  }))

  useFrame((state, delta) => {
    uniforms.audio.value = update()
    uniforms.amplitude.value = amplitude
    uniforms.frequency.value = frequency
    uniforms.speed.value = speed
    uniforms.numRot.value = numRot
    uniforms.baseVal.value = baseVal
    uniforms.dxOff.value = dxOff
    uniforms.dyOff.value = dyOff
    uniforms.dzOff.value = dzOff
    uniforms.lightZ.value = lightZ
    uniforms.time.value += Math.sin(delta / 2) * Math.cos(delta / 2)
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
      console.log(shader.fragmentShader)
      // Add to top of vertex shader
      shader.vertexShader = /* glsl */ `
            varying vec2 vUv;
            varying vec3 vLight;
            varying vec3 vXyz;
            varying vec3 vNorm;
            varying vec3 vPos;
            uniform float time;
            uniform float dxOff;
            uniform float dyOff;
            uniform float dzOff;
            uniform float audio;
            uniform float amplitude;
            uniform float frequency;
            uniform float speed;
            uniform int numRot;
            uniform int baseVal;
            uniform vec2 resolution;
            attribute float vertexId;
            attribute float aRandom;

            const float PI=3.14159265359;
            // and iquilezles.org/articles/distfunctions2d



            vec3 computeVert(float angle,float H){
              float snd = (audio*.00675);

              float STEP=time*.7*frequency;
              float R=(cos(H*snd+STEP*1.5+sin(STEP*4.3+H*3.)*(cos(STEP*.6)+.6))*snd+.9)*(cos(STEP*.5+H*snd)*.3+.9);
              R*=sin((H+4.)*.375);

              float Q=cos(STEP*.754+H*.7);
              float dX=cos(H*dxOff*amplitude)*Q*1.5*frequency;
              float dY=sin(H*dyOff*amplitude)*Q*1.4*frequency;
              float dZ=sin(H*dzOff*amplitude)*Q*1.5*frequency;
              return vec3(cos(angle)*R,H,sin(angle)*R)+vec3(dX,dY,dZ);
            }

            vec3 computeNorm(float angle,float H){
              float dA=.01;
              float dH=.01;
              vec3 A=computeVert(angle,H);
              vec3 B=computeVert(angle+dA,H);
              vec3 C=computeVert(angle,H+dH);
              return normalize(cross((B-A)/dA,(C-A)/dH));
            }

            float val = 4.0;
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
            vec3 pos = position;
            vPos = position;
            vec3 norm = normal;
            int NUM_ROT=numRot;
            float dH=.05;

            float STEP=time*.7*speed;

            int base=int(vertexId)/baseVal;
            int level=int(base)/NUM_ROT;
            int idx=int(mod(vertexId,6.));
            vec3 xyz=vec3(0,0,0);
            vec3 N=normalize(vec3(1,0,0));

            float dA=4.*PI/float(NUM_ROT);

            float H=float(level)*dH-4.;//*amplitude;
            float angle=float(base)*dA;

            if(idx==0){
                xyz=computeVert(angle,H);
                xyz=computeVert(angle,H);
                N=computeNorm(angle,H);
            }
            if(idx==1){
                xyz=computeVert(angle+dA,H);
                N=computeNorm(angle+dA,H);
            }
            if(idx==2){
                xyz=computeVert(angle+dA,H+dH);
                N=computeNorm(angle+dA,H+dH);
            }

            if(idx==3){
              xyz=computeVert(angle+dA,H+dH);
              N=computeNorm(angle+dA,H+dH);
            }
            if(idx==4){
              xyz=computeVert(angle,H+dH);
              N=computeNorm(angle,H+dH);
            }
            if(idx==5){
              xyz=computeVert(angle,H);
              N=computeNorm(angle,H);
            }

            #ifdef FIT_VERTICAL
            vec2 aspect=vec2(resolution.y/resolution.x,1);
            #else
            vec2 aspect=vec2(1,resolution.x/resolution.y);
            #endif

            float Cs=cos(STEP);
            float Si=sin(STEP);
            mat3 rot=mat3(vec3(Cs,0,Si),vec3(0,1,0),vec3(-Si,0,Cs));
            mat3 rot2=mat3(vec3(0,Si,0),vec3(Cs,0,Si),vec3(-Si,0,Cs));
            //xyz*=audio*0.001;
            xyz*=amplitude*0.5;
            xyz *= rot;
            N *= rot;
            vNorm=N;
            vXyz=xyz;
            vec4 endPos = vec4(xyz.xy*aspect/(3.+xyz.z),xyz.z,1);

            vec4 finalPos = vec4(endPos.xyz, 1.0);
            // finalPos.y+=aRandom*ease(sin(uv.x*uv.y+time)*2.);
            // finalPos.y+=aRandom*ease(sin(uv.x*uv.y+time)*2.);
            // finalPos.z+=aRandom*ease(cos(uv.x*uv.y+time)*2.);

            ;
        `
      )
      shader.vertexShader = shader.vertexShader.replace(
        /#include <fog_vertex>/,
        () => `gl_Position=projectionMatrix*modelViewMatrix*finalPos;`
      )
      // Add to top of fragment shader
      shader.fragmentShader = /* glsl */ `
        uniform float time;
        uniform vec3 color;
        uniform float audio;
        uniform vec2 resolution;
        uniform float speed;
        uniform float lightZ;
        varying vec2 vUv;
        varying vec3 vLight;
        varying vec3 vPos;
        varying vec3 vXyz;
        varying vec3 vNorm;
        float sdCircle( in vec2 p, in float r ) 
            {
                return length(p)-r;
            }
        // i. quillez
        float hash21(vec2 p) {
          p = fract(p * vec2(234.34, 435.345));
          p += dot(p,p +34.23);
          return fract(p.x*p.y);
        }
        float blinnPhongSpec(
          vec3 lightDirection,
          vec3 viewDirection,
          vec3 surfaceNormal,
          float shininess) {

          //Calculate Blinn-Phong power
          vec3 H = normalize(viewDirection + lightDirection);
          return pow(max(0.0, dot(surfaceNormal, H)), shininess);
        }

        // #pragma glslify: random = require(glsl-random)
        // uniform sampler2D map;

      ${shader.fragmentShader}`

      shader.fragmentShader = shader.fragmentShader.replace(
        /void main\(\) {/,
        (match) =>
          `${
            match
            /* glsl */
          }
        //vec2 newUv = vUv;
        vec2 p = (2.0*gl_FragCoord.xy-vXyz.xy)/vXyz.y;
          

        float STEP=time*.7;

        float Cs=cos(STEP);
        float Si=sin(STEP);
        mat3 rot=mat3(vec3(Cs,0,Si),vec3(0,1,0),vec3(-Si,0,Cs));
        mat3 rot2=mat3(vec3(0,1,0),vec3(Cs,0,Si),vec3(-Si,0,Cs));

        vec3 light=normalize(vec3(1,1,lightZ));
        vec3 V=vec3(0,0,1);
        float A=.8+cos(vXyz.y*.6+STEP);
        float D=.6*clamp(dot(vNorm,light),0.,1.);
        float S=1.6*pow(clamp(dot(light,reflect(V,vNorm)),0.,1.),5.);
        vec3 A_col=vec3(1,1,1)*vNorm*rot2;
        vec3 D_col=vec3(1,1,1)*vNorm;
        vec3 S_col=vec3(1,1,1);
        vec3 LUM=A*A_col+D*D_col+S*S_col;
        vec4 v_color=vec4(LUM,1);
        
        vec2 newUv = vUv*10.;//*(avg/20.);
        newUv.x+=time*.5;
        newUv.y+=time*.5;

        vec2 gv = fract(newUv) - .5;
        vec2 id = floor(newUv);
        float n = hash21(id); // random val between 0 & 1;
        float d = sdCircle(gv,5.);
        // coloring
        vec3 col = (d>0.0) ? vec3(0.9,0.6,0.3) : vec3(0.65,0.85,1.0);
        for(int i = 0; i<1; i++) {
          //v_color.rgb*=(abs(v_color.rgb)/dot(v_color.rgb, v_color.rgb)-vec3(.5));
        }
        vec3 eyeDirection = normalize(vec3(0,0,1) - vXyz);
        vec3 lightDirection = normalize(normalize(vec3(1,1,lightZ)) - vXyz);
        //vec3 normal2 = normalize(vNorm);

        float power = blinnPhongSpec(lightDirection, eyeDirection, vNorm, shininess);

        v_color.g *=0.5;
        vec4 finalColor = vec4(v_color.rgb, 1.0);
      `
      )
      shader.fragmentShader = shader.fragmentShader.replace(
        /#include <dithering_fragment>/,
        /* glsl */ `
        gl_FragColor = vec4( finalColor.rgb, diffuseColor.a );
      `
      )
    },
    [uniforms]
  )

  return (
    <meshPhongMaterial
      onBeforeCompile={onBeforeCompile}
      onUpdate={(m) => (m.needsUpdate = true)}
      customProgramCacheKey={() => onBeforeCompile.toString()}
      side={THREE.DoubleSide}
      reflectivity={1}
      // lights={true}
      // receiveShadow={true}
      // castShadow={true}
      //   map={texture}
    />
  )
}
