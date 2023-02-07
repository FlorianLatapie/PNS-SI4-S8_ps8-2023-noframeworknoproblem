const {
  DB_USER,
  DB_PASSWORD,
  DB_HOST,
  DB_PORT,
  DB_NAME,
  USER_COLLECTION,
  GAME_COLLECTION,
} = process.env;

 export default{
  mongodbUri: `mongodb://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}`,
  dbName: DB_NAME,
  userCollection: USER_COLLECTION,
  gameCollection: GAME_COLLECTION,
};
