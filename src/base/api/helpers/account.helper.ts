import * as _ from 'lodash';

import { IAccountAuth } from '@providers/backdoor/account/account.interface';

export const getAuthor = (user: IAccountAuth) => _.pick(user.viewer, ['id', 'name', 'picture', 'email']);
