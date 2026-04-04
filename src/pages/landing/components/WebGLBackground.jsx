import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import earthTextureUrl from '../../../assets/earth_texture.png'

gsap.registerPlugin(ScrollTrigger)

const LAND_COUNT  = 8000
const OCEAN_COUNT = 2000
const SCATTER_COUNT = 400
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

/* ── World map via PNG texture (Natural Earth 50m, 4096×2048) ── */
function buildWorldMap(img) {
  const W = 1024, H = 512
  const cv = document.createElement('canvas')
  cv.width = W; cv.height = H
  const c = cv.getContext('2d')
  c.drawImage(img, 0, 0, W, H)
  return { W, H, data: c.getImageData(0, 0, W, H).data }
}

function isLand(wm, lon, lat) {
  const px = Math.min(wm.W - 1, Math.max(0, Math.floor(((lon + 180) / 360) * wm.W)))
  const py = Math.min(wm.H - 1, Math.max(0, Math.floor(((90 - lat) / 180) * wm.H)))
  return wm.data[(py * wm.W + px) * 4] > 128
}

function sampleSpherePoints(count, radius, wm, landOnly) {
  // Random uniform — covers ENTIRE sphere (both hemispheres)
  // Fibonacci was causing meia-lua: only sampled one hemisphere
  const points = []
  let attempts = 0
  while (points.length < count && attempts < count * 30) {
    attempts++
    const u = Math.random() * 2 - 1
    const theta = Math.random() * Math.PI * 2
    const st = Math.sqrt(1 - u * u)
    const x = st * Math.cos(theta)
    const y = u  // Y = up axis
    const z = st * Math.sin(theta)
    const lat = Math.asin(Math.max(-1, Math.min(1, y))) * (180 / Math.PI)
    const lon = Math.atan2(z, x) * (180 / Math.PI)
    const onL = isLand(wm, lon, lat)
    if (landOnly && !onL) continue
    if (!landOnly && onL) continue
    const r = radius + (Math.random() - 0.5) * 0.012
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

    float cR = cos(uRotY), sR = sin(uRotY);

    // ═══════════════════════════════════════════════════════════════════════
    // FRESNEL / BACKFACE — calculado sobre aBasePos rotacionado (sem offset)
    //
    // A câmera está em (0,0,7). O vetor de visão é -Z.
    // Para uma esfera centrada na origem, o "quanto uma partícula aponta
    // para a câmera" é simplesmente a componente Z do vetor normalizado
    // da partícula APÓS a rotação Y do globo.
    //
    // cosAngle > 0  → hemisfério frontal (visível)
    // cosAngle = 0  → borda lateral (borda do globo — DEVE ser visível!)
    // cosAngle < 0  → hemisfério traseiro (deve sumir)
    //
    // ERRO ANTERIOR: smoothstep(-0.1, 0.3, cosAngle) fazia cosAngle=0
    // (as bordas!) ter backFade=0.25 → globo aparecia como meia-lua.
    //
    // CORREÇÃO: usar smoothstep(-0.35, -0.05, cosAngle) para que
    // cosAngle=0 (borda) tenha backFade=1.0 (totalmente visível).
    // ═══════════════════════════════════════════════════════════════════════
    vec3 baseRotated = vec3(
      aBasePos.x * cR - aBasePos.z * sR,
      aBasePos.y,
      aBasePos.x * sR + aBasePos.z * cR
    );
    float bLen = length(baseRotated) + .001;
    float cosAngle = baseRotated.z / bLen;

    // Fresnel: máximo nas bordas (cosAngle≈0), zero no centro (cosAngle≈1)
    float fresnel  = pow(1.0 - abs(cosAngle), 2.5);
    float innerRim = pow(max(0., 1.0 - abs(cosAngle) - 0.1), 8.0) * 0.8;

    // backFade: só esconde o hemisfério traseiro PROFUNDO (cosAngle < -0.05)
    // cosAngle=0 (bordas laterais) → backFade=1.0 ← CHAVE para não ter meia-lua
    float backFade = smoothstep(-0.35, -0.05, cosAngle);

    if (aIsLand > .5) {
      vAlpha = (0.55 + fresnel * 0.6 + innerRim) * backFade * uGlobalOpacity;
    } else {
      vAlpha = (0.08 + fresnel * 0.3 + innerRim * 0.5) * backFade * uGlobalOpacity;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // POSIÇÃO
    // ═══════════════════════════════════════════════════════════════════════
    pos = aBasePos + uOrbCenter;

    // Noise deformation (só quando não está dispersando)
    if (uTransition < 0.01) {
      float seed = aRandom * 100.;
      float n1 = snoise(vec3(aBasePos.x * .2 + seed, aBasePos.y * .2, aBasePos.z * .2));
      float n2 = snoise(vec3(aBasePos.y * .2 + seed, aBasePos.z * .2, aBasePos.x * .2));
      float n3 = snoise(vec3(aBasePos.z * .2 + seed, aBasePos.x * .2, aBasePos.y * .2));
      pos.x += n1 * uDistortion * .06;
      pos.y += n2 * uDistortion * .04;
      pos.z += n3 * uDistortion * .05;
    }

    // CASCADE DISPERSION — original style, slightly faster
    if (uTransition > 0.) {
      float normalizedY = (aBasePos.y + 2.5) / 5.;
      float delay = (1. - normalizedY) * uCascadeDelay;
      float adjusted = max(0., uTransition - delay);
      float tP = min(adjusted / (1. - delay + .001), 1.);

      float bLen2 = length(aBasePos) + .001;
      vec3 dir = aBasePos / bLen2;

      float flowX = snoise(vec3(aBasePos.x*.5, aBasePos.y*.5, aBasePos.z*.5 + uTime*.08)) * .6;
      float flowY = snoise(vec3(aBasePos.y*.5, aBasePos.z*.5, aBasePos.x*.5 + uTime*.08)) * .6;
      float flowZ = snoise(vec3(aBasePos.z*.5, aBasePos.x*.5, aBasePos.y*.5 + uTime*.08)) * .6;

      float dist = pow(tP, 1.2) * uDispersionRadius;

      vec3 localPos2 = pos - uOrbCenter;
      localPos2 += (dir + vec3(flowX, flowY, flowZ) * 0.7) * dist;
      pos = localPos2 + uOrbCenter;
    }

    // Rotação Y em torno do centro do orbe
    vec3 centered = pos - uOrbCenter;
    pos = vec3(centered.x*cR - centered.z*sR, centered.y, centered.x*sR + centered.z*cR) + uOrbCenter;

    // Mouse repulsion
    vec2 md = uMouse - pos.xy;
    pos.xy += normalize(md + .001) * smoothstep(4., 0., length(md)) * .2;
  }

  // Giro coordenado dos triângulos (estilo Dala)
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
function buildScene(scene, wm) {
  const triGeo = new THREE.TetrahedronGeometry(0.022, 0)

  const landPts  = sampleSpherePoints(LAND_COUNT,  2.5, wm, true)
  const oceanPts = sampleSpherePoints(OCEAN_COUNT, 2.5, wm, false)
  const scatterPts = []
  for (let i = 0; i < SCATTER_COUNT; i++) {
    scatterPts.push({ x: (Math.random() - 0.5) * 16, y: (Math.random() - 0.5) * 12, z: (Math.random() - 0.5) * 10 })
  }
  const allPts = [...landPts, ...oceanPts, ...scatterPts]

  const basePos  = new Float32Array(TOTAL * 3)
  const colors   = new Float32Array(TOTAL * 3)
  const randoms  = new Float32Array(TOTAL)
  const isLandA  = new Float32Array(TOTAL)
  const isScatA  = new Float32Array(TOTAL)
  const scales   = new Float32Array(TOTAL)
  const rots     = new Float32Array(TOTAL * 3)

  allPts.forEach((p, i) => {
    const isSc = i >= LAND_COUNT + OCEAN_COUNT
    const isL  = i < LAND_COUNT
    basePos[i*3]   = p.x
    basePos[i*3+1] = p.y
    basePos[i*3+2] = p.z
    const pal = isL ? PALETTE_LAND : isSc ? PALETTE_LAND : PALETTE_OCEAN
    const col = pal[Math.floor(Math.random() * pal.length)]
    colors[i*3]   = col[0]
    colors[i*3+1] = col[1]
    colors[i*3+2] = col[2]
    randoms[i]  = Math.random()
    isLandA[i]  = isL ? 1 : 0
    isScatA[i]  = isSc ? 1 : 0
    scales[i]   = isSc ? Math.random() * 2.5 + 0.8 : 1
    rots[i*3]   = 0
    rots[i*3+1] = Math.random() * Math.PI * 2
    rots[i*3+2] = 0
  })

  const uniforms = {
    uTime:             { value: 0 },
    uDistortion:       { value: 0.2 },
    uTransition:       { value: 0 },
    uCascadeDelay:     { value: 0.3 },
    uDispersionRadius: { value: 1.0 },   // ← reduzido de 1.5 para 1.0
    uGlobalOpacity:    { value: 1 },
    uRotY:             { value: 0 },
    uOrbCenter:        { value: new THREE.Vector3(3, 0, 0) },
    uMouse:            { value: new THREE.Vector2(0, 0) },
  }

  const mat = new THREE.ShaderMaterial({
    vertexShader: VERT, fragmentShader: FRAG, uniforms,
    transparent: true, depthWrite: false, depthTest: false, side: THREE.DoubleSide,
    wireframe: true,
  })

  const mesh = new THREE.InstancedMesh(triGeo, mat, TOTAL)
  const geo = mesh.geometry
  geo.setAttribute('aBasePos',   new THREE.InstancedBufferAttribute(basePos, 3))
  geo.setAttribute('aColor',     new THREE.InstancedBufferAttribute(colors, 3))
  geo.setAttribute('aRandom',    new THREE.InstancedBufferAttribute(randoms, 1))
  geo.setAttribute('aIsLand',    new THREE.InstancedBufferAttribute(isLandA, 1))
  geo.setAttribute('aIsScatter', new THREE.InstancedBufferAttribute(isScatA, 1))
  geo.setAttribute('aScale',     new THREE.InstancedBufferAttribute(scales, 1))
  geo.setAttribute('aRotation',  new THREE.InstancedBufferAttribute(rots, 3))

  const identity = new THREE.Matrix4()
  for (let i = 0; i < TOTAL; i++) mesh.setMatrixAt(i, identity)
  mesh.instanceMatrix.needsUpdate = true
  scene.add(mesh)
  return { mesh, uniforms }
}

/* ── Carregar textura PNG ── */
function loadEarthTexture(url) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = url
  })
}

export function WebGLBackground() {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let raf, renderer, mesh, triggers = []

    const W = el.clientWidth, H = el.clientHeight

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(W, H)
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.2
    el.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const cam = new THREE.PerspectiveCamera(45, W / H, 0.1, 100)
    cam.position.set(0, 0, 7)
    cam.lookAt(0, 0, 0)

    const state = {
      orbX: 3, orbY: 0, orbZ: 0,
      distortion: 0.2, transition: 0,
      dispersionRadius: 1.0,   // ← reduzido de 1.5 para 1.0
      globalOpacity: 1,
    }

    const smooth = {
      orbX: 3, orbY: 0, orbZ: 0,
      distortion: 0.2, transition: 0,
      globalOpacity: 1,
    }
    const LERP = 0.04

    const mouseT = { x: 0, y: 0 }, mouseC = { x: 0, y: 0 }
    const onMM = e => {
      mouseT.x = (e.clientX / innerWidth - 0.5) * 6
      mouseT.y = -(e.clientY / innerHeight - 0.5) * 6
    }
    addEventListener('mousemove', onMM, { passive: true })

    const scrollS = { y: 0 }
    const onS = () => {
      const m = document.documentElement.scrollHeight - innerHeight
      scrollS.y = m > 0 ? scrollY / m : 0
    }
    addEventListener('scroll', onS, { passive: true })

    const onR = () => {
      const w = el.clientWidth, h = el.clientHeight
      renderer.setSize(w, h); cam.aspect = w / h; cam.updateProjectionMatrix()
    }
    addEventListener('resize', onR)

    let u = null
    const t0 = performance.now()

    const loop = () => {
      raf = requestAnimationFrame(loop)
      const time = (performance.now() - t0) * 0.001

      smooth.orbX          += (state.orbX          - smooth.orbX)          * LERP
      smooth.orbY          += (state.orbY          - smooth.orbY)          * LERP
      smooth.orbZ          += (state.orbZ          - smooth.orbZ)          * LERP
      smooth.distortion    += (state.distortion    - smooth.distortion)    * LERP
      smooth.transition    += (state.transition    - smooth.transition)    * LERP
      smooth.globalOpacity += (state.globalOpacity - smooth.globalOpacity) * 0.06

      if (u) {
        u.uTime.value             = time
        u.uRotY.value             = time * 0.08
        u.uDistortion.value       = smooth.distortion
        u.uTransition.value       = smooth.transition
        u.uCascadeDelay.value     = 0.3
        u.uDispersionRadius.value = state.dispersionRadius
        u.uGlobalOpacity.value    = smooth.globalOpacity
        u.uOrbCenter.value.set(smooth.orbX, smooth.orbY, smooth.orbZ)
      }

      mouseC.x += (mouseT.x - mouseC.x) * 0.03
      mouseC.y += (mouseT.y - mouseC.y) * 0.03
      if (u) u.uMouse.value.set(mouseC.x, mouseC.y)

      cam.position.y = -scrollS.y * 1.2
      cam.position.x = Math.sin(scrollS.y * Math.PI * 2) * 0.5

      renderer.render(scene, cam)
    }
    loop()

    loadEarthTexture(earthTextureUrl).then(img => {
      const wm = buildWorldMap(img)
      const result = buildScene(scene, wm)
      mesh = result.mesh
      u = result.uniforms

      // ScrollTrigger animations
      triggers.push(gsap.fromTo(state,
        { orbX: 3, orbY: 0, distortion: 0.2 },
        { orbX: -3.5, orbY: 0.3, distortion: 0.4,
          scrollTrigger: { trigger: '.section--tall', start: 'top bottom', end: 'bottom top', scrub: 2.5 } }
      ))

      // Fold 3a: slide to CENTER before dispersing
      triggers.push(gsap.fromTo(state,
        { orbX: -3.5, orbY: 0.3, orbZ: 0, distortion: 0.4 },
        { orbX: 0, orbY: 0, orbZ: 0, distortion: 0.2,
          immediateRender: false,
          scrollTrigger: { trigger: '#manifesto', start: 'top bottom', end: 'top top', scrub: 2.5 } }
      ))

      // Fold 3b: disperse from CENTER (orbX=0)
      triggers.push(gsap.to(state,
        { transition: 1, globalOpacity: 0.3,
          scrollTrigger: { trigger: '#manifesto', start: 'top top', end: 'bottom center', scrub: 2.5 } }
      ))

      // Fold 4: reconverge from center
      triggers.push(gsap.fromTo(state,
        { transition: 1, globalOpacity: 0.3, orbX: 0, orbY: 0, orbZ: 0, distortion: 0.2 },
        { transition: 0, globalOpacity: 1, orbX: 2.5, orbY: -0.5, orbZ: 0, distortion: 0.2,
          immediateRender: false,
          scrollTrigger: { trigger: '#resultados', start: 'top bottom', end: 'bottom center', scrub: 2.5 } }
      ))

      triggers.push(gsap.to(state,
        { distortion: 0.4,
          scrollTrigger: { trigger: '#contato', start: 'top bottom', end: 'center center', scrub: 2.5 } }
      ))
    }).catch(err => {
      console.error('[WebGLBackground] Falha ao carregar textura da Terra:', err)
    })

    return () => {
      cancelAnimationFrame(raf)
      removeEventListener('scroll', onS)
      removeEventListener('resize', onR)
      removeEventListener('mousemove', onMM)
      triggers.forEach(tr => tr.scrollTrigger?.kill())
      renderer.dispose()
      if (mesh) { mesh.geometry.dispose(); mesh.material.dispose() }
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement)
    }
  }, [])

  return <div ref={ref} style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', width: '100vw', height: '100vh' }} />
}
