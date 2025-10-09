import { ThreatDetector } from "@/components/ai/threat-detector";
import { detectNetworkThreats, type DetectNetworkThreatsInput } from "@/ai/flows/detect-network-threats";

async function handleDetect(data: DetectNetworkThreatsInput) {
    "use server";
    try {
        return await detectNetworkThreats(data);
    } catch(e) {
        console.error(e);
        return {
            threatDetected: true,
            threatDescription: "An unexpected error occurred while analyzing the data.",
            suggestedAction: "Please review the logs manually and report any suspicious activity."
        }
    }
}

export default function SecurityPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-headline font-bold">Community Immune System</h1>
        <p className="text-muted-foreground">A decentralized security protocol for collective self-defense against digital and physical threats.</p>
      </div>
      <ThreatDetector onDetect={handleDetect} />
    </div>
  );
}
