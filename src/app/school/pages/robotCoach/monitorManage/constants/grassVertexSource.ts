export const bladeHeight = 1;

//************** Grass **************
export const grassVertexSource =
  `
                precision mediump float;
                attribute vec3 position;
                attribute vec3 normal;
                attribute vec3 offset;
                attribute vec2 uv;
                attribute vec2 halfRootAngle;
                attribute float scale;
                attribute float index;
                uniform float time;
                uniform float delta;
                uniform float posX;
                uniform float posZ;
                uniform float radius;
                uniform float width;
                uniform mat4 modelViewMatrix;
                uniform mat4 projectionMatrix;
                varying vec2 vUv;
                varying vec3 vNormal;
                varying vec3 vPosition;
                varying float frc;
                varying float idx;
                //https://www.geeks3d.com/20141201/how-to-rotate-a-vertex-by-a-quaternion-in-glsl/
                vec3 rotateVectorByQuaternion(vec3 v, vec4 q){
                  return 2.0 * cross(q.xyz, v * q.w + cross(q.xyz, v)) + v;
                }
                float placeOnSphere(vec3 v){
                  float theta = acos(v.z/radius);
                  float phi = acos(v.x/(radius * sin(theta)));
                  float sV = radius * sin(theta) * sin(phi);
                  //If undefined, set to default value
                  if(sV != sV){
                    sV = v.y;
                  }
                  return sV;
                }
                void main() {
                	//Vertex height in blade geometry
                	frc = position.y / float(` +
  bladeHeight +
  `);
                	//Scale vertices
                    vec3 vPosition = position;
                	vPosition.y *= scale;
                	//Invert scaling for normals
                	vNormal = normal;
                	vNormal.y /= scale;
                	//Rotate blade around Y axis
                    vec4 direction = vec4(0.0, halfRootAngle.x, 0.0, halfRootAngle.y);
                	vPosition = rotateVectorByQuaternion(vPosition, direction);
                	vNormal = rotateVectorByQuaternion(vNormal, direction);
                    //UV for texture
                    vUv = uv;
                	vec3 pos;
                	vec3 globalPos;
                	vec3 tile;
                	globalPos.x = offset.x-posX*delta;
                	globalPos.z = offset.z-posZ*delta;
                	tile.x = floor((globalPos.x + 0.5 * width) / width);
                	tile.z = floor((globalPos.z + 0.5 * width) / width);
                	pos.x = globalPos.x - tile.x * width;
                	pos.z = globalPos.z - tile.z * width;
                	pos.y = max(0.0, placeOnSphere(pos)) - radius;
                	//pos.y += 10.0*getYPosition(pos.xz);
                	//Wind is sine waves in time
                	float noise = sin(0.1 * pos.x + time);
                	float halfAngle = noise * 0.1;
                	noise = 0.5 + 0.5 * cos(0.05 * pos.x + 0.25 * time);
                	halfAngle -= noise * 0.2;
                	direction = normalize(vec4(sin(halfAngle), 0.0, -sin(halfAngle), cos(halfAngle)));
                	//Rotate blade and normals according to the wind
                    vPosition = rotateVectorByQuaternion(vPosition, direction);
                	vNormal = rotateVectorByQuaternion(vNormal, direction);
                	//Move vertex to global location
                	vPosition += pos;
                	//Index of instance for varying colour in fragment shader
                	idx = index;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(vPosition, 1.0);
                }`;
