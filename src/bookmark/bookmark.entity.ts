import { Tag } from './../tag/tag.entity';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
} from 'typeorm';
import { BaseEntity } from '../common/base.entity';
import { User } from '../user/user.entity';

@Entity()
export class Bookmark extends BaseEntity {
  prefix = 'bmk';

  @Column()
  url: string;

  @Column()
  title: string;

  @Column({ name: 'thumbnail_id' })
  thumbnailId: string;

  @Column()
  deleted: boolean;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(
    () => User,
    user => user.bookmarks,
  )
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToMany(() => Tag)
  @JoinTable()
  tags: Tag[];

  constructor(props: Partial<Bookmark>) {
    super();
    Object.assign(this, props);
  }
}
