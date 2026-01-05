import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';

export interface PropertyCreatedEmailData {
    propertyName: string;
    propertyNumber: string;
    unitCount: number;
    buildingCount: number;
    recipient: string;
}

@Injectable()
export class EmailService {
    private readonly logger = new Logger(EmailService.name);
    private resend: Resend | null = null;

    constructor() {
        const apiKey = process.env.RESEND_API_KEY;
        if (apiKey) {
            this.resend = new Resend(apiKey);
            this.logger.log('✉️ Email service initialized with Resend');
        } else {
            this.logger.warn('⚠️ RESEND_API_KEY not configured - emails will be logged only');
        }
    }

    async sendPropertyCreatedNotification(data: PropertyCreatedEmailData): Promise<void> {
        const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: system-ui, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
            .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
            .stats { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .stat { display: inline-block; margin-right: 30px; }
            .stat-label { font-size: 0.875rem; color: #6b7280; }
            .stat-value { font-size: 1.5rem; font-weight: 700; color: #4f46e5; }
            .footer { text-align: center; color: #6b7280; font-size: 0.875rem; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">🏢 New Property Created!</h1>
            </div>
            <div class="content">
              <p>Great news! A new property has been successfully added to your Buena portfolio.</p>
              
              <div class="stats">
                <div class="stat">
                  <div class="stat-label">Property Name</div>
                  <div class="stat-value">${data.propertyName}</div>
                </div>
                <div class="stat">
                  <div class="stat-label">Property Number</div>
                  <div class="stat-value">${data.propertyNumber}</div>
                </div>
                <div class="stat">
                  <div class="stat-label">Buildings</div>
                  <div class="stat-value">${data.buildingCount}</div>
                </div>
                <div class="stat">
                  <div class="stat-label">Units</div>
                  <div class="stat-value">${data.unitCount}</div>
                </div>
              </div>
              
              <p>You can now:</p>
              <ul>
                <li>View detailed property information</li>
                <li>Add tenants and lease agreements</li>
                <li>Track maintenance and expenses</li>
                <li>Generate reports and analytics</li>
              </ul>
              
              <p style="margin-top: 30px;">
                <a href="http://localhost:3000/properties/${data.propertyNumber}" 
                   style="background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  View Property
                </a>
              </p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Buena Platform. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

        if (this.resend) {
            try {
                await this.resend.emails.send({
                    from: 'Buena Platform <notifications@resend.dev>', // Use your verified domain
                    to: data.recipient,
                    subject: `🏢 New Property Created: ${data.propertyName}`,
                    html: emailHtml,
                });
                this.logger.log(`✅ Email sent to ${data.recipient} for property ${data.propertyName}`);
            } catch (error) {
                this.logger.error(`❌ Failed to send email: ${error.message}`);
                // Don't throw - email failures shouldn't break the app
            }
        } else {
            // Log-only mode
            this.logger.log(`
📧 [EMAIL NOTIFICATION] Property Created
To: ${data.recipient}
Property: ${data.propertyName} (${data.propertyNumber})
Buildings: ${data.buildingCount} | Units: ${data.unitCount}
      `);
        }
    }

    async sendWelcomeEmail(recipientEmail: string, userName: string): Promise<void> {
        const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: system-ui, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }            .header { background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%); color: white; padding: 40px; border-radius: 8px 8px 0 0; text-align: center; }
            .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
            .cta { text-align: center; margin: 30px 0; }
            .button { background: #4f46e5; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; }
            .footer { text-align: center; color: #6b7280; font-size: 0.875rem; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 2rem;">Welcome to Buena!  🎉</h1>
            </div>
            <div class="content">
              <p>Hi ${userName},</p>
              
              <p>Welcome to <strong>Buena Platform</strong> - your comprehensive real estate portfolio management solution!</p>
              
              <p>With Buena, you can:</p>
              <ul>
                <li>✨ <strong>AI-Powered Extraction:</strong> Upload PDFs and automatically extract property data</li>
                <li>📊 <strong>Portfolio Analytics:</strong> Track performance across all your properties</li>
                <li>🏢 <strong>Property Management:</strong> Manage buildings, units, and tenants in one place</li>
                <li>📈 <strong>Smart Reports:</strong> Generate insights with one click</li>
              </ul>
              
              <div class="cta">
                <a href="http://localhost:3000/create" class="button">Create Your First Property</a>
              </div>
              
              <p>Need help getting started? Check out our <a href="#">Quick Start Guide</a> or contact support anytime.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Buena Platform. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

        if (this.resend) {
            try {
                await this.resend.emails.send({
                    from: 'Buena Platform <onboarding@resend.dev>',
                    to: recipientEmail,
                    subject: '🎉 Welcome to Buena Platform!',
                    html: emailHtml,
                });
                this.logger.log(`✅ Welcome email sent to ${recipientEmail}`);
            } catch (error) {
                this.logger.error(`❌ Failed to send welcome email: ${error.message}`);
            }
        } else {
            this.logger.log(`📧 [WELCOME EMAIL] To: ${recipientEmail}, User: ${userName}`);
        }
    }
}
