import {SetMetadata} from '@nestjs/common';

export const ROLES_KEY = 'roles';

export const Roles = (...roleStrings: string[]) => SetMetadata(ROLES_KEY, roleStrings);
