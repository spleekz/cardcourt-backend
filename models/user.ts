import { Schema, model } from 'mongoose'

export interface IUser {
  name: string
  password: string
}

const UserSchema = new Schema({
  name: { type: String, required: true, unique: true },
  password: { type: String, required: true },
})

export const User = model<IUser>('User', UserSchema)
