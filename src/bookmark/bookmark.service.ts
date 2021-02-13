import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import DomParser from 'dom-parser';
import Crawler from 'js-crawler';
import { v2 as cloudinary } from 'cloudinary';
import { User } from '../user/user.entity';
import { Bookmark } from './bookmark.entity';
import { CreateBookmarkDto } from './dto/create-bookmark.dto';
import { takeShot } from '../common/quickshot';

function removeSpecialsChars(str: string): string {
  const lower = str.toLowerCase();
  const upper = str.toUpperCase();
  let res = '';
  for (let i = 0; i < lower.length; ++i) {
    if (lower[i] != upper[i] || lower[i].trim() === '') {
      res += str[i];
    }
  }
  return res;
}

async function fetchTitle(url): Promise<string> {
  const parser = new DomParser();
  const titlePromise = new Promise<string>((resolve, reject) => {
    new Crawler().configure({ depth: 1 }).crawl(url, page => {
      const dom = parser.parseFromString(page.content);
      let title = dom.getElementsByTagName('title');
      if (title && title.length >= 1) {
        title = title[0].textContent;
      } else if (title === null || title.length === 0) {
        title = 'no title';
      }
      resolve(removeSpecialsChars(title));
    }),
      err => reject(err);
  });
  return titlePromise;
}

function uploadStream(fileBuffer, options): Promise<any> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(options, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      })
      .end(fileBuffer);
  });
}

@Injectable()
export class BookmarkService {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Bookmark)
    private readonly bookmarkRepo: Repository<Bookmark>,
  ) {
    cloudinary.config({
      cloud_name: this.configService.get('cloudinary.cloudName'),
      api_key: this.configService.get('cloudinary.apiKey'),
      api_secret: this.configService.get('cloudinary.apiSecret'),
    });
  }

  async create(
    createBookmarkDto: CreateBookmarkDto,
    user: User,
  ): Promise<Bookmark> {
    const url = createBookmarkDto.url;
    const title = await fetchTitle(url);
    const thumbnail = await takeShot(url);
    const thumbnailUpload = await uploadStream(thumbnail, {
      resource_type: 'image',
      overwrite: true,
    });
    const bookmark = new Bookmark({
      url,
      userId: user.id,
      title,
      thumbnailId: thumbnailUpload.public_id,
      deleted: false,
    });
    return this.bookmarkRepo.save(bookmark);
  }

  async find(): Promise<Bookmark[]> {
    return this.bookmarkRepo.find();
  }
}
