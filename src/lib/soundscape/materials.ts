/** Fixed-camera material coordinates, in the 1672 × 941 source plates. */
export const vertexSource = `
attribute vec2 position;
varying vec2 screen;
void main() { screen = position * .5 + .5; gl_Position = vec4(position, 0., 1.); }
`;

export const fragmentSource = `
precision highp float;
varying vec2 screen;
uniform sampler2D plate;
uniform sampler2D regions;
uniform vec2 cropScale;
uniform vec2 cropOffset;
uniform float time;
uniform float scene;
uniform float rain;
uniform float motion;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),
    mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
}
float turbulence(vec2 p) {
  return .57*noise(p)+.28*noise(p*2.03+7.)+.15*noise(p*4.01+19.);
}
vec3 photo(vec2 p) { return texture2D(plate, clamp(p,vec2(.001),vec2(.999))).rgb; }
float band(float x,float a,float b,float edge) {
  return smoothstep(a,a+edge,x)*(1.-smoothstep(b-edge,b,x));
}

// A droplet is a moving refractive lens, followed by a narrow wet trail.
// Independent columns give each drop its own gravity, pause and meandering path.
vec3 glass(vec2 uv, vec3 color) {
  float top=mix(.073,.145,clamp((uv.x-.059)/.506,0.,1.));
  float bottom=mix(.65,.66,clamp((uv.x-.059)/.506,0.,1.));
  float pane=band(uv.x,.061,.563,.004)*band(uv.y,top,bottom,.008);
  // The sofa and blanket sit in front of the glass.
  pane *= (1.-smoothstep(.575,.61,uv.y)) + (1.-(1.-smoothstep(.575,.61,uv.y)))*smoothstep(.29,.32,uv.x);
  if(pane < .001) return color;
  vec2 lens=vec2(0.); float edge=0.; float highlight=0.;
  for(int layer=0;layer<2;layer++) {
    float count=layer==0?37.:61.;
    float column=floor(uv.x*count);
    float seed=hash(vec2(column,float(layer)+8.));
    float speed=mix(.045,.18,seed)*(layer==0?1.:.65);
    float cycle=time*speed+.009*sin(time*1.4+seed*19.)+seed*7.;
    float cell=floor(uv.y/.23-cycle);
    float id=hash(vec2(column+29.*float(layer),cell));
    float local=fract(uv.y/.23-cycle);
    float center=.5+.23*sin(cell*3.1+seed*9.)+.055*sin(uv.y*55.+seed*31.);
    vec2 d=vec2((fract(uv.x*count)-center)/count,(local-.5)*.23);
    float size=mix(.0016,.0033,id)*(layer==0?1.:.7);
    vec2 q=d/vec2(size,size*2.1);
    float r=length(q);
    float body=1.-smoothstep(.72,1.12,r);
    // Upper trail tapers and beads; it is not a painted white streak.
    float trail=(1.-smoothstep(size*.14,size*.6,abs(d.x)))
      *band(-d.y,size*1.4,.054,.009)*.25;
    lens += q*body*vec2(.004,.006)+vec2(sin(d.x*1600.)*.001,0.)*trail;
    edge += (smoothstep(.62,.9,r)-smoothstep(.9,1.14,r))*.16;
    highlight += body*pow(max(0.,dot(normalize(q+vec2(.001)),normalize(vec2(-.5,-1.)))),8.)*.12;
  }
  vec3 refracted=photo(uv+lens);
  return mix(color,refracted*(1.-edge)+highlight,pane);
}

vec3 fire(vec2 uv, vec3 color) {
  // Flame tips move substantially; brickwork, hearth and foreground logs stay fixed.
  float area=band(uv.x,.843,.927,.006)*band(uv.y,.57,.747,.009);
  if(area < .001) return color;
  float height=clamp((.717-uv.y)/.125,0.,1.);
  vec2 p=vec2(uv.x*110.,uv.y*65.+time*2.1);
  float n=turbulence(p);
  float curl=noise(p*1.6+vec2(time*.25,0.));
  vec2 displacement=vec2((n-.5)*.013*height,
    (curl-.5)*.016*height+sin(time*2.7+uv.x*65.)*.003*height);
  // Preserve dark silhouettes of the two logs across the lower flames.
  float log=band(uv.x,.866,.921,.003)*band(uv.y,.681,.712,.004);
  log=max(log,band(uv.x,.83,.893,.004)*band(uv.y,.711,.739,.005));
  vec3 moving=photo(uv+displacement);
  float heat=smoothstep(.22,.7,max(moving.r,max(moving.g,moving.b)));
  moving *= 1.+(n-.5)*.16*heat;
  float flame=max(smoothstep(.68,.95,color.r)*smoothstep(.32,.65,color.g),
    smoothstep(.68,.95,moving.r)*smoothstep(.32,.65,moving.g));
  return mix(color,moving,area*(1.-log)*flame);
}

vec3 stream(vec2 uv,vec3 color) {
  float mask=texture2D(regions,uv).r;
  if(mask<.001) return color;
  float depth=smoothstep(.59,1.,uv.y);
  // Downstream points toward the foreground/left; distant water moves less in pixels.
  vec2 flow=vec2(-.009-depth*.021,.006+depth*.020);
  float a=fract(time*.48), b=fract(time*.48+.5);
  float blend=abs(a-.5)*2.;
  vec2 ripple=vec2(noise(vec2(uv.x*160.,uv.y*230.-time*1.7))-.5,
    noise(vec2(uv.x*210.+time*.6,uv.y*130.-time*2.2))-.5)*vec2(.001,.0025)*depth;
  vec2 pa=uv-flow*a+ripple, pb=uv-flow*b+ripple;
  // Never pull rock or bank pixels into the flow at a mask boundary.
  float safeA=texture2D(regions,pa).r, safeB=texture2D(regions,pb).r;
  vec3 ca=mix(color,photo(pa),safeA), cb=mix(color,photo(pb),safeB);
  vec3 moving=mix(ca,cb,blend);
  return mix(color,moving,mask);
}
vec3 sea(vec2 uv,vec3 color) {
  float mask=band(uv.y,.448,.83,.035);
  float depth=smoothstep(.448,.82,uv.y);
  float ripple=sin(uv.y*170.-time*1.3+noise(uv*40.)*3.);
  vec2 delta=vec2(sin(uv.y*110.+time*.7)*.0015,ripple*.003)*depth;
  return mix(color,photo(uv+delta),mask);
}
void main() {
  vec2 uv=vec2(screen.x,1.-screen.y)*cropScale+cropOffset;
  vec3 color;
  if(scene<.5) { color=mix(vec3(.045,.085,.105),vec3(.125,.155,.19),screen.y); }
  else {
    color=photo(uv);
    if(motion>.5) {
      if(scene>1.5 && scene<2.5) color=fire(uv,color);
      if(scene>2.5 && scene<3.5) color=stream(uv,color);
      if(scene>3.5) color=sea(uv,color);
      if(rain>.5 && scene<2.5) color=glass(uv,color);
    }
  }
  gl_FragColor=vec4(color,1.);
}
`;

/** Hand-traced water surfaces; rock silhouettes are deliberately excluded. */
export function streamMask() {
  const canvas = document.createElement('canvas');
  canvas.width = 1672;
  canvas.height = 941;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, 1672, 941);
  const polygon = (points: number[][], color: string) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    points.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.closePath();
    ctx.fill();
  };
  polygon(
    [
      [1042, 575],
      [1115, 584],
      [1068, 621],
      [1052, 666],
      [1070, 705],
      [1157, 745],
      [1376, 806],
      [1360, 855],
      [1273, 910],
      [1330, 941],
      [132, 941],
      [216, 901],
      [302, 865],
      [59, 824],
      [5, 803],
      [210, 778],
      [438, 765],
      [492, 727],
      [554, 710],
      [672, 689],
      [701, 667],
      [805, 650],
      [849, 626],
      [961, 606]
    ],
    '#fff'
  );
  const rocks = [
    [
      [901, 649],
      [931, 624],
      [971, 618],
      [1006, 636],
      [1028, 675],
      [911, 676]
    ],
    [
      [794, 650],
      [854, 634],
      [892, 640],
      [874, 658]
    ],
    [
      [573, 717],
      [592, 670],
      [646, 676],
      [696, 697],
      [750, 708],
      [806, 748],
      [791, 773],
      [630, 769],
      [579, 749]
    ],
    [
      [820, 746],
      [850, 725],
      [893, 716],
      [928, 729],
      [957, 723],
      [980, 741],
      [962, 758],
      [920, 770],
      [848, 766]
    ],
    [
      [994, 766],
      [1021, 724],
      [1080, 713],
      [1153, 735],
      [1225, 771],
      [1226, 822],
      [1080, 819],
      [1014, 799]
    ],
    [
      [864, 809],
      [879, 792],
      [935, 783],
      [983, 813],
      [952, 833],
      [875, 829]
    ],
    [
      [1120, 838],
      [1143, 818],
      [1201, 819],
      [1280, 838],
      [1275, 864],
      [1166, 860]
    ],
    [
      [1257, 770],
      [1282, 744],
      [1320, 751],
      [1400, 787],
      [1382, 823],
      [1274, 817]
    ],
    [
      [468, 941],
      [507, 898],
      [599, 868],
      [700, 857],
      [775, 863],
      [838, 854],
      [916, 878],
      [951, 918],
      [946, 941]
    ],
    [
      [1019, 941],
      [1090, 887],
      [1163, 864],
      [1222, 882],
      [1266, 941]
    ],
    [
      [211, 941],
      [244, 915],
      [313, 899],
      [367, 916],
      [373, 941]
    ],
    [
      [455, 761],
      [482, 741],
      [523, 747],
      [534, 761]
    ],
    [
      [525, 777],
      [545, 767],
      [568, 773],
      [590, 777]
    ]
  ];
  rocks.forEach((points) => polygon(points, '#000'));
  // Feather into the water side, preserving silhouettes instead of melting rocks.
  ctx.filter = 'blur(2px)';
  ctx.globalCompositeOperation = 'source-in';
  ctx.drawImage(canvas, 0, 0);
  return canvas;
}
