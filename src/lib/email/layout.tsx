import type { ReactNode } from "react";
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
  pixelBasedPreset,
} from "react-email";

type PaperSourceEmailProps = {
  preview: string;
  heading: string;
  children: ReactNode;
  action?: { href: string; label: string };
};

export function PaperSourceEmail({
  preview,
  heading,
  children,
  action,
}: PaperSourceEmailProps) {
  return (
    <Html lang="en">
      <Tailwind
        config={{
          presets: [pixelBasedPreset],
          theme: {
            extend: {
              colors: {
                ink: "#102A43",
                cream: "#F8F6F1",
                graphite: "#20262E",
                slate: "#667085",
                border: "#E4E7EC",
                surface: "#FFFFFF",
              },
            },
          },
        }}
      >
        <Head />
        <Body className="bg-cream font-sans">
          <Preview>{preview}</Preview>
          <Container className="mx-auto my-8 max-w-xl bg-surface p-8">
            <Text className="m-0 text-xs uppercase tracking-widest text-slate">
              PaperSource
            </Text>
            <Heading
              as="h1"
              className="mt-3 mb-5 text-2xl font-semibold leading-8 text-ink"
            >
              {heading}
            </Heading>
            <Section>{children}</Section>
            {action ? (
              <Button
                href={action.href}
                className="mt-6 box-border block rounded bg-ink px-5 py-3 text-center text-white no-underline"
              >
                {action.label}
              </Button>
            ) : null}
            <Hr className="my-8 border-solid border-border" />
            <Text className="m-0 text-sm leading-6 text-slate">
              PaperSource is Ghana’s modern workplace supply partner. WhatsApp
              is for questions — not checkout.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
