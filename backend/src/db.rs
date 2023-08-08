use dotenv::dotenv;
use tokio_postgres::{Client, Error, NoTls};

/**
 * This function is used to connect to our Postgres database.
 */
pub async fn connect() -> Result<Client, Error> {
    dotenv().ok();

    let config = std::env::var("DATABASE_URL").expect("DATABASE_URL must be set.");

    let (client, connection) = tokio_postgres::connect(&config, NoTls).await?;

    tokio::spawn(async move {
        if let Err(e) = connection.await {
            eprintln!("connection error: {}", e);
        }
    });

    Ok(client)
}
