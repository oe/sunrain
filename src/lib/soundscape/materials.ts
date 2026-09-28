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
attribute float life,phase;
varying float strength,curve;
uniform vec2 cropScale,cropOffset;
varying vec2 uv;
varying vec4 bead;
void main(){
 bead=drop;strength=life;curve=phase;
 vec2 local=position.xy*.5+.5;
 uv=drop.xy+vec2((local.x-.5)*drop.z*4.8/1.7778,mix(-drop.w-drop.z*1.5,drop.z*1.6,local.y));
 vec2 screen=(uv-cropOffset)/cropScale;
 gl_Position=vec4(screen.x*2.-1.,1.-screen.y*2.,0.,1.);
}
`;
export const dropFragment = `
precision highp float;
uniform sampler2D plate;
varying vec2 uv;varying vec4 bead;varying float strength,curve;
void main(){
 // Mask only the glass; never move furniture or the window frame.
 float bottom=uv.x<.30?.60:.66;
 float pane=smoothstep(.065,.075,uv.x)*(1.-smoothstep(.552,.560,uv.x))
   *smoothstep(.083+uv.x*.15,.095+uv.x*.15,uv.y)
   *(1.-smoothstep(bottom-.018,bottom,uv.y));
 vec2 d=uv-bead.xy;
 vec2 q=d/vec2(bead.z/1.7778,bead.z*1.35);
 q.x*=1.+.16*clamp(-q.y,0.,1.);
 float r=length(q);
 float body=1.-smoothstep(.82,1.,r);
 float taper=clamp(1.+d.y/max(bead.w,.001),0.,1.);
 // Follow the same slight sideways path as the bead, rather than a straight stripe.
 float path=-.08/45.*(cos(uv.y*45.+curve)-cos(bead.y*45.+curve));
 float side=(d.x-path)/(bead.z/1.7778*mix(.14,.30,taper));
 float trail=(1.-smoothstep(.55,1.,abs(side)))*step(d.y,-bead.z)*taper;
 float alpha=strength*pane*max(body,trail*.7);
 if(alpha<.005)discard;
 vec2 lens=q*bead.z*3.8*body;
 lens.x+=side*bead.z*1.6*trail;
 vec3 color=texture2D(plate,clamp(uv+lens,vec2(0.),vec2(1.))).rgb;
 float rim=smoothstep(.65,.94,r)*(1.-smoothstep(.94,1.,r))*body;
 color*=1.-rim*.12-trail*.04;
 float shine=pow(max(0.,1.-length(q-vec2(-.35,-.45))*2.),5.);
 color+=vec3(.32,.36,.38)*shine+vec3(.035,.04,.045)*trail*max(0.,-side);
 gl_FragColor=vec4(color,alpha*.94);
}
`;
