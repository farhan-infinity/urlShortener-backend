import { IsUrl, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUrlDto {
  @ApiProperty({
    description: 'The original URL to be shortened',
    example: 'https://some.place.example.com/foo/bar/biz'
  })
  @IsNotEmpty()
  @IsUrl({}, { message: 'Please provide a valid URL' })
  originalUrl: string;
}

export class UrlResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the URL record',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  id: string;

  @ApiProperty({
    description: 'The original URL',
    example: 'https://some.place.example.com/foo/bar/biz'
  })
  originalUrl: string;

  @ApiProperty({
    description: 'The shortened URL',
    example: 'http://localhost:3001/abc123'
  })
  shortUrl: string;

  @ApiProperty({
    description: 'The unique slug for the URL',
    example: 'abc123'
  })
  slug: string;

  @ApiProperty({
    description: 'Number of times the URL has been accessed',
    example: 5
  })
  clickCount: number;

  @ApiProperty({
    description: 'Date when the URL was created'
  })
  createdAt: Date;
}

export class UpdateUrlDto {
  @ApiProperty({
    description: 'The new original URL to be shortened',
    example: 'https://updated.example.com/new/path'
  })
   @IsNotEmpty()
  @IsString()
  slug: string;
}

export class RedirectDto {
  @ApiProperty({
    description: 'The slug to redirect',
    example: 'abc123'
  })
  @IsNotEmpty()
  @IsString()
  slug: string;
}
