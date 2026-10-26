extends Control

const GAME_SCENE := "res://scenes/game_root.tscn"

var _orientation_label: Label

func _ready() -> void:
	_build_ui()
	OrientationManager.apply_mode(OrientationManager.Mode.AUTO)

func _build_ui() -> void:
	var background := ColorRect.new()
	background.color = Color("#050914")
	background.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	add_child(background)

	var layout := VBoxContainer.new()
	layout.anchor_left = 0.08
	layout.anchor_top = 0.08
	layout.anchor_right = 0.92
	layout.anchor_bottom = 0.92
	layout.add_theme_constant_override("separation", 18)
	add_child(layout)

	var title := Label.new()
	title.text = "SPACE-MAX"
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	title.add_theme_font_size_override("font_size", 42)
	title.add_theme_color_override("font_color", Color("#50e6ff"))
	layout.add_child(title)

	var subtitle := Label.new()
	subtitle.text = "3D SPACEFLIGHT • PROJECT FOUNDATION"
	subtitle.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	subtitle.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	subtitle.add_theme_color_override("font_color", Color("#b5c6e6"))
	layout.add_child(subtitle)

	var spacer := Control.new()
	spacer.size_flags_vertical = Control.SIZE_EXPAND_FILL
	layout.add_child(spacer)

	var start_button := _make_button("ENTER SIMULATION")
	start_button.pressed.connect(_start_game)
	layout.add_child(start_button)

	var orientation_title := Label.new()
	orientation_title.text = "SCREEN ORIENTATION"
	orientation_title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	orientation_title.add_theme_color_override("font_color", Color("#b5c6e6"))
	layout.add_child(orientation_title)

	var orientation_row := HBoxContainer.new()
	orientation_row.alignment = BoxContainer.ALIGNMENT_CENTER
	orientation_row.add_theme_constant_override("separation", 12)
	layout.add_child(orientation_row)

	var auto_button := _make_button("AUTO")
	auto_button.pressed.connect(_set_orientation.bind(OrientationManager.Mode.AUTO, "Auto"))
	orientation_row.add_child(auto_button)

	var portrait_button := _make_button("PORTRAIT")
	portrait_button.pressed.connect(_set_orientation.bind(OrientationManager.Mode.PORTRAIT, "Portrait"))
	orientation_row.add_child(portrait_button)

	var landscape_button := _make_button("LANDSCAPE")
	landscape_button.pressed.connect(_set_orientation.bind(OrientationManager.Mode.LANDSCAPE, "Landscape"))
	orientation_row.add_child(landscape_button)

	_orientation_label = Label.new()
	_orientation_label.text = "Mode: Auto"
	_orientation_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_orientation_label.add_theme_color_override("font_color", Color("#50e6ff"))
	layout.add_child(_orientation_label)

	var footer := Label.new()
	footer.text = "FOUNDATION BUILD • FEATURES WILL BE ADDED IN MILESTONES"
	footer.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	footer.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	footer.add_theme_font_size_override("font_size", 12)
	footer.add_theme_color_override("font_color", Color("#7586a7"))
	layout.add_child(footer)

func _make_button(caption: String) -> Button:
	var button := Button.new()
	button.text = caption
	button.custom_minimum_size = Vector2(0, 52)
	button.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	button.add_theme_font_size_override("font_size", 16)
	return button

func _set_orientation(mode: OrientationManager.Mode, label_text: String) -> void:
	OrientationManager.apply_mode(mode)
	_orientation_label.text = "Mode: " + label_text

func _start_game() -> void:
	get_tree().change_scene_to_file(GAME_SCENE)
