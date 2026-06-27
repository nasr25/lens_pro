import { JwtPayload } from '../config/jwt';

declare global {
  namespace Express {
    interface Request {
      admin?: JwtPayload;
    }
  }
}
