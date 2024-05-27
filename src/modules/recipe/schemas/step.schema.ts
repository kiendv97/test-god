import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { NestSchema } from '@base/model';
import { BaseSchema } from '@base/model/base.schema';

@NestSchema()
@Schema()
export class Step extends BaseSchema {
  @Prop({ required: true })
  description: string;
}

export type StepDocument = Step & Document;
export const StepSchema = SchemaFactory.createForClass(Step);
