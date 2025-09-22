
import {compare,hash} from 'bcrypt'

export const createHash = async (text: string): Promise<string> => {
  return await hash(text, Number(process.env.SALT) as number)
}

export const compareHash = async (text: string, oldText: string): Promise<boolean> => {
  return await compare(text, oldText)
}
