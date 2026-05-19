import { HttpException } from './HttpException.js';

export class BadRequestException extends HttpException {
  constructor(message: string = 'Bad Request') {
    super(400, message);
  }
}

export default BadRequestException;
