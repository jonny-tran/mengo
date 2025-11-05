// Export analytics events as CSV or JSON
import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/lib/mock-data';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const format = searchParams.get('format') || 'json';
        
        const events = database.events;
        
        if (format === 'csv') {
            const headers = ['id', 'type', 'userId', 'projectId', 'taskId', 'timestamp', 'metadata'];
            const csvRows = [
                headers.join(','),
                ...events.map((event) => {
                    return [
                        event.id,
                        event.type,
                        event.userId || '',
                        event.projectId || '',
                        event.taskId || '',
                        event.timestamp,
                        JSON.stringify(event.metadata || {}),
                    ].map((field) => `"${String(field).replace(/"/g, '""')}"`).join(',');
                }),
            ];
            
            const csv = csvRows.join('\n');
            return new NextResponse(csv, {
                headers: {
                    'Content-Type': 'text/csv',
                    'Content-Disposition': 'attachment; filename="analytics_export.csv"',
                },
            });
        }
        
        return NextResponse.json({ events, count: events.length });
    } catch (error) {
        console.error('Error in /api/analytics/export:', error);
        return NextResponse.json(
            { error: 'Failed to export events' },
            { status: 500 }
        );
    }
}

