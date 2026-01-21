package com.example.comsbiprototypemca

// import androidx.privacysandbox.tools.core.generator.build
import com.google.gson.annotations.SerializedName
import retrofit2.Response
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.Body
import retrofit2.http.POST

// --- Data Models (These must match the Python server's Pydantic models) ---

data class PatternResponse(
    val pattern: List<Float>,
    @SerializedName("expected_output_neuron")
    val expectedOutputNeuron: Int,
    @SerializedName("output_neuron_spiked")
    val outputNeuronSpiked: Boolean
)

data class CgmsRequest(
    @SerializedName("output_neuron_spiked")
    val outputNeuronSpiked: Boolean
)

data class CgmsResponse(
    @SerializedName("cgms_signal")
    val cgmsSignal: Float
)

// --- API Endpoint Interface (Defines the server's endpoints) ---

interface AgentApiService {
    @POST("/sbi/run-trial")
    suspend fun runSbiTrial(): Response<PatternResponse>

    @POST("/cgms")
    suspend fun getCgmsSignal(@Body request: CgmsRequest): Response<CgmsResponse>
}

// --- Retrofit API Client (The object you will use to make calls) ---

object AgentApiClient {
    // 10.0.2.2 is the special IP address for the Android Emulator to connect
    // to the host machine's (your Mac's) localhost.
    // The port is 8000 to match your uvicorn server command.
    private const val BASE_URL = "http://10.0.2.2:8000/"

    // A lazy-initialized Retrofit instance that creates our ApiService.
    val api: AgentApiService = Retrofit.Builder()
        .baseUrl(BASE_URL)
        .addConverterFactory(GsonConverterFactory.create())
        .build()
        .create(AgentApiService::class.java)
}
