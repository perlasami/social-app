export class ApplicationException extends Error {
    statusCode: number

    constructor(msg: string, statusCode: number, options?: ErrorOptions) {
        super(msg, options)
        this.statusCode = statusCode
    }
}


export interface IError extends Error{
    statusCode:Number
}

export class ValidationError extends ApplicationException {
  constructor(msg: string, options?: ErrorOptions) {
    super(msg, 422, options)
    this.name = "ValidationError"
  }



}

export class Notvalid_email extends ApplicationException {
  constructor(msg: string='not valid email', options?: ErrorOptions) {
    super(msg, 400, options)
    this.name = "ValidationError"
  }
}

export class NotFoundException extends ApplicationException {
  constructor(msg: string = 'not found') {
    super(msg, 404);
    console.log(this.stack);
  }
}

export class expiredOtpException extends ApplicationException {
  constructor(msg: string = 'otp expired use resend otp') {
    super(msg, 400);
    console.log(this.stack);
  }
}

export class invalidCredentials extends ApplicationException {
  constructor(msg: string = 'invalid-credentials') {
    super(msg, 400);
    console.log(this.stack);
  }
}

export class notConfirmed extends ApplicationException {
  constructor(msg: string = 'confirm your email first') {
    super(msg, 400);
    console.log(this.stack);
  }
}

export class invalidTokenException extends ApplicationException {
  constructor(msg: string = 'invalid token') {
    super(msg, 400);
    console.log(this.stack);
  }}

  export class invalidOTPException extends ApplicationException {
  constructor(msg: string = 'invalid otp') {
    super(msg, 400);
    console.log(this.stack);
  }
}