import { IsOptional, IsString, IsArray, IsEnum, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(500)
  bio?: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  nationality?: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  supportedTeam?: string;

  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray()
  languages?: string[];

  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray()
  interests?: string[];

  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray()
  visitingCities?: string[];

  @ApiPropertyOptional() @IsOptional() @IsString()
  ageRange?: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  travelDatesStart?: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  travelDatesEnd?: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  instagram?: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  twitter?: string;
}
