import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto/auth.dto';
import * as argon2 from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class AuthService {
  constructor(private prismaService: PrismaService) {}
  async signup(dto: AuthDto) {
    try {
      const hashedPassword = await argon2.hash(dto.password);
      const newUser = await this.prismaService.user.create({
        data: {
          password: hashedPassword,
          email: dto.email,
        },
      });
      delete newUser.password;
      return newUser;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Email has been used!');
        }
      }
      throw error;
    }
  }
  signin() {
    return {
      msg: 'I have signed in.',
    };
  }
}
