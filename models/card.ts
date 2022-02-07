import { Schema, model, Document } from 'mongoose'
import { Card } from '../api/api-types'

const wordSchema = new Schema({
  en: { type: String, required: true },
  ru: { type: String, required: true },
})

const cardSchema = new Schema(
  {
    name: { type: String, required: true },
    author: { type: String, required: true },
    words: [wordSchema],
    ui: {
      headColor: { type: String, required: true },
      bodyColor: { type: String, required: true },
    },
  },
  { versionKey: false }
)

export type CardDocument = Document<any, any, Card> & Card

export const CardModel = model<Card>('Card', cardSchema)
