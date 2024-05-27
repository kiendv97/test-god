import { Prop, SchemaFactory, Schema as NSchema } from '@nestjs/mongoose';
import { Schema } from 'mongoose';
import { ApiHideProperty } from '@nestjs/swagger';

@NSchema({ _id: false })
export class Author {
  @Prop()
  id?: string;

  @Prop()
  name?: string;

  @Prop()
  picture?: string;

  @Prop()
  email?: string;
}
export const AuthorSchema = SchemaFactory.createForClass(Author);

export class BaseSchema {
  @ApiHideProperty()
  _doc: Record<string, any>;

  @Prop({ type: AuthorSchema })
  createdBy?: Author;

  @Prop({ type: AuthorSchema })
  updatedBy?: Author;

  @ApiHideProperty()
  isDeleted?: boolean;

  @ApiHideProperty()
  deletedAt?: Date;

  @ApiHideProperty()
  deletedBy?: Author;

  @ApiHideProperty()
  createdAt?: string;

  @ApiHideProperty()
  updatedAt?: string;
}

export class BizSchema extends BaseSchema {
  @Prop({ required: true, type: Schema.Types.ObjectId })
  bizId: string;
}

export class CreateTimeSchema {
  @Prop({ default: Date.now })
  createdAt?: Date;

  @Prop({ default: Date.now })
  updatedAt?: Date;
}

@NSchema({ _id: false })
export class BizModel {
  @Prop()
  bizId: string;

  @Prop()
  name: string;
}
export const BizModelSchema = SchemaFactory.createForClass(BizModel);
