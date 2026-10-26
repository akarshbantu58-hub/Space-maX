package com.akcreations.spacemax

import android.app.Activity
import android.graphics.Color
import android.graphics.Typeface
import android.os.Bundle
import android.view.Gravity
import android.view.MotionEvent
import android.view.View
import android.widget.Button
import android.widget.FrameLayout
import android.widget.LinearLayout
import android.widget.TextView

class MainActivity : Activity() {
    private lateinit var gameView: SpaceGLView
    private lateinit var status: TextView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        window.statusBarColor = Color.rgb(5, 10, 22)
        window.navigationBarColor = Color.rgb(5, 10, 22)
        window.decorView.systemUiVisibility =
            View.SYSTEM_UI_FLAG_FULLSCREEN or View.SYSTEM_UI_FLAG_HIDE_NAVIGATION or
            View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY or View.SYSTEM_UI_FLAG_LAYOUT_STABLE

        val root = FrameLayout(this).apply { setBackgroundColor(Color.rgb(5, 10, 22)) }
        gameView = SpaceGLView(this)
        root.addView(gameView, FrameLayout.LayoutParams(-1, -1))

        val top = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(18), dp(10), dp(18), dp(6))
            setBackgroundColor(Color.argb(190, 7, 14, 29))
        }
        val title = TextView(this).apply {
            text = "SPACE-MAX  /  NATIVE FLIGHT LAB"
            setTextColor(Color.rgb(255, 164, 55))
            textSize = 19f
            typeface = Typeface.create("sans-serif-condensed", Typeface.BOLD)
        }
        status = TextView(this).apply {
            text = "3D ENGINE ONLINE  •  DRAG TO ORBIT CAMERA"
            setTextColor(Color.rgb(160, 190, 218))
            textSize = 11f
        }
        top.addView(title); top.addView(status)
        root.addView(top, FrameLayout.LayoutParams(-1, dp(66), Gravity.TOP))

        val bottomPanel = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(8), dp(4), dp(8), dp(4))
            setBackgroundColor(Color.argb(235, 7, 14, 29))
        }
        val parts = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER
        }
        addButton(parts, "+ TANK") {
            gameView.renderer.tankCount = (gameView.renderer.tankCount + 1).coerceAtMost(5)
            updateAssemblyStatus()
        }
        addButton(parts, "+ ENGINE") {
            gameView.renderer.engineCount = (gameView.renderer.engineCount + 1).coerceAtMost(5)
            updateAssemblyStatus()
        }
        addButton(parts, "+ CAPSULE") {
            gameView.renderer.hasCapsule = true
            updateAssemblyStatus()
        }
        addButton(parts, "+ FIN") {
            gameView.renderer.finCount = (gameView.renderer.finCount + 1).coerceAtMost(8)
            updateAssemblyStatus()
        }
        addButton(parts, "RESET") {
            gameView.renderer.tankCount = 1
            gameView.renderer.engineCount = 1
            gameView.renderer.hasCapsule = true
            gameView.renderer.finCount = 4
            gameView.renderer.launching = false
            gameView.renderer.simActive = false
            gameView.renderer.fuelPercent = 100f
            gameView.renderer.verticalVelocity = 0f
            gameView.renderer.altitudeMeters = 0f
            gameView.renderer.horizontalVelocity = 0f
            gameView.renderer.orbitMode = false
            gameView.renderer.stageSeparated = false
            updateAssemblyStatus()
        }
        bottomPanel.addView(parts, LinearLayout.LayoutParams(-1, dp(44)))
        val controls = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER
        }
        addButton(controls, "BUILD") {
            gameView.renderer.scene = 0
            status.text = "VEHICLE ASSEMBLY  •  DRAG TO ORBIT CAMERA"
        }
        addButton(controls, "FLIGHT") {
            gameView.renderer.scene = 1
            status.text = "FLIGHT PREVIEW  •  USE LAUNCH TO START ENGINE"
        }
        addButton(controls, "PLANETS") {
            gameView.renderer.scene = 2
            status.text = "PLANET VIEW  •  PROCEDURAL SPHERE PREVIEW"
        }
        addButton(controls, "ORBIT") {
            gameView.renderer.orbitMode = true
            gameView.renderer.simActive = true
            gameView.renderer.launching = false
            gameView.renderer.horizontalVelocity = 7.8f
            gameView.renderer.altitudeMeters = 120_000f
            gameView.renderer.verticalVelocity = 0f
            status.text = "ORBIT MODE • 120 KM TARGET • TRAJECTORY DISPLAY"
        }
        addButton(controls, "STAGE") {
            gameView.renderer.stageSeparated = true
            gameView.renderer.launching = false
            status.text = "STAGE SEPARATED  •  BOOSTER ENGINES DISCONNECTED"
        }
        addButton(controls, "LAUNCH / CUTOFF") {
            gameView.renderer.simActive = true
            gameView.renderer.launching = !gameView.renderer.launching
            status.text = if (gameView.renderer.launching) "ENGINE IGNITION  •  FUEL ${gameView.renderer.fuelPercent.toInt()}%" else "ENGINE CUTOFF  •  GRAVITY COAST"
        }
        bottomPanel.addView(controls, LinearLayout.LayoutParams(-1, dp(48)))
        root.addView(bottomPanel, FrameLayout.LayoutParams(-1, dp(98), Gravity.BOTTOM))
        updateAssemblyStatus()
        setContentView(root)
    }

    private fun updateAssemblyStatus() {
        status.text = "NATIVE VAB  •  TANKS ${gameView.renderer.tankCount}  •  ENGINES ${gameView.renderer.engineCount}  •  FINS ${gameView.renderer.finCount}"
    }

    private fun addButton(parent: LinearLayout, label: String, action: () -> Unit) {
        val b = Button(this).apply {
            text = label; textSize = 10f; isAllCaps = false
            setTextColor(Color.WHITE)
            setBackgroundTintList(android.content.res.ColorStateList.valueOf(
                if (label.startsWith("LAUNCH")) Color.rgb(0, 170, 100) else Color.rgb(28, 43, 66)
            ))
            setOnClickListener { action() }
        }
        parent.addView(b, LinearLayout.LayoutParams(0, dp(44), 1f).apply {
            setMargins(dp(3), 0, dp(3), 0)
        })
    }

    private fun dp(value: Int) = (value * resources.displayMetrics.density).toInt()
    override fun onResume() { super.onResume(); if (::gameView.isInitialized) gameView.onResume() }
    override fun onPause() { if (::gameView.isInitialized) gameView.onPause(); super.onPause() }
}

class SpaceGLView(activity: Activity) : android.opengl.GLSurfaceView(activity) {
    val renderer = SpaceRenderer()
    init {
        setEGLContextClientVersion(2)
        setRenderer(renderer)
        renderMode = RENDERMODE_CONTINUOUSLY
        setOnTouchListener { _, event ->
            when (event.action) {
                MotionEvent.ACTION_DOWN -> {
                    renderer.lastX = event.x; renderer.lastY = event.y; true
                }
                MotionEvent.ACTION_MOVE -> {
                    renderer.cameraYaw += (event.x - renderer.lastX) * 0.35f
                    renderer.cameraPitch = (renderer.cameraPitch + (event.y - renderer.lastY) * 0.25f).coerceIn(-45f, 45f)
                    renderer.lastX = event.x; renderer.lastY = event.y; true
                }
                else -> true
            }
        }
    }
}
