import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/password';

export async function POST() {
  try {
    // Check if admin already exists
    const existingAdmin = await db.superAdmin.findUnique({
      where: { username: 'admin' },
    });

    if (existingAdmin) {
      return NextResponse.json({ message: 'Admin already exists', username: 'admin' });
    }

    // Create admin
    const hashedPassword = await hashPassword('admin123');
    const admin = await db.superAdmin.create({
      data: {
        username: 'admin',
        password: hashedPassword,
        email: 'admin@iptv.local',
      },
    });

    return NextResponse.json({
      message: 'Admin created successfully',
      username: admin.username,
      defaultPassword: 'admin123',
      warning: 'Please change the password after first login!',
    });
  } catch (error) {
    console.error('Error creating admin:', error);
    return NextResponse.json({ error: 'Failed to create admin' }, { status: 500 });
  }
}
