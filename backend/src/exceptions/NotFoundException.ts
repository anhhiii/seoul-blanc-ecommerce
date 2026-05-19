import { HttpException } from './HttpException.js';

export class NotFoundException extends HttpException {
  constructor(message: string = 'Not Found') {
    super(404, message);
  }
}

export default NotFoundException;
