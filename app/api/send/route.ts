import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const secret = process.env.ADVISOR_SECRET;

export async function POST(req: Request) {
    console.log("API Send");
    try {
        const body = await req.json();
        const { advisorEmail } = body;
        if (!advisorEmail) {
            return Response.json({ error: "Missing email" }, { status: 400 });
        }

        const { data, error } = await resend.emails.send({
            from: 'Thesis Management <onboarding@resend.dev>',
            to: [advisorEmail],
            subject: 'Secret Code',
            html: `
                <div>
                    <h1>Your secret code: ${secret}</h1>
                </div>
            `,
        });

        if (error) {
            return Response.json({ error }, { status: 501 });
        }

        return Response.json({ success: true, data });
    } catch (error) {
        return Response.json({ error }, { status: 500 });
    }
}