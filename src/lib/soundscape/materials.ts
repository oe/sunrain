/** Source-plate UV coordinates are top-left based; pixel data is not flipped. */
export const vertexSource = `
precision highp float;
attribute vec3 position;
varying vec2 screen;
void main(){screen=position.xy*.5+.5;gl_Position=vec4(position.xy,0.,1.);}
`;
export const fragmentSource = `
precision highp float;
varying vec2 screen;
uniform sampler2D plate;
uniform vec2 cropScale,cropOffset;
uniform float time,scene;
void main(){
 vec2 uv=vec2(screen.x,1.-screen.y)*cropScale+cropOffset;
 vec3 color=scene<.5?mix(vec3(.045,.085,.105),vec3(.125,.155,.19),screen.y):texture2D(plate,uv).rgb;
 gl_FragColor=vec4(color,1.);
}
`;
export const dropVertex = `
precision highp float;
attribute vec3 position;
attribute vec4 drop;
attribute float life;
varying float strength;
uniform vec2 cropScale,cropOffset;
varying vec2 uv;
varying vec4 bead;
void main(){
 bead=drop;strength=life;
 vec2 local=position.xy*.5+.5;
 uv=drop.xy+vec2((local.x-.5)*drop.z*3.1/1.7778,mix(-drop.w-drop.z*1.5,drop.z*1.6,local.y));
 vec2 screen=(uv-cropOffset)/cropScale;
 gl_Position=vec4(screen.x*2.-1.,1.-screen.y*2.,0.,1.);
}
`;
export const dropFragment = `
precision highp float;
uniform sampler2D plate;
varying vec2 uv;varying vec4 bead;varying float strength;
void main(){
 vec2 d=uv-bead.xy;
 vec2 q=d/vec2(bead.z/1.7778,bead.z*1.35);
 float r=length(q);
 float body=1.-smoothstep(.8,1.,r);
 float taper=clamp(1.+d.y/max(bead.w,.001),0.,1.);
 float trail=(1.-smoothstep(.08,.20,abs(q.x)))*step(d.y,-bead.z)*taper*.35;
 float alpha=strength*max(body,trail)*(1.-smoothstep(.52,.56,bead.y));
 if(alpha<.005)discard;
 vec2 lens=q*bead.z*2.5*body;
 vec3 color=texture2D(plate,clamp(uv+lens,vec2(0.),vec2(1.))).rgb;
 float rim=smoothstep(.65,.94,r)*(1.-smoothstep(.94,1.,r));
 color*=1.-rim*.2;
 float shine=pow(max(0.,1.-length(q-vec2(-.35,-.45))*2.),5.);
 color+=vec3(.28,.32,.34)*shine;
 gl_FragColor=vec4(color,alpha*.88);
}
`;
