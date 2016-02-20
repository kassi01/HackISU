// shuffles the contents of an array using 
// https://en.wikipedia.org/wiki/Fisher-Yates_shuffle
function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
}


var colors = [0xff0000, 0x00ff00, 0x0000ff];
var baseBoneRotation = (new THREE.Quaternion).setFromEuler(
  new THREE.Euler(Math.PI / 2, 0, 0)
);

Leap.loop({background: true}, {
  hand: function (hand) {
  hand.fingers.forEach(function (finger) {
    // position the cylinders of the hand every frame
    finger.data('boneMeshes').forEach(function(mesh, i) {
      var bone = finger.bones[i];
      mesh.position.fromArray(bone.center());
      mesh.setRotationFromMatrix(
        (new THREE.Matrix4).fromArray( bone.matrix() )
      );
    mesh.quaternion.multiply(baseBoneRotation);
    });

  finger.data('jointMeshes').forEach(function(mesh, i) {
    var bone = finger.bones[i];
    if (bone) {
      mesh.position.fromArray(bone.prevJoint);
    } else {
      // special case for the finger tip joint sphere:
      bone = finger.bones[i-1];
      mesh.position.fromArray(bone.nextJoint);
    }
  });
  
  });

  // the arm
  var armMesh = hand.data('armMesh');
  armMesh.position.fromArray(hand.arm.center());
  armMesh.setRotationFromMatrix(
    (new THREE.Matrix4).fromArray( hand.arm.matrix() )
  );
  armMesh.quaternion.multiply(baseBoneRotation);
  armMesh.scale.x = hand.arm.width / 2;
  armMesh.scale.z = hand.arm.width / 4;

  //
  renderer.render(scene, camera);
  }})

  // these two LeapJS plugins, handHold and handEntry are available from leapjs-plugins, included above.
  // handHold provides hand.data
  //  handEntry provides handFound/handLost events.
 
  .use('handHold')
  .use('handEntry')
  .on('handFound', function(hand) {
    hand.fingers.forEach(function (finger) {
      var boneMeshes = [];
      var jointMeshes = [];
      finger.bones.forEach(function(bone) {
      // create joints
      var boneMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(5, 5, bone.length),
        new THREE.MeshPhongMaterial()
      );

      boneMesh.material.color.setHex(0xffffff);
      scene.add(boneMesh);
      boneMeshes.push(boneMesh);
    });

    for (var i = 0; i < finger.bones.length + 1; i++) {
      var jointMesh = new THREE.Mesh(
        new THREE.SphereGeometry(8),
        new THREE.MeshPhongMaterial()
      );

      jointMesh.material.color.setHex(0x0088ce);
      scene.add(jointMesh);
      jointMeshes.push(jointMesh);
    }

    finger.data('boneMeshes', boneMeshes);
    finger.data('jointMeshes', jointMeshes);
  });

  if (hand.arm) {
    var armMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(1, 1, hand.arm.length, 64),
      new THREE.MeshPhongMaterial()
    );
    armMesh.material.color.setHex(0xffffff);
    scene.add(armMesh);
    hand.data('armMesh', armMesh);
  }
  
  }).on('handLost', function(hand) {
    hand.fingers.forEach(function (finger) {
      var boneMeshes = finger.data('boneMeshes');
      var jointMeshes = finger.data('jointMeshes');

      boneMeshes.forEach(function(mesh) {
        scene.remove(mesh);
      });

      jointMeshes.forEach(function(mesh) {
        scene.remove(mesh);
      });

      finger.data({
        boneMeshes: null,
        boneMeshes: null
      });
    });

    var armMesh = hand.data('armMesh');
    scene.remove(armMesh);
    hand.data('armMesh', null);

    renderer.render(scene, camera);
  })
  .connect();

  var initScene = function () {
    window.scene = new THREE.Scene();
    window.renderer = new THREE.WebGLRenderer({
      alpha: true
    });

    window.renderer.setClearColor(0x000000, 0);
    window.renderer.setSize(window.innerWidth, window.innerHeight);
    window.renderer.domElement.style.position = 'fixed';
    window.renderer.domElement.style.top = 0;
    window.renderer.domElement.style.left = 0;
    window.renderer.domElement.style.width = '100%';
    window.renderer.domElement.style.height = '100%';

    document.body.appendChild(window.renderer.domElement);

    var directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
    directionalLight.position.set( 0, 0.5, 1 );
    window.scene.add(directionalLight);

    window.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
    window.camera.position.fromArray([0, 400, 500]);
    window.camera.lookAt(new THREE.Vector3(0, 160, 0));

    window.addEventListener('resize', function () {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.render(scene, camera);
    }, false);

    scene.add(camera);

    var letterObject = function(letter) {
      this.letter = letter,
      this.geometry = new THREE.CubeGeometry(60,60,60),
      this.material = new THREE.MeshPhongMaterial({ map: THREE.ImageUtils.loadTexture('images/' + letter.toUpperCase() + '.gif') });
      this.cube = new THREE.Mesh(this.geometry,this.material)
    };

    var words = ['walk', 'talk', 'author', 'autumn', 'august', 'daughter', 'caught', 'brought', 'thought', 'cough', 'laugh', 'enough'];
    var paddedWordLength = 10; // the number of letters to always offer for spelling a word
    shuffle(words);
    var numWords = words.length; // the number of assigned words to learn
    var lettersInWord = []; // the word to have the user spell, as an array of chars
    var possible = 'abcdefghijklmnopqrstuvwxyz'; // possible letters in a word
    for (var i = 0; i < numWords; i++) {
      var wordLen = words[i].length; // words[i] is the current word to spell correctly
      for (var j = 0; j < wordLen; j++) {
        lettersInWord.push(words[i].charAt(j);
      }
      var lengthDiff = (paddedWordLength - wordLen); // number of letters to add to reach paddedWordLength
      for (var k = 0; k < lengthDiff; k++) {
        // add random letters to the letters available to choose
        var tempChar = possible.charAt(Math.floor(Math.random() * possible.length));
        lettersInWord.push(tempChar);
      }
      // and give the letters one last shuffle so they're random
      shuffle(lettersInWord);
      // lettersInWord is now an array of the characters in the word to spell, arranged randomly
      // TODO each character in letterInWord needs to be a cube with that letter on it
    }
    
    cubeA.position.set(150,150,150);
    cubeA.castShadow = true;
    cubeA.receiveShadow = false;
    scene.add(cubeA);

    cubeB.position.set(75,75,75);
    cubeB.castShadow = true;
    cubeB.receiveShadow = false;
    scene.add(cubeB);

    cubeC.position.set(0,0,0);
    cubeC.castShadow = true;
    cubeC.receiveShadow = false;
    scene.add(cubeC);

    renderer.render(scene, camera);
    };

    initScene();
