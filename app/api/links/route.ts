import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createLinkSchema = z.object({
  targetUrl: z.string().url('Invalid URL format'),
  code: z.string().regex(/^[A-Za-z0-9]{6,8}$/, 'Code must be 6-8 alphanumeric characters').optional(),
});

// POST /api/links - Create a new short link
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = createLinkSchema.safeParse(body);

    if (!validation.success) {
      const firstIssueMessage = validation.error.issues?.[0]?.message ?? 'Invalid request';
      return NextResponse.json(
        { error: firstIssueMessage },
        { status: 400 }
      );
    }

    const { targetUrl, code } = validation.data;
    const shortCode = code || generateRandomCode();

    // Check if code already exists
    const existing = await prisma.link.findUnique({
      where: { code: shortCode },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Code already exists. Please try a different code.' },
        { status: 409 }
      );
    }

    // Create the link
    const link = await prisma.link.create({
      data: {
        code: shortCode,
        targetUrl,
      },
    });

    return NextResponse.json(link, { status: 201 });
  } catch (error) {
    console.error('Error creating link:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/links - Get all links
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    let links;
    if (search) {
      links = await prisma.link.findMany({
        where: {
          OR: [
            { code: { contains: search, mode: 'insensitive' } },
            { targetUrl: { contains: search, mode: 'insensitive' } },
          ],
        },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      links = await prisma.link.findMany({
        orderBy: { createdAt: 'desc' },
      });
    }

    return NextResponse.json(links);
  } catch (error) {
    console.error('Error fetching links:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function generateRandomCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
