const nodemailer = require('nodemailer');

// Email service configuration
class EmailService {
    constructor() {
        // Configure the transporter
        // For development, you can use Gmail or other email services
        // For production, use a proper email service like SendGrid, AWS SES, etc.
        this.transporter = nodemailer.createTransport({
            service: 'gmail', // You can change this to your preferred email service
            auth: {
                user: process.env.EMAIL_USER, // Your email address
                pass: process.env.EMAIL_PASSWORD // Your email password or app password
            }
        });

        // Alternative configuration for other email services
        // this.transporter = nodemailer.createTransport({
        //     host: process.env.SMTP_HOST,
        //     port: process.env.SMTP_PORT,
        //     secure: false, // true for 465, false for other ports
        //     auth: {
        //         user: process.env.EMAIL_USER,
        //         pass: process.env.EMAIL_PASSWORD
        //     }
        // });
    }

    async sendPasswordResetEmail(email, resetToken) {
        try {
            const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
            
            const mailOptions = {
                from: process.env.EMAIL_USER || 'noreply@docuverify.com',
                to: email,
                subject: 'Password Reset Request - DocuVerify',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center;">
                            <h1 style="color: white; margin: 0;">DocuVerify</h1>
                            <p style="color: white; margin: 10px 0;">Password Reset Request</p>
                        </div>
                        
                        <div style="padding: 30px; background: #f8f9fa; border-radius: 10px; margin-top: 20px;">
                            <h2 style="color: #333; margin-bottom: 20px;">Reset Your Password</h2>
                            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                                We received a request to reset your password. Click the button below to create a new password:
                            </p>
                            
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="${resetUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
                                    Reset Password
                                </a>
                            </div>
                            
                            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                                Or copy and paste this link into your browser:
                            </p>
                            <p style="color: #007bff; word-break: break-all; background: #e9ecef; padding: 10px; border-radius: 5px;">
                                ${resetUrl}
                            </p>
                            
                            <hr style="margin: 30px 0; border: none; border-top: 1px solid #dee2e6;">
                            
                            <p style="color: #666; font-size: 14px; margin-bottom: 10px;">
                                This link will expire in 1 hour for security reasons.
                            </p>
                            <p style="color: #666; font-size: 14px;">
                                If you didn't request this password reset, please ignore this email.
                            </p>
                        </div>
                        
                        <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
                            <p>© 2025 DocuVerify. All rights reserved.</p>
                        </div>
                    </div>
                `
            };

            const info = await this.transporter.sendMail(mailOptions);
            console.log('Password reset email sent successfully:', info.messageId);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('Error sending password reset email:', error);
            throw new Error('Failed to send password reset email');
        }
    }

    async sendWelcomeEmail(email, username) {
        try {
            const mailOptions = {
                from: process.env.EMAIL_USER || 'noreply@docuverify.com',
                to: email,
                subject: 'Welcome to DocuVerify!',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center;">
                            <h1 style="color: white; margin: 0;">Welcome to DocuVerify!</h1>
                        </div>
                        
                        <div style="padding: 30px; background: #f8f9fa; border-radius: 10px; margin-top: 20px;">
                            <h2 style="color: #333; margin-bottom: 20px;">Hello ${username}!</h2>
                            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                                Thank you for joining DocuVerify! Your account has been created successfully.
                            </p>
                            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                                You can now start verifying your documents with our secure and reliable platform.
                            </p>
                            
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/login" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
                                    Login to Your Account
                                </a>
                            </div>
                        </div>
                        
                        <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
                            <p>© 2025 DocuVerify. All rights reserved.</p>
                        </div>
                    </div>
                `
            };

            const info = await this.transporter.sendMail(mailOptions);
            console.log('Welcome email sent successfully:', info.messageId);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('Error sending welcome email:', error);
            throw new Error('Failed to send welcome email');
        }
    }

    // Test email connection
    async testConnection() {
        try {
            await this.transporter.verify();
            console.log('Email service is ready');
            return true;
        } catch (error) {
            console.error('Email service configuration error:', error);
            return false;
        }
    }
}

module.exports = new EmailService();
