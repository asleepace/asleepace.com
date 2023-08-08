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
        #[derive(serde::Serialize, Debug, Clone, PartialEq)]
        pub struct FetchUsers {
            pub username: String,
            pub password: String,
            pub email: String,
            pub avatar: String,
            pub id: i32,
            pub created_at: String,
            pub updated_at: String,
        }
        pub struct FetchUsersBorrowed<'a> {
            pub username: &'a str,
            pub password: &'a str,
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
                    password,
                    email,
                    avatar,
                    id,
                    created_at,
                    updated_at,
                }: FetchUsersBorrowed<'a>,
            ) -> Self {
                Self {
                    username: username.into(),
                    password: password.into(),
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
            FetchUsersStmt(cornucopia_async :: private :: Stmt :: new("SELECT username, password, email, avatar, id, created_at::text, updated_at::text FROM users"))
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
                        password: row.get(1),
                        email: row.get(2),
                        avatar: row.get(3),
                        id: row.get(4),
                        created_at: row.get(5),
                        updated_at: row.get(6),
                    },
                    mapper: |it| <FetchUsers>::from(it),
                }
            }
        }
    }
}
