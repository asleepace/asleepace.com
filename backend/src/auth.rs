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

extern crate rand;
extern crate base64;
extern crate bcrypt;

use bcrypt::{hash, DEFAULT_COST};
use rand::{Rng, rngs::OsRng};
use base64::encode;

const SALT_SIZE: usize = 16; // This is typical, but you can adjust as needed

pub fn hash_password(password: &str, salt: &str) -> String {
  let mut salted_password = String::from(salt);
  salted_password.push_str(password);
  hash(&salted_password, DEFAULT_COST).unwrap()
}

pub fn generate_salt() -> String {
  let mut salt = [0u8; SALT_SIZE];
  OsRng.fill(&mut salt);
  encode(&salt)
}