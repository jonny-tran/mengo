// Analytics API endpoint - collects and serves events
import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/lib/mock-data';
import type { AnalyticsEvent } from '@/lib/mock-data';

export async function POST(request: NextRequest) {
    try {
        const event: Omit<AnalyticsEvent, 'id' | 'timestamp'> = await request.json();
        const newEvent = database.addEvent(event);
        
        // Also log to console for debugging
        console.log('[Analytics]', newEvent);
        
        return NextResponse.json({ success: true, event: newEvent });
    } catch (error) {
        console.error('Error in /api/analytics:', error);
        return NextResponse.json(
            { error: 'Failed to record event' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const type = searchParams.get('type') as AnalyticsEvent['type'] | null;
        
        let events = database.events;
        if (type) {
            events = database.getEventsByType(type);
        }
        
        return NextResponse.json({ events });
    } catch (error) {
        console.error('Error in /api/analytics GET:', error);
        return NextResponse.json(
            { error: 'Failed to fetch events' },
            { status: 500 }
        );
    }
}

