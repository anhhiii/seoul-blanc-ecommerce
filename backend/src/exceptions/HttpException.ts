export class HttpException extends Error {
  public status: number;
  public success: boolean;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.success = false;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class BadRequestException extends HttpException {
  constructor(message: string = 'Bad Request') {
    super(400, message);
  }
}

export class UnauthorizedException extends HttpException {
  constructor(message: string = 'Unauthorized') {
    super(401, message);
  }
}
