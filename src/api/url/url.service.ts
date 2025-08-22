import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { UrlEntity } from './url.entity';
import { CreateUrlDto, UrlResponseDto, UpdateUrlDto } from './url.dto';

export interface AuthenticatedUser {
  id: number;
  email: string;
  name?: string;
}

@Injectable()
export class UrlService {
  constructor(
    @InjectRepository(UrlEntity)
    private readonly urlRepository: Repository<UrlEntity>,
    private readonly configService: ConfigService,
  ) {}

  async createShortUrl(createUrlDto: CreateUrlDto, user: AuthenticatedUser): Promise<UrlResponseDto> {
    const { originalUrl } = createUrlDto;

    // Check if URL already exists for this user
    const existingUrl = await this.urlRepository.findOne({
      where: { originalUrl, userId: user.id },
      relations: ['user']
    });

    if (existingUrl) {
      return this.mapToResponse(existingUrl);
    }

    // Generate unique slug
    const slug = await this.generateUniqueSlug();
    
    // Create new URL record
    const urlEntity = this.urlRepository.create({
      originalUrl,
      slug,
      clickCount: 0,
      userId: user.id,
    });

    const savedUrl = await this.urlRepository.save(urlEntity);
    
    // Fetch the saved URL with user relation
    const urlWithUser = await this.urlRepository.findOne({
      where: { id: savedUrl.id },
      relations: ['user']
    });


    return this.mapToResponse(urlWithUser!);
  }

  async createShortUrlPublic(createUrlDto: CreateUrlDto): Promise<UrlResponseDto> {
    const { originalUrl } = createUrlDto;

    // Check if URL already exists for this user
    const existingUrl = await this.urlRepository.findOne({
      where: { originalUrl }
    });

    if (existingUrl) {
      return this.mapToResponse(existingUrl);
    }

    // Generate unique slug
    const slug = await this.generateUniqueSlug();

    // Create new URL record
    const urlEntity = this.urlRepository.create({
      originalUrl,
      slug,
      clickCount: 0
    });

    const savedUrl = await this.urlRepository.save(urlEntity);
    
    // Fetch the saved URL with user relation
    const urlWithUser = await this.urlRepository.findOne({
      where: { id: savedUrl.id }
    });
    
    return this.mapToResponse(urlWithUser!);
  }

  async updateUrl(id: string, updateUrlDto: UpdateUrlDto, user: AuthenticatedUser): Promise<UrlResponseDto> {
    const { slug } = updateUrlDto;

    // Find the URL by slug and ensure it belongs to the user
    const urlEntity = await this.urlRepository.findOne({
      where: { id, userId: user.id },
      relations: ['user']
    });

    if (!urlEntity) {
      throw new NotFoundException('URL not found or you do not have permission to update it');
    }

    // Update the original URL
    urlEntity.slug = slug;
    
    const updatedUrl = await this.urlRepository.save(urlEntity);
    
    return this.mapToResponse(updatedUrl);
  }

  async getUserUrls(user: AuthenticatedUser): Promise<UrlResponseDto[]> {
    const urls = await this.urlRepository.find({
      where: { userId: user.id },
      relations: ['user'],
      order: { createdAt: 'DESC' }
    });

    return urls.map(url => this.mapToResponse(url));
  }

  async redirectToOriginalUrl(slug: string): Promise<string> {
    const urlEntity = await this.urlRepository.findOne({
      where: { slug }
    });

    if (!urlEntity) {
      throw new NotFoundException('URL not found');
    }

    // Increment click count
    await this.urlRepository.update(urlEntity.id, {
      clickCount: urlEntity.clickCount + 1
    });

    return urlEntity.originalUrl;
  }

  async getUrlBySlug(slug: string, user?: AuthenticatedUser): Promise<UrlResponseDto> {
    const whereCondition: any = { slug };
    
    // If user is provided, only return URLs belonging to that user
    if (user) {
      whereCondition.userId = user.id;
    }

    const urlEntity = await this.urlRepository.findOne({
      where: whereCondition,
      relations: ['user']
    });

    if (!urlEntity) {
      throw new NotFoundException('URL not found');
    }

    return this.mapToResponse(urlEntity);
  }

  private async generateUniqueSlug(): Promise<string> {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let slug: string;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isUnique && attempts < maxAttempts) {
      slug = '';
      for (let i = 0; i < 6; i++) {
        slug += chars.charAt(Math.floor(Math.random() * chars.length));
      }

      const existingUrl = await this.urlRepository.findOne({
        where: { slug }
      });

      if (!existingUrl) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      throw new BadRequestException('Unable to generate unique slug. Please try again.');
    }

    return slug;
  }

  private mapToResponse(urlEntity: UrlEntity): UrlResponseDto {
    const baseUrl = this.configService.get<string>('BE_BASE_URL') || 'http://localhost:3001';

    return {
      id: urlEntity.id,
      originalUrl: urlEntity.originalUrl,
      shortUrl: `${baseUrl}/${urlEntity.slug}`,
      slug: urlEntity.slug,
      clickCount: urlEntity.clickCount,
      createdAt: urlEntity.createdAt,
    };
  }
}
