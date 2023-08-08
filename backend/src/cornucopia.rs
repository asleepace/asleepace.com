// This file was generated with `cornucopia`. Do not modify.

#[allow(clippy::all, clippy::pedantic)]
#[allow(unused_variables)]
#[allow(unused_imports)]
#[allow(dead_code)]
pub mod types {}
#[allow(clippy::all, clippy::pedantic)]
#[allow(unused_variables)]
#[allow(unused_imports)]
#[allow(dead_code)]
pub mod queries {
    pub mod users {
        use cornucopia_async::GenericClient;
        use futures;
        use futures::{StreamExt, TryStreamExt};
        #[derive(Debug)]
        pub struct CreateUserParams<
            T1: cornucopia_async::StringSql,
            T2: cornucopia_async::StringSql,
            T3: cornucopia_async::StringSql,
            T4: cornucopia_async::StringSql,
            T5: cornucopia_async::StringSql,
            T6: cornucopia_async::StringSql,
            T7: cornucopia_async::StringSql,
        > {
            pub username: T1,
            pub pass: T2,
            pub salt: T3,
            pub email: T4,
            pub first_name: T5,
            pub last_name: T6,
            pub avatar: T7,
        }
        #[derive(serde::Serialize, Debug, Clone, PartialEq)]
        pub struct FetchUsers {
            pub username: String,
            pub email: String,
            pub avatar: String,
            pub id: i32,
            pub created_at: String,
            pub updated_at: String,
        }
        pub struct FetchUsersBorrowed<'a> {
            pub username: &'a str,
            pub email: &'a str,
            pub avatar: &'a str,
            pub id: i32,
            pub created_at: &'a str,
            pub updated_at: &'a str,
        }
        impl<'a> From<FetchUsersBorrowed<'a>> for FetchUsers {
            fn from(
                FetchUsersBorrowed {
                    username,
                    email,
                    avatar,
                    id,
                    created_at,
                    updated_at,
                }: FetchUsersBorrowed<'a>,
            ) -> Self {
                Self {
                    username: username.into(),
                    email: email.into(),
                    avatar: avatar.into(),
                    id,
                    created_at: created_at.into(),
                    updated_at: updated_at.into(),
                }
            }
        }
        pub struct FetchUsersQuery<'a, C: GenericClient, T, const N: usize> {
            client: &'a C,
            params: [&'a (dyn postgres_types::ToSql + Sync); N],
            stmt: &'a mut cornucopia_async::private::Stmt,
            extractor: fn(&tokio_postgres::Row) -> FetchUsersBorrowed,
            mapper: fn(FetchUsersBorrowed) -> T,
        }
        impl<'a, C, T: 'a, const N: usize> FetchUsersQuery<'a, C, T, N>
        where
            C: GenericClient,
        {
            pub fn map<R>(
                self,
                mapper: fn(FetchUsersBorrowed) -> R,
            ) -> FetchUsersQuery<'a, C, R, N> {
                FetchUsersQuery {
                    client: self.client,
                    params: self.params,
                    stmt: self.stmt,
                    extractor: self.extractor,
                    mapper,
                }
            }
            pub async fn one(self) -> Result<T, tokio_postgres::Error> {
                let stmt = self.stmt.prepare(self.client).await?;
                let row = self.client.query_one(stmt, &self.params).await?;
                Ok((self.mapper)((self.extractor)(&row)))
            }
            pub async fn all(self) -> Result<Vec<T>, tokio_postgres::Error> {
                self.iter().await?.try_collect().await
            }
            pub async fn opt(self) -> Result<Option<T>, tokio_postgres::Error> {
                let stmt = self.stmt.prepare(self.client).await?;
                Ok(self
                    .client
                    .query_opt(stmt, &self.params)
                    .await?
                    .map(|row| (self.mapper)((self.extractor)(&row))))
            }
            pub async fn iter(
                self,
            ) -> Result<
                impl futures::Stream<Item = Result<T, tokio_postgres::Error>> + 'a,
                tokio_postgres::Error,
            > {
                let stmt = self.stmt.prepare(self.client).await?;
                let it = self
                    .client
                    .query_raw(stmt, cornucopia_async::private::slice_iter(&self.params))
                    .await?
                    .map(move |res| res.map(|row| (self.mapper)((self.extractor)(&row))))
                    .into_stream();
                Ok(it)
            }
        }
        pub fn fetch_users() -> FetchUsersStmt {
            FetchUsersStmt(cornucopia_async::private::Stmt::new(
                "SELECT username, email, avatar, id, created_at::text, updated_at::text FROM users",
            ))
        }
        pub struct FetchUsersStmt(cornucopia_async::private::Stmt);
        impl FetchUsersStmt {
            pub fn bind<'a, C: GenericClient>(
                &'a mut self,
                client: &'a C,
            ) -> FetchUsersQuery<'a, C, FetchUsers, 0> {
                FetchUsersQuery {
                    client,
                    params: [],
                    stmt: &mut self.0,
                    extractor: |row| FetchUsersBorrowed {
                        username: row.get(0),
                        email: row.get(1),
                        avatar: row.get(2),
                        id: row.get(3),
                        created_at: row.get(4),
                        updated_at: row.get(5),
                    },
                    mapper: |it| <FetchUsers>::from(it),
                }
            }
        }
        pub fn create_user() -> CreateUserStmt {
            CreateUserStmt(cornucopia_async::private::Stmt::new(
                "INSERT INTO users (username, pass, salt, email, first_name, last_name, avatar)
VALUES ($1, $2, $3, $4, $5, $6, $7)",
            ))
        }
        pub struct CreateUserStmt(cornucopia_async::private::Stmt);
        impl CreateUserStmt {
            pub async fn bind<
                'a,
                C: GenericClient,
                T1: cornucopia_async::StringSql,
                T2: cornucopia_async::StringSql,
                T3: cornucopia_async::StringSql,
                T4: cornucopia_async::StringSql,
                T5: cornucopia_async::StringSql,
                T6: cornucopia_async::StringSql,
                T7: cornucopia_async::StringSql,
            >(
                &'a mut self,
                client: &'a C,
                username: &'a T1,
                pass: &'a T2,
                salt: &'a T3,
                email: &'a T4,
                first_name: &'a T5,
                last_name: &'a T6,
                avatar: &'a T7,
            ) -> Result<u64, tokio_postgres::Error> {
                let stmt = self.0.prepare(client).await?;
                client
                    .execute(
                        stmt,
                        &[username, pass, salt, email, first_name, last_name, avatar],
                    )
                    .await
            }
        }
        impl<
                'a,
                C: GenericClient + Send + Sync,
                T1: cornucopia_async::StringSql,
                T2: cornucopia_async::StringSql,
                T3: cornucopia_async::StringSql,
                T4: cornucopia_async::StringSql,
                T5: cornucopia_async::StringSql,
                T6: cornucopia_async::StringSql,
                T7: cornucopia_async::StringSql,
            >
            cornucopia_async::Params<
                'a,
                CreateUserParams<T1, T2, T3, T4, T5, T6, T7>,
                std::pin::Pin<
                    Box<
                        dyn futures::Future<Output = Result<u64, tokio_postgres::Error>>
                            + Send
                            + 'a,
                    >,
                >,
                C,
            > for CreateUserStmt
        {
            fn params(
                &'a mut self,
                client: &'a C,
                params: &'a CreateUserParams<T1, T2, T3, T4, T5, T6, T7>,
            ) -> std::pin::Pin<
                Box<dyn futures::Future<Output = Result<u64, tokio_postgres::Error>> + Send + 'a>,
            > {
                Box::pin(self.bind(
                    client,
                    &params.username,
                    &params.pass,
                    &params.salt,
                    &params.email,
                    &params.first_name,
                    &params.last_name,
                    &params.avatar,
                ))
            }
        }
    }
}
