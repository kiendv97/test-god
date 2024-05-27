import { IncomingMessage } from 'http';

import morgan from 'morgan';

import { gets } from '@base/util';

morgan.token('user', (req: any, res: IncomingMessage & { user?: Record<string, any> }) => {
  const user = res.user;
  if (user)
    return gets(user, ['data.user.email', 'email', 'data.email', 'module.alias', 'module.name', 'data.name']);
  return 'Anonymous';
});

morgan.format('custom', (tokens, req, res) => {
  const frm = ':remote-addr :user :method :url :status - :response-time ms';
  const fn = morgan.compile(frm);
  return fn(tokens, req, res);
});

export function useMorgan(logger: any) {
  return morgan('custom', {
    stream: logger,
  });
}

export const FASTIFY_MORGAN_LOGGER = {
  trustProxy: true,
  logger: {
    serializers: {
      res: (res: any) => {
        res.raw.user = res.request?.user;
        return undefined;
      },
    },
    stream: {
      write: () => {},
    },
  },
};
