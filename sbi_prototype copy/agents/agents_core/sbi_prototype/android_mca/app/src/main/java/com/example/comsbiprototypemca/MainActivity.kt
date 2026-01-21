package com.example.comsbiprototypemca

import android.graphics.Color
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import com.example.comsbiprototypemca.databinding.ActivityMainBinding
import com.github.mikephil.charting.components.YAxis
import com.github.mikephil.charting.data.Entry
import com.github.mikephil.charting.data.LineData
import com.github.mikephil.charting.data.LineDataSet
import com.github.mikephil.charting.interfaces.datasets.ILineDataSet
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL
import java.util.concurrent.Executors

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private val handler = Handler(Looper.getMainLooper())
    private val executor = Executors.newSingleThreadExecutor()
    private var simulationRunning = false
    private val dt = 0.1 // Simulation timestep in ms
    private var time = 0f

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)
        setupChart()
        binding.startButton.setOnClickListener {
            if (!simulationRunning) {
                startSimulation()
            }
        }
    }

    private fun startSimulation() {
        initializeMCA()
        simulationRunning = true
        binding.startButton.isEnabled = false
        binding.startButton.text = "Running Trials..."
        runTrial() // Start the first learning trial
    }

    private fun runTrial() {
        if (!simulationRunning) return

        // 1. Get the task (pattern & expected output) from the server
        fetchPattern { pattern, expectedOutputNeuron ->
            // 2. Apply the pattern to the C++ kernel
            applyInput(pattern.toDoubleArray())

            // 3. Run simulation for a short duration to see the network's response
            val stepsForOutput = 15
            var currentStep = 0
            fun runOutputCheck() {
                stepSimulation(dt, 0.0) // No reward signal during this phase
                currentStep++
                if (currentStep < stepsForOutput) {
                    handler.postDelayed(::runOutputCheck, 20) // Run a step every 20ms
                } else {
                    // 4. Check the result
                    val metricsJson = getMetrics()
                    val outputCorrect = didOutputNeuronFire(metricsJson, expectedOutputNeuron)
                    updateDashboard(metricsJson) // Update UI with latest metrics

                    // 5. Get reward from server based on performance
                    fetchCgmsReward(outputCorrect) { cgmsSignal ->
                        // 6. Apply the reward signal to consolidate learning
                        stepSimulation(dt, cgmsSignal)
                        stepSimulation(dt, cgmsSignal) // Apply for a few steps

                        // 7. Start the next trial after a short delay
                        handler.postDelayed(::runTrial, 200)
                    }
                }
            }
            runOutputCheck()
        }
    }

    private fun didOutputNeuronFire(metricsJsonString: String, expectedNeuron: Int): Boolean {
        val json = JSONObject(metricsJsonString)
        val spikedNeuronsJson = json.getJSONArray("spiked_neurons")
        val spikedNeurons = List(spikedNeuronsJson.length()) { i -> spikedNeuronsJson.getInt(i) }
        return spikedNeurons.contains(expectedNeuron)
    }

    private fun updateDashboard(metricsJsonString: String) {
        val json = JSONObject(metricsJsonString)
        val sigmaW = json.getDouble("sigma_w").toFloat()
        val power = json.getLong("e_delta_w_proxy").toFloat()
        val avgFitness = json.getDouble("avg_fitness").toFloat()
        val hibernatingCount = json.getInt("hibernating_count").toFloat()
        val spikedNeurons = json.getJSONArray("spiked_neurons").let { List(it.length()) { i -> it.getInt(i) } }
        val hibernatingNeurons = json.getJSONArray("hibernating_neurons").let { List(it.length()) { i -> it.getInt(i) } }

        binding.networkView.updateState(spikedNeurons, hibernatingNeurons)
        addChartEntry(sigmaW, power, avgFitness, hibernatingCount)
    }

    // --- Networking ---

    private fun fetchPattern(callback: (pattern: List<Double>, expected: Int) -> Unit) {
        executor.execute {
            try {
                val url = URL("http://10.0.2.2:8000/pattern")
                val response = (url.openConnection() as HttpURLConnection).inputStream.bufferedReader().use { it.readText() }
                val json = JSONObject(response)
                val patternJson = json.getJSONArray("pattern")
                val pattern = List(patternJson.length()) { i -> patternJson.getDouble(i) }
                val expected = json.getInt("expected_output_neuron")
                handler.post { callback(pattern, expected) }
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    private fun fetchCgmsReward(outputCorrect: Boolean, callback: (Double) -> Unit) {
        executor.execute {
            try {
                val url = URL("http://10.0.2.2:8000/cgms")
                val connection = url.openConnection() as HttpURLConnection
                connection.requestMethod = "POST"
                connection.setRequestProperty("Content-Type", "application/json; charset=UTF-8")
                connection.doOutput = true

                val jsonObject = JSONObject().apply { put("output_neuron_spiked", outputCorrect) }
                connection.outputStream.use { os -> os.write(jsonObject.toString().toByteArray(Charsets.UTF_8)) }

                val response = connection.inputStream.bufferedReader().use { it.readText() }
                val responseJson = JSONObject(response)
                val signal = responseJson.getDouble("cgms_signal")
                handler.post { callback(signal) }
            } catch (e: Exception) {
                e.printStackTrace()
                handler.post { callback(0.0) }
            }
        }
    }

    // --- Charting ---
    private fun setupChart() {
        binding.lineChart.description.isEnabled = false
        binding.lineChart.data = LineData()
        binding.lineChart.legend.textColor = Color.WHITE
        binding.lineChart.axisLeft.textColor = Color.WHITE
        binding.lineChart.axisRight.isEnabled = true
        binding.lineChart.axisRight.textColor = Color.WHITE
    }

    private fun addChartEntry(sigmaW: Float, power: Float, avgFitness: Float, hibernating: Float) {
        val data = binding.lineChart.data ?: return
        var sigmaWSet = data.getDataSetByLabel("Sigma W", true) ?: createSet("Sigma W", Color.BLUE, YAxis.AxisDependency.LEFT).also { data.addDataSet(it) }
        var powerSet = data.getDataSetByLabel("Power Consumption", true) ?: createSet("Power Consumption", Color.RED, YAxis.AxisDependency.RIGHT).also { data.addDataSet(it) }
        var fitnessSet = data.getDataSetByLabel("Avg Fitness", true) ?: createSet("Avg Fitness", Color.GREEN, YAxis.AxisDependency.LEFT).also { data.addDataSet(it) }
        var hibernatingSet = data.getDataSetByLabel("Hibernating Count", true) ?: createSet("Hibernating Count", Color.GRAY, YAxis.AxisDependency.RIGHT).also { data.addDataSet(it) }

        data.addEntry(Entry(time, sigmaW), data.getIndexOfDataSet(sigmaWSet))
        data.addEntry(Entry(time, power), data.getIndexOfDataSet(powerSet))
        data.addEntry(Entry(time, avgFitness), data.getIndexOfDataSet(fitnessSet))
        data.addEntry(Entry(time, hibernating), data.getIndexOfDataSet(hibernatingSet))

        data.notifyDataChanged()
        binding.lineChart.notifyDataSetChanged()
        binding.lineChart.setVisibleXRangeMaximum(100f)
        binding.lineChart.moveViewToX(data.entryCount.toFloat())
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

    // --- JNI ---
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
