/**
 * Load hero model with race support
 * @param {BABYLON.Scene} scene - The Babylon scene
 * @param {BABYLON.TransformNode} character - The character transform node
 * @param {Object} options - Loading options
 * @param {string} options.raceId - Race ID (human, elf, dwarf, orc, barbarian, skeleton)
 * @param {boolean} options.isWorges - Whether to load Worges variant
 * @param {Object} options.raceManager - RaceManager instance (optional)
 */
export async function loadHeroModel(scene, character, options = {}) {
	const raceId = options.raceId || 'human';
	const isWorges = options.isWorges || false;
	const raceManager = options.raceManager;

	let modelPath, fileName, scale, positionY;

	// If RaceManager is provided, use it to get race data
	if (raceManager) {
		const race = raceManager.getRace(raceId);
		if (race) {
			const fullPath = isWorges ? race.worgesModelPath : race.modelPath;
			modelPath = fullPath.substring(0, fullPath.lastIndexOf('/') + 1);
			fileName = fullPath.substring(fullPath.lastIndexOf('/') + 1);
			scale = race.scale || 3.7;
			positionY = race.positionOffset?.y || -11;
			console.log(`🎭 Loading ${race.name} model (${isWorges ? 'Worges' : 'Normal'})`);
		} else {
			console.warn(`⚠️ Race not found: ${raceId}, using default`);
		}
	}

	// Fallback to default or race-specific paths
	if (!modelPath) {
		const racePaths = {
			human: { path: "./assets/characters/playable/", file: "human.glb" },
			elf: { path: "./assets/characters/playable/", file: "elf.glb" },
			dwarf: { path: "./assets/characters/playable/", file: "dwarf.glb" },
			orc: { path: "./assets/characters/playable/", file: "orc.glb" },
			barbarian: { path: "./assets/characters/playable/", file: "barbarian.glb" },
			skeleton: { path: "./assets/characters/playable/", file: "skeleton_worges - Vaeloth The Phantom.glb" },
			default: { path: "./assets/characters/human_basemesh/", file: "HumanBaseMesh_WithEquips.glb" }
		};

		const raceData = racePaths[raceId] || racePaths.default;
		modelPath = raceData.path;
		fileName = raceData.file;
		scale = 3.7;
		positionY = -11;
	}

	console.log(`📥 Loading model: ${modelPath}${fileName}`);

	const result = await BABYLON.SceneLoader.ImportMeshAsync(null, modelPath, fileName, scene);

	let hero = result.meshes[0];
	character.addChild(hero);

	hero.scaling.scaleInPlace(scale);
	hero.position.y = positionY;

	// Convert -90 degrees to radians
	var degrees = -90;
	var radians = degrees * (Math.PI / 180);

	var skeleton = result.skeletons[0];

	// Assuming the root bone is the first bone
	var rootBone = skeleton.bones[0];

	rootBone.animations = [];

	// Override the root bone's position updates
	scene.onBeforeRenderObservable.add(() => {
		rootBone.position = BABYLON.Vector3.Zero();  // Negate root motion
		rootBone.rotationQuaternion = BABYLON.Quaternion.Identity();  // Optional: Negate root rotation
	});




	result.meshes[0].getChildren()[0].getChildren().forEach(mesh => {
		mesh.cameraCollide = false;
		if (mesh.material) mesh.material.transparencyMode = BABYLON.Material.MATERIAL_OPAQUE;
	});

	console.log(`✅ Loaded ${raceId} hero model`);

	return {
		hero: hero,
		skeleton: skeleton,
		raceId: raceId,
		isWorges: isWorges,
		animationGroups: result.animationGroups
	};
}

/**
 * Load default hero model (backwards compatibility)
 */
export async function loadDefaultHeroModel(scene, character) {
	return loadHeroModel(scene, character, { raceId: 'human' });
}
