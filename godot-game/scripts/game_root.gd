extends Node3D

const GRAVITY := 9.8
const THRUST_ACCELERATION := 22.0
const FUEL_BURN_RATE := 7.5
const START_POSITION := Vector3(-1.1, -0.4, 0.0)

var _rocket: Node3D
var _status_label: Label
var _fuel_bar: ProgressBar
var _velocity := Vector3.ZERO
var _fuel := 100.0
var _thrust_pressed := false
var _turn_input := 0.0
var _altitude := 0.0
var _grounded := false

func _ready() -> void:
	_build_world()
	_build_hud()

func _process(delta: float) -> void:
	if not is_instance_valid(_rocket):
		return

	var acceleration := Vector3(0.0, -GRAVITY, 0.0)
	if _thrust_pressed and _fuel > 0.0:
		var thrust_direction := _rocket.global_transform.basis.y.normalized()
		acceleration += thrust_direction * THRUST_ACCELERATION
		_fuel = maxf(0.0, _fuel - FUEL_BURN_RATE * delta)

	_velocity += acceleration * delta
	_rocket.position += _velocity * delta
	_rocket.rotate_z(_turn_input * delta * 0.8)

	# A simple launch pad reference plane prevents the prototype from falling forever.
	if _rocket.position.y < START_POSITION.y:
		_rocket.position.y = START_POSITION.y
		_velocity.y = maxf(0.0, _velocity.y)
		_grounded = true
	else:
		_grounded = false

	_altitude = maxf(0.0, _rocket.position.y - START_POSITION.y)
	_update_hud()

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
	_rocket.position = START_POSITION
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
	_status_label.position = Vector2(16, 76)
	_status_label.add_theme_color_override("font_color", Color("#50e6ff"))
	_status_label.add_theme_font_size_override("font_size", 15)
	hud.add_child(_status_label)

	_fuel_bar = ProgressBar.new()
	_fuel_bar.position = Vector2(16, 142)
	_fuel_bar.custom_minimum_size = Vector2(220, 22)
	_fuel_bar.max_value = 100.0
	_fuel_bar.show_percentage = false
	hud.add_child(_fuel_bar)

	var controls := HBoxContainer.new()
	controls.anchor_left = 0.02
	controls.anchor_top = 0.78
	controls.anchor_right = 0.98
	controls.anchor_bottom = 0.97
	controls.add_theme_constant_override("separation", 10)
	hud.add_child(controls)

	var left_button := _make_control_button("◀ TURN")
	left_button.button_down.connect(_set_turn.bind(-1.0))
	left_button.button_up.connect(_set_turn.bind(0.0))
	controls.add_child(left_button)

	var reset_button := _make_control_button("RESET")
	reset_button.pressed.connect(_reset_flight)
	controls.add_child(reset_button)

	var right_button := _make_control_button("TURN ▶")
	right_button.button_down.connect(_set_turn.bind(1.0))
	right_button.button_up.connect(_set_turn.bind(0.0))
	controls.add_child(right_button)

	var thrust_button := _make_control_button("HOLD TO THRUST")
	thrust_button.button_down.connect(_set_thrust.bind(true))
	thrust_button.button_up.connect(_set_thrust.bind(false))
	controls.add_child(thrust_button)

	_update_hud()

func _make_control_button(caption: String) -> Button:
	var button := Button.new()
	button.text = caption
	button.custom_minimum_size = Vector2(90, 54)
	button.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	button.size_flags_vertical = Control.SIZE_EXPAND_FILL
	button.add_theme_font_size_override("font_size", 14)
	return button

func _set_thrust(enabled: bool) -> void:
	_thrust_pressed = enabled

func _set_turn(direction: float) -> void:
	_turn_input = direction

func _reset_flight() -> void:
	_rocket.position = START_POSITION
	_rocket.rotation = Vector3.ZERO
	_velocity = Vector3.ZERO
	_fuel = 100.0
	_altitude = 0.0
	_grounded = false
	_thrust_pressed = false
	_turn_input = 0.0
	_update_hud()

func _update_hud() -> void:
	if not is_instance_valid(_status_label):
		return
	var state := "PAD" if _grounded else ("THRUST" if _thrust_pressed and _fuel > 0.0 else "COAST")
	_status_label.text = "FLIGHT TEST  |  %s\nALTITUDE  %.1f m    VERTICAL SPEED  %.1f m/s\nFUEL  %.0f%%" % [state, _altitude, _velocity.y, _fuel]
	_fuel_bar.value = _fuel

func _return_to_menu() -> void:
	get_tree().change_scene_to_file("res://scenes/main_menu.tscn")
