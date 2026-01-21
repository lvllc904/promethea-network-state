#ifndef MCA_KERNEL_SS_STDP_H
#define MCA_KERNEL_SS_STDP_H

class SsStdp {
public:
    SsStdp(double initial_weight, double tau_et, double eta);
    void step(double dt, bool presynaptic_spike, bool postsynaptic_spike, double cgms_signal);
    double get_weight();
    long get_weight_update_count();
    double get_eligibility_trace();

private:
    double weight;
    double eligibility_trace;
    double tau_et; // Eligibility trace time constant
    double eta;    // Learning rate
    long weight_update_count;

    double f_weight(); // Soft bounding function
};

#endif //MCA_KERNEL_SS_STDP_H
