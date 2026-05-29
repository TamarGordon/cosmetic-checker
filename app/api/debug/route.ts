import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { type, args } = await req.json();
    
    const formattedMessage = Array.isArray(args) ? args.join(' ') : String(args);
    const timestamp = new Date().toLocaleTimeString();

    // Force output to Next.js server terminal logs so we see it on our end!
    if (type === 'error') {
      console.log(`\x1b[41m\x1b[37m[MOBILE ERROR] [${timestamp}]\x1b[0m ${formattedMessage}`);
    } else if (type === 'warn') {
      console.log(`\x1b[43m\x1b[30m[MOBILE WARN] [${timestamp}]\x1b[0m ${formattedMessage}`);
    } else {
      console.log(`\x1b[42m\x1b[30m[MOBILE LOG] [${timestamp}]\x1b[0m ${formattedMessage}`);
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 400 });
  }
}
