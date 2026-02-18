import app from "./app.js";
import context from './context/AppContext.js';
import seedDefaultRoles from './models/seedLoaders/defaultRoles.js'

const PORT = process.env.PORT || 3000;

try{
  await context.Sequelize.sync({ alter: process.env.DB_ALTER || false });
  await seedDefaultRoles(context.RolesModel);

  app.listen(PORT || 1433, () => {
      console.log(`App listening at port ${PORT}, at: ${process.env.APP_URL}/`);
  });

  console.log("DB Connection Successful.");

}catch(err){
  const error = new Error('Database failed to connect:');
  error.statusCode = 500;
  error.errorData = err
  throw error;
}