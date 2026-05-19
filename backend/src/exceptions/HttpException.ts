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

export default HttpException;
