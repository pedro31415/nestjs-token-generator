import { Injectable, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { User } from './models/users.model';
import { AuthService } from 'src/auth/auth.service';
import { InjectModel } from '@nestjs/mongoose';
import { SignupDto } from './dto/signup.dto';
import { SigninpDto } from './dto/signin.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel('User')
    private readonly userModel: Model<User>,
    private readonly authService: AuthService,
  ) {}

  public async signup(signupDto: SignupDto): Promise<User> {
    const user = new this.userModel(signupDto);
    return user.save();
  }

  public async signin(
    signinDto: SigninpDto,
  ): Promise<{ name: string; jwtToken: string; email: string }> {
    const user = await this.findByEmail(signinDto.email);
    const match = await this.checkPassword(signinDto.password, user);
    if (!match) {
      throw new NotFoundException('Invalid credentials');
    }

    const jwtToken = await this.authService.createAcessToken(user._id);

    return { name: user.name, jwtToken, email: user.email };
  }

  public async findAll(): Promise<User[]> {
    return this.userModel.find();
  }

  private async findByEmail(email: string): Promise<User> {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new NotFoundException('Email not found');
    }

    return user;
  }

  private async checkPassword(password: string, user: User): Promise<boolean> {
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      throw new NotFoundException('password not found');
    }

    return match;
  }
}
