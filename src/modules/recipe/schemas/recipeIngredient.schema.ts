import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema, Document } from 'mongoose';

import { NestSchema } from '@base/model';
import { BaseSchema } from '@base/model/base.schema';


@NestSchema()
@Schema()
export class RecipeIngredient extends BaseSchema {
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Recipe' })
  recipeId: string;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Ingredient' })
  ingredientId: string;

  @Prop({ required: true })
  quantity: string;
}

export type RecipeIngredientDocument = RecipeIngredient & Document;
export const RecipeIngredientSchema = SchemaFactory.createForClass(RecipeIngredient);
