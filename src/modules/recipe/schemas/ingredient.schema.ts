import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { NestSchema } from '@base/model';
import { BaseSchema } from '@base/model/base.schema';

@NestSchema()
@Schema()
export class Ingredient extends BaseSchema {
  @Prop({ required: true })
  name: string;
}

export type IngredientDocument = Ingredient & Document;
export const IngredientSchema = SchemaFactory.createForClass(Ingredient);
