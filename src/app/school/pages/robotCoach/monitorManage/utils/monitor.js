import * as THREE from 'three';

export function randomPointInFace(face, geometry) {
  return randomPointInTriangle(geometry.vertices[face.a], geometry.vertices[face.b], geometry.vertices[face.c]);
}

var vector = new THREE.Vector3();

export function randomPointInTriangle(vectorA, vectorB, vectorC) {
  var point = new THREE.Vector3();

  var a = Math.random(); //THREE.Math.random16();
  var b = Math.random(); //THREE.Math.random16();

  if (a + b > 1) {
    a = 1 - a;
    b = 1 - b;
  }

  var c = 1 - a - b;

  point.copy(vectorA);
  point.multiplyScalar(a);

  vector.copy(vectorB);
  vector.multiplyScalar(b);

  point.add(vector);

  vector.copy(vectorC);
  vector.multiplyScalar(c);

  point.add(vector);

  return point;
}

export function randomPointsInGeometry(geometry, n) {
  //  - create array with cumulative sums of face areas
  //  - pick random number from 0 to total area
  //  - find corresponding place in area array by binary search
  //  - get random point in face
  var face,
    i,
    faces = geometry.faces,
    vertices = geometry.vertices,
    il = faces.length,
    totalArea = 0,
    cumulativeAreas = [];

  // precompute face areas
  for (i = 0; i < il; i++) {
    face = faces[i];

    face._area = triangleArea(vertices[face.a], vertices[face.b], vertices[face.c]);
    totalArea += face._area;

    cumulativeAreas[i] = totalArea;
  }

  // pick random face weighted by face area
  var r,
    index,
    result = [];

  for (i = 0; i < n; i++) {
    r = Math.random() * totalArea; //THREE.Math.random16()

    index = binarySearchIndices(r);
    result[i] = randomPointInFace(faces[index], geometry);
  }

  return result;

  // binary search cumulative areas array
  function binarySearchIndices(value) {
    return binarySearch(0, cumulativeAreas.length - 1);

    function binarySearch(start, end) {
      // return closest larger index if exact number is not found
      if (end < start) return start;

      var mid = start + Math.floor((end - start) / 2);

      if (cumulativeAreas[mid] > value) {
        return binarySearch(start, mid - 1);
      } else if (cumulativeAreas[mid] < value) {
        return binarySearch(mid + 1, end);
      } else {
        return mid;
      }
    }
  }
}

var vector1 = new THREE.Vector3();
var vector2 = new THREE.Vector3();

export function triangleArea(vectorA, vectorB, vectorC) {
  vector1.subVectors(vectorB, vectorA);
  vector2.subVectors(vectorC, vectorA);
  vector1.cross(vector2);

  return 0.5 * vector1.length();
}
