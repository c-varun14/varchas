import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import ManageCulturalWinners, {
  type CulturalWinnerDTO,
} from "@/components/cultural/ManageCulturalWinners";
import { Button } from "@/components/ui/button";

type CulturalWinnersPageProps = {
  params: Promise<{ culturalId: string }>;
};

export const revalidate = 0;
export const dynamic = "force-dynamic";

async function getEventWithWinners(culturalId: string): Promise<{
  id: string;
  name: string;
  winners: CulturalWinnerDTO[];
}> {
  const event = await prisma.culturalEvent.findUnique({
    where: { id: culturalId },
    include: {
      winners: {
        orderBy: [{ position: "asc" }],
      },
    },
  });

  if (!event) {
    notFound();
  }

  return {
    id: event.id,
    name: event.name,
    winners: event.winners.map((winner) => ({
      id: winner.id,
      position: winner.position,
      departmentName: winner.departmentName,
      points: winner.points,
    })),
  };
}

export default async function CulturalWinnersPage({
  params,
}: CulturalWinnersPageProps) {
  const { culturalId } = await params;
  const event = await getEventWithWinners(culturalId);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Button asChild variant="outline" className="mb-2">
        <Link href="/admin/cultural">← Back to cultural events</Link>
      </Button>

      <div className="space-y-1">
        <h1 className="text-2xl font-bold">{event.name} — winners admin</h1>
        <p className="text-sm text-muted-foreground">
          Configure podium placements and the points awarded for this event.
        </p>
      </div>

      <ManageCulturalWinners
        eventId={event.id}
        initialWinners={event.winners}
      />
    </div>
  );
}
