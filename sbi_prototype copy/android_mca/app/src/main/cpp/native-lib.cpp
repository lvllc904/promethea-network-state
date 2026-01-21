#include <jni.h>
#include <string>
#include <vector>
#include "simulation.h"

// Create a single, static instance of our simulation
static Simulation sbi_simulation;

extern "C" JNIEXPORT void JNICALL
Java_com_example_comsbiprototypemca_MainActivity_initializeMCA(
        JNIEnv* env,
        jobject /* this */) {
    // The instructions suggest N=100 neurons
    sbi_simulation.initialize(100);
}

extern "C" JNIEXPORT void JNICALL
Java_com_example_comsbiprototypemca_MainActivity_stepSimulation(
        JNIEnv* env,
        jobject /* this */,
        jdouble dt,
        jdouble cgms_signal) {
    // The CGMS signal is now passed in from the Kotlin layer
    sbi_simulation.step(dt, cgms_signal);
}

extern "C" JNIEXPORT jstring JNICALL
Java_com_example_comsbiprototypemca_MainActivity_getMetrics(
        JNIEnv* env,
        jobject /* this */) {
    std::string metrics_json = sbi_simulation.get_metrics_json();
    return env->NewStringUTF(metrics_json.c_str());
}

extern "C" JNIEXPORT void JNICALL
Java_com_example_comsbiprototypemca_MainActivity_applyInput(
        JNIEnv* env,
        jobject /* this */,
        jdoubleArray pattern_array) {

    jsize len = env->GetArrayLength(pattern_array);
    jdouble* pattern_elements = env->GetDoubleArrayElements(pattern_array, nullptr);

    std::vector<double> pattern_vec(pattern_elements, pattern_elements + len);

    sbi_simulation.set_external_input(pattern_vec);

    env->ReleaseDoubleArrayElements(pattern_array, pattern_elements, JNI_ABORT);
}

extern "C" JNIEXPORT void JNICALL
Java_com_example_comsbiprototypemca_MainActivity_updateWeights(
        JNIEnv* env,
        jobject /* this */,
        jdouble cgms_signal) {
    // Note: The current design updates weights in the main step() function.
    // This JNI function might be used for a more targeted update later.
}