import jwt from "jsonwebtoken";

import { JwtPayloadType } from "../types";
import Config from "../config";

class TokenService {
  async signToken(payload: JwtPayloadType, exp: string | number = "30 days") {
    return await jwt.sign(payload, Config.JWT_SECRET!, {
      expiresIn: exp,
      algorithm: "HS256",
    });
  }

  verifyToken(token: string) {
    return jwt.verify(token, Config.JWT_SECRET!) as JwtPayloadType;
  }
}

export default TokenService;
