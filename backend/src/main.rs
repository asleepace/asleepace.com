mod auth;
mod cornucopia;
mod db;

use crate::cornucopia::queries;
// use auth::verify_token;
use warp::Filter;

#[tokio::main]
async fn main() {
    let cors = warp::cors()
        .allow_origin("http://localhost:3000")
        .allow_methods(vec!["GET", "POST", "DELETE"])
        .allow_headers(vec!["Content-Type", "hx-current-url", "hx-request"]);

    // create root /api/ path
    let route = warp::path("api");

    let base = warp::path::end().map(|| warp::reply::json(&"Hello, world!"));

    // auth route
    let auth = route.and(
        warp::post()
            .and(warp::path("auth"))
            .and(warp::body::json())
            .map(|name: String| warp::reply::json(&name))
            .with(cors),
    );

    // all routes together
    let routes = route.and(base).or(auth);

    println!("\nListening on http://127.0.0.1:3030/api/\n");

    // start the server on port 3030
    warp::serve(routes).run(([127, 0, 0, 1], 3030)).await;
}

pub async fn htmx() -> Result<impl warp::Reply, warp::Rejection> {
    Ok(warp::reply::html("<h1>Hello, world!</h1>"))
}

pub async fn test() -> Result<impl warp::Reply, warp::Rejection> {
    let client = db::connect().await.unwrap();
    let result = queries::users::fetch_users().bind(&client).all().await;
    match result {
        Ok(users) => Ok(warp::reply::json(&users)),
        Err(_err) => Err(warp::reject::not_found()),
    }
}

pub async fn create_user() -> Result<impl warp::Reply, warp::Rejection> {
    let client = db::connect().await.unwrap();
    let salt = auth::generate_salt();
    let pass = auth::hash_password("!Purple123", &salt);

    let result = queries::users::create_user()
        .bind(
            &client,
            &"asleepace",
            &pass,
            &salt,
            &"colin_teahan@yahoo.com",
            &"Colin",
            &"Teahan",
            &"https://asleepace.com/about-me.jpeg",
        )
        .await;

    match result {
        Ok(id) => Ok(warp::reply::json(&id)),
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
