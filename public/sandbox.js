import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.173.0/build/three.module.js";

const $ = (id) => document.getElementById(id);
const STORE = "miiengine-sandbox-avatar-v1";
const WORLD_STORE = "miiengine-sandbox-world-v1";
const COMMON = ["#2d2828","#402010","#5c180a","#7c3a14","#787880","#4e3e10","#885818","#d0a04a","#000000","#6c7070","#663c2c","#605e30","#4654a8","#387058","#603810","#a81008","#203068","#a86000","#787068","#d85208","#f00c08","#f54848","#f09a74","#8c5040","#842626","#ff7366","#ffa6a6","#ffc0ba","#732e3b","#991f3d","#8a173e","#b53e42","#c71e56","#b05381","#c7546e","#fa7597","#fcacc9","#ffc9d8","#311c40","#37283d","#4c184d","#6f42b3","#855cb8","#c083cc","#a893c9","#c5ace6","#eebefa","#d2c5ed","#191f40","#123f66","#2a82d4","#57b4f2","#7ac5de","#89a6fa","#84bdfa","#a1e3ff","#0b2e36","#013d3b","#0d4f59","#236663","#307e8c","#4faeb0","#7ac49e","#7fd4c0","#87e5b6","#0a4a35","#437a00","#027562","#369970","#4bad1a","#92bf0a","#63c788","#9ee042","#96de7e","#bbf2aa","#99932b","#a69563","#ccc039","#ccb987","#d9cc82","#d5d96f","#d5e683","#d8fa9d","#7d4500","#e6bb7a","#fee24a","#fade82","#f7ea9c","#faf89b","#a64d1e","#ff960d","#d19b69","#ffb266","#ffc28c","#e5cfb1","#414141","#9b9b9b","#bebebe","#dcd7cd","#ffffff"];
const SKIN = ["#FFD3AD","#FEB66B","#DE7942","#FFAA8C","#AD5129","#632C18","#ffbea5","#ffc58f","#8c3c23","#3c2d23"];
const FAV = ["#d21e14","#ff6e19","#ffd820","#78d220","#007830","#0a48bc","#3caade","#f55a7d","#7328ad","#483818","#e0e0e0","#181814"];
let avatar = read(STORE,{name:"My Mii",skin:"#f5c69b",hair:"#33251f",shirt:"#477ee8",shoes:"#303747",hairType:0,eyeType:0,mouthType:0});
let placed = read(WORLD_STORE,[]);
const world = $("world");
const scene = new THREE.Scene();
scene.background = new THREE.Color("#9ccce7");
scene.fog = new THREE.Fog("#b9d9df",22,72);
const camera = new THREE.PerspectiveCamera(58,1,.1,150);
const renderer = new THREE.WebGLRenderer({antialias:true,alpha:false});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
world.appendChild(renderer.domElement);
const hemi = new THREE.HemisphereLight("#e9f7ff","#54794c",2.0);scene.add(hemi);
const sun = new THREE.DirectionalLight("#fff1d0",2.4);sun.position.set(-10,18,9);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-25;sun.shadow.camera.right=25;sun.shadow.camera.top=25;sun.shadow.camera.bottom=-25;scene.add(sun);
const mat=(color,roughness=.88)=>new THREE.MeshStandardMaterial({color,roughness});
const groundMat=mat("#7cbd77"),pathMat=mat("#d7c18f"),woodMat=mat("#9b6744"),leafMat=mat("#4b9b68"),darkLeaf=mat("#327c58");
const ground=new THREE.Mesh(new THREE.PlaneGeometry(120,120),groundMat);ground.rotation.x=-Math.PI/2;ground.position.y=-.12;ground.receiveShadow=true;scene.add(ground);
const island=new THREE.Mesh(new THREE.CylinderGeometry(19,20,1.2,64),mat("#6eaa78"));island.position.y=-.65;island.receiveShadow=true;scene.add(island);
const path=new THREE.Mesh(new THREE.RingGeometry(3.1,4.2,64),pathMat);path.rotation.x=-Math.PI/2;path.position.y=-.105;scene.add(path);
const plaza=new THREE.Mesh(new THREE.CircleGeometry(3.15,64),mat("#e8d8ad"));plaza.rotation.x=-Math.PI/2;plaza.position.y=-.10;scene.add(plaza);
const water=new THREE.Mesh(new THREE.CircleGeometry(35,96),mat("#4dadd0"));water.rotation.x=-Math.PI/2;water.position.y=-1.28;scene.add(water);
function box(parent,x,y,z,sx,sy,sz,material){const m=new THREE.Mesh(new THREE.BoxGeometry(sx,sy,sz),material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
function sphere(parent,x,y,z,sx,sy,sz,material){const m=new THREE.Mesh(new THREE.SphereGeometry(1,24,18),material);m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.castShadow=true;parent.add(m);return m}
function tree(x,z,scale=1){const g=new THREE.Group();g.position.set(x,0,z);g.scale.setScalar(scale);const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.17,.24,1.7,9),woodMat);trunk.position.y=.75;trunk.castShadow=true;g.add(trunk);sphere(g,0,2,0,.95,1.15,.95,leafMat);sphere(g,-.5,1.8,.1,.65,.72,.65,darkLeaf);sphere(g,.45,2.35,-.1,.65,.7,.65,leafMat);scene.add(g)}
for(const [x,z,s] of [[-8,-6,1.2],[8,-8,1.1],[-11,4,1],[10,5,1.25],[-5,11,.9],[5,12,1.05],[14,-1,.9],[-14,-2,.9]])tree(x,z,s);
function makeHouse(){const g=new THREE.Group();box(g,0,1.1,-10,5,2.2,4,mat("#fff0d7"));const roof=new THREE.Mesh(new THREE.ConeGeometry(3.7,2.2,4),mat("#dc8067"));roof.position.set(0,3.1,-10);roof.rotation.y=Math.PI/4;roof.castShadow=true;g.add(roof);box(g,0,.75,-7.94,.9,1.5,.12,woodMat);box(g,-1.45,1.45,-7.92,.8,.7,.1,mat("#8ac8d8"));box(g,1.45,1.45,-7.92,.8,.7,.1,mat("#8ac8d8"));scene.add(g)}
makeHouse();
function bench(x,z){const g=new THREE.Group();box(g,0,.62,0,1.9,.18,.58,woodMat).position.x=x;g.children[0].position.z=z;box(g,x,.95,z-.24,1.9,.65,.14,woodMat);for(const dx of [-.7,.7])box(g,x+dx,.3,z,.14,.62,.14,mat("#65503c"));scene.add(g)}
bench(-6,1);bench(6,2);
const collectibles=[];
for(let i=0;i<8;i++){const a=i*Math.PI/4;const c=new THREE.Mesh(new THREE.TorusGeometry(.28,.09,10,24),mat("#ffdb62"));c.position.set(Math.cos(a)*7,.8,Math.sin(a)*7);c.rotation.x=Math.PI/2;c.castShadow=true;scene.add(c);collectibles.push(c)}
const avatarRoot=new THREE.Group();scene.add(avatarRoot);
let avatarParts=[];
function clearAvatar(){for(const o of avatarParts){avatarRoot.remove(o);o.traverse?.(n=>{if(n.geometry)n.geometry.dispose();if(n.material&&!Array.isArray(n.material))n.material.dispose()})}avatarParts=[]}
function addPart(o){avatarRoot.add(o);avatarParts.push(o);return o}
function makeAvatar(){clearAvatar();const skin=mat(avatar.skin),hair=mat(avatar.hair),shirt=mat(avatar.shirt),shoes=mat(avatar.shoes),white=mat("#fffdf7"),black=mat("#25232a"),mouth=mat("#8b3941");
const torso=new THREE.Mesh(new THREE.CapsuleGeometry(.42,.55,5,12),shirt);torso.position.y=1.05;torso.castShadow=true;addPart(torso);
for(const side of [-1,1]){const leg=new THREE.Mesh(new THREE.CapsuleGeometry(.16,.47,4,10),mat("#394b70"));leg.position.set(side*.2,.37,0);leg.castShadow=true;addPart(leg);const shoe=new THREE.Mesh(new THREE.BoxGeometry(.34,.16,.48),shoes);shoe.position.set(side*.2,.12,.09);shoe.castShadow=true;addPart(shoe);
const arm=new THREE.Mesh(new THREE.CapsuleGeometry(.13,.47,4,10),shirt);arm.position.set(side*.52,1.15,0);arm.rotation.z=side*-.18;arm.castShadow=true;addPart(arm);const hand=new THREE.Mesh(new THREE.SphereGeometry(.14,14,10),skin);hand.position.set(side*.55,.82,0);addPart(hand)}
const head=sphere(avatarRoot,0,2.13,0,.61,.69,.55,skin);avatarParts.push(head);
sphere(avatarRoot,-.61,2.1,0,.13,.18,.12,skin);sphere(avatarRoot,.61,2.1,0,.13,.18,.12,skin);
const hairTop=sphere(avatarRoot,0,2.68,-.03,.65,.3,.58,hair);avatarParts.push(hairTop);
const hairBack=sphere(avatarRoot,0,2.35,-.38,.58,.48,.22,hair);avatarParts.push(hairBack);
const style=Number(avatar.hairType)||0;
if(style%3===1){for(let i=0;i<5;i++){const tuft=sphere(avatarRoot,-.42+i*.21,2.78,.02,.18,.25,.19,hair);avatarParts.push(tuft)}}else if(style%3===2){const fringe=sphere(avatarRoot,0,2.57,.46,.5,.16,.13,hair);avatarParts.push(fringe)}
for(const x of [-.22,.22]){const eye=sphere(avatarRoot,x,2.18,.493,.105,.13,.045,white);avatarParts.push(eye);const pupil=sphere(avatarRoot,x,2.18,.535,.05,.075,.025,black);avatarParts.push(pupil);const brow=box(avatarRoot,x,2.38,.49,.2,.045,.06,hair);avatarParts.push(brow)}
const nose=sphere(avatarRoot,0,2.02,.55,.075,.11,.07,skin);avatarParts.push(nose);
const smile=new THREE.Mesh(new THREE.TorusGeometry(.105,.025,7,18,Math.PI),mouth);smile.position.set(0,1.91,.54);smile.rotation.z=Math.PI;avatarRoot.add(smile);avatarParts.push(smile);
avatarRoot.position.set(0,0,0);
}
function read(key,fallback){try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}}
function save(){localStorage.setItem(STORE,JSON.stringify(avatar))}
function setFields(){ $("avatar-name").value=avatar.name||"My Mii";$("skin-color").value=avatar.skin;$("hair-color").value=avatar.hair;$("shirt-color").value=avatar.shirt;$("shoe-color").value=avatar.shoes;$("avatar-preview").innerHTML="<span>🙂</span><b>"+escapeHtml(avatar.name||"My Mii")+"</b>"}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function applyAvatar(){avatar={...avatar,name:$("avatar-name").value.trim().slice(0,24)||"My Mii",skin:$("skin-color").value,hair:$("hair-color").value,shirt:$("shirt-color").value,shoes:$("shoe-color").value};save();makeAvatar();setFields();$("tip").textContent=avatar.name+" is ready to explore!"}
function colorAt(list,index,fallback){return list[Number(index)]||fallback}
function acceptMii(mii){if(!mii||typeof mii!=="object")return;avatar={...avatar,name:mii.nickname||"My Mii",skin:colorAt(SKIN,mii.facelineColor,"#f5c69b"),hair:colorAt(COMMON,mii.hairColor,"#33251f"),shirt:colorAt(FAV,mii.favoriteColor,"#477ee8"),shoes:"#303747",hairType:mii.hairType||0,eyeType:mii.eyeType||0,mouthType:mii.mouthType||0};save();setFields();makeAvatar();$("tip").textContent="Loaded "+avatar.name+" from your Mii library."}
$("choose-mii").addEventListener("click",()=>{const popup=window.open("/app?select","miiengine-mii-picker","popup,width=1180,height=820");if(!popup){$("tip").textContent="Allow pop-ups to choose a Mii from your library.";return}$("tip").textContent="Choose a Mii in the creator window. It will return here automatically."});
window.addEventListener("message",e=>{if(e.origin!==location.origin)return;if(e.data?.type==="miic-select")acceptMii(e.data.data)});
$("apply-avatar").addEventListener("click",applyAvatar);setFields();makeAvatar();

const keys=new Set();let yaw=0,dragging=false,lastX=0,lastY=0,pitch=.28,velocityY=0,onGround=true,mode="walk",coins=0;
const player={x:0,z:4,speed:5.2};const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();const groundPlane=new THREE.Plane(new THREE.Vector3(0,1,0),0);
function resize(){const r=world.getBoundingClientRect();camera.aspect=r.width/r.height;camera.updateProjectionMatrix();renderer.setSize(r.width,r.height,false)}
new ResizeObserver(resize).observe(world);resize();
window.addEventListener("keydown",e=>{if([" ","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.key))e.preventDefault();keys.add(e.key.toLowerCase());if(e.key.toLowerCase()==="e")interact()});
window.addEventListener("keyup",e=>keys.delete(e.key.toLowerCase()));
renderer.domElement.addEventListener("pointerdown",e=>{dragging=true;lastX=e.clientX;lastY=e.clientY;renderer.domElement.setPointerCapture(e.pointerId)});
renderer.domElement.addEventListener("pointerup",()=>dragging=false);
renderer.domElement.addEventListener("pointermove",e=>{if(!dragging)return;const dx=e.clientX-lastX,dy=e.clientY-lastY;lastX=e.clientX;lastY=e.clientY;yaw-=dx*.006;pitch=THREE.MathUtils.clamp(pitch+dy*.003,-.1,.85)});
renderer.domElement.addEventListener("click",e=>{if(mode==="walk")return;const rect=renderer.domElement.getBoundingClientRect();pointer.x=(e.clientX-rect.left)/rect.width*2-1;pointer.y=-(e.clientY-rect.top)/rect.height*2+1;raycaster.setFromCamera(pointer,camera);const point=new THREE.Vector3();if(raycaster.ray.intersectPlane(groundPlane,point)&&Math.hypot(point.x,point.z)<17)placeObject(point.x,point.z)});
function placeObject(x,z){const type=$("object-type").value;let o;if(type==="tree"){tree(x,z,.65);$("tip").textContent="A new tree has been planted."}else if(type==="lamp"){o=new THREE.Group();const pole=new THREE.Mesh(new THREE.CylinderGeometry(.07,.09,1.7,8),mat("#48566a"));pole.position.y=.85;o.add(pole);const bulb=new THREE.Mesh(new THREE.SphereGeometry(.23,16,12),mat("#ffe7a0"));bulb.position.y=1.8;o.add(bulb);o.position.set(x,0,z);scene.add(o);$("tip").textContent="Lamp placed."}else if(type==="bench"){bench(x,z);$("tip").textContent="Bench placed."}else if(type==="flower"){for(let i=0;i<9;i++){const a=i*2.4;const fl=sphere(scene,x+Math.cos(a)*.35,.25,z+Math.sin(a)*.35,.13,.13,.13,mat(["#ff9cb8","#ffdf7c","#c6a8ff"][i%3]));} $("tip").textContent="A flower patch is blooming."}else{o=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),mat("#"+Math.floor(Math.random()*0xffffff).toString(16).padStart(6,"0")));o.position.set(x,.5,z);o.castShadow=true;scene.add(o);$("tip").textContent="Block placed. Keep building!"}placed.push({x,z,type});localStorage.setItem(WORLD_STORE,JSON.stringify(placed))}
function interact(){let nearest=null,d=2.8;for(const c of collectibles){if(!c.visible)continue;const n=c.position.distanceTo(avatarRoot.position);if(n<d){nearest=c;d=n}}if(nearest){nearest.visible=false;coins++;$("coin-count").textContent="✦ "+coins;$("tip").textContent="You found a star token!";return}const dist=Math.hypot(player.x,player.z+10);$("tip").textContent=dist<5?"Welcome to the little island house!":"Nothing nearby to interact with — explore the island."}
$("reset-position").addEventListener("click",()=>{player.x=0;player.z=4;yaw=0;avatarRoot.position.set(0,0,4)});
document.querySelectorAll("[data-tool]").forEach(b=>b.addEventListener("click",()=>{mode=b.dataset.tool;document.querySelectorAll("[data-tool]").forEach(x=>x.classList.toggle("active",x===b));$("object-field").style.display=mode==="walk"?"none":"flex";$("tip").textContent=mode==="build"?"Choose an object, then click the ground to place it.":mode==="paint"?"Paint mode is ready — choose a block and place it.":"Explore the island with WASD or the arrow keys."}));
$("object-field").style.display="none";
document.querySelectorAll("[data-move]").forEach(b=>{const key={forward:"w",back:"s",left:"a",right:"d",jump:" "}[b.dataset.move];b.addEventListener("pointerdown",e=>{e.preventDefault();keys.add(key)});["pointerup","pointerleave","pointercancel"].forEach(ev=>b.addEventListener(ev,()=>keys.delete(key)))});
$("save-world").addEventListener("click",()=>{$("tip").textContent="Your character and placed objects are saved in this browser."});
function loadPlaced(){for(const p of placed){if(p.type==="tree")tree(p.x,p.z,.65);else if(p.type==="bench")bench(p.x,p.z);else if(p.type==="block"){const o=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),mat("#a99cff"));o.position.set(p.x,.5,p.z);scene.add(o)}}}
loadPlaced();
function animate(){requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.04);const forward=(keys.has("w")||keys.has("arrowup")?1:0)-(keys.has("s")||keys.has("arrowdown")?1:0);const side=(keys.has("d")||keys.has("arrowright")?1:0)-(keys.has("a")||keys.has("arrowleft")?1:0);const dir=new THREE.Vector3(side,0,-forward);if(dir.lengthSq()>0){dir.normalize().applyAxisAngle(new THREE.Vector3(0,1,0),yaw);player.x+=dir.x*player.speed*dt;player.z+=dir.z*player.speed*dt;avatarRoot.rotation.y=Math.atan2(dir.x,dir.z);avatarRoot.position.x=player.x;avatarRoot.position.z=player.z}
if((keys.has(" ")||keys.has("space"))&&onGround){velocityY=7;onGround=false}velocityY-=18*dt;avatarRoot.position.y+=velocityY*dt;if(avatarRoot.position.y<0){avatarRoot.position.y=0;velocityY=0;onGround=true}
const behind=new THREE.Vector3(Math.sin(yaw)*8,3.8+pitch*2,Math.cos(yaw)*8);const target=new THREE.Vector3(player.x,1.1,player.z);const desired=target.clone().add(behind);camera.position.lerp(desired,1-Math.pow(.001,dt));camera.lookAt(target);
for(const c of collectibles){if(c.visible)c.rotation.z+=dt*1.6}
renderer.render(scene,camera)}
const clock=new THREE.Clock();animate();
setTimeout(()=>{$("loading").style.display="none"},650);
window.addEventListener("beforeunload",()=>{renderer.dispose()});
