package com.akcreations.spacemax

import android.opengl.GLES20
import android.opengl.GLSurfaceView
import android.opengl.Matrix
import java.nio.ByteBuffer
import java.nio.ByteOrder
import java.nio.FloatBuffer
import javax.microedition.khronos.egl.EGLConfig
import javax.microedition.khronos.opengles.GL10
import kotlin.math.cos
import kotlin.math.sin

class SpaceRenderer : GLSurfaceView.Renderer {
    @Volatile var cameraYaw = -18f
    @Volatile var cameraPitch = 8f
    @Volatile var lastX = 0f
    @Volatile var lastY = 0f
    @Volatile var scene = 0
    @Volatile var launching = false
    @Volatile var tankCount = 1
    @Volatile var engineCount = 1
    @Volatile var hasCapsule = true
    @Volatile var finCount = 4
    @Volatile var simActive = false
    @Volatile var fuelPercent = 100f
    @Volatile var verticalVelocity = 0f
    @Volatile var altitudeMeters = 0f
    private var width = 1
    private var height = 1
    private var program = 0
    private var positionHandle = 0
    private var colorHandle = 0
    private var mvpHandle = 0
    private val projection = FloatArray(16)
    private val view = FloatArray(16)
    private val model = FloatArray(16)
    private val mvp = FloatArray(16)
    private val temp = FloatArray(16)
    private val meshes = mutableMapOf<String, Mesh>()
    private var frame = 0f

    data class Mesh(val buffer: FloatBuffer, val count: Int)

    override fun onSurfaceCreated(gl: GL10?, config: EGLConfig?) {
        GLES20.glClearColor(0.018f, 0.035f, 0.075f, 1f)
        GLES20.glEnable(GLES20.GL_DEPTH_TEST)
        GLES20.glEnable(GLES20.GL_CULL_FACE)
        val vertex = """
            uniform mat4 uMvp;
            attribute vec3 aPosition;
            void main() { gl_Position = uMvp * vec4(aPosition, 1.0); }
        """.trimIndent()
        val fragment = """
            precision mediump float;
            uniform vec4 uColor;
            void main() { gl_FragColor = uColor; }
        """.trimIndent()
        val vs = compile(GLES20.GL_VERTEX_SHADER, vertex)
        val fs = compile(GLES20.GL_FRAGMENT_SHADER, fragment)
        program = GLES20.glCreateProgram()
        GLES20.glAttachShader(program, vs); GLES20.glAttachShader(program, fs)
        GLES20.glLinkProgram(program)
        val link = IntArray(1)
        GLES20.glGetProgramiv(program, GLES20.GL_LINK_STATUS, link, 0)
        check(link[0] == GLES20.GL_TRUE) { GLES20.glGetProgramInfoLog(program) }
        positionHandle = GLES20.glGetAttribLocation(program, "aPosition")
        colorHandle = GLES20.glGetUniformLocation(program, "uColor")
        mvpHandle = GLES20.glGetUniformLocation(program, "uMvp")
        meshes["cylinder"] = cylinder(0.5f, 1f, 32)
        meshes["cone"] = cone(0.5f, 1f, 32)
        meshes["sphere"] = sphere(32, 20)
        meshes["fin"] = fin()
    }

    override fun onSurfaceChanged(gl: GL10?, w: Int, h: Int) {
        width = w.coerceAtLeast(1); height = h.coerceAtLeast(1)
        GLES20.glViewport(0, 0, width, height)
        Matrix.perspectiveM(projection, 0, 48f, width.toFloat() / height, 0.1f, 100f)
    }

    override fun onDrawFrame(gl: GL10?) {
        val dt = 0.016f
        frame += dt
        if (simActive) {
            if (launching && fuelPercent > 0f) {
                val burnRate = engineCount.coerceIn(1, 5) * 0.16f
                fuelPercent = (fuelPercent - burnRate * dt).coerceAtLeast(0f)
            }
            val thrustAcceleration = if (launching && fuelPercent > 0f) engineCount.coerceIn(1, 5) * 9.5f else 0f
            val gravity = 9.81f
            verticalVelocity += (thrustAcceleration - gravity) * dt
            altitudeMeters = (altitudeMeters + verticalVelocity * dt).coerceAtLeast(0f)
            if (altitudeMeters <= 0f && verticalVelocity < 0f) verticalVelocity = 0f
            if (fuelPercent <= 0f) launching = false
        }
        GLES20.glClear(GLES20.GL_COLOR_BUFFER_BIT or GLES20.GL_DEPTH_BUFFER_BIT)
        GLES20.glUseProgram(program)
        Matrix.setLookAtM(view, 0, 0f, 1.1f, 7.2f, 0f, 0.1f, 0f, 0f, 1f, 0f)
        Matrix.rotateM(view, 0, cameraPitch, 1f, 0f, 0f)
        Matrix.rotateM(view, 0, cameraYaw, 0f, 1f, 0f)

        for (i in 0 until 44) {
            val x = ((i * 37) % 17 - 8) * 0.78f
            val y = ((i * 19) % 13 - 6) * 0.52f
            val z = -5.0f - (i % 5) * 1.2f
            draw("sphere", x, y, z, 0.018f, 0.018f, 0.018f, floatArrayOf(0.45f, 0.66f, 0.92f, 1f))
        }

        val planetX = if (scene == 2) 0.1f else 2.35f
        val planetScale = if (scene == 2) 1.7f else 1.18f
        draw("sphere", planetX, 0.7f, -2.2f, planetScale, planetScale, planetScale, floatArrayOf(0.09f, 0.35f, 0.82f, 1f))
        draw("sphere", planetX - 0.13f, 0.82f, -2.05f, planetScale * 0.91f, planetScale * 0.91f, planetScale * 0.91f, floatArrayOf(0.12f, 0.52f, 0.76f, 1f))

        if (scene != 2) {
            val lift = (altitudeMeters / 180f).coerceIn(0f, 4.5f)
            val y = -0.15f + lift
            for (tank in 0 until tankCount.coerceIn(1, 5)) {
                val tankY = y - 0.10f + tank * 0.76f
                draw("cylinder", -0.45f, tankY - 0.45f, 0f, 0.43f, 0.78f, 0.43f, floatArrayOf(0.73f, 0.78f, 0.84f, 1f))
                draw("cylinder", -0.45f, tankY - 0.06f, 0.01f, 0.445f, 0.045f, 0.445f, floatArrayOf(0.98f, 0.43f, 0.08f, 1f))
            }
            for (engine in 0 until engineCount.coerceIn(1, 5)) {
                val offset = (engine - (engineCount.coerceIn(1, 5) - 1) / 2f) * 0.19f
                draw("cylinder", -0.45f + offset, y - 1.33f, 0f, 0.13f, 0.28f, 0.13f, floatArrayOf(0.36f, 0.43f, 0.55f, 1f))
                draw("cone", -0.45f + offset, y - 1.54f, 0f, 0.13f, 0.35f, 0.13f, floatArrayOf(0.88f, 0.36f, 0.09f, 1f))
            }
            if (hasCapsule) {
                draw("cylinder", -0.45f, y + 0.28f, 0f, 0.31f, 0.83f, 0.31f, floatArrayOf(0.87f, 0.9f, 0.94f, 1f))
                draw("cylinder", -0.45f, y + 0.12f, 0f, 0.322f, 0.045f, 0.322f, floatArrayOf(0.97f, 0.48f, 0.12f, 1f))
                draw("cone", -0.45f, y + 0.94f, 0f, 0.31f, 0.44f, 0.31f, floatArrayOf(0.94f, 0.95f, 0.98f, 1f))
            }
            for (angle in 0 until finCount.coerceIn(0, 8)) {
                Matrix.setIdentityM(model, 0)
                Matrix.translateM(model, 0, -0.45f, y - 1.05f, 0f)
                Matrix.rotateM(model, 0, angle * 90f, 0f, 1f, 0f)
                Matrix.translateM(model, 0, 0f, 0f, 0.39f)
                Matrix.scaleM(model, 0, 0.26f, 0.35f, 0.09f)
                drawModel("fin", model, floatArrayOf(0.96f, 0.35f, 0.08f, 1f))
            }
            if (launching) draw("cone", -0.45f, y - 1.92f, 0f, 0.17f, 0.62f, 0.17f, floatArrayOf(1f, 0.72f, 0.15f, 0.9f))
        } else {
            for (i in 0 until 28) {
                val a = i * (Math.PI * 2.0 / 28.0)
                draw("sphere", (cos(a) * 2.0).toFloat(), 0.7f, (sin(a) * 0.18 - 2.2).toFloat(), 0.025f, 0.025f, 0.025f, floatArrayOf(0.4f, 0.75f, 1f, 1f))
            }
        }
    }

    private fun draw(key: String, x: Float, y: Float, z: Float, sx: Float, sy: Float, sz: Float, color: FloatArray) {
        Matrix.setIdentityM(model, 0)
        Matrix.translateM(model, 0, x, y, z)
        Matrix.scaleM(model, 0, sx, sy, sz)
        drawModel(key, model, color)
    }

    private fun drawModel(key: String, transform: FloatArray, color: FloatArray) {
        Matrix.multiplyMM(temp, 0, view, 0, transform, 0)
        Matrix.multiplyMM(mvp, 0, projection, 0, temp, 0)
        GLES20.glUniformMatrix4fv(mvpHandle, 1, false, mvp, 0)
        GLES20.glUniform4fv(colorHandle, 1, color, 0)
        val mesh = meshes[key] ?: return
        mesh.buffer.position(0)
        GLES20.glEnableVertexAttribArray(positionHandle)
        GLES20.glVertexAttribPointer(positionHandle, 3, GLES20.GL_FLOAT, false, 12, mesh.buffer)
        GLES20.glDrawArrays(GLES20.GL_TRIANGLES, 0, mesh.count)
        GLES20.glDisableVertexAttribArray(positionHandle)
    }

    private fun compile(type: Int, source: String): Int {
        val shader = GLES20.glCreateShader(type)
        GLES20.glShaderSource(shader, source); GLES20.glCompileShader(shader)
        val status = IntArray(1)
        GLES20.glGetShaderiv(shader, GLES20.GL_COMPILE_STATUS, status, 0)
        check(status[0] == GLES20.GL_TRUE) { GLES20.glGetShaderInfoLog(shader) }
        return shader
    }

    private fun cylinder(radius: Float, height: Float, segments: Int): Mesh {
        val v = ArrayList<Float>()
        for (i in 0 until segments) {
            val a = i * 2f * Math.PI.toFloat() / segments
            val b = (i + 1) * 2f * Math.PI.toFloat() / segments
            val x1 = cos(a) * radius; val z1 = sin(a) * radius
            val x2 = cos(b) * radius; val z2 = sin(b) * radius
            tri(v, x1, -height/2, z1, x2, -height/2, z2, x2, height/2, z2)
            tri(v, x1, -height/2, z1, x2, height/2, z2, x1, height/2, z1)
            tri(v, 0f, -height/2, 0f, x2, -height/2, z2, x1, -height/2, z1)
            tri(v, 0f, height/2, 0f, x1, height/2, z1, x2, height/2, z2)
        }
        return mesh(v)
    }

    private fun cone(radius: Float, height: Float, segments: Int): Mesh {
        val v = ArrayList<Float>()
        for (i in 0 until segments) {
            val a = i * 2f * Math.PI.toFloat() / segments
            val b = (i + 1) * 2f * Math.PI.toFloat() / segments
            val x1 = cos(a) * radius; val z1 = sin(a) * radius
            val x2 = cos(b) * radius; val z2 = sin(b) * radius
            tri(v, x1, -height/2, z1, x2, -height/2, z2, 0f, height/2, 0f)
            tri(v, 0f, -height/2, 0f, x1, -height/2, z1, x2, -height/2, z2)
        }
        return mesh(v)
    }

    private fun sphere(segments: Int, rings: Int): Mesh {
        val v = ArrayList<Float>()
        for (r in 0 until rings) {
            val lat1 = -Math.PI / 2 + Math.PI * r / rings
            val lat2 = -Math.PI / 2 + Math.PI * (r + 1) / rings
            for (s in 0 until segments) {
                val lon1 = 2 * Math.PI * s / segments
                val lon2 = 2 * Math.PI * (s + 1) / segments
                val p1 = point(lat1, lon1); val p2 = point(lat2, lon1)
                val p3 = point(lat2, lon2); val p4 = point(lat1, lon2)
                tri(v, p1[0], p1[1], p1[2], p2[0], p2[1], p2[2], p3[0], p3[1], p3[2])
                tri(v, p1[0], p1[1], p1[2], p3[0], p3[1], p3[2], p4[0], p4[1], p4[2])
            }
        }
        return mesh(v)
    }

    private fun point(lat: Double, lon: Double) = floatArrayOf(
        (cos(lat) * cos(lon)).toFloat(), sin(lat).toFloat(), (cos(lat) * sin(lon)).toFloat()
    )

    private fun fin(): Mesh {
        val v = ArrayList<Float>()
        tri(v, -0.1f, -0.5f, 0f, 0.1f, -0.5f, 0f, 0.42f, 0.5f, 0f)
        tri(v, -0.1f, -0.5f, 0f, 0.42f, 0.5f, 0f, -0.42f, 0.18f, 0f)
        return mesh(v)
    }

    private fun tri(o: MutableList<Float>, ax: Float, ay: Float, az: Float, bx: Float, by: Float, bz: Float, cx: Float, cy: Float, cz: Float) {
        o.add(ax); o.add(ay); o.add(az); o.add(bx); o.add(by); o.add(bz); o.add(cx); o.add(cy); o.add(cz)
    }

    private fun mesh(values: List<Float>): Mesh {
        val bytes = ByteBuffer.allocateDirect(values.size * 4).order(ByteOrder.nativeOrder())
        val buffer = bytes.asFloatBuffer()
        values.forEach { buffer.put(it) }; buffer.position(0)
        return Mesh(buffer, values.size / 3)
    }
}
