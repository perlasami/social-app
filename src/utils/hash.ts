
import {compare,hash} from 'bcrypt'

const saltRounds = parseInt(process.env.SALT || "12", 10);

export const createHash = async (text: string): Promise<string> => {
  return await hash(text, saltRounds);
};


export const compareHash = async (text: string, oldText: string): Promise<boolean> => {
  return await compare(text, oldText)
}
