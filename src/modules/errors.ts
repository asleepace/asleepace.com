/**
 * Errors
 * 
 * This module contains all the error messages that we will use in our application.
 * Make sure to handle the errors in the middleware.
 * 
 */

export enum Errors {
  InvalidEmail,
  InvalidPassword,
  NotFound,
}

export const handleErrors = (error: Errors) => {

}