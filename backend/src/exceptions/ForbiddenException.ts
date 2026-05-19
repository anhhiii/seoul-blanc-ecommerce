import { HttpException } from './HttpException.js';

export class ForbiddenException extends HttpException {
  constructor(message: string = 'Forbidden') {
    super(403, message);
  }
}

export default ForbiddenException;
