import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema, Document } from 'mongoose';

import { NestSchema } from '@base/model';
import { BaseSchema } from '@base/model/base.schema';


@NestSchema()
@Schema()
export class RecipeStep extends BaseSchema {
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Recipe' })
  recipeId: string;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Step' })
  stepId: string;

  @Prop({ required: true })
  stepOrder: number;
}

export type RecipeStepDocument = RecipeStep & Document;
export const RecipeStepSchema = SchemaFactory.createForClass(RecipeStep);
