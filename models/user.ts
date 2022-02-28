import { Schema, model, Document } from 'mongoose'
import { FullUser, LoginUser } from '../api/api-types'
import { cardSchema } from './card'

const userSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    cards: [{ type: Schema.Types.ObjectId, ref: 'Card' }],
  },
  { versionKey: false }
)

export type FullUserDocument = Document<any, any, FullUser> & FullUser

export const UserModel = model<LoginUser>('User', userSchema)
