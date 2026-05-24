import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { STEPS, stepBySlug } from "@/lib/steps";
import { getTopicsByStep } from "@/data/topics";
import { StepLanding } from "@/components/step/StepLanding";

export function generateStaticParams() {
  return STEPS.map((s) => ({ step: s.slug }));
}

interface Props {
  params: Promise<{ step: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { step: stepSlug } = await params;
  const stepMeta = stepBySlug(stepSlug);
  if (!stepMeta) return { title: "Step not found" };

  const title = `Step ${String(stepMeta.step).padStart(2, "0")} — ${stepMeta.title}`;
  const description = stepMeta.lede;
  const url = `/steps/${stepMeta.slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "article" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function Page({ params }: Props) {
  const { step: stepSlug } = await params;
  const stepMeta = stepBySlug(stepSlug);
  if (!stepMeta) notFound();

  const concepts = getTopicsByStep(stepMeta.step);

  return <StepLanding step={stepMeta} concepts={concepts} />;
}
