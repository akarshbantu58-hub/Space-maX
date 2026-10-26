extends RefCounted
class_name OrientationManager

enum Mode {
	AUTO,
	PORTRAIT,
	LANDSCAPE
}

static func apply_mode(mode: Mode) -> void:
	match mode:
		Mode.PORTRAIT:
			DisplayServer.screen_set_orientation(DisplayServer.SCREEN_PORTRAIT)
		Mode.LANDSCAPE:
			DisplayServer.screen_set_orientation(DisplayServer.SCREEN_LANDSCAPE)
		_:
			DisplayServer.screen_set_orientation(DisplayServer.SCREEN_SENSOR)
