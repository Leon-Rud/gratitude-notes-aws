import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Typography } from "../components/ui/Typography";
import { Input } from "../components/ui/Input";
import { Textarea } from "../components/ui/Textarea";

export function UiKitPreview() {
  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="mx-auto max-w-4xl space-y-12">
        <Typography variant="h1">UI Kit Preview</Typography>

        {/* Typography */}
        <Card variant="glass" padding="lg">
          <Typography variant="h2" className="mb-6">
            Typography
          </Typography>
          <div className="space-y-4">
            <Typography variant="h1">Heading 1</Typography>
            <Typography variant="h2">Heading 2</Typography>
            <Typography variant="body">Body text with Manrope font</Typography>
            <Typography variant="n1">Note 1 text</Typography>
            <Typography variant="label">Label text</Typography>
          </div>
        </Card>

        {/* Buttons */}
        <Card variant="glass" padding="lg">
          <Typography variant="h2" className="mb-6">
            Buttons
          </Typography>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <Button variant="primary" size="sm">
                Primary SM
              </Button>
              <Button variant="primary" size="md">
                Primary MD
              </Button>
              <Button variant="primary" size="lg">
                Primary LG
              </Button>
              <Button variant="primary" size="xl">
                Primary XL
              </Button>
            </div>
            <div className="flex flex-wrap gap-4">
              <Button variant="outline" size="md">
                Outline
              </Button>
              <Button variant="ghost" size="md">
                Ghost
              </Button>
              <Button variant="primary" size="md" disabled>
                Disabled
              </Button>
            </div>
            <Button variant="primary" size="md" fullWidth>
              Full Width Button
            </Button>
          </div>
        </Card>

        {/* Cards */}
        <Card variant="glass" padding="lg">
          <Typography variant="h2" className="mb-6">
            Cards
          </Typography>
          <div className="grid grid-cols-2 gap-4">
            <Card variant="glass" padding="sm">
              <Typography variant="body">Glass Card SM</Typography>
            </Card>
            <Card variant="glass" padding="md">
              <Typography variant="body">Glass Card MD</Typography>
            </Card>
            <Card variant="glass" padding="lg">
              <Typography variant="body">Glass Card LG</Typography>
            </Card>
            <Card variant="solid" padding="md">
              <Typography variant="body">Solid Card</Typography>
            </Card>
          </div>
        </Card>

        {/* Inputs */}
        <Card variant="glass" padding="lg">
          <Typography variant="h2" className="mb-6">
            Inputs
          </Typography>
          <div className="space-y-4">
            <div>
              <Typography variant="label" className="mb-2 block">
                Default Input
              </Typography>
              <Input variant="default" placeholder="Enter text..." />
            </div>
            <div>
              <Typography variant="label" className="mb-2 block">
                Subtle Input
              </Typography>
              <Input variant="subtle" placeholder="Enter text..." />
            </div>
            <div>
              <Typography variant="label" className="mb-2 block">
                Input with Error
              </Typography>
              <Input variant="default" error placeholder="Error state" />
            </div>
            <div>
              <Typography variant="label" className="mb-2 block">
                Disabled Input
              </Typography>
              <Input variant="default" disabled placeholder="Disabled" />
            </div>
          </div>
        </Card>

        {/* Textareas */}
        <Card variant="glass" padding="lg">
          <Typography variant="h2" className="mb-6">
            Textareas
          </Typography>
          <div className="space-y-4">
            <div>
              <Typography variant="label" className="mb-2 block">
                Default Textarea
              </Typography>
              <Textarea
                variant="default"
                rows={4}
                placeholder="Enter text..."
              />
            </div>
            <div>
              <Typography variant="label" className="mb-2 block">
                Subtle Textarea
              </Typography>
              <Textarea variant="subtle" rows={4} placeholder="Enter text..." />
            </div>
            <div>
              <Typography variant="label" className="mb-2 block">
                Textarea with Error
              </Typography>
              <Textarea
                variant="default"
                error
                rows={4}
                placeholder="Error state"
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
