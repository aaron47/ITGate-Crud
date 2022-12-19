import { JwtPayload } from "./JwtPayload.type";

export interface JwtPayloadWithRt extends JwtPayload {
  refreshToken: string;
}