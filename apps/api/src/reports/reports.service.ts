import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import OpenAI from 'openai';

@Injectable()
export class ReportsService {
    private openai: OpenAI;

    constructor(private prisma: PrismaService) {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
    }

    async getStats() {
        const [properties, buildings, units] = await Promise.all([
            this.prisma.property.findMany({ select: { managementType: true, id: true, documents: { select: { kind: true } } } }),
            this.prisma.building.count(),
            this.prisma.unit.findMany({ select: { type: true, size: true, rooms: true } }),
        ]);

        const totalPortfolioSize = units.reduce((acc, u) => acc + Number(u.size), 0);
        const averageUnitSize = units.length > 0 ? totalPortfolioSize / units.length : 0;

        // Management Split
        const wegCount = properties.filter((p) => p.managementType === 'WEG').length;
        const mvCount = properties.filter((p) => p.managementType === 'MV').length;

        // Unit Type Split
        const unitTypeCounts = units.reduce((acc, unit) => {
            acc[unit.type] = (acc[unit.type] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return {
            totalProperties: properties.length,
            totalBuildings: buildings,
            totalUnits: units.length,
            managementSplit: [
                { type: 'WEG', count: wegCount },
                { type: 'MV', count: mvCount },
            ],
            unitTypeSplit: Object.entries(unitTypeCounts).map(([type, count]) => ({ type, count })),
            averageUnitSize: Math.round(averageUnitSize * 100) / 100,
            totalPortfolioSize: Math.round(totalPortfolioSize * 100) / 100,
        };
    }

    async generateAiSummary() {
        try {
            const stats = await this.getStats();

            const prompt = `
        You are an expert Real Estate Portfolio Manager. 
        Analyze the following portfolio statistics and write a concise, professional executive summary(2 - 3 paragraphs).
        Highlight the portfolio composition(Residential vs Commercial based on unit types), management structure, and any notable observations(e.g.average unit size).
        Use a professional, encouraging tone.
                IMPORTANT: Return ONLY plain text.Do not use Markdown, bolding, or bullet points.Use standard paragraph formatting.

                    Data:
        ${JSON.stringify(stats, null, 2)}
            `;

            const completion = await this.openai.chat.completions.create({
                messages: [{ role: 'user', content: prompt }],
                model: 'gpt-4o-mini',
            });

            return { summary: completion.choices[0].message.content };
        } catch (error) {
            console.error('AI Summary Error:', error);
            throw new InternalServerErrorException('Failed to generate AI summary');
        }
    }
}
