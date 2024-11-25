import jwt, { JwtPayload } from "jsonwebtoken";

interface TokenVerificationResult {
  isValid: boolean;
  isExpired: boolean;
  decoded: JwtPayload | null;
}

export function verifyJwtToken(token: string): TokenVerificationResult {
  try {
    const decoded = jwt.decode(token) as JwtPayload;

    if (!decoded) {
      return { isValid: false, isExpired: false, decoded: null };
    }

    const isExpired = decoded.exp! < Math.floor(Date.now() / 1000);

    if (!isExpired) {
      jwt.verify(token, process.env.JWT_SECRET!);
      return {
        isValid: true,
        isExpired: false,
        decoded: decoded,
      };
    }

    return {
      isValid: false,
      isExpired: true,
      decoded: decoded,
    };
  } catch (e) {
    console.error("Error while verifying the jwt token", e);
    return {
      isValid: false,
      isExpired: false,
      decoded: null,
    };
  }
}
