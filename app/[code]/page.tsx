import { redirect, notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';

interface PageProps {
  params: Promise<{
    code: string;
  }>;
}

export default async function RedirectPage(props: PageProps) {
  const params = await props.params;
  const { code } = params;

  // Find the link
  const link = await prisma.link.findUnique({
    where: { code },
  });

  // If link not found, show 404
  if (!link) {
    notFound();
  }

  // Update click count and last clicked time
  await prisma.link.update({
    where: { code },
    data: {
      totalClicks: { increment: 1 },
      lastClicked: new Date(),
    },
  });

  // Redirect to the target URL
  redirect(link.targetUrl);
}
