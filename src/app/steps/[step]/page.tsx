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

export default async function Page({ params }: Props) {
  const { step: stepSlug } = await params;
  const stepMeta = stepBySlug(stepSlug);
  if (!stepMeta) notFound();

  const concepts = getTopicsByStep(stepMeta.step);

  return <StepLanding step={stepMeta} concepts={concepts} />;
}
