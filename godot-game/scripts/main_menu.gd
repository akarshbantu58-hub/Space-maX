extends Control

const GAME_SCENE := "res://scenes/game_root.tscn"

var _orientation_label: Label

func _ready() -> void:
	_build_ui()
	OrientationManager.apply_mode(OrientationManager.Mode.AUTO)

func _build_ui() -> void:
	var background := ColorRect.new()
	background.color = Color("#04070d")
	background.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	add_child(background)

	var layout := VBoxContainer.new()
	layout.anchor_left = 0.07
	layout.anchor_top = 0.07
	layout.anchor_right = 0.93
	layout.anchor_bottom = 0.93
	layout.add_theme_constant_override("separation", 16)
	add_child(layout)

	var eyebrow := Label.new()
	eyebrow.text = "AK CREATIONS  /  FLIGHT SYSTEMS"
	eyebrow.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	eyebrow.add_theme_font_size_override("font_size", 13)
	eyebrow.add_theme_color_override("font_color", Color("#7c4dff"))
	layout.add_child(eyebrow)

	var title := Label.new()
	title.text = "SPACE-MAX"
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	title.add_theme_font_size_override("font_size", 44)
	title.add_theme_color_override("font_color", Color("#00e5ff"))
	layout.add_child(title)

	var subtitle := Label.new()
	subtitle.text = "NATIVE 3D SPACEFLIGHT  •  CLEAN REBUILD"
	subtitle.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	subtitle.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	subtitle.add_theme_color_override("font_color", Color("#c1cde0"))
	layout.add_child(subtitle)

	var status := Label.new()
	status.text = "BUILD TRACK: REBORN\nVEHICLE EDITOR • ORBITAL FLIGHT • PLANETARY MISSIONS"
	status.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	status.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	status.add_theme_font_size_override("font_size", 14)
	status.add_theme_color_override("font_color", Color("#93a6c5"))
	layout.add_child(status)

	var spacer := Control.new()
	spacer.size_flags_vertical = Control.SIZE_EXPAND_FILL
	layout.add_child(spacer)

	var start_button := _make_button("START FLIGHT TEST")
	start_button.pressed.connect(_start_game)
	layout.add_child(start_button)

	var orientation_title := Label.new()
	orientation_title.text = "DISPLAY ORIENTATION"
	orientation_title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	orientation_title.add_theme_color_override("font_color", Color("#c1cde0"))
	layout.add_child(orientation_title)

	var orientation_row := HBoxContainer.new()
	orientation_row.add_theme_constant_override("separation", 10)
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
	_orientation_label.add_theme_color_override("font_color", Color("#00e5ff"))
	layout.add_child(_orientation_label)

	var footer := Label.new()
	footer.text = "EARLY DEVELOPMENT BUILD • NOT FINAL GAMEPLAY"
	footer.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	footer.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	footer.add_theme_font_size_override("font_size", 11)
	footer.add_theme_color_override("font_color", Color("#6f809b"))
	layout.add_child(footer)

func _make_button(caption: String) -> Button:
	var button := Button.new()
	button.text = caption
	button.custom_minimum_size = Vector2(0, 50)
	button.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	button.add_theme_font_size_override("font_size", 15)
	return button

func _set_orientation(mode: OrientationManager.Mode, label_text: String) -> void:
	OrientationManager.apply_mode(mode)
	_orientation_label.text = "Mode: " + label_text

func _start_game() -> void:
	get_tree().change_scene_to_file(GAME_SCENE)
