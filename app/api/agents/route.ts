import { NextResponse } from 'next/server';

const agents = [
  {
    id: 'meeting-summarizer',
    name: 'AI Meeting Summarizer',
    category: 'Productivity',
    price: '$19/mo',
    description: 'Summarizes transcripts into decisions, action items, and follow-ups.',
  },
  {
    id: 'sales-prospector',
    name: 'Sales Prospector',
    category: 'Sales',
    price: '$29/mo',
    description: 'Finds leads, drafts outreach, and scores prospects.',
  },
  {
    id: 'content-repurposer',
    name: 'Content Repurposer',
    category: 'Creator Tools',
    price: '$15/mo',
    description: 'Turns long content into posts, captions, and short-form ideas.',
  },
];

export async function GET() {
  return NextResponse.json({ agents });
}