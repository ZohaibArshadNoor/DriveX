/**
 * AuroraShader.js
 * Place at: src/shaders/AuroraShader.js
 *
 * A full-screen aurora / bioluminescent sky shader.
 * Used as a background plane in the FinalCTA section.
 * Uniform `uTime` drives the animation — increment it in your render loop.
 */

export const AuroraShader = {
  uniforms: {
    uTime:       { value: 0 },
    uResolution: { value: [1920, 1080] },
    uIntensity:  { value: 0.8 },
    uColorA:     { value: [0.05, 0.65, 0.92] },   // teal
    uColorB:     { value: [0.13, 0.83, 0.93] },   // cyan
    uColorC:     { value: [0.0,  0.45, 0.6 ] },   // deep teal
  },

  vertexShader: /* glsl */`
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: /* glsl */`
    uniform float uTime;
    uniform vec2  uResolution;
    uniform float uIntensity;
    uniform vec3  uColorA;
    uniform vec3  uColorB;
    uniform vec3  uColorC;
    varying vec2  vUv;

    /* ── Noise helpers ─────────────────────────────────────── */
    vec3 hash3(vec2 p) {
      vec3 q = vec3(
        dot(p, vec2(127.1, 311.7)),
        dot(p, vec2(269.5, 183.3)),
        dot(p, vec2(419.2, 371.9))
      );
      return fract(sin(q) * 43758.5453);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(
        mix(dot(hash3(i + vec2(0,0)).xy - 0.5, f - vec2(0,0)),
            dot(hash3(i + vec2(1,0)).xy - 0.5, f - vec2(1,0)), u.x),
        mix(dot(hash3(i + vec2(0,1)).xy - 0.5, f - vec2(0,1)),
            dot(hash3(i + vec2(1,1)).xy - 0.5, f - vec2(1,1)), u.x),
        u.y
      );
    }

    float fbm(vec2 p) {
      float v = 0.0, a = 0.5;
      for (int i = 0; i < 6; i++) {
        v += a * noise(p);
        p  = p * 2.0 + vec2(0.8, 1.2);
        a *= 0.5;
      }
      return v;
    }

    /* ── Aurora curtain ────────────────────────────────────── */
    vec3 aurora(vec2 uv) {
      float t   = uTime * 0.12;
      vec2  pos = vec2(uv.x * 3.0 + t, uv.y * 1.5);

      float band  = fbm(pos + fbm(pos + vec2(0.3, 1.0)));
      float alpha = smoothstep(0.38, 0.55, band) * smoothstep(0.85, 0.55, band);
      alpha      *= smoothstep(0.0, 0.35, uv.y) * smoothstep(1.0, 0.55, uv.y);

      float phase = fbm(pos * 1.4 + uTime * 0.07);
      vec3 col = mix(uColorA, uColorB, phase);
      col      = mix(col, uColorC, smoothstep(0.4, 0.7, fbm(pos * 2.5 - t)));

      return col * alpha * uIntensity * 2.2;
    }

    /* ── Stars ─────────────────────────────────────────────── */
    float stars(vec2 uv, float density) {
      vec2 cell = floor(uv * density);
      vec2 frac = fract(uv * density);
      vec3 h    = hash3(cell);
      float size = 0.003 + h.z * 0.012;
      float star = 1.0 - smoothstep(size, size * 2.2, length(frac - 0.5));
      float twinkle = 0.6 + 0.4 * sin(uTime * (2.0 + h.x * 4.0) + h.y * 6.28);
      return star * twinkle * step(0.82, h.x);
    }

    void main() {
      vec2 uv = vUv;
      /* sky gradient */
      vec3 sky = mix(vec3(0.002, 0.035, 0.07), vec3(0.01, 0.07, 0.15), uv.y);
      /* aurora */
      sky += aurora(uv);
      /* stars */
      float s = stars(uv, 80.0) + stars(uv * 1.7, 120.0) * 0.5;
      sky += vec3(0.6, 0.9, 1.0) * s * 0.9;
      /* ground reflection at bottom */
      float gnd = 1.0 - smoothstep(0.0, 0.22, uv.y);
      sky = mix(sky, vec3(0.002, 0.05, 0.1) + aurora(vec2(uv.x, 0.22 - uv.y)) * 0.4, gnd * 0.7);

      gl_FragColor = vec4(sky, 1.0);
    }
  `,
};