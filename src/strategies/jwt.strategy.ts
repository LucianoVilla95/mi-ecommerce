import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
// import { UserService } from '../users/users.service';
import { JwtPayload } from '../users/interfaces/jwtPayload.interface'; 

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    // const user = await this.usersService.findOne(payload.sub);
    // Usuario eliminado
    // if (!user) {
    //   throw new UnauthorizedException('User no longer exists');
    // }

    // Usuario bloqueado
    // if (!user.isActive) {
    //   throw new UnauthorizedException('User is blocked');
    // }

    // Permisos cambiados (ejemplo)
    // if (user.role === 'suspended') {
    //   throw new UnauthorizedException('User permissions revoked');
    // }
    
    return payload;
  }
}