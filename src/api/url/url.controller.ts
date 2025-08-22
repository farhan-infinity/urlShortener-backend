import { Controller, Post, Put, Get, Param, Body, Res, HttpStatus, HttpException, UseGuards, Request } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { UrlService, AuthenticatedUser } from './url.service';
import { CreateUrlDto, UrlResponseDto, UpdateUrlDto } from './url.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

@ApiTags('URL Shortener')
@Controller()
export class UrlController {
  constructor(private readonly urlService: UrlService) {}

  @UseGuards(JwtAuthGuard)
  @Post('shorten')
  // @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a shortened URL (Authentication required)' })
  @ApiBody({ type: CreateUrlDto })
  @ApiResponse({
    status: 201,
    description: 'URL successfully shortened',
    type: UrlResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid URL provided',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Authentication required',
  })
  async createShortUrl(
    @Body() createUrlDto: CreateUrlDto,
    @Request() req: AuthenticatedRequest
  ): Promise<UrlResponseDto> {
    return await this.urlService.createShortUrl(createUrlDto, req.user);
  }

  @Post('shorten/public')
  // @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a shortened URL (Authentication not required)' })
  @ApiBody({ type: CreateUrlDto })
  @ApiResponse({
    status: 201,
    description: 'URL successfully shortened',
    type: UrlResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid URL provided',
  })
  async createShortUrlPublic(
    @Body() createUrlDto: CreateUrlDto,
    @Request() req: AuthenticatedRequest
  ): Promise<UrlResponseDto> {
    return await this.urlService.createShortUrlPublic(createUrlDto);
  }

  @UseGuards(JwtAuthGuard)
  @Put('urls/:slug')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update URL by slug (Authentication required)' })
  @ApiParam({ name: 'slug', description: 'The URL slug to update' })
  @ApiBody({ type: UpdateUrlDto })
  @ApiResponse({
    status: 200,
    description: 'URL successfully updated',
    type: UrlResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'URL not found or you do not have permission to update it',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Authentication required',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid URL provided',
  })
  async updateUrl(
    @Param('slug') slug: string,
    @Body() updateUrlDto: UpdateUrlDto,
    @Request() req: AuthenticatedRequest
  ): Promise<UrlResponseDto> {
    return await this.urlService.updateUrl(slug, updateUrlDto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('urls')
  // @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user\'s shortened URLs (Authentication required)' })
  @ApiResponse({
    status: 200,
    description: 'List of user\'s shortened URLs',
    type: [UrlResponseDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Authentication required',
  })
  async getUserUrls(@Request() req: AuthenticatedRequest): Promise<UrlResponseDto[]> {
    return await this.urlService.getUserUrls(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('urls/:slug')
  // @ApiBearerAuth()
  @ApiOperation({ summary: 'Get URL details by slug (Authentication required)' })
  @ApiParam({ name: 'slug', description: 'The URL slug' })
  @ApiResponse({
    status: 200,
    description: 'URL details retrieved successfully',
    type: UrlResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'URL not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Authentication required',
  })
  async getUrlBySlug(
    @Param('slug') slug: string,
    @Request() req: AuthenticatedRequest
  ): Promise<UrlResponseDto> {
    return await this.urlService.getUrlBySlug(slug, req.user);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Redirect to original URL' })
  @ApiParam({ name: 'slug', description: 'The URL slug to redirect' })
  @ApiResponse({
    status: 302,
    description: 'Redirect to original URL',
  })
  @ApiResponse({
    status: 404,
    description: 'URL not found',
  })
  async redirectToOriginalUrl(
    @Param('slug') slug: string,
    @Res() res: Response
  ): Promise<void> {
    try {
      const originalUrl = await this.urlService.redirectToOriginalUrl(slug);
      res.redirect(302, originalUrl);
    } catch (error) {
      if (error instanceof HttpException) {
        if (error.getStatus() === 404) {
          res.status(HttpStatus.NOT_FOUND).json({
            statusCode: 404,
            message: 'URL not found',
            error: 'Not Found'
          });
          return;
        }
      }
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: 500,
        message: 'Internal server error',
        error: 'Internal Server Error'
      });
    }
  }
}
