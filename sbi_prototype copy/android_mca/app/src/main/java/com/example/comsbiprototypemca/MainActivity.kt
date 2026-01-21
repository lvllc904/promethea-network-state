package com.example.comsbiprototypemca

import android.graphics.Color
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.util.Log
import android.view.View
import android.widget.Button
import androidx.lifecycle.lifecycleScope
// import androidx.paging.map
// import com.example.comsbiprototypemca.databinding.ActivityMainBinding
import com.github.mikephil.charting.charts.LineChart
import com.github.mikephil.charting.components.YAxis
import com.github.mikephil.charting.data.Entry
import com.github.mikephil.charting.data.LineData
import com.github.mikephil.charting.data.LineDataSet
import com.github.mikephil.charting.interfaces.datasets.ILineDataSet
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import org.json.JSONObject

class MainActivity : AppCompatActivity() {

    // private lateinit var binding: ActivityMainBinding
    private var simulationRunning = false
    private val dt = 0.1 // Simulation timestep in ms
    private var time = 0f
    private lateinit var startButton: Button
    private lateinit var networkView: NetworkView
    private lateinit var lineChart: LineChart

    // A tag for filtering logs in Logcat
    private val TAG = "MainActivity"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        // binding = ActivityMainBinding.inflate(layoutInflater)
        // setContentView(binding.root)
        startButton = findViewById(R.id.startButton)
        networkView = findViewById(R.id.networkView)
        lineChart = findViewById(R.id.lineChart)
        setupChart()

        startButton.setOnClickListener {
            if (!simulationRunning) {
                startSimulation()
            }
        }
    }

    private fun startSimulation() {
        initializeMCA()
        simulationRunning = true
        startButton.isEnabled = false
        startButton.text = "Running Trials..."
        // Launch the main simulation loop in a coroutine
        lifecycleScope.launch {
            runTrialLoop()
        }
    }

    private suspend fun runTrialLoop() {
        // This loop will continue as long as the simulation is running
        while (simulationRunning && isActive) {
            try {
                // 1. Get the task (pattern & expected output) from the server
                Log.d(TAG, "Fetching pattern from server...")
                val trialResponse = AgentApiClient.api.runSbiTrial()

                if (trialResponse.isSuccessful) {
                    val trialData = trialResponse.body()!!
                    Log.d(TAG, "Pattern received. Expected output neuron: ${trialData.expectedOutputNeuron}")

                    // 2. Apply the pattern to the C++ kernel
                    val pattern = DoubleArray(trialData.pattern.size)
                    for (i in trialData.pattern.indices) {
                        pattern[i] = trialData.pattern[i].toDouble()
                    }
                    applyInput(pattern)

                    // 3. Run simulation for a short duration to see the network's response
                    val stepsForOutput = 15
                    for (i in 0 until stepsForOutput) {
                        stepSimulation(dt, 0.0) // No reward signal during this phase
                        delay(20) // Small delay between steps
                    }

                    // 4. Check the result
                    val metricsJson = getMetrics()
                    val outputCorrect = didOutputNeuronFire(metricsJson, trialData.expectedOutputNeuron)
                    Log.d(TAG, "Output was correct: $outputCorrect")
                    updateDashboard(metricsJson) // Update UI with latest metrics

                    // 5. Get reward from server based on performance
                    Log.d(TAG, "Fetching CGMS reward from server...")
                    val cgmsRequest = CgmsRequest(outputNeuronSpiked = outputCorrect)
                    val cgmsResponse = AgentApiClient.api.getCgmsSignal(cgmsRequest)

                    if (cgmsResponse.isSuccessful) {
                        val cgmsSignal = cgmsResponse.body()!!.cgmsSignal.toDouble()
                        Log.d(TAG, "CGMS reward signal received: $cgmsSignal")

                        // 6. Apply the reward signal to consolidate learning
                        stepSimulation(dt, cgmsSignal)
                        stepSimulation(dt, cgmsSignal) // Apply for a few steps
                    } else {
                        Log.e(TAG, "Failed to get CGMS signal: ${cgmsResponse.code()}")
                    }
                } else {
                    Log.e(TAG, "Failed to fetch pattern: ${trialResponse.code()}")
                }

            } catch (e: Exception) {
                // This is critical for debugging network issues
                Log.e(TAG, "A network error occurred: ${e.message}", e)
                // Stop the simulation on error to prevent a fast error loop
                simulationRunning = false
            }

            // 7. Wait a bit before starting the next trial
            delay(200)
        }

        // Loop has finished, re-enable the button
        startButton.isEnabled = true
        startButton.text = "Start Simulation"
    }

    private fun didOutputNeuronFire(metricsJsonString: String, expectedNeuron: Int): Boolean {
        return try {
            val json = JSONObject(metricsJsonString)
            val spikedNeuronsJson = json.getJSONArray("spiked_neurons")
            val spikedNeurons = mutableListOf<Int>()
            for (i in 0 until spikedNeuronsJson.length()) {
                spikedNeurons.add(spikedNeuronsJson.getInt(i))
            }
            spikedNeurons.contains(expectedNeuron)
        } catch (e: Exception) {
            Log.e(TAG, "Error parsing metrics JSON: $metricsJsonString", e)
            false
        }
    }

    private fun updateDashboard(metricsJsonString: String) {
        try {
            val json = JSONObject(metricsJsonString)
            val sigmaW = json.getDouble("sigma_w").toFloat()
            val power = json.getLong("e_delta_w_proxy").toFloat()
            val avgFitness = json.getDouble("avg_fitness").toFloat()
            val hibernatingCount = json.getInt("hibernating_count").toFloat()
            val spikedNeuronsJson = json.getJSONArray("spiked_neurons")
            val spikedNeurons = mutableListOf<Int>()
            for (i in 0 until spikedNeuronsJson.length()) {
                spikedNeurons.add(spikedNeuronsJson.getInt(i))
            }
            val hibernatingNeuronsJson = json.getJSONArray("hibernating_neurons")
            val hibernatingNeurons = mutableListOf<Int>()
            for (i in 0 until hibernatingNeuronsJson.length()) {
                hibernatingNeurons.add(hibernatingNeuronsJson.getInt(i))
            }

            networkView.updateState(spikedNeurons, hibernatingNeurons)
            addChartEntry(sigmaW, power, avgFitness, hibernatingCount)
        } catch (e: Exception) {
            Log.e(TAG, "Error updating dashboard with JSON: $metricsJsonString", e)
        }
    }

    // --- Charting (No changes needed here) ---
    private fun setupChart() {
        lineChart.description.isEnabled = false
        lineChart.data = LineData()
        lineChart.legend.textColor = Color.WHITE
        lineChart.axisLeft.textColor = Color.WHITE
        lineChart.axisRight.isEnabled = true
        lineChart.axisRight.textColor = Color.WHITE
    }

    private fun addChartEntry(sigmaW: Float, power: Float, avgFitness: Float, hibernating: Float) {
        val data = lineChart.data ?: return
        var sigmaWSet = data.getDataSetByLabel("Sigma W", true)
        if (sigmaWSet == null) {
            sigmaWSet = createSet("Sigma W", Color.BLUE, YAxis.AxisDependency.LEFT)
            data.addDataSet(sigmaWSet)
        }
        var powerSet = data.getDataSetByLabel("Power Consumption", true)
        if (powerSet == null) {
            powerSet = createSet("Power Consumption", Color.RED, YAxis.AxisDependency.RIGHT)
            data.addDataSet(powerSet)
        }
        var fitnessSet = data.getDataSetByLabel("Avg Fitness", true)
        if (fitnessSet == null) {
            fitnessSet = createSet("Avg Fitness", Color.GREEN, YAxis.AxisDependency.LEFT)
            data.addDataSet(fitnessSet)
        }
        var hibernatingSet = data.getDataSetByLabel("Hibernating Count", true)
        if (hibernatingSet == null) {
            hibernatingSet = createSet("Hibernating Count", Color.GRAY, YAxis.AxisDependency.RIGHT)
            data.addDataSet(hibernatingSet)
        }

        data.addEntry(Entry(time, sigmaW), data.getIndexOfDataSet(sigmaWSet))
        data.addEntry(Entry(time, power), data.getIndexOfDataSet(powerSet))
        data.addEntry(Entry(time, avgFitness), data.getIndexOfDataSet(fitnessSet))
        data.addEntry(Entry(time, hibernating), data.getIndexOfDataSet(hibernatingSet))

        data.notifyDataChanged()
        lineChart.notifyDataSetChanged()
        lineChart.setVisibleXRangeMaximum(100f)
        lineChart.moveViewToX(data.entryCount.toFloat())
        time += 1f
    }

    private fun createSet(label: String, color: Int, axis: YAxis.AxisDependency): ILineDataSet {
        val set = LineDataSet(null, label)
        set.axisDependency = axis
        set.color = color
        set.setDrawValues(false)
        set.setDrawCircles(false)
        return set
    }

    // --- JNI (No changes needed here) ---
    private external fun initializeMCA()
    private external fun stepSimulation(dt: Double, cgmsSignal: Double)
    private external fun getMetrics(): String
    private external fun applyInput(pattern: DoubleArray)
    private external fun updateWeights(cgmsSignal: Double)

    companion object {
        init {
            System.loadLibrary("mca_kernel")
        }
    }
}
