import { useEffect, useRef } from 'react'
import * as THREE from 'three'
// Bloom removed — was causing depth test reset that created half-moon effect
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const LAND_COUNT = 8000
const OCEAN_COUNT = 3000
const SCATTER_COUNT = 600
const TOTAL = LAND_COUNT + OCEAN_COUNT + SCATTER_COUNT

const PALETTE_LAND = [
  [0.961, 0.620, 0.043],[0.961, 0.620, 0.043],
  [0.486, 0.227, 0.929],[0.024, 0.714, 0.831],
  [0.133, 0.773, 0.369],[0.925, 0.282, 0.600],[0.9, 0.9, 0.9],
]
const PALETTE_OCEAN = [
  [0.024, 0.714, 0.831],[0.486, 0.227, 0.929],
  [0.3, 0.3, 0.35],[0.2, 0.2, 0.25],
]

/* ── World map ── */
function buildWorldMap() {
  const W = 360, H = 180, cv = document.createElement('canvas')
  cv.width = W; cv.height = H
  const c = cv.getContext('2d')
  c.fillStyle = '#000'; c.fillRect(0, 0, W, H); c.fillStyle = '#fff'
  const X = lo => ((lo+180)/360)*W, Y = la => ((90-la)/180)*H
  const poly = pts => { c.beginPath(); pts.forEach(([lo,la],i) => i ? c.lineTo(X(lo),Y(la)) : c.moveTo(X(lo),Y(la))); c.closePath(); c.fill() }
  poly([[-52,47],[-60,46],[-64,50],[-64,62],[-60,63],[-60,68],[-65,72],[-65,76],[-80,80],[-120,80],[-140,70],[-168,71],[-168,65],[-165,61],[-155,59],[-140,60],[-130,54],[-125,50],[-124,48],[-122,38],[-117,34],[-117,32],[-110,23],[-104,19],[-99,16],[-95,16],[-92,14],[-90,20],[-88,20],[-80,25],[-75,35],[-76,38],[-75,44],[-67,44]])
  poly([[-54,72],[-44,60],[-18,60],[-12,70],[-18,84],[-44,84]])
  poly([[-35,5],[-38,-8],[-55,-38],[-65,-55],[-70,-55],[-75,-20],[-80,-10],[-80,0],[-70,12],[-60,10],[-50,8]])
  poly([[-10,36],[-5,45],[-5,48],[-2,50],[0,62],[-5,57],[5,57],[10,63],[15,68],[20,68],[25,65],[30,60],[37,48],[35,42],[40,42],[35,37],[25,36],[20,36],[15,38],[10,37],[3,37],[0,36],[-5,36],[-10,36]])
  poly([[5,57],[15,57],[18,60],[22,65],[26,70],[20,70],[15,68],[10,63]])
  poly([[-6,50],[-1,50],[-1,59],[-6,59]])
  poly([[-18,16],[-18,-5],[-18,-35],[0,-30],[15,-35],[18,-35],[35,-30],[43,-12],[51,12],[42,12],[35,25],[25,37],[10,37],[0,37],[-10,35]])
  poly([[25,36],[25,70],[40,70],[60,72],[75,75],[100,70],[120,70],[140,70],[168,68],[170,60],[155,55],[145,45],[135,40],[130,35],[120,20],[105,12],[100,5],[97,8],[97,20],[90,25],[80,25],[75,20],[65,22],[60,20],[55,12],[42,12],[40,38],[40,42],[35,37]])
  poly([[36,30],[57,22],[60,22],[55,12],[42,12],[36,22]])
  poly([[130,31],[138,33],[140,38],[140,42],[134,44]])
  poly([[113,-12],[132,-12],[142,-15],[150,-23],[148,-30],[138,-35],[131,-34],[115,-34],[113,-25],[115,-20]])
  poly([[165,-34],[175,-34],[178,-42],[173,-46],[167,-46]])
  return { W, H, data: c.getImageData(0,0,W,H).data }
}

function isLand(wm, lon, lat) {
  const px = Math.floor(((lon+180)/360)*wm.W), py = Math.floor(((90-lat)/180)*wm.H)
  return wm.data[(py*wm.W+px)*4] > 128
}

function sampleSpherePoints(count, radius, wm, landOnly) {
  // Fibonacci sphere for uniform spacing (no gaps, no clusters)
  const goldenAngle = Math.PI * (3 - Math.sqrt(5))
  const totalSamples = count * 8
  const points = []
  for (let i = 0; i < totalSamples && points.length < count; i++) {
    const theta = goldenAngle * i
    const phi = Math.acos(1 - (2 * (i + 0.5)) / totalSamples)
    const x = Math.sin(phi) * Math.cos(theta)
    const y = Math.sin(phi) * Math.sin(theta)
    const z = Math.cos(phi)
    const lat = Math.asin(z) * (180 / Math.PI)
    const lon = Math.atan2(y, x) * (180 / Math.PI)
    const onL = isLand(wm, lon, lat)
    if (landOnly && !onL) continue
    if (!landOnly && onL) continue
    const r = radius + (Math.random() - .5) * .015
    points.push({ x: x * r, y: y * r, z: z * r })
  }
  return points
}

/* ── Simplex noise GLSL ── */
const NOISE_GLSL = `
vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;}
vec4 mod289(vec4 x){return x-floor(x*(1./289.))*289.;}
vec4 permute(vec4 x){return mod289(((x*34.)+10.)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1./6.,1./3.);const vec4 D=vec4(0.,.5,1.,2.);
  vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.-g;
  vec3 i1=min(g,l.zxy);vec3 i2=max(g,l.zxy);
  vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.,i1.z,i2.z,1.))+i.y+vec4(0.,i1.y,i2.y,1.))+i.x+vec4(0.,i1.x,i2.x,1.));
  float n_=.142857142857;vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.*x_);
  vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.+1.;vec4 s1=floor(b1)*2.+1.;
  vec4 sh=-step(h,vec4(0.));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(.5-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);m=m*m;
  return 105.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}`

/* ── Vertex Shader ── */
const VERT = `
${NOISE_GLSL}

uniform float uTime;
uniform float uDistortion;
uniform float uTransition;
uniform float uCascadeDelay;
uniform float uDispersionRadius;
uniform float uGlobalOpacity;
uniform float uRotY;
uniform vec3  uOrbCenter;
uniform vec2  uMouse;

attribute vec3  aBasePos;
attribute vec3  aColor;
attribute float aRandom;
attribute float aIsLand;
attribute float aIsScatter;
attribute float aScale;
attribute vec3  aRotation;

varying vec3  vColor;
varying float vAlpha;

void main() {
  vColor = aColor;
  vec3 pos;

  if (aIsScatter > .5) {
    pos = aBasePos;
    pos.x += sin(uTime * .1 + aRandom * 20.) * .3;
    pos.y += cos(uTime * .08 + aRandom * 15.) * .2;
    pos.z = mod(aBasePos.z + uTime * .2 * (.5 + aRandom) + 6., 12.) - 6.;
    vec2 md = uMouse - pos.xy;
    pos.xy += normalize(md + .001) * smoothstep(4., 0., length(md)) * .15;
    float depth = smoothstep(-5., 5., pos.z);
    vAlpha = (.15 + depth * .30) * uGlobalOpacity;

  } else {
    pos = aBasePos + uOrbCenter;

    // NOISE DEFORMATION: ZERO when dispersing (hard cut, not gradual)
    if (uTransition < 0.01) {
      float seed = aRandom * 100.;
      float n1 = snoise(vec3(aBasePos.x * .2 + seed, aBasePos.y * .2, aBasePos.z * .2));
      float n2 = snoise(vec3(aBasePos.y * .2 + seed, aBasePos.z * .2, aBasePos.x * .2));
      float n3 = snoise(vec3(aBasePos.z * .2 + seed, aBasePos.x * .2, aBasePos.y * .2));
      pos.x += n1 * uDistortion * .06;
      pos.y += n2 * uDistortion * .04;
      pos.z += n3 * uDistortion * .05;
    }

    // CASCADE DISPERSION — organic curl/flow, not linear explosion
    if (uTransition > 0.) {
      float normalizedY = (aBasePos.y + 2.5) / 5.;
      float delay = (1. - normalizedY) * uCascadeDelay;
      float adjusted = max(0., uTransition - delay);
      float tP = min(adjusted / (1. - delay + .001), 1.);

      // Base radial direction
      float len = length(aBasePos) + .001;
      vec3 dir = aBasePos / len;

      // Curl/flow noise — organic smoke/fabric feel
      // Uses slow time for gentle drift, not vibration
      float flowX = snoise(vec3(aBasePos.x*.5, aBasePos.y*.5, aBasePos.z*.5 + uTime*.08)) * .6;
      float flowY = snoise(vec3(aBasePos.y*.5, aBasePos.z*.5, aBasePos.x*.5 + uTime*.08)) * .6;
      float flowZ = snoise(vec3(aBasePos.z*.5, aBasePos.x*.5, aBasePos.y*.5 + uTime*.08)) * .6;

      // Smooth start, accelerating end
      float dist = pow(tP, 1.5) * uDispersionRadius;

      // Final position: radial + organic flow
      pos += (dir + vec3(flowX, flowY, flowZ) * 2.0) * dist;
    }

    // Y-axis rotation
    float cR = cos(uRotY), sR = sin(uRotY);
    vec3 centered = pos - uOrbCenter;
    pos = vec3(centered.x*cR - centered.z*sR, centered.y, centered.x*sR + centered.z*cR) + uOrbCenter;

    // Mouse
    vec2 md = uMouse - pos.xy;
    pos.xy += normalize(md + .001) * smoothstep(4., 0., length(md)) * .2;

    // UNIFORM alpha — no Fresnel, no meia lua
    // All particles on the sphere get the same brightness regardless of angle
    if (aIsLand > .5) {
      vAlpha = 0.55 * uGlobalOpacity;
    } else {
      vAlpha = 0.08 * uGlobalOpacity;
    }
  }

  // Coordinated spin: ALL rotate at same speed on all axes (like Dala)
  float spinX = aRandom * 6.28 + uTime * .3;
  float spinY = fract(aRandom * 7.13) * 6.28 + uTime * .3;
  float spinZ = fract(aRandom * 3.57) * 6.28 + uTime * .3;
  float cx = cos(spinX), sx = sin(spinX);
  float cy = cos(spinY), sy = sin(spinY);
  float cz = cos(spinZ), sz = sin(spinZ);
  mat3 rotMat = mat3(
    cy*cz, sx*sy*cz - cx*sz, cx*sy*cz + sx*sz,
    cy*sz, sx*sy*sz + cx*cz, cx*sy*sz - sx*cz,
    -sy, sx*cy, cx*cy
  );
  vec3 localPos = rotMat * (position * aScale * (.7 + vAlpha * .6));
  gl_Position = projectionMatrix * modelViewMatrix * vec4(localPos + pos, 1.0);
}
`

const FRAG = `
varying vec3  vColor;
varying float vAlpha;
void main() {
  if (vAlpha < .005) discard;
  gl_FragColor = vec4(vColor, vAlpha);
}
`

/* ── Build scene ── */
function buildScene(scene) {
  const wm = buildWorldMap()
  // Tetrahedron = 3D pyramid wireframe (Dala-style vazado)
  const triGeo = new THREE.TetrahedronGeometry(0.018, 0)

  const landPts = sampleSpherePoints(LAND_COUNT, 2.5, wm, true)
  const oceanPts = sampleSpherePoints(OCEAN_COUNT, 2.5, wm, false)
  const scatterPts = []; for(let i=0;i<SCATTER_COUNT;i++) scatterPts.push({x:(Math.random()-.5)*16,y:(Math.random()-.5)*12,z:(Math.random()-.5)*10})
  const allPts = [...landPts,...oceanPts,...scatterPts]

  const basePos=new Float32Array(TOTAL*3), colors=new Float32Array(TOTAL*3)
  const randoms=new Float32Array(TOTAL), isLandA=new Float32Array(TOTAL)
  const isScatA=new Float32Array(TOTAL), scales=new Float32Array(TOTAL), rots=new Float32Array(TOTAL*3)

  allPts.forEach((p,i) => {
    const isSc = i >= LAND_COUNT+OCEAN_COUNT, isL = i < LAND_COUNT
    basePos[i*3]=p.x; basePos[i*3+1]=p.y; basePos[i*3+2]=p.z
    const pal = isL ? PALETTE_LAND : isSc ? PALETTE_LAND : PALETTE_OCEAN
    const col = pal[Math.floor(Math.random()*pal.length)]
    colors[i*3]=col[0]; colors[i*3+1]=col[1]; colors[i*3+2]=col[2]
    randoms[i]=Math.random(); isLandA[i]=isL?1:0; isScatA[i]=isSc?1:0
    scales[i]=isSc?Math.random()*2.5+.8:1
    rots[i*3]=0; rots[i*3+1]=Math.random()*Math.PI*2; rots[i*3+2]=0  // only Y varies
  })

  const uniforms = {
    uTime:{value:0}, uDistortion:{value:.2}, uTransition:{value:0},
    uCascadeDelay:{value:.3}, uDispersionRadius:{value:1.5},
    uGlobalOpacity:{value:1}, uRotY:{value:0},
    uOrbCenter:{value:new THREE.Vector3(3,0,0)},
    uMouse:{value:new THREE.Vector2(0,0)},
  }

  const mat = new THREE.ShaderMaterial({
    vertexShader:VERT, fragmentShader:FRAG, uniforms,
    transparent:true, depthWrite:false, depthTest:false, side:THREE.DoubleSide,
    wireframe:true,
  })

  const mesh = new THREE.InstancedMesh(triGeo, mat, TOTAL)
  const geo = mesh.geometry
  geo.setAttribute('aBasePos', new THREE.InstancedBufferAttribute(basePos,3))
  geo.setAttribute('aColor', new THREE.InstancedBufferAttribute(colors,3))
  geo.setAttribute('aRandom', new THREE.InstancedBufferAttribute(randoms,1))
  geo.setAttribute('aIsLand', new THREE.InstancedBufferAttribute(isLandA,1))
  geo.setAttribute('aIsScatter', new THREE.InstancedBufferAttribute(isScatA,1))
  geo.setAttribute('aScale', new THREE.InstancedBufferAttribute(scales,1))
  geo.setAttribute('aRotation', new THREE.InstancedBufferAttribute(rots,3))

  const identity = new THREE.Matrix4()
  for(let i=0;i<TOTAL;i++) mesh.setMatrixAt(i, identity)
  mesh.instanceMatrix.needsUpdate = true
  scene.add(mesh)
  return { mesh, uniforms }
}

export function WebGLBackground() {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const W = el.clientWidth, H = el.clientHeight
    const renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true })
    renderer.setSize(W,H); renderer.setPixelRatio(Math.min(devicePixelRatio,2))
    renderer.setClearColor(0x000000,0)
    renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.2
    el.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const cam = new THREE.PerspectiveCamera(45, W/H, .1, 100)
    cam.position.set(0,0,7); cam.lookAt(0,0,0)

    const { mesh, uniforms: u } = buildScene(scene)

    // Direct render — no EffectComposer, no depth test interference

    // State — GSAP animates this, render loop copies to uniforms
    const state = {
      orbX:3, orbY:0, orbZ:0,
      distortion:.2, transition:0,
      dispersionRadius:1.5,
      globalOpacity:1,
    }

    // PER-SECTION fromTo — explicit from/to, no value inference
    const triggers = []

    // Fold 2: RIGHT → LEFT
    triggers.push(gsap.fromTo(state,
      { orbX: 3, orbY: 0, distortion: .2 },
      { orbX: -3.5, orbY: .3, distortion: .4,
        scrollTrigger: { trigger: '.section--tall', start: 'top bottom', end: 'bottom top', scrub: 2.5 } }
    ))

    // Fold 3a: LEFT → slightly left of center before explosion
    triggers.push(gsap.fromTo(state,
      { orbX: -3.5, orbY: .3, orbZ: 0, distortion: .4 },
      { orbX: -1, orbY: 0, orbZ: .5, distortion: .3,
        immediateRender: false,
        scrollTrigger: { trigger: '#manifesto', start: 'top bottom', end: 'top center', scrub: 2.5 } }
    ))

    // Fold 3b: CASCADE DISPERSION from orbX: -1
    triggers.push(gsap.to(state,
      { transition: 1, globalOpacity: .3,
        scrollTrigger: { trigger: '#manifesto', start: 'top center', end: 'bottom center', scrub: 2.5 } }
    ))

    // Fold 4: reconverge (immediateRender:false)
    triggers.push(gsap.fromTo(state,
      { transition: 1, globalOpacity: .3, orbX: 0, orbY: 0, orbZ: .5, distortion: .3 },
      { transition: 0, globalOpacity: 1, orbX: 2.5, orbY: -.5, orbZ: 0, distortion: .2,
        immediateRender: false,
        scrollTrigger: { trigger: '#resultados', start: 'top bottom', end: 'bottom center', scrub: 2.5 } }
    ))

    // Fold 5: gentle pulse
    triggers.push(gsap.to(state,
      { distortion: .4,
        scrollTrigger: { trigger: '#contato', start: 'top bottom', end: 'center center', scrub: 2.5 } }
    ))

    // Mouse
    const mouseT={x:0,y:0}, mouseC={x:0,y:0}
    const onMM = e => { mouseT.x=(e.clientX/innerWidth-.5)*6; mouseT.y=-(e.clientY/innerHeight-.5)*6 }
    addEventListener('mousemove', onMM, {passive:true})

    const scrollS = {y:0}
    const onS = () => { const m=document.documentElement.scrollHeight-innerHeight; scrollS.y=m>0?scrollY/m:0 }
    addEventListener('scroll', onS, {passive:true})

    const onR = () => { const w=el.clientWidth,h=el.clientHeight; renderer.setSize(w,h); cam.aspect=w/h; cam.updateProjectionMatrix() }
    addEventListener('resize', onR)

    // Smoothed values — lerp toward state each frame (0.04 = 4% per frame = silky inertia)
    const smooth = {
      orbX: 3, orbY: 0, orbZ: 0,
      distortion: .2, transition: 0,
      globalOpacity: 1,
    }
    const LERP = 0.04

    let raf; const t0 = performance.now()
    const loop = () => {
      raf = requestAnimationFrame(loop)
      const time = (performance.now()-t0)*.001

      // Lerp smooth → state (inertia on top of GSAP)
      smooth.orbX        += (state.orbX - smooth.orbX) * LERP
      smooth.orbY        += (state.orbY - smooth.orbY) * LERP
      smooth.orbZ        += (state.orbZ - smooth.orbZ) * LERP
      smooth.distortion  += (state.distortion - smooth.distortion) * LERP
      smooth.transition  += (state.transition - smooth.transition) * LERP
      smooth.globalOpacity += (state.globalOpacity - smooth.globalOpacity) * 0.06

      // Copy SMOOTHED values → uniforms
      u.uTime.value = time
      u.uRotY.value = time * .08
      u.uDistortion.value = smooth.distortion
      u.uTransition.value = smooth.transition
      u.uCascadeDelay.value = state.cascadeDelay
      u.uDispersionRadius.value = state.dispersionRadius
      u.uGlobalOpacity.value = smooth.globalOpacity
      u.uOrbCenter.value.set(smooth.orbX, smooth.orbY, smooth.orbZ)

      mouseC.x += (mouseT.x-mouseC.x)*.03; mouseC.y += (mouseT.y-mouseC.y)*.03
      u.uMouse.value.set(mouseC.x, mouseC.y)

      cam.position.y = -scrollS.y*1.2
      cam.position.x = Math.sin(scrollS.y*Math.PI*2)*.5

      renderer.render(scene, cam)
    }
    loop()

    return () => {
      cancelAnimationFrame(raf)
      removeEventListener('scroll',onS); removeEventListener('resize',onR); removeEventListener('mousemove',onMM)
      triggers.forEach(tr => tr.scrollTrigger?.kill())
      renderer.dispose(); mesh.geometry.dispose(); mesh.material.dispose()
      if(el.contains(renderer.domElement)) el.removeChild(renderer.domElement)
    }
  }, [])

  return <div ref={ref} style={{position:'fixed',inset:0,zIndex:0,pointerEvents:'none',width:'100vw',height:'100vh'}} />
}
