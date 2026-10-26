extends Node3D

var _rocket: Node3D
var _status_label: Label
var _rotation_speed := 0.22

func _ready() -> void:
	_build_world()
	_build_hud()

func _process(delta: float) -> void:
	if is_instance_valid(_rocket):
		_rocket.rotate_y(_rotation_speed * delta)

func _build_world() -> void:
	var world_environment := WorldEnvironment.new()
	var environment := Environment.new()
	environment.background_mode = Environment.BG_COLOR
	environment.background_color = Color("#030711")
	environment.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
	environment.ambient_light_color = Color("#7591c9")
	environment.ambient_light_energy = 0.45
	world_environment.environment = environment
	add_child(world_environment)

	var sun := DirectionalLight3D.new()
	sun.rotation_degrees = Vector3(-35, -25, 0)
	sun.light_energy = 2.0
	add_child(sun)

	var camera := Camera3D.new()
	camera.position = Vector3(0, 2.5, 10)
	camera.look_at(Vector3.ZERO, Vector3.UP)
	camera.current = true
	add_child(camera)

	var planet := MeshInstance3D.new()
	var planet_mesh := SphereMesh.new()
	planet_mesh.radius = 3.2
	planet_mesh.height = 6.4
	planet_mesh.radial_segments = 48
	planet_mesh.rings = 24
	planet.mesh = planet_mesh
	planet.position = Vector3(4.7, -2.2, -5.5)
	var planet_material := StandardMaterial3D.new()
	planet_material.albedo_color = Color("#173e79")
	planet_material.metallic = 0.12
	planet_material.roughness = 0.78
	planet_material.emission_enabled = true
	planet_material.emission = Color("#06132e")
	planet.material_override = planet_material
	add_child(planet)

	_rocket = Node3D.new()
	_rocket.position = Vector3(-1.1, -0.4, 0)
	add_child(_rocket)
	_add_rocket_part(_rocket, Vector3(0, 1.2, 0), Vector3(0.48, 1.7, 0.48), Color("#d8e2ef"))
	_add_rocket_part(_rocket, Vector3(0, 2.25, 0), Vector3(0.48, 0.45, 0.48), Color("#50e6ff"))
	_add_rocket_part(_rocket, Vector3(0, -0.05, 0), Vector3(0.58, 0.55, 0.58), Color("#687891"))
	_add_rocket_part(_rocket, Vector3(0, -0.43, 0), Vector3(0.26, 0.3, 0.26), Color("#ff9a54"))

func _add_rocket_part(parent: Node3D, part_position: Vector3, part_scale: Vector3, tint: Color) -> void:
	var part := MeshInstance3D.new()
	var mesh := CylinderMesh.new()
	mesh.top_radius = 0.5
	mesh.bottom_radius = 0.5
	mesh.height = 1.0
	mesh.radial_segments = 20
	part.mesh = mesh
	part.position = part_position
	part.scale = part_scale
	var material := StandardMaterial3D.new()
	material.albedo_color = tint
	material.metallic = 0.35
	material.roughness = 0.34
	part.material_override = material
	parent.add_child(part)

func _build_hud() -> void:
	var layer := CanvasLayer.new()
	add_child(layer)

	var hud := Control.new()
	hud.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	layer.add_child(hud)

	var back_button := Button.new()
	back_button.text = "← MENU"
	back_button.position = Vector2(16, 16)
	back_button.custom_minimum_size = Vector2(112, 48)
	back_button.pressed.connect(_return_to_menu)
	hud.add_child(back_button)

	_status_label = Label.new()
	_status_label.text = "SIMULATION FOUNDATION\n3D scene loaded • flight physics not implemented yet"
	_status_label.position = Vector2(16, 76)
	_status_label.add_theme_color_override("font_color", Color("#50e6ff"))
	_status_label.add_theme_font_size_override("font_size", 15)
	hud.add_child(_status_label)

func _return_to_menu() -> void:
	get_tree().change_scene_to_file("res://scenes/main_menu.tscn")
