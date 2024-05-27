/* eslint-disable @typescript-eslint/no-unused-vars */
import { Document } from 'mongoose';

import { BaseDeleteService } from '@base/api/services/base-delete.service';

export class BaseService<TDoc extends Document> extends BaseDeleteService<TDoc> {}
