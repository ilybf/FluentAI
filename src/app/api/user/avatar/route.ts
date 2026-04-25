import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db/mongoose';
import { User } from '@/models/User';

// Max file size: 500KB (stored as base64 data URL in MongoDB)
const MAX_FILE_SIZE = 500 * 1024;

/**
 * POST /api/user/avatar
 * Accepts a base64-encoded image and stores it as the user's avatar.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { image } = await req.json();

    if (!image || typeof image !== 'string') {
      return NextResponse.json({ error: 'Image data is required' }, { status: 400 });
    }

    // Validate it's a data URL
    if (!image.startsWith('data:image/')) {
      return NextResponse.json({ error: 'Invalid image format' }, { status: 400 });
    }

    // Check size (base64 is ~33% larger than raw bytes)
    const base64Data = image.split(',')[1] || '';
    const sizeInBytes = Math.ceil(base64Data.length * 0.75);
    if (sizeInBytes > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `Image too large. Max size is ${Math.round(MAX_FILE_SIZE / 1024)}KB.` },
        { status: 400 }
      );
    }

    await dbConnect();

    await User.findByIdAndUpdate(session.user.id, { avatarUrl: image });

    return NextResponse.json({ message: 'Avatar updated', avatarUrl: image });
  } catch (error) {
    console.error('Avatar Upload Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
