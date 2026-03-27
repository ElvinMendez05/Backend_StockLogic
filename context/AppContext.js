import connection from '../config/dbConfig.js';
import UsersModel from '../models/usersModel.js';
import RolesModel from '../models/rolesModel.js';
import CompaniesModel from '../models/companiesModel.js';
import ProductsModel from '../models/productsModel.js';
import CategoriesModel from '../models/categoriesModel.js';
import ProvidersModel from '../models/providersModel.js'
import InventoryMovementsModel from '../models/inventoryMovementsModel.js'

//Initialize Connection
try{
    await connection.authenticate()
    console.log("Database connection has been established successfully.");
}catch(err){
    console.error(`Error Unable to connect to the database: ${err}`);
}

////RELATIONS

///USERS
//Users-Roles
UsersModel.belongsTo(RolesModel, { foreignKey: "roleId"});
RolesModel.hasMany(UsersModel, { foreignKey: "roleId"});

//Users-Companies
UsersModel.belongsTo(CompaniesModel, { foreignKey: "companyId"});
CompaniesModel.hasMany(UsersModel, { foreignKey: "companyId"});



///CATEGORIES
//Categories-Compaines
CategoriesModel.belongsTo(CompaniesModel, { foreignKey: "companyId"});
CompaniesModel.hasMany(CategoriesModel, { foreignKey: "companyId"});



///PROVIDERS
//Providers-Compaines
ProvidersModel.belongsTo(CompaniesModel, { foreignKey: "companyId"});
CompaniesModel.hasMany(ProvidersModel, { foreignKey: "companyId"});



///PRODUCTS
//Products-Companies
ProductsModel.belongsTo(CompaniesModel, { foreignKey: "companyId"});
CompaniesModel.hasMany(ProductsModel, { foreignKey: "companyId"});

//Products-Categories
ProductsModel.belongsTo(CategoriesModel, { foreignKey: "categoryId"});
CategoriesModel.hasMany(ProductsModel, { foreignKey: "categoryId"});

//Products-Providers
ProductsModel.belongsTo(ProvidersModel, { foreignKey: "providerId"});
ProvidersModel.hasMany(ProductsModel, { foreignKey: "providerId"});



///INVENTORY_MOVEMENTS
//InventoryMovements-Companies
InventoryMovementsModel.belongsTo(CompaniesModel, { foreignKey: "companyId"});
CompaniesModel.hasMany(InventoryMovementsModel, { foreignKey: "companyId"});

//InventoryMovements-Users
InventoryMovementsModel.belongsTo(UsersModel, { foreignKey: "userId"});
UsersModel.hasMany(InventoryMovementsModel, { foreignKey: "userId"});

//InventoryMovements-Products
InventoryMovementsModel.belongsTo(ProductsModel, { foreignKey: "productId"});
ProductsModel.hasMany(InventoryMovementsModel, { foreignKey: "productId"});

//InventoryMovements-Providers
InventoryMovementsModel.belongsTo(ProvidersModel, { foreignKey: "providerId"});
ProvidersModel.hasMany(InventoryMovementsModel, { foreignKey: "providerId"});



export default{
    Sequelize: connection, 
    UsersModel,
    RolesModel,
    CompaniesModel,
    ProductsModel,
    CategoriesModel,
    ProvidersModel,
    InventoryMovementsModel
}
