import { IsEmail, IsOptional, IsString, IsIn } from 'class-validator';

export class TenantInviteDto {
  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  @IsIn(['admin', 'member', 'viewer'])
  role?: string;
}
