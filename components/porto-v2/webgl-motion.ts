type Renderer = {
  draw: (time: number, pointer: [number, number], color: [number, number, number]) => void;
  dispose: () => void;
};

const vertex = `#version 300 es
void main() {
  vec2 point = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
  gl_Position = vec4(point * 2.0 - 1.0, 0.0, 1.0);
}`;

const fragment = `#version 300 es
precision highp float;
uniform vec2 u_resolution;
uniform vec2 u_pointer;
uniform vec3 u_color;
uniform float u_time;
out vec4 outColor;

float hash(vec2 point) { return fract(sin(dot(point, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 point) {
  vec2 cell = floor(point);
  vec2 blend = fract(point);
  blend = blend * blend * (3.0 - 2.0 * blend);
  return mix(mix(hash(cell), hash(cell + vec2(1.0, 0.0)), blend.x),
             mix(hash(cell + vec2(0.0, 1.0)), hash(cell + vec2(1.0, 1.0)), blend.x), blend.y);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float drift = (noise(uv * 3.5 + vec2(u_time * 0.08, 0.0)) - 0.5) * 0.13;
  vec2 center = mix(vec2(0.56, 0.48), u_pointer, 0.2);
  vec2 delta = (uv - center + vec2(drift, drift * 0.3)) * vec2(u_resolution.x / u_resolution.y, 1.0);
  float halo = exp(-dot(delta, delta) * 4.5);
  float veil = exp(-abs(delta.y - 0.08 * sin(delta.x * 5.0 + u_time * 0.24)) * 9.0)
               * exp(-delta.x * delta.x * 5.0);
  float edgeFade = smoothstep(0.0, 0.2, uv.x) * smoothstep(0.0, 0.2, 1.0 - uv.x)
                 * smoothstep(0.0, 0.16, uv.y) * smoothstep(0.0, 0.16, 1.0 - uv.y);
  outColor = vec4(u_color, (halo * 0.18 + veil * 0.035) * edgeFade);
}`;

function renderer(canvas: HTMLCanvasElement): Renderer | null {
  const gl = canvas.getContext("webgl2", { alpha: true, antialias: false, powerPreference: "low-power" });
  if (!gl) return null;
  const compile = (type: number, source: string) => {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
    gl.deleteShader(shader);
    return null;
  };
  const vs = compile(gl.VERTEX_SHADER, vertex);
  const fs = compile(gl.FRAGMENT_SHADER, fragment);
  if (!vs || !fs) {
    if (vs) gl.deleteShader(vs);
    if (fs) gl.deleteShader(fs);
    return null;
  }
  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    return null;
  }
  const uniform = (name: string) => gl.getUniformLocation(program, name);
  const resolution = uniform("u_resolution");
  const pointerLocation = uniform("u_pointer");
  const colorLocation = uniform("u_color");
  const timeLocation = uniform("u_time");
  const draw: Renderer["draw"] = (time, pointer, color) => {
    const bounds = canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
    const width = Math.max(1, Math.round(bounds.width * ratio));
    const height = Math.max(1, Math.round(bounds.height * ratio));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
    }
    gl.useProgram(program);
    gl.uniform2f(resolution, width, height);
    gl.uniform2f(pointerLocation, pointer[0], pointer[1]);
    gl.uniform3f(colorLocation, ...color);
    gl.uniform1f(timeLocation, time);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };
  return { draw, dispose: () => gl.deleteProgram(program) };
}

function rgb(value: string, fallback: string): [number, number, number] {
  const hex = value.trim().match(/^#([a-f\d]{3}|[a-f\d]{6})$/i)?.[1]
    ?? fallback.replace("#", "");
  const full = hex.length === 3 ? [...hex].map(character => character + character).join("") : hex;
  return [0, 2, 4].map(index => parseInt(full.slice(index, index + 2), 16) / 255) as [number, number, number];
}

export function initWebGLMotion() {
  const ambient = new Map<HTMLElement, () => void>();
  let webglUnavailable = false;
  const visibility = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const canvas = entry.target.querySelector<HTMLCanvasElement>(".v2-webgl-ambient");
      if (canvas) canvas.dataset.visible = String(entry.isIntersecting);
    });
  }, { rootMargin: "150px" });

  function attach(host: HTMLElement) {
    if (ambient.has(host) || webglUnavailable) return;
    const canvas = document.createElement("canvas");
    canvas.className = "v2-webgl-ambient";
    canvas.setAttribute("aria-hidden", "true");
    host.prepend(canvas);
    const engine = renderer(canvas);
    if (!engine) { webglUnavailable = true; canvas.remove(); return; }
    let frame = 0;
    let last = 0;
    let pointer: [number, number] = [.56, .48];
    let color = rgb(getComputedStyle(host).getPropertyValue("--v2-glow"), "#d8ad78");
    const syncColor = () => { color = rgb(getComputedStyle(host).getPropertyValue("--v2-glow"), "#d8ad78"); };
    const move = (event: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      pointer = [(event.clientX - rect.left) / rect.width, 1 - (event.clientY - rect.top) / rect.height];
    };
    const tick = (time: number) => {
      frame = requestAnimationFrame(tick);
      if (document.hidden || canvas.dataset.visible !== "true" || document.documentElement.dataset.portoIntro === "loading" || time - last < 33) return;
      last = time;
      engine.draw(time * .001, pointer, color);
    };
    host.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("porto-v2-theme-change", syncColor);
    visibility.observe(host);
    frame = requestAnimationFrame(tick);
    ambient.set(host, () => {
      cancelAnimationFrame(frame);
      host.removeEventListener("pointermove", move);
      window.removeEventListener("porto-v2-theme-change", syncColor);
      visibility.unobserve(host);
      engine.dispose();
      canvas.remove();
    });
  }

  const attachAll = () => document.querySelectorAll<HTMLElement>(".v2-hero-stage, .v2-featured-art, .v2-work-hero-art, .v2-about-portrait").forEach(attach);
  attachAll();
  const changes = new MutationObserver(attachAll);
  changes.observe(document.querySelector(".porto-v2") ?? document.body, { childList: true, subtree: true });

  return () => {
    changes.disconnect();
    visibility.disconnect();
    ambient.forEach(dispose => dispose());
  };
}
