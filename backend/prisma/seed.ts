import { PrismaClient, UserRole, UserStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // 1. Tạo tài khoản Admin
  const adminEmail = 'admin@gmail.com';
  const hashedAdminPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: hashedAdminPassword,
      role: UserRole.ADMIN,
      emailVerifiedAt: new Date(),
      status: UserStatus.ACTIVE,
    },
    create: {
      fullName: 'Seoul Blanc Admin',
      email: adminEmail,
      password: hashedAdminPassword,
      role: UserRole.ADMIN,
      emailVerifiedAt: new Date(),
      status: UserStatus.ACTIVE,
      gender: 'OTHER',
    },
  });
  console.log('Admin user created/updated:', admin.email);

  // 2. Tạo tài khoản User thường
  const userEmail = 'user@gmail.com';
  const hashedUserPassword = await bcrypt.hash('user123', 10);

  const user = await prisma.user.upsert({
    where: { email: userEmail },
    update: {
      password: hashedUserPassword,
      role: UserRole.USER,
      emailVerifiedAt: new Date(),
      status: UserStatus.ACTIVE,
    },
    create: {
      fullName: 'Seoul Blanc User',
      email: userEmail,
      password: hashedUserPassword,
      role: UserRole.USER,
      emailVerifiedAt: new Date(),
      status: UserStatus.ACTIVE,
      gender: 'OTHER',
    },
  });
  console.log('Client/User user created/updated:', user.email);

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
