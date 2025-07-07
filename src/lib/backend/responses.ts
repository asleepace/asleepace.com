/**
 *  ## Responses
 *
 *  This namespace provides functions for creating responses.
 *
 */
export namespace Responses {
  /**
   *  JSON response which contains an error object with a status of 401.
   */
  export const NOT_AUTHORIZED = () =>
    Response.json(
      {
        error: 'not_authorized',
      },
      {
        status: 401,
      }
    )

  /**
   *  JSON response which contains an error object with a status of 404.
   */
  export const NOT_FOUND = () =>
    Response.json(
      {
        error: 'not_found',
      },
      {
        status: 404,
      }
    )
}
