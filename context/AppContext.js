import connection from '../config/dbConfig.js';
import UsersModel from '../models/usersModel.js';
import RolesModel from '../models/rolesModel.js';
import CompaniesModel from '../models/companiesModel.js';


//Initialize Connection
try{
    await connection.authenticate()
    console.log("Database connection has been established successfully.");
}catch(err){
    console.error(`Error Unable to connect to the database: ${err}`);
}

///RELATIONS

//Users-Roles
UsersModel.belongsTo(RolesModel, { foreignKey: "roleId"});
RolesModel.hasMany(UsersModel, { foreignKey: "roleId"});

//Users-Companies
UsersModel.belongsTo(CompaniesModel, { foreignKey: "companyId"});
CompaniesModel.hasMany(UsersModel, { foreignKey: "companyId"});

export default{
    Sequelize: connection, 
    UsersModel,
    RolesModel,
    CompaniesModel
}
