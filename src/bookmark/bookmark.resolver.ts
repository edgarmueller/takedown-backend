import { GetDeletedBookmarkDto } from './dto/get-deleted-bookmark.dto';
import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GraphqlJwtGuard } from '../auth/graphql-jwt.guard';
import RequestWithUser from '../auth/request-with-user.interface';
import { BookmarkService } from './bookmark.service';
import { CreateBookmarkDto } from './dto/create-bookmark.dto';
import { GetBookmarkDto } from './dto/get-bookmark.dto';
import { DeleteBookmarkDto } from './dto/delete-bookmark.dto';

@Resolver(() => GetBookmarkDto)
export class BookmarkResolver {
  constructor(private readonly bookmarkService: BookmarkService) {}

  @Query(() => [GetBookmarkDto])
  async bookmarks(): Promise<GetBookmarkDto[]> {
    const bookmarks = await this.bookmarkService.find();
    return bookmarks.map(
      bookmark =>
        new GetBookmarkDto({
          ...bookmark,
          tags: (bookmark.tags || []).map(({ name }) => name),
          createdAt: bookmark.createdAt.toISOString(),
        }),
    );
  }

  @Mutation(() => GetBookmarkDto)
  @UseGuards(GraphqlJwtGuard)
  async createBookmark(
    @Args('input') createBookmarkDto: CreateBookmarkDto,
    @Context() context: { req: RequestWithUser },
  ) {
    const bookmark = await this.bookmarkService.create(
      createBookmarkDto,
      context.req.user,
    );
    return new GetBookmarkDto({
      ...bookmark,
      tags: (bookmark.tags || []).map(({ name }) => name),
      createdAt: bookmark.createdAt.toISOString(),
    });
  }

  @Mutation(() => GetDeletedBookmarkDto)
  @UseGuards(GraphqlJwtGuard)
  async deleteBookmark(@Args('input') deleteBookmarkDto: DeleteBookmarkDto) {
    const deletedBookmarkDto = await this.bookmarkService.delete(
      deleteBookmarkDto.bookmarkId,
    );
    return deletedBookmarkDto;
  }
}
