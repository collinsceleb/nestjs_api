import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto/auth.dto';
import * as argon2 from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}
  async signup(dto: AuthDto) {
    try {
      const hashedPassword = await argon2.hash(dto.password);
      const newUser = await this.prismaService.user.create({
        data: {
          password: hashedPassword,
          email: dto.email,
        },
      });
      return this.signToken(newUser.id, newUser.email);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Email has been used!');
        }
      }
      throw error;
    }
  }
  async signin(dto: AuthDto) {
    const existingUser = await this.prismaService.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    if (!existingUser) throw new ForbiddenException('Incorrect email');
    const comparePassword = await argon2.verify(
      existingUser.password,
      dto.password,
    );
    if (!comparePassword) {
      throw new ForbiddenException('Incorrect Password');
    }
    delete existingUser.password;
    return this.signToken(existingUser.id, existingUser.email);
  }
  async signToken(
    userId: number,
    email: string,
  ): Promise<{ access_token: string }> {
    const payload = {
      sub: userId,
      email,
    };
    const secret = this.config.get('JWT_SECRET');
    const token = await this.jwtService.signAsync(payload, {
      expiresIn: '15m',
      secret,
    });
    return {
      access_token: token,
    };
  }
}
