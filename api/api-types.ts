/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface MessageResponse {
  message: string;
}

export interface Id {
  _id: string;
}

export interface Token {
  token: string;
}

export interface RegisterUser {
  name: string;
  password: string;
}

export interface LoginUser {
  name: string;
  password: string;
}

export type FullUser = RegisterUser & PublicUser;

export interface PublicUser {
  name: string;
  cards: Cards;
}

export interface Me {
  name: string;
}

export interface CardUI {
  headColor: string;
  bodyColor: string;
}

export interface CardAuthor {
  name: string;
  _id: string;
}

export interface EditedCardFields {
  ui: CardUI;
  words: (CardWord | SendedCardWord)[];
  name: string;
}

export interface SendedCardWord {
  en: string;
  ru: string;
}

export type CardWord = SendedCardWord & Id;

export type SendedCardWords = SendedCardWord[];

export type CardWords = CardWord[];

export interface SendedCard {
  name: string;
  words: SendedCardWords;
  ui: CardUI;
}

export type Card = { author: CardAuthor; words: CardWords } & SendedCard & Id;

export type DeletedCard = Id;

export type UpdatedCard = Id & EditedCardFields;

export type Cards = Card[];

export interface CardsResponse {
  cards: Cards;
  pagesLoaded: number;
  pageCount: number;
}
