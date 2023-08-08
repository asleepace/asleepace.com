// use crate::cornucopia::queries;
// use tokio_postgres::Client;

// /**
//  * This function is used to verify on oauth token for a specfied resource owner id.
//  */
// pub async fn verify_token(client: Client, oauth_token: String, owner_id: &i64) -> bool {
//     let mut statement = queries::auth::verify_token();
//     let query = statement.bind(&client, owner_id, &oauth_token);
//     match query.opt().await {
//         Ok(result) => result.unwrap_or(false),
//         Err(_) => false,
//     }
// }
