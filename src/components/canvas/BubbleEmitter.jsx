import { useMemo, useRef, useState } from 'react'
// import { a as a3, useSpring as useSpringThree } from '@react-spring/three'
import { Physics, useBox, usePlane, useSphere } from '@react-three/cannon'
import { useFrame } from '@react-three/fiber'
import niceColors from 'nice-color-palettes'
import { suspend } from 'suspend-react'
import * as THREE from 'three'
import { Color } from 'three'

import createAudio from '@/helpers/createAudio'

function Plane(props) {
  const [ref] = usePlane(() => ({ ...props }), useRef())

  return (
    <mesh ref={ref} receiveShadow>
      <planeBufferGeometry args={[5, 5]} />
      <shadowMaterial color='#171717' visible={false} />
    </mesh>
  )
}

const Spheres = ({ colors, number, size }) => {
  const [ref, { at }] = useSphere(
    () => ({
      args: [size],
      mass: 1,
      position: [
        Math.random() * 2 - 0.5,
        Math.random() * 2,
        Math.random() * 2 - 0.5,
      ],
    }),
    useRef(null)
  )
  useFrame(() =>
    at(Math.floor(Math.random() * number)).position.set(0, Math.random() * 2, 0)
  )
  return (
    <instancedMesh
      receiveShadow
      castShadow
      ref={ref}
      args={[undefined, undefined, number]}
    >
      <sphereBufferGeometry args={[size, 32]}>
        <instancedBufferAttribute
          attach='attributes-color'
          args={[colors, 3]}
        />
      </sphereBufferGeometry>
      <meshLambertMaterial vertexColors />
    </instancedMesh>
  )
}

const Bubbles = ({ colors, number, size, url, obj }) => {
  const args = [size, size, size]
  const [ref, { at }] = useBox(
    () => ({
      args,
      mass: 5,
      position: [
        Math.random() * 2 - 0.5,
        Math.random() * 2,
        Math.random() * 2 - 0.5,
      ],
    }),
    useRef(null)
  )
  // Create persistent local uniforms object
  const [uniforms] = useState(() => ({
    time: { value: 0 },
    avg: { value: 10 },
  }))

  const { update } = suspend(() => createAudio(url), [url])
  // Add our custom bits to the MeshStandardMaterial
  const onBeforeCompile = (shader) => {
    // Wire up local uniform references
    shader.uniforms = { ...shader.uniforms, ...uniforms }

    // Add to top of vertex shader
    shader.vertexShader = /* glsl */ `
      //	Simplex 4D Noise 
      //	by Ian McEwan, Ashima Arts
      //
      vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
      float permute(float x){return floor(mod(((x*34.0)+1.0)*x, 289.0));}
      vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
      float taylorInvSqrt(float r){return 1.79284291400159 - 0.85373472095314 * r;}

      vec4 grad4(float j, vec4 ip){
        const vec4 ones = vec4(1.0, 1.0, 1.0, -1.0);
        vec4 p,s;

        p.xyz = floor( fract (vec3(j) * ip.xyz) * 7.0) * ip.z - 1.0;
        p.w = 1.5 - dot(abs(p.xyz), ones.xyz);
        s = vec4(lessThan(p, vec4(0.0)));
        p.xyz = p.xyz + (s.xyz*2.0 - 1.0) * s.www; 

        return p;
      }

      float snoise(vec4 v){
        const vec2  C = vec2( 0.138196601125010504,  // (5 - sqrt(5))/20  G4
                              0.309016994374947451); // (sqrt(5) - 1)/4   F4
      // First corner
        vec4 i  = floor(v + dot(v, C.yyyy) );
        vec4 x0 = v -   i + dot(i, C.xxxx);

      // Other corners

      // Rank sorting originally contributed by Bill Licea-Kane, AMD (formerly ATI)
        vec4 i0;

        vec3 isX = step( x0.yzw, x0.xxx );
        vec3 isYZ = step( x0.zww, x0.yyz );
      //  i0.x = dot( isX, vec3( 1.0 ) );
        i0.x = isX.x + isX.y + isX.z;
        i0.yzw = 1.0 - isX;

      //  i0.y += dot( isYZ.xy, vec2( 1.0 ) );
        i0.y += isYZ.x + isYZ.y;
        i0.zw += 1.0 - isYZ.xy;

        i0.z += isYZ.z;
        i0.w += 1.0 - isYZ.z;

        // i0 now contains the unique values 0,1,2,3 in each channel
        vec4 i3 = clamp( i0, 0.0, 1.0 );
        vec4 i2 = clamp( i0-1.0, 0.0, 1.0 );
        vec4 i1 = clamp( i0-2.0, 0.0, 1.0 );

        //  x0 = x0 - 0.0 + 0.0 * C 
        vec4 x1 = x0 - i1 + 1.0 * C.xxxx;
        vec4 x2 = x0 - i2 + 2.0 * C.xxxx;
        vec4 x3 = x0 - i3 + 3.0 * C.xxxx;
        vec4 x4 = x0 - 1.0 + 4.0 * C.xxxx;

      // Permutations
        i = mod(i, 289.0); 
        float j0 = permute( permute( permute( permute(i.w) + i.z) + i.y) + i.x);
        vec4 j1 = permute( permute( permute( permute (
                  i.w + vec4(i1.w, i2.w, i3.w, 1.0 ))
                + i.z + vec4(i1.z, i2.z, i3.z, 1.0 ))
                + i.y + vec4(i1.y, i2.y, i3.y, 1.0 ))
                + i.x + vec4(i1.x, i2.x, i3.x, 1.0 ));
      // Gradients
      // ( 7*7*6 points uniformly over a cube, mapped onto a 4-octahedron.)
      // 7*7*6 = 294, which is close to the ring size 17*17 = 289.

        vec4 ip = vec4(1.0/294.0, 1.0/49.0, 1.0/7.0, 0.0) ;

        vec4 p0 = grad4(j0,   ip);
        vec4 p1 = grad4(j1.x, ip);
        vec4 p2 = grad4(j1.y, ip);
        vec4 p3 = grad4(j1.z, ip);
        vec4 p4 = grad4(j1.w, ip);

      // Normalise gradients
        vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
        p0 *= norm.x;
        p1 *= norm.y;
        p2 *= norm.z;
        p3 *= norm.w;
        p4 *= taylorInvSqrt(dot(p4,p4));

      // Mix contributions from the five corners
        vec3 m0 = max(0.6 - vec3(dot(x0,x0), dot(x1,x1), dot(x2,x2)), 0.0);
        vec2 m1 = max(0.6 - vec2(dot(x3,x3), dot(x4,x4)            ), 0.0);
        m0 = m0 * m0;
        m1 = m1 * m1;
        return 49.0 * ( dot(m0*m0, vec3( dot( p0, x0 ), dot( p1, x1 ), dot( p2, x2 )))
                    + dot(m1*m1, vec2( dot( p3, x3 ), dot( p4, x4 ) ) ) ) ;

      }
      uniform float time;
      uniform float avg;
    ${shader.vertexShader}`
    // Assign values to varyings inside of main()
    shader.vertexShader = shader.vertexShader.replace(
      /#include <begin_vertex>/,
      (match) =>
        `${
          match
          /* glsl */
        }
        float t = time*.5;
        float pos = snoise(vec4(position+t, 1.));
        transformed = position+pos;
       // transformed=transformed+avg;

        `
    )

    // // Add to top of fragment shader
    // shader.fragmentShader =
    //   /* glsl */ `
    //   #define FLIP vec2(1., -1.)

    //   uniform vec3 colorA;
    //   uniform vec3 colorB;
    //   uniform sampler2D heightMap;
    //   uniform sampler2D displacementMap;
    //   uniform int iterations;
    //   uniform float depth;
    //   uniform float smoothing;
    //   uniform float displacement;
    //   uniform float time;

    //   varying vec3 v_pos;
    //   varying vec3 v_dir;
    // ` + shader.fragmentShader
  }

  useFrame(({ clock }) => {
    const avg = update() * 0.05
    // Distribute the instanced planes according to the frequency daza
    // for (let i = 0; i < number; i++) {
    //   obj.scale.set(avg, avg, avg)
    //   obj.position.set(
    //     Math.random() * 2 - 0.5,
    //     Math.random() * 2,
    //     Math.random() * 2 - 0.5
    //   )
    //   obj.updateMatrix()
    //   ref.current.setMatrixAt(i, obj.matrix)
    // }
    uniforms.time.value = clock.elapsedTime * 0.25
    uniforms.avg.value = avg
    at(Math.floor(Math.random() * number)).position.set(
      Math.random() * 5,
      Math.random() * 5,
      Math.random() * 5
    )
    // at(Math.floor(Math.random() * number)).scaleOverride([avg, avg, avg])
  })
  return (
    <instancedMesh
      receiveShadow
      castShadow
      ref={ref}
      args={[undefined, undefined, number]}
    >
      <icosahedronGeometry args={[size * 3, 48]}>
        <instancedBufferAttribute
          attach='attributes-color'
          args={[colors, 3]}
        />
      </icosahedronGeometry>
      <meshPhysicalMaterial
        onBeforeCompile={onBeforeCompile}
        lights={true}
        roughness={0}
        transmission={1} // Add transparency
        thickness={0.25} // Add refraction!
        onUpdate={(m) => (m.needsUpdate = true)}
        customProgramCacheKey={() => onBeforeCompile.toString()}
        // vertexColors
      />
    </instancedMesh>
  )
}

const instancedGeometry = {
  bubble: Bubbles,
  sphere: Spheres,
}

const BubbleEmitter = ({
  url = '/audio/drum.mp3',
  obj = new THREE.Object3D(),
}) => {
  const [geometry, setGeometry] = useState('bubble')
  const [number] = useState(100)
  const [size] = useState(Math.random() * 0.25)

  const colors = useMemo(() => {
    const array = new Float32Array(number * 3)
    const color = new Color()
    for (let i = 0; i < number; i++)
      color
        .set(niceColors[17][Math.floor(Math.random() * 5)])
        .convertSRGBToLinear()
        .toArray(array, i * 3)
    return array
  }, [number])

  const InstancedGeometry = instancedGeometry[geometry]

  return (
    <>
      <hemisphereLight intensity={0.35} />
      <spotLight
        position={[5, 5, 5]}
        angle={0.3}
        penumbra={1}
        intensity={2}
        castShadow
        shadow-mapSize-width={256}
        shadow-mapSize-height={256}
      />
      <Physics broadphase='SAP' gravity={[0, -0.3, 0]}>
        <Plane rotation={[-Math.PI / 2, 0, 0]} />
        <InstancedGeometry {...{ colors, number, size, url, obj }} />
      </Physics>
    </>
  )
}

export default BubbleEmitter
