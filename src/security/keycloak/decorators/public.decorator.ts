// src/security/decorators/public.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { IS_PUBLIC_KEY } from '../constants.js';

export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
