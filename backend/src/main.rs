mod cornucopia;
mod auth;
mod db;

use crate::cornucopia::queries;
// use auth::verify_token;
use warp::Filter;

#[tokio::main]
async fn main() {
    // create a route to fetch all users
    let fetch_users = warp::get().and_then(test);
    let route_users = warp::path("test").and(fetch_users);

    println!("\nListening on http://127.0.0.1:3030/test\n");

    // start the server on port 3030
    warp::serve(route_users).run(([127, 0, 0, 1], 3030)).await;
}

pub async fn test() -> Result<impl warp::Reply, warp::Rejection> {
    let client = db::connect().await.unwrap();
    let result = queries::users::fetch_users().bind(&client).all().await;
    match result {
        Ok(users) => Ok(warp::reply::json(&users)),
        Err(_err) => Err(warp::reject::not_found()),
    }
}

// fetch all users from the database and return the resulting array as json
// if the query fails, return a 404
// pub async fn get_users() -> Result<impl warp::Reply, warp::Rejection> {
//     let client = db::connect().await.unwrap ();
//     let result = queries::users::user_basic().bind(&client).all().await;
//     match result {
//         Ok(users) => Ok(warp::reply::json(&users)),
//         Err(_err) => Err(warp::reject::not_found()),
//     }
// }