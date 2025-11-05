// CSV import endpoint - parses CSV and creates teams
import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/lib/mock-data';
import type { Team } from '@/lib/mock-data';

interface CSVRow {
    team_name: string;
    member_emails: string;
    instructor_email: string;
}

export async function POST(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const simulateBadCSV = searchParams.get('simulate_bad_csv') === 'true';
        
        if (simulateBadCSV) {
            return NextResponse.json(
                { error: 'Simulated CSV parse error' },
                { status: 400 }
            );
        }
        
        const formData = await request.formData();
        const file = formData.get('file') as File | null;
        
        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }
        
        const text = await file.text();
        const lines = text.trim().split('\n');
        
        if (lines.length < 2) {
            return NextResponse.json(
                { error: 'CSV must have at least header and one data row' },
                { status: 400 }
            );
        }
        
        // Parse header
        const header = lines[0].toLowerCase().split(',').map((h) => h.trim());
        const teamNameIndex = header.indexOf('team_name');
        const memberEmailsIndex = header.indexOf('member_emails');
        const instructorEmailIndex = header.indexOf('instructor_email');
        
        if (teamNameIndex === -1 || memberEmailsIndex === -1 || instructorEmailIndex === -1) {
            return NextResponse.json(
                { error: 'CSV must have columns: team_name, member_emails, instructor_email' },
                { status: 400 }
            );
        }
        
        // Parse rows
        const teams: Team[] = [];
        const errors: string[] = [];
        
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            // Simple CSV parsing (handle quoted fields)
            const values: string[] = [];
            let current = '';
            let inQuotes = false;
            
            for (let j = 0; j < line.length; j++) {
                const char = line[j];
                if (char === '"') {
                    inQuotes = !inQuotes;
                } else if (char === ',' && !inQuotes) {
                    values.push(current.trim());
                    current = '';
                } else {
                    current += char;
                }
            }
            values.push(current.trim());
            
            const teamName = values[teamNameIndex]?.replace(/^"|"$/g, '') || '';
            const memberEmailsStr = values[memberEmailsIndex]?.replace(/^"|"$/g, '') || '';
            const instructorEmail = values[instructorEmailIndex]?.replace(/^"|"$/g, '') || '';
            
            if (!teamName || !instructorEmail) {
                errors.push(`Row ${i + 1}: Missing required fields`);
                continue;
            }
            
            const memberEmails = memberEmailsStr
                .split(';')
                .map((email) => email.trim())
                .filter((email) => email.length > 0);
            
            const team: Team = {
                id: `team_${Date.now()}_${i}_${Math.random().toString(36).slice(2, 9)}`,
                name: teamName,
                memberEmails,
                instructorEmail,
                createdAt: new Date().toISOString(),
            };
            
            database.setTeam(team);
            teams.push(team);
        }
        
        return NextResponse.json({
            success: true,
            teamsCreated: teams.length,
            teams,
            errors: errors.length > 0 ? errors : undefined,
        });
    } catch (error) {
        console.error('Error in /api/import/csv:', error);
        return NextResponse.json(
            { error: 'Failed to import CSV' },
            { status: 500 }
        );
    }
}

