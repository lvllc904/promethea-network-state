//! TPNS zk-Prover Library for Edge Verifiable Computation
pub mod thermodynamic_tax;
pub mod lvm;

pub use thermodynamic_tax::{compute_thermodynamic_tax, ThermodynamicInputs, ThermodynamicTaxProof};
pub use lvm::{compute_worker_equity, WorkerLaborEntry, LaborAllocationProof};
