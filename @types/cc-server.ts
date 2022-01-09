import express from 'express'

export enum Codes {
  Success = 0,
  Error = 1,
  Message = 2,
}

interface DefaultResponse {
  code: Codes
}
interface ResponseWithData<T> extends DefaultResponse {
  code: Codes.Success
  data: T
}
interface ResponseWithMessage extends DefaultResponse {
  code: Codes.Error | Codes.Message
  message: string
}

export type Request<T> = express.Request<{}, {}, T>
export type Response<T = void> = express.Response<ResponseWithData<T> | ResponseWithMessage>
