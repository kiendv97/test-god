import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Payload, defaultPayload } from '@base/api';

@Injectable()
export class ResponseTransformInterceptor<T> implements NestInterceptor<T, Payload<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Payload<T>> {
    return next.handle().pipe(
      map(data =>
        data?.meta
          ? {
              ...defaultPayload,
              data: data.data,
              meta: data.meta,
              total: data.meta?.total,
            }
          : {
              ...defaultPayload,
              data: data ?? null,
            },
      ),
    );
  }
}
