import { BlurLayer, Card, Typography } from "../components/ui";

export function AboutPage() {
  return (
    <div className="relative min-h-screen w-full">
      {/* Background layers */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="bg-design-background absolute inset-0" />
        <BlurLayer />
      </div>

      {/* Content container - normal scrolling */}
      <div className="relative z-10 min-h-screen w-full">
        <div className="mx-auto max-w-7xl space-y-16 px-6 py-12">
          {/* Header */}
          <Typography variant="h2" as="h1" className="uppercase text-white">
            HEY, WE ARE
          </Typography>

          {/* Two Profile Cards */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {/* Profile Card 1 - Leon */}
            <Card variant="glass" padding="lg" className="flex flex-col gap-6">
              <div className="bg-ui-glass h-[162px] w-[162px] shrink-0 rounded-full" />
              <div className="space-y-2">
                <Typography variant="h2" as="h2" className="text-white">
                  Leon
                </Typography>
                <Typography variant="body" as="p" className="text-white">
                  Logic - Data - Code
                </Typography>
              </div>
              <Typography variant="body" as="p" className="text-white">
                I wire up the logic behind the screen, so every action quietly
                does the right thing. Keeping the magic from breaking.
              </Typography>
              <div className="flex gap-4">
                <div className="bg-ui-glass h-[25px] w-[25px] rounded" />
                <div className="bg-ui-glass h-[25px] w-[25px] rounded" />
                <div className="bg-ui-glass h-[31px] w-[31px] rounded" />
              </div>
            </Card>

            {/* Profile Card 2 - Aleksandra */}
            <Card variant="glass" padding="lg" className="flex flex-col gap-6">
              <div className="bg-ui-glass h-[162px] w-[162px] shrink-0 rounded-full" />
              <div className="space-y-2">
                <Typography variant="h2" as="h2" className="text-white">
                  Aleksandra
                </Typography>
                <Typography variant="body" as="p" className="text-white">
                  UX - Words - Visuals
                </Typography>
              </div>
              <Typography variant="body" as="p" className="text-white">
                I shape the user journey, ensuring everything feels like a
                thoughtful interaction. Making the experience feel human.
              </Typography>
              <div className="flex gap-4">
                <div className="bg-ui-glass h-[25px] w-[25px] rounded" />
                <div className="bg-ui-glass h-[25px] w-[25px] rounded" />
                <div className="bg-ui-glass h-[31px] w-[31px] rounded" />
              </div>
            </Card>
          </div>

          {/* OUR STORY Section */}
          <div className="space-y-6">
            <Typography variant="h2" as="h2" className="uppercase text-white">
              OUR STORY
            </Typography>
            <Typography variant="body" as="p" className="text-white">
              In 2020 during lock down, we began leaving sticky notes on our
              bathroom wall to ensure we always saw and appreciated each other.
            </Typography>
            <Typography variant="body" as="p" className="text-white">
              This little habit became our inspiration, during a period of
              unexpected unemployment. It served as a tool to stay grounded,
              true to ourselves and remember, that everything is temporary, so
              why not enjoy it?
            </Typography>
            <Typography variant="body" as="p" className="text-white">
              We believe technology should help us feel the way those notes did:
              simple, kind and fun.
            </Typography>
          </div>

          {/* Row of 3 circular placeholders */}
          <div className="flex flex-wrap justify-center gap-6">
            <div className="bg-ui-glass h-[220px] w-[220px] rounded-full" />
            <div className="bg-ui-glass h-[220px] w-[220px] rounded-full" />
            <div className="bg-ui-glass h-[220px] w-[220px] rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
