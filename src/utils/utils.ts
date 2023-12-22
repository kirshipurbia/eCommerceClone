import randomstring from "randomstring";
import otpgen from "otp-generator";
import { dereference } from "@apidevtools/json-schema-ref-parser";
import {writeFile} from 'fs/promises'
class Utils {
  otpGenerator(digits: number) {
    return otpgen.generate(digits, { specialChars: false, digits: true });
  }
  generateRandomString(digits: number) {
    return randomstring.generate(digits);
  }
  async constructSwaggerSchema() {
    const schema = await dereference('./swagger/swagger.json');
    let data = JSON.stringify(schema);
    await writeFile('./swagger/parse-swagger.json', data);
    await writeFile('./dist/swagger/parse-swagger.json', data);
}
}
export const utils = new Utils();
