package com.example.comsbiprototypemca

import android.content.Context
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.util.AttributeSet
import android.view.View

class NetworkView(context: Context, attrs: AttributeSet?) : View(context, attrs) {

    private val gridPaint = Paint().apply {
        color = Color.DKGRAY
        style = Paint.Style.STROKE
    }

    private val spikePaint = Paint().apply {
        color = Color.YELLOW
        style = Paint.Style.FILL
    }

    private val hibernatingPaint = Paint().apply {
        color = Color.parseColor("#00008B") // Dark Blue
        style = Paint.Style.FILL
    }

    private val neuronSpikeAlpha = IntArray(100)
    private val hibernatingNeurons = BooleanArray(100)

    fun updateState(spikedNeuronIds: List<Int>, hibernatingNeuronIds: List<Int>) {
        // Set the new spikes to full alpha
        spikedNeuronIds.forEach { if (it in neuronSpikeAlpha.indices) neuronSpikeAlpha[it] = 255 }

        // Update hibernating state from the list of IDs
        hibernatingNeurons.fill(false)
        hibernatingNeuronIds.forEach { if (it in hibernatingNeurons.indices) hibernatingNeurons[it] = true }

        invalidate() // Request a redraw
    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)

        val gridSize = 10
        val cellWidth = width / gridSize.toFloat()
        val cellHeight = height / gridSize.toFloat()

        // Draw grid and states
        for (i in 0 until gridSize * gridSize) {
            val row = i / gridSize
            val col = i % gridSize
            val left = col * cellWidth
            val top = row * cellHeight
            val right = left + cellWidth
            val bottom = top + cellHeight

            // Draw hibernating state first
            if (hibernatingNeurons[i]) {
                canvas.drawRect(left, top, right, bottom, hibernatingPaint)
            }

            // Draw spike on top if present
            val alpha = neuronSpikeAlpha[i]
            if (alpha > 0) {
                spikePaint.alpha = alpha
                canvas.drawRect(left, top, right, bottom, spikePaint)
                // Decay alpha for next frame
                neuronSpikeAlpha[i] = (alpha - 40).coerceAtLeast(0)
            }

            // Draw grid cell
            canvas.drawRect(left, top, right, bottom, gridPaint)
        }

        // Invalidate continuously to create animation if any neuron is still "lit"
        if (neuronSpikeAlpha.any { it > 0 }) {
            postInvalidateOnAnimation()
        }
    }
}
