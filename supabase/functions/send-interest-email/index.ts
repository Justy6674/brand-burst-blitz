import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InterestFormData {
  name: string;
  email: string;
  businessName: string;
  industry: string;
  isAustralian: boolean;
  currentChallenges: string[];
  monthlyMarketingSpend: string;
  teamSize: string;
  primaryGoals: string[];
  wantsUpdates: boolean;
  heardAboutUs: string;
  additionalNotes?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData: InterestFormData = await req.json();

    // Create formatted email content
    const emailContent = `
      <h2>🎯 New Interest Registration - JB-SaaS AI Platform</h2>
      
      <h3>📋 Contact Information</h3>
      <ul>
        <li><strong>Name:</strong> ${formData.name}</li>
        <li><strong>Email:</strong> ${formData.email}</li>
        <li><strong>Business Name:</strong> ${formData.businessName}</li>
        <li><strong>Industry:</strong> ${formData.industry}</li>
        <li><strong>Australian Business:</strong> ${formData.isAustralian ? '✅ Yes' : '❌ No'}</li>
      </ul>

      <h3>💼 Business Details</h3>
      <ul>
        <li><strong>Team Size:</strong> ${formData.teamSize}</li>
        <li><strong>Monthly Marketing Spend:</strong> ${formData.monthlyMarketingSpend}</li>
      </ul>

      <h3>🎯 Current Challenges</h3>
      <ul>
        ${formData.currentChallenges.map(challenge => `<li>${challenge}</li>`).join('')}
      </ul>

      <h3>🚀 Primary Goals</h3>
      <ul>
        ${formData.primaryGoals.map(goal => `<li>${goal}</li>`).join('')}
      </ul>

      <h3>📢 Marketing & Updates</h3>
      <ul>
        <li><strong>Wants Updates:</strong> ${formData.wantsUpdates ? '✅ Yes' : '❌ No'}</li>
        <li><strong>Heard About Us:</strong> ${formData.heardAboutUs}</li>
      </ul>

      ${formData.additionalNotes ? `
      <h3>💭 Additional Notes</h3>
      <p>${formData.additionalNotes}</p>
      ` : ''}

      <hr style="margin: 20px 0;">
      <p><em>Registered at: ${new Date().toLocaleString('en-AU', { timeZone: 'Australia/Sydney' })}</em></p>
    `;

    // Send email to business
    const emailResponse = await resend.emails.send({
      from: "JB-SaaS Interest <noreply@jbsaas.com.au>",
      to: ["jbsaasai@gmail.com"],
      subject: `🎯 New Interest Registration - ${formData.businessName} (${formData.industry})`,
      html: emailContent,
    });

    // Send confirmation email to user if they want updates
    if (formData.wantsUpdates) {
      await resend.emails.send({
        from: "JB-SaaS <noreply@jbsaas.com.au>",
        to: [formData.email],
        subject: "Thanks for your interest in JB-SaaS AI Platform!",
        html: `
          <h2>G'day ${formData.name}! 👋</h2>
          
          <p>Thanks for registering your interest in JB-SaaS - Australia's premier AI-powered marketing content platform!</p>
          
          <h3>🗓️ What's Next?</h3>
          <ul>
            <li><strong>Launch Date:</strong> August 2025</li>
            <li><strong>Early Access:</strong> Priority access for Australian businesses</li>
            <li><strong>Updates:</strong> We'll keep you informed on our progress</li>
          </ul>

          <h3>🇦🇺 Built for Australian Businesses</h3>
          <p>We understand the unique challenges Australian businesses face with marketing and content creation. That's why we're building something specifically for our market.</p>

          <h3>📧 Stay Connected</h3>
          <p>We'll send you periodic updates about our development progress, early access opportunities, and launch details.</p>

          <p>Cheers!<br>The JB-SaaS Team</p>
          
          <hr>
          <p><small>This email was sent because you registered interest at jbsaas.com.au and opted in for updates.</small></p>
        `,
      });
    }

    console.log("Interest registration email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-interest-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);