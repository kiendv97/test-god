import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema, Document } from 'mongoose';

import { NestSchema } from '@base/model';
import { BaseSchema } from '@base/model/base.schema';



@NestSchema()
@Schema()
export class Recipe extends BaseSchema {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop()
  pictureUrl: string;

  @Prop([{ type: MongooseSchema.Types.ObjectId, ref: 'RecipeIngredient' }])
  ingredients: string[];

  @Prop([{ type: MongooseSchema.Types.ObjectId, ref: 'RecipeStep' }])
  steps: string[];
}

export type RecipeDocument = Recipe & Document;
export const RecipeSchema = SchemaFactory.createForClass(Recipe);
