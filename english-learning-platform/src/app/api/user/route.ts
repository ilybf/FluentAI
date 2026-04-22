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
    const user = await User.findById(session.user.id).select('-passwordHash');
    
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

    const { displayName, nativeLanguage } = await req.json();

    await dbConnect();
    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      { displayName, nativeLanguage },
      { new: true }
    ).select('-passwordHash');

    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
