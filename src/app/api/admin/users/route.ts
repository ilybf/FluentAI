import { NextResponse, NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/guards';
import dbConnect from '@/lib/db/mongoose';
import { User } from '@/models/User';

/**
 * GET /api/admin/users — List all users with full details.
 */
export async function GET() {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  try {
    await dbConnect();
    const users = await User.find()
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(users.map((u: any) => ({
      id: u._id.toString(),
      email: u.email,
      displayName: u.displayName,
      role: u.role || 'student',
      level: u.level,
      registrationLevel: u.registrationLevel || u.level,
      totalScore: u.totalScore || 0,
      nativeLanguage: u.nativeLanguage,
      avatarUrl: u.avatarUrl,
      bio: u.bio,
      streak: u.streak || { current: 0, longest: 0 },
      classroomId: u.classroomId?.toString() || null,
      createdAt: u.createdAt,
    })));
  } catch (error) {
    console.error('Admin Users GET:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * POST /api/admin/users — Create a new user (student/teacher/admin).
 */
export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  try {
    const { email, password, displayName, role, level } = await req.json();
    if (!email || !password || !displayName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await dbConnect();

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }

    const bcrypt = await import('bcryptjs');
    const passwordHash = await bcrypt.default.hash(password, 10);

    const userLevel = level || 'A1';

    const newUser = await User.create({
      email: email.toLowerCase(),
      passwordHash,
      displayName,
      role: role || 'student',
      level: userLevel,
      registrationLevel: userLevel,
      nativeLanguage: 'English',
    });

    return NextResponse.json(
      { message: 'User created successfully', userId: newUser._id },
      { status: 201 }
    );
  } catch (error) {
    console.error('Admin Users POST:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * PUT /api/admin/users — Edit any user field.
 */
export async function PUT(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  try {
    const { userId, ...updates } = await req.json();
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

    await dbConnect();

    const allowedFields = ['displayName', 'email', 'role', 'level', 'registrationLevel', 'nativeLanguage', 'totalScore', 'bio', 'avatarUrl'];
    const updateData: Record<string, any> = {};
    for (const key of allowedFields) {
      if (updates[key] !== undefined) {
        updateData[key] = updates[key];
      }
    }

    const updated = await User.findByIdAndUpdate(userId, updateData, { new: true })
      .select('-passwordHash')
      .lean();

    if (!updated) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    return NextResponse.json({ message: 'User updated', user: updated });
  } catch (error) {
    console.error('Admin Users PUT:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/users?id=xxx — Delete a user.
 */
export async function DELETE(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  try {
    const userId = new URL(req.url).searchParams.get('id');
    if (!userId) return NextResponse.json({ error: 'User ID required' }, { status: 400 });

    // Prevent self-deletion
    if (userId === auth.session.user.id) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
    }

    await dbConnect();
    const deleted = await User.findByIdAndDelete(userId);
    if (!deleted) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    return NextResponse.json({ message: 'User deleted' });
  } catch (error) {
    console.error('Admin Users DELETE:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
