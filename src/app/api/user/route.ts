import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db/mongoose';
import { User } from '@/models/User';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    // .lean() returns a plain JS object — avoids Mongoose document overhead
    const user = await User.findById(session.user.id).select('-passwordHash').lean();
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { displayName, nativeLanguage, bio, avatarUrl } = await req.json();

    await dbConnect();

    const updateData: Record<string, any> = {};
    if (displayName !== undefined) updateData.displayName = displayName;
    if (nativeLanguage !== undefined) updateData.nativeLanguage = nativeLanguage;
    if (bio !== undefined) updateData.bio = String(bio).slice(0, 300);
    if (avatarUrl !== undefined) {
      // Data URLs (uploaded images) can be large; emoji avatars are short
      if (String(avatarUrl).startsWith('data:image/')) {
        updateData.avatarUrl = String(avatarUrl); // Already size-validated by /api/user/avatar
      } else {
        updateData.avatarUrl = String(avatarUrl).slice(0, 200);
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      updateData,
      { new: true }
    ).select('-passwordHash').lean();

    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
