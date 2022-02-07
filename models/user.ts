import { Schema, model, Document } from 'mongoose'
import { FullUser, LoginUser } from '../api/api-types'

const userSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  { versionKey: false }
)

export type FullUserDocument = Document<any, any, FullUser> & FullUser

export const UserModel = model<LoginUser>('User', userSchema)
