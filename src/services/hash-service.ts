import bcrypt from "bcrypt";

class HashService {
  async hashData(data: string): Promise<string> {
    const SALT = 10;
    return await bcrypt.hash(data, SALT);
  }

  async hashCompare(data: string, hashData: string): Promise<boolean> {
    return await bcrypt.compare(data, hashData);
  }
}

export default HashService;
