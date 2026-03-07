import connection from '../config/dbConfig.js';
import UsersModel from '../models/usersModel.js';
import RolesModel from '../models/rolesModel.js';
import CompaniesModel from '../models/companiesModel.js';
import ProductsModel from '../models/productsModel.js';
import CategoriesModel from '../models/categoriesModel.js';

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

//Categories-Compaines
CategoriesModel.belongsTo(CompaniesModel, { foreignKey: "companyId"});
CompaniesModel.hasMany(CategoriesModel, { foreignKey: "companyId"});

//Products-Companies
ProductsModel.belongsTo(CompaniesModel, { foreignKey: "companyId"});
CompaniesModel.hasMany(ProductsModel, { foreignKey: "companyId"});

//Products-Categories
ProductsModel.belongsTo(CategoriesModel, { foreignKey: "categoryId"});
CategoriesModel.hasMany(ProductsModel, { foreignKey: "categoryId"});


export default{
    Sequelize: connection, 
    UsersModel,
    RolesModel,
    CompaniesModel,
    ProductsModel,
    CategoriesModel
}
