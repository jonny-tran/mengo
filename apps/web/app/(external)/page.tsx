import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <section className="container flex flex-col items-center justify-center flex-1 py-12 md:py-24 lg:py-32">
      <div className="max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
          Stop the &quot;Tao-Work&quot;. Start Building.
        </h1>
        <p className="mt-4 text-lg text-muted-foreground md:text-xl">
          Mengo is the AI Virtual Mentor that turns vague project briefs into
          actionable plans, teaching students how to think like a real engineer.
        </p>
        <div className="mt-8 flex justify-center space-x-4">
          <Button asChild size="lg">
            <Link href="/signup">Generate Your First Plan</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/#features">Learn More</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
