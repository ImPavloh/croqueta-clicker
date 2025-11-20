import Decimal from "break_infinity.js";

export interface UpgradeModel {
  id: number;
  name: string;
  image: string;
  price: Decimal;
  clicks: number;
  level: number;
  exp: number;
}
