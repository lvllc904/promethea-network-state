import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ledger } from "@/lib/data"
import { formatDistanceToNow } from "date-fns"

export default function LedgerPage() {
  const getBadgeVariant = (type: string) => {
    switch (type) {
      case 'Sweat Equity': return 'default';
      case 'Capital': return 'secondary';
      case 'Profit Distribution': return 'outline';
      case 'Governance': return 'destructive';
      default: return 'default';
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-3xl font-headline font-bold">UVT Ledger</h1>
        <p className="text-muted-foreground">A rich, multi-dimensional, and immutable record of how value is created and exchanged.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>
            All value creation and exchange events are recorded transparently on-chain.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Value</TableHead>
                <TableHead className="text-right">Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ledger.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="font-medium">
                    <div className="font-medium">{entry.description}</div>
                    <div className="text-xs text-muted-foreground font-mono">{entry.id}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getBadgeVariant(entry.type) as any}>{entry.type}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono font-semibold">{entry.value}</TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {formatDistanceToNow(new Date(entry.timestamp), { addSuffix: true })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
