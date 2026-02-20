import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from './entities';

async function bootstrap() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.log('Usage: npx ts-node src/create-admin.ts <email> <password> [firstName] [lastName]');
    console.log('Example: npx ts-node src/create-admin.ts admin@company.com SecurePass123! John Admin');
    process.exit(1);
  }

  const [email, password, firstName, lastName] = args;

  const app = await NestFactory.createApplicationContext(AppModule);
  const usersRepo = app.get<Repository<User>>(getRepositoryToken(User));

  const existing = await usersRepo.findOne({ where: { email } });
  if (existing) {
    console.error(`User with email "${email}" already exists (role: ${existing.role})`);
    if (existing.role !== UserRole.ADMIN) {
      existing.role = UserRole.ADMIN;
      await usersRepo.save(existing);
      console.log(`Upgraded "${email}" to admin role.`);
    }
    await app.close();
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = usersRepo.create({
    email,
    passwordHash,
    firstName: firstName || 'Admin',
    lastName: lastName || 'User',
    role: UserRole.ADMIN,
    isVerified: true,
  });

  const saved = await usersRepo.save(user);
  console.log(`Admin created successfully!`);
  console.log(`  ID:    ${saved.id}`);
  console.log(`  Email: ${saved.email}`);
  console.log(`  Name:  ${saved.firstName} ${saved.lastName}`);
  console.log(`  Role:  ${saved.role}`);

  await app.close();
}

bootstrap();
