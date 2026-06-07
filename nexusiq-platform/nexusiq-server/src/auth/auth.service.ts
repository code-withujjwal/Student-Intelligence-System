import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { RegisterDto, LoginDto } from './dto/auth.dto';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  private issueTokens(userId: string, email: string, role: string): TokenPair {
    const payload = { sub: userId, email, role };
    const accessToken = this.jwt.sign(payload, {
      expiresIn: '15m',
      secret: process.env.JWT_SECRET,
    });
    const refreshToken = this.jwt.sign(payload, {
      expiresIn: '30d',
      secret: process.env.JWT_REFRESH_SECRET ?? `${process.env.JWT_SECRET}_refresh`,
    });
    return { accessToken, refreshToken };
  }

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already registered');

    const hash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        passwordHash: hash,
        role: (dto.role as any) ?? 'STUDENT',
        institution: dto.institution,
        profile: { create: {} },
        streak: { create: {} },
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        institution: true,
        createdAt: true,
      },
    });

    this.logger.log(`New user registered: ${user.email} [${user.role}]`);
    const tokens = this.issueTokens(user.id, user.email, user.role);
    return { user, ...tokens };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    await this.prisma.streak.upsert({
      where: { userId: user.id },
      create: { userId: user.id, current: 1, lastActiveAt: new Date() },
      update: { lastActiveAt: new Date() },
    });

    const tokens = this.issueTokens(user.id, user.email, user.role);
    return {
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      ...tokens,
    };
  }

  async refreshTokens(token: string) {
    try {
      const payload = this.jwt.verify<{ sub: string; email: string; role: string }>(token, {
        secret: process.env.JWT_REFRESH_SECRET ?? `${process.env.JWT_SECRET}_refresh`,
      });
      const tokens = this.issueTokens(payload.sub, payload.email, payload.role);
      return tokens;
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatarUrl: true,
        institution: true,
        createdAt: true,
        profile: { select: { xp: true, level: true, bio: true, targetExam: true, subjects: true } },
        streak: { select: { current: true, longest: true, lastActiveAt: true } },
        achievements: {
          include: { achievement: { select: { key: true, title: true, iconUrl: true, rarity: true } } },
          take: 10,
          orderBy: { unlockedAt: 'desc' },
        },
      },
    });
    return user;
  }
}
