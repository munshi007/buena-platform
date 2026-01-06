import { Injectable, BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
const pdf = require('pdf-parse');
import OpenAI from 'openai';

@Injectable()
export class ExtractionService {
    private openai: OpenAI;

    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
    }

    async extractUnitsFromPdf(filename: string) {
        // Potential paths to check
        const candidates = [
            path.join(process.cwd(), 'uploads', filename),
            path.join(process.cwd(), '..', '..', 'uploads', filename), 
            path.join(__dirname, '..', '..', '..', 'uploads', filename), 
            path.resolve('./uploads', filename)
        ];

        let filePath = '';
        for (const p of candidates) {
            if (fs.existsSync(p)) {
                filePath = p;
                break;
            }
        }

        if (!filePath) {
            throw new BadRequestException(`File not found. Searched in: ${candidates.join(', ')}`);
        }

        const dataBuffer = fs.readFileSync(filePath);

        try {
            // 1. Extract Text
            const data = await pdf(dataBuffer);
            const text = data.text.substring(0, 15000);
            console.log('Extracted Text Length:', text.length);

            // 2. AI Parsing - Enhanced for German Format
            const completion = await this.openai.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: `You are an expert data extraction assistant for German Real Estate 'Teilungserklärung' documents. 
                        Your goal is to extract:
                        1. The Property Address (Street, Number, Zip, City)
                        2. The list of units (Wohnungen/Teileigentum)

                        Return a JSON object with this structure:
                        {
                            "address": "extracted address string or null",
                            "units": [ ... list of units ... ]
                        }
                        
                        Look for a table or list defining the "Sondereigentum" or "Aufteilungsplan" for the units.
                        Typically formatted as: Unit No. | Location | Size | Shares | Rooms.

                        Schema per unit:
                        {
                            "number": string (e.g. "1", "WE1", "1. OG rechts"),
                            "type": "APARTMENT" | "OFFICE" | "GARDEN" | "PARKING",
                            "floor": string (e.g. "KG", "EG", "1. OG"),
                            "entrance": string,
                            "size": number (in sqm, e.g. 80.50),
                            "coOwnershipShare": number (e.g. 55.20),
                            "rooms": number
                        }
                        
                        Rules:
                        1. Map "Wohnung" -> APARTMENT
                        2. Map "Büro"/"Gewerbe"/"Laden" -> OFFICE
                        3. Map "Stellplatz"/"Garage"/"Tiefgarage" -> PARKING
                        4. If a value is missing, use 0 or empty string.
                        5. Try to extract ALL units found in the list.
                        `
                    },
                    { role: "user", content: text }
                ],
                model: "gpt-4-turbo-preview",
                response_format: { type: "json_object" },
            });

            const content = completion.choices[0].message.content;
            console.log('AI Content Length:', content?.length);

            if (!content) {
                console.error('AI returned empty content');
                return [];
            }

            const cleaned = content.replace(/```json/g, '').replace(/```/g, '').trim();
            console.log('AI Response (First 500 chars):', cleaned.substring(0, 500));

            if (!cleaned) {
                console.error('AI returned empty string after cleanup');
                return [];
            }

            let parsed;
            try {
                parsed = JSON.parse(cleaned);
            } catch (jsonErr) {
                console.error('JSON Parse Error:', jsonErr);
                throw new BadRequestException('Failed to parse AI response');
            }

            let units: any[] = [];
            if (Array.isArray(parsed)) {
                units = parsed;
            } else if (parsed.units && Array.isArray(parsed.units)) {
                units = parsed.units;
            } else if (typeof parsed === 'object' && parsed !== null) {
                // Fallback 1: search for any array in the object
                const potentialArray = Object.values(parsed).find(val => Array.isArray(val));
                if (potentialArray) {
                    units = potentialArray as any[];
                }
                // Fallback 2: Check if the object itself is a single unit (has 'number' and 'type')
                else if (parsed.number && parsed.type) {
                    units = [parsed];
                }
            }

            return units;

        } catch (error) {
            if (error instanceof OpenAI.APIError) {
                // @ts-ignore
                console.error(error.message);
            }
            throw new BadRequestException(`Extraction failed: ${error.message}`);
        }
    }
}
