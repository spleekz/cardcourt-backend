import { Schema, model } from 'mongoose'

export interface ICard {
  name: string
  author: string
  words: Array<{ en: string; ru: string }>
  ui: {
    headColor: string
    bodyColor: string
  }
}
const WordSchema = new Schema({
  en: { type: String, required: true },
  ru: { type: String, required: true },
})

const CardSchema = new Schema({
  name: { type: String, required: true },
  author: { type: String, required: true },
  words: [WordSchema],
  ui: {
    headColor: { type: String, required: true },
    bodyColor: { type: String, required: true },
  },
})

export const Card = model<ICard>('Card', CardSchema)
