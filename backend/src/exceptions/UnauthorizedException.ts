import { HttpException } from './HttpException.js';

export class UnauthorizedException extends HttpException {
  constructor(message: string = 'Unauthorized') {
    super(401, message);
  }
}

export default UnauthorizedException;
